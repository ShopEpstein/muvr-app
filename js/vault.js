function renderWalletTab() {
  var c = getEl('tab-content');
  if (!c) return;
  var bal = (state.profile && state.profile.mv_balance) || 0;

  c.innerHTML = '<div class="fade-up">' +
    '<h1 class="text-3xl font-black mb-2">' + muxiSVGSmall(28) + ' MUVR™ Vault</h1>' +
    '<p class="text-sm mb-6" style="color:rgba(232,236,241,0.62)">MV are in-platform credits used for escrow and marketplace flows. Not currency.</p>' +

    /* Network Stats */
    '<div class="card p-5 mb-5 shimmer-border border-glow" style="border-color:rgba(24,246,200,0.14);background:linear-gradient(135deg,rgba(24,246,200,0.08),rgba(124,92,255,0.06),rgba(255,61,154,0.04))">' +
      '<p class="text-[10px] tracking-widest font-black mb-3" style="color:rgba(232,236,241,0.55)">NETWORK STATUS</p>' +
      '<div class="grid grid-cols-3 sm:grid-cols-6 gap-3 text-center">' +
        '<div class="scale-in"><p class="text-[10px] font-black" style="color:rgba(232,236,241,0.45)">CAP</p><p class="text-lg font-black mono glow-text" style="color:var(--accent)">10M</p></div>' +
        '<div class="scale-in" style="animation-delay:0.05s"><p class="text-[10px] font-black" style="color:rgba(232,236,241,0.45)">MINTED</p><p class="text-lg font-black mono" style="color:var(--accent)" id="stat-minted">-</p></div>' +
        '<div class="scale-in" style="animation-delay:0.10s"><p class="text-[10px] font-black" style="color:rgba(232,236,241,0.45)">AVAILABLE</p><p class="text-lg font-black mono" style="color:var(--accent-3)" id="stat-available">-</p></div>' +
        '<div class="scale-in" style="animation-delay:0.15s"><p class="text-[10px] font-black" style="color:rgba(232,236,241,0.45)">CIRCULATING</p><p class="text-lg font-black mono" style="color:var(--accent-2)" id="stat-circulating">-</p></div>' +
        '<div class="scale-in" style="animation-delay:0.20s"><p class="text-[10px] font-black" style="color:rgba(232,236,241,0.45)">ESCROWED</p><p class="text-lg font-black mono" style="color:var(--yellow)" id="stat-escrowed">-</p></div>' +
        '<div class="scale-in" style="animation-delay:0.25s"><p class="text-[10px] font-black" style="color:rgba(232,236,241,0.45)">RETIRED</p><p class="text-lg font-black mono" style="color:var(--red)" id="stat-burned">-</p></div>' +
      '</div>' +
    '</div>' +

    /* Balance Card */
    '<div class="card p-5 max-w-md mb-6 border-glow">' +
      '<p class="text-[10px] tracking-widest font-black mb-2" style="color:rgba(232,236,241,0.55)">YOUR BALANCE</p>' +
      '<div class="flex items-end justify-between mb-5">' +
        '<p class="text-4xl font-black mono" style="color:var(--accent)" id="balance-display">' + (state.balanceVisible ? bal + ' <span style="color:var(--accent)">MV</span>' : '------') + '</p>' +
        '<button onclick="toggleBalance()" class="text-xs font-black cursor-pointer" style="color:rgba(232,236,241,0.55);background:none;border:none;text-transform:uppercase">' + (state.balanceVisible ? 'Hide' : 'Show') + '</button>' +
      '</div>' +
      '<div class="grid grid-cols-3 gap-3">' +
        '<button onclick="openSendModal()" class="btn-pill btn-pill-ghost w-full justify-center">MUVE</button>' +
        '<button onclick="openLoadModal()" class="btn-pill btn-pill-accent w-full justify-center">Fund</button>' +
        '<button onclick="openCashoutModal()" class="btn-pill btn-pill-ghost w-full justify-center">Payout</button>' +
      '</div>' +
      '<div class="mt-4 text-[11px]" style="color:rgba(232,236,241,0.50)">Note: Load and Payout are partner-integrated features (beta). If not enabled, safe stubs are used.</div>' +
    '</div>' +

    /* Adaptive Retirement Rate */
    '<div class="card p-4 mb-5" style="border-color:rgba(255,61,154,0.14)">' +
      '<div class="flex justify-between items-center">' +
        '<div>' +
          '<p class="text-[10px] tracking-widest font-black mb-1" style="color:rgba(232,236,241,0.55)">CURRENT RETIREMENT RATE</p>' +
          '<p class="text-sm" style="color:var(--text-mid)">Credits retired per mission posting</p>' +
        '</div>' +
        '<p class="text-2xl font-black mono" style="color:var(--accent-3)" id="retirement-rate" data-testid="text-retirement-rate">-</p>' +
      '</div>' +
      '<p class="text-[10px] mt-2" style="color:var(--text-dim)">Rate adapts based on circulating supply: 0.5 → 0.25 → 0.10 → 0.05 → 0.01 MV as supply decreases.</p>' +
    '</div>' +

    /* Credit Lockup Section */
    '<div class="card p-5 mb-5" style="border-color:rgba(124,92,255,0.14)">' +
      '<p class="text-[10px] tracking-widest font-black mb-2" style="color:rgba(232,236,241,0.55)">CREDIT LOCKUP</p>' +
      '<p class="text-sm mb-3" style="color:var(--text-mid)">Lock MV to signal commitment and get priority matching boosts.</p>' +
      '<div id="lockup-list" class="mb-3"><p class="text-[10px]" style="color:var(--text-dim)">Loading lockups...</p></div>' +
      '<div class="grid grid-cols-2 gap-2">' +
        '<button onclick="openLockupModal()" class="btn-pill btn-pill-ghost text-xs" data-testid="button-lock-credits"><i class="fas fa-lock mr-1"></i>Lock Credits</button>' +
        '<button onclick="checkUnlockable()" class="btn-pill btn-pill-ghost text-xs" data-testid="button-unlock-credits"><i class="fas fa-unlock mr-1"></i>Unlock Matured</button>' +
      '</div>' +
      '<p class="text-[10px] mt-2" style="color:var(--text-dim)">Boost: 30d=1.1x | 90d=1.25x | 180d=1.5x | 365d=2.0x priority. Min 10 MV. No yield — this is a commitment signal, not an investment.</p>' +
    '</div>' +

    /* Network Health Widget */
    '<div class="card p-5 mb-5" style="border-color:rgba(24,246,200,0.14)">' +
      '<p class="text-[10px] tracking-widest font-black mb-2" style="color:rgba(232,236,241,0.55)">NETWORK HEALTH</p>' +
      '<div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center" id="network-health-grid" data-testid="widget-network-health">' +
        '<div><p class="text-[10px] font-black" style="color:rgba(232,236,241,0.45)">ACTIVE USERS (7d)</p><p class="text-lg font-black mono" style="color:var(--accent)" id="health-active-users">-</p></div>' +
        '<div><p class="text-[10px] font-black" style="color:rgba(232,236,241,0.45)">ACTIVE AGENTS</p><p class="text-lg font-black mono" style="color:var(--accent-2)" id="health-active-agents">-</p></div>' +
        '<div><p class="text-[10px] font-black" style="color:rgba(232,236,241,0.45)">MISSIONS (7d)</p><p class="text-lg font-black mono" style="color:var(--accent-3)" id="health-missions-7d">-</p></div>' +
        '<div><p class="text-[10px] font-black" style="color:rgba(232,236,241,0.45)">ECOSYSTEM POOL</p><p class="text-lg font-black mono" style="color:var(--yellow)" id="health-pool-balance">-</p></div>' +
      '</div>' +
      '<div class="flex items-center gap-2 mt-3">' +
        '<span class="w-2 h-2 rounded-full" id="health-indicator" style="background:var(--accent)"></span>' +
        '<span class="text-[10px] font-black" id="health-status" style="color:var(--accent)" data-testid="text-health-status">Checking...</span>' +
      '</div>' +
    '</div>' +

    /* Personal Ledger */
    '<h2 class="font-black mb-3">Your Ledger (recent)</h2>' +
    '<div id="ledger-list"><p class="text-sm py-4" style="color:var(--text-dim)">Loading...</p></div>' +
  '</div>';
}

