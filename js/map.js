function renderMapTab() {
  var c = getEl('tab-content');
  if (!c) return;
  var isAvail = state.myPresence.status === 'available';

  c.innerHTML = '<div class="fade-up">' +
    '<div class="flex items-center justify-between mb-4">' +
      '<div>' +
        '<h1 class="text-3xl font-black mb-1">' + muxiSVGSmall(28) + ' MUVR™ GO</h1>' +
        '<p class="text-sm" style="color:rgba(232,236,241,0.62)">See operatives and open missions around the world in realtime.</p>' +
      '</div>' +
      '<button id="avail-toggle" onclick="toggleAvailability()" class="btn-pill ' + (isAvail ? 'btn-pill-accent' : 'btn-pill-ghost') + '">' +
        (isAvail ? '<i class="fas fa-broadcast-tower mr-2"></i>LIVE' : '<i class="fas fa-eye-slash mr-2"></i>HIDDEN') +
      '</button>' +
    '</div>' +
    '<div id="map-container"></div>' +
    '<div class="mt-4 grid grid-cols-3 gap-3">' +
      '<div class="stat-card flex items-center gap-2 justify-center">' +
        '<div class="map-legend-dot" style="background:var(--accent);box-shadow:0 0 8px var(--accent)"></div>' +
        '<span class="text-[10px] font-black">AVAILABLE</span>' +
      '</div>' +
      '<div class="stat-card flex items-center gap-2 justify-center">' +
        '<div class="map-legend-dot" style="background:var(--yellow);box-shadow:0 0 8px var(--yellow)"></div>' +
        '<span class="text-[10px] font-black">BUSY</span>' +
      '</div>' +
      '<div class="stat-card flex items-center gap-2 justify-center">' +
        '<div class="map-legend-dot" style="background:var(--accent-3);box-shadow:0 0 8px var(--accent-3)"></div>' +
        '<span class="text-[10px] font-black">OPEN MISSION</span>' +
      '</div>' +
    '</div>' +
    '<div class="mt-4 card p-4">' +
      '<p class="text-[11px] font-bold" style="color:var(--text-dim)"><i class="fas fa-shield-alt mr-1" style="color:var(--accent)"></i>Safety first: Your exact location is NEVER shown to other users. All operatives appear at approximate areas (~500m fuzz). Only you see your precise pin. Toggle to HIDDEN to disappear from the map instantly. No names, handles, or personal info are visible on the map.</p>' +
    '</div>' +
    '<div class="mt-4">' +
      '<h3 class="font-black mb-3">Open Missions Worldwide</h3>' +
      '<div id="map-gig-list"><p class="text-sm" style="color:var(--text-dim)">Loading missions...</p></div>' +
    '</div>' +
  '</div>';

  setTimeout(initMap, 150);
}

function initMap() {
  var container = getEl('map-container');
  if (!container) return;
  if (state.mapObj) { try { state.mapObj.remove(); } catch(e) {} state.mapObj = null; }

  state.mapObj = L.map('map-container', { zoomControl: true, attributionControl: false }).setView([20, 0], 2);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19
  }).addTo(state.mapObj);

  /* Try geolocation */
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(pos) {
      var lat = pos.coords.latitude;
      var lng = pos.coords.longitude;
      state.myPresence.lat = lat;
      state.myPresence.lng = lng;
      state.mapObj.setView([lat, lng], 13);

      /* Add "you are here" marker */
      var myIcon = L.divIcon({
        className: '',
        html: '<div style="width:20px;height:20px;border-radius:50%;background:var(--accent-2);border:3px solid white;box-shadow:0 0 12px rgba(124,92,255,0.8)"></div>',
        iconSize: [20, 20], iconAnchor: [10, 10]
      });
      L.marker([lat, lng], { icon: myIcon }).addTo(state.mapObj).bindPopup('<strong>You</strong>');

      if (state.myPresence.status === 'available') {
        updateMyPresence(lat, lng);
      }
    }, function(err) {
      console.log('Geolocation denied:', err.message);
    }, { timeout: 8000, enableHighAccuracy: false });
  }

  loadMapData();
}

