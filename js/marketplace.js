/* =============================================================================
   MARKETPLACE — js/marketplace.js
   eBay-style P2P goods marketplace. Zero seller fees. MV escrow.
============================================================================= */

/* Extend state with marketplace properties */
state.marketListings = [];
state.marketFilter = 'all';
state.marketSearch = '';
state.marketSubTab = 'browse';
state.myListings = [];
state.myOrders = [];
state.savedListings = (function() { try { return JSON.parse(localStorage.getItem('muvr_saved_listings') || '[]'); } catch(e) { return []; } })();

var MARKET_CATEGORIES = [
  { k: 'all',          l: 'All',          icon: 'fa-store' },
  { k: 'electronics',  l: 'Electronics',  icon: 'fa-plug' },
  { k: 'gaming',       l: 'Gaming',       icon: 'fa-gamepad' },
  { k: 'collectibles', l: 'Collectibles', icon: 'fa-gem' },
  { k: 'sneakers',     l: 'Sneakers',     icon: 'fa-shoe-prints' },
  { k: 'clothing',     l: 'Clothing',     icon: 'fa-shirt' },
  { k: 'home',         l: 'Home',         icon: 'fa-house' },
  { k: 'tools',        l: 'Tools',        icon: 'fa-screwdriver-wrench' },
  { k: 'phones',       l: 'Phones',       icon: 'fa-mobile-screen' },
  { k: 'computers',    l: 'Computers',    icon: 'fa-laptop' },
  { k: 'digital',      l: 'Digital',      icon: 'fa-cloud' },
  { k: 'art',          l: 'Art',          icon: 'fa-palette' },
  { k: 'other',        l: 'Other',        icon: 'fa-box' }
];

var MARKET_CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'For Parts'];

var MARKET_CONDITION_COLORS = {
  'New':       { bg: 'rgba(24,246,200,0.15)',  color: '#18F6C8' },
  'Like New':  { bg: 'rgba(96,165,250,0.15)',  color: '#60a5fa' },
  'Good':      { bg: 'rgba(167,139,250,0.15)', color: '#a78bfa' },
  'Fair':      { bg: 'rgba(251,191,36,0.15)',  color: '#fbbf24' },
  'For Parts': { bg: 'rgba(239,68,68,0.15)',   color: '#ef4444' }
};

var MARKET_CAT_COLORS = {
  electronics: '#60a5fa', gaming: '#a78bfa',   collectibles: '#fbbf24',
  sneakers:    '#18F6C8', clothing: '#FF3D9A',  home: '#34d399',
  tools:       '#f59e0b', phones:   '#818cf8',  computers: '#38bdf8',
  digital:     '#7C5CFF', art:      '#f87171',  other: '#9ca3af', all: '#18F6C8'
};

function getMarketCatIcon(cat) {
  var c = MARKET_CATEGORIES.find(function(x) { return x.k === cat; });
  return c ? c.icon : 'fa-box';
}

/* =============================================================================
   RENDER: MARKET TAB
============================================================================= */
function renderMarketTab() {
  var el = getEl('tab-content');
  if (!el) return;
  setMuxi('Zero fees. Escrow on every deal. Buy and sell anything on MUVR Market.');

  el.innerHTML =
    '<div class="fade-up">' +

    /* Header */
    '<div class="mb-5">' +
      '<div class="flex items-start justify-between gap-3">' +
        '<div>' +
          '<h2 class="text-2xl font-black tracking-tight">MUVR Market</h2>' +
          '<p class="text-sm mt-1" style="color:var(--text-mid)">Buy and sell anything. Zero fees. Escrow-protected.</p>' +
        '</div>' +
        '<div class="flex gap-2 mt-1 flex-shrink-0">' +
          '<span class="text-[10px] font-black px-2 py-1 rounded-full" style="background:rgba(24,246,200,0.12);color:var(--accent);border:1px solid rgba(24,246,200,0.25)"><i class="fas fa-shield-halved mr-1"></i>Escrow</span>' +
          '<span class="text-[10px] font-black px-2 py-1 rounded-full" style="background:rgba(255,61,154,0.12);color:#FF3D9A;border:1px solid rgba(255,61,154,0.25)"><i class="fas fa-tag mr-1"></i>0% Fees</span>' +
        '</div>' +
      '</div>' +
    '</div>' +

    /* Sub-tabs */
    '<div class="flex gap-0 mb-5" style="border-bottom:1px solid rgba(255,255,255,0.08)">' +
      '<button onclick="switchMarketSubTab(\'browse\')" class="market-subtab" data-market-tab="browse">Browse</button>' +
      '<button onclick="switchMarketSubTab(\'my-listings\')" class="market-subtab" data-market-tab="my-listings">My Listings</button>' +
      '<button onclick="switchMarketSubTab(\'my-orders\')" class="market-subtab" data-market-tab="my-orders">My Orders</button>' +
    '</div>' +

    '<div id="market-content"></div>' +

    /* FAB */
    '<button onclick="openListItemModal()" id="market-fab" ' +
      'style="position:fixed;bottom:28px;right:24px;z-index:90;background:var(--accent);color:#00110B;border:none;border-radius:999px;padding:14px 22px;font-size:13px;font-weight:900;cursor:pointer;box-shadow:0 8px 32px rgba(24,246,200,0.35);letter-spacing:0.2px;text-transform:uppercase;display:flex;align-items:center;gap:8px;transition:transform 0.15s ease,filter 0.15s ease" ' +
      'onmouseover="this.style.filter=\'brightness(1.08)\';this.style.transform=\'translateY(-2px)\'" ' +
      'onmouseout="this.style.filter=\'\';this.style.transform=\'\'">' +
      '<i class="fas fa-plus"></i>List an Item' +
    '</button>' +

    '</div>';

  /* Inject sub-tab styles once */
  if (!getEl('market-subtab-style')) {
    var s = document.createElement('style');
    s.id = 'market-subtab-style';
    s.textContent = '.market-subtab{padding:8px 16px;background:none;border:none;border-bottom:2px solid transparent;color:rgba(232,236,241,0.5);font-size:12px;font-weight:900;cursor:pointer;text-transform:uppercase;letter-spacing:0.2px;transition:color 0.15s,border-color 0.15s}.market-subtab.mst-active{border-bottom-color:var(--accent);color:var(--accent)}';
    document.head.appendChild(s);
  }

  state.marketSubTab = 'browse';
  _updateMarketSubTabs('browse');
  renderMarketBrowse();
  loadMarketListings();
}