function toggleBalance() {
  state.balanceVisible = !state.balanceVisible;
  var bal = (state.profile && state.profile.mv_balance) || 0;
  var bd = getEl('balance-display');
  if (bd) bd.innerHTML = state.balanceVisible ? (bal + ' <span style="color:var(--accent)">MV</span>') : '------';
  document.querySelectorAll('[onclick="toggleBalance()"]').forEach(function(b) { b.textContent = state.balanceVisible ? 'Hide' : 'Show'; });
}

async function loadWalletData() {
  if (!state.user) return;
  try {
    var balRes = await apiRequest('users?id=eq.' + state.user.id + '&select=mv_balance');
    if (balRes && balRes.ok) {
      var d = await balRes.json();
      if (d && d.length) state.profile = Object.assign(state.profile || {}, { mv_balance: d[0].mv_balance });
    }
  } catch(e) {}

  var bd = getEl('balance-display');
  if (bd) bd.innerHTML = state.balanceVisible ? ((state.profile && state.profile.mv_balance || 0) + ' <span style="color:var(--accent)">MV</span>') : '------';

  /* Load personal ledger */
  var el = getEl('ledger-list');
  try {
    var res = await apiRequest('mv_ledger?user_id=eq.' + state.user.id + '&order=created_at.desc&limit=25');
    var ledger = (res && res.ok) ? await res.json() : [];
    if (!el) return;
    if (!ledger.length) { el.innerHTML = '<p class="text-sm py-4" style="color:var(--text-dim)">No transactions yet. Post or complete a mission to see activity here.</p>'; return; }

    el.innerHTML = ledger.map(function(e) {
      var neg = ['burn','send','withdrawal'].indexOf(e.type) >= 0;
      var typeEmoji = { load:'&#128229;', send:'&#128228;', receive:'&#128232;', burn:'&#128293;', mint:'&#128994;', withdrawal:'&#127974;', escrow_lock:'&#128274;', escrow_release:'&#128275;' };
      var icon = typeEmoji[e.type] || '&#128202;';
      var color = neg ? 'var(--red)' : 'var(--accent)';
      var sign = neg ? '-' : '+';
      var isMint = e.type === 'mint';
      var txHash = e.tx_hash || '';

      return '<div class="card p-3 mb-2 flex justify-between items-start" style="border-left:3px solid ' + (neg ? 'var(--red)' : isMint ? 'var(--accent)' : 'rgba(24,246,200,0.65)') + '">' +
        '<div class="flex items-start gap-3">' +
          '<span class="text-base">' + icon + '</span>' +
          '<div>' +
            '<p class="font-black text-xs" style="text-transform:capitalize">' + escapeHtml(e.type || '') + '</p>' +
            '<p class="text-[11px]" style="color:var(--text-dim)">' + escapeHtml(e.description || '') + '</p>' +
            (isMint ? '<p class="text-[10px] mt-0.5" style="color:var(--accent)"><i class="fab fa-stripe-s mr-1"></i>Stripe verified | TX: ' + escapeHtml(txHash.slice(0,20)) + '</p>' : '') +
            '<p class="text-[10px] mt-1" style="color:rgba(232,236,241,0.38)">' + relTime(e.created_at) + '</p>' +
          '</div>' +
        '</div>' +
        '<p class="mono font-black text-xs whitespace-nowrap ml-2" style="color:' + color + '">' + sign + Number(e.amount_mv || 0) + ' <span style="color:var(--accent)">MV</span></p>' +
      '</div>';
    }).join('');
  } catch(e) { if (el) el.innerHTML = '<p class="text-sm py-4" style="color:var(--text-dim)">Ledger unavailable right now.</p>'; }
}