async function loadMapData() {
  if (!state.mapObj) return;
  try {
    /* Load worker presence — SAFETY: fuzz locations ~500m and never show identifiable info */
    var presRes = await apiRequest('user_presence?status=neq.offline&select=user_id,lat,lng,status,last_seen');
    var presence = (presRes && presRes.ok) ? await presRes.json() : [];
    var operativeCount = 0;
    presence.forEach(function(p) {
      if (!p.lat || !p.lng) return;
      if (p.user_id === (state.user && state.user.id)) return;
      /* Fuzz location by ~500m in random direction for safety */
      var fuzzLat = p.lat + (Math.random() - 0.5) * 0.009;
      var fuzzLng = p.lng + (Math.random() - 0.5) * 0.009;
      var color = p.status === 'available' ? '#18F6C8' : '#ffd166';
      var icon = L.divIcon({
        className: '',
        html: '<div class="pulse-dot" style="background:' + color + ';color:' + color + '"></div>',
        iconSize: [14, 14], iconAnchor: [7, 7]
      });
      L.marker([fuzzLat, fuzzLng], { icon: icon })
        .addTo(state.mapObj)
        .bindPopup('<strong>Operative nearby</strong><br>Status: ' + escapeHtml(p.status) + '<br>Approximate area');
      operativeCount++;
    });

    /* Load open gigs and show in sidebar list */
    var jobsRes = await apiRequest('jobs?status=eq.open&select=id,title,budget_mv,address,category&order=created_at.desc&limit=20');
    var jobs = (jobsRes && jobsRes.ok) ? await jobsRes.json() : [];

    var gigList = getEl('map-gig-list');
    if (gigList) {
      if (jobs.length === 0) {
        gigList.innerHTML = '<p class="text-sm" style="color:var(--text-dim)">No open missions right now.</p>';
      } else {
        gigList.innerHTML = jobs.map(function(j) {
          return '<div class="card card-interactive p-3 mb-2 flex items-center justify-between">' +
            '<div class="flex-1 min-w-0">' +
              '<p class="font-black text-xs truncate">' + escapeHtml(j.title) + '</p>' +
              '<p class="text-[10px]" style="color:var(--text-dim)">' + escapeHtml(j.address || j.category || '') + '</p>' +
            '</div>' +
            '<span class="mono font-black text-xs ml-2" style="color:var(--accent)">' + Number(j.budget_mv || 0) + ' <span style="color:var(--accent)">MV</span></span>' +
          '</div>';
        }).join('');
      }
    }
  } catch(e) { console.error('map data error:', e); }
}

async function updateMyPresence(lat, lng) {
  if (!state.user) return;
  try {
    await apiRequest('user_presence', {
      method: 'POST',
      headers: { 'Prefer': 'resolution=merge-duplicates' },
      body: JSON.stringify({
        user_id: state.user.id,
        lat: lat, lng: lng,
        status: state.myPresence.status,
        last_seen: new Date().toISOString()
      })
    });
  } catch(e) { console.error('presence update error:', e); }
}

async function toggleAvailability() {
  state.myPresence.status = state.myPresence.status === 'available' ? 'offline' : 'available';
  var btn = getEl('avail-toggle');
  if (btn) {
    var isAvail = state.myPresence.status === 'available';
    btn.className = 'btn-pill ' + (isAvail ? 'btn-pill-accent' : 'btn-pill-ghost');
    btn.innerHTML = isAvail ? '<i class="fas fa-broadcast-tower mr-2"></i>LIVE' : '<i class="fas fa-eye-slash mr-2"></i>HIDDEN';
  }

  if (state.myPresence.status === 'available') {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(pos) {
        updateMyPresence(pos.coords.latitude, pos.coords.longitude);
      });
    }
    showToast('You are now visible on the map', 'success');
    /* Start periodic updates */
    if (state.presenceInterval) clearInterval(state.presenceInterval);
    state.presenceInterval = setInterval(function() {
      if (state.myPresence.status === 'available' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(pos) {
          updateMyPresence(pos.coords.latitude, pos.coords.longitude);
        });
      }
    }, 45000);
  } else {
    if (state.presenceInterval) { clearInterval(state.presenceInterval); state.presenceInterval = null; }
    await apiRequest('user_presence?user_id=eq.' + state.user.id, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'offline' })
    });
    showToast('You are now hidden from the map', 'info');
  }
}

