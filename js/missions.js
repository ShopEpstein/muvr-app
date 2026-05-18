function getCatCount(catKey) {
  if (catKey === 'all') return state.jobs.length;
  return state.jobs.filter(function(j) { return j.category === catKey; }).length;
}
async function loadBrowseOperatives() {
  try {
    var res = await apiRequest('users?is_available=eq.true&role=in.(worker,both)&order=rating.desc&limit=20&select=id,full_name,username,rating,jobs_completed,trust_score,is_available,last_location_update,skills,avatar_emoji');
    state.browseOperatives = (res && res.ok) ? await res.json() : [];
  } catch(e) { state.browseOperatives = []; }
}
async function loadMissionEstimate(category) {
  try {
    var res = await apiRequest('jobs?category=eq.' + category + '&status=eq.paid&select=budget_mv&order=created_at.desc&limit=20');
    var data = (res && res.ok) ? await res.json() : [];
    if (data.length < 3) return null;
    var budgets = data.map(function(j) { return Number(j.budget_mv || 0); }).sort(function(a,b) { return a-b; });
    var p25 = budgets[Math.floor(budgets.length * 0.25)];
    var p75 = budgets[Math.floor(budgets.length * 0.75)];
    return { low: p25, high: p75, count: data.length };
  } catch(e) { return null; }
}
function checkOnboardingDismissed() {
  try { return localStorage.getItem('muvr_onboarding_dismissed') === '1'; } catch(e) { return false; }
}
function dismissOnboarding() {
  try { localStorage.setItem('muvr_onboarding_dismissed', '1'); } catch(e) {}
  state.onboardingDismissed = true;
  renderJobsTab();
}
function renderOnboardingCard() {
  if (state.onboardingDismissed || checkOnboardingDismissed()) return '';
  var bal = Number((state.profile && state.profile.mv_balance) || 0);
  var missions = Number((state.profile && state.profile.jobs_completed) || 0);
  if (bal > 0 || missions > 0) return '';
  return '<div class="onboarding-card fade-up" data-testid="onboarding-card">' +
    '<button onclick="dismissOnboarding()" class="dismiss-btn" data-testid="button-dismiss-onboarding">&times;</button>' +
    '<div class="flex items-center gap-3 mb-3">' + muxiSVG(32) + '<h3 class="text-lg font-black">Welcome to MUVR™</h3></div>' +
    '<p class="text-sm mb-4" style="color:var(--text-mid)">You’re in. Here’s how to get started:</p>' +
    '<div class="space-y-2 mb-4">' +
      '<p class="text-sm" style="color:var(--text-bright)"><span style="color:var(--accent)" class="font-black">1.</span> Complete a mission → earn MV credits</p>' +
      '<p class="text-sm" style="color:var(--text-bright)"><span style="color:var(--accent)" class="font-black">2.</span> Buy MV on the P2P Exchange</p>' +
      '<p class="text-sm" style="color:var(--text-bright)"><span style="color:var(--accent)" class="font-black">3.</span> Post your own mission</p>' +
    '</div>' +
    '<p class="text-xs mb-4" style="color:var(--text-dim)">Workers keep 100%. Zero commission. The more missions complete, the more credits retire, the scarcer MV becomes.</p>' +
    '<div class="flex gap-3">' +
      '<button onclick="dismissOnboarding()" class="btn-pill btn-pill-accent" data-testid="button-browse-missions">Browse Missions</button>' +
      '<button onclick="dismissOnboarding();switchTab(\'exchange\')" class="btn-pill btn-pill-ghost" data-testid="button-goto-exchange">Go to Exchange</button>' +
    '</div>' +
  '</div>';
}

function openRatingModal(jobId, ratedUserId, ratedName) {
  openModal(
    '<div class="card p-6" style="max-width:420px;margin:auto">' +
      '<div class="flex justify-between items-center mb-4"><h2 class="text-lg font-black">Rate @' + escapeHtml(ratedName || 'user') + '</h2><button onclick="closeModal()" class="close-btn">&times;</button></div>' +
      '<p class="text-sm mb-4" style="color:var(--text-mid)">How was your experience?</p>' +
      '<div id="rating-stars" class="flex gap-2 justify-center mb-4">' +
        [1,2,3,4,5].map(function(n) {
          return '<span class="rating-star" data-score="' + n + '" onclick="selectRating(' + n + ')" data-testid="star-' + n + '">★</span>';
        }).join('') +
      '</div>' +
      '<input type="hidden" id="rating-score" value="0">' +
      '<input type="hidden" id="rating-job-id" value="' + jobId + '">' +
      '<input type="hidden" id="rating-user-id" value="' + ratedUserId + '">' +
      '<textarea id="rating-feedback" placeholder="Optional feedback..." rows="2" maxlength="500" class="field mb-3" style="resize:none"></textarea>' +
      '<button onclick="submitRating()" class="btn-primary rounded-full" data-testid="button-submit-rating">Submit Rating</button>' +
    '</div>'
  );
}

function selectRating(score) {
  var input = getEl('rating-score');
  if (input) input.value = score;
  document.querySelectorAll('.rating-star').forEach(function(s) {
    s.classList.toggle('active', parseInt(s.getAttribute('data-score')) <= score);
  });
}

async function submitRating() {
  var score = parseInt((getEl('rating-score') || {}).value) || 0;
  var jobId = (getEl('rating-job-id') || {}).value;
  var ratedId = (getEl('rating-user-id') || {}).value;
  var feedback = ((getEl('rating-feedback') || {}).value || '').trim();
  if (score < 1 || score > 5) return showToast('Select a rating (1-5 stars)', 'error');
  try {
    setMuxi('Submitting rating...');
    var res = await apiRequest('rpc/submit_rating', {
      method: 'POST',
      body: JSON.stringify({ p_rater_id: state.user.id, p_rated_id: ratedId, p_job_id: jobId, p_score: score, p_feedback: feedback })
    });
    if (res && res.ok) {
      closeModal();
      showToast('Rating submitted! ' + '⭐'.repeat(score));
      setMuxi('Reputation matters. Every rating shapes the network.');
    } else {
      var errText = ''; try { errText = await res.text(); } catch(e) {}
      showToast('Rating error: ' + (errText || 'unknown'), 'error');
    }
  } catch(e) { showToast('Rating error: ' + (e.message || ''), 'error'); }
}
function openPostJobModalWithCategory(catKey) {
  openPostJobModal();
  setTimeout(function() {
    var sel = getEl('job-type');
    if (sel && catKey && catKey !== 'all') sel.value = catKey;
  }, 100);
}

async function hireAgain(jobId) {
  var job = (state.myGigs || []).find(function(j) { return j.id === jobId; });
  if (!job) return showToast('Job not found', 'error');
  openPostJobModal();
  setTimeout(function() {
    var titleEl = getEl('job-title');
    var typeEl = getEl('job-type');
    var budgetEl = getEl('job-budget');
    if (titleEl && job.title) titleEl.value = job.title;
    if (typeEl && job.category) typeEl.value = job.category;
    if (budgetEl && job.budget_mv) { budgetEl.value = job.budget_mv; updateJobFee(); }
  }, 100);
}
async function loadUnreadCounts() {
  if (!state.user) return;
  try {
    var appRes = await apiRequest('applications?status=eq.pending&select=job_id');
    var pendingApps = (appRes && appRes.ok) ? await appRes.json() : [];
    var myJobIds = (state.myGigs || []).map(function(j) { return j.id; });
    state.unreadAppsCount = pendingApps.filter(function(a) { return myJobIds.indexOf(a.job_id) >= 0; }).length;
  } catch(e) { state.unreadAppsCount = 0; }
  updateTabBadges();
}

function updateTabBadges() {
  var commsBadge = document.querySelector('[data-tab="messages"] .tab-badge');
  var missionBadge = document.querySelector('[data-tab="jobs"] .tab-badge');
  if (!commsBadge && state.unreadMsgCount > 0) {
    var btn = document.querySelector('[data-tab="messages"]');
    if (btn) btn.insertAdjacentHTML('beforeend', '<span class="tab-badge" data-testid="badge-comms">' + state.unreadMsgCount + '</span>');
  } else if (commsBadge) {
    if (state.unreadMsgCount > 0) commsBadge.textContent = state.unreadMsgCount;
    else commsBadge.remove();
  }
  if (!missionBadge && state.unreadAppsCount > 0) {
    var btn2 = document.querySelector('[data-tab="jobs"]');
    if (btn2) btn2.insertAdjacentHTML('beforeend', '<span class="tab-badge" data-testid="badge-missions">' + state.unreadAppsCount + '</span>');
  } else if (missionBadge) {
    if (state.unreadAppsCount > 0) missionBadge.textContent = state.unreadAppsCount;
    else missionBadge.remove();
  }
}
function renderBrowseOperatives() {
  return '<div id="browse-operatives" class="mt-6">' + renderBrowseOperativesInner() + '</div>';
}

function renderBrowseOperativesInner() {
  if (!state.browseOperatives || state.browseOperatives.length === 0) return '';
  return '<div class="mb-2 flex items-center justify-between">' +
    '<h3 class="font-black text-sm"><i class="fas fa-users mr-1" style="color:var(--accent)"></i>Browse Operatives</h3>' +
    '<span class="text-[10px]" style="color:var(--text-dim)">' + state.browseOperatives.length + ' available</span>' +
  '</div>' +
  '<div class="operative-scroll">' +
    state.browseOperatives.map(function(u) {
      var name = u.full_name || u.username || 'Operative';
      var rating = Number(u.rating || 0);
      return '<div class="operative-card" onclick="startConvoFromJob(null,\'' + u.id + '\')" data-testid="operative-card-' + (u.id || '').slice(0,8) + '">' +
        getAvatarCircle(name, 36) +
        '<div class="mt-2">' +
          '<p class="text-xs font-black truncate">' + getStatusDot(u) + escapeHtml(name) + '</p>' +
          '<p class="text-[10px] mt-1">' + (rating > 0 ? '⭐ ' + rating.toFixed(1) : '☆ New') + '</p>' +
          '<div class="mt-1">' + getXpBadge(u) + '</div>' +
        '</div>' +
      '</div>';
    }).join('') +
  '</div>';
}