function openTipModal(jobId) {
  openModal(
    '<div class="card p-6" style="max-width:400px;margin:auto">' +
      '<div class="flex justify-between items-center mb-3"><h2 class="text-xl font-black"><i class="fas fa-heart mr-2" style="color:var(--accent-3)"></i>Send Tip</h2><button onclick="closeModal()" class="close-btn">&times;</button></div>' +
      '<p class="text-sm mb-4" style="color:var(--text-dim)">Show appreciation for great work. Tips go directly to the worker.</p>' +
      '<div class="grid grid-cols-4 gap-2 mb-3">' +
        '<button onclick="setTipAmount(1)" class="btn-pill btn-pill-ghost text-xs">1 MV</button>' +
        '<button onclick="setTipAmount(5)" class="btn-pill btn-pill-ghost text-xs">5 MV</button>' +
        '<button onclick="setTipAmount(10)" class="btn-pill btn-pill-ghost text-xs">10 MV</button>' +
        '<button onclick="setTipAmount(25)" class="btn-pill btn-pill-ghost text-xs">25 MV</button>' +
      '</div>' +
      '<input id="tip-amount" type="number" min="0.5" max="100" step="0.5" placeholder="Custom amount (0.5-100 MV)" class="field mb-3" data-testid="input-tip-amount">' +
      '<input type="hidden" id="tip-job-id" value="' + jobId + '">' +
      '<button onclick="sendTip()" class="btn-primary rounded-full" data-testid="button-send-tip"><i class="fas fa-paper-plane mr-2"></i>Send Tip</button>' +
      '<p class="text-[10px] mt-2" style="color:var(--text-dim)">Tips are recorded on the public ledger. No fees on tips.</p>' +
    '</div>'
  );
}

