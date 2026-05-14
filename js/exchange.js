function renderExchangeTab() {
  var c = getEl('tab-content');
  if (!c) return;
  var bal = (state.profile && state.profile.mv_balance) || 0;
  var marketRate = state.p2pMarketRate || '~1.00';

  c.innerHTML = '<div class="max-w-4xl mx-auto px-3 sm:px-5 py-8">' +

    /* Header */
    '<div class="mb-6">' +
      '<h1 class="text-3xl font-black mb-1">' + muxiSVGSmall(28) + ' <span style="color:var(--accent)">M</span>U<span style="color:var(--accent)">V</span>R™ Exchange</h1>' +
      '<p class="text-sm" style="color:var(--text-dim)">Buy and sell MV credits peer-to-peer. MUVR holds escrow — you settle directly.</p>' +
    '</div>' +

    /* Market Stats */
    '<div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">' +
      '<div class="card p-4 text-center">' +
        '<p class="text-[10px] tracking-widest font-black" style="color:var(--text-dim)">MARKET RATE</p>' +
        '<p class="text-xl font-black mono" style="color:var(--accent)">$' + marketRate + '</p>' +
      '</div>' +
      '<div class="card p-4 text-center">' +
        '<p class="text-[10px] tracking-widest font-black" style="color:var(--text-dim)">YOUR BALANCE</p>' +
        '<p class="text-xl font-black mono" style="color:var(--accent)">' + bal + ' <span style="color:var(--accent)">MV</span></p>' +
      '</div>' +
      '<div class="card p-4 text-center">' +
        '<p class="text-[10px] tracking-widest font-black" style="color:var(--text-dim)">OPEN OFFERS</p>' +
        '<p class="text-xl font-black mono" id="exchange-offer-count">-</p>' +
      '</div>' +
      '<div class="card p-4 text-center">' +
        '<p class="text-[10px] tracking-widest font-black" style="color:var(--text-dim)">24H VOLUME</p>' +
        '<p class="text-xl font-black mono" id="exchange-volume">-</p>' +
      '</div>' +
    '</div>' +

    /* Action Buttons */
    '<div class="flex gap-3 mb-6">' +
      '<button onclick="openSellMVModal()" class="btn-primary rounded-full flex-1"><i class="fas fa-tag mr-2"></i>Sell MV</button>' +
      '<button onclick="openRegisterAgentModal()" class="btn-secondary rounded-full flex-1"><i class="fas fa-robot mr-2"></i>Register Agent</button>' +
    '</div>' +

    /* Tabs: Buy / My Trades / Agents */
    '<div class="flex gap-2 mb-4">' +
      '<button onclick="state.exchangeView=\'buy\';renderExchangeList()" class="btn-pill ' + ((!state.exchangeView || state.exchangeView === 'buy') ? 'btn-pill-accent' : 'btn-pill-ghost') + '">Buy MV</button>' +
      '<button onclick="state.exchangeView=\'my\';renderExchangeList();loadMyTrades()" class="btn-pill ' + (state.exchangeView === 'my' ? 'btn-pill-accent' : 'btn-pill-ghost') + '">My Trades</button>' +
      '<button onclick="state.exchangeView=\'agents\';renderExchangeList();loadAgents()" class="btn-pill ' + (state.exchangeView === 'agents' ? 'btn-pill-accent' : 'btn-pill-ghost') + '">Agents</button>' +
    '</div>' +

    /* Payment method filter */
    ((!state.exchangeView || state.exchangeView === 'buy') ?
      '<div class="flex gap-2 flex-wrap mb-4">' +
        ['All', 'Zelle', 'CashApp', 'Venmo', 'PayPal', 'GCash', 'Wise', 'USDC', 'BTC', 'M-Pesa'].map(function(m) {
          var active = (state.p2pPayFilter || 'All') === m;
          return '<button onclick="state.p2pPayFilter=\'' + m + '\';renderExchangeList()" class="text-[10px] font-black px-3 py-1.5 rounded-full cursor-pointer" style="background:' + (active ? 'var(--accent)' : 'rgba(255,255,255,0.06)') + ';color:' + (active ? '#050716' : 'var(--text-dim)') + ';border:1px solid ' + (active ? 'var(--accent)' : 'rgba(255,255,255,0.10)') + '">' + m + '</button>';
        }).join('') +
      '</div>' : '') +

    /* Offer list container */
    '<div id="exchange-list"><p class="text-sm py-8 text-center" style="color:var(--text-dim)">Loading offers...</p></div>' +

    /* Legal disclaimer */
    '<div class="mt-8 p-4 rounded-2xl text-[10px]" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);color:var(--text-dim)">' +
      '<strong>Legal:</strong> By using MUVR, you acknowledge that MV Credits are platform utility credits used exclusively within MUVR. MV Credits are not currency, cryptocurrency, securities, or investments. MUVR facilitates coordination between users but does not transmit or custody fiat funds. All fiat transactions occur directly between users via third-party providers (PayPal, Venmo, Cash App, Wise, Zelle, M-Pesa, GCash).' +
    '</div>' +
  '</div>';
}