function loadEstimateForCategory(category) {
  var el = getEl('cost-estimate');
  var txt = getEl('cost-estimate-text');
  if (!el || !txt || !category) { if (el) el.classList.add('hidden'); return; }
  txt.textContent = 'Checking typical budgets...';
  el.classList.remove('hidden');
  loadMissionEstimate(category).then(function(est) {
    if (est) {
      txt.innerHTML = muxiSVGSmall(14) + ' Similar missions: typically <strong>' + est.low + '-' + est.high + ' MV</strong> (based on ' + est.count + ' completed)';
    } else {
      txt.innerHTML = '\u{1F31F} Be the first to post in this category!';
    }
  });
}
function renderJobsTab() {
  var c = getEl('tab-content');
  if (!c) return;

  /* Check if viewing My Gigs */
  if (state.myGigsView) { renderMyGigsView(); return; }

  var filtered = state.jobFilter === 'all' ? state.jobs.slice() : state.jobs.filter(function(j) { return j.category === state.jobFilter; });
  filtered.sort(function(a, b) { return (a.urgency === 'asap' ? 0 : 1) - (b.urgency === 'asap' ? 0 : 1); });

  var topCats = MISSION_CATEGORIES.slice(0, 9);
  var catTiles = '<div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mb-5">' +
    topCats.map(function(cat) {
      var count = getCatCount(cat.k);
      return '<div class="cat-tile' + (state.jobFilter === cat.k ? ' active' : '') + '" onclick="state.jobFilter=\'' + cat.k + '\';renderJobsTab()" data-testid="cat-tile-' + cat.k + '">' +
        (count > 0 && cat.k !== 'all' ? '<span class="cat-count">' + count + '</span>' : '') +
        '<span class="cat-emoji">' + cat.emoji + '</span>' +
        '<span class="cat-name">' + cat.l + '</span>' +
      '</div>';
    }).join('') +
  '</div>';

  var moreCats = MISSION_CATEGORIES.slice(9);
  var morePills = moreCats.map(function(cat) {
    var count = getCatCount(cat.k);
    return '<button onclick="state.jobFilter=\'' + cat.k + '\';renderJobsTab()" class="btn-pill ' + (state.jobFilter === cat.k ? 'btn-pill-accent' : 'btn-pill-ghost') + '" data-testid="cat-pill-' + cat.k + '">' + cat.emoji + ' ' + cat.l + (count > 0 ? ' (' + count + ')' : '') + '</button>';
  }).join('');

  var cards = '';
  if (filtered.length === 0) {
    cards = '<div class="col-span-full text-center py-16" style="color:rgba(232,236,241,0.55)">' +
      '<div class="mb-4">' + muxiSVG(64) + '</div>' +
      '<p class="font-black text-lg mb-1">No missions here yet</p>' +
      '<p class="text-sm" style="color:var(--text-dim)">Muxi says: be the first to post one. The early operative gets the XP.</p>' +
      '<div class="mt-6 max-w-sm mx-auto"><button onclick="openPostJobModal()" class="btn-primary rounded-full">Post a Mission</button></div>' +
    '</div>';
  } else {
    cards = filtered.map(function(job) {
      var isMyJob = job.poster_id === (state.user && state.user.id);
      var urgencyColors = { asap: 'var(--red)', today: 'var(--yellow)', this_week: 'var(--accent-2)', flexible: 'var(--text-dim)' };
      var urgColor = urgencyColors[job.urgency] || 'var(--text-dim)';

      var isUrgent = (job.urgency === 'asap');
      return '<div class="card card-interactive p-5' + (isUrgent ? ' mission-urgent' : '') + '">' +
        (isUrgent ? '<span class="urgent-tag" data-testid="tag-urgent">⚡ URGENT</span>' : '') +
        '<div class="flex items-start justify-between mb-2">' +
          '<h3 class="font-black text-sm flex-1 mr-2">' + escapeHtml(job.title) + '</h3>' +
          '<div class="flex gap-1">' +
            '<span class="text-[10px] px-2 py-1 rounded-full font-black" style="background:rgba(255,255,255,0.06);color:rgba(232,236,241,0.65);border:1px solid rgba(255,255,255,0.10)">' + escapeHtml(job.category || '') + '</span>' +
            '<span class="text-[10px] px-2 py-1 rounded-full font-black" style="color:' + urgColor + ';border:1px solid ' + urgColor + '30">' + escapeHtml(job.urgency || '') + '</span>' +
          '</div>' +
        '</div>' +
        '<p class="text-xs line-clamp-2 mb-3" style="color:rgba(232,236,241,0.56)">' + escapeHtml(job.description || '') + '</p>' +
        (job.address ? '<p class="text-[11px] mb-3 flex items-center gap-1" style="color:rgba(232,236,241,0.45)"><i class="fas fa-map-marker-alt" style="color:var(--accent-3)"></i>' + escapeHtml(job.address) + '</p>' : '') +
        '<div class="flex items-end justify-between">' +
          '<div>' +
            '<p class="text-[10px] font-black tracking-widest" style="color:rgba(232,236,241,0.45)">BUDGET</p>' +
            '<p class="text-lg font-black mono" style="color:var(--accent)">' + Number(job.budget_mv || 0) + ' <span style="color:var(--accent)">MV</span></p>' +
          '</div>' +
          '<div class="flex gap-2">' +
            (isMyJob ? '<span class="text-[10px] font-black px-3 py-2 rounded-full" style="background:rgba(255,255,255,0.06);color:var(--text-dim)">YOUR MISSION</span>' :
              '<button onclick="openApplyModal(\'' + job.id + '\')" class="btn-pill btn-pill-accent">Accept</button>' +
              '<button onclick="startConvoFromJob(\'' + job.id + '\',\'' + job.poster_id + '\')" class="btn-pill btn-pill-ghost" title="Message poster"><i class="fas fa-comment"></i></button>'
            ) +
          '</div>' +
        '</div>' +
        '<div class="mt-3 pt-3 flex items-center justify-between text-[10px]" style="border-top:1px solid rgba(255,255,255,0.06)">' +
          '<span style="color:var(--text-dim)">' + relTime(job.created_at) + '</span>' +
          '<div class="flex gap-2 items-center">' +
            '<button onclick="event.stopPropagation();shareGig(\'' + job.id + '\')" class="text-[10px]" style="color:var(--text-dim);background:none;border:none;cursor:pointer" title="Share mission"><i class="fas fa-share-alt"></i></button>' +
            '<span style="color:var(--text-dim)">ID: ' + escapeHtml((job.id || '').slice(0,8)) + '</span>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  c.innerHTML = '<div class="fade-up">' +
    '<div class="mb-6 flex items-start justify-between gap-3">' +
      '<div>' +
        '<h1 class="text-3xl sm:text-4xl font-black mb-1">Open Missions</h1>' +
        '<p class="text-sm" style="color:rgba(232,236,241,0.65)">It\'s UR <span style="color:var(--accent)">M</span>U<span style="color:var(--accent)">V</span>. ' + state.jobs.length + ' mission' + (state.jobs.length !== 1 ? 's' : '') + ' open.</p>' +
      '</div>' +
      '<div class="flex gap-2 flex-wrap">' +
        (state.user ? '<button onclick="state.myGigsView=true;renderJobsTab();loadMyGigs()" class="btn-pill btn-pill-ghost"><i class="fas fa-satellite mr-1"></i>Command Center</button>' : '') +
        (state.user ? '<button onclick="openRequestMissionModal()" class="btn-pill btn-pill-ghost"><i class="fas fa-hand-paper mr-1"></i>Looking for Work</button>' : '') +
        '<div class="hidden sm:block"><button onclick="openPostJobModal()" class="btn-pill btn-pill-accent">+ Post a Mission</button></div>' +
      '</div>' +
    '</div>' +
    catTiles +
    (morePills ? '<div class="flex gap-2 mb-3 overflow-x-auto pb-1">' + morePills + '</div>' : '') +
    renderOnboardingCard() +
    '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">' + cards + '</div>' +
    '<div class="sm:hidden mt-5"><button onclick="openPostJobModal()" class="btn-primary rounded-full" data-testid="button-post-mission-mobile">Post a Mission</button></div>' +
    renderBrowseOperatives() +
  '</div>';
}


/* =============================================================================
   MY GIGS VIEW - Job Lifecycle Management
   Flow: open -> awarded -> in_progress -> completed -> paid
============================================================================= */
var JOB_STATUS_CONFIG = {
  open:        { label: 'OPEN',        color: 'var(--accent)',   icon: '&#128994;', step: 0 },
  awarded:     { label: 'AWARDED',     color: 'var(--yellow)',   icon: '&#127942;', step: 1 },
  in_progress: { label: 'IN PROGRESS', color: 'var(--accent-2)', icon: '&#9889;',   step: 2 },
  completed:   { label: 'COMPLETED',   color: 'var(--accent-3)', icon: '&#9989;',   step: 3 },
  paid:        { label: 'PAID',        color: 'var(--accent)',   icon: '&#128176;', step: 4 },
  cancelled:   { label: 'CANCELLED',   color: 'var(--red)',      icon: '&#10060;', step: -1 },
  disputed:    { label: 'DISPUTED',    color: 'var(--red)',      icon: '&#9888;',  step: -1 }
};

async function loadMyGigs() {
  if (!state.user) return;
  try {
    /* Jobs I posted (any status) */
    var res = await apiRequest('jobs?poster_id=eq.' + state.user.id + '&select=*&order=created_at.desc');
    state.myGigs = (res && res.ok) ? await res.json() : [];
    console.log('[MyGigs] posted:', state.myGigs.length);
    /* Jobs I applied to or am working - include pending so workers see their applications */
    var workRes = await apiRequest('applications?worker_id=eq.' + state.user.id + '&select=*&order=created_at.desc');
    var myApps = (workRes && workRes.ok) ? await workRes.json() : [];
    console.log('[MyGigs] my apps:', myApps.length, myApps.map(function(a) { return a.status; }));
    if (myApps.length > 0) {
      var jobIds = myApps.map(function(a) { return a.job_id; }).filter(Boolean);
      var unique = jobIds.filter(function(v, i, a) { return a.indexOf(v) === i; });
      var jobRes = await apiRequest('jobs?id=in.(' + unique.join(',') + ')&select=*');
      var jobData = (jobRes && jobRes.ok) ? await jobRes.json() : [];
      state.myActiveWork = jobData.map(function(j) {
        var app = myApps.find(function(a) { return a.job_id === j.id; });
        j._myApp = app;
        return j;
      });
    } else {
      state.myActiveWork = [];
    }
    console.log('[MyGigs] activeWork:', state.myActiveWork.length, state.myActiveWork.map(function(w) { return (w._myApp ? w._myApp.status : '?') + '/' + w.status; }));
    /* Load deliverables for active jobs */
    var activeJobIds = state.myActiveWork.filter(function(j) {
      return j._myApp && j._myApp.status !== 'rejected' && j._myApp.status !== 'pending';
    }).map(function(j) { return j.id; });
    if (activeJobIds.length > 0) {
      try {
        var delRes = await apiRequest('job_deliverables?job_id=in.(' + activeJobIds.join(',') + ')&select=*&order=created_at.desc');
        state.deliverables = (delRes && delRes.ok) ? await delRes.json() : [];
      } catch(e) { state.deliverables = []; }
    } else { state.deliverables = []; }
    if (state.myGigsView && state.currentTab === 'jobs') renderMyGigsView();
  } catch(e) { console.error('loadMyGigs error:', e); }
}

function renderProgressBar(status) {
  var steps = ['open', 'awarded', 'in_progress', 'completed', 'paid'];
  var currentIdx = steps.indexOf(status);
  if (currentIdx < 0) currentIdx = 0;
  return '<div class="flex items-center gap-1 my-4">' +
    steps.map(function(s, i) {
      var active = i <= currentIdx;
      var sConf = JOB_STATUS_CONFIG[s];
      return '<div class="flex-1 text-center">' +
        '<div class="h-2 rounded-full mb-1" style="background:' + (active ? sConf.color : 'rgba(255,255,255,0.08)') + '"></div>' +
        '<span class="text-[9px] font-black" style="color:' + (active ? sConf.color : 'var(--text-dim)') + '">' + sConf.label + '</span>' +
      '</div>';
    }).join('') +
  '</div>';
}

function renderMyGigsView() {
  var c = getEl('tab-content');
  if (!c) return;

  var myGigsFilter = state.myGigsFilter || 'posted';

  var postedHtml = '';
  var workHtml = '';
  var appliedHtml = '';

  if (myGigsFilter === 'posted') {
    if (state.myGigs.length === 0) {
      postedHtml = '<div class="text-center py-12" style="color:var(--text-dim)">' + muxiSVG(48) +
        '<p class="font-black mt-3">No missions deployed yet</p>' +
        '<p class="text-sm mt-1">Post your first mission to get started.</p>' +
        '<button onclick="openPostJobModal()" class="btn-pill btn-pill-accent mt-4">Post a Mission</button></div>';
    } else {
      postedHtml = state.myGigs.map(function(job) {
        var sc = JOB_STATUS_CONFIG[job.status] || JOB_STATUS_CONFIG.open;
        var apps = Number(job.applicant_count || 0);
        return '<div class="card p-5 mb-3 cursor-pointer" onclick="openJobManageModal(\'' + job.id + '\')">' +
          '<div class="flex items-start justify-between mb-2">' +
            '<div class="flex-1 mr-3">' +
              '<h3 class="font-black text-sm">' + escapeHtml(job.title) + '</h3>' +
              '<p class="text-[11px] mt-1" style="color:var(--text-dim)">' + escapeHtml(job.description || '').substring(0, 80) + '</p>' +
            '</div>' +
            '<span class="text-[10px] font-black px-2 py-1 rounded-full whitespace-nowrap" style="color:' + sc.color + ';border:1px solid ' + sc.color + '40;background:' + sc.color + '15">' + sc.icon + ' ' + sc.label + '</span>' +
          '</div>' +
          renderProgressBar(job.status) +
          '<div class="flex items-center justify-between" style="border-top:1px solid rgba(255,255,255,0.06);padding-top:12px">' +
            '<div class="flex gap-4 text-[11px]">' +
              '<span style="color:var(--accent)" class="font-black">' + Number(job.budget_mv || 0) + ' <span style="color:var(--accent)">MV</span></span>' +
              '<span style="color:var(--text-dim)">' + relTime(job.created_at) + '</span>' +
            '</div>' +
            (job.status === 'open' ? '<span class="text-[10px] font-black px-2 py-1 rounded-full" style="background:rgba(255,255,255,0.06);color:' + (apps > 0 ? 'var(--yellow)' : 'var(--text-dim)') + '">' + apps + ' applicant' + (apps !== 1 ? 's' : '') + ' - Tap to manage</span>' :
              '<span class="text-[10px] font-black" style="color:var(--text-dim)">Tap to manage</span>') +
          '</div>' +
        '</div>';
      }).join('');
    }
  } else if (myGigsFilter === 'work') {
    /* Active work - awarded/in_progress/completed jobs */
    var activeWork = state.myActiveWork.filter(function(j) {
      return j._myApp && (j._myApp.status === 'accepted' || j._myApp.status === 'in_progress' || j._myApp.status === 'completed' || j._myApp.status === 'paid');
    });
    if (activeWork.length === 0) {
      workHtml = '<div class="text-center py-12" style="color:var(--text-dim)">' + muxiSVG(48) +
        '<p class="font-black mt-3">No active work</p>' +
        '<p class="text-sm mt-1">When you get deployed on a mission, it shows up here.</p>' +
        '<button onclick="state.myGigsView=false;renderJobsTab()" class="btn-pill btn-pill-accent mt-4">Browse gigs</button></div>';
    } else {
      workHtml = activeWork.map(function(job) {
        var sc = JOB_STATUS_CONFIG[job.status] || JOB_STATUS_CONFIG.open;
        var canStart = (job.status === 'awarded');
        var canMarkDone = (job.status === 'in_progress');
        var isPaid = (job.status === 'paid');
        var isComplete = (job.status === 'completed');
        /* Count deliverables for this job */
        var delivCount = (state.deliverables || []).filter(function(d) { return d.job_id === job.id; }).length;

        return '<div class="card p-5 mb-3 cursor-pointer" onclick="openWorkerJobModal(\'' + job.id + '\')">' +
          '<div class="flex items-start justify-between mb-2">' +
            '<div class="flex-1 mr-3">' +
              '<h3 class="font-black text-sm">' + escapeHtml(job.title) + '</h3>' +
              '<p class="text-[11px] mt-1" style="color:var(--text-dim)">' + escapeHtml(job.description || '').substring(0, 100) + '</p>' +
            '</div>' +
            '<span class="text-[10px] font-black px-2 py-1 rounded-full whitespace-nowrap" style="color:' + sc.color + ';border:1px solid ' + sc.color + '40;background:' + sc.color + '15">' + sc.icon + ' ' + sc.label + '</span>' +
          '</div>' +

          renderProgressBar(job.status) +

          /* Deliverables summary */
          (delivCount > 0 ? '<div class="mb-3 p-2 rounded-lg text-[11px]" style="background:rgba(255,255,255,0.04)"><i class="fas fa-paperclip mr-1" style="color:var(--accent-2)"></i>' + delivCount + ' deliverable' + (delivCount !== 1 ? 's' : '') + ' submitted</div>' : '') +

          '<div class="flex items-center justify-between pt-3" style="border-top:1px solid rgba(255,255,255,0.06)">' +
            '<span class="text-sm font-black" style="color:var(--accent)">' + Number(job.budget_mv || 0) + ' <span style="color:var(--accent)">MV</span></span>' +
            '<span class="text-[10px] font-black" style="color:var(--text-dim)">Tap to manage <i class="fas fa-chevron-right ml-1"></i></span>' +
          '</div>' +
        '</div>';
      }).join('');
    }
  } else {
    /* Applied - pending applications */
    var pending = state.myActiveWork.filter(function(j) {
      return j._myApp && j._myApp.status === 'pending';
    });
    if (pending.length === 0) {
      appliedHtml = '<div class="text-center py-12" style="color:var(--text-dim)">' + muxiSVG(48) +
        '<p class="font-black mt-3">No pending applications</p>' +
        '<p class="text-sm mt-1">Accept missions and your pending briefs show up here.</p></div>';
    } else {
      appliedHtml = pending.map(function(job) {
        return '<div class="card p-5 mb-3">' +
          '<div class="flex items-start justify-between mb-2">' +
            '<h3 class="font-black text-sm flex-1 mr-3">' + escapeHtml(job.title) + '</h3>' +
            '<span class="text-[10px] font-black px-2 py-1 rounded-full whitespace-nowrap" style="color:var(--yellow);border:1px solid rgba(255,200,0,0.3);background:rgba(255,200,0,0.08)">&#9203; PENDING</span>' +
          '</div>' +
          '<p class="text-xs mb-2" style="color:var(--text-dim)">' + escapeHtml(job.description || '').substring(0, 80) + '</p>' +
          '<div class="flex items-center justify-between text-[11px]">' +
            '<span class="font-black" style="color:var(--accent)">' + Number(job.budget_mv || 0) + ' <span style="color:var(--accent)">MV</span></span>' +
            '<div class="flex gap-3">' +
              '<span style="color:var(--text-dim)">Your bid: ' + Number(job._myApp.rate_mv || 0) + ' <span style="color:var(--accent)">MV</span></span>' +
              '<span style="color:var(--text-dim)">' + relTime(job._myApp.created_at) + '</span>' +
            '</div>' +
          '</div>' +
        '</div>';
      }).join('');
    }
  }

  var pendingCount = state.myActiveWork.filter(function(j) { return j._myApp && j._myApp.status === 'pending'; }).length;
  var activeCount = state.myActiveWork.filter(function(j) { return j._myApp && j._myApp.status !== 'pending' && j._myApp.status !== 'rejected'; }).length;

  c.innerHTML = '<div class="fade-up">' +
    '<div class="mb-6 flex items-start justify-between gap-3">' +
      '<div>' +
        '<button onclick="state.myGigsView=false;renderJobsTab()" class="text-xs font-black mb-2 flex items-center gap-1" style="color:var(--accent)"><i class="fas fa-arrow-left"></i> Back to all gigs</button>' +
        '<h1 class="text-3xl font-black mb-1">Command Center</h1>' +
        '<p class="text-sm" style="color:rgba(232,236,241,0.65)">Manage your deployed missions, active work, and pending briefs.</p>' +
      '</div>' +
      '<button onclick="openPostJobModal()" class="btn-pill btn-pill-accent">+ Post</button>' +
    '</div>' +
    '<div class="flex gap-2 mb-5 overflow-x-auto pb-1">' +
      '<button onclick="state.myGigsFilter=\'posted\';renderMyGigsView()" class="btn-pill ' + (myGigsFilter === 'posted' ? 'btn-pill-accent' : 'btn-pill-ghost') + '"><i class="fas fa-clipboard-list mr-1"></i>Posted (' + state.myGigs.length + ')</button>' +
      '<button onclick="state.myGigsFilter=\'work\';renderMyGigsView()" class="btn-pill ' + (myGigsFilter === 'work' ? 'btn-pill-accent' : 'btn-pill-ghost') + '"><i class="fas fa-hard-hat mr-1"></i>Active (' + activeCount + ')</button>' +
      '<button onclick="state.myGigsFilter=\'applied\';renderMyGigsView()" class="btn-pill ' + (myGigsFilter === 'applied' ? 'btn-pill-accent' : 'btn-pill-ghost') + '"><i class="fas fa-paper-plane mr-1"></i>Applied (' + pendingCount + ')</button>' +
    '</div>' +
    (myGigsFilter === 'posted' ? postedHtml : myGigsFilter === 'work' ? workHtml : appliedHtml) +
  '</div>';
}
/* =============================================================================
   WORKER JOB MODAL - Status updates, deliverables, milestones
============================================================================= */
async function openWorkerJobModal(jobId) {
  var job = state.myActiveWork.find(function(j) { return j.id === jobId; });
  if (!job) return showToast('Job not found', 'error');

  var delivs = (state.deliverables || []).filter(function(d) { return d.job_id === jobId; });
  var sc = JOB_STATUS_CONFIG[job.status] || JOB_STATUS_CONFIG.in_progress;

  /* Deliverables list */
  var delivHtml = delivs.length === 0
    ? '<p class="text-xs py-3 text-center" style="color:var(--text-dim)">No deliverables submitted yet. Add your first one below.</p>'
    : delivs.map(function(d) {
        var typeIcon = d.type === 'link' ? '&#128279;' : d.type === 'file' ? '&#128196;' : d.type === 'milestone' ? '&#127937;' : '&#128172;';
        return '<div class="p-3 rounded-xl mb-2" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08)">' +
          '<div class="flex items-start justify-between">' +
            '<div class="flex-1">' +
              '<p class="text-xs font-black">' + typeIcon + ' ' + escapeHtml(d.title || d.type) + '</p>' +
              (d.content ? '<p class="text-[11px] mt-1" style="color:var(--text-dim)">' + escapeHtml(d.content).substring(0, 200) + '</p>' : '') +
              (d.url ? '<a href="' + escapeHtml(d.url) + '" target="_blank" class="text-[11px] mt-1 block" style="color:var(--accent)"><i class="fas fa-external-link-alt mr-1"></i>' + escapeHtml(d.url).substring(0, 60) + '</a>' : '') +
            '</div>' +
            '<span class="text-[10px]" style="color:var(--text-dim)">' + relTime(d.created_at) + '</span>' +
          '</div>' +
        '</div>';
      }).join('');

  openModal(
    '<div class="card p-6" style="max-width:540px;margin:auto;max-height:90vh;overflow:auto">' +
      '<div class="flex justify-between items-center mb-4">' +
        '<h2 class="text-lg font-black">Job Dashboard</h2>' +
        '<button onclick="closeModal()" class="close-btn">&times;</button>' +
      '</div>' +

      /* Job header */
      '<div class="p-4 rounded-xl mb-3" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08)">' +
        '<div class="flex items-start justify-between">' +
          '<h3 class="font-black text-sm flex-1 mr-2">' + escapeHtml(job.title) + '</h3>' +
          '<span class="text-[10px] font-black px-2 py-1 rounded-full" style="color:' + sc.color + ';border:1px solid ' + sc.color + '40">' + sc.icon + ' ' + sc.label + '</span>' +
        '</div>' +
        '<p class="text-xs mt-1" style="color:var(--text-dim)">' + escapeHtml(job.description || '') + '</p>' +
        '<div class="flex gap-3 text-[11px] mt-2"><span class="font-black" style="color:var(--accent)">' + Number(job.budget_mv || 0) + ' MV</span></div>' +
      '</div>' +

      renderProgressBar(job.status) +

      /* Quick actions */
      '<div class="grid grid-cols-2 gap-2 mb-4">' +
        '<button onclick="closeModal();startConvoFromJob(\'' + job.id + '\',\'' + job.poster_id + '\')" class="p-3 rounded-xl text-xs font-black text-center" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08)"><i class="fas fa-comment mr-1" style="color:var(--accent)"></i>Message poster</button>' +
        '<button onclick="sendStatusUpdate(\'' + job.id + '\',\'' + job.poster_id + '\')" class="p-3 rounded-xl text-xs font-black text-center" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08)"><i class="fas fa-bullhorn mr-1" style="color:var(--yellow)"></i>Send update</button>' +
      '</div>' +

      /* Deliverables section */
      '<div class="mb-4">' +
        '<h4 class="font-black text-sm mb-3"><i class="fas fa-paperclip mr-1" style="color:var(--accent-2)"></i>Deliverables & Evidence</h4>' +
        '<p class="text-[11px] mb-3" style="color:var(--text-dim)">Upload links, notes, or milestone updates. Poster can see these as proof of work.</p>' +
        delivHtml +

        /* Add deliverable form */
        '<div class="mt-3 p-4 rounded-xl" style="background:rgba(24,246,200,0.04);border:1px solid rgba(24,246,200,0.12)">' +
          '<p class="text-[11px] font-black mb-2" style="color:var(--accent)">Add deliverable</p>' +
          '<select id="deliv-type" class="field mb-2" style="font-size:12px">' +
            '<option value="update">Status update / Note</option>' +
            '<option value="link">Link (URL to work)</option>' +
            '<option value="file">File reference</option>' +
            '<option value="milestone">Milestone checkpoint</option>' +
          '</select>' +
          '<input id="deliv-title" placeholder="Title (e.g., Draft v1, Homepage mockup)" class="field mb-2" style="font-size:12px">' +
          '<textarea id="deliv-content" placeholder="Description or notes..." rows="2" class="field mb-2" style="font-size:12px;resize:none"></textarea>' +
          '<input id="deliv-url" placeholder="URL (optional - paste link to deliverable)" class="field mb-2" style="font-size:12px">' +
          '<button onclick="submitDeliverable(\'' + job.id + '\',\'' + job.poster_id + '\')" class="btn-pill btn-pill-accent text-xs"><i class="fas fa-plus mr-1"></i>Submit deliverable</button>' +
        '</div>' +
      '</div>' +

      /* Status-based action panel */
      (job.status === 'awarded' ?
        '<div class="mt-3 p-4 rounded-xl" style="background:rgba(255,200,0,0.08);border:1px solid rgba(255,200,0,0.20)">' +
          '<p class="text-xs font-black mb-1" style="color:var(--yellow)"><i class="fas fa-trophy mr-1"></i>You have been deployed on this mission!</p>' +
          '<p class="text-[11px] mb-3" style="color:var(--text-dim)">Click Go Active when you begin work. The poster will be notified.</p>' +
          '<button onclick="closeModal();workerStartJob(\'' + job.id + '\')" class="btn-primary rounded-full"><i class="fas fa-play mr-2"></i>Go Active</button>' +
        '</div>' : '') +

      (job.status === 'in_progress' ?
        '<div class="mt-3 p-4 rounded-xl" style="background:rgba(24,246,200,0.06);border:1px solid rgba(24,246,200,0.20)">' +
          '<p class="text-xs font-black mb-2"><i class="fas fa-flag-checkered mr-1"></i>Ready to submit final work?</p>' +
          '<p class="text-[11px] mb-3" style="color:var(--text-dim)">Make sure all deliverables are uploaded. The commander will review and release payout.</p>' +
          '<button onclick="workerMarkComplete(\'' + job.id + '\')" class="btn-primary rounded-full"><i class="fas fa-check-circle mr-2"></i>Mark mission complete</button>' +
        '</div>' : '') +

      (job.status === 'completed' ?
        '<div class="p-4 rounded-xl" style="background:rgba(255,200,0,0.08);border:1px solid rgba(255,200,0,0.20)">' +
          '<p class="text-xs font-black" style="color:var(--yellow)"><i class="fas fa-hourglass-half mr-1"></i>Awaiting poster review & payment release</p>' +
          '<p class="text-[11px] mt-1" style="color:var(--text-dim)">The poster has been notified. Payment will be released once they approve your work.</p>' +
        '</div>' : '') +

      (job.status === 'paid' ?
        '<div class="p-4 rounded-xl" style="background:rgba(24,246,200,0.08);border:1px solid rgba(24,246,200,0.20)">' +
          '<p class="text-xs font-black mb-3" style="color:var(--accent)"><i class="fas fa-check-double mr-1"></i>Paid! This mission is complete.</p>' +
          '<div class="flex gap-2 flex-wrap">' +
            '<button onclick="openTipModal(\'' + job.id + '\')" class="btn-pill btn-pill-ghost text-xs" data-testid="button-tip-poster"><i class="fas fa-gift mr-1"></i>Send Thanks</button>' +
          '</div>' +
        '</div>' : '') +

    '</div>',
    { width: 'max-w-lg' }
  );
}

/* Submit a deliverable */
async function submitDeliverable(jobId, posterId) {
  var type = (getEl('deliv-type') || {}).value || 'update';
  var title = ((getEl('deliv-title') || {}).value || '').trim();
  var content = ((getEl('deliv-content') || {}).value || '').trim();
  var url = ((getEl('deliv-url') || {}).value || '').trim();
  if (!title && !content) return showToast('Add a title or description', 'error');

  try {
    var payload = {
      job_id: jobId, worker_id: state.user.id, type: type,
      title: title || type, content: content, url: url || null
    };
    var res = await apiRequest('job_deliverables', { method: 'POST', body: JSON.stringify(payload) });
    if (res && res.ok) {
      showToast('Deliverable submitted!');
      /* Notify poster */
      try {
        await apiRequest('notifications_queue', { method: 'POST', body: JSON.stringify({
          user_id: posterId, type: 'deliverable_submitted', title: 'New deliverable',
          body: (state.profile && state.profile.full_name || 'A worker') + ' submitted: ' + (title || type), channel: 'in_app', status: 'pending'
        })});
      } catch(e) {}
      /* Send message to poster about the deliverable */
      try {
        var convoRes = await apiRequest('rpc/get_or_create_conversation', {
          method: 'POST', body: JSON.stringify({ p_user_id: state.user.id, p_other_user_id: posterId, p_job_id: jobId })
        });
        if (convoRes && convoRes.ok) {
          var cid = await convoRes.json();
          if (cid) {
            var msgBody = '📎 Deliverable submitted: ' + (title || type);
            if (url) msgBody += '\n🔗 ' + url;
            if (content) msgBody += '\n' + content.substring(0, 150);
            await apiRequest('messages', { method: 'POST', body: JSON.stringify({ conversation_id: cid, sender_id: state.user.id, body: msgBody }) });
          }
        }
      } catch(e) {}
      /* Reload and reopen modal */
      await loadMyGigs();
      openWorkerJobModal(jobId);
    } else {
      /* If job_deliverables table does not exist, fallback to message-only */
      console.warn('job_deliverables insert failed, using message fallback');
      try {
        var convoRes2 = await apiRequest('rpc/get_or_create_conversation', {
          method: 'POST', body: JSON.stringify({ p_user_id: state.user.id, p_other_user_id: posterId, p_job_id: jobId })
        });
        if (convoRes2 && convoRes2.ok) {
          var cid2 = await convoRes2.json();
          if (cid2) {
            var fb = '📎 DELIVERABLE: ' + (title || type) + '\n' + content + (url ? '\n🔗 ' + url : '');
            await apiRequest('messages', { method: 'POST', body: JSON.stringify({ conversation_id: cid2, sender_id: state.user.id, body: fb }) });
          }
        }
      } catch(e) {}
      showToast('Deliverable sent via message (table not yet created)');
      closeModal();
    }
  } catch(e) { showToast('Error submitting', 'error'); console.error(e); }
}

/* Send a quick status update to poster */
async function sendStatusUpdate(jobId, posterId) {
  closeModal();
  openModal(
    '<div class="card p-6" style="max-width:420px;margin:auto">' +
      '<div class="flex justify-between items-center mb-4"><h2 class="text-lg font-black"><i class="fas fa-bullhorn mr-2" style="color:var(--yellow)"></i>Status Update</h2><button onclick="closeModal()" class="close-btn">&times;</button></div>' +
      '<p class="text-xs mb-3" style="color:var(--text-dim)">Send a quick progress update to the job poster. They will be notified.</p>' +
      '<div class="flex flex-wrap gap-2 mb-3">' +
        '<button onclick="document.getElementById(\'status-msg\').value=\'Just getting started - will update you soon!\'" class="text-[10px] px-2 py-1 rounded-full" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.10)">Getting started</button>' +
        '<button onclick="document.getElementById(\'status-msg\').value=\'Making good progress! About halfway done.\'" class="text-[10px] px-2 py-1 rounded-full" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.10)">Halfway done</button>' +
        '<button onclick="document.getElementById(\'status-msg\').value=\'Almost finished - should be done shortly.\'" class="text-[10px] px-2 py-1 rounded-full" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.10)">Almost done</button>' +
        '<button onclick="document.getElementById(\'status-msg\').value=\'Quick question for you about this job - check your messages.\'" class="text-[10px] px-2 py-1 rounded-full" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.10)">Have a question</button>' +
        '<button onclick="document.getElementById(\'status-msg\').value=\'Running into a small delay but still on track.\'" class="text-[10px] px-2 py-1 rounded-full" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.10)">Small delay</button>' +
      '</div>' +
      '<textarea id="status-msg" placeholder="Type your update..." rows="3" class="field mb-3" style="resize:none"></textarea>' +
      '<button onclick="sendStatusMsg(\'' + jobId + '\',\'' + posterId + '\')" class="btn-primary rounded-full"><i class="fas fa-paper-plane mr-2"></i>Send update</button>' +
    '</div>',
    { width: 'max-w-md' }
  );
}

async function sendStatusMsg(jobId, posterId) {
  var msg = ((getEl('status-msg') || {}).value || '').trim();
  if (!msg) return showToast('Type a message', 'error');
  try {
    var convoRes = await apiRequest('rpc/get_or_create_conversation', {
      method: 'POST', body: JSON.stringify({ p_user_id: state.user.id, p_other_user_id: posterId, p_job_id: jobId })
    });
    if (convoRes && convoRes.ok) {
      var cid = await convoRes.json();
      if (cid) {
        await apiRequest('messages', { method: 'POST', body: JSON.stringify({
          conversation_id: cid, sender_id: state.user.id, body: '&#128227; STATUS UPDATE: ' + msg
        })});
      }
    }
    /* Notify poster */
    try {
      await apiRequest('notifications_queue', { method: 'POST', body: JSON.stringify({
        user_id: posterId, type: 'status_update', title: 'Worker update',
        body: (state.profile && state.profile.full_name || 'Worker') + ': ' + msg.substring(0, 100), channel: 'in_app', status: 'pending'
      })});
    } catch(e) {}
    closeModal();
    showToast('Update sent!');
    setMuxi('Good communication is how you get 5-star reviews.');
  } catch(e) { showToast('Error sending update', 'error'); }
}
/* =============================================================================
   POSTER JOB MANAGEMENT MODAL
============================================================================= */
async function openJobManageModal(jobId) {
  var job = state.myGigs.find(function(j) { return j.id === jobId; });
  if (!job) return showToast('Job not found', 'error');

  try {
    var appRes = await apiRequest('applications?job_id=eq.' + jobId + '&select=*&order=created_at.desc');
    var apps = (appRes && appRes.ok) ? await appRes.json() : [];

    /* Update applicant_count on the job object for display */
    job.applicant_count = apps.length;

    var workerIds = apps.map(function(a) { return a.worker_id; }).filter(Boolean);
    var workerMap = {};
    if (workerIds.length > 0) {
      var wRes = await apiRequest('users?id=in.(' + workerIds.join(',') + ')&select=id,full_name,username,rating,jobs_completed,trust_score,is_available,last_location_update,xp');
      var wData = (wRes && wRes.ok) ? await wRes.json() : [];
      wData.forEach(function(u) { workerMap[u.id] = u; });
    }

    /* Load deliverables for this job */
    var delivs = [];
    try {
      var delRes = await apiRequest('job_deliverables?job_id=eq.' + jobId + '&select=*&order=created_at.desc');
      delivs = (delRes && delRes.ok) ? await delRes.json() : [];
    } catch(e) {}

    var sc = JOB_STATUS_CONFIG[job.status] || JOB_STATUS_CONFIG.open;

    /* Applications list */
    var appsHtml = '';
    if (apps.length === 0) {
      appsHtml = '<div class="p-4 rounded-xl text-center" style="background:rgba(255,255,255,0.03)">' +
        '<p class="text-sm" style="color:var(--text-dim)">No briefs yet. Share the mission to attract operatives.</p></div>';
    } else {
      appsHtml = apps.map(function(app) {
        var w = workerMap[app.worker_id] || {};
        var name = w.full_name || w.username || 'Unknown';
        var handle = w.username ? ('@' + w.username) : '';
        var rating = Number(w.rating || 0);
        var ratingStr = rating > 0 ? '⭐ ' + rating.toFixed(1) : '☆ New';
        var missions = Number(w.jobs_completed || 0);
        var isAccepted = app.status === 'accepted' || app.status === 'in_progress' || app.status === 'completed' || app.status === 'paid';
        var isPending = app.status === 'pending';
        var canAward = isPending && (job.status === 'open');

        return '<div class="worker-card' + (isAccepted ? ' awarded' : '') + '" data-testid="worker-card-' + (app.worker_id || '').slice(0,8) + '">' +
          '<div class="flex items-start gap-3 mb-3">' +
            getAvatarCircle(name) +
            '<div class="flex-1 min-w-0">' +
              '<div class="flex items-center gap-2">' +
                getStatusDot(w) +
                '<p class="font-black text-sm truncate">' + escapeHtml(name) + '</p>' +
                (handle ? '<span class="text-[10px]" style="color:var(--text-dim)">' + escapeHtml(handle) + '</span>' : '') +
              '</div>' +
              '<div class="flex items-center gap-2 mt-1 flex-wrap">' +
                '<span class="text-[11px]">' + ratingStr + ' (' + missions + ' missions)</span>' +
                getXpBadge(w) +
              '</div>' +
              getStatusLabel(w) +
            '</div>' +
            '<span class="text-[10px] font-black px-2 py-1 rounded-full whitespace-nowrap" style="color:' + (isAccepted ? 'var(--accent)' : isPending ? 'var(--yellow)' : 'var(--red)') + ';border:1px solid ' + (isAccepted ? 'var(--accent)' : isPending ? 'var(--yellow)' : 'var(--red)') + '30">' +
              (isAccepted ? '✅ AWARDED' : isPending ? '⏳ PENDING' : escapeHtml(app.status).toUpperCase()) +
            '</span>' +
          '</div>' +
          (app.pitch ? '<div class="p-3 rounded-xl mb-3" style="background:rgba(255,255,255,0.03);border-left:2px solid rgba(24,246,200,0.25)"><p class="text-xs italic" style="color:rgba(232,236,241,0.65)">"' + escapeHtml(app.pitch) + '"</p></div>' : '') +
          '<div class="flex items-center justify-between">' +
            '<div class="flex items-center gap-3 text-[11px]" style="color:var(--text-dim)">' +
              '<span class="font-black" style="color:var(--accent)">' + muxiSVGSmall(12) + ' ' + Number(app.rate_mv || 0) + ' MV</span>' +
              '<span><i class="fas fa-clock mr-1"></i>' + escapeHtml(app.turnaround || '') + '</span>' +
            '</div>' +
            (canAward ? '<div class="flex gap-2">' +
              '<button onclick="awardJob(\'' + jobId + '\',\'' + app.id + '\',\'' + app.worker_id + '\')" class="btn-pill btn-pill-accent text-xs" data-testid="button-award-' + (app.worker_id || '').slice(0,8) + '"><i class="fas fa-trophy mr-1"></i>Award Mission</button>' +
              '<button onclick="closeModal();startConvoFromJob(\'' + jobId + '\',\'' + app.worker_id + '\')" class="btn-pill btn-pill-ghost text-xs"><i class="fas fa-comment mr-1"></i>Msg</button>' +
            '</div>' : '') +
          '</div>' +
        '</div>';
      }).join('');
    }

    /* Deliverables section (visible to poster) */
    var posterDelivHtml = '';
    if (delivs.length > 0) {
      posterDelivHtml = '<div class="mb-4">' +
        '<h4 class="font-black text-sm mb-3"><i class="fas fa-paperclip mr-1" style="color:var(--accent-2)"></i>Deliverables (' + delivs.length + ')</h4>' +
        delivs.map(function(d) {
          var typeIcon = d.type === 'link' ? '&#128279;' : d.type === 'file' ? '&#128196;' : d.type === 'milestone' ? '&#127937;' : '&#128172;';
          return '<div class="p-3 rounded-xl mb-2" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08)">' +
            '<div class="flex items-start justify-between">' +
              '<div class="flex-1">' +
                '<p class="text-xs font-black">' + typeIcon + ' ' + escapeHtml(d.title || d.type) + '</p>' +
                (d.content ? '<p class="text-[11px] mt-1" style="color:var(--text-dim)">' + escapeHtml(d.content).substring(0, 200) + '</p>' : '') +
                (d.url ? '<a href="' + escapeHtml(d.url) + '" target="_blank" class="text-[11px] mt-1 block" style="color:var(--accent)"><i class="fas fa-external-link-alt mr-1"></i>' + escapeHtml(d.url).substring(0, 60) + '</a>' : '') +
              '</div>' +
              '<span class="text-[10px]" style="color:var(--text-dim)">' + relTime(d.created_at) + '</span>' +
            '</div>' +
          '</div>';
        }).join('') +
      '</div>';
    }

    /* Poster action buttons based on status */
    var actionsHtml = '';
    if (job.status === 'in_progress') {
      actionsHtml = '<div class="mt-4 space-y-2">' +
        '<button onclick="posterMarkComplete(\'' + jobId + '\')" class="btn-primary rounded-full"><i class="fas fa-check-circle mr-2"></i>Approve work & release escrow</button>' +
        '<button onclick="openDisputeModal(\'' + jobId + '\')" class="text-xs font-black py-2 text-center block" style="color:var(--red)"><i class="fas fa-exclamation-triangle mr-1"></i>Open dispute</button>' +
      '</div>';
    } else if (job.status === 'awarded') {
      actionsHtml = '<div class="mt-4 p-3 rounded-xl" style="background:rgba(255,200,0,0.08);border:1px solid rgba(255,200,0,0.20)">' +
        '<p class="text-xs font-black" style="color:var(--yellow)"><i class="fas fa-info-circle mr-1"></i>Waiting for worker to start</p>' +
        '<p class="text-[11px] mt-1 mb-3" style="color:var(--text-dim)">The worker has been notified. Once they begin, status moves to In Progress.</p>' +
        (delivs.length > 0 ? '<button onclick="posterApproveAndRelease(\'' + jobId + '\')" class="btn-primary rounded-full mb-3"><i class="fas fa-check-circle mr-2"></i>Approve deliverables & release ' + Number(job.budget_mv || 0) + ' MV</button>' : '') +
        '<button onclick="cancelJob(\'' + jobId + '\')" class="text-xs font-black py-1" style="color:var(--red)"><i class="fas fa-times mr-1"></i>Cancel mission & refund escrow</button>' +
      '</div>';
    } else if (job.status === 'completed') {
      actionsHtml = '<div class="mt-4 p-4 rounded-xl" style="background:rgba(24,246,200,0.08);border:1px solid rgba(24,246,200,0.20)">' +
        '<p class="text-sm font-black mb-2" style="color:var(--accent)"><i class="fas fa-flag-checkered mr-1"></i>Worker marked this job complete!</p>' +
        '<p class="text-[11px] mb-3" style="color:var(--text-dim)">Review the deliverables above and release payout if satisfied.</p>' +
        '<button onclick="releaseEscrow(\'' + jobId + '\')" class="btn-primary rounded-full"><i class="fas fa-unlock mr-2"></i>Release ' + Number(job.budget_mv || 0) + ' MV to worker</button>' +
        '<button onclick="openDisputeModal(\'' + jobId + '\')" class="text-xs font-black py-2 mt-2 text-center block" style="color:var(--red)"><i class="fas fa-exclamation-triangle mr-1"></i>Dispute</button>' +
      '</div>';
    } else if (job.status === 'paid') {
      var awardedWorker = apps.find(function(a) { return a.status === 'accepted' || a.status === 'in_progress' || a.status === 'completed' || a.status === 'paid'; });
      var awardedWorkerName = awardedWorker ? (workerMap[awardedWorker.worker_id] || {}).full_name || '' : '';
      actionsHtml = '<div class="mt-4 p-3 rounded-xl" style="background:rgba(24,246,200,0.08);border:1px solid rgba(24,246,200,0.20)">' +
        '<p class="text-xs font-black" style="color:var(--accent)"><i class="fas fa-check-double mr-1"></i>Payout released! Mission complete.</p>' +
        '<div class="mt-3 flex gap-2 flex-wrap">' +
          '<button onclick="openTipModal(\'' + jobId + '\')" class="btn-pill btn-pill-accent text-xs" data-testid="button-tip-worker"><i class="fas fa-heart mr-1"></i>Tip Worker</button>' +
          '<button onclick="hireAgain(\'' + jobId + '\')" class="btn-pill btn-pill-ghost text-xs" data-testid="button-hire-again"><i class="fas fa-redo mr-1"></i>Hire Again</button>' +
          (awardedWorker ? '<button onclick="openRatingModal(\'' + jobId + '\',\'' + awardedWorker.worker_id + '\',\'' + escapeHtml(awardedWorkerName).replace(/'/g,"\\'") + '\')" class="btn-pill btn-pill-ghost text-xs" data-testid="button-rate-worker"><i class="fas fa-star mr-1"></i>Rate</button>' : '') +
        '</div>' +
      '</div>';
    } else if (job.status === 'open') {
      actionsHtml = '<div class="mt-4">' +
        '<button onclick="cancelJob(\'' + jobId + '\')" class="text-xs font-black py-2" style="color:var(--red)"><i class="fas fa-times mr-1"></i>Cancel mission & refund escrow</button>' +
      '</div>';
    }

    openModal(
      '<div class="card p-6" style="max-width:540px;margin:auto;max-height:90vh;overflow:auto">' +
        '<div class="flex justify-between items-center mb-4">' +
          '<h2 class="text-lg font-black">Manage Mission</h2>' +
          '<button onclick="closeModal()" class="close-btn">&times;</button>' +
        '</div>' +

        '<div class="p-4 rounded-xl mb-3" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08)">' +
          '<h3 class="font-black mb-1">' + escapeHtml(job.title) + '</h3>' +
          '<p class="text-xs mb-2" style="color:var(--text-dim)">' + escapeHtml(job.description || '') + '</p>' +
          '<div class="flex gap-3 text-[11px]">' +
            '<span class="font-black" style="color:var(--accent)">' + Number(job.budget_mv || 0) + ' MV escrowed</span>' +
            '<span style="color:var(--text-dim)">' + escapeHtml(job.category || '') + '</span>' +
            '<span style="color:var(--text-dim)">' + relTime(job.created_at) + '</span>' +
          '</div>' +
        '</div>' +

        renderProgressBar(job.status) +

        posterDelivHtml +

        '<div class="mb-4">' +
          '<h4 class="font-black text-sm mb-3"><i class="fas fa-users mr-1" style="color:var(--accent-2)"></i>Applications (' + apps.length + ')</h4>' +
          appsHtml +
        '</div>' +

        actionsHtml +
      '</div>',
      { width: 'max-w-lg' }
    );
  } catch(e) { console.error('openJobManageModal error:', e); showToast('Error loading job details', 'error'); }
}

/* Award a job to a specific applicant */
async function awardJob(jobId, applicationId, workerId) {
  if (!confirm('Deploy this operative? They will be notified and can start immediately.')) return;
  try {
    setMuxi('Deploying operative...');
    /* Update application status to accepted */
    var r1 = await apiRequest('applications?id=eq.' + applicationId, {
      method: 'PATCH', body: JSON.stringify({ status: 'accepted' })
    });
    console.log('Award app PATCH:', r1 && r1.status);
    if (!r1 || (r1.status !== 200 && r1.status !== 204)) {
      var errBody = ''; try { errBody = await r1.text(); } catch(e) {}
      console.error('Application PATCH failed:', r1 && r1.status, errBody);
      showToast('Error updating application: ' + (r1 ? r1.status : 'no response'), 'error');
      return;
    }
    /* Reject other pending applications */
    await apiRequest('applications?job_id=eq.' + jobId + '&id=neq.' + applicationId + '&status=eq.pending', {
      method: 'PATCH', body: JSON.stringify({ status: 'rejected' })
    });
    /* Update job status to awarded */
    var r2 = await apiRequest('jobs?id=eq.' + jobId + '&status=eq.open', {
      method: 'PATCH', body: JSON.stringify({ status: 'awarded' })
    });
    console.log('Award job PATCH:', r2 && r2.status);
    /* Create or get conversation with the worker */
    try {
      var convoRes = await apiRequest('rpc/get_or_create_conversation', {
        method: 'POST', body: JSON.stringify({ p_user_id: state.user.id, p_other_user_id: workerId, p_job_id: jobId })
      });
      if (convoRes && convoRes.ok) {
        var cid = await convoRes.json();
        if (cid) {
          var j = state.myGigs.find(function(x) { return x.id === jobId; });
          await apiRequest('messages', {
            method: 'POST', body: JSON.stringify({
              conversation_id: cid, sender_id: state.user.id,
              body: 'You have been deployed on the mission "' + (j ? j.title : 'untitled') + '"! You can start whenever you are ready. Update me on progress here.'
            })
          });
        }
      }
    } catch(ce) { console.warn('Award convo msg failed:', ce); }
    /* Notify worker */
    try {
      await apiRequest('notifications_queue', { method: 'POST', body: JSON.stringify({ user_id: workerId, type: 'job_awarded', title: 'Mission deployed to you!', body: 'You have been deployed on a mission. Check your comms for details.', channel: 'email', status: 'pending' }) });
    } catch(e) {}
    closeModal();
    showToast('Operative deployed! Notification sent.');
    setMuxi('Another one bites the dust. Nice hire, boss.');
    loadMyGigs();
  } catch(e) { showToast('Error awarding gig: ' + (e.message || ''), 'error'); console.error('awardJob error:', e); }
}

/* Worker starts the job (updates to in_progress) */
async function workerStartJob(jobId) {
  try {
    var res = await apiRequest('jobs?id=eq.' + jobId + '&status=eq.awarded', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'in_progress' }),
      headers: { 'Prefer': 'return=minimal' }
    });
    if (!res || !(res.ok || res.status === 204)) {
      showToast('Job may have already been started', 'info');
      loadMyGigs();
      return;
    }
    await apiRequest('applications?job_id=eq.' + jobId + '&worker_id=eq.' + state.user.id + '&status=eq.accepted', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'in_progress' }),
      headers: { 'Prefer': 'return=minimal' }
    });
    showToast('Job started! Keep the poster updated.');
    setMuxi('Let\'s get this bread. You got this!');
    loadMyGigs();
  } catch(e) { showToast('Error starting job', 'error'); }
}

