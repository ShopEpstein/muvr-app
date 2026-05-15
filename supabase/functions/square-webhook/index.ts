// supabase/functions/square-webhook/index.ts
// Listens for Square payment.completed events
// Mints MV to user balance after confirmed payment
// Add SQUARE_WEBHOOK_SIGNATURE_KEY to Supabase secrets
// Square Dashboard → Webhooks → add endpoint:
//   https://cfenkstusggrcthehffn.supabase.co/functions/v1/square-webhook
// Events to subscribe: payment.completed, payment.failed

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { hmac } from 'https://deno.land/x/hmac@v2.0.1/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.text()
    const event = JSON.parse(body)

    // ── Verify Square webhook signature ───────────────────────
    const sigKey = Deno.env.get('SQUARE_WEBHOOK_SIGNATURE_KEY')!
    const sigHeader = req.headers.get('x-square-hmacsha256-signature') || ''
    const url = `https://cfenkstusggrcthehffn.supabase.co/functions/v1/square-webhook`
    const expected = await hmac('sha256', sigKey, url + body, 'utf8', 'base64')
    if (sigHeader !== expected) throw new Error('Invalid webhook signature')

    const sb = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // ── Handle payment.completed ───────────────────────────────
    if (event.type === 'payment.updated' &&
        event.data?.object?.payment?.status === 'COMPLETED') {
      const payment = event.data?.object?.payment
      if (!payment) throw new Error('No payment object in event')

      const orderId   = payment.order_id
      const amountCents = payment.total_money?.amount || 0
      const amountMv  = Math.round(amountCents / 100) // 1 MV = $1

      // Find pending mint by order_id
      const { data: mint, error: mintErr } = await sb
        .from('mv_pending_mints')
        .select('*')
        .eq('square_order_id', orderId)
        .eq('status', 'pending')
        .single()

      if (mintErr || !mint) {
        console.error('No pending mint for order:', orderId)
        return new Response('ok', { headers: corsHeaders }) // don't retry
      }

      // Idempotency check — don't double-mint
      if (mint.status === 'completed') {
        return new Response('ok', { headers: corsHeaders })
      }

      // ── Credit MV to user balance ──────────────────────────
      const { error: balErr } = await sb.rpc('admin_mint_mv', {
        p_user_id:  mint.user_id,
        p_amount:   amountMv,
        p_note:     `Square payment ${payment.id}`,
      })

      if (balErr) {
        console.error('Mint RPC failed:', balErr.message)
        throw new Error('Failed to mint MV')
      }

      // ── Mark mint as completed ─────────────────────────────
      await sb
        .from('mv_pending_mints')
        .update({
          status:           'completed',
          square_payment_id: payment.id,
          completed_at:     new Date().toISOString(),
        })
        .eq('id', mint.id)

      // ── Publish public ledger event ────────────────────────
      await sb.rpc('publish_public_event', {
        p_type:        'mint',
        p_amount:      amountMv,
        p_tx_hash:     payment.id,
        p_from_user_id: null,
        p_to_user_id:  mint.user_id,
        p_job_id:      null,
      })

      console.log(`✅ Minted ${amountMv} MV to user ${mint.user_id}`)
    }

    // ── Handle payment.failed ──────────────────────────────────
    if (event.type === 'payment.updated' &&
        event.data?.object?.payment?.status === 'FAILED') {
      const payment = event.data?.object?.payment
      const orderId = payment?.order_id

      if (orderId) {
        await sb
          .from('mv_pending_mints')
          .update({ status: 'failed' })
          .eq('square_order_id', orderId)
          .eq('status', 'pending')
      }
    }

    return new Response('ok', { headers: corsHeaders })

  } catch (err) {
    console.error('square-webhook error:', err.message)
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