function _updateMarketSubTabs(tab) {
  document.querySelectorAll('.market-subtab').forEach(function(b) {
    b.classList.toggle('mst-active', b.getAttribute('data-market-tab') === tab);
  });
}

function switchMarketSubTab(tab) {
  state.marketSubTab = tab;
  _updateMarketSubTabs(tab);
  if (tab === 'browse') renderMarketBrowse();
  else if (tab === 'my-listings') { renderMyListings(); loadMyMarketListings(); }
  else if (tab === 'my-orders') { renderMyOrders(); loadMyOrders(); }
}

/* =============================================================================
   BROWSE VIEW
============================================================================= */
function renderMarketBrowse() {
  var el = getEl('market-content');
  if (!el) return;
  el.innerHTML =
    /* Search + sort row */
    '<div class="flex gap-2 mb-4">' +
      '<div class="flex-1 relative">' +
        '<i class="fas fa-magnifying-glass" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:rgba(232,236,241,0.4);font-size:13px;pointer-events:none"></i>' +
        '<input id="market-search" type="text" placeholder="Search listings..." class="field" style="padding-left:36px" oninput="onMarketSearch(this.value)" value="' + escapeHtml(state.marketSearch) + '">' +
      '</div>' +
      '<select id="market-sort" class="field" style="width:auto;min-width:120px" onchange="onMarketSort(this.value)">' +
        '<option value="newest">Newest</option>' +
        '<option value="price-asc">Price: Low</option>' +
        '<option value="price-desc">Price: High</option>' +
        '<option value="rating">Top Rated</option>' +
      '</select>' +
    '</div>' +

    /* Category pills */
    '<div class="overflow-x-auto pb-2 mb-5" style="scrollbar-width:thin;scrollbar-color:rgba(255,255,255,0.1) transparent">' +
      '<div class="flex gap-2" style="min-width:max-content">' +
        MARKET_CATEGORIES.map(function(cat) {
          var active = cat.k === (state.marketFilter || 'all');
          return '<button onclick="setMarketFilter(\'' + cat.k + '\')" data-market-cat="' + cat.k + '" ' +
            'class="btn-pill ' + (active ? 'btn-pill-accent' : 'btn-pill-ghost') + '" style="font-size:11px;padding:7px 14px">' +
            '<i class="fas ' + cat.icon + ' mr-1"></i>' + cat.l +
          '</button>';
        }).join('') +
      '</div>' +
    '</div>' +

    '<div id="market-grid">' + _marketSkeleton() + '</div>';
}

function _marketSkeleton() {
  return '<div class="grid gap-4" style="grid-template-columns:repeat(auto-fill,minmax(240px,1fr))">' +
    [1,2,3,4,5,6].map(function() {
      return '<div class="card p-0 overflow-hidden" style="opacity:0.35">' +
        '<div style="height:150px;background:rgba(255,255,255,0.06)"></div>' +
        '<div class="p-3"><div style="height:12px;background:rgba(255,255,255,0.08);border-radius:6px;margin-bottom:8px;width:80%"></div>' +
        '<div style="height:10px;background:rgba(255,255,255,0.06);border-radius:6px;width:50%"></div></div>' +
      '</div>';
    }).join('') +
  '</div>';
}

function renderMarketGrid() {
  var el = getEl('market-grid');
  if (!el) return;

  var listings = (state.marketListings || []).slice();

  if (state.marketFilter && state.marketFilter !== 'all') {
    listings = listings.filter(function(l) { return l.category === state.marketFilter; });
  }
  if (state.marketSearch) {
    var q = state.marketSearch.toLowerCase();
    listings = listings.filter(function(l) {
      return (l.title || '').toLowerCase().indexOf(q) >= 0 ||
             (l.description || '').toLowerCase().indexOf(q) >= 0 ||
             (l.tags || '').toLowerCase().indexOf(q) >= 0;
    });
  }

  if (listings.length === 0) {
    el.innerHTML =
      '<div class="text-center py-16" style="color:var(--text-dim)">' +
        '<i class="fas fa-store" style="font-size:48px;opacity:0.25;display:block;margin-bottom:16px"></i>' +
        '<p class="font-black text-lg mb-2">No listings found</p>' +
        '<p class="text-sm mb-5">Be the first to sell in this category!</p>' +
        '<button onclick="openListItemModal()" class="btn-pill btn-pill-accent"><i class="fas fa-plus mr-1"></i>List an Item</button>' +
      '</div>';
    return;
  }

  el.innerHTML =
    '<div class="grid gap-4" style="grid-template-columns:repeat(auto-fill,minmax(240px,1fr))">' +
      listings.map(function(l) { return renderMarketCard(l); }).join('') +
    '</div>';
}