function setTipAmount(amt) {
  var el = getEl('tip-amount');
  if (el) el.value = amt;
}

async function sendTip() {
  var amt = parseFloat((getEl('tip-amount') || {}).value) || 0;
  var jobId = (getEl('tip-job-id') || {}).value || null;
  if (amt < 0.5 || amt > 100) return showToast('Tip must be 0.5 to 100 MV', 'error');
  var bal = Number((state.profile && state.profile.mv_balance) || 0);
  if (bal < amt) return showToast('Not enough MV', 'error');

  try {
    setMuxi('Sending tip...');
    var jobRes = await apiRequest('jobs?id=eq.' + jobId + '&select=poster_id,status');
    var jobData = (jobRes && jobRes.ok) ? await jobRes.json() : [];
    if (!jobData.length) return showToast('Job not found', 'error');

    var appRes = await apiRequest('applications?job_id=eq.' + jobId + '&status=in.(paid,completed)&select=worker_id');
    var appData = (appRes && appRes.ok) ? await appRes.json() : [];

    var recipientId = null;
    if (jobData[0].poster_id === state.user.id && appData.length) {
      recipientId = appData[0].worker_id;
    } else {
      recipientId = jobData[0].poster_id;
    }
    if (!recipientId || recipientId === state.user.id) return showToast('Cannot determine recipient', 'error');

    var res = await apiRequest('rpc/send_tip', {
      method: 'POST',
      body: JSON.stringify({ p_from_id: state.user.id, p_to_id: recipientId, p_amount: amt, p_job_id: jobId })
    });
    if (res && res.ok) {
      state.profile.mv_balance = bal - amt;
      closeModal();
      showToast('Tip sent! ' + amt + ' MV');
      setMuxi('Generosity detected. The network thanks you.');
      if (state.currentTab === 'wallet') { renderWalletTab(); loadWalletData(); computeNetworkStats(); }
    } else {
      var errText = ''; try { errText = await res.text(); } catch(e) {}
      showToast('Tip failed: ' + (errText || 'unknown'), 'error');
    }
  } catch(e) { showToast('Tip failed: ' + (e.message || ''), 'error'); console.error('Tip error:', e); }
}

function openLockupModal() {
  openModal(
    '<div class="card p-6" style="max-width:420px;margin:auto">' +
      '<div class="flex justify-between items-center mb-3"><h2 class="text-xl font-black"><i class="fas fa-lock mr-2" style="color:var(--accent-2)"></i>Lock Credits</h2><button onclick="closeModal()" class="close-btn">&times;</button></div>' +
      '<p class="text-sm mb-4" style="color:var(--text-dim)">Lock MV to signal commitment and get priority matching. This is NOT an investment — there is no yield or interest. Credits are returned when the period ends.</p>' +
      '<input id="lockup-amount" type="number" min="10" max="50000" placeholder="Amount (min 10 MV)" class="field mb-3" data-testid="input-lockup-amount">' +
      '<select id="lockup-duration" class="field mb-3" data-testid="select-lockup-duration">' +
        '<option value="30">30 days (1.1x boost)</option>' +
        '<option value="90">90 days (1.25x boost)</option>' +
        '<option value="180">180 days (1.5x boost)</option>' +
        '<option value="365">365 days (2.0x boost)</option>' +
      '</select>' +
      '<button onclick="lockCredits()" class="btn-primary rounded-full" data-testid="button-confirm-lock"><i class="fas fa-lock mr-2"></i>Lock Credits</button>' +
      '<p class="text-[10px] mt-3" style="color:var(--text-dim)"><strong>Legal:</strong> Credit lockup is a platform feature for priority matching. Locked credits are not earning interest, yield, or returns. MV Credits are platform utility credits, not investments or securities.</p>' +
    '</div>'
  );
}

