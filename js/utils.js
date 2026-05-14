function forceHideBoot(reason) {
  var bs = getEl('boot-screen');
  if (!bs) return;
  bs.classList.add('done');
  if (reason) console.warn('[boot] forced hide:', reason);
}
setTimeout(function() { forceHideBoot('timeout'); }, 900);

window.addEventListener('error', function(e) {
  console.error('[window.error]', e && e.message, e && e.filename, e && e.lineno);
  try { showToast('UI error caught. MUXI is investigating.', 'error'); } catch(x) {}
  forceHideBoot('window.error');
});
window.addEventListener('unhandledrejection', function(e) {
  console.error('[unhandledrejection]', e && e.reason);
  forceHideBoot('unhandledrejection');
});

var getEl = function(id) { return document.getElementById(id); };

function escapeHtml(str) {
  var div = document.createElement('div');
  div.textContent = (str == null ? '' : String(str));
  return div.innerHTML;
}

function xpBooster(icon, label, xpVal, sub) {
  return '<div class="p-2 rounded-xl text-center" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06)">' +
    '<span class="text-base">' + icon + '</span>' +
    '<p class="text-[10px] font-black mt-1">' + label + '</p>' +
    '<p class="text-xs font-black" style="color:var(--accent)">' + xpVal + '</p>' +
    '<p class="text-[9px]" style="color:var(--text-dim)">' + sub + '</p>' +
  '</div>';
}

function formatTime(iso) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleString(); } catch(e) { return ''; }
}