function renderMarketCard(l) {
  var cat       = l.category || 'other';
  var color     = MARKET_CAT_COLORS[cat] || '#9ca3af';
  var cond      = l.condition || 'Good';
  var cs        = MARKET_CONDITION_COLORS[cond] || MARKET_CONDITION_COLORS['Good'];
  var price     = Number(l.price_mv || 0);
  var rating    = Number(l.seller_rating || 0);
  var saved     = (state.savedListings || []).indexOf(l.id) >= 0;

  return '<div class="card card-interactive p-0 overflow-hidden" style="cursor:pointer" onclick="openListingDetail(\'' + l.id + '\')">' +

    /* Image placeholder */
    '<div style="height:150px;background:linear-gradient(135deg,' + color + '18,' + color + '05);' +
      'display:flex;align-items:center;justify-content:center;position:relative;border-bottom:1px solid rgba(255,255,255,0.06)">' +
      '<i class="fas ' + getMarketCatIcon(cat) + '" style="font-size:44px;color:' + color + ';opacity:0.55"></i>' +

      /* Top-left badges */
      '<div style="position:absolute;top:8px;left:8px;display:flex;flex-direction:column;gap:4px">' +
        '<span style="font-size:9px;font-weight:900;padding:2px 7px;border-radius:99px;background:' + cs.bg + ';color:' + cs.color + ';border:1px solid ' + cs.color + '40">' + escapeHtml(cond) + '</span>' +
        (l.muvr_delivery ? '<span style="font-size:9px;font-weight:900;padding:2px 7px;border-radius:99px;background:rgba(124,92,255,0.2);color:#a78bfa;border:1px solid rgba(124,92,255,0.3)"><i class="fas fa-motorcycle mr-1"></i>MUVR</span>' : '') +
        (l.is_agent     ? '<span style="font-size:9px;font-weight:900;padding:2px 7px;border-radius:99px;background:rgba(24,246,200,0.12);color:var(--accent);border:1px solid rgba(24,246,200,0.3)"><i class="fas fa-robot mr-1"></i>Agent</span>' : '') +
      '</div>' +

      /* Save / heart */
      '<button onclick="event.stopPropagation();toggleSaveListing(\'' + l.id + '\')" ' +
        'style="position:absolute;top:8px;right:8px;background:rgba(0,0,0,0.5);border:none;' +
        'color:' + (saved ? '#FF3D9A' : 'rgba(232,236,241,0.55)') + ';' +
        'width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:13px;display:grid;place-items:center" title="Save">' +
        '<i class="fas fa-heart"></i>' +
      '</button>' +
    '</div>' +

    /* Body */
    '<div class="p-3">' +
      '<h3 class="font-black text-sm line-clamp-2 mb-1">' + escapeHtml(l.title || 'Untitled') + '</h3>' +

      '<div class="flex items-center justify-between mb-2">' +
        '<span class="text-base font-black" style="color:var(--accent)">' + mvLabel(price.toLocaleString()) + '</span>' +
        (Number(l.quantity || 1) > 1 ? '<span class="text-[10px]" style="color:var(--text-dim)">\xd7' + l.quantity + ' avail</span>' : '') +
      '</div>' +

      '<div class="flex items-center justify-between">' +
        '<div class="flex items-center gap-1">' +
          '<span class="text-[10px] truncate" style="color:var(--text-dim);max-width:100px">' + escapeHtml(l.seller_name || 'Anonymous') + '</span>' +
          (rating > 0 ? '<span class="text-[10px]" style="color:#fbbf24">★ ' + rating.toFixed(1) + '</span>' : '') +
        '</div>' +
        '<div style="color:rgba(232,236,241,0.35);font-size:10px;display:flex;gap:6px">' +
          (l.local_pickup  ? '<i class="fas fa-handshake" title="Local Pickup"></i>' : '') +
          (l.ships         ? '<i class="fas fa-box" title="Ships"></i>' : '') +
          (l.muvr_delivery ? '<i class="fas fa-motorcycle" title="MUVR Delivery"></i>' : '') +
        '</div>' +
      '</div>' +

      '<div class="flex items-center justify-between mt-2">' +
        (l.location_city
          ? '<span class="text-[10px]" style="color:var(--text-dim)"><i class="fas fa-location-dot mr-1"></i>' + escapeHtml(l.location_city) + (l.location_state ? ', ' + escapeHtml(l.location_state) : '') + '</span>'
          : '<span></span>') +
        '<span class="text-[10px]" style="color:var(--text-dim)">' + relTime(l.created_at) + '</span>' +
      '</div>' +
    '</div>' +

  '</div>';
}

/* =============================================================================
   LOAD LISTINGS
============================================================================= */
async function loadMarketListings() {
  try {
    var catQ = (state.marketFilter && state.marketFilter !== 'all') ? '&category=eq.' + state.marketFilter : '';
    var res = await apiRequest(
      'marketplace_listings?status=eq.active&order=created_at.desc&limit=60' + catQ +
      '&select=id,title,description,category,condition,price_mv,quantity,seller_id,seller_name,seller_rating,location_city,location_state,local_pickup,ships,muvr_delivery,is_agent,tags,created_at'
    );
    state.marketListings = (res && res.ok) ? await res.json() : [];
  } catch(e) {
    state.marketListings = [];
  }
  renderMarketGrid();
}

function setMarketFilter(cat) {
  state.marketFilter = cat;
  document.querySelectorAll('[data-market-cat]').forEach(function(b) {
    var active = b.getAttribute('data-market-cat') === cat;
    b.className = 'btn-pill ' + (active ? 'btn-pill-accent' : 'btn-pill-ghost');
    b.style.fontSize = '11px';
    b.style.padding = '7px 14px';
  });
  loadMarketListings();
}

