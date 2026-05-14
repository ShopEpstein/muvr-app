function switchPublicLedger() {
  if (state.user) { switchTab('ledger'); return; }
  var root = getEl('root');
  if (!root) return;
  root.innerHTML = '<div class="fade-up"><div class="max-w-4xl mx-auto px-5 py-8">' +
    '<div class="flex items-center justify-between mb-6">' +
      '<div class="flex items-center gap-3">' +
        '<div class="text-2xl font-black"><span style="color:var(--accent)">M</span>U<span style="color:var(--accent)">V</span>R<sup style="font-size:0.45em;vertical-align:super;opacity:0.7">&trade;</sup></div>' +
        '<span class="text-[10px] font-black px-2 py-1 rounded-full" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.10)">PUBLIC LEDGER</span>' +
      '</div>' +
      '<div class="flex gap-2">' +
        '<button onclick="openAuthModal()" class="btn-pill btn-pill-accent">Sign In</button>' +
        '<button onclick="renderLanding()" class="btn-pill btn-pill-ghost">Back</button>' +
      '</div>' +
    '</div>' +
    '<div id="public-ledger-content"></div>' +
  '</div></div>';
  renderLedgerContent('public-ledger-content');
  loadPublicEvents();
}

function renderLedgerTab() {
  var c = getEl('tab-content');
  if (!c) return;
  c.innerHTML = '<div class="fade-up">' +
    '<h1 class="text-3xl font-black mb-2">Public Ledger</h1>' +
    '<p class="text-sm mb-6" style="color:rgba(232,236,241,0.62)">Anonymous, realtime feed of all MV credit activity on the network. All user identities shown as pseudonymous aliases.</p>' +
    '<div id="app-ledger-content"></div>' +
  '</div>';
  renderLedgerContent('app-ledger-content');
}

function renderLedgerContent(containerId) {
  var el = getEl(containerId);
  if (!el) return;
  var types = [{k:'all',l:'All'},{k:'mint',l:'Mint'},{k:'burn',l:'Retired'},{k:'transfer',l:'Transfer'},{k:'escrow_lock',l:'Escrow Lock'},{k:'escrow_release',l:'Release'}];
  var btns = types.map(function(t) {
    return '<button onclick="state.ledgerFilter=\'' + t.k + '\';loadPublicEvents()" class="btn-pill ' + (state.ledgerFilter === t.k ? 'btn-pill-accent' : 'btn-pill-ghost') + '">' + t.l + '</button>';
  }).join('');

  el.innerHTML =
    '<div class="card p-5 mb-5 shimmer-border" style="border-color:rgba(24,246,200,0.14);background:linear-gradient(135deg,rgba(24,246,200,0.06),rgba(124,92,255,0.04))">' +
      '<div class="flex items-center gap-2 mb-3"><div class="live-dot"></div><span class="text-[10px] font-black tracking-widest" style="color:rgba(232,236,241,0.65)">LIVE NETWORK</span></div>' +
      '<div class="grid grid-cols-3 sm:grid-cols-6 gap-3 text-center">' +
        '<div class="scale-in"><p class="text-[10px] font-black" style="color:rgba(232,236,241,0.45)">CAP</p><p class="text-lg font-black mono glow-text" style="color:var(--accent)">10M</p></div>' +
        '<div class="scale-in" style="animation-delay:0.05s"><p class="text-[10px] font-black" style="color:rgba(232,236,241,0.45)">MINTED</p><p class="text-lg font-black mono" style="color:var(--accent)" id="pub-minted">-</p></div>' +
        '<div class="scale-in" style="animation-delay:0.10s"><p class="text-[10px] font-black" style="color:rgba(232,236,241,0.45)">AVAILABLE</p><p class="text-lg font-black mono" style="color:var(--accent-3)" id="pub-available">-</p></div>' +
        '<div class="scale-in" style="animation-delay:0.15s"><p class="text-[10px] font-black" style="color:rgba(232,236,241,0.45)">CIRCULATING</p><p class="text-lg font-black mono" style="color:var(--accent-2)" id="pub-circulating">-</p></div>' +
        '<div class="scale-in" style="animation-delay:0.20s"><p class="text-[10px] font-black" style="color:rgba(232,236,241,0.45)">ESCROWED</p><p class="text-lg font-black mono" style="color:var(--yellow)" id="pub-escrowed">-</p></div>' +
        '<div class="scale-in" style="animation-delay:0.25s"><p class="text-[10px] font-black" style="color:rgba(232,236,241,0.45)">RETIRED</p><p class="text-lg font-black mono" style="color:var(--red)" id="pub-burned">-</p></div>' +
      '</div>' +
    '</div>' +
    '<div class="flex gap-2 mb-4 overflow-x-auto pb-1">' + btns + '</div>' +
    '<div id="public-events-list"><p class="text-sm py-4" style="color:var(--text-dim)">Loading events...</p></div>';
}

