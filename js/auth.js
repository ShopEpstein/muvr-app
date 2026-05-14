function openAuthModal() {
  openModal(
    '<div class="card p-6 sm:p-8" style="max-width:440px;margin:auto">' +
      '<div class="flex justify-between items-center mb-2">' +
        '<h2 class="text-xl font-black">Enter MUVR</h2>' +
        '<button onclick="closeModal()" class="close-btn">&times;</button>' +
      '</div>' +
      '<p class="text-sm mb-5" style="color:rgba(232,236,241,0.65)">Zero commission. Escrow-first. Level up with every mission.</p>' +

      /* Social sign-in buttons */
      '<div class="space-y-2 mb-4">' +
        '<button onclick="socialSignIn(\'google\')" class="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-full font-black text-sm" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);color:var(--text-bright)">' +
          '<svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>' +
          'Continue with Google' +
        '</button>' +
        '<button onclick="socialSignIn(\'apple\')" class="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-full font-black text-sm" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);color:var(--text-bright)">' +
          '<i class="fab fa-apple text-lg"></i>Continue with Apple' +
        '</button>' +
        '<div class="flex gap-2">' +
          '<button onclick="socialSignIn(\'facebook\')" class="flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-full font-black text-xs" style="background:rgba(66,103,178,0.15);border:1px solid rgba(66,103,178,0.25);color:#8b9dc3">' +
            '<i class="fab fa-facebook"></i>Facebook' +
          '</button>' +
          '<button onclick="socialSignIn(\'twitter\')" class="flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-full font-black text-xs" style="background:rgba(29,161,242,0.15);border:1px solid rgba(29,161,242,0.25);color:#6bbaed">' +
            '<i class="fab fa-x-twitter"></i>X / Twitter' +
          '</button>' +
        '</div>' +
      '</div>' +

      '<div class="flex items-center gap-3 mb-4">' +
        '<div class="flex-1 h-px" style="background:rgba(255,255,255,0.10)"></div>' +
        '<span class="text-[10px] font-black" style="color:var(--text-dim)">OR EMAIL</span>' +
        '<div class="flex-1 h-px" style="background:rgba(255,255,255,0.10)"></div>' +
      '</div>' +

      '<input id="auth-email" type="email" placeholder="you@email.com" class="field mb-3" autocomplete="email">' +
      '<input id="auth-password" type="password" placeholder="Password (6+ chars)" class="field mb-4" autocomplete="current-password">' +
      '<button onclick="handleSignUp()" class="btn-primary mb-2 rounded-full">Create account</button>' +
      '<button onclick="handleSignIn()" class="btn-secondary rounded-full">I already have an account</button>' +
      '<div class="text-center mt-2"><a onclick="openResetPasswordModal()" class="text-xs font-bold cursor-pointer" style="color:var(--accent)">Forgot password?</a></div>' +
      '<p id="auth-error" class="text-xs text-center mt-3 hidden" style="color:#ffd2d2;font-weight:800"></p>' +
      '<div class="mt-5 text-[11px]" style="color:rgba(232,236,241,0.52)">By continuing you agree to our <a onclick="closeModal();setTimeout(openTOSModal,300)" class="cursor-pointer" style="color:var(--accent);text-decoration:underline">Terms of Service</a> and <a onclick="closeModal();setTimeout(openPrivacyModal,300)" class="cursor-pointer" style="color:var(--accent);text-decoration:underline">Privacy Policy</a>. MUVR Credits (MV) are platform credits (not currency).</div>' +
    '</div>'
  );
}

function showAuthError(msg) {
  var el = getEl('auth-error'); if (!el) return;
  el.textContent = msg; el.classList.remove('hidden');
  setTimeout(function() { el.classList.add('hidden'); }, 5000);
}