/* Worker marks job as complete */
async function workerMarkComplete(jobId) {
  if (state._completingJob) return;
  if (!confirm('Mark mission complete? The commander will review and release payout.')) return;
  state._completingJob = true;
  try {
    await apiRequest('jobs?id=eq.' + jobId, { method: 'PATCH', body: JSON.stringify({ status: 'completed' }) });
    await apiRequest('applications?job_id=eq.' + jobId + '&worker_id=eq.' + state.user.id, {
      method: 'PATCH', body: JSON.stringify({ status: 'completed' })
    });
    /* Notify commander */
    var job = state.myActiveWork.find(function(j) { return j.id === jobId; });
    if (job && job.poster_id) {
      try {
        await apiRequest('notifications_queue', { method: 'POST', body: JSON.stringify({ user_id: job.poster_id, type: 'job_completed', title: 'Mission complete', body: 'An operative marked "' + (job.title || 'your mission') + '" as complete. Review and release payout.', channel: 'email', status: 'pending' }) });
      } catch(e) {}
      /* Send message to commander */
      try {
        var convoRes = await apiRequest('rpc/get_or_create_conversation', {
          method: 'POST', body: JSON.stringify({ p_user_id: state.user.id, p_other_user_id: job.poster_id, p_job_id: jobId })
        });
        if (convoRes && convoRes.ok) {
          var cid = await convoRes.json();
          if (cid) {
            await apiRequest('messages', { method: 'POST', body: JSON.stringify({
              conversation_id: cid, sender_id: state.user.id,
              body: 'Mission complete: "' + (job.title || 'this mission') + '". Please review and deploy payout when ready!'
            })});
          }
        }
      } catch(e) {}
    }
    showToast('Mission complete! Waiting for commander to release payout.');
    setMuxi('Work done! Now we wait for that sweet MV.');
    loadMyGigs();
  } catch(e) { showToast('Error completing mission', 'error'); console.error('workerMarkComplete error:', e); }
  state._completingJob = false;
}