async function loadPublicEvents() {
  try {
    var filter = state.ledgerFilter !== 'all' ? '&type=eq.' + state.ledgerFilter : '';
    var url = 'mv_public_events?order=created_at.desc&limit=50' + filter;
    var headers = { 'apikey': SUPA_KEY };
    if (state.accessToken) headers['Authorization'] = 'Bearer ' + state.accessToken;
    var res = await fetch(SUPA_URL + '/rest/v1/' + url, { headers: headers });
    state.publicEvents = res.ok ? await res.json() : [];
    renderPublicEvents();
    computeNetworkStats();
  } catch(e) { console.error(e); }
}

async function computeNetworkStats() {
  try {
    var rpcRes = await apiRequest('rpc/get_network_stats', { method: 'POST', body: '{}' });
    if (rpcRes && rpcRes.ok) {
      var stats = await rpcRes.json();
      if (stats && stats.cap) {
        function fmtNum(n) { n = Number(n) || 0; if (n === 10000000) return '10M'; return n >= 1000000 ? n.toLocaleString() : n >= 1000 ? (n/1000).toFixed(1) + 'K' : String(Math.round(n)); }
        ['stat-minted', 'pub-minted'].forEach(function(id) { var el = getEl(id); if (el) el.textContent = fmtNum(stats.minted); });
        ['stat-escrowed', 'pub-escrowed'].forEach(function(id) { var el = getEl(id); if (el) el.textContent = fmtNum(stats.escrowed); });
        ['stat-burned', 'pub-burned'].forEach(function(id) { var el = getEl(id); if (el) el.textContent = fmtNum(stats.burned); });
        ['stat-circulating', 'pub-circulating'].forEach(function(id) { var el = getEl(id); if (el) el.textContent = fmtNum(stats.circulating); });
        ['stat-available', 'pub-available'].forEach(function(id) { var el = getEl(id); if (el) el.textContent = fmtNum(stats.available); });
        return;
      }
    }
  } catch(re) { console.warn('get_network_stats RPC failed, using fallback:', re); }
  /* FALLBACK: original client-side computation */
  var TOTAL_CAP = 10000000;
  try {
    var headers = { 'apikey': SUPA_KEY };
    if (state.accessToken) headers['Authorization'] = 'Bearer ' + state.accessToken;
    var allRes = await fetch(SUPA_URL + '/rest/v1/mv_public_events?select=type,amount_mv&limit=5000', { headers: headers });
    var all = allRes.ok ? await allRes.json() : [];
    var minted = 0, escrowed = 0, burned = 0;
    all.forEach(function(e) {
      var amt = Number(e.amount_mv || 0);
      if (e.type === 'mint') minted += amt;
      if (e.type === 'escrow_lock') escrowed += amt;
      if (e.type === 'escrow_release') escrowed -= amt;
      if (e.type === 'escrow_refund') escrowed -= amt;
      if (e.type === 'burn') burned += amt;
    });
    if (escrowed < 0) escrowed = 0;
    var circulating = minted - burned - escrowed;
    if (circulating < 0) circulating = 0;
    var available = TOTAL_CAP - minted;
    if (available < 0) available = 0;
    function fmtNum(n) { if (n === 10000000) return '10M'; return n >= 1000000 ? n.toLocaleString() : n >= 1000 ? (n/1000).toFixed(1) + 'K' : String(Math.round(n)); }
    ['stat-minted', 'pub-minted'].forEach(function(id) { var el = getEl(id); if (el) el.textContent = fmtNum(minted); });
    ['stat-escrowed', 'pub-escrowed'].forEach(function(id) { var el = getEl(id); if (el) el.textContent = fmtNum(escrowed); });
    ['stat-burned', 'pub-burned'].forEach(function(id) { var el = getEl(id); if (el) el.textContent = fmtNum(burned); });
    ['stat-circulating', 'pub-circulating'].forEach(function(id) { var el = getEl(id); if (el) el.textContent = fmtNum(circulating); });
    ['stat-available', 'pub-available'].forEach(function(id) { var el = getEl(id); if (el) el.textContent = fmtNum(available); });
  } catch(e) { console.error('Stats fallback error:', e); }
}