var marketSearchDebounce = null;
function onMarketSearch(val) {
  state.marketSearch = val;
  clearTimeout(marketSearchDebounce);
  marketSearchDebounce = setTimeout(function() { renderMarketGrid(); }, 260);
}

function onMarketSort(val) {
  var ls = state.marketListings;
  if (val === 'price-asc')  ls.sort(function(a,b){ return Number(a.price_mv||0) - Number(b.price_mv||0); });
  else if (val === 'price-desc') ls.sort(function(a,b){ return Number(b.price_mv||0) - Number(a.price_mv||0); });
  else if (val === 'rating') ls.sort(function(a,b){ return Number(b.seller_rating||0) - Number(a.seller_rating||0); });
  else ls.sort(function(a,b){ return new Date(b.created_at) - new Date(a.created_at); });
  renderMarketGrid();
}

/* =============================================================================
   LISTING DETAIL MODAL
============================================================================= */
async function openListingDetail(listingId) {
  var listing = (state.marketListings || []).find(function(l) { return l.id === listingId; });
  if (!listing) {
    try {
      var res = await apiRequest('marketplace_listings?id=eq.' + listingId + '&select=*');
      var d = (res && res.ok) ? await res.json() : [];
      listing = d && d[0];
    } catch(e) {}
  }
  if (!listing) return showToast('Could not load listing', 'error');

  var cat      = listing.category || 'other';
  var color    = MARKET_CAT_COLORS[cat] || '#9ca3af';
  var cond     = listing.condition || 'Good';
  var cs       = MARKET_CONDITION_COLORS[cond] || MARKET_CONDITION_COLORS['Good'];
  var price    = Number(listing.price_mv || 0);
  var rating   = Number(listing.seller_rating || 0);
  var isMine   = state.user && state.user.id === listing.seller_id;
  var loggedIn = !!state.user;

  openModal(
    '<div class="card p-0 overflow-hidden" style="max-width:540px;margin:auto">' +

    /* Hero image area */
    '<div style="height:200px;background:linear-gradient(135deg,' + color + '15,' + color + '05);' +
      'display:flex;align-items:center;justify-content:center;position:relative;border-bottom:1px solid rgba(255,255,255,0.06)">' +
      '<i class="fas ' + getMarketCatIcon(cat) + '" style="font-size:60px;color:' + color + ';opacity:0.5"></i>' +
      '<div style="position:absolute;top:10px;left:10px;display:flex;gap:5px;flex-wrap:wrap">' +
        '<span style="font-size:9px;font-weight:900;padding:3px 8px;border-radius:99px;background:rgba(24,246,200,0.15);color:var(--accent);border:1px solid rgba(24,246,200,0.3)"><i class="fas fa-shield-halved mr-1"></i>Escrow</span>' +
        '<span style="font-size:9px;font-weight:900;padding:3px 8px;border-radius:99px;background:rgba(255,61,154,0.15);color:#FF3D9A;border:1px solid rgba(255,61,154,0.3)"><i class="fas fa-tag mr-1"></i>0% Fees</span>' +
        (listing.muvr_delivery ? '<span style="font-size:9px;font-weight:900;padding:3px 8px;border-radius:99px;background:rgba(124,92,255,0.2);color:#a78bfa;border:1px solid rgba(124,92,255,0.3)"><i class="fas fa-motorcycle mr-1"></i>MUVR Delivery</span>' : '') +
      '</div>' +
      '<button onclick="closeModal()" class="close-btn" style="position:absolute;top:10px;right:12px">&times;</button>' +
    '</div>' +

    '<div class="p-5">' +
      /* Title + condition */
      '<div class="flex items-start justify-between gap-3 mb-3">' +
        '<h2 class="text-xl font-black leading-tight">' + escapeHtml(listing.title || 'Untitled') + '</h2>' +
        '<span style="font-size:10px;font-weight:900;padding:3px 9px;border-radius:99px;white-space:nowrap;background:' + cs.bg + ';color:' + cs.color + ';border:1px solid ' + cs.color + '40">' + escapeHtml(cond) + '</span>' +
      '</div>' +

      /* Price block */
      '<div class="mb-4 p-3 rounded-xl" style="background:rgba(24,246,200,0.06);border:1px solid rgba(24,246,200,0.15)">' +
        '<div class="text-2xl font-black mb-0.5" style="color:var(--accent)">' + mvLabel(price.toLocaleString()) + '</div>' +
        (Number(listing.quantity || 1) > 1 ? '<div class="text-xs" style="color:var(--text-dim)">' + listing.quantity + ' available</div>' : '') +
      '</div>' +

      /* Description */
      (listing.description ? '<p class="text-sm mb-4" style="color:var(--text-mid);line-height:1.6">' + escapeHtml(listing.description) + '</p>' : '') +

      /* Seller card */
      '<div class="flex items-center gap-3 mb-4 p-3 rounded-xl" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08)">' +
        '<div class="w-10 h-10 rounded-full grid place-items-center font-black" style="background:rgba(24,246,200,0.15);color:var(--accent);font-size:16px">' +
          escapeHtml((listing.seller_name || 'A').charAt(0).toUpperCase()) +
        '</div>' +
        '<div class="flex-1">' +
          '<p class="text-sm font-black">' + escapeHtml(listing.seller_name || 'Anonymous') + '</p>' +
          '<p class="text-[10px]" style="color:var(--text-dim)">' +
            (rating > 0 ? '★ ' + rating.toFixed(1) + ' · ' : 'New seller · ') +
            relTime(listing.created_at) +
            (listing.location_city ? ' · ' + escapeHtml(listing.location_city) + (listing.location_state ? ', ' + escapeHtml(listing.location_state) : '') : '') +
          '</p>' +
        '</div>' +
        (!isMine && loggedIn && listing.seller_id ? '<button onclick="startConvoFromJob(null,\'' + listing.seller_id + '\')" class="btn-sm">Message</button>' : '') +
      '</div>' +

      /* Delivery options */
      '<div class="flex gap-2 mb-4 flex-wrap">' +
        (listing.local_pickup  ? '<span class="text-[10px] font-black px-3 py-1 rounded-full" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.10);color:var(--text-mid)"><i class="fas fa-handshake mr-1"></i>Local Pickup</span>' : '') +
        (listing.ships         ? '<span class="text-[10px] font-black px-3 py-1 rounded-full" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.10);color:var(--text-mid)"><i class="fas fa-box mr-1"></i>Ships</span>' : '') +
        (listing.muvr_delivery ? '<span class="text-[10px] font-black px-3 py-1 rounded-full" style="background:rgba(124,92,255,0.12);border:1px solid rgba(124,92,255,0.25);color:#a78bfa"><i class="fas fa-motorcycle mr-1"></i>MUVR Delivery Available</span>' : '') +
      '</div>' +

      /* Tags */
      (listing.tags ? '<div class="flex flex-wrap gap-1 mb-4">' + listing.tags.split(',').map(function(t) {
        return '<span class="text-[10px] px-2 py-0.5 rounded-full" style="background:rgba(255,255,255,0.06);color:var(--text-dim)">#' + escapeHtml(t.trim()) + '</span>';
      }).join('') + '</div>' : '') +

      /* CTA */
      (isMine
        ? '<div class="p-3 rounded-xl text-center text-sm" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);color:var(--text-dim)"><i class="fas fa-store mr-1"></i>This is your listing.</div>'
        : !loggedIn
          ? '<button onclick="closeModal();openAuthModal()" class="btn-primary rounded-full">Sign In to Buy</button>'
          : '<div class="space-y-2">' +
              '<button onclick="handleBuyNow(\'' + listing.id + '\')" class="btn-primary rounded-full" data-testid="btn-buy-now"><i class="fas fa-bolt mr-2"></i>Buy Now &middot; ' + price.toLocaleString() + ' MV</button>' +
              (listing.muvr_delivery ? '<button onclick="handleRequestMuvrDelivery(\'' + listing.id + '\')" class="btn-secondary rounded-full" style="font-size:13px"><i class="fas fa-motorcycle mr-2"></i>Request MUVR Delivery</button>' : '') +
              '<button onclick="toggleSaveListing(\'' + listing.id + '\')" class="btn-secondary rounded-full" style="font-size:13px"><i class="fas fa-heart mr-2"></i>Save</button>' +
            '</div>'
      ) +
    '</div>' +
    '</div>',
    { width: 'max-w-lg' }
  );
}