/* Poster approves completion and releases escrow */
async function posterMarkComplete(jobId) {
  if (!confirm('Approve this work and release escrow payout to the operative?')) return;
  try {
    await apiRequest('jobs?id=eq.' + jobId, { method: 'PATCH', body: JSON.stringify({ status: 'completed' }) });
    await apiRequest('applications?job_id=eq.' + jobId + '&status=eq.in_progress', { method: 'PATCH', body: JSON.stringify({ status: 'completed' }) });
  } catch(e) {}
  await releaseEscrow(jobId);
}

/* Poster approves deliverables on an awarded job (worker skipped formal start) */
async function posterApproveAndRelease(jobId) {
  if (!confirm('Approve the submitted deliverables and release payment to the worker?')) return;
  try {
    await apiRequest('jobs?id=eq.' + jobId, { method: 'PATCH', body: JSON.stringify({ status: 'completed' }) });
    await apiRequest('applications?job_id=eq.' + jobId + '&status=in.(accepted,in_progress)', { method: 'PATCH', body: JSON.stringify({ status: 'completed' }) });
  } catch(e) {}
  await releaseEscrow(jobId);
}

async function releaseEscrow(jobId) {
  try {
    setMuxi('Releasing escrow...');
    var res = await apiRequest('rpc/release_escrow_secure', {
      method: 'POST',
      body: JSON.stringify({ p_job_id: jobId })
    });
    if (res && res.ok) {
      var job = state.myGigs.find(function(j) { return j.id === jobId; });
      if (job) {
        try {
          var appRes = await apiRequest('applications?job_id=eq.' + jobId + '&status=eq.paid&select=worker_id');
          var apps = (appRes && appRes.ok) ? await appRes.json() : [];
          var workerId = apps.length ? apps[0].worker_id : null;
          if (workerId) {
            await apiRequest('notifications_queue', { method: 'POST', body: JSON.stringify({ user_id: workerId, type: 'payment_released', title: 'Payment released!', body: 'MV has been released to your wallet.', channel: 'email' }) });
            var convoRes = await apiRequest('rpc/get_or_create_conversation', {
              method: 'POST', body: JSON.stringify({ p_user_id: state.user.id, p_other_user_id: workerId, p_job_id: jobId })
            });
            if (convoRes && convoRes.ok) {
              var cid = await convoRes.json();
              if (cid) {
                await apiRequest('messages', { method: 'POST', body: JSON.stringify({ conversation_id: cid, sender_id: state.user.id, body: 'Payment has been released! Thanks for the great work.' })});
              }
            }
          }
        } catch(ne) { console.warn('Post-release notifications failed:', ne); }
      }
      closeModal(); showToast('Escrow released! Payment sent to worker.');
      setMuxi('Money moved. Trust verified. That is the MUVR way.');
      loadMyGigs();
      if (state.currentTab === 'wallet') { renderWalletTab(); loadWalletData(); computeNetworkStats(); }
    } else {
      var errMsg = 'unknown error';
      try {
        var errBody = await res.text();
        try { var errJson = JSON.parse(errBody); errMsg = errJson.message || errJson.error || errBody; }
        catch(pe) { errMsg = errBody || errMsg; }
      } catch(e) {}
      showToast('Error releasing escrow: ' + errMsg, 'error');
    }
  } catch(e) { showToast('Error releasing escrow: ' + (e.message || ''), 'error'); console.error('releaseEscrow error:', e); }
}