async function lockCredits() {
  var amt = parseFloat((getEl('lockup-amount') || {}).value) || 0;
  var dur = parseInt((getEl('lockup-duration') || {}).value) || 30;
  if (amt < 10) return showToast('Minimum lockup is 10 MV', 'error');
  var bal = Number((state.profile && state.profile.mv_balance) || 0);
  if (bal < amt) return showToast('Not enough MV', 'error');

  try {
    setMuxi('Locking credits...');
    var res = await apiRequest('rpc/lock_credits', {
      method: 'POST',
      body: JSON.stringify({ p_user_id: state.user.id, p_amount: amt, p_duration_days: dur })
    });
    if (res && res.ok) {
      state.profile.mv_balance = bal - amt;
      closeModal();
      showToast('Locked ' + amt + ' MV for ' + dur + ' days!');
      setMuxi('Commitment locked. Priority boost activated.');
      if (state.currentTab === 'wallet') { renderWalletTab(); loadWalletData(); loadLockups(); }
    } else {
      var errText = ''; try { errText = await res.text(); } catch(e) {}
      showToast('Lock failed: ' + (errText || 'unknown'), 'error');
    }
  } catch(e) { showToast('Lock failed: ' + (e.message || ''), 'error'); }
}

async function loadLockups() {
  var el = getEl('lockup-list');
  if (!el || !state.user) return;
  try {
    var res = await apiRequest('credit_lockups?user_id=eq.' + state.user.id + '&status=eq.active&order=unlocks_at.asc');
    var lockups = (res && res.ok) ? await res.json() : [];
    if (!lockups.length) {
      el.innerHTML = '<p class="text-[10px]" style="color:var(--text-dim)">No active lockups. Lock credits to get priority matching boosts.</p>';
      return;
    }
    el.innerHTML = lockups.map(function(l) {
      var daysLeft = Math.max(0, Math.ceil((new Date(l.unlocks_at) - Date.now()) / 86400000));
      var boost = l.priority_boost || 1;
      return '<div class="flex justify-between items-center p-2 rounded-lg mb-1" style="background:rgba(124,92,255,0.06);border:1px solid rgba(124,92,255,0.12)">' +
        '<div><span class="text-xs font-black" style="color:var(--accent-2)">' + Number(l.amount_mv) + ' MV</span><span class="text-[10px] ml-2" style="color:var(--text-dim)">' + l.lock_duration_days + 'd lockup</span></div>' +
        '<div class="text-right"><span class="text-[10px] font-black" style="color:var(--accent)">' + boost + 'x boost</span><br><span class="text-[10px]" style="color:var(--text-dim)">' + daysLeft + ' days left</span></div>' +
      '</div>';
    }).join('');
  } catch(e) { if (el) el.innerHTML = '<p class="text-[10px]" style="color:var(--text-dim)">Could not load lockups.</p>'; }
}

async function checkUnlockable() {
  try {
    var res = await apiRequest('credit_lockups?user_id=eq.' + state.user.id + '&status=eq.active&unlocks_at=lte.' + new Date().toISOString());
    var matured = (res && res.ok) ? await res.json() : [];
    if (!matured.length) { showToast('No matured lockups to unlock', 'info'); return; }

    for (var i = 0; i < matured.length; i++) {
      var unlockRes = await apiRequest('rpc/unlock_credits', {
        method: 'POST',
        body: JSON.stringify({ p_user_id: state.user.id, p_lockup_id: matured[i].id })
      });
      if (unlockRes && unlockRes.ok) {
        showToast('Unlocked ' + Number(matured[i].amount_mv) + ' MV!');
      }
    }
    loadProfileSafe();
    if (state.currentTab === 'wallet') { renderWalletTab(); loadWalletData(); loadLockups(); }
  } catch(e) { showToast('Unlock failed: ' + (e.message || ''), 'error'); }
}