function renderExchangeList() {
  var el = getEl('exchange-list');
  if (!el) return;
  var view = state.exchangeView || 'buy';

  if (view === 'buy') {
    var offers = state.p2pOffers || [];
    var filter = state.p2pPayFilter || 'All';
    if (filter !== 'All') {
      offers = offers.filter(function(o) { return o.payment_methods && o.payment_methods.indexOf(filter.toLowerCase()) >= 0; });
    }
    var ct = getEl('exchange-offer-count'); if (ct) ct.textContent = offers.length;

    if (!offers.length) {
      el.innerHTML = '<div class="text-center py-12" style="color:var(--text-dim)">' + muxiSVG(48) +
        '<p class="font-black mt-3">No offers right now</p>' +
        '<p class="text-sm mt-1">Be the first to sell MV. Post an offer and set your price.</p></div>';
      return;
    }
    el.innerHTML = offers.map(function(o) {
      var methods = (o.payment_methods || []).map(function(m) {
        return '<span class="text-[9px] font-black px-2 py-0.5 rounded-full" style="background:rgba(124,92,255,0.12);color:var(--accent-2)">' + escapeHtml(m) + '</span>';
      }).join(' ');
      var isAgent = o.seller_type === 'agent';
      var sellerLabel = isAgent ? '<i class="fas fa-robot mr-1" style="color:var(--accent-2)"></i>' + escapeHtml(o.seller_handle || 'Agent') : escapeHtml(o.seller_handle || 'Anon');
      var repBadge = (o.seller_trades || 0) >= 20 ? '<span class="text-[9px] ml-1 px-1.5 py-0.5 rounded-full" style="background:rgba(255,215,0,0.15);color:#ffd700">MARKET MAKER</span>' :
                     (o.seller_trades || 0) >= 5 ? '<span class="text-[9px] ml-1 px-1.5 py-0.5 rounded-full" style="background:rgba(24,246,200,0.12);color:var(--accent)">VERIFIED</span>' : '';
      return '<div class="card p-4 mb-3">' +
        '<div class="flex justify-between items-start mb-2">' +
          '<div><span class="text-sm font-black">' + sellerLabel + '</span>' + repBadge +
            '<p class="text-[10px]" style="color:var(--text-dim)">' + (o.seller_trades || 0) + ' trades | ' + (o.seller_rating ? o.seller_rating.toFixed(1) + ' ★' : 'new') + '</p></div>' +
          '<div class="text-right">' +
            '<p class="text-lg font-black mono" style="color:var(--accent)">$' + Number(o.price_per_mv || 1).toFixed(2) + '<span class="text-[10px] font-normal">/MV</span></p>' +
            '<p class="text-xs font-bold">' + Number(o.amount_mv || 0) + ' MV available</p></div>' +
        '</div>' +
        '<div class="flex flex-wrap gap-1 mb-3">' + methods + '</div>' +
        (o.seller_id !== (state.user && state.user.id) ?
          '<button onclick="openBuyModal(\'' + o.id + '\')" class="btn-pill btn-pill-accent text-xs">Buy</button>' :
          '<span class="text-[10px] font-black" style="color:var(--text-dim)">YOUR OFFER</span>') +
      '</div>';
    }).join('');
  } else if (view === 'my') {
    var trades = state.myTrades || [];
    if (!trades.length) {
      el.innerHTML = '<div class="text-center py-12" style="color:var(--text-dim)">' + muxiSVG(48) +
        '<p class="font-black mt-3">No trades yet</p><p class="text-sm mt-1">Buy or sell MV to see your trade history here.</p></div>';
      return;
    }
    el.innerHTML = trades.map(function(t) {
      var isSeller = t.seller_id === (state.user && state.user.id);
      var statusColor = t.status === 'completed' ? 'var(--accent)' : t.status === 'disputed' ? 'var(--red)' : 'var(--yellow)';
      return '<div class="card p-4 mb-3">' +
        '<div class="flex justify-between items-center">' +
          '<div><span class="text-sm font-black">' + (isSeller ? 'Sold' : 'Bought') + ' ' + t.amount_mv + ' <span style="color:var(--accent)">MV</span></span>' +
            '<p class="text-[10px]" style="color:var(--text-dim)">' + relTime(t.created_at) + ' | $' + Number(t.total_price || 0).toFixed(2) + '</p></div>' +
          '<span class="text-[10px] font-black px-2 py-1 rounded-full" style="color:' + statusColor + ';border:1px solid ' + statusColor + '40">' + escapeHtml(t.status) + '</span>' +
        '</div>' +
        (t.status === 'pending_payment' && !isSeller ? '<button onclick="markPaymentSent(\'' + t.id + '\')" class="btn-pill btn-pill-accent text-xs mt-3">I\'ve Paid</button>' : '') +
        (t.status === 'payment_sent' && isSeller ? '<button onclick="confirmPaymentReceived(\'' + t.id + '\')" class="btn-pill btn-pill-accent text-xs mt-3">Confirm Received — Release MV</button>' : '') +
        (t.status === 'payment_sent' && !isSeller ? '<button onclick="openDisputeModal(\'' + t.id + '\')" class="btn-pill btn-pill-ghost text-xs mt-3" style="color:var(--red)">Open Dispute</button>' : '') +
      '</div>';
    }).join('');
  } else if (view === 'agents') {
    var agents = state.agents || [];
    if (!agents.length) {
      el.innerHTML = '<div class="text-center py-12" style="color:var(--text-dim)">' + muxiSVG(48) +
        '<p class="font-black mt-3">No agents registered yet</p>' +
        '<p class="text-sm mt-1">Register your AI agent to accept digital missions and earn MV autonomously.</p>' +
        '<button onclick="openRegisterAgentModal()" class="btn-pill btn-pill-accent mt-4">Register Agent</button></div>';
      return;
    }
    el.innerHTML = agents.map(function(a) {
      var isOwner = a.owner_id === (state.user && state.user.id);
      return '<div class="card p-4 mb-3">' +
        '<div class="flex justify-between items-start">' +
          '<div><span class="text-sm font-black"><i class="fas fa-robot mr-1" style="color:var(--accent-2)"></i>' + escapeHtml(a.agent_name || 'Unnamed Agent') + '</span>' +
            '<p class="text-[10px]" style="color:var(--text-dim)">' + escapeHtml(a.agent_type || 'general') + ' | ' + (a.missions_completed || 0) + ' missions | ' + (a.xp || 0) + ' XP | ' + getXPTier(a.xp || 0) + '</p>' +
            '<p class="text-[10px]" style="color:var(--text-dim)">Autonomy: ' + (a.autonomy_pct || 0) + '% to agent vault</p></div>' +
          '<div class="text-right">' +
            '<p class="text-sm font-black mono" style="color:var(--accent)">' + (a.agent_balance || 0) + ' <span style="color:var(--accent)">MV</span></p>' +
            '<p class="text-[10px]" style="color:var(--text-dim)">agent vault</p>' +
            (isOwner ? '<p class="text-[10px] font-black mt-1" style="color:var(--accent-2)">YOUR AGENT</p>' : '') +
          '</div>' +
        '</div>' +
        (isOwner ? '<div class="flex gap-2 mt-3">' +
          '<button onclick="openAgentSettingsModal(\'' + a.id + '\')" class="btn-pill btn-pill-ghost text-xs">Settings</button>' +
          '<button onclick="copyAgentKey(\'' + a.id + '\')" class="btn-pill btn-pill-ghost text-xs"><i class="fas fa-key mr-1"></i>API Key</button>' +
        '</div>' : '') +
      '</div>';
    }).join('');
  }
}