function openLegalModal(isReturning) {
  if (isReturning) {
    /* Quick acknowledge for returning users */
    openModal(
      '<div class="card p-6 sm:p-8" style="max-width:480px;margin:auto">' +
        '<div class="text-center mb-4">' + muxiSVG(48) + '</div>' +
        '<h2 class="text-xl font-black text-center mb-3">Welcome Back</h2>' +
        '<div class="p-4 rounded-2xl mb-4" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08)">' +
          '<p class="text-xs" style="color:rgba(232,236,241,0.70)">By continuing, you acknowledge and agree to the MUVR <a onclick="closeModal();setTimeout(openTOSModal,300)" class="cursor-pointer" style="color:var(--accent);text-decoration:underline">Terms of Service</a> and <a onclick="closeModal();setTimeout(openPrivacyModal,300)" class="cursor-pointer" style="color:var(--accent);text-decoration:underline">Privacy Policy</a>.</p>' +
          '<div class="mt-3 text-[10px] space-y-1" style="color:rgba(232,236,241,0.50)">' +
            '<p>• Operatives are independent contractors, not employees</p>' +
            '<p>• MUVR Credits (MV) are platform credits — not currency, crypto, or securities</p>' +
            '<p>• You must be 18 years or older to use this platform</p>' +
            '<p>• P2P trades are between users — MUVR does not process fiat currency</p>' +
          '</div>' +
        '</div>' +
        '<button onclick="handleQuickAcknowledge()" class="btn-primary rounded-full w-full">I Agree & Continue</button>' +
      '</div>',
      { locked: true, width: 'max-w-md' }
    );
  } else {
    /* Full checkbox flow for new signups */
    openModal(
      '<div class="card p-6 sm:p-8" style="max-width:540px;margin:auto">' +
        '<h2 class="text-xl font-black mb-4">Before you start</h2>' +
        '<div class="space-y-3 mb-5">' +
          '<div class="p-4 rounded-2xl" style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.10)">' +
            '<h3 class="font-black text-sm mb-1" style="color:var(--accent)">Marketplace Terms</h3>' +
            '<p class="text-xs" style="color:rgba(232,236,241,0.62)">MUVR is a technology marketplace. MUVR is NOT an employer. You are an independent contractor. <a onclick="closeModal();setTimeout(openTOSModal,300)" class="cursor-pointer" style="color:var(--accent);text-decoration:underline">Read full Terms</a></p>' +
          '</div>' +
          '<div class="p-4 rounded-2xl" style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.10)">' +
            '<h3 class="font-black text-sm mb-1" style="color:var(--accent)">Contractor Agreement</h3>' +
            '<p class="text-xs" style="color:rgba(232,236,241,0.62)">You control your schedule, rates, methods. You are responsible for taxes, insurance, and compliance in your jurisdiction.</p>' +
          '</div>' +
          '<div class="p-4 rounded-2xl" style="background:rgba(24,246,200,0.06);border:1px solid rgba(24,246,200,0.16)">' +
            '<h3 class="font-black text-sm mb-1">MUVR Credits (MV)</h3>' +
            '<p class="text-xs" style="color:rgba(232,236,241,0.70)">MV are platform-limited digital credits used within MUVR for escrow and marketplace flows. Not currency, cryptocurrency, or financial instruments. <a onclick="closeModal();setTimeout(openPrivacyModal,300)" class="cursor-pointer" style="color:var(--accent);text-decoration:underline">Privacy Policy</a></p>' +
          '</div>' +
        '</div>' +
        '<div class="space-y-2 mb-5">' +
          '<label class="flex items-start gap-3 cursor-pointer p-2 rounded-xl hover:opacity-90"><input type="checkbox" id="check-tos" onchange="updateLegalButton()" class="w-4 h-4 mt-0.5"><span class="text-sm font-bold">I accept the Terms of Service & Marketplace Terms</span></label>' +
          '<label class="flex items-start gap-3 cursor-pointer p-2 rounded-xl hover:opacity-90"><input type="checkbox" id="check-contractor" onchange="updateLegalButton()" class="w-4 h-4 mt-0.5"><span class="text-sm font-bold">I accept the Contractor Agreement & Privacy Policy</span></label>' +
          '<label class="flex items-start gap-3 cursor-pointer p-2 rounded-xl hover:opacity-90"><input type="checkbox" id="check-age" onchange="updateLegalButton()" class="w-4 h-4 mt-0.5"><span class="text-sm font-bold">I am 18 years or older</span></label>' +
        '</div>' +
        '<button onclick="handleAcceptLegal()" id="legal-submit-btn" class="btn-secondary rounded-full" disabled>Check all boxes</button>' +
      '</div>',
      { locked: true, width: 'max-w-lg' }
    );
  }
}

function updateLegalButton() {
  var ok = getEl('check-tos') && getEl('check-tos').checked &&
           getEl('check-contractor') && getEl('check-contractor').checked &&
           getEl('check-age') && getEl('check-age').checked;
  var btn = getEl('legal-submit-btn'); if (!btn) return;
  btn.disabled = !ok;
  btn.textContent = ok ? 'I agree & continue' : 'Check all boxes';
  btn.className = ok ? 'btn-primary rounded-full' : 'btn-secondary rounded-full';
}

async function socialSignIn(provider) {
  try {
    closeModal();
    setMuxi('Connecting to ' + provider + '...');
    var redirectUrl = window.location.origin + window.location.pathname;
    var r = await sb.auth.signInWithOAuth({
      provider: provider,
      options: { redirectTo: redirectUrl }
    });
    if (r.error) {
      showToast('Sign in with ' + provider + ' failed: ' + r.error.message, 'error');
      setMuxi('Hmm, ' + provider + ' did not cooperate. Try another method?');
    }
  } catch(e) {
    showToast('Sign in error: ' + (e.message || ''), 'error');
    console.error('socialSignIn error:', e);
  }
}