function formatRelative(iso) {
  if (!iso) return '';
  try {
    var d = new Date(iso);
    var now = new Date();
    var diff = Math.floor((now - d) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    return Math.floor(diff / 86400) + 'd ago';
  } catch(e) { return ''; }
}
function withTimeout(promise, ms, label) {
  var t;
  var timeout = new Promise(function(_, reject) {
    t = setTimeout(function() { reject(new Error('timeout:' + (label || ''))); }, ms);
  });
  return Promise.race([promise, timeout]).finally(function() { clearTimeout(t); });
}

function relTime(dateStr) {
  if (!dateStr) return '';
  var d = new Date(dateStr);
  var now = Date.now();
  var diff = Math.floor((now - d.getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  return d.toLocaleDateString();
}

function showToast(message, type) {
  type = type || 'success';
  var c = getEl('toast-container');
  if (!c) return;
  var t = document.createElement('div');
  t.className = 'toast toast-' + type;
  t.textContent = message;
  c.appendChild(t);
  setTimeout(function() {
    t.style.opacity = '0';
    t.style.transition = 'opacity 0.25s';
    setTimeout(function() { t.remove(); }, 260);
  }, 3200);
}

async function apiRequest(path, options) {
  options = options || {};
  if (!sb) return null;
  try {
    if (!state.accessToken) {
      var sess = await sb.auth.getSession();
      state.accessToken = (sess.data.session && sess.data.session.access_token) || null;
    }
    if (!state.accessToken) return null;
    var headers = Object.assign({
      'apikey': SUPA_KEY,
      'Authorization': 'Bearer ' + state.accessToken
    }, options.headers || {});
    if (!headers['Content-Type'] && options.body) headers['Content-Type'] = 'application/json';
    if (!headers['Prefer']) {
      if (options.method === 'POST') headers['Prefer'] = 'return=representation';
    }
    return await fetch(SUPA_URL + '/rest/v1/' + path, Object.assign({}, options, { headers: headers }));
  } catch(err) { console.error('apiRequest:', err); return null; }
}

function openModal(html, opts) {
  opts = opts || {};
  var layer = getEl('modal-layer');
  if (!layer) return;
  var w = opts.width || 'max-w-sm';
  layer.innerHTML = '<div class="modal-overlay" id="active-modal"><div class="modal-body w-full ' + w + ' mx-auto" style="max-height:92vh;overflow-y:auto">' + html + '</div></div>';
  requestAnimationFrame(function() {
    var m = getEl('active-modal');
    if (m) m.classList.add('open');
  });
  if (!opts.locked) {
    var m = getEl('active-modal');
    if (m) m.addEventListener('click', function(e) { if (e.target === m) closeModal(); });
  }
}

function closeModal() {
  var m = getEl('active-modal');
  if (!m) return;
  m.classList.remove('open');
  setTimeout(function() {
    var l = getEl('modal-layer');
    if (l) l.innerHTML = '';
  }, 260);
}

function muxiSVG(size) {
  size = size || 52;
  return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 64 64" fill="none">' +
    '<path d="M18 20 L12 10 L22 14" stroke="rgba(232,236,241,0.92)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="M46 20 L52 10 L42 14" stroke="rgba(232,236,241,0.92)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="M18 20 C18 14, 46 14, 46 20" stroke="rgba(232,236,241,0.92)" stroke-width="2.4" stroke-linecap="round"/>' +
    '<path d="M16 22 C14 34, 18 48, 32 50 C46 48, 50 34, 48 22" stroke="rgba(232,236,241,0.92)" stroke-width="2.4" stroke-linecap="round"/>' +
    '<circle cx="24" cy="34" r="3" fill="rgba(24,246,200,0.95)"/>' +
    '<circle cx="40" cy="34" r="3" fill="rgba(24,246,200,0.95)"/>' +
    '<path d="M28 44 C30 46, 34 46, 36 44" stroke="rgba(232,236,241,0.62)" stroke-width="2.4" stroke-linecap="round"/>' +
    '</svg>';
}

function muxiSVGSmall(size) {
  size = size || 16;
  return '<svg class="mv-icon" width="' + size + '" height="' + size + '" viewBox="0 0 64 64" fill="none">' +
    '<path d="M18 20 L12 10 L22 14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="M46 20 L52 10 L42 14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="M18 20 C18 14, 46 14, 46 20" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>' +
    '<path d="M16 22 C14 34, 18 48, 32 50 C46 48, 50 34, 48 22" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>' +
    '<circle cx="24" cy="34" r="3" fill="currentColor"/>' +
    '<circle cx="40" cy="34" r="3" fill="currentColor"/>' +
    '</svg>';
}

function mvLabel(amount) {
  return '<span style="color:var(--accent)">' + muxiSVGSmall(14) + ' ' + amount + ' MV</span>';
}

function getStatusDot(user) {
  var lastSeen = user.last_seen ? new Date(user.last_seen) : (user.last_location_update ? new Date(user.last_location_update) : null);
  var recent = lastSeen && (Date.now() - lastSeen.getTime()) < 300000;
  if (recent && user.is_available) return '<span class="status-dot status-online" title="Available"></span>';
  if (recent) return '<span class="status-dot status-busy" title="Busy"></span>';
  return '<span class="status-dot status-offline" title="Offline"></span>';
}

function getStatusLabel(user) {
  var lastSeen = user.last_seen ? new Date(user.last_seen) : (user.last_location_update ? new Date(user.last_location_update) : null);
  var recent = lastSeen && (Date.now() - lastSeen.getTime()) < 300000;
  if (recent && user.is_available) return '<span class="text-[10px] font-black" style="color:var(--accent)">Available Now</span>';
  if (recent) return '<span class="text-[10px] font-black" style="color:#f59e0b">Busy</span>';
  return '<span class="text-[10px]" style="color:var(--text-dim)">Offline</span>';
}

function getXpBadge(user) {
  var xp = Number(user.xp || user.trust_score || 0);
  var missions = Number(user.jobs_completed || user.missions_completed || 0);
  var score = xp + (missions * 120);
  if (score >= 10000) return '<span class="xp-badge xp-legendary">\u{1F451} Legendary</span>';
  if (score >= 2000) return '<span class="xp-badge xp-elite">⚡ Elite</span>';
  if (score >= 500) return '<span class="xp-badge xp-specialist">\u{1F396} Specialist</span>';
  return '<span class="xp-badge xp-recruit">\u{1F530} Recruit</span>';
}

function getAvatarCircle(name, size) {
  size = size || 42;
  var letter = (name || '?').charAt(0).toUpperCase();
  var colors = ['#18F6C8','#7C5CFF','#FF3D9A','#f59e0b','#60a5fa','#a78bfa','#f87171','#34d399'];
  var idx = 0; for (var i = 0; i < (name||'').length; i++) idx += (name||'').charCodeAt(i);
  var bg = colors[idx % colors.length];
  return '<div class="worker-avatar" style="background:' + bg + '20;color:' + bg + ';width:' + size + 'px;height:' + size + 'px;font-size:' + Math.round(size*0.38) + 'px">' + letter + '</div>';
}

var MISSION_CATEGORIES = [
  {k:'all',l:'All Missions',emoji:'\u{1F50D}'},
  {k:'physical',l:'Moving & Hauling',emoji:'\u{1F69A}'},
  {k:'cleaning',l:'Cleaning',emoji:'\u{1F9F9}'},
  {k:'handyman',l:'Handyman & Repairs',emoji:'\u{1F527}'},
  {k:'delivery',l:'Delivery & Errands',emoji:'\u{1F4E6}'},
  {k:'yardwork',l:'Lawn & Outdoor',emoji:'\u{1F33F}'},
  {k:'digital',l:'Tech & Digital',emoji:'\u{1F4BB}'},
  {k:'creative',l:'Creative & Design',emoji:'\u{1F3A8}'},
  {k:'other',l:'General Tasks',emoji:'\u{1F4CB}'},
  {k:'rideshare',l:'Rideshare',emoji:'\u{1F697}'},
  {k:'caregiving',l:'Caregiving',emoji:'\u{1F64F}'},
  {k:'web3',l:'Web3',emoji:'⛓'},
  {k:'ai_task',l:'AI Tasks',emoji:'\u{1F916}'},
  {k:'volunteer',l:'Volunteer',emoji:'\u{1F49C}'}
];

var SEO_TITLES = {
  landing: 'MUVR™ - Zero Commission Gig Marketplace for Movers, Delivery & Services',
  jobs: 'Missions | MUVR™ - Browse & Post Gig Jobs',
  messages: 'Messages | MUVR™',
  vault: 'Vault & Credits | MUVR™ - MV Balance & Transactions',
  exchange: 'P2P Exchange | MUVR™ - Buy & Sell MV Credits',
  map: 'MUVR™ GO - Find Workers & Services Near You',
  dossier: 'Profile & Dossier | MUVR™',
  blog: 'Blog | MUVR™ - Moving Tips, Guides & Gig Economy News'
};

function setSEOTitle(page) {
  document.title = SEO_TITLES[page] || SEO_TITLES.landing;
  var canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) {
    var base = 'https://muvr-app.vercel.app';
    canonical.href = page === 'landing' ? base : base + '/#' + page;
  }
}

function setSEOBlogPostTitle(post) {
  if (post && post.title) {
    document.title = post.title + ' | MUVR™ Blog';
  }
}

function brandMark(sizeClass) {
  sizeClass = sizeClass || 'text-5xl';
  return '<div class="inline-flex items-center gap-3">' +
    '<div class="relative">' +
      '<div class="absolute -inset-2 blur-2xl opacity-40" style="background:radial-gradient(circle at 30% 30%,rgba(24,246,200,0.6),transparent 60%),radial-gradient(circle at 70% 50%,rgba(124,92,255,0.4),transparent 60%)"></div>' +
      '<div class="' + sizeClass + ' font-black tracking-tight relative"><span style="color:var(--accent)">M</span>U<span style="color:var(--accent)">V</span>R<sup style="font-size:0.45em;vertical-align:super;opacity:0.7">&trade;</sup></div>' +
    '</div>' +
    '<span class="text-[10px] font-black px-3 py-1 rounded-full" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.10);color:rgba(232,236,241,0.85);letter-spacing:0.22px">OWNED BY THE WORKERS</span>' +
  '</div>';
}