async function loadNetworkHealth() {
  try {
    var res = await apiRequest('rpc/get_network_health', { method: 'POST', body: '{}' });
    if (res && res.ok) {
      var h = await res.json();
      function fmtN(n) { n = Number(n) || 0; return n >= 1000 ? (n/1000).toFixed(1) + 'K' : String(Math.round(n)); }

      var el;
      el = getEl('health-active-users'); if (el) el.textContent = fmtN(h.active_users_7d);
      el = getEl('health-active-agents'); if (el) el.textContent = fmtN(h.active_agents);
      el = getEl('health-missions-7d'); if (el) el.textContent = fmtN(h.missions_completed_7d);
      el = getEl('health-pool-balance'); if (el) el.textContent = fmtN(h.ecosystem_pool_balance) + ' MV';

      var indicator = getEl('health-indicator');
      var status = getEl('health-status');
      var healthy = h.ledger_audit && h.ledger_audit.healthy;
      if (indicator) indicator.style.background = healthy ? 'var(--accent)' : 'var(--red)';
      if (status) {
        status.textContent = healthy ? 'Ledger Healthy' : 'Discrepancy Detected';
        status.style.color = healthy ? 'var(--accent)' : 'var(--red)';
      }
    }
  } catch(e) { console.warn('Network health load failed:', e); }
}

async function loadRetirementRate() {
  try {
    var res = await apiRequest('rpc/get_retirement_rate', { method: 'POST', body: '{}' });
    if (res && res.ok) {
      var rate = await res.json();
      var el = getEl('retirement-rate');
      if (el) el.textContent = Number(rate) + ' MV';
    }
  } catch(e) {
    var el = getEl('retirement-rate');
    if (el) el.textContent = '0.50 MV';
  }
}

function openSendModal() {
  openModal(
    '<div class="card p-6" style="max-width:420px;margin:auto">' +
      '<div class="flex justify-between items-center mb-4"><h2 class="text-xl font-black"><i class="fas fa-paper-plane mr-2" style="color:var(--accent)"></i>MUVE Credits</h2><button onclick="closeModal()" class="close-btn">&times;</button></div>' +
      '<div style="position:relative"><input id="send-to" type="text" placeholder="@handle, email, or muvr_alias" class="field" autocomplete="off"></div>' +
      '<div class="text-[10px] mb-3 mt-1" style="color:var(--text-dim)">Start typing to see suggestions</div>' +
      '<input id="send-amount" type="number" min="1" placeholder="Amount (MV)" class="field mb-3">' +
      '<label class="flex items-center gap-3 cursor-pointer p-3 rounded-2xl mb-4" style="background:rgba(124,92,255,0.08);border:1px solid rgba(124,92,255,0.18)">' +
        '<input type="checkbox" id="send-stealth" class="w-4 h-4">' +
        '<div>' +
          '<span class="text-sm font-black" style="color:var(--accent-2)"><i class="fas fa-ghost mr-1"></i>Stealth Mode</span>' +
          '<p class="text-[10px] mt-0.5" style="color:var(--text-dim)">Transfer won\'t appear on the public Network Feed. Still recorded in your private ledger for audit.</p>' +
        '</div>' +
      '</label>' +
      '<button onclick="handleSend()" class="btn-primary rounded-full">Send</button>' +
      '<div class="mt-3 text-[11px]" style="color:var(--text-dim)">MV are platform credits. All transfers are logged internally. Public feed shows aliases only (unless stealth).</div>' +
    '</div>'
  );
  setTimeout(function() { setupUserAutocomplete('send-to'); }, 100);
}