/* Cancel a job and refund escrow to poster */
async function cancelJob(jobId) {
  if (!confirm('Cancel this mission? Your escrowed MV will be refunded (minus the 1 MV posting fee: 0.5 retired, 0.5 to ecosystem pool).')) return;
  try {
    setMuxi('Cancelling mission...');
    var res = await apiRequest('rpc/cancel_job_secure', {
      method: 'POST',
      body: JSON.stringify({ p_job_id: jobId })
    });
    if (!res) { showToast('Connection error — please try again', 'error'); return; }
    if (res.ok) {
      closeModal(); showToast('Mission cancelled. Budget refunded to your vault.');
      setMuxi('No worries. That MV is back in your wallet.');
      loadProfileSafe(); loadMyGigs(); loadJobsSafe();
    } else {
      var errMsg = 'unknown error';
      try {
        var errBody = await res.text();
        try { var errJson = JSON.parse(errBody); errMsg = errJson.message || errJson.error || errBody; }
        catch(pe) { errMsg = errBody || errMsg; }
      } catch(e) {}
      showToast('Cancel failed: ' + errMsg, 'error');
    }
  } catch(e) { showToast('Error cancelling gig: ' + (e.message || ''), 'error'); console.error('cancelJob error:', e); }
}

/* Open dispute modal */
function openDisputeModal(jobId) {
  openModal(
    '<div class="card p-6" style="max-width:420px;margin:auto">' +
      '<div class="flex justify-between items-center mb-4"><h2 class="text-lg font-black" style="color:var(--red)"><i class="fas fa-exclamation-triangle mr-2"></i>Open Dispute</h2><button onclick="closeModal()" class="close-btn">&times;</button></div>' +
      '<p class="text-xs mb-3" style="color:var(--text-dim)">Disputes freeze the escrow until resolved. Please describe the issue:</p>' +
      '<textarea id="dispute-reason" placeholder="Describe the problem..." rows="4" maxlength="500" class="field" style="resize:none"></textarea>' +
      '<button onclick="submitDispute(\'' + jobId + '\')" class="btn-primary rounded-full mt-3" style="background:var(--red)"><i class="fas fa-gavel mr-2"></i>Submit Dispute</button>' +
      '<p class="text-[10px] mt-2" style="color:var(--text-dim)">Escrow will be held until the dispute is reviewed. Our team will reach out within 24-48 hours.</p>' +
    '</div>',
    { width: 'max-w-md' }
  );
}