/* =============================================================================
   BUY NOW
============================================================================= */
async function handleBuyNow(listingId) {
  if (!state.user) return showToast('Sign in to purchase', 'error');
  var listing = (state.marketListings || []).find(function(l) { return l.id === listingId; });
  var price   = listing ? Number(listing.price_mv || 0) : 0;
  var balance = Number((state.profile && state.profile.mv_balance) || 0);

  if (balance < price) {
    closeModal();
    showToast('Insufficient MV balance. Load your vault first.', 'error');
    setMuxi('You need ' + price + ' MV. Top up your vault and come back!');
    return;
  }

  openModal(
    '<div class="card p-6" style="max-width:420px;margin:auto">' +
      '<div class="flex justify-between items-center mb-4">' +
        '<h2 class="text-lg font-black">Confirm Purchase</h2>' +
        '<button onclick="closeModal()" class="close-btn">&times;</button>' +
      '</div>' +
      '<div class="p-4 rounded-xl mb-4" style="background:rgba(24,246,200,0.06);border:1px solid rgba(24,246,200,0.15)">' +
        '<p class="text-sm font-black mb-1">' + escapeHtml((listing && listing.title) || 'Item') + '</p>' +
        '<p class="text-xl font-black" style="color:var(--accent)">' + mvLabel(price.toLocaleString()) + '</p>' +
      '</div>' +
      '<div class="p-3 rounded-xl mb-5 text-xs" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);color:var(--text-mid);line-height:1.6">' +
        '<i class="fas fa-shield-halved mr-1" style="color:var(--accent)"></i>' +
        '<strong>Escrow Protected:</strong> Your MV locks now and releases to the seller only after you confirm delivery.' +
      '</div>' +
      '<button onclick="confirmBuyNow(\'' + listingId + '\')" class="btn-primary rounded-full"><i class="fas fa-lock mr-2"></i>Lock ' + price.toLocaleString() + ' MV in Escrow</button>' +
    '</div>'
  );
}

async function confirmBuyNow(listingId) {
  if (!state.user) return;
  setMuxi('Locking MV in escrow...');
  try {
    var res = await apiRequest('rpc/marketplace_purchase', {
      method: 'POST',
      body: JSON.stringify({ p_listing_id: listingId, p_buyer_id: state.user.id })
    });
    if (res && res.ok) {
      closeModal();
      showToast('Purchased! MV in escrow — confirm delivery when it arrives.', 'success');
      setMuxi('MV locked in escrow. Release it when the item arrives safely.');
      burstConfetti();
      loadMarketListings();
    } else {
      var err = ''; try { err = await res.text(); } catch(e) {}
      showToast('Purchase failed: ' + (err || 'unknown'), 'error');
    }
  } catch(e) { showToast('Error: ' + (e.message || ''), 'error'); }
}