function openLoadModal() {
  var stripeKey = window.STRIPE_PK || null;
  var hasStripe = !!stripeKey;

  var tiles = [5, 10, 25, 50, 100, 250].map(function(n) {
    var onclick = 'initStripeMint(' + n + ')';
    return '<button onclick="' + onclick + '" class="btn-secondary py-4 text-center rounded-2xl hover:border-[rgba(24,246,200,0.35)] transition-all" style="position:relative;overflow:hidden">' +
      '<div class="text-lg font-black">$' + n + '</div>' +
      '<div class="text-xs font-black mt-1" style="color:var(--accent)">' + n + ' MV</div>' +
      (hasStripe ? '<div class="text-[9px] mt-1" style="color:var(--text-dim)">Stripe</div>' : '') +
    '</button>';
  }).join('');

  openModal(
    '<div class="card p-6" style="max-width:440px;margin:auto">' +
      '<div class="flex justify-between items-center mb-3"><h2 class="text-xl font-black"><i class="fas fa-vault mr-2" style="color:var(--accent)"></i>Fund Vault</h2><button onclick="closeModal()" class="close-btn">&times;</button></div>' +
      '<p class="text-sm mb-4" style="color:var(--text-dim)">Select an amount to add to your vault. 1 MV = $1 USD reference value.</p>' +
      '<div class="grid grid-cols-3 gap-3 mb-4">' + tiles + '</div>' +

      /* Custom amount */
      '<div class="flex gap-2 mb-4">' +
        '<input id="custom-mint-amount" type="number" min="1" max="10000" placeholder="Custom amount" class="field flex-1">' +
        '<button onclick="' + (hasStripe ? 'initStripeMint(parseInt(getEl(\'custom-mint-amount\').value))' : 'initStripeMint(parseInt(getEl(\'custom-mint-amount\').value))') + '" class="btn-pill btn-pill-accent">Fund</button>' +
      '</div>' +

      (hasStripe ?
        '<div class="flex items-center gap-2 p-3 rounded-xl mb-3" style="background:rgba(24,246,200,0.06);border:1px solid rgba(24,246,200,0.16)">' +
          '<i class="fas fa-lock text-xs" style="color:var(--accent)"></i>' +
          '<span class="text-[11px] font-bold" style="color:var(--accent)">Payments secured by Stripe</span>' +
        '</div>' :
        '<div class="flex items-center gap-2 p-3 rounded-xl mb-3" style="background:rgba(255,215,0,0.06);border:1px solid rgba(255,215,0,0.16)">' +
          '<i class="fas fa-flask text-xs" style="color:var(--yellow)"></i>' +
          '<span class="text-[11px] font-bold" style="color:var(--yellow)">Payment rails being configured. Earn MV by completing missions or buy on the P2P Exchange.</span>' +
        '</div>'
      ) +

      '<div class="text-[10px]" style="color:var(--text-dim)">' +
        '<strong>Legal:</strong> MUVR Credits (MV) are in-platform credits for marketplace use only. Not legal tender, not a security, not a cryptocurrency. 1 MV = $1 USD intended internal pricing equivalence, subject to Terms.' +
      '</div>' +
    '</div>'
  );
}

/* Stripe Checkout integration - requires STRIPE_PK env var and Supabase Edge Function */
async function initStripeMint(amount) {
  amount = parseInt(amount);
  if (!amount || amount < 1 || amount > 10000) { showToast('Enter an amount between 1 and 10,000', 'error'); return; }
  if (!window.STRIPE_PK) { showToast('Payment rails not yet configured. Earn MV by completing missions or buy on the P2P Exchange.', 'info'); return; }

  try {
    setMuxi('Opening secure checkout for ' + amount + ' MV...');
    /* Call Supabase Edge Function to create Stripe Checkout session */
    var res = await fetch(SUPA_URL + '/functions/v1/create-checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + state.accessToken
      },
      body: JSON.stringify({
        amount_mv: amount,
        success_url: window.location.origin + window.location.pathname + '?mint_success=1',
        cancel_url: window.location.origin + window.location.pathname + '?mint_cancel=1'
      })
    });

    if (!res.ok) {
      var errText = ''; try { errText = await res.text(); } catch(e) {}
      throw new Error('Checkout failed: ' + (errText || res.status));
    }

    var data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      throw new Error('No checkout URL returned');
    }
  } catch(e) {
    console.error('Stripe mint error:', e);
    showToast('Payment setup failed: ' + (e.message || 'unknown error'), 'error');
    setMuxi('Payment hiccup. Try again or contact support.');
  }
}

function openCashoutModal() {
  openModal(
    '<div class="card p-6" style="max-width:420px;margin:auto">' +
      '<div class="flex justify-between items-center mb-4"><h2 class="text-xl font-black">Payout (beta)</h2><button onclick="closeModal()" class="close-btn">&times;</button></div>' +
      '<input id="cashout-amount" type="number" min="1" placeholder="Amount (MV)" class="field mb-3" oninput="updateCashoutDisplay()">' +
      '<div class="p-4 rounded-2xl text-sm mb-4" style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.10)">' +
        '<div class="flex justify-between"><span style="color:rgba(232,236,241,0.55)">Estimated receive</span><span class="font-black" style="color:var(--accent)" id="cashout-receive">$0.00</span></div>' +
        '<div class="flex justify-between text-xs mt-1"><span style="color:rgba(232,236,241,0.55)">Fee (0.5%)</span><span style="color:var(--red)" class="font-black" id="cashout-fee">$0.00</span></div>' +
      '</div>' +
      '<button onclick="handleCashout()" class="btn-primary rounded-full">Request payout</button>' +
      '<div class="mt-4 text-[11px]" style="color:var(--text-dim)">Staged feature. If payout rails are not enabled, a ledger entry is recorded safely. Withdrawals subject to verification and provider terms.</div>' +
    '</div>'
  );
}