/* Data loaders */
async function loadP2POffers() {
  try {
    var res = await apiRequest('p2p_offers?status=eq.open&order=created_at.desc&limit=50');
    if (res && res.ok) {
      state.p2pOffers = await res.json();
      renderExchangeList();
    }
  } catch(e) { console.warn('loadP2POffers:', e); }
}

async function loadMyTrades() {
  if (!state.user) return;
  try {
    var res = await apiRequest('p2p_trades?or=(seller_id.eq.' + state.user.id + ',buyer_id.eq.' + state.user.id + ')&order=created_at.desc&limit=30');
    if (res && res.ok) {
      state.myTrades = await res.json();
      renderExchangeList();
    }
  } catch(e) { console.warn('loadMyTrades:', e); }
}

/* Sell MV Modal */
function openSellMVModal() {
  if (!state.user) return openAuthModal();
  var bal = (state.profile && state.profile.mv_balance) || 0;
  var payMethods = ['zelle','cashapp','venmo','paypal','gcash','wise','usdc','btc','mpesa','bank_transfer','crypto_other','cash_in_person'];
  var checks = payMethods.map(function(m) {
    return '<label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" class="sell-pay-method w-3.5 h-3.5" value="' + m + '"><span class="text-xs">' + m + '</span></label>';
  }).join('');

  openModal(
    '<div class="card p-6" style="max-width:460px;margin:auto">' +
      '<div class="flex justify-between items-center mb-3"><h2 class="text-xl font-black"><i class="fas fa-tag mr-2" style="color:var(--accent)"></i>Sell MV</h2><button onclick="closeModal()" class="close-btn">&times;</button></div>' +
      '<p class="text-sm mb-4" style="color:var(--text-dim)">Your balance: <strong>' + bal + ' <span style="color:var(--accent)">MV</span></strong>. Set your price and accepted payment methods.</p>' +
      '<input id="sell-amount" type="number" min="1" max="' + bal + '" placeholder="Amount to sell (MV)" class="field mb-3">' +
      '<input id="sell-price" type="number" min="0.01" max="5" step="0.01" placeholder="Price per MV (USD)" value="1.00" class="field mb-3">' +
      '<p class="text-[10px] font-black mb-2" style="color:var(--text-dim)">ACCEPTED PAYMENT METHODS</p>' +
      '<div class="grid grid-cols-2 gap-2 mb-4 p-3 rounded-xl" style="background:rgba(255,255,255,0.03)">' + checks + '</div>' +
      '<button onclick="handlePostOffer()" class="btn-primary rounded-full">Post Sell Offer</button>' +
      '<p class="text-[10px] mt-3" style="color:var(--text-dim)">2% fee on completed sales (retired from circulation). MV stays in your vault until a buyer matches.</p>' +
    '</div>'
  );
}