async function submitDispute(jobId) {
  var reason = ((getEl('dispute-reason') || {}).value || '').trim();
  if (!reason) return showToast('Please describe the issue', 'error');
  try {
    await apiRequest('jobs?id=eq.' + jobId, { method: 'PATCH', body: JSON.stringify({ status: 'disputed' }) });
    /* Log dispute (notifications_queue as a proxy - could add a disputes table later) */
    await apiRequest('notifications_queue', { method: 'POST', body: JSON.stringify({ user_id: state.user.id, type: 'dispute_opened', title: 'Dispute opened', body: 'Job ' + jobId.slice(0,8) + ': ' + reason, channel: 'email' }) });
    closeModal();
    showToast('Dispute submitted. Escrow frozen until resolved.');
    setMuxi('Dispute filed. We will look into this. Escrow is safe.');
    loadMyGigs();
  } catch(e) { showToast('Error submitting dispute', 'error'); }
}

function openPostJobModal() {
  openModal(
    '<div class="card p-6" style="max-width:460px;margin:auto;max-height:90vh;overflow:auto">' +
      '<div class="flex justify-between items-center mb-4"><h2 class="text-xl font-black">Post a Mission</h2><button onclick="closeModal()" class="close-btn">&times;</button></div>' +

      /* Mission type toggle: Gig vs Hiring */
      '<div class="flex gap-2 mb-4">' +
        '<button id="mode-gig" onclick="setPostMode(\'gig\')" class="flex-1 py-2 rounded-full text-xs font-black text-center" style="background:var(--accent);color:#0A0C1A">Mission</button>' +
        '<button id="mode-hire" onclick="setPostMode(\'hire\')" class="flex-1 py-2 rounded-full text-xs font-black text-center" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);color:var(--text-mid)">Hiring</button>' +
      '</div>' +
      '<input type="hidden" id="post-mode" value="gig">' +

      '<div class="space-y-3">' +
        '<input id="job-title" placeholder="What do you need done?" maxlength="100" class="field">' +
        '<textarea id="job-desc" placeholder="Describe the work in detail..." rows="3" maxlength="500" class="field" style="resize:none"></textarea>' +
        '<select id="job-type" class="field" onchange="loadEstimateForCategory(this.value)"><option value="">Select type...</option><optgroup label="Physical"><option value="rideshare">Rideshare</option><option value="delivery">Delivery</option><option value="physical">Physical Labor</option><option value="cleaning">Cleaning</option><option value="handyman">Handyman</option><option value="yardwork">Yard Work</option><option value="events">Events</option><option value="security">Security</option><option value="petcare">Pet Care</option></optgroup><optgroup label="Caregiving"><option value="caregiving">Caregiving / Home Health</option><option value="childcare">Child Care</option><option value="eldercare">Elder Care / Hospice</option><option value="nursing">Nursing / Medical Aide</option></optgroup><optgroup label="Digital"><option value="digital">Digital / Remote</option><option value="creative">Creative / Design</option><option value="tech">Tech / Dev</option><option value="data_entry">Data Entry / VA</option></optgroup><optgroup label="Web3 / AI Native"><option value="web3">Web3 / Blockchain</option><option value="smart_contract">Smart Contract Audit</option><option value="dao_ops">DAO Operations</option><option value="ai_task">AI Agent Task</option><option value="ai_training">AI Training / RLHF</option><option value="content_mod">Content Moderation</option></optgroup><optgroup label="Community"><option value="volunteer">Volunteer (0 MV)</option></optgroup><option value="other">Other</option></select>' +
        '<select id="job-urgency" class="field"><option value="asap">ASAP</option><option value="today">Today</option><option value="this_week">This week</option><option value="flexible">Flexible</option></select>' +

        /* Hiring-only fields (hidden by default) */
        '<div id="hiring-fields" style="display:none" class="space-y-3">' +
          '<input id="hire-compensation" placeholder="Compensation range (e.g. $15-20/hr)" maxlength="100" class="field">' +
          '<select id="hire-schedule" class="field"><option value="full_time">Full-time</option><option value="part_time">Part-time</option><option value="contract">Contract</option><option value="flexible">Flexible schedule</option></select>' +
          '<select id="hire-location" class="field"><option value="on_site">On-site</option><option value="remote">Remote</option><option value="hybrid">Hybrid</option></select>' +
          '<input id="hire-start" type="date" class="field" placeholder="Start date">' +
        '</div>' +

        '<div><label class="text-[11px] font-black mb-1 block" style="color:rgba(232,236,241,0.55)">Budget (MV Credits)</label><input id="job-budget" type="number" min="1" max="10000" placeholder="50" class="field" oninput="updateJobFee()"></div>' +
        '<input id="job-address" placeholder="Location / Address (optional)" maxlength="200" class="field">' +
        '<div class="p-4 rounded-2xl text-sm" style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.10)">' +
          '<div class="flex justify-between mb-1"><span style="color:rgba(232,236,241,0.55)">Budget</span><span class="font-black" id="fee-budget">0 <span style="color:var(--accent)">MV</span></span></div>' +
          '<div class="flex justify-between mb-1"><span style="color:rgba(232,236,241,0.55)">Posting fee (retired)</span><span class="font-black" style="color:var(--red)">1 <span style="color:var(--accent)">MV</span></span></div>' +
          '<div class="flex justify-between font-black pt-2" style="border-top:1px solid rgba(255,255,255,0.10)"><span>Total locked</span><span id="fee-total" style="color:var(--accent)">1 <span style="color:var(--accent)">MV</span></span></div>' +
        '</div>' +
        '<div id="cost-estimate" class="p-3 rounded-xl mb-3 hidden" style="background:rgba(24,246,200,0.06);border:1px solid rgba(24,246,200,0.15)"><p class="text-xs" style="color:var(--accent)" id="cost-estimate-text"></p></div>' +
        '<label class="flex items-center gap-3 cursor-pointer p-3 rounded-2xl mb-3" style="background:rgba(255,200,0,0.06);border:1px solid rgba(255,200,0,0.15)" data-testid="toggle-quick-match">' +
          '<input type="checkbox" id="quick-match" class="w-4 h-4">' +
          '<div>' +
            '<span class="text-sm font-black" style="color:var(--yellow)"><i class="fas fa-bolt mr-1"></i>Quick Match</span>' +
            '<p class="text-[10px] mt-0.5" style="color:var(--text-dim)">Auto-assign to the highest-rated available operative</p>' +
          '</div>' +
        '</label>' +
        '<button onclick="handlePostJob()" class="btn-primary rounded-full" data-testid="button-post-mission">Post Mission & Lock Escrow</button>' +
        '<div class="text-[11px]" style="color:var(--text-dim)">If you do not have enough MV, fund your vault first.</div>' +
      '</div>' +
    '</div>',
    { width: 'max-w-md' }
  );
}