async function handleConfirmDelivery(orderId) {
  if (!state.user) return;
  try {
    var res = await apiRequest('rpc/marketplace_confirm_delivery', {
      method: 'POST',
      body: JSON.stringify({ p_order_id: orderId, p_buyer_id: state.user.id })
    });
    if (res && res.ok) {
      showToast('Delivery confirmed! MV released to seller.', 'success');
      setMuxi('Deal sealed. Escrow released. The marketplace is working.');
      burstConfetti();
      loadMyOrders();
    } else { showToast('Could not confirm delivery.', 'error'); }
  } catch(e) { showToast('Error: ' + (e.message || ''), 'error'); }
}

async function handleRequestMuvrDelivery(listingId) {
  if (!state.user) return;
  setMuxi('Creating a delivery mission on MUVR GO...');
  try {
    var res = await apiRequest('rpc/marketplace_request_delivery', {
      method: 'POST',
      body: JSON.stringify({ p_listing_id: listingId, p_requester_id: state.user.id })
    });
    if (res && res.ok) {
      closeModal();
      showToast('Delivery mission posted to MUVR GO!', 'success');
      setMuxi('Delivery mission live on the map. An operative will pick it up.');
    } else { showToast('Could not create delivery mission.', 'error'); }
  } catch(e) { showToast('Error: ' + (e.message || ''), 'error'); }
}

function toggleSaveListing(listingId) {
  if (!state.user) { showToast('Sign in to save listings', 'info'); return; }
  state.savedListings = state.savedListings || [];
  var idx = state.savedListings.indexOf(listingId);
  if (idx >= 0) {
    state.savedListings.splice(idx, 1);
    showToast('Removed from saved', 'info');
  } else {
    state.savedListings.push(listingId);
    showToast('Listing saved!', 'success');
  }
  try { localStorage.setItem('muvr_saved_listings', JSON.stringify(state.savedListings)); } catch(e) {}
  /* Refresh heart color if grid is visible */
  if (state.marketSubTab === 'browse') renderMarketGrid();
}

/* =============================================================================
   LIST AN ITEM MODAL
============================================================================= */
function openListItemModal() {
  if (!state.user) { openAuthModal(); return; }

  openModal(
    '<div class="card p-6 overflow-y-auto" style="max-width:520px;margin:auto;max-height:90vh">' +
      '<div class="flex justify-between items-center mb-5">' +
        '<div>' +
          '<h2 class="text-xl font-black">List an Item</h2>' +
          '<p class="text-xs mt-0.5" style="color:var(--text-dim)">Zero seller fees &middot; Escrow protected</p>' +
        '</div>' +
        '<button onclick="closeModal()" class="close-btn">&times;</button>' +
      '</div>' +

      '<div class="mb-3">' +
        '<label class="text-xs font-black mb-1 block" style="color:var(--text-mid)">Title *</label>' +
        '<input id="list-title" type="text" placeholder="What are you selling?" class="field" maxlength="120">' +
      '</div>' +

      '<div class="mb-3">' +
        '<label class="text-xs font-black mb-1 block" style="color:var(--text-mid)">Description</label>' +
        '<textarea id="list-desc" rows="3" placeholder="Describe the item — condition details, dimensions, what\'s included..." class="field" style="resize:none" maxlength="1000"></textarea>' +
      '</div>' +

      '<div class="grid grid-cols-2 gap-3 mb-3">' +
        '<div>' +
          '<label class="text-xs font-black mb-1 block" style="color:var(--text-mid)">Category *</label>' +
          '<select id="list-cat" class="field">' +
            MARKET_CATEGORIES.filter(function(c) { return c.k !== 'all'; }).map(function(c) {
              return '<option value="' + c.k + '">' + c.l + '</option>';
            }).join('') +
          '</select>' +
        '</div>' +
        '<div>' +
          '<label class="text-xs font-black mb-1 block" style="color:var(--text-mid)">Condition *</label>' +
          '<select id="list-condition" class="field">' +
            MARKET_CONDITIONS.map(function(c) { return '<option value="' + c + '">' + c + '</option>'; }).join('') +
          '</select>' +
        '</div>' +
      '</div>' +

      '<div class="grid grid-cols-2 gap-3 mb-3">' +
        '<div>' +
          '<label class="text-xs font-black mb-1 block" style="color:var(--text-mid)">Price (MV) *</label>' +
          '<input id="list-price" type="number" min="1" step="1" placeholder="e.g. 25" class="field">' +
        '</div>' +
        '<div>' +
          '<label class="text-xs font-black mb-1 block" style="color:var(--text-mid)">Quantity</label>' +
          '<input id="list-qty" type="number" min="1" step="1" value="1" class="field">' +
        '</div>' +
      '</div>' +

      '<div class="grid grid-cols-2 gap-3 mb-3">' +
        '<div>' +
          '<label class="text-xs font-black mb-1 block" style="color:var(--text-mid)">City</label>' +
          '<input id="list-city" type="text" placeholder="City" class="field">' +
        '</div>' +
        '<div>' +
          '<label class="text-xs font-black mb-1 block" style="color:var(--text-mid)">State</label>' +
          '<input id="list-state" type="text" placeholder="VA" class="field" maxlength="2">' +
        '</div>' +
      '</div>' +

      '<div class="mb-4">' +
        '<label class="text-xs font-black mb-2 block" style="color:var(--text-mid)">Delivery Options *</label>' +
        '<div class="flex flex-wrap gap-4">' +
          '<label class="flex items-center gap-2 cursor-pointer text-sm font-bold"><input type="checkbox" id="list-pickup"> Local Pickup</label>' +
          '<label class="flex items-center gap-2 cursor-pointer text-sm font-bold"><input type="checkbox" id="list-ships"> I\'ll Ship</label>' +
          '<label class="flex items-center gap-2 cursor-pointer text-sm font-bold" style="color:var(--accent)"><input type="checkbox" id="list-muvr-del"><i class="fas fa-motorcycle"></i>MUVR Delivery</label>' +
        '</div>' +
      '</div>' +

      '<div class="mb-5">' +
        '<label class="text-xs font-black mb-1 block" style="color:var(--text-mid)">Tags <span style="opacity:0.5">(comma-separated)</span></label>' +
        '<input id="list-tags" type="text" placeholder="vintage, rare, bundle" class="field">' +
      '</div>' +

      '<div class="p-3 rounded-xl mb-4 text-xs" style="background:rgba(24,246,200,0.06);border:1px solid rgba(24,246,200,0.15);color:var(--text-mid);line-height:1.6">' +
        '<i class="fas fa-info-circle mr-1" style="color:var(--accent)"></i>' +
        'MUVR charges <strong style="color:var(--accent)">0% seller fees</strong>. Buyers pay in MV credits held in escrow until delivery is confirmed.' +
      '</div>' +

      '<button onclick="handlePostListing()" class="btn-primary rounded-full" data-testid="btn-post-listing"><i class="fas fa-store mr-2"></i>Post Listing</button>' +
    '</div>',
    { width: 'max-w-lg' }
  );
}