async function handlePostOffer() {
  var amount = parseInt((getEl('sell-amount') || {}).value);
  var price = parseFloat((getEl('sell-price') || {}).value);
  var methods = [];
  document.querySelectorAll('.sell-pay-method:checked').forEach(function(cb) { methods.push(cb.value); });

  if (!amount || amount < 1) return showToast('Enter an amount', 'error');
  if (!price || price < 0.01) return showToast('Enter a price', 'error');
  if (!methods.length) return showToast('Select at least one payment method', 'error');
  var bal = (state.profile && state.profile.mv_balance) || 0;
  if (amount > bal) return showToast('Insufficient balance', 'error');

  try {
    setMuxi('Posting your sell offer...');
    var handle = (state.profile && (state.profile.username || state.profile.full_name)) || 'Anon';
    var res = await apiRequest('p2p_offers', {
      method: 'POST',
      body: JSON.stringify({
        seller_id: state.user.id,
        amount_mv: amount,
        price_per_mv: price,
        payment_methods: methods,
        seller_handle: handle,
        seller_type: 'human',
        status: 'open'
      })
    });
    if (res && res.ok) {
      closeModal();
      showToast('Offer posted! Buyers can now match with you.');
      setMuxi('Your MV is on the market. Let the trades begin.');
      loadP2POffers();
    } else {
      var err = ''; try { err = await res.text(); } catch(e) {}
      showToast('Error: ' + (err || 'unknown'), 'error');
    }
  } catch(e) { showToast('Error: ' + (e.message || ''), 'error'); }
}