function openResetPasswordModal() {
  openModal(
    '<div class="card p-6 sm:p-8" style="max-width:440px;margin:auto">' +
      '<div class="flex justify-between items-center mb-2">' +
        '<h2 class="text-xl font-black">Reset Password</h2>' +
        '<button onclick="closeModal()" class="close-btn">&times;</button>' +
      '</div>' +
      '<p class="text-sm mb-5" style="color:rgba(232,236,241,0.65)">Enter your email and we\'ll send you a reset link.</p>' +
      '<input id="reset-email" type="email" placeholder="you@email.com" class="field mb-4" autocomplete="email">' +
      '<button onclick="handleResetPassword()" class="btn-primary rounded-full">Send Reset Link</button>' +
      '<div class="text-center mt-3"><a onclick="openAuthModal()" class="text-xs font-bold cursor-pointer" style="color:var(--accent)">Back to sign in</a></div>' +
      '<p id="reset-msg" class="text-xs text-center mt-3 hidden" style="font-weight:800"></p>' +
    '</div>'
  );
}

async function handleResetPassword() {
  var email = (getEl('reset-email') || {}).value;
  if (!email) {
    var msg = getEl('reset-msg');
    if (msg) { msg.textContent = 'Enter your email'; msg.style.color = '#ffd2d2'; msg.classList.remove('hidden'); }
    return;
  }
  try {
    var r = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + window.location.pathname + '?reset=1'
    });
    if (r.error) {
      var msg = getEl('reset-msg');
      if (msg) { msg.textContent = r.error.message; msg.style.color = '#ffd2d2'; msg.classList.remove('hidden'); }
    } else {
      var msg = getEl('reset-msg');
      if (msg) { msg.textContent = 'Reset link sent! Check your email.'; msg.style.color = 'var(--accent)'; msg.classList.remove('hidden'); }
      setMuxi('Reset link sent. Check your inbox.');
    }
  } catch(e) {
    showToast('Error: ' + (e.message || ''), 'error');
  }
}

async function handleUpdatePassword() {
  var pw = (getEl('new-password') || {}).value;
  var pw2 = (getEl('new-password-confirm') || {}).value;
  if (!pw || pw.length < 6) {
    showToast('Password must be at least 6 characters', 'error');
    return;
  }
  if (pw !== pw2) {
    showToast('Passwords do not match', 'error');
    return;
  }
  try {
    var r = await sb.auth.updateUser({ password: pw });
    if (r.error) {
      showToast('Error: ' + r.error.message, 'error');
    } else {
      closeModal();
      showToast('Password updated!');
      setMuxi('New password locked in. You are good to go.');
      history.replaceState({}, '', window.location.pathname);
    }
  } catch(e) {
    showToast('Error: ' + (e.message || ''), 'error');
  }
}

async function handleSignUp() {
  var email = ((getEl('auth-email') || {}).value || '').trim();
  var pw = (getEl('auth-password') || {}).value || '';
  if (!email || !pw) return showAuthError('Enter email and password');
  if (pw.length < 6) return showAuthError('Password must be 6+ characters');
  try {
    setMuxi('Creating your account...');
    var r = await sb.auth.signUp({ email: email, password: pw });
    if (r.error) return showAuthError(r.error.message);
    if (!r.data.session) {
      var s = await sb.auth.signInWithPassword({ email: email, password: pw });
      if (s.error) return showAuthError('Account created! Check your email to confirm, then sign in. Error: ' + s.error.message);
      state.user = s.data.user; state.accessToken = s.data.session && s.data.session.access_token;
    } else {
      state.user = r.data.user; state.accessToken = r.data.session && r.data.session.access_token;
    }
    closeModal();
    await ensureUserRow();
    await loadProfileSafe();
    openLegalModal(false);
    showToast('Account created. Welcome to MUVR!');
    burstConfetti();
    setMuxi(muxiQuip('signup'));
  } catch(e) { console.error('SignUp error:', e); showAuthError(e.message || 'Sign up failed. Check your connection and try again.'); }
}

async function handleSignIn() {
  var email = ((getEl('auth-email') || {}).value || '').trim();
  var pw = (getEl('auth-password') || {}).value || '';
  if (!email || !pw) return showAuthError('Enter email and password');
  try {
    setMuxi('Signing you in...');
    var r = await sb.auth.signInWithPassword({ email: email, password: pw });
    if (r.error) return showAuthError(r.error.message);
    state.user = r.data.user; state.accessToken = r.data.session && r.data.session.access_token;
    closeModal();
    await ensureUserRow();
    await loadProfileSafe();
    openLegalModal(true);
    setMuxi('Verifying session...');
  } catch(e) { console.error('SignIn error:', e); showAuthError(e.message || 'Sign in failed. Check your connection and try again.'); }
}