function openRequestMissionModal() {
  if (!state.user) return openAuthModal();
  var p = state.profile || {};
  var handle = p.username || p.full_name || '';

  openModal(
    '<div class="card p-6 sm:p-8" style="max-width:500px;margin:auto;max-height:90vh;overflow:auto">' +
      '<div class="flex justify-between items-center mb-3">' +
        '<h2 class="text-xl font-black"><i class="fas fa-hand-paper mr-2" style="color:var(--accent)"></i>Looking for Work</h2>' +
        '<button onclick="closeModal()" class="close-btn">&times;</button>' +
      '</div>' +
      '<p class="text-sm mb-4" style="color:var(--text-dim)">Tell us what you\'re good at. MUVR + AI will try to match you with missions — both on the platform and IRL opportunities nearby.</p>' +

      '<input id="seek-name" value="' + escapeHtml(handle) + '" placeholder="Your name or handle" class="field mb-3">' +

      '<p class="text-[10px] font-black mb-2" style="color:var(--text-dim)">WHAT CAN YOU DO?</p>' +
      '<div class="grid grid-cols-2 gap-2 mb-4 p-3 rounded-xl" style="background:rgba(255,255,255,0.03)">' +
        ['Rideshare', 'Delivery', 'Physical Labor', 'Caregiving', 'Elder Care / Hospice', 'Child Care', 'Nursing', 'Cleaning', 'Handyman', 'Yard Work', 'Security', 'Events', 'Pet Care', 'Digital / Remote', 'Creative / Design', 'Tech / Dev', 'Data Entry / VA', 'Web3 / Blockchain', 'AI Tasks', 'Volunteer Work'].map(function(s) {
          return '<label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" class="seek-skill w-3.5 h-3.5" value="' + s.toLowerCase().replace(/ \/ /g,'_').replace(/ /g,'_') + '"><span class="text-xs">' + s + '</span></label>';
        }).join('') +
      '</div>' +

      '<input id="seek-location" placeholder="Your city or area (e.g. Virginia Beach, VA)" class="field mb-3">' +
      '<input id="seek-rate" type="number" min="1" placeholder="Min rate per mission (MV)" class="field mb-3">' +
      '<select id="seek-availability" class="field mb-3">' +
        '<option value="anytime">Available anytime</option>' +
        '<option value="mornings">Mornings</option>' +
        '<option value="evenings">Evenings</option>' +
        '<option value="weekends">Weekends only</option>' +
        '<option value="weekdays">Weekdays only</option>' +
      '</select>' +

      '<textarea id="seek-bio" placeholder="Quick pitch — why should commanders pick you?" rows="2" maxlength="300" class="field mb-4" style="resize:none"></textarea>' +

      '<button onclick="handleRequestMission()" class="btn-primary rounded-full">Submit — Find Me Work</button>' +
      '<p class="text-[10px] mt-3" style="color:var(--text-dim)">Your availability profile will be visible to commanders looking for operatives. MUVR\'s AI will also scan for matching missions and notify you.</p>' +
    '</div>'
  );
}

async function handleRequestMission() {
  var skills = [];
  document.querySelectorAll('.seek-skill:checked').forEach(function(cb) { skills.push(cb.value); });
  if (!skills.length) return showToast('Select at least one skill', 'error');

  var data = {
    user_id: state.user.id,
    name: (getEl('seek-name') || {}).value || '',
    skills: skills,
    location: (getEl('seek-location') || {}).value || '',
    min_rate: parseInt((getEl('seek-rate') || {}).value) || 0,
    availability: (getEl('seek-availability') || {}).value || 'anytime',
    bio: (getEl('seek-bio') || {}).value || '',
    status: 'seeking'
  };

  try {
    var res = await apiRequest('mission_seekers', {
      method: 'POST',
      headers: { 'Prefer': 'resolution=merge-duplicates' },
      body: JSON.stringify(data)
    });
    if (res && res.ok) {
      closeModal();
      showToast('You\'re in the queue! We\'ll match you when missions fit your skills.');
      setMuxi('Profile submitted. I\'m scanning for matching missions now. Stand by, operative.');
    } else {
      var err = ''; try { err = await res.text(); } catch(e) {}
      showToast('Error: ' + (err || 'Could not submit'), 'error');
    }
  } catch(e) { showToast('Error: ' + (e.message || ''), 'error'); }
}