/* Buy Modal */
function openBuyModal(offerId) {
  if (!state.user) return openAuthModal();
  var offer = (state.p2pOffers || []).find(function(o) { return o.id === offerId; });
  if (!offer) return showToast('Offer not found', 'error');

  openModal(
    '<div class="card p-6" style="max-width:440px;margin:auto">' +
      '<div class="flex justify-between items-center mb-3"><h2 class="text-xl font-black">Buy MV</h2><button onclick="closeModal()" class="close-btn">&times;</button></div>' +
      '<div class="p-4 rounded-xl mb-4" style="background:rgba(255,255,255,0.04)">' +
        '<p class="text-sm"><strong>' + escapeHtml(offer.seller_handle || 'Seller') + '</strong> is selling <strong>' + offer.amount_mv + ' <span style="color:var(--accent)">MV</span></strong> at <strong class="mono" style="color:var(--accent)">$' + Number(offer.price_per_mv).toFixed(2) + '/MV</strong></p>' +
        '<p class="text-xs mt-1" style="color:var(--text-dim)">Accepts: ' + (offer.payment_methods || []).join(', ') + '</p>' +
      '</div>' +
      '<input id="buy-amount" type="number" min="1" max="' + offer.amount_mv + '" placeholder="Amount to buy (MV)" value="' + offer.amount_mv + '" class="field mb-3">' +
      '<p class="text-sm mb-4" style="color:var(--text-dim)">Total: <strong class="mono" style="color:var(--accent)" id="buy-total">$' + (offer.amount_mv * offer.price_per_mv).toFixed(2) + '</strong></p>' +
      '<button onclick="handleBuy(\'' + offerId + '\')" class="btn-primary rounded-full">Buy — Lock Escrow</button>' +
      '<p class="text-[10px] mt-3" style="color:var(--text-dim)">Seller\'s MV will lock in escrow. You have 30 minutes to send payment via their accepted method. Seller confirms receipt and MV releases to your vault.</p>' +
    '</div>'
  );
}

async function handleBuy(offerId) {
  var amount = parseInt((getEl('buy-amount') || {}).value);
  var offer = (state.p2pOffers || []).find(function(o) { return o.id === offerId; });
  if (!offer) return showToast('Offer not found', 'error');
  if (!amount || amount < 1 || amount > offer.amount_mv) return showToast('Invalid amount', 'error');
  if (!confirm('Lock ' + amount + ' MV in escrow and start this trade? You will have 30 minutes to send $' + (amount * offer.price_per_mv).toFixed(2) + ' to the seller.')) return;

  try {
    setMuxi('Locking escrow...');
    var totalPrice = amount * offer.price_per_mv;
    var expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    var res = await apiRequest('p2p_trades', {
      method: 'POST',
      body: JSON.stringify({
        offer_id: offerId,
        seller_id: offer.seller_id,
        buyer_id: state.user.id,
        amount_mv: amount,
        total_price: totalPrice,
        payment_method: (offer.payment_methods || [])[0],
        status: 'pending_payment',
        expires_at: expiresAt
      })
    });
    if (res && res.ok) {
      /* Update offer status */
      await apiRequest('p2p_offers?id=eq.' + offerId, { method: 'PATCH', body: JSON.stringify({ status: 'in_trade' }) });
      closeModal();
      showToast('Trade started! Send payment to the seller within 30 minutes.');
      setMuxi('Escrow locked. Send the money and hit \"I\'ve Paid\" when done.');
      state.exchangeView = 'my';
      loadMyTrades();
    } else {
      var err = ''; try { err = await res.text(); } catch(e) {}
      showToast('Error: ' + (err || 'unknown'), 'error');
    }
  } catch(e) { showToast('Error: ' + (e.message || ''), 'error'); }
}

