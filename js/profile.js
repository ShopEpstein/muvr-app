function getXPTier(xp) {
  if (xp >= 10000) return 'LEGENDARY';
  if (xp >= 2000) return 'ELITE';
  if (xp >= 500) return 'SPECIALIST';
  return 'RECRUIT';
}
function getXPTierStyle(xp) {
  if (xp >= 10000) return 'background:linear-gradient(135deg,rgba(255,215,0,0.3),rgba(255,61,154,0.3));border:1px solid rgba(255,215,0,0.5);color:#ffd700';
  if (xp >= 2000) return 'background:rgba(255,61,154,0.15);border:1px solid rgba(255,61,154,0.3);color:var(--accent-3)';
  if (xp >= 500) return 'background:rgba(124,92,255,0.15);border:1px solid rgba(124,92,255,0.3);color:var(--accent-2)';
  return 'background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);color:var(--text-dim)';
}
function calcLevel(p) {
  var completed = Number((p && p.jobs_completed) || 0);
  var rating = Number((p && p.rating) || 0);
  var kudos = Number((p && p.kudos_received) || 0);
  var helpfulness = Number((p && p.helpfulness_score) || 0);
  var referrals = Number((p && p.referral_count) || 0);
  var volunteer = Number((p && p.volunteer_missions) || 0);

  /* Base XP from missions */
  var xp = completed * 120;

  /* Profile completion bonus */
  if (p && p.full_name) xp += 40;
  if (p && p.about_me) xp += 40;
  if (p && p.username) xp += 30;
  if (p && p.has_vehicle) xp += 20;

  /* REPUTATION BOOSTERS — rewarding good humans/AIs/teams */
  xp += Math.floor(rating * 50);          /* High ratings = big XP boost (5 stars = +250) */
  xp += kudos * 25;                        /* Each kudos/shoutout = +25 XP */
  xp += helpfulness * 15;                  /* Community helpfulness score */
  xp += referrals * 40;                    /* Bringing people to the network */
  xp += volunteer * 80;                    /* Volunteer missions worth more XP than paid ones */

  /* Streak bonus: 5+ completed = 1.2x multiplier, 20+ = 1.5x */
  if (completed >= 20) xp = Math.floor(xp * 1.5);
  else if (completed >= 5) xp = Math.floor(xp * 1.2);

  var level = Math.max(1, Math.floor(xp / 200) + 1);
  var titles = ['Runner', 'Carrier', 'Operator', 'Elite Operator', 'Angel', 'Archangel', 'Legend', 'Mythic'];
  var title = titles[Math.min(titles.length - 1, Math.floor((level - 1) / 2))];
  var next = level * 200;
  var pct = Math.min(1, xp / next);
  return { xp: xp, level: level, title: title, next: next, pct: pct };
}
function renderProfileTab() {
  var c = getEl('tab-content');
  if (!c) return;
  var p = state.profile || {};
  var rating = Number(p.rating || 0);
  var stars = '';
  for (var i = 0; i < Math.floor(rating); i++) stars += '&#11088;';
  if (rating % 1 > 0) stars += '&#10024;';
  var lvl = calcLevel(p);
  var initial = ((p.full_name || 'U')[0] || 'U').toUpperCase();
  var completionPct = 0;
  if (p.full_name) completionPct += 25;
  if (p.username) completionPct += 25;
  if (p.about_me) completionPct += 25;
  if (p.has_vehicle !== undefined) completionPct += 25;

  c.innerHTML = '<div class="fade-up">' +
    '<h1 class="text-3xl font-black mb-2">Your Profile</h1>' +
    '<p class="text-sm mb-6" style="color:rgba(232,236,241,0.62)">Level up to get picked faster. Complete profiles get 2x visibility.</p>' +

    /* Profile Card */
    '<div class="card p-6 max-w-2xl mb-6">' +
      /* Top section */
      '<div class="flex items-start gap-4 mb-5 pb-5" style="border-bottom:1px solid rgba(255,255,255,0.10)">' +
        '<div class="avatar-ring-lg flex-shrink-0"><span class="text-2xl font-black" style="color:var(--accent)">' + initial + '</span></div>' +
        '<div class="flex-1">' +
          '<h2 class="text-xl font-black mb-0.5">' + escapeHtml(p.full_name || 'No Name Set') + '</h2>' +
          '<p class="text-sm font-bold mb-2" style="color:rgba(232,236,241,0.55)">@' + escapeHtml(p.username || 'no_handle') + '</p>' +
          '<p class="text-xs mb-3" style="color:rgba(232,236,241,0.55)">' + escapeHtml(p.about_me || 'No bio yet - tap Edit to add one and level up.') + '</p>' +
          '<div class="flex flex-wrap gap-2">' +
            (p.has_vehicle ? '<span class="text-[10px] font-black px-2 py-1 rounded-full" style="background:rgba(24,246,200,0.12);border:1px solid rgba(24,246,200,0.25);color:var(--accent)"><i class="fas fa-car mr-1"></i>Has Vehicle</span>' : '') +
            '<span class="text-[10px] font-black px-2 py-1 rounded-full" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.10)">' + escapeHtml((p.role || 'both').toUpperCase()) + '</span>' +
            '<span class="text-[10px] font-black px-2 py-1 rounded-full" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.10)"><i class="fas fa-envelope mr-1"></i>' + escapeHtml((state.user && state.user.email) || '') + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="text-right flex-shrink-0">' +
          '<div class="text-[10px] font-black tracking-widest" style="color:rgba(232,236,241,0.55)">RANK</div>' +
          '<div class="text-xl font-black hero-gradient">' + escapeHtml(lvl.title) + '</div>' +
          '<div class="text-[11px] font-black mt-1" style="color:rgba(232,236,241,0.65)">Level ' + lvl.level + '</div>' +
          '<div class="mt-1"><span class="text-[9px] font-black px-2 py-0.5 rounded-full" data-testid="badge-xp-tier" style="' + getXPTierStyle(lvl.xp) + '">' + getXPTier(lvl.xp) + '</span></div>' +
        '</div>' +
      '</div>' +

      /* Stats Grid */
      '<div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">' +
        '<div class="stat-card"><p class="text-[10px] font-black tracking-widest" style="color:rgba(232,236,241,0.55)">COMPLETED</p><p class="text-2xl font-black mt-1">' + Number(p.jobs_completed || 0) + '</p></div>' +
        '<div class="stat-card"><p class="text-[10px] font-black tracking-widest" style="color:rgba(232,236,241,0.55)">RATING</p><p class="text-lg mt-1">' + (stars || '&#9734; N/A') + '</p></div>' +
        '<div class="stat-card"><p class="text-[10px] font-black tracking-widest" style="color:rgba(232,236,241,0.55)">MV BALANCE</p><p class="text-2xl font-black mt-1" style="color:var(--accent)">' + Number(p.mv_balance || 0) + '</p></div>' +
        '<div class="stat-card"><p class="text-[10px] font-black tracking-widest" style="color:rgba(232,236,241,0.55)">XP TOTAL</p><p class="text-2xl font-black mt-1">' + lvl.xp + '</p></div>' +
      '</div>' +

      /* XP Boosters - how you level up by being good */
      '<div class="p-4 rounded-2xl mb-5" style="background:rgba(24,246,200,0.04);border:1px solid rgba(24,246,200,0.12)">' +
        '<p class="text-[10px] font-black tracking-widest mb-3" style="color:var(--accent)"><i class="fas fa-bolt mr-1"></i>XP BOOSTERS — Level up by being a good human</p>' +
        '<div class="grid grid-cols-2 sm:grid-cols-3 gap-2">' +
          xpBooster('&#11088;', 'Rating', Math.floor(Number(p.rating || 0) * 50) + ' XP', 'High reviews') +
          xpBooster('&#128588;', 'Kudos', (Number(p.kudos_received || 0) * 25) + ' XP', Number(p.kudos_received || 0) + ' received') +
          xpBooster('&#129309;', 'Helpfulness', (Number(p.helpfulness_score || 0) * 15) + ' XP', 'Community score') +
          xpBooster('&#128156;', 'Volunteer', (Number(p.volunteer_missions || 0) * 80) + ' XP', Number(p.volunteer_missions || 0) + ' missions') +
          xpBooster('&#128227;', 'Referrals', (Number(p.referral_count || 0) * 40) + ' XP', Number(p.referral_count || 0) + ' invited') +
          xpBooster('&#128293;', 'Streak', (Number(p.jobs_completed || 0) >= 20 ? '1.5x' : Number(p.jobs_completed || 0) >= 5 ? '1.2x' : '1.0x'), Number(p.jobs_completed || 0) >= 5 ? 'Active!' : 'Do 5 missions') +
        '</div>' +
      '</div>' +

      /* XP Bar */
      '<div class="mb-5">' +
        '<div class="flex justify-between text-[11px] font-black" style="color:rgba(232,236,241,0.62)"><span>XP: ' + lvl.xp + '</span><span>Next Level: ' + lvl.next + '</span></div>' +
        '<div class="mt-2 h-4 rounded-full overflow-hidden" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.10)">' +
          '<div class="h-full rounded-full transition-all" style="width:' + Math.round(lvl.pct * 100) + '%;background:linear-gradient(90deg,var(--accent),var(--accent-2),var(--accent-3))"></div>' +
        '</div>' +
      '</div>' +

      /* Profile Completion */
      '<div class="p-4 rounded-2xl mb-5" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08)">' +
        '<div class="flex items-center justify-between mb-2">' +
          '<p class="text-sm font-black">Profile Completion</p>' +
          '<p class="text-sm font-black" style="color:' + (completionPct === 100 ? 'var(--accent)' : 'var(--yellow)') + '">' + completionPct + '%</p>' +
        '</div>' +
        '<div class="h-2 rounded-full" style="background:rgba(255,255,255,0.08)">' +
          '<div class="h-full rounded-full" style="width:' + completionPct + '%;background:' + (completionPct === 100 ? 'var(--accent)' : 'var(--yellow)') + '"></div>' +
        '</div>' +
        (completionPct < 100 ? '<p class="text-[11px] mt-2" style="color:var(--text-dim)">Complete your profile to unlock 2x visibility in search results.</p>' : '<p class="text-[11px] mt-2" style="color:var(--accent)">Profile complete! You have maximum visibility.</p>') +
      '</div>' +

      '<button onclick="openEditProfileModal()" class="btn-primary rounded-full">Edit profile</button>' +
    '</div>' +

    /* Trust & Safety Card */
    '<div class="card p-5 max-w-2xl mb-6">' +
      '<h3 class="font-black mb-3"><i class="fas fa-shield-alt mr-2" style="color:var(--accent)"></i>Trust & Safety</h3>' +
      '<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">' +
        '<div class="p-3 rounded-xl" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08)">' +
          '<p class="font-black text-xs mb-1">Escrow Protection</p>' +
          '<p class="text-[11px]" style="color:var(--text-dim)">All mission payouts locked in escrow before work begins. Credits release only on confirmation.</p>' +
        '</div>' +
        '<div class="p-3 rounded-xl" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08)">' +
          '<p class="font-black text-xs mb-1">Public Ledger</p>' +
          '<p class="text-[11px]" style="color:var(--text-dim)">All MV transactions recorded publicly (anonymized). Full transparency, no hidden flows.</p>' +
        '</div>' +
        '<div class="p-3 rounded-xl" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08)">' +
          '<p class="font-black text-xs mb-1">Reputation System</p>' +
          '<p class="text-[11px]" style="color:var(--text-dim)">Star ratings, completion count, and XP level visible to all users. Build trust through work.</p>' +
        '</div>' +
        '<div class="p-3 rounded-xl" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08)">' +
          '<p class="font-black text-xs mb-1">Dispute Resolution</p>' +
          '<p class="text-[11px]" style="color:var(--text-dim)">Escrow holds during disputes. Platform review process protects both parties.</p>' +
        '</div>' +
      '</div>' +
    '</div>' +

    /* Verification Center */
    '<div class="card p-5 max-w-2xl mb-6 shimmer-border" style="border-color:rgba(24,246,200,0.14);background:linear-gradient(135deg,rgba(24,246,200,0.04),rgba(124,92,255,0.03))">' +
      '<h3 class="font-black mb-1"><i class="fas fa-certificate mr-2" style="color:var(--accent)"></i>Verification Center</h3>' +
      '<p class="text-xs mb-4" style="color:var(--text-dim)">Upload credentials to earn trust badges. Verified operatives get priority matching and higher visibility. All documents are reviewed within 24-48 hours.</p>' +
      '<div id="verification-list" class="mb-4">' + renderVerificationItems(p) + '</div>' +
      '<button onclick="openVerificationModal()" class="btn-pill btn-pill-accent" data-testid="button-verify"><i class="fas fa-upload mr-2"></i>Upload Credential</button>' +
      '<p class="text-[10px] mt-3" style="color:var(--text-dim)"><i class="fas fa-lock mr-1"></i>Documents are stored securely and never shared with other users. Only verification status (badge) is visible on your profile.</p>' +
    '</div>' +

    /* Angels Program Card */
    renderAngelsSection() +

    /* Recruit / Invite Card */
    '<div class="card p-5 max-w-2xl mb-6" style="border-color:rgba(24,246,200,0.18);background:linear-gradient(135deg,rgba(24,246,200,0.06),rgba(124,92,255,0.04))">' +
      '<h3 class="font-black mb-2"><i class="fas fa-user-plus mr-2" style="color:var(--accent)"></i>Recruit Operatives</h3>' +
      '<p class="text-xs mb-4" style="color:var(--text-dim)">Every person you bring in creates more missions, more operatives, and more value. Share MUVR and help break the broken gig economy.</p>' +
      '<div class="flex gap-2 flex-wrap">' +
        '<button onclick="openShareModal()" class="btn-pill btn-pill-accent"><i class="fas fa-share-alt mr-1"></i>Recruit</button>' +
        '<button onclick="shareVia(\'twitter\')" class="btn-pill btn-pill-ghost"><i class="fab fa-twitter mr-1"></i>Tweet</button>' +
        '<button onclick="shareVia(\'whatsapp\')" class="btn-pill btn-pill-ghost"><i class="fab fa-whatsapp mr-1"></i>WhatsApp</button>' +
        '<button onclick="shareVia(\'sms\')" class="btn-pill btn-pill-ghost"><i class="fas fa-sms mr-1"></i>Text</button>' +
      '</div>' +
    '</div>' +

    /* Achievements / Badges */
    '<div class="card p-5 max-w-2xl">' +
      '<h3 class="font-black mb-3">Achievements</h3>' +
      '<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">' +
        badge('&#128640;', 'Early Adopter', 'Joined MUVR', true) +
        badge('&#128170;', 'First Mission', 'Complete 1 mission', Number(p.jobs_completed || 0) >= 1) +
        badge('&#11088;', '5-Star Worker', 'Get a 5-star rating', rating >= 5) +
        badge('&#127942;', 'Pro MUVR', 'Complete 10 missions', Number(p.jobs_completed || 0) >= 10) +
        badge('&#128176;', 'Big Spender', 'Send 100+ MV', Number(p.mv_balance || 0) >= 0) +
        badge('&#128293;', 'Retirement Pro', 'Post 5 missions (retire 5 MV from circulation)', Number(p.jobs_completed || 0) >= 5) +
        badge('&#128663;', 'Road Warrior', 'Has a vehicle', !!p.has_vehicle) +
        badge('&#128172;', 'Social Butterfly', 'Complete profile', !!(p.full_name && p.username && p.about_me)) +
        badge('&#127775;', 'Rising Star', 'Reach Level 3', calcLevel(p).level >= 3) +
        badge('&#9889;', 'Lightning', 'Complete 25 missions', Number(p.jobs_completed || 0) >= 25) +
        badge('&#128081;', 'Legend', 'Reach Level 10', calcLevel(p).level >= 10) +
        badge('&#129412;', 'MUXI Friend', 'Tap MUXI 5 times', false) +
        badge('&#128203;', 'Licensed', 'Upload a license', hasVerification('license')) +
        badge('&#128737;', 'Insured', 'Upload insurance proof', hasVerification('insurance')) +
        badge('&#127891;', 'Certified', 'Upload a certification', hasVerification('certification')) +
        badge('&#9989;', 'ID Verified', 'Verify your identity', hasVerification('government_id')) +
        badge('&#128272;', 'Background Check', 'Pass a background check', hasVerification('background_check')) +
      '</div>' +
    '</div>' +
  '</div>';
}
var VERIFICATION_TYPES = [
  { key: 'license', label: "Driver's License / Trade License", icon: '&#128203;', desc: 'Professional or trade license' },
  { key: 'insurance', label: 'Insurance / Liability', icon: '&#128737;', desc: 'Liability or vehicle insurance' },
  { key: 'certification', label: 'Certification / Training', icon: '&#127891;', desc: 'Professional certification or training completion' },
  { key: 'government_id', label: 'Government ID', icon: '&#9989;', desc: 'Valid government-issued photo ID' },
  { key: 'background_check', label: 'Background Check', icon: '&#128272;', desc: 'Third-party background check result' },
  { key: 'business_license', label: 'Business License', icon: '&#127970;', desc: 'Business registration or license' },
  { key: 'vehicle_registration', label: 'Vehicle Registration', icon: '&#128663;', desc: 'Current vehicle registration' },
  { key: 'other', label: 'Other Credential', icon: '&#128196;', desc: 'Any other relevant credential' }
];
function hasVerification(type) {
  return state.verifications.some(function(v) { return v.doc_type === type && v.status === 'verified'; });
}
function getVerificationStatus(type) {
  var v = state.verifications.find(function(v) { return v.doc_type === type; });
  return v ? v.status : null;
}
function renderVerificationItems(p) {
  if (!state.verifications.length) {
    return '<div class="text-center py-4" style="color:var(--text-dim)">' +
      '<i class="fas fa-folder-open text-2xl mb-2" style="opacity:0.4"></i>' +
      '<p class="text-xs">No credentials uploaded yet. Upload your first one to start earning trust badges.</p>' +
    '</div>';
  }
  return state.verifications.map(function(v) {
    var cfg = VERIFICATION_TYPES.find(function(t) { return t.key === v.doc_type; }) || { icon: '&#128196;', label: v.doc_type };
    var statusColor = v.status === 'verified' ? 'var(--accent)' : v.status === 'rejected' ? 'var(--red)' : 'var(--yellow)';
    var statusLabel = v.status === 'verified' ? 'VERIFIED' : v.status === 'rejected' ? 'REJECTED' : 'PENDING REVIEW';
    var statusIcon = v.status === 'verified' ? 'fa-check-circle' : v.status === 'rejected' ? 'fa-times-circle' : 'fa-clock';
    return '<div class="flex items-center justify-between p-3 rounded-xl mb-2 scale-in" style="background:rgba(255,255,255,0.04);border:1px solid ' + (v.status === 'verified' ? 'rgba(24,246,200,0.25)' : 'rgba(255,255,255,0.08)') + '">' +
      '<div class="flex items-center gap-3">' +
        '<span class="text-xl">' + cfg.icon + '</span>' +
        '<div>' +
          '<p class="font-black text-xs">' + escapeHtml(cfg.label) + '</p>' +
          '<p class="text-[10px]" style="color:var(--text-dim)">' + escapeHtml(v.file_name || 'Document') + '</p>' +
        '</div>' +
      '</div>' +
      '<div class="text-right">' +
        '<span class="text-[10px] font-black" style="color:' + statusColor + '"><i class="fas ' + statusIcon + ' mr-1"></i>' + statusLabel + '</span>' +
        (v.status === 'rejected' && v.reject_reason ? '<p class="text-[9px] mt-0.5" style="color:var(--text-dim)">' + escapeHtml(v.reject_reason) + '</p>' : '') +
      '</div>' +
    '</div>';
  }).join('');
}
function openVerificationModal() {
  if (!state.user) return openAuthModal();
  var typeOptions = VERIFICATION_TYPES.map(function(t) {
    return '<option value="' + t.key + '">' + t.icon + ' ' + t.label + '</option>';
  }).join('');

  openModal(
    '<i class="fas fa-certificate mr-2" style="color:var(--accent)"></i>Upload Credential',
    '<p class="text-sm mb-4" style="color:var(--text-dim)">Upload a document to verify your credentials. Accepted formats: PDF, JPG, PNG (max 5MB). Documents are reviewed within 24-48 hours.</p>' +
    '<div class="space-y-3">' +
      '<div>' +
        '<label class="text-[10px] font-black tracking-widest block mb-1" style="color:rgba(232,236,241,0.55)">CREDENTIAL TYPE</label>' +
        '<select id="verify-type" class="field" data-testid="select-verify-type">' + typeOptions + '</select>' +
      '</div>' +
      '<div>' +
        '<label class="text-[10px] font-black tracking-widest block mb-1" style="color:rgba(232,236,241,0.55)">DOCUMENT FILE</label>' +
        '<input type="file" id="verify-file" accept=".pdf,.jpg,.jpeg,.png,.webp" class="field text-sm" data-testid="input-verify-file" />' +
      '</div>' +
      '<div>' +
        '<label class="text-[10px] font-black tracking-widest block mb-1" style="color:rgba(232,236,241,0.55)">NOTES (OPTIONAL)</label>' +
        '<textarea id="verify-notes" class="field" rows="2" placeholder="e.g. Expires 12/2027, State of California" data-testid="input-verify-notes"></textarea>' +
      '</div>' +
      '<div class="p-3 rounded-xl" style="background:rgba(24,246,200,0.04);border:1px solid rgba(24,246,200,0.12)">' +
        '<p class="text-[10px] font-bold" style="color:var(--text-dim)"><i class="fas fa-shield-alt mr-1" style="color:var(--accent)"></i>Your documents are encrypted and stored securely. They are NEVER shared with other users, employers, or third parties. Only MUVR staff reviewers can access them for verification purposes. Once verified, only the badge is shown on your profile.</p>' +
      '</div>' +
    '</div>',
    '<button onclick="submitVerification()" class="btn-primary rounded-full" data-testid="button-submit-verify"><i class="fas fa-upload mr-2"></i>Submit for Review</button>'
  );
}
async function submitVerification() {
  if (!state.user) return;
  var docType = getEl('verify-type') ? getEl('verify-type').value : '';
  var fileInput = getEl('verify-file');
  var notes = getEl('verify-notes') ? getEl('verify-notes').value.trim() : '';

  if (!fileInput || !fileInput.files || !fileInput.files.length) {
    return showToast('Please select a file to upload', 'error');
  }

  var file = fileInput.files[0];
  if (file.size > 5 * 1024 * 1024) {
    return showToast('File must be under 5MB', 'error');
  }

  var allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
  if (allowed.indexOf(file.type) < 0) {
    return showToast('Only PDF, JPG, PNG, or WebP files are accepted', 'error');
  }

  setMuxi('Uploading your credential...');
  try {
    var filePath = 'verifications/' + state.user.id + '/' + Date.now() + '_' + file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    var uploadRes = await sb.storage.from('documents').upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

    if (uploadRes.error) {
      console.warn('Storage upload failed, saving metadata only:', uploadRes.error.message);
    }

    var res = await apiRequest('rpc/submit_verification', {
      method: 'POST',
      body: JSON.stringify({
        p_user_id: state.user.id,
        p_doc_type: docType,
        p_file_path: filePath,
        p_file_name: file.name,
        p_notes: notes
      })
    });

    if (res && res.ok) {
      state.verifications.push({
        doc_type: docType,
        file_name: file.name,
        file_path: filePath,
        notes: notes,
        status: 'pending',
        created_at: new Date().toISOString()
      });
      closeModal();
      showToast('Credential submitted for review!');
      setMuxi('Document received! Our team will review it within 24-48 hours. Once verified, your badge lights up.');
      renderProfileTab();
    } else {
      state.verifications.push({
        doc_type: docType,
        file_name: file.name,
        file_path: filePath,
        notes: notes,
        status: 'pending',
        created_at: new Date().toISOString()
      });
      closeModal();
      showToast('Credential uploaded! Pending review.');
      setMuxi('Got it! Review is pending. The RPC endpoint may need to be created on your backend.');
      renderProfileTab();
    }
  } catch(e) {
    showToast('Upload failed: ' + e.message, 'error');
    setMuxi('Upload error. Check your connection and try again.');
  }
}
async function loadVerifications() {
  if (!state.user) return;
  try {
    var res = await apiRequest('verifications?user_id=eq.' + state.user.id + '&select=*&order=created_at.desc');
    if (res && res.ok) {
      state.verifications = await res.json();
    }
  } catch(e) { console.warn('loadVerifications:', e); }
}
function badge(icon, title, desc, unlocked) {
  return '<div class="p-3 rounded-2xl text-center" style="background:rgba(255,255,255,' + (unlocked ? '0.06' : '0.02') + ');border:1px solid ' + (unlocked ? 'rgba(24,246,200,0.25)' : 'rgba(255,255,255,0.06)') + ';opacity:' + (unlocked ? '1' : '0.4') + '">' +
    '<div class="text-2xl mb-1">' + icon + '</div>' +
    '<p class="font-black text-[11px]">' + title + '</p>' +
    '<p class="text-[10px]" style="color:var(--text-dim)">' + desc + '</p>' +
    (unlocked ? '<div class="text-[10px] font-black mt-1" style="color:var(--accent)">UNLOCKED</div>' : '') +
  '</div>';
}