function updateCashoutDisplay() {
  var amt = parseFloat((getEl('cashout-amount') || {}).value) || 0;
  var fee = amt * 0.005; var recv = amt - fee;
  var re = getEl('cashout-receive'); var fe = getEl('cashout-fee');
  if (re) re.textContent = '$' + recv.toFixed(2);
  if (fe) fe.textContent = '$' + fee.toFixed(2);
}

async function handleSend() {
  var to = ((getEl('send-to') || {}).value || '').trim().toLowerCase();
  var amt = parseFloat((getEl('send-amount') || {}).value) || 0;
  if (!to) return showToast('Enter recipient', 'error');
  if (amt < 1) return showToast('Enter amount', 'error');
  var bal = Number((state.profile && state.profile.mv_balance) || 0);
  if (bal < amt) return showToast('Not enough MV', 'error');
  try {
    var enc = encodeURIComponent(to);
    var look = await apiRequest('users?or=(email.eq.' + enc + ',username.eq.' + enc + ')&select=id');
    var ld = (look && look.ok) ? await look.json() : [];
    if (!ld.length) {
      var aliasLook = await apiRequest('mv_aliases?public_alias=eq.' + enc + '&select=user_id');
      var ad = (aliasLook && aliasLook.ok) ? await aliasLook.json() : [];
      if (!ad.length) return showToast('User not found', 'error');
      ld = [{ id: ad[0].user_id }];
    }
    var rid = ld[0].id;
    if (rid === state.user.id) return showToast('Cannot send to yourself', 'error');
    var txh = 'TX' + Date.now() + Math.random().toString(36).slice(2, 8);
    setMuxi('Sending MV...');
    var rpcRes = await apiRequest('rpc/transfer_mv', {
      method: 'POST',
      body: JSON.stringify({ p_from_id: state.user.id, p_to_id: rid, p_amount: amt, p_tx_hash: txh })
    });
    if (rpcRes && rpcRes.ok) {
      state.profile.mv_balance = bal - amt;
      var stealth = !!(getEl('send-stealth') || {}).checked;
      if (!stealth) {
        try { await publishEvent('transfer', amt, txh, state.user.id, rid, null); } catch(pe) {}
      }
      closeModal(); showToast('Sent ' + amt + ' MV!');
      setMuxi(muxiQuip('send'));
      if (state.currentTab === 'wallet') { renderWalletTab(); loadWalletData(); computeNetworkStats(); }
    } else {
      var errText = ''; try { errText = await rpcRes.text(); } catch(e) {}
      showToast('Transfer failed: ' + (errText || 'Server error'), 'error');
      setMuxi(muxiQuip('error'));
    }
  } catch(e) { showToast('Transfer failed: ' + (e.message || ''), 'error'); console.error('Send error:', e); }
}

async function handleCashout() {
  var amt = parseFloat((getEl('cashout-amount') || {}).value) || 0;
  if (amt < 1) return showToast('Enter amount', 'error');
  var bal = Number((state.profile && state.profile.mv_balance) || 0);
  if (bal < amt) return showToast('Not enough MV', 'error');
  try {
    var res = await apiRequest('rpc/request_cashout', {
      method: 'POST',
      body: JSON.stringify({ p_user_id: state.user.id, p_amount: amt })
    });
    if (res && res.ok) {
      state.profile.mv_balance = bal - amt;
      closeModal(); showToast('Payout requested (beta).');
      if (state.currentTab === 'wallet') { renderWalletTab(); loadWalletData(); computeNetworkStats(); }
    } else {
      var errText = ''; try { errText = await res.text(); } catch(e) {}
      showToast('Payout failed: ' + (errText || 'unknown'), 'error');
    }
  } catch(e) { showToast('Payout failed: ' + (e.message || ''), 'error'); }
}