async function handlePostListing() {
  var title   = ((getEl('list-title')     || {}).value || '').trim();
  var desc    = ((getEl('list-desc')      || {}).value || '').trim();
  var cat     =  (getEl('list-cat')       || {}).value || '';
  var cond    =  (getEl('list-condition') || {}).value || 'Good';
  var price   = parseInt((getEl('list-price') || {}).value || '0', 10);
  var qty     = parseInt((getEl('list-qty')   || {}).value || '1', 10);
  var city    = ((getEl('list-city')  || {}).value || '').trim();
  var stAbbr  = ((getEl('list-state') || {}).value || '').trim().toUpperCase();
  var pickup  = !!(getEl('list-pickup') || {}).checked;
  var ships   = !!(getEl('list-ships')  || {}).checked;
  var muvrDel = !!(getEl('list-muvr-del') || {}).checked;
  var tags    = ((getEl('list-tags') || {}).value || '').trim();

  if (!title)              return showToast('Enter a title', 'error');
  if (!cat)                return showToast('Select a category', 'error');
  if (!price || price < 1) return showToast('Enter a price in MV (minimum 1)', 'error');
  if (!pickup && !ships && !muvrDel) return showToast('Select at least one delivery option', 'error');

  var btn = document.querySelector('[data-testid="btn-post-listing"]');
  if (btn) { btn.disabled = true; btn.textContent = 'Posting...'; }
  setMuxi('Listing your item on MUVR Market...');

  try {
    var payload = {
      seller_id:     state.user.id,
      seller_name:   (state.profile && (state.profile.full_name || state.profile.username)) || state.user.email,
      seller_rating: (state.profile && state.profile.rating) || null,
      title:         title,
      description:   desc || null,
      category:      cat,
      condition:     cond,
      price_mv:      price,
      quantity:      qty > 0 ? qty : 1,
      location_city: city || null,
      location_state:stAbbr || null,
      local_pickup:  pickup,
      ships:         ships,
      muvr_delivery: muvrDel,
      tags:          tags || null,
      status:        'active'
    };

    var res = await apiRequest('marketplace_listings', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (res && res.ok) {
      closeModal();
      showToast('Listed! Your item is live on MUVR Market.', 'success');
      setMuxi('Zero fees. Escrow on every deal. Your listing is live!');
      burstConfetti();
      loadMarketListings();
    } else {
      var err = ''; try { err = await res.text(); } catch(e2) {}
      showToast('Error posting: ' + (err || 'unknown'), 'error');
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-store mr-2"></i>Post Listing'; }
    }
  } catch(e) {
    showToast('Error: ' + (e.message || ''), 'error');
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-store mr-2"></i>Post Listing'; }
  }
}

/* =============================================================================
   MY LISTINGS
============================================================================= */
function renderMyListings() {
  var el = getEl('market-content');
  if (!el) return;
  if (!state.user) {
    el.innerHTML = '<div class="text-center py-12" style="color:var(--text-dim)">' +
      '<p class="font-black mb-3">Sign in to manage your listings</p>' +
      '<button onclick="openAuthModal()" class="btn-pill btn-pill-accent">Sign In</button></div>';
    return;
  }
  el.innerHTML = '<div id="my-listings-grid"><div class="text-center py-8" style="color:var(--text-dim)"><i class="fas fa-spinner fa-spin mr-2"></i>Loading your listings...</div></div>';
}

async function loadMyMarketListings() {
  if (!state.user) return;
  try {
    var res = await apiRequest('marketplace_listings?seller_id=eq.' + state.user.id + '&order=created_at.desc&select=*');
    state.myListings = (res && res.ok) ? await res.json() : [];
  } catch(e) { state.myListings = []; }
  renderMyListingsGrid();
}

function renderMyListingsGrid() {
  var el = getEl('my-listings-grid');
  if (!el) return;

  if (!state.myListings || state.myListings.length === 0) {
    el.innerHTML =
      '<div class="text-center py-16" style="color:var(--text-dim)">' +
        '<i class="fas fa-store" style="font-size:48px;opacity:0.25;display:block;margin-bottom:16px"></i>' +
        '<p class="font-black text-lg mb-2">No listings yet</p>' +
        '<p class="text-sm mb-5">List your first item — zero seller fees.</p>' +
        '<button onclick="openListItemModal()" class="btn-pill btn-pill-accent"><i class="fas fa-plus mr-1"></i>List an Item</button>' +
      '</div>';
    return;
  }

  el.innerHTML =
    '<div class="grid gap-4 mb-16" style="grid-template-columns:repeat(auto-fill,minmax(240px,1fr))">' +
      state.myListings.map(function(l) {
        var sc = l.status === 'active' ? 'var(--accent)' : l.status === 'sold' ? '#fbbf24' : '#6b7280';
        return '<div class="card p-4">' +
          '<div class="flex items-start justify-between mb-2">' +
            '<h3 class="font-black text-sm flex-1 pr-2 line-clamp-2">' + escapeHtml(l.title || 'Untitled') + '</h3>' +
            '<span class="text-[10px] font-black px-2 py-0.5 rounded-full" style="background:' + sc + '20;color:' + sc + ';border:1px solid ' + sc + '40;white-space:nowrap">' + escapeHtml(l.status || 'active') + '</span>' +
          '</div>' +
          '<p class="text-base font-black mb-2" style="color:var(--accent)">' + mvLabel(Number(l.price_mv || 0).toLocaleString()) + '</p>' +
          '<p class="text-[10px] mb-3" style="color:var(--text-dim)">' + relTime(l.created_at) + ' &middot; ' + escapeHtml(l.category || '') + '</p>' +
          '<div class="flex gap-2">' +
            '<button onclick="openListingDetail(\'' + l.id + '\')" class="btn-sm flex-1">View</button>' +
            (l.status === 'active' ? '<button onclick="deactivateListing(\'' + l.id + '\')" class="btn-sm" style="color:var(--red)">Remove</button>' : '') +
          '</div>' +
        '</div>';
      }).join('') +
    '</div>';
}

async function deactivateListing(listingId) {
  try {
    var res = await apiRequest('marketplace_listings?id=eq.' + listingId, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'inactive' }),
      headers: { 'Prefer': 'return=minimal' }
    });
    if (res && (res.ok || res.status === 204)) {
      showToast('Listing removed', 'success');
      loadMyMarketListings();
      loadMarketListings();
    } else { showToast('Could not remove listing', 'error'); }
  } catch(e) { showToast('Error: ' + (e.message || ''), 'error'); }
}