function setPostMode(mode) {
  var gig = getEl('mode-gig'); var hire = getEl('mode-hire');
  var hiringFields = getEl('hiring-fields');
  var modeInput = getEl('post-mode');
  if (modeInput) modeInput.value = mode;
  if (mode === 'hire') {
    if (hire) { hire.style.background = 'var(--accent-2)'; hire.style.color = '#fff'; hire.style.border = 'none'; }
    if (gig) { gig.style.background = 'rgba(255,255,255,0.08)'; gig.style.color = 'var(--text-mid)'; gig.style.border = '1px solid rgba(255,255,255,0.12)'; }
    if (hiringFields) hiringFields.style.display = 'block';
  } else {
    if (gig) { gig.style.background = 'var(--accent)'; gig.style.color = '#0A0C1A'; gig.style.border = 'none'; }
    if (hire) { hire.style.background = 'rgba(255,255,255,0.08)'; hire.style.color = 'var(--text-mid)'; hire.style.border = '1px solid rgba(255,255,255,0.12)'; }
    if (hiringFields) hiringFields.style.display = 'none';
  }
}

function updateJobFee() {
  var b = parseFloat((getEl('job-budget') || {}).value) || 0;
  var be = getEl('fee-budget'); var te = getEl('fee-total');
  if (be) be.textContent = b + ' MV'; if (te) te.textContent = (b + 1) + ' MV';
}