async function handleLogout() {
  openModal(
    '<div class="card p-6" style="max-width:420px;margin:auto">' +
      '<div class="text-center mb-4">' + muxiSVG(40) + '</div>' +
      '<h2 class="text-lg font-black text-center mb-3">Sign Out</h2>' +
      '<div class="p-3 rounded-xl mb-4" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08)">' +
        '<p class="text-xs" style="color:rgba(232,236,241,0.60)">You acknowledge that all active escrows, pending trades, and mission statuses remain subject to the <a onclick="closeModal();setTimeout(openTOSModal,300)" class="cursor-pointer" style="color:var(--accent);text-decoration:underline">Terms of Service</a>. Your MV balance and transaction history are preserved.</p>' +
      '</div>' +
      '<div class="flex gap-3">' +
        '<button onclick="closeModal()" class="btn-secondary rounded-full flex-1">Cancel</button>' +
        '<button onclick="confirmLogout()" class="btn-primary rounded-full flex-1">Sign Out</button>' +
      '</div>' +
    '</div>'
  );
}

async function confirmLogout() {
  closeModal();
  try { await sb.auth.signOut(); } catch(e) {}
  state.realtimeSubs.forEach(function(ch) { try { sb.removeChannel(ch); } catch(e) {} });
  if (notifPollInterval) { clearInterval(notifPollInterval); notifPollInterval = null; }
  state = { user:null, accessToken:null, profile:null, jobs:[], jobFilter:'all', balanceVisible:false, currentTab:'jobs', conversations:[], activeConvoId:null, activeMessages:[], mapInited:false, mapObj:null, myPresence:{status:'offline'}, publicEvents:[], ledgerFilter:'all', realtimeSubs:[], notifications:[], myGigsView:false, myGigs:[], myActiveWork:[], deliverables:[], p2pOffers:[], p2pMarketRate:'~1.00', p2pPayFilter:'All', myTrades:[], exchangeView:'buy', agents:[], verifications:[], browseOperatives:[], onboardingDismissed:false, ratingPending:null, unreadAppsCount:0 };
  renderLanding();
  var fab = getEl('muxi-fab'); if (fab) fab.remove();
  var bub = getEl('muxi-bubble'); if (bub) bub.remove();
  showToast('Signed out', 'info');
}

async function handleQuickAcknowledge() {
  try {
    await apiRequest('legal_agreements', {
      method: 'POST',
      body: JSON.stringify({ user_id: state.user.id, agreement_type: 'session_ack', ip_address: '0.0.0.0', user_agent: navigator.userAgent })
    });
  } catch(e) { /* non-blocking — log but don't block entry */ console.warn('Ack log:', e); }
  closeModal(); renderApp(); showToast('Welcome back!');
  setMuxi('Session restored. Loading your data.');
  loadProfileSafe(); loadJobsSafe(); loadNotifications(); loadMyGigs(); loadVerifications(); startNotifPolling();
  registerServiceWorker(); promptPushAfterInteraction();
}

async function handleAcceptLegal() {
  try {
    setMuxi('Saving agreements...');
    var types = ['tos', 'contractor_agreement', 'age'];
    for (var i = 0; i < types.length; i++) {
      await apiRequest('legal_agreements', {
        method: 'POST',
        body: JSON.stringify({ user_id: state.user.id, agreement_type: types[i], ip_address: '0.0.0.0', user_agent: navigator.userAgent })
      });
    }
    closeModal(); renderApp(); showToast('Agreements accepted!');
    setMuxi('You are live. Go post a mission or accept one.');
    loadJobsSafe(); loadProfileSafe(); loadNotifications(); loadMyGigs(); loadVerifications(); startNotifPolling();
    registerServiceWorker(); promptPushAfterInteraction();
  } catch(e) { showToast('Error saving agreements', 'error'); }
}

async function ensureUserRow() {
  if (!state.user) return;
  try {
    var res = await apiRequest('users?id=eq.' + state.user.id + '&select=id');
    if (!res) return;
    var rows = [];
    try { rows = await res.json(); } catch(e) { rows = []; }
    if (Array.isArray(rows) && rows.length) return;
    var create = await apiRequest('users', {
      method: 'POST',
      body: JSON.stringify({
        id: state.user.id, email: state.user.email, mv_balance: 0,
        jobs_completed: 0, rating: 0, full_name: '', username: '',
        about_me: '', role: 'both', has_vehicle: false
      })
    });
    if (create && create.ok) { console.log('[ensureUserRow] created users row'); }
    else { console.warn('[ensureUserRow] could not create users row'); }
  } catch(e) { console.warn('[ensureUserRow] error', e); }
}