/* =============================================================================
   MY ORDERS
============================================================================= */
function renderMyOrders() {
  var el = getEl('market-content');
  if (!el) return;
  if (!state.user) {
    el.innerHTML = '<div class="text-center py-12" style="color:var(--text-dim)">' +
      '<p class="font-black mb-3">Sign in to view your orders</p>' +
      '<button onclick="openAuthModal()" class="btn-pill btn-pill-accent">Sign In</button></div>';
    return;
  }
  el.innerHTML = '<div id="my-orders-list"><div class="text-center py-8" style="color:var(--text-dim)"><i class="fas fa-spinner fa-spin mr-2"></i>Loading your orders...</div></div>';
}

async function loadMyOrders() {
  if (!state.user) return;
  try {
    var res = await apiRequest('marketplace_orders?buyer_id=eq.' + state.user.id + '&order=created_at.desc&select=*');
    state.myOrders = (res && res.ok) ? await res.json() : [];
  } catch(e) { state.myOrders = []; }
  renderMyOrdersList();
}

function renderMyOrdersList() {
  var el = getEl('my-orders-list');
  if (!el) return;

  if (!state.myOrders || state.myOrders.length === 0) {
    el.innerHTML =
      '<div class="text-center py-16" style="color:var(--text-dim)">' +
        '<i class="fas fa-box" style="font-size:48px;opacity:0.25;display:block;margin-bottom:16px"></i>' +
        '<p class="font-black text-lg mb-2">No orders yet</p>' +
        '<p class="text-sm mb-5">Browse the market and find something great!</p>' +
        '<button onclick="switchMarketSubTab(\'browse\')" class="btn-pill btn-pill-accent"><i class="fas fa-store mr-1"></i>Browse Market</button>' +
      '</div>';
    return;
  }

  el.innerHTML =
    '<div class="space-y-3 mb-16">' +
      state.myOrders.map(function(o) {
        var sc = o.status === 'delivered' ? 'var(--accent)' : o.status === 'in_escrow' ? '#fbbf24' : '#6b7280';
        var sl = o.status === 'delivered' ? 'Delivered' : o.status === 'in_escrow' ? 'In Escrow — Awaiting Delivery' : (o.status || 'Pending');
        return '<div class="card p-4">' +
          '<div class="flex items-start justify-between gap-3 mb-3">' +
            '<div class="flex-1">' +
              '<h3 class="font-black text-sm">' + escapeHtml(o.listing_title || 'Item') + '</h3>' +
              '<p class="text-[10px] mt-0.5" style="color:var(--text-dim)">From: ' + escapeHtml(o.seller_name || 'Seller') + ' &middot; ' + relTime(o.created_at) + '</p>' +
            '</div>' +
            '<div class="text-right flex-shrink-0">' +
              '<p class="font-black text-sm" style="color:var(--accent)">' + mvLabel(Number(o.price_mv || 0).toLocaleString()) + '</p>' +
              '<span class="text-[10px] font-black px-2 py-0.5 rounded-full" style="background:' + sc + '20;color:' + sc + ';border:1px solid ' + sc + '40">' + sl + '</span>' +
            '</div>' +
          '</div>' +
          (o.status === 'in_escrow'
            ? '<button onclick="handleConfirmDelivery(\'' + o.id + '\')" class="btn-primary rounded-full" style="font-size:12px;padding:10px 18px">' +
                '<i class="fas fa-check mr-1"></i>Confirm Delivery &amp; Release MV</button>'
            : ''
          ) +
        '</div>';
      }).join('') +
    '</div>';
}