function openApplyModal(jobId) {
  openModal(
    '<div class="card p-6" style="max-width:460px;margin:auto">' +
      '<div class="flex justify-between items-center mb-4"><h2 class="text-xl font-black">Submit Mission Brief</h2><button onclick="closeModal()" class="close-btn">&times;</button></div>' +
      '<input type="hidden" id="apply-job-id" value="' + jobId + '">' +
      '<div class="space-y-3">' +
        '<textarea id="apply-pitch" placeholder="Why you are the right operative for this mission..." rows="3" maxlength="500" class="field" style="resize:none"></textarea>' +
        '<input id="apply-rate" type="number" min="1" placeholder="Your rate (MV Credits)" class="field">' +
        '<input id="apply-turnaround" placeholder="Turnaround (e.g., 2 hours)" maxlength="50" class="field">' +
        '<button onclick="handleApply()" class="btn-primary rounded-full">Submit application</button>' +
      '</div>' +
    '</div>',
    { width: 'max-w-md' }
  );
}
async function handlePostJob() {
  var title = ((getEl('job-title') || {}).value || '').trim();
  var desc = ((getEl('job-desc') || {}).value || '').trim();
  var type = (getEl('job-type') || {}).value;
  var budget = parseFloat((getEl('job-budget') || {}).value) || 0;
  var urgency = (getEl('job-urgency') || {}).value || 'asap';
  var address = (getEl('job-address') || {}).value || '';
  if (!title) return showToast('Enter a title', 'error');
  if (!type) return showToast('Select a type', 'error');
  if (budget < 1) return showToast('Budget must be at least 1 MV', 'error');
  if (budget > 10000) return showToast('Budget too high', 'error');
  var bal = Number((state.profile && state.profile.mv_balance) || 0);
  if (bal < budget + 1) return showToast('Not enough MV Credits. Fund your vault first.', 'error');
  try {
    setMuxi('Deploying your mission...');
    var res = await apiRequest('rpc/post_job_secure', {
      method: 'POST',
      body: JSON.stringify({ p_poster_id: state.user.id, p_title: title, p_description: desc, p_category: type, p_urgency: urgency, p_budget_mv: budget, p_address: address })
    });
    if (res && res.ok) {
      state.profile.mv_balance = bal - (budget + 1);
      var quickMatch = getEl('quick-match');
      closeModal(); showToast('Mission deployed! Escrow locked.');
      if (quickMatch && quickMatch.checked) { handleQuickMatch(res); }
      setMuxi(muxiQuip('postjob'));
      loadJobsSafe();
    } else {
      var errText = ''; try { errText = await res.text(); } catch(e) {}
      showToast('Error posting job: ' + (errText || 'unknown'), 'error');
    }
  } catch(e) { showToast('Error posting job: ' + (e.message || ''), 'error'); console.error('PostJob error:', e); }
}


async function handleQuickMatch(postRes) {
  try {
    setMuxi('Quick matching... finding the best operative...');
    var workerRes = await apiRequest('users?is_available=eq.true&role=in.(worker,both)&order=rating.desc,jobs_completed.desc&limit=1&select=id,full_name');
    var workers = (workerRes && workerRes.ok) ? await workerRes.json() : [];
    if (workers.length === 0) {
      showToast('No operatives available right now — your mission is posted and waiting for applications.', 'info');
      return;
    }
    var worker = workers[0];
    showToast('Quick matched! ' + (worker.full_name || 'An operative') + ' is on it.', 'success');
    setMuxi('Mission posted & matched! ' + (worker.full_name || 'Top operative') + ' has been assigned.');
  } catch(e) {
    showToast('Quick match failed, mission posted normally.', 'info');
  }
}

async function handleApply() {
  var jobId = (getEl('apply-job-id') || {}).value;
  var pitch = ((getEl('apply-pitch') || {}).value || '').trim();
  var rate = parseFloat((getEl('apply-rate') || {}).value) || 0;
  var turn = ((getEl('apply-turnaround') || {}).value || '').trim();
  if (!pitch) return showToast('Write a pitch', 'error');
  if (rate < 1) return showToast('Enter a rate', 'error');
  if (!turn) return showToast('Enter turnaround', 'error');
  try {
    var res = await apiRequest('applications', {
      method: 'POST',
      body: JSON.stringify({ job_id: jobId, worker_id: state.user.id, pitch: pitch, rate_mv: rate, turnaround: turn, status: 'pending' })
    });
    if (res && res.ok) {
      closeModal(); showToast('Application submitted!');
      setMuxi(muxiQuip('apply'));
      var job = state.jobs.find(function(j) { return j.id === jobId; });
      if (job && job.poster_id) {
        /* Auto-create conversation thread between applicant and poster */
        try {
          var convoRes = await apiRequest('rpc/get_or_create_conversation', {
            method: 'POST',
            body: JSON.stringify({ p_user_id: state.user.id, p_other_user_id: job.poster_id, p_job_id: jobId })
          });
          if (convoRes && convoRes.ok) {
            var cid = await convoRes.json();
            /* Send automatic intro message */
            if (cid) {
              await apiRequest('messages', {
                method: 'POST',
                body: JSON.stringify({
                  conversation_id: cid,
                  sender_id: state.user.id,
                  body: 'Hi! I just submitted a brief for your mission "' + (job.title || 'untitled') + '" - ' + pitch.substring(0, 120) + (pitch.length > 120 ? '...' : '')
                })
              });
            }
          }
        } catch(ce) { console.warn('Auto-convo creation failed:', ce); }
        /* Queue notification for poster */
        try {
          await apiRequest('notifications_queue', { method: 'POST', body: JSON.stringify({ user_id: job.poster_id, type: 'new_application', title: 'New mission brief', body: 'New brief for: ' + (job.title || 'your gig'), channel: 'email' }) });
        } catch(e) {}
      }
    } else { showToast('Error submitting', 'error'); }
  } catch(e) { showToast('Error', 'error'); }
}