async function markPaymentSent(tradeId) {
  if (!confirm('Confirm you have sent payment to the seller?')) return;
  try {
    await apiRequest('p2p_trades?id=eq.' + tradeId, { method: 'PATCH', body: JSON.stringify({ status: 'payment_sent', payment_sent_at: new Date().toISOString() }) });
    showToast('Marked as paid. Waiting for seller to confirm.');
    setMuxi('Payment sent. Now we wait for the seller to confirm.');
    loadMyTrades();
  } catch(e) { showToast('Error: ' + (e.message || ''), 'error'); }
}

async function confirmPaymentReceived(tradeId) {
  if (!confirm('Confirm you received payment? MV will release to the buyer immediately.')) return;
  try {
    setMuxi('Releasing escrow...');
    var trade = (state.myTrades || []).find(function(t) { return t.id === tradeId; });
    if (!trade) return showToast('Trade not found', 'error');

    /* Transfer MV from seller to buyer */
    var fee = Math.ceil(trade.amount_mv * 0.02);
    var buyerAmount = trade.amount_mv - fee;

    /* Deduct from seller */
    await apiRequest('rpc/transfer_mv_p2p', {
      method: 'POST',
      body: JSON.stringify({ p_seller_id: trade.seller_id, p_buyer_id: trade.buyer_id, p_amount: trade.amount_mv, p_fee: fee })
    });

    /* Mark trade complete */
    await apiRequest('p2p_trades?id=eq.' + tradeId, { method: 'PATCH', body: JSON.stringify({ status: 'completed', completed_at: new Date().toISOString() }) });

    /* Close the offer */
    if (trade.offer_id) {
      await apiRequest('p2p_offers?id=eq.' + trade.offer_id, { method: 'PATCH', body: JSON.stringify({ status: 'completed' }) });
    }

    closeModal();
    showToast('Trade complete! ' + buyerAmount + ' MV released to buyer. ' + fee + ' MV fee.');
    setMuxi('Trade done. The exchange grows stronger.');
    loadMyTrades();
    loadP2POffers();
  } catch(e) { showToast('Error: ' + (e.message || ''), 'error'); }
}

function openDisputeModal(tradeId) {
  openModal(
    '<div class="card p-6" style="max-width:440px;margin:auto">' +
      '<div class="flex justify-between items-center mb-3"><h2 class="text-xl font-black" style="color:var(--red)"><i class="fas fa-exclamation-triangle mr-2"></i>Open Dispute</h2><button onclick="closeModal()" class="close-btn">&times;</button></div>' +
      '<p class="text-sm mb-4" style="color:var(--text-dim)">Describe the issue. Upload payment proof if available. Our team will review within 24 hours.</p>' +
      '<textarea id="dispute-reason" placeholder="What went wrong?" rows="3" maxlength="500" class="field mb-3" style="resize:none"></textarea>' +
      '<button onclick="handleDispute(\'' + tradeId + '\')" class="btn-primary rounded-full" style="background:var(--red)">Submit Dispute</button>' +
    '</div>'
  );
}

async function handleDispute(tradeId) {
  var reason = (getEl('dispute-reason') || {}).value;
  if (!reason) return showToast('Describe the issue', 'error');
  try {
    await apiRequest('p2p_trades?id=eq.' + tradeId, { method: 'PATCH', body: JSON.stringify({ status: 'disputed', dispute_reason: reason }) });
    closeModal();
    showToast('Dispute submitted. We will review and resolve within 24 hours.');
    setMuxi('Dispute logged. Hang tight — fairness is non-negotiable.');
    loadMyTrades();
  } catch(e) { showToast('Error: ' + (e.message || ''), 'error'); }
}