function renderPublicEvents() {
  var el = getEl('public-events-list');
  if (!el) return;
  if (!state.publicEvents.length) {
    el.innerHTML = '<div class="text-center py-12" style="color:var(--text-dim)">' + muxiSVG(48) + '<p class="font-black mt-3">No events recorded yet</p><p class="text-sm mt-1">Post a Mission or load credits to create the first network event.</p></div>';
    return;
  }
  var typeConfig = {
    mint: { icon: '&#128994;', color: 'var(--accent)', label: 'MINT' },
    burn: { icon: '&#128308;', color: 'var(--red)', label: 'RETIRED' },
    transfer: { icon: '&#128310;', color: 'var(--accent-2)', label: 'TRANSFER' },
    escrow_lock: { icon: '&#128274;', color: 'var(--yellow)', label: 'ESCROW LOCK' },
    escrow_release: { icon: '&#128275;', color: 'var(--accent)', label: 'RELEASE' },
    escrow_refund: { icon: '&#128281;', color: 'var(--accent-3)', label: 'REFUND' }
  };

  el.innerHTML = state.publicEvents.map(function(ev) {
    var cfg = typeConfig[ev.type] || { icon: '&#128312;', color: 'var(--text-dim)', label: ev.type };
    return '<div class="ledger-event card p-3 mb-2">' +
      '<div class="flex items-center justify-between">' +
        '<div class="flex items-center gap-3">' +
          '<span class="text-base">' + cfg.icon + '</span>' +
          '<div>' +
            '<p class="font-black text-[11px] tracking-wider" style="color:' + cfg.color + '">' + cfg.label + '</p>' +
            '<p class="text-[10px] mt-0.5" style="color:var(--text-dim)">' +
              (ev.from_alias ? '<span class="mono">' + escapeHtml(ev.from_alias) + '</span>' : '') +
              (ev.from_alias && ev.to_alias ? ' &#8594; ' : '') +
              (ev.to_alias ? '<span class="mono">' + escapeHtml(ev.to_alias) + '</span>' : '') +
            '</p>' +
          '</div>' +
        '</div>' +
        '<div class="text-right">' +
          '<p class="mono font-black text-sm" style="color:' + cfg.color + '">' + Number(ev.amount_mv) + ' <span style="color:var(--accent)">MV</span></p>' +
          '<p class="text-[10px]" style="color:var(--text-dim)">' + relTime(ev.created_at) + '</p>' +
        '</div>' +
      '</div>' +
      (ev.tx_hash ? '<div class="mt-2 text-[10px] mono" style="color:rgba(232,236,241,0.30);word-break:break-all">TX: ' + escapeHtml(ev.tx_hash) + '</div>' : '') +
    '</div>';
  }).join('');
}

async function publishEvent(type, amount, txHash, fromUserId, toUserId, jobId) {
  try {
    var rpcRes = await apiRequest('rpc/publish_public_event', {
      method: 'POST',
      body: JSON.stringify({
        p_type: type, p_amount: amount, p_tx_hash: txHash || '',
        p_from_user_id: fromUserId || null, p_to_user_id: toUserId || null,
        p_related_job_id: jobId || null
      })
    });
    if (rpcRes && rpcRes.ok) return true;
  } catch(e) { console.warn('RPC publish failed:', e); }
  /* Fallback: direct INSERT */
  try {
    var fromAlias = null, toAlias = null;
    if (fromUserId) {
      try {
        var ar = await apiRequest('mv_aliases?user_id=eq.' + fromUserId + '&select=public_alias');
        var ad = (ar && ar.ok) ? await ar.json() : [];
        fromAlias = ad.length ? ad[0].public_alias : ('muvr_' + fromUserId.slice(0,8));
      } catch(e) { fromAlias = 'muvr_' + fromUserId.slice(0,8); }
    }
    if (toUserId) {
      try {
        var ar2 = await apiRequest('mv_aliases?user_id=eq.' + toUserId + '&select=public_alias');
        var ad2 = (ar2 && ar2.ok) ? await ar2.json() : [];
        toAlias = ad2.length ? ad2[0].public_alias : ('muvr_' + toUserId.slice(0,8));
      } catch(e) { toAlias = 'muvr_' + toUserId.slice(0,8); }
    }
    await apiRequest('mv_public_events', {
      method: 'POST',
      body: JSON.stringify({
        type: type, amount_mv: amount, tx_hash: txHash || '',
        from_alias: fromAlias, to_alias: toAlias, related_job_id: jobId || null
      })
    });
  } catch(e) { console.error('Direct event insert also failed:', e); }
}

function subscribeToPublicEvents() {
  if (!sb) return;
  try {
    var ch = sb.channel('public-events')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mv_public_events' }, function(payload) {
        if (payload.new) {
          state.publicEvents.unshift(payload.new);
          if (state.publicEvents.length > 100) state.publicEvents.pop();
          if (state.currentTab === 'ledger') renderPublicEvents();
        }
      }).subscribe();
    state.realtimeSubs.push(ch);
  } catch(e) { console.error('public events sub error:', e); }
}