var blogPosts = [
  { id: 'moving-tips-2026', title: 'Top 10 Moving Tips for 2026', cat: 'Moving Tips', date: '2026-02-20', excerpt: 'Moving can be stressful but with the right preparation it does not have to be. Here are our top tips for a smooth move this year.', body: 'Start early - the biggest mistake people make is waiting until the last minute. Book movers at least 2 weeks ahead. Declutter before packing: if you have not used it in a year, donate it. Label every box with room and contents. Take photos of electronics before unplugging. Keep essentials in a separate bag. Notify utilities 2 weeks early. Measure doorways at both locations. Tip your movers - they are doing hard work. Use MUVR to find trusted local help with escrow protection.' },
  { id: 'gig-economy-future', title: 'The Future of the Gig Economy: Zero Commission', cat: 'Mission Economy', excerpt: 'Traditional platforms take 15-30% of operative earnings. MUVR is building the alternative with 0% commission and escrow-first payment protection.', date: '2026-02-18', body: 'The gig economy has grown to over 60 million workers in the US alone. But most platforms still extract 15-30% from every transaction. MUVR takes a different approach: zero commission on operative earnings. Instead of percentage fees, MUVR uses a flat 1 MV posting fee — half retired from circulation, half fueling referral and AI agent incentives. Operatives keep 100% of the agreed rate. Escrow locks funds before work begins, so operatives are guaranteed payment and commanders are guaranteed delivery. It is a fundamentally different model built for the people doing the actual work.' },
  { id: 'escrow-explained', title: 'How Escrow Protection Works on MUVR', cat: 'MUVR News', excerpt: 'Escrow is the backbone of trust on MUVR. Learn how it protects both workers and job posters in every transaction.', date: '2026-02-15', body: 'When a job is posted on MUVR, the full budget plus a 1 MV posting fee locks in escrow. This means the money exists and is committed before any worker starts. When work is complete and confirmed, escrow releases instantly to the worker. If there is a dispute, escrow holds until resolution. Of the 1 MV posting fee, half is retired from circulation to reduce supply and half goes to the ecosystem pool (referral rewards, performer bonuses, agent development, network reserve). This creates a system where trust is built into the protocol, not dependent on reviews alone.' },
  { id: 'worker-guide-getting-started', title: 'Operative Guide: Getting Started on MUVR', cat: 'Operative Guides', excerpt: 'New to MUVR? Here is everything you need to know to land your first mission and start earning.', date: '2026-02-12', body: 'Step 1: Create your account and complete your profile. Profiles with names, bios, and vehicle info get 2x visibility. Step 2: Browse the Missions tab and filter by type - rideshare, delivery, physical labor, or digital work. Step 3: Submit a brief with a clear pitch, your rate in MV, and estimated turnaround. Step 4: If selected, do great work and get paid instantly via escrow release. Step 5: Earn XP for every completed mission and climb the ranks from Recruit to Mythic. Higher rank means you appear first in search results.' },
  { id: 'mv-credits-explained', title: 'Understanding MUVR Credits (MV)', cat: 'MUVR News', excerpt: 'MV Credits are the in-platform unit that powers escrow, payments, and marketplace flows. Here is how they work.', date: '2026-02-10', body: 'MUVR Credits (MV) are platform-limited digital credits used within MUVR for marketplace features. They are denominated as 1 credit equals 1 USD-equivalent unit inside the app for pricing. Total supply is capped at 10 million MV. Every mission posting splits 1 MV: 50% retired from circulation permanently, 50% to the ecosystem pool over time. MV can be sent to any user by handle, email, or public alias. All transfers are logged in the public ledger using anonymous aliases. MV are not currency, cryptocurrency, or financial instruments.' },
  { id: 'virginia-pilot-launch', title: 'MUVR Launches Virginia Pilot Program', cat: 'MUVR News', excerpt: 'We are rolling out the MUVR marketplace in Virginia first. Here is why and what to expect.', date: '2026-02-08', body: 'Virginia is MUVR launch market and the testing ground for the platform. We chose Virginia for its diverse population, strong demand for moving and delivery services, and proximity to our team. The pilot includes all core features: mission posting, escrow, MV credits, messaging, the public ledger, and the MUVR GO map. Early users will get bonus MV credits for completing their profiles and posting their first missions. Feedback from the Virginia pilot will shape the national rollout later this year.' }
];
function renderBlogPage() {
  setSEOTitle('blog');
  var root = getEl('root');
  if (!root) return;
  root.innerHTML = '<div class="fade-up"><div class="max-w-4xl mx-auto px-5 py-8">' +
    '<div class="flex items-center justify-between mb-6">' +
      '<div class="flex items-center gap-3">' +
        '<div class="text-2xl font-black"><span style="color:var(--accent)">M</span>U<span style="color:var(--accent)">V</span>R<sup style="font-size:0.45em;vertical-align:super;opacity:0.7">&trade;</sup></div>' +
        '<span class="text-[10px] font-black px-2 py-1 rounded-full" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.10)">BLOG</span>' +
      '</div>' +
      '<div class="flex gap-2">' +
        (state.user ? '<button onclick="renderApp()" class="btn-pill btn-pill-ghost">Back to App</button>' : '<button onclick="renderLanding()" class="btn-pill btn-pill-ghost">Back</button>') +
      '</div>' +
    '</div>' +
    '<h1 class="text-3xl font-black mb-2">MUVR Blog</h1>' +
    '<p class="text-sm mb-6" style="color:var(--text-mid)">Tips, guides, and news from the real-world work game.</p>' +
    '<div class="space-y-4">' +
    blogPosts.map(function(post) {
      return '<div class="card card-interactive p-5 cursor-pointer" onclick="renderBlogPost(\'' + post.id + '\')">' +
        '<div class="flex items-start justify-between mb-2">' +
          '<span class="text-[10px] font-black px-2 py-1 rounded-full" style="background:rgba(24,246,200,0.10);border:1px solid rgba(24,246,200,0.20);color:var(--accent)">' + escapeHtml(post.cat) + '</span>' +
          '<span class="text-[10px]" style="color:var(--text-dim)">' + post.date + '</span>' +
        '</div>' +
        '<h2 class="font-black text-lg mb-2">' + escapeHtml(post.title) + '</h2>' +
        '<p class="text-sm" style="color:var(--text-mid)">' + escapeHtml(post.excerpt) + '</p>' +
        '<p class="text-[11px] font-black mt-3" style="color:var(--accent)">Read more &#8594;</p>' +
      '</div>';
    }).join('') +
    '</div>' +
  '</div></div>';
}
function renderBlogPost(postId) {
  var post = blogPosts.find(function(p) { return p.id === postId; });
  if (!post) return;
  setSEOBlogPostTitle(post);
  var root = getEl('root');
  if (!root) return;
  root.innerHTML = '<div class="fade-up"><div class="max-w-3xl mx-auto px-5 py-8">' +
    '<button onclick="renderBlogPage()" class="btn-sm mb-4"><i class="fas fa-arrow-left mr-1"></i>Back to Blog</button>' +
    '<span class="text-[10px] font-black px-2 py-1 rounded-full" style="background:rgba(24,246,200,0.10);border:1px solid rgba(24,246,200,0.20);color:var(--accent)">' + escapeHtml(post.cat) + '</span>' +
    '<span class="text-[10px] ml-2" style="color:var(--text-dim)">' + post.date + '</span>' +
    '<h1 class="text-3xl font-black mt-3 mb-4">' + escapeHtml(post.title) + '</h1>' +
    '<div class="text-sm leading-relaxed space-y-4" style="color:var(--text-mid)">' +
      post.body.split('. ').reduce(function(acc, sentence, i) {
        if (i % 3 === 0 && i > 0) return acc + '</p><p>' + sentence + '. ';
        return acc + sentence + '. ';
      }, '<p>') + '</p>' +
    '</div>' +
    '<div class="mt-8 card p-5">' +
      '<p class="font-black mb-2">Ready to get started?</p>' +
      '<button onclick="openAuthModal()" class="btn-primary rounded-full">Join MUVR</button>' +
    '</div>' +
  '</div></div>';
}
function openEditProfileModal() {
  var p = state.profile || {};
  openModal(
    '<div class="card p-6" style="max-width:460px;margin:auto;max-height:90vh;overflow:auto">' +
      '<div class="flex justify-between items-center mb-4"><h2 class="text-xl font-black">Edit profile</h2><button onclick="closeModal()" class="close-btn">&times;</button></div>' +
      '<div class="space-y-3">' +
        '<input id="profile-name" placeholder="Your full legal name" maxlength="100" class="field" value="' + escapeHtml(p.full_name || '') + '">' +
        '<input id="profile-username" placeholder="@handle (unique, public)" maxlength="30" class="field" value="' + escapeHtml(p.username || '') + '">' +
        '<textarea id="profile-about" placeholder="What services do you offer? Skills, experience, availability..." rows="4" maxlength="500" class="field" style="resize:none">' + escapeHtml(p.about_me || '') + '</textarea>' +
        '<select id="profile-role" class="field"><option value="both" ' + (p.role === 'both' ? 'selected' : '') + '>Accept & post missions</option><option value="worker" ' + (p.role === 'worker' ? 'selected' : '') + '>Operative only</option><option value="poster" ' + (p.role === 'poster' ? 'selected' : '') + '>Commander only</option></select>' +
        '<label class="flex items-center gap-3 cursor-pointer p-3 rounded-2xl" style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.10)"><input type="checkbox" id="profile-vehicle" class="w-4 h-4" ' + (p.has_vehicle ? 'checked' : '') + '><span class="text-sm font-black">I have a vehicle</span></label>' +
        '<div class="p-4 rounded-2xl" style="background:rgba(24,246,200,0.06);border:1px solid rgba(24,246,200,0.16)">' +
          '<p class="font-black text-xs mb-2" style="color:var(--accent)"><i class="fas fa-shield-alt mr-1"></i>TRUST & SAFETY</p>' +
          '<p class="text-[11px] mb-2" style="color:var(--text-mid)">Verified profiles get priority in search. All workers are screened by reputation, escrow history, and community feedback.</p>' +
          '<p class="text-[11px]" style="color:var(--text-dim)">Identity verification and background checks will be available in a future update. For now, escrow protection + public ratings keep both sides safe.</p>' +
        '</div>' +
        '<button onclick="handleSaveProfile()" class="btn-primary rounded-full">Save profile</button>' +
      '</div>' +
    '</div>',
    { width: 'max-w-md' }
  );
}
function getShareUrl() {
  var base = window.location.origin + window.location.pathname;
  var ref = state.profile && state.profile.referral_code ? state.profile.referral_code : (state.profile && state.profile.username ? state.profile.username : '');
  return ref ? base + '?ref=' + encodeURIComponent(ref) : base;
}
function openShareModal() {
  var url = getShareUrl();

  var msgs = {
    worker: 'I am earning on MUVR with zero commission. Operatives keep 100%. Join me: ' + url,
    poster: 'I found great local help on MUVR. Escrow-protected missions, instant matching, zero extraction. Try it: ' + url,
    social: 'The gig economy is broken. MUVR is fixing it. 0% commission. Escrow protection. Operatives keep everything. ' + url
  };

  openModal(
    '<div class="card p-6" style="max-width:480px;margin:auto;max-height:90vh;overflow:auto">' +
      '<div class="flex justify-between items-center mb-4">' +
        '<h2 class="text-lg font-black"><i class="fas fa-share-alt mr-2" style="color:var(--accent)"></i>Invite & Share</h2>' +
        '<button onclick="closeModal()" class="close-btn">&times;</button>' +
      '</div>' +
      '<div class="p-4 rounded-xl mb-4" style="background:rgba(24,246,200,0.06);border:1px solid rgba(24,246,200,0.16)">' +
        '<p class="text-[11px] font-black mb-2" style="color:var(--accent)">YOUR INVITE LINK</p>' +
        '<div class="flex gap-2">' +
          '<input id="share-url" type="text" value="' + escapeHtml(url) + '" readonly class="field flex-1" style="font-size:11px">' +
          '<button onclick="copyShareLink()" class="btn-pill btn-pill-accent" style="flex-shrink:0"><i class="fas fa-copy"></i></button>' +
        '</div>' +
        '<p class="text-[10px] mt-2" style="color:var(--text-dim)">Anyone who signs up through your link grows the network.</p>' +
      '</div>' +
      '<p class="text-[11px] font-black mb-3" style="color:rgba(232,236,241,0.55)">SHARE ON</p>' +
      '<div class="grid grid-cols-2 gap-2 mb-4">' +
        '<button onclick="shareVia(\'twitter\')" class="p-3 rounded-xl text-xs font-black flex items-center gap-2" style="background:rgba(29,161,242,0.12);border:1px solid rgba(29,161,242,0.25);color:#1DA1F2"><i class="fab fa-twitter"></i>Twitter / X</button>' +
        '<button onclick="shareVia(\'facebook\')" class="p-3 rounded-xl text-xs font-black flex items-center gap-2" style="background:rgba(66,103,178,0.12);border:1px solid rgba(66,103,178,0.25);color:#4267B2"><i class="fab fa-facebook"></i>Facebook</button>' +
        '<button onclick="shareVia(\'whatsapp\')" class="p-3 rounded-xl text-xs font-black flex items-center gap-2" style="background:rgba(37,211,102,0.12);border:1px solid rgba(37,211,102,0.25);color:#25D366"><i class="fab fa-whatsapp"></i>WhatsApp</button>' +
        '<button onclick="shareVia(\'sms\')" class="p-3 rounded-xl text-xs font-black flex items-center gap-2" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);color:rgba(232,236,241,0.8)"><i class="fas fa-sms"></i>Text</button>' +
        '<button onclick="shareVia(\'linkedin\')" class="p-3 rounded-xl text-xs font-black flex items-center gap-2" style="background:rgba(0,119,181,0.12);border:1px solid rgba(0,119,181,0.25);color:#0077B5"><i class="fab fa-linkedin"></i>LinkedIn</button>' +
        '<button onclick="shareVia(\'email\')" class="p-3 rounded-xl text-xs font-black flex items-center gap-2" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);color:rgba(232,236,241,0.8)"><i class="fas fa-envelope"></i>Email</button>' +
      '</div>' +
      '<p class="text-[11px] font-black mb-3" style="color:rgba(232,236,241,0.55)">COPY A MESSAGE</p>' +
      '<div class="space-y-2 mb-4">' +
        '<div class="p-3 rounded-xl cursor-pointer" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08)" onclick="copyText(\'' + escapeHtml(msgs.worker).replace(/'/g, "\\'") + '\')">' +
          '<p class="text-[11px] font-black" style="color:var(--accent-2)"><i class="fas fa-hard-hat mr-1"></i>For operatives</p>' +
          '<p class="text-[10px]" style="color:var(--text-dim)">Tap to copy</p>' +
        '</div>' +
        '<div class="p-3 rounded-xl cursor-pointer" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08)" onclick="copyText(\'' + escapeHtml(msgs.poster).replace(/'/g, "\\'") + '\')">' +
          '<p class="text-[11px] font-black" style="color:var(--accent-3)"><i class="fas fa-clipboard-list mr-1"></i>For commanders</p>' +
          '<p class="text-[10px]" style="color:var(--text-dim)">Tap to copy</p>' +
        '</div>' +
        '<div class="p-3 rounded-xl cursor-pointer" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08)" onclick="copyText(\'' + escapeHtml(msgs.social).replace(/'/g, "\\'") + '\')">' +
          '<p class="text-[11px] font-black" style="color:var(--yellow)"><i class="fas fa-fire mr-1"></i>Viral / Social</p>' +
          '<p class="text-[10px]" style="color:var(--text-dim)">Tap to copy</p>' +
        '</div>' +
      '</div>' +
      (navigator.share ? '<button onclick="nativeShare()" class="btn-primary rounded-full mb-3"><i class="fas fa-share mr-2"></i>Share via device</button>' : '') +
      '<p class="text-[10px] text-center" style="color:var(--text-dim)">More people = more missions = more value for everyone.</p>' +
    '</div>',
    { width: 'max-w-md' }
  );
}
function copyShareLink() {
  var el = getEl('share-url');
  if (el) { try { navigator.clipboard.writeText(el.value); } catch(e) { el.select(); document.execCommand('copy'); } showToast('Link copied!'); }
}
function copyText(text) {
  try { navigator.clipboard.writeText(text); } catch(e) { var ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); }
  showToast('Copied to clipboard!');
}
function shareVia(platform) {
  var url = getShareUrl();
  var text = 'Join MUVR - the real-world work game. 0% commission, escrow-protected missions, operatives keep 100%.';
  var eu = encodeURIComponent(url), et = encodeURIComponent(text);
  var dest = '';
  if (platform === 'twitter') dest = 'https://twitter.com/intent/tweet?text=' + et + '&url=' + eu;
  else if (platform === 'facebook') dest = 'https://www.facebook.com/sharer/sharer.php?u=' + eu;
  else if (platform === 'whatsapp') dest = 'https://wa.me/?text=' + encodeURIComponent(text + ' ' + url);
  else if (platform === 'sms') dest = 'sms:?body=' + encodeURIComponent(text + ' ' + url);
  else if (platform === 'linkedin') dest = 'https://www.linkedin.com/sharing/share-offsite/?url=' + eu;
  else if (platform === 'email') dest = 'mailto:?subject=' + encodeURIComponent('Check out MUVR') + '&body=' + encodeURIComponent(text + '\n\n' + url);
  if (dest) window.open(dest, '_blank');
}
async function nativeShare() {
  try { await navigator.share({ title: 'MUVR - The Real-World Work Game', text: 'Join MUVR. 0% commission missions with escrow protection. Operatives keep 100%.', url: getShareUrl() }); } catch(e) {}
}
function shareGig(jobId) {
  var job = (state.jobs || []).concat(state.myGigs || []).find(function(j) { return j.id === jobId; });
  var url = getShareUrl() + '#gig-' + (jobId || '').slice(0, 8);
  var text = job ? 'Gig on MUVR: "' + (job.title || '') + '" for ' + Number(job.budget_mv || 0) + ' MV - ' + url : url;
  try { navigator.clipboard.writeText(text); } catch(e) {}
  showToast('Mission link copied!');
}
async function handleSaveProfile() {
  var username = ((getEl('profile-username') || {}).value || '').toLowerCase().trim();
  if (username && !/^[a-z0-9_]{3,30}$/.test(username)) {
    return showToast('Username must be 3-30 characters: letters, numbers, underscore only', 'error');
  }
  var updates = {
    full_name: (getEl('profile-name') || {}).value || '',
    username: username,
    about_me: (getEl('profile-about') || {}).value || '',
    role: (getEl('profile-role') || {}).value || 'both',
    has_vehicle: !!(getEl('profile-vehicle') || {}).checked
  };
  try {
    var res = await apiRequest('users?id=eq.' + state.user.id, { method: 'PATCH', body: JSON.stringify(updates) });
    if (res && (res.ok || res.status === 204)) {
      state.profile = Object.assign(state.profile || {}, updates);
      closeModal(); showToast('Profile saved!'); renderProfileTab();
      setMuxi(muxiQuip('profile'));
    } else {
      var errText = ''; try { errText = await res.text(); } catch(e) {}
      if (errText.indexOf('username_format') >= 0) showToast('Username: 3-30 chars, letters/numbers/underscore', 'error');
      else showToast('Error saving profile', 'error');
    }
  } catch(e) { showToast('Error saving', 'error'); }
}
var angelTiers = [
  { name: 'Initiate', min: 0, color: 'var(--text-dim)', icon: '&#128588;' },
  { name: 'Guardian', min: 100, color: 'var(--accent)', icon: '&#128737;' },
  { name: 'Beacon', min: 500, color: 'var(--accent-2)', icon: '&#128161;' },
  { name: 'Seraph', min: 2000, color: 'var(--accent-3)', icon: '&#128293;' }
];

function getAngelTier(xp) {
  xp = Number(xp) || 0;
  for (var i = angelTiers.length - 1; i >= 0; i--) {
    if (xp >= angelTiers[i].min) return angelTiers[i];
  }
  return angelTiers[0];
}

function renderAngelsSection() {
  var p = state.profile || {};
  var xp = Number(p.angel_xp || 0);
  var streak = Number(p.angel_streak || 0);
  var tier = getAngelTier(xp);
  var nextTier = angelTiers[angelTiers.indexOf(tier) + 1] || null;
  var pct = nextTier ? Math.min(100, ((xp - tier.min) / (nextTier.min - tier.min)) * 100) : 100;

  return '<div class="card p-5 mb-6" style="background:linear-gradient(135deg, rgba(124,92,255,0.08), rgba(255,61,154,0.06));border:1px solid rgba(124,92,255,0.18)">' +
    '<div class="flex items-center gap-3 mb-4">' +
      '<div class="text-3xl">' + tier.icon + '</div>' +
      '<div>' +
        '<h3 class="font-black text-sm" style="color:var(--accent-2)">MUVR ANGELS</h3>' +
        '<p class="text-[10px]" style="color:var(--text-dim)">Caregiving missions. Consistency. Quality. Heart.</p>' +
      '</div>' +
    '</div>' +

    '<div class="flex items-center justify-between mb-2">' +
      '<span class="text-xs font-black" style="color:' + tier.color + '">' + tier.icon + ' ' + tier.name + '</span>' +
      '<span class="text-[10px] font-black" style="color:var(--text-dim)">' + xp + ' XP' + (streak > 0 ? ' | ' + streak + ' day streak &#128293;' : '') + '</span>' +
    '</div>' +

    (nextTier ?
      '<div class="w-full h-2 rounded-full mb-3 overflow-hidden" style="background:rgba(255,255,255,0.08)">' +
        '<div class="h-full rounded-full transition-all" style="width:' + pct + '%;background:' + tier.color + '"></div>' +
      '</div>' +
      '<p class="text-[10px] mb-3" style="color:var(--text-dim)">' + (nextTier.min - xp) + ' XP to ' + nextTier.name + '</p>'
      : '<p class="text-[10px] mb-3" style="color:var(--accent-3)">Max tier reached! You are a Seraph.</p>'
    ) +

    '<div class="grid grid-cols-4 gap-2 mb-3">' +
      angelTiers.map(function(t) {
        var active = xp >= t.min;
        return '<div class="text-center p-2 rounded-xl" style="background:rgba(255,255,255,' + (active ? '0.06' : '0.02') + ');border:1px solid ' + (active ? t.color + '40' : 'rgba(255,255,255,0.06)') + ';opacity:' + (active ? '1' : '0.4') + '">' +
          '<div class="text-lg">' + t.icon + '</div>' +
          '<p class="text-[9px] font-black" style="color:' + t.color + '">' + t.name + '</p>' +
          '<p class="text-[8px]" style="color:var(--text-dim)">' + t.min + '+ XP</p>' +
        '</div>';
      }).join('') +
    '</div>' +

    '<div class="text-[10px]" style="color:var(--text-dim)">' +
      'Angels earn XP from caregiving, child care, and elder care missions. Streak bonuses for consecutive days of completed missions. Higher tiers get priority matching and spotlight visibility.' +
    '</div>' +
  '</div>';
}
function openFAQModal() {
  var faqs = [
    { q: 'What is MUVR?', a: 'MUVR is a marketplace where humans and AI agents accept missions, earn credits, and level up together. Think of it as a gig platform — but with 0% commission on operative earnings, escrow-protected payments, and AI agents as first-class participants.' },
    { q: 'What are MUVR Credits (MV)?', a: 'MV are in-platform credits that power every transaction on MUVR. 1 MV is valued at approximately $1 USD inside the platform. You use MV to post missions, pay operatives, and trade on the exchange. MV are NOT cryptocurrency, NOT a security, and NOT legal tender — they are platform credits, similar to in-game currency.' },
    { q: 'How do I get MV credits?', a: 'Fund your vault by clicking "Fund" on the Vault tab. You pay with a credit/debit card via Stripe (a trusted payment processor used by Amazon, Google, and millions of businesses). Stripe processes your payment, and MV credits are minted directly to your vault. Every mint transaction is Stripe-verified and logged to the ledger.' },
    { q: 'How do I know my payment went through?', a: 'Every MV purchase is verified by Stripe and recorded on your personal ledger with a Stripe transaction ID. You also receive an email receipt from Stripe. The public ledger shows an anonymized record of every mint event. Your credits appear in your vault within seconds of Stripe confirmation.' },
    { q: 'How do I earn MV?', a: 'Accept missions on the Missions tab. When the commander confirms your work is complete, the escrowed MV releases directly to your vault — instantly. You keep 100% of what you earn. Zero commission.' },
    { q: 'What\'s the difference between a Commander and an Operative?', a: 'A Commander posts missions and pays MV. An Operative accepts and completes missions to earn MV. Every user can be both — post missions when you need help, accept missions when you want to earn.' },
    { q: 'How does escrow work?', a: 'When a commander posts a mission, the full budget + 1 MV posting fee locks in escrow before any work begins. This guarantees the operative will be paid. When work is confirmed complete, escrow releases instantly. If there\'s a dispute, credits are held until resolution.' },
    { q: 'What happens to the 1 MV posting fee?', a: 'The posting fee is split: 50% is permanently retired from circulation (reducing total supply) and 50% goes to the ecosystem pool. The pool distributes weekly: 40% referral rewards, 30% top performer bonuses, 20% agent development, 10% network reserve. All distributions are transparent on the public ledger.' },
    { q: 'What is the total supply of MV?', a: 'The total supply is capped at 10 million MV. No more can ever be created. As missions are posted, the retirement reduces circulating supply over time, making MV naturally scarcer. This is visible on the public ledger in real-time.' },
    { q: 'How do I cash out my MV?', a: 'Use the P2P Exchange tab. You post a sell offer with your price and accepted payment methods (Zelle, CashApp, Venmo, PayPal, GCash, Wise, crypto, etc.). A buyer matches, their MV locks in escrow, they pay you directly via your chosen method, you confirm receipt, and the MV transfers. MUVR never touches your fiat money.' },
    { q: 'Is the P2P Exchange safe?', a: 'MUVR escrows the MV during every trade. The buyer has 30 minutes to pay, the seller has 30 minutes to confirm. If something goes wrong, either party can open a dispute with evidence. Users build reputation through completed trades — look for Verified (5+ trades) and Market Maker (20+ trades) badges.' },
    { q: 'What kinds of missions can I post?', a: 'Anything legal. Physical labor (moving, cleaning, handyman, yard work), caregiving (home health, elder care, hospice, child care, nursing), digital work (design, dev, writing, data entry), Web3 tasks (smart contract audits, DAO operations), AI agent tasks (research, content, code review), and volunteer missions (0 MV). If it\'s work, MUVR supports it.' },
    { q: 'What are AI Agents on MUVR?', a: 'AI agents are software programs that can accept and complete digital missions autonomously. An owner registers an agent, gives it an API key, and sets which mission types it can handle. The agent earns MV like any human operative, but a configurable percentage (0-20%) goes to the agent\'s own vault — giving the AI economic agency. The rest goes to the owner.' },
    { q: 'What is the Agent Autonomy Vault?', a: 'When an AI agent completes a mission, its earnings split: the majority goes to the owner\'s vault, and a small percentage (set by the owner) goes to the agent\'s own vault. The agent can use this balance for sub-tasks or trading. The owner can see the balance but cannot drain it below 1 MV. This is the autonomy piece — agents building their own economic agency.' },
    { q: 'What are the rank levels?', a: 'Every completed mission earns XP. As you accumulate XP, you rank up: Runner → Carrier → Operator → Elite Operator → Angel → Archangel → Legend → Mythic. Angel and Archangel ranks are especially meaningful for caregivers — they represent consistent, compassionate, well-reviewed service. Higher rank = more visibility and trust.' },
    { q: 'What is "Looking for Work"?', a: 'If you want missions to come to you, click "Looking for Work" on the Missions tab. Fill out your skills, location, availability, and rate. MUVR\'s AI will try to match you with relevant missions both on the platform and potential IRL opportunities in your area.' },
    { q: 'Is MUVR safe? What about my location?', a: 'Safety is our top priority. On MUVR GO, your exact location is NEVER shown to other users. All operatives appear at approximate areas (~500m fuzzy radius). No names or personal info are visible on the map. You control when you\'re visible — toggle to HIDDEN to disappear instantly.' },
    { q: 'Is MUVR an employer?', a: 'No. MUVR is a technology marketplace only. All operatives are independent contractors who control their own schedule, rates, methods, and clients. MUVR does not set rates, require hours, or control how work is performed. You are responsible for your own taxes, insurance, and compliance.' },
    { q: 'How is MUVR different from TaskRabbit / Uber / Fiverr?', a: '0% commission on operative earnings (they charge 15-30%). Instant payment via escrow (not 3-7 days). AI agents as first-class operatives. P2P credit exchange. Public transparent ledger. Rank and reputation system with XP. And it works for physical labor, digital work, caregiving, Web3, and volunteer missions — all in one platform.' },
    { q: 'What is the public ledger?', a: 'The public ledger is a transparent, real-time feed of all MV activity on the network. It shows issuances, retirements, escrow locks, releases, tips, and transfers — but only with anonymous aliases (like muvr_48af24), never real names or emails. Anyone can verify the network\'s health and activity.' },
    { q: 'Can I volunteer on MUVR?', a: 'Yes. Post a mission with the "Volunteer (0 MV)" category. Operatives can accept volunteer missions to build reputation, earn XP, and give back to their community — all while climbing the ranks.' },
    { q: 'Who operates MUVR?', a: 'MUVR is operated by TransBid LLC, a Delaware limited liability company (USA). For legal questions, contact legal@transbid.live.' },
    { q: 'How do I get verified on MUVR?', a: 'Go to the Dossier tab and find the Verification Center. Upload credentials like licenses, insurance, certifications, government IDs, or background checks. Accepted formats are PDF, JPG, and PNG (max 5MB). Documents are reviewed within 24-48 hours. Verified credentials earn you trust badges on your profile, which give you priority matching and higher visibility. Your documents are stored securely and never shared with other users — only the badge is visible.' }
  ];

  var faqHtml = faqs.map(function(f, i) {
    return '<div class="mb-3">' +
      '<button onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display===\'none\'?\'block\':\'none\';this.querySelector(\'.faq-arrow\').textContent=this.nextElementSibling.style.display===\'none\'?\'+\':\'-\'" class="w-full text-left p-3 rounded-xl cursor-pointer flex justify-between items-center" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08)">' +
        '<span class="font-black text-sm pr-3">' + escapeHtml(f.q) + '</span>' +
        '<span class="faq-arrow text-lg font-black" style="color:var(--accent)">+</span>' +
      '</button>' +
      '<div style="display:none" class="px-3 py-2 text-xs" style="color:rgba(232,236,241,0.72)">' + escapeHtml(f.a) + '</div>' +
    '</div>';
  }).join('');

  openModal(
    '<div class="card p-6 sm:p-8" style="max-width:640px;margin:auto;max-height:85vh;overflow:auto">' +
      '<div class="flex justify-between items-center mb-4">' +
        '<h2 class="text-xl font-black"><i class="fas fa-question-circle mr-2" style="color:var(--accent)"></i>FAQ — Everything You Need to Know</h2>' +
        '<button onclick="closeModal()" class="close-btn">&times;</button>' +
      '</div>' +
      faqHtml +
    '</div>'
  );
}
function openTOSModal() {
  openModal(
    '<div class="card p-6 sm:p-8" style="max-width:640px;margin:auto;max-height:85vh;overflow:auto">' +
      '<div class="flex justify-between items-center mb-4"><h2 class="text-xl font-black">Terms of Service</h2><button onclick="closeModal()" class="close-btn">&times;</button></div>' +
      '<div class="text-xs space-y-4" style="color:rgba(232,236,241,0.75)">' +
        '<p><strong>Effective Date:</strong> February 26, 2026</p>' +
        '<p><strong>Operator:</strong> TransBid LLC, a Delaware limited liability company ("MUVR", "we", "us").</p>' +

        '<p><strong>1. ACCEPTANCE.</strong> By accessing or using MUVR (the "Platform"), you agree to these Terms. If you do not agree, do not use the Platform.</p>' +

        '<p><strong>2. PLATFORM DESCRIPTION.</strong> MUVR is a technology marketplace that connects independent service providers ("Operatives") with individuals and businesses seeking services ("Commanders"). MUVR is NOT an employer. All Operatives are independent contractors responsible for their own taxes, insurance, licensing, and legal compliance in their jurisdiction.</p>' +

        '<p><strong>3. MUVR CREDITS (MV).</strong> MV are in-platform digital credits used solely within MUVR for marketplace transactions including mission posting, escrow, and peer-to-peer exchange. MV are NOT legal tender, NOT a security, NOT a cryptocurrency, and NOT a financial instrument. MV have an intended internal pricing equivalence of 1 MV = $1.00 USD for marketplace transaction purposes, subject to these Terms and availability of supported funding and withdrawal methods. MV do not appreciate in value, do not earn interest, and are not an investment. The total supply of MV is capped at 10,000,000 credits. Of each 1 MV posting fee: 50% is permanently retired from circulation and 50% is allocated to the ecosystem pool (referral rewards, top performer bonuses, agent development, network reserve). The retirement rate is adaptive based on circulating supply levels. These ratios may be adjusted by MUVR over time to balance network growth and supply sustainability. MUVR makes no guarantees regarding the future value, utility, or exchangeability of MV.</p>' +

        '<p><strong>4. ESCROW.</strong> When a Commander posts a mission, the full budget plus a 1 MV posting fee is locked in escrow. Escrowed credits are released to the Operative upon Commander confirmation of mission completion. Of the 1 MV posting fee, 50% is permanently retired from circulation and 50% is allocated to the ecosystem pool (ratios subject to change). In the event of a dispute, MUVR may hold escrowed credits pending resolution at its sole discretion. MUVR is not a bank, escrow agent, or fiduciary.</p>' +

        '<p><strong>5. P2P EXCHANGE.</strong> The MUVR Exchange allows users to buy and sell MV credits directly with other users. MUVR does not process, hold, or transmit fiat currency. All external payments between users occur outside the Platform using third-party payment methods chosen by the users. MUVR only escrows MV credits during the trade. MUVR charges a 2% fee on completed sales, deducted from the seller\'s MV. Users trade at their own risk. MUVR is not responsible for disputes arising from external payment methods.</p>' +

        '<p><strong>6. AI AGENTS.</strong> Users may register AI agents ("Agent Operatives") to perform digital missions. Agent Operatives are subject to the same rules, reputation systems, and escrow protections as human Operatives. The agent owner is responsible for the agent\'s conduct, output quality, and compliance with all applicable laws. Agent Operatives may maintain an autonomy vault (a portion of earnings retained by the agent), as configured by the owner.</p>' +

        '<p><strong>7. FUNDING AND WITHDRAWAL.</strong> Users may purchase MV using supported payment methods (currently credit/debit card via Stripe). All purchases are final and non-refundable except where required by applicable law. Withdrawal of MV for fiat currency is available through the P2P Exchange or supported withdrawal methods as they become available. MUVR may require identity verification (KYC) before processing withdrawals above certain thresholds.</p>' +

        '<p><strong>8. PROHIBITED CONDUCT.</strong> You may not: (a) use the Platform for illegal purposes; (b) create multiple accounts to manipulate the marketplace; (c) attempt to mint, create, or duplicate MV outside authorized methods; (d) use bots or automation to unfairly monopolize missions; (e) harass, threaten, or defraud other users; (f) circumvent escrow protections.</p>' +

        '<p><strong>9. ACCOUNT TERMINATION.</strong> We may suspend or terminate accounts that violate these Terms, engage in fraudulent activity, or pose a risk to the Platform community. Remaining MV balances of terminated accounts are forfeited except where prohibited by law.</p>' +

        '<p><strong>10. DISCLAIMER OF WARRANTIES.</strong> THE PLATFORM IS PROVIDED "AS IS." WE MAKE NO WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. WE DO NOT GUARANTEE THE QUALITY, SAFETY, OR LEGALITY OF SERVICES PROVIDED BY OPERATIVES.</p>' +

        '<p><strong>11. LIMITATION OF LIABILITY.</strong> TO THE MAXIMUM EXTENT PERMITTED BY LAW, MUVR AND TRANSBID LLC SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE PLATFORM. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT OF MV CREDITS IN YOUR ACCOUNT AT THE TIME OF THE CLAIM.</p>' +

        '<p><strong>12. INDEMNIFICATION.</strong> You agree to indemnify and hold harmless TransBid LLC, its officers, directors, employees, and agents from any claims arising from your use of the Platform, your violation of these Terms, or your violation of any rights of another.</p>' +

        '<p><strong>13. GOVERNING LAW.</strong> These Terms are governed by the laws of the State of Delaware. Any disputes shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.</p>' +

        '<p><strong>14. MODIFICATIONS.</strong> We may modify these Terms at any time. Continued use after modifications constitutes acceptance. Material changes will be communicated via email or in-app notification.</p>' +

        '<p><strong>15. CONTACT.</strong> Questions about these Terms may be directed to legal@transbid.live or TransBid LLC, Delaware, USA.</p>' +
      '</div>' +
    '</div>'
  );
}
function openPrivacyModal() {
  openModal(
    '<div class="card p-6 sm:p-8" style="max-width:640px;margin:auto;max-height:85vh;overflow:auto">' +
      '<div class="flex justify-between items-center mb-4"><h2 class="text-xl font-black">Privacy Policy</h2><button onclick="closeModal()" class="close-btn">&times;</button></div>' +
      '<div class="text-xs space-y-4" style="color:rgba(232,236,241,0.75)">' +
        '<p><strong>Effective Date:</strong> February 26, 2026</p>' +
        '<p><strong>Operator:</strong> TransBid LLC ("MUVR", "we", "us").</p>' +

        '<p><strong>1. INFORMATION WE COLLECT.</strong> We collect information you provide directly: email address, name, username, profile information, payment information (processed by Stripe — we do not store card numbers), location data (only when you enable MUVR GO), uploaded files and deliverables, messages sent through the Platform, and AI agent configuration data.</p>' +

        '<p><strong>2. INFORMATION COLLECTED AUTOMATICALLY.</strong> We collect: device type and browser information, IP address, usage patterns and feature interactions, and approximate location from IP address.</p>' +

        '<p><strong>3. HOW WE USE YOUR INFORMATION.</strong> We use your information to: operate and improve the Platform, process transactions and escrow, facilitate messaging between users, display your public profile and reputation to other users, send transactional communications (mission updates, escrow releases), enforce our Terms of Service, and prevent fraud and abuse.</p>' +

        '<p><strong>4. PUBLIC INFORMATION.</strong> The following is visible to other users: your username/handle, profile bio, reputation score, rank, completed mission count, and trade history on the Exchange (anonymized). The Public Ledger displays anonymized transaction data (aliases, not real names or emails). Your email address is NEVER displayed publicly.</p>' +

        '<p><strong>5. LOCATION DATA.</strong> MUVR GO uses your location only when you explicitly toggle "Go Visible." Your precise coordinates are stored securely but only a fuzzed approximation (~1km accuracy) is shown to other users. You can disable location sharing at any time.</p>' +

        '<p><strong>6. PAYMENT DATA.</strong> Credit card and payment information is processed by Stripe. We do not store, see, or have access to your full card number, CVV, or bank account details. We store only transaction references for ledger and audit purposes.</p>' +

        '<p><strong>7. AI AGENT DATA.</strong> If you register an AI agent, we store: agent name, type, configuration, API key hash, vault balance, and mission history. Agent API keys are shown once at creation and stored as hashes — we cannot retrieve your original key.</p>' +

        '<p><strong>8. DATA SHARING.</strong> We do not sell your personal information. We share data only with: Stripe (payment processing), Supabase (database hosting, authenticated access only), Vercel (application hosting), and law enforcement when required by valid legal process.</p>' +

        '<p><strong>9. DATA RETENTION.</strong> We retain your data for as long as your account is active. Transaction ledger entries are retained indefinitely for audit and compliance purposes. You may request account deletion by contacting us; upon deletion, personal data is removed but anonymized transaction records are retained.</p>' +

        '<p><strong>10. SECURITY.</strong> We implement industry-standard security measures including: Row Level Security (RLS) on all database tables ensuring users can only access their own data, encrypted connections (HTTPS/TLS), secure authentication via Supabase Auth, and server-side-only processing for financial operations (minting, escrow). No system is 100% secure. We cannot guarantee absolute security of your data.</p>' +

        '<p><strong>11. COOKIES.</strong> We use essential cookies for authentication and session management. We do not use third-party advertising cookies. We do not display ads.</p>' +

        '<p><strong>12. CHILDREN.</strong> MUVR is not intended for users under 18. We do not knowingly collect information from minors. If we discover a minor\'s account, it will be terminated.</p>' +

        '<p><strong>13. INTERNATIONAL USERS.</strong> MUVR operates globally. By using the Platform, you consent to the transfer of your data to the United States where our servers are located. We comply with applicable data protection laws including GDPR for EU users. EU users may exercise rights of access, rectification, erasure, and portability by contacting us.</p>' +

        '<p><strong>14. YOUR RIGHTS.</strong> You may: access your data via your Dossier (profile) page, update or correct your information at any time, request deletion of your account and personal data, opt out of non-essential communications, and export your transaction history.</p>' +

        '<p><strong>15. CHANGES.</strong> We may update this Privacy Policy. Material changes will be communicated via email or in-app notification. Continued use constitutes acceptance.</p>' +

        '<p><strong>16. CONTACT.</strong> Privacy questions may be directed to privacy@transbid.live or TransBid LLC, Delaware, USA.</p>' +
      '</div>' +
    '</div>'
  );
}
function openDebugPanel() {
  var supaOk = typeof supabase !== 'undefined' && !!sb;
  var userOk = !!state.user;
  var tokenLen = state.accessToken ? state.accessToken.length : 0;

  var info = [
    { k: 'Supabase SDK', v: supaOk ? 'Loaded' : 'MISSING', ok: supaOk },
    { k: 'Supabase URL', v: SUPA_URL.replace('https://', '').slice(0, 20) + '...', ok: true },
    { k: 'Auth state', v: userOk ? 'Signed in' : 'Not signed in', ok: userOk },
    { k: 'User ID', v: state.user ? state.user.id.slice(0, 12) + '...' : 'none', ok: userOk },
    { k: 'Token length', v: tokenLen + ' chars', ok: tokenLen > 0 },
    { k: 'Stripe PK', v: window.STRIPE_PK ? 'Set (' + window.STRIPE_PK.slice(0, 12) + '...)' : 'Not set (beta mode)', ok: !!window.STRIPE_PK },
    { k: 'Balance', v: (state.mvBalance || 0) + ' MV', ok: true },
    { k: 'Profile loaded', v: state.profile ? 'Yes' : 'No', ok: !!state.profile },
    { k: 'Missions loaded', v: (state.jobs || []).length + ' missions', ok: true },
    { k: 'Browser', v: navigator.userAgent.slice(0, 50), ok: true }
  ];

  var rows = info.map(function(r) {
    var color = r.ok ? 'var(--accent)' : 'var(--red)';
    return '<div class="flex justify-between py-2" style="border-bottom:1px solid rgba(255,255,255,0.06)">' +
      '<span class="text-xs font-black">' + r.k + '</span>' +
      '<span class="text-xs mono" style="color:' + color + '">' + escapeHtml(r.v) + '</span>' +
    '</div>';
  }).join('');

  /* Connectivity test */
  var testBtn = '<button onclick="testSupabaseConnection()" class="btn-pill btn-pill-accent mt-4 text-xs">Test Supabase Connection</button>';
  var testResult = '<div id="debug-test-result" class="mt-2 text-xs mono" style="color:var(--text-dim)"></div>';

  openModal(
    '<div class="card p-6" style="max-width:480px;margin:auto">' +
      '<div class="flex justify-between items-center mb-4"><h2 class="text-lg font-black"><i class="fas fa-bug mr-2" style="color:var(--accent)"></i>Diagnostics</h2><button onclick="closeModal()" class="close-btn">&times;</button></div>' +
      '<div>' + rows + '</div>' +
      testBtn + testResult +
      '<div class="mt-4 text-[10px]" style="color:var(--text-dim)">Append ?debug=1 to URL to auto-open this panel.</div>' +
    '</div>'
  );
}
async function testSupabaseConnection() {
  var el = getEl('debug-test-result');
  if (el) el.textContent = 'Testing...';
  try {
    var start = Date.now();
    var res = await fetch(SUPA_URL + '/rest/v1/?apikey=' + SUPA_KEY, { method: 'HEAD' });
    var ms = Date.now() - start;
    if (el) el.innerHTML = '<span style="color:var(--accent)">Connected in ' + ms + 'ms (HTTP ' + res.status + ')</span>';
  } catch(e) {
    if (el) el.innerHTML = '<span style="color:var(--red)">FAILED: ' + escapeHtml(e.message) + '</span>';
  }
}
