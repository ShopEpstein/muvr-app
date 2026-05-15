// supabase/functions/create-checkout/index.ts
// Replaces Stripe create-checkout with Square Checkout API
// Secrets required: SQUARE_ACCESS_TOKEN, SQUARE_ACCESS_TOKEN_PROD,
//                   SQUARE_LOCATION_ID, SQUARE_LOCATION_ID_PROD,
//                   SQUARE_APP_ID, SQUARE_APP_ID_PROD, SITE_URL

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // ── Auth: verify user JWT ──────────────────────────────────
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing authorization header')

    const sb = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await sb.auth.getUser(token)
    if (authError || !user) throw new Error('Unauthorized')

    // ── Parse request body ─────────────────────────────────────
    const { amount_mv, env = 'production' } = await req.json()

    if (!amount_mv || amount_mv < 1) throw new Error('Invalid amount')

    // 1 MV = $1.00 USD = 100 cents
    const amountCents = Math.round(amount_mv * 100)

    // ── Square credentials (env-aware) ─────────────────────────
    const isSandbox = env === 'sandbox'
    const accessToken = isSandbox
      ? Deno.env.get('SQUARE_ACCESS_TOKEN')!
      : Deno.env.get('SQUARE_ACCESS_TOKEN_PROD')!
    const locationId = isSandbox
      ? Deno.env.get('SQUARE_LOCATION_ID')!
      : Deno.env.get('SQUARE_LOCATION_ID_PROD')!

    const squareBaseUrl = isSandbox
      ? 'https://connect.squareupsandbox.com'
      : 'https://connect.squareup.com'

    const siteUrl = Deno.env.get('SITE_URL') || 'https://muvr-app.vercel.app'

    // ── Create Square Payment Link ─────────────────────────────
    const idempotencyKey = crypto.randomUUID()

    const squarePayload = {
      idempotency_key: idempotencyKey,
      quick_pay: {
        name: `${amount_mv} MV Credits`,
        price_money: {
          amount: amountCents,
          currency: 'USD',
        },
        location_id: locationId,
      },
      checkout_options: {
        redirect_url: `${siteUrl}/?mint_success=1&mv=${amount_mv}`,
        merchant_support_email: 'support@transbid.com',
        allow_tipping: false,
        ask_for_shipping_address: false,
      },
      pre_populated_data: {
        buyer_email: user.email || '',
      },
      payment_note: `MUVR MV Credits — user:${user.id} — ${amount_mv}MV`,
    }

    const squareRes = await fetch(`${squareBaseUrl}/v2/online-checkout/payment-links`, {
      method: 'POST',
      headers: {
        'Square-Version': '2024-01-18',
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(squarePayload),
    })

    const squareData = await squareRes.json()

    if (!squareRes.ok || squareData.errors) {
      console.error('Square error:', JSON.stringify(squareData.errors))
      throw new Error(squareData.errors?.[0]?.detail || 'Square checkout failed')
    }

    const checkoutUrl = squareData.payment_link?.url
    const orderId     = squareData.payment_link?.order_id
    const linkId      = squareData.payment_link?.id

    if (!checkoutUrl) throw new Error('No checkout URL returned from Square')

    // ── Log pending mint to DB ─────────────────────────────────
    await sb.from('mv_pending_mints').insert({
      user_id:    user.id,
      amount_mv,
      amount_usd: amount_mv,
      square_order_id:  orderId,
      square_link_id:   linkId,
      status:    'pending',
      env:        env,
      created_at: new Date().toISOString(),
    }).throwOnError()

    // ── Return checkout URL to frontend ────────────────────────
    return new Response(
      JSON.stringify({ url: checkoutUrl, order_id: orderId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('create-checkout error:', err.message)
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
