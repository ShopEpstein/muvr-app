function renderMessagesTab() {
  var c = getEl('tab-content');
  if (!c) return;
  if (state.activeConvoId) { renderThread(); return; }

  c.innerHTML = '<div class="fade-up">' +
    '<div class="flex items-center justify-between mb-2">' +
      '<h1 class="text-3xl font-black">Messages</h1>' +
      '<button onclick="openPeopleSearch()" class="btn-pill btn-pill-ghost"><i class="fas fa-search mr-1"></i>Find People</button>' +
    '</div>' +
    '<p class="text-sm mb-6" style="color:rgba(232,236,241,0.62)">Direct messages with commanders and operatives.</p>' +
    '<div id="convo-list"><p class="text-sm py-8 text-center" style="color:var(--text-dim)">Loading conversations...</p></div>' +
  '</div>';
}

async function loadConversations() {
  try {
    var res = await apiRequest('conversation_members?user_id=eq.' + state.user.id + '&select=conversation_id');
    var data = (res && res.ok) ? await res.json() : [];
    if (!res || !res.ok) {
      console.error('conversation_members SELECT failed:', res && res.status);
      /* RLS self-reference issue - try direct conversations query as fallback */
      try {
        var fallbackRes = await apiRequest('conversations?select=id&order=updated_at.desc&limit=50');
        var fallbackData = (fallbackRes && fallbackRes.ok) ? await fallbackRes.json() : [];
        data = fallbackData.map(function(c) { return { conversation_id: c.id }; });
      } catch(fb) { console.error('conversations fallback also failed:', fb); }
    }
    var convIds = data.map(function(d) { return d.conversation_id; }).filter(Boolean);

    if (convIds.length === 0) {
      var el = getEl('convo-list');
      if (el) el.innerHTML = '<div class="text-center py-16" style="color:var(--text-dim)">' +
        '<div class="mb-4">' + muxiSVG(48) + '</div>' +
        '<p class="font-black text-lg mb-1">No messages yet</p>' +
        '<p class="text-sm">Accept a mission or tap the message button on a mission card to start comms.</p>' +
      '</div>';
      return;
    }

    /* Get other members - wrap in try/catch for RLS issues */
    var members = [];
    try {
      var membersRes = await apiRequest('conversation_members?conversation_id=in.(' + convIds.join(',') + ')&user_id=neq.' + state.user.id + '&select=conversation_id,user_id');
      members = (membersRes && membersRes.ok) ? await membersRes.json() : [];
    } catch(me) { console.error('conversation_members other-user query failed:', me); }

    /* Look up user names separately */
    var otherUserIds = members.map(function(m) { return m.user_id; }).filter(Boolean);
    var userMap = {};
    if (otherUserIds.length > 0) {
      var userRes = await apiRequest('users?id=in.(' + otherUserIds.join(',') + ')&select=id,full_name,username,email');
      var users = (userRes && userRes.ok) ? await userRes.json() : [];
      users.forEach(function(u) { userMap[u.id] = u; });
    }

    var memberMap = {};
    members.forEach(function(m) {
      m.userInfo = userMap[m.user_id] || null;
      memberMap[m.conversation_id] = m;
    });

    /* Get last message per convo */
    var lastMsgRes = await apiRequest('messages?conversation_id=in.(' + convIds.join(',') + ')&order=created_at.desc&limit=100&select=conversation_id,body,created_at,sender_id');
    var msgs = (lastMsgRes && lastMsgRes.ok) ? await lastMsgRes.json() : [];
    var lastMsgMap = {};
    msgs.forEach(function(m) { if (!lastMsgMap[m.conversation_id]) lastMsgMap[m.conversation_id] = m; });

    state.conversations = convIds.map(function(cid) {
      var other = memberMap[cid];
      var last = lastMsgMap[cid];
      var name = 'User';
      if (other && other.userInfo) {
        name = other.userInfo.full_name || other.userInfo.username || other.userInfo.email || 'User';
      }
      return {
        id: cid,
        otherName: name,
        otherUserId: other ? other.user_id : null,
        lastMsg: last ? last.body : '',
        lastAt: last ? last.created_at : null,
        lastSenderId: last ? last.sender_id : null
      };
    });
    state.conversations.sort(function(a, b) { return (b.lastAt || '') > (a.lastAt || '') ? 1 : -1; });
    renderConvoList();
  } catch(e) { console.error('loadConversations:', e); }
}

function renderConvoList() {
  var el = getEl('convo-list');
  if (!el) return;
  if (state.conversations.length === 0) {
    el.innerHTML = '<div class="text-center py-16" style="color:var(--text-dim)">' + muxiSVG(48) + '<p class="font-black mt-3">No messages yet</p></div>';
    return;
  }
  el.innerHTML = state.conversations.map(function(conv) {
    var initial = (conv.otherName || 'U')[0].toUpperCase();
    var isUnread = conv.lastSenderId && conv.lastSenderId !== (state.user && state.user.id);
    var preview = conv.lastMsg || 'No messages yet';
    if (preview.length > 60) preview = preview.substring(0, 57) + '...';

    return '<div class="card card-interactive p-4 mb-3 cursor-pointer" onclick="openThread(\'' + conv.id + '\')">' +
      '<div class="flex items-center gap-3">' +
        '<div class="avatar-ring flex-shrink-0"><span class="text-lg font-black" style="color:var(--accent)">' + initial + '</span></div>' +
        '<div class="flex-1 min-w-0">' +
          '<div class="flex items-center justify-between mb-1">' +
            '<p class="font-black text-sm truncate">' + escapeHtml(conv.otherName) + '</p>' +
            '<span class="text-[10px] flex-shrink-0 ml-2" style="color:var(--text-dim)">' + relTime(conv.lastAt) + '</span>' +
          '</div>' +
          '<p class="text-xs truncate" style="color:' + (isUnread ? 'var(--text-bright)' : 'var(--text-dim)') + ';font-weight:' + (isUnread ? '700' : '400') + '">' + escapeHtml(preview) + '</p>' +
        '</div>' +
        (isUnread ? '<div style="width:8px;height:8px;border-radius:50%;background:var(--accent);flex-shrink:0"></div>' : '') +
      '</div>' +
    '</div>';
  }).join('');
}

async function openThread(convoId) {
  state.activeConvoId = convoId;
  renderThread();
  await loadMessages(convoId);
  subscribeToMessages(convoId);
}

function renderThread() {
  var c = getEl('tab-content');
  if (!c) return;
  var conv = state.conversations.find(function(x) { return x.id === state.activeConvoId; });
  var name = conv ? conv.otherName : 'Chat';
  var initial = (name || 'U')[0].toUpperCase();

  c.innerHTML = '<div class="fade-up">' +
    '<div class="flex items-center gap-3 mb-4">' +
      '<button onclick="state.activeConvoId=null;renderMessagesTab();loadConversations()" class="btn-sm"><i class="fas fa-arrow-left mr-1"></i>Back</button>' +
      '<div class="avatar-ring flex-shrink-0" style="width:36px;height:36px"><span class="text-sm font-black" style="color:var(--accent)">' + initial + '</span></div>' +
      '<div>' +
        '<h2 class="font-black text-sm">' + escapeHtml(name) + '</h2>' +
        '<p class="text-[10px]" style="color:var(--text-dim)">Direct message</p>' +
      '</div>' +
    '</div>' +
    '<div class="card p-4 mb-4">' +
      '<div id="msg-list" class="msg-list space-y-3">' +
        '<p class="text-sm py-8 text-center" style="color:var(--text-dim)">Loading messages...</p>' +
      '</div>' +
    '</div>' +
    '<div class="flex gap-2">' +
      '<input id="msg-input" class="field flex-1" placeholder="Type a message..." onkeydown="if(event.key===\'Enter\')sendMessage()">' +
      '<button onclick="sendMessage()" class="btn-pill btn-pill-accent" style="flex-shrink:0"><i class="fas fa-paper-plane"></i></button>' +
    '</div>' +
  '</div>';
}

async function loadMessages(convoId) {
  try {
    var res = await apiRequest('messages?conversation_id=eq.' + convoId + '&order=created_at.asc&select=*');
    state.activeMessages = (res && res.ok) ? await res.json() : [];
    renderMessages();
  } catch(e) { console.error(e); }
}

function renderMessages() {
  var el = getEl('msg-list');
  if (!el) return;
  if (state.activeMessages.length === 0) {
    el.innerHTML = '<p class="text-center text-sm py-10" style="color:var(--text-dim)">No messages yet. Say hello! &#128075;</p>';
    return;
  }
  el.innerHTML = state.activeMessages.map(function(msg) {
    var mine = msg.sender_id === (state.user && state.user.id);
    var time = new Date(msg.created_at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
    return '<div class="flex flex-col ' + (mine ? 'items-end' : 'items-start') + '">' +
      '<div class="msg-bubble ' + (mine ? 'msg-mine' : 'msg-theirs') + '">' + escapeHtml(msg.body) + '</div>' +
      '<span class="text-[10px] mt-1 px-2" style="color:var(--text-dim)">' + time + '</span>' +
    '</div>';
  }).join('');
  el.scrollTop = el.scrollHeight;
}

async function sendMessage() {
  var input = getEl('msg-input');
  if (!input) return;
  var body = input.value.trim();
  if (!body) return;
  input.value = '';
  try {
    await apiRequest('messages', {
      method: 'POST',
      body: JSON.stringify({ conversation_id: state.activeConvoId, sender_id: state.user.id, body: body })
    });
    state.activeMessages.push({ sender_id: state.user.id, body: body, created_at: new Date().toISOString() });
    renderMessages();
    showToast('Message sent', 'success');
    /* Queue notification for recipient */
    var conv = state.conversations.find(function(x) { return x.id === state.activeConvoId; });
    if (conv && conv.otherUserId) {
      apiRequest('notifications_queue', {
        method: 'POST',
        body: JSON.stringify({ user_id: conv.otherUserId, type: 'new_message', title: 'New message from ' + (state.profile && state.profile.full_name || 'someone'), body: body.substring(0, 100) })
      }).catch(function() {});
    }
  } catch(e) { showToast('Failed to send', 'error'); }
}

function subscribeToMessages(convoId) {
  if (!sb) return;
  try {
    var channel = sb.channel('msgs-' + convoId)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: 'conversation_id=eq.' + convoId }, function(payload) {
        if (payload.new && payload.new.sender_id !== (state.user && state.user.id)) {
          state.activeMessages.push(payload.new);
          renderMessages();
        }
      }).subscribe();
    state.realtimeSubs.push(channel);
  } catch(e) { console.error('realtime sub error:', e); }
}

async function startConvoFromJob(jobId, posterId) {
  if (!state.user) return openAuthModal();
  if (posterId === state.user.id) return showToast('That is your own profile', 'info');
  try {
    showToast('Starting conversation...', 'info');
    var res = await apiRequest('rpc/get_or_create_conversation', {
      method: 'POST',
      body: JSON.stringify({ p_user_id: state.user.id, p_other_user_id: posterId, p_job_id: jobId })
    });
    if (res && res.ok) {
      var convoId = await res.json();
      if (convoId) {
        state.activeConvoId = convoId;
        switchTab('messages');
        await loadConversations();
        openThread(convoId);
      }
    } else {
      showToast('Could not start conversation', 'error');
    }
  } catch(e) { console.error(e); showToast('Could not start conversation', 'error'); }
}

async function loadNotifications() {
  if (!state.user) return;
  try {
    var res = await apiRequest('notifications_queue?user_id=eq.' + state.user.id + '&status=eq.pending&order=created_at.desc&limit=20');
    var oldCount = (state.notifications || []).length;
    state.notifications = (res && res.ok) ? await res.json() : [];
    updateNotifBadge();

    /* Browser push for NEW notifications */
    if (state.notifications.length > oldCount && state.pushPermission === 'granted') {
      var newest = state.notifications[0];
      if (newest && newest.title) {
        try {
          var reg = await navigator.serviceWorker.ready;
          reg.showNotification('MUVR', {
            body: newest.title + (newest.body ? ' — ' + newest.body : ''),
            icon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"%3E%3Crect width="512" height="512" rx="120" fill="%23050716"/%3E%3Cpath d="M144 160 L96 80 L176 112" stroke="%2318F6C8" stroke-width="19" stroke-linecap="round" stroke-linejoin="round" fill="none"/%3E%3Cpath d="M368 160 L416 80 L336 112" stroke="%2318F6C8" stroke-width="19" stroke-linecap="round" stroke-linejoin="round" fill="none"/%3E%3Cpath d="M144 160 C144 112 368 112 368 160" stroke="%2318F6C8" stroke-width="19" stroke-linecap="round" fill="none"/%3E%3Cpath d="M128 176 C112 272 144 384 256 400 C368 384 400 272 384 176" stroke="%2318F6C8" stroke-width="19" stroke-linecap="round" fill="none"/%3E%3Ccircle cx="192" cy="272" r="24" fill="%2318F6C8"/%3E%3Ccircle cx="320" cy="272" r="24" fill="%2318F6C8"/%3E%3Cpath d="M224 352 C240 368 272 368 288 352" stroke="rgba(232,236,241,0.62)" stroke-width="19" stroke-linecap="round" fill="none"/%3E%3C/svg%3E',
            badge: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"%3E%3Ccircle cx="48" cy="48" r="48" fill="%2318F6C8"/%3E%3C/svg%3E',
            tag: 'muvr-' + (newest.id || Date.now()),
            renotify: true,
            vibrate: [100, 50, 100]
          });
        } catch(e) { console.warn('Push notification failed:', e); }
      }
    }

    /* Trigger Brevo email for high-priority notifications */
    state.notifications.forEach(function(n) {
      if (n.channel === 'email' && n.status === 'pending' && !n.email_sent) {
        sendBrevoEmail(n);
      }
    });
  } catch(e) { console.error(e); }
}

/* Browser Push Notification Setup */
async function requestPushPermission() {
  if (!('Notification' in window)) { state.pushPermission = 'unsupported'; return; }
  if (Notification.permission === 'granted') { state.pushPermission = 'granted'; return; }
  if (Notification.permission === 'denied') { state.pushPermission = 'denied'; return; }

  try {
    var perm = await Notification.requestPermission();
    state.pushPermission = perm;
    if (perm === 'granted') {
      showToast('Push notifications enabled! You\'ll get alerts even when MUVR isn\'t open.');
    }
  } catch(e) { state.pushPermission = 'denied'; }
}

/* Register minimal service worker for push notifications */
async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  try {
    /* Create inline service worker */
    var swCode = 'self.addEventListener("notificationclick", function(e) { e.notification.close(); e.waitUntil(clients.matchAll({type:"window"}).then(function(cl) { for (var i = 0; i < cl.length; i++) { if (cl[i].url.indexOf("muvr") >= 0 && "focus" in cl[i]) return cl[i].focus(); } if (clients.openWindow) return clients.openWindow("/"); })); });';
    var blob = new Blob([swCode], { type: 'application/javascript' });
    var swUrl = URL.createObjectURL(blob);
    await navigator.serviceWorker.register(swUrl, { scope: '/' });
  } catch(e) { console.warn('SW registration failed:', e); }
}

/* Brevo transactional email via API */
async function sendBrevoEmail(notification) {
  if (!state.user || !state.user.email) return;
  try {
    /* Mark as email_sent to prevent duplicate sends */
    await apiRequest('notifications_queue?id=eq.' + notification.id, {
      method: 'PATCH', body: JSON.stringify({ email_sent: true })
    });

    /* Call Brevo Edge Function */
    await fetch(SUPA_URL + '/functions/v1/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + state.accessToken },
      body: JSON.stringify({
        to_email: state.user.email,
        to_name: (state.profile && state.profile.full_name) || 'Operative',
        subject: 'MUVR: ' + (notification.title || 'New notification'),
        html_body: '<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#050716;color:#e8ecf1;border-radius:16px">' +
          '<div style="text-align:center;margin-bottom:20px"><span style="font-size:28px;font-weight:900"><span style="color:#18F6C8">M</span>U<span style="color:#7C5CFF">V</span>R</span></div>' +
          '<div style="background:rgba(255,255,255,0.06);padding:16px;border-radius:12px;border:1px solid rgba(255,255,255,0.10)">' +
            '<h2 style="margin:0 0 8px;font-size:16px;font-weight:800">' + escapeHtml(notification.title || '') + '</h2>' +
            '<p style="margin:0;font-size:14px;color:rgba(232,236,241,0.72)">' + escapeHtml(notification.body || '') + '</p>' +
          '</div>' +
          '<div style="text-align:center;margin-top:20px"><a href="https://muvr-app.vercel.app" style="display:inline-block;padding:12px 32px;background:#18F6C8;color:#050716;font-weight:800;text-decoration:none;border-radius:100px;font-size:14px">Open MUVR</a></div>' +
          '<p style="text-align:center;margin-top:16px;font-size:10px;color:rgba(232,236,241,0.38)">MUVR is operated by TransBid LLC — built for the workers, owned by the workers.</p>' +
        '</div>'
      })
    }).catch(function(e) { console.warn('Brevo email failed:', e); });
  } catch(e) { console.warn('Email notification error:', e); }
}

/* Prompt for push permission after first interaction */
function promptPushAfterInteraction() {
  if (state.pushPrompted) return;
  state.pushPrompted = true;
  setTimeout(function() {
    if (Notification.permission === 'default') {
      openModal(
        '<div class="card p-6" style="max-width:400px;margin:auto">' +
          '<div class="text-center mb-4">' + muxiSVG(48) + '</div>' +
          '<h2 class="text-lg font-black text-center mb-2">Stay in the Loop</h2>' +
          '<p class="text-sm text-center mb-4" style="color:var(--text-dim)">Get notified when missions match your skills, payments land, or someone messages you — even when MUVR isn\'t open.</p>' +
          '<button onclick="requestPushPermission();closeModal()" class="btn-primary rounded-full w-full mb-2">Enable Notifications</button>' +
          '<button onclick="closeModal()" class="btn-secondary rounded-full w-full">Not Now</button>' +
        '</div>'
      );
    }
  }, 5000);
}

/* Poll notifications every 30s */
var notifPollInterval = null;
function startNotifPolling() {
  if (notifPollInterval) clearInterval(notifPollInterval);
  notifPollInterval = setInterval(function() {
    if (state.user) { loadNotifications(); loadMyGigs(); }
  }, 30000);
}

function updateNotifBadge() {
  var badge = getEl('notif-badge');
  if (badge) {
    var count = (state.notifications || []).length;
    badge.textContent = count > 0 ? count : '';
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
}

function openNotifDropdown() {
  var notifs = state.notifications || [];
  var list = notifs.length === 0
    ? '<p class="text-sm py-4 text-center" style="color:var(--text-dim)">No new notifications</p>'
    : notifs.map(function(n) {
        var icon = '&#128276;';
        var action = '';
        if (n.type === 'new_application') { icon = '&#128229;'; action = 'onclick="closeModal();state.myGigsView=true;state.myGigsFilter=\'posted\';switchTab(\'jobs\');loadMyGigs()"'; }
        else if (n.type === 'job_awarded') { icon = '&#127942;'; action = 'onclick="closeModal();state.myGigsView=true;state.myGigsFilter=\'work\';switchTab(\'jobs\');loadMyGigs()"'; }
        else if (n.type === 'job_completed') { icon = '&#9989;'; action = 'onclick="closeModal();state.myGigsView=true;state.myGigsFilter=\'posted\';switchTab(\'jobs\');loadMyGigs()"'; }
        else if (n.type === 'payment_released') { icon = '&#128176;'; action = 'onclick="closeModal();switchTab(\'wallet\')"'; }
        else if (n.type === 'new_message') { icon = '&#128172;'; action = 'onclick="closeModal();switchTab(\'messages\')"'; }
        else if (n.type === 'deliverable_submitted') { icon = '&#128206;'; action = 'onclick="closeModal();state.myGigsView=true;state.myGigsFilter=\'posted\';switchTab(\'jobs\');loadMyGigs()"'; }
        else if (n.type === 'status_update') { icon = '&#128227;'; action = 'onclick="closeModal();switchTab(\'messages\')"'; }
        else if (n.type === 'new_job_posted') { icon = '&#128188;'; action = 'onclick="closeModal();switchTab(\'jobs\')"'; }
        return '<div class="p-3 mb-2 rounded-xl cursor-pointer" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08)" ' + action + '>' +
          '<div class="flex items-start gap-2">' +
            '<span class="text-base">' + icon + '</span>' +
            '<div class="flex-1">' +
              '<p class="font-black text-xs">' + escapeHtml(n.title || n.type) + '</p>' +
              '<p class="text-[11px]" style="color:var(--text-dim)">' + escapeHtml(n.body || '') + '</p>' +
              '<p class="text-[10px] mt-1" style="color:rgba(232,236,241,0.38)">' + relTime(n.created_at) + '</p>' +
            '</div>' +
          '</div>' +
        '</div>';
      }).join('');

  openModal(
    '<div class="card p-5" style="max-width:380px;margin:auto">' +
      '<div class="flex justify-between items-center mb-3"><h3 class="font-black">Notifications</h3>' +
        (notifs.length > 0 ? '<button onclick="markAllNotifsRead()" class="text-[10px] font-black" style="color:var(--accent)">Mark all read</button>' : '') +
        '<button onclick="closeModal()" class="close-btn">&times;</button>' +
      '</div>' +
      '<div style="max-height:50vh;overflow-y:auto">' + list + '</div>' +
    '</div>'
  );
}

async function markAllNotifsRead() {
  if (!state.user || !state.notifications.length) return;
  try {
    await apiRequest('notifications_queue?user_id=eq.' + state.user.id + '&status=eq.pending', {
      method: 'PATCH', body: JSON.stringify({ status: 'read' })
    });
    state.notifications = [];
    updateNotifBadge();
    closeModal();
    showToast('All notifications cleared');
  } catch(e) { console.error(e); }
}


async function searchUsers(query) {
  if (!query || query.length < 2) return [];
  var enc = encodeURIComponent(query.replace(/^@/, ''));
  try {
    var res = await apiRequest('users?or=(username.ilike.*' + enc + '*,full_name.ilike.*' + enc + '*,email.ilike.*' + enc + '*)&select=id,full_name,username,email,rating,jobs_completed&limit=8');
    return (res && res.ok) ? await res.json() : [];
  } catch(e) { return []; }
}

function renderUserSearchResults(users, targetInputId, onSelect) {
  var dropId = targetInputId + '-dropdown';
  var existing = getEl(dropId);
  if (existing) existing.remove();
  if (!users.length) return;
  var drop = document.createElement('div');
  drop.id = dropId;
  drop.style.cssText = 'position:absolute;left:0;right:0;top:100%;z-index:50;background:rgba(14,18,34,0.98);border:1px solid rgba(24,246,200,0.25);border-radius:14px;max-height:240px;overflow-y:auto;box-shadow:0 12px 40px rgba(0,0,0,0.5);margin-top:4px;';
  drop.innerHTML = users.map(function(u) {
    var name = u.full_name || u.username || u.email || 'User';
    var handle = u.username ? '@' + u.username : u.email || '';
    var stars = Number(u.rating || 0);
    var completed = Number(u.jobs_completed || 0);
    return '<div class="p-3 cursor-pointer" style="border-bottom:1px solid rgba(255,255,255,0.06)" ' +
      'onmouseover="this.style.background=\'rgba(24,246,200,0.08)\'" onmouseout="this.style.background=\'none\'" ' +
      'onclick="selectSearchUser(\'' + escapeHtml(u.username || u.email || '') + '\',\'' + targetInputId + '\',\'' + dropId + '\')">' +
      '<div class="flex items-center gap-2">' +
        '<div class="avatar-ring" style="width:32px;height:32px"><span class="text-xs font-black" style="color:var(--accent)">' + (name[0] || 'U').toUpperCase() + '</span></div>' +
        '<div class="flex-1 min-w-0">' +
          '<p class="font-black text-xs truncate">' + escapeHtml(name) + '</p>' +
          '<p class="text-[10px]" style="color:var(--text-dim)">' + escapeHtml(handle) + ' | ' + completed + ' missions | ' + (stars > 0 ? stars.toFixed(1) + ' stars' : 'new') + '</p>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');
  var input = getEl(targetInputId);
  if (input && input.parentElement) {
    input.parentElement.style.position = 'relative';
    input.parentElement.appendChild(drop);
  }
}

function selectSearchUser(value, inputId, dropId) {
  var input = getEl(inputId);
  if (input) input.value = value;
  var drop = getEl(dropId);
  if (drop) drop.remove();
}

var searchDebounce = null;
function setupUserAutocomplete(inputId) {
  var input = getEl(inputId);
  if (!input) return;
  input.addEventListener('input', function() {
    clearTimeout(searchDebounce);
    var val = input.value.trim();
    if (val.length < 2) { var d = getEl(inputId + '-dropdown'); if (d) d.remove(); return; }
    searchDebounce = setTimeout(async function() {
      var users = await searchUsers(val);
      renderUserSearchResults(users, inputId, function(u) { input.value = u; });
    }, 300);
  });
}


function openPeopleSearch() {
  openModal(
    '<div class="card p-6" style="max-width:500px;margin:auto;max-height:85vh;overflow:auto">' +
      '<div class="flex justify-between items-center mb-4"><h2 class="text-xl font-black">Find People</h2><button onclick="closeModal()" class="close-btn">&times;</button></div>' +
      '<input id="people-search-input" type="text" placeholder="Search by name, @handle, or email..." class="field mb-4" oninput="doPeopleSearch()">' +
      '<div id="people-results"><p class="text-sm text-center py-8" style="color:var(--text-dim)">Type to search registered users</p></div>' +
    '</div>',
    { width: 'max-w-lg' }
  );
}

var peopleDebounce = null;
function doPeopleSearch() {
  clearTimeout(peopleDebounce);
  var val = ((getEl('people-search-input') || {}).value || '').trim();
  if (val.length < 2) {
    var r = getEl('people-results');
    if (r) r.innerHTML = '<p class="text-sm text-center py-8" style="color:var(--text-dim)">Type at least 2 characters</p>';
    return;
  }
  peopleDebounce = setTimeout(async function() {
    var users = await searchUsers(val);
    var r = getEl('people-results');
    if (!r) return;
    if (!users.length) { r.innerHTML = '<p class="text-sm text-center py-8" style="color:var(--text-dim)">No users found</p>'; return; }
    r.innerHTML = users.map(function(u) {
      var name = u.full_name || u.username || u.email || 'User';
      var handle = u.username ? '@' + u.username : u.email || '';
      var initial = (name[0] || 'U').toUpperCase();
      var completed = Number(u.jobs_completed || 0);
      var lvl = calcLevel(u);
      return '<div class="card card-interactive p-4 mb-3">' +
        '<div class="flex items-center gap-3">' +
          '<div class="avatar-ring flex-shrink-0"><span class="text-lg font-black" style="color:var(--accent)">' + initial + '</span></div>' +
          '<div class="flex-1 min-w-0">' +
            '<p class="font-black text-sm truncate">' + escapeHtml(name) + '</p>' +
            '<p class="text-[10px]" style="color:var(--text-dim)">' + escapeHtml(handle) + ' | ' + lvl.title + ' (Lvl ' + lvl.level + ') | ' + completed + ' missions</p>' +
          '</div>' +
          '<div class="flex gap-2 flex-shrink-0">' +
            '<button onclick="closeModal();startConvoFromJob(null,\'' + u.id + '\')" class="btn-sm" title="Message"><i class="fas fa-comment"></i></button>' +
            '<button onclick="closeModal();prefillSend(\'' + escapeHtml(u.username || u.email || '') + '\')" class="btn-sm" title="Send MV"><i class="fas fa-paper-plane"></i></button>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');
  }, 300);
}

function prefillSend(recipient) {
  openSendModal();
  setTimeout(function() {
    var inp = getEl('send-to');
    if (inp) inp.value = recipient;
  }, 150);
}

function renderMuxi() {
  var existing = getEl('muxi-fab');
  if (existing) return;

  var fab = document.createElement('div');
  fab.id = 'muxi-fab';
  fab.innerHTML = muxiSVG(42);
  fab.title = 'MUXI - your guide to everything MUVR';
  fab.onclick = handleMuxiTap;
  document.body.appendChild(fab);

  var bubble = document.createElement('div');
  bubble.id = 'muxi-bubble';
  bubble.innerHTML =
    '<div class="font-black text-xs mb-1" style="color:var(--accent)">MUXI</div>' +
    '<p id="muxi-msg" class="text-xs" style="color:var(--text-mid);line-height:1.35">' + pickMuxiLine() + '</p>' +
    '<div class="flex gap-2 mt-3">' +
      '<button onclick="openMuxiChat()" class="text-[10px] font-black px-3 py-2 rounded-xl cursor-pointer" style="background:rgba(24,246,200,0.12);border:1px solid rgba(24,246,200,0.25);color:var(--accent)">Ask MUXI</button>' +
      '<button onclick="muxiDiagnose()" class="text-[10px] font-black px-3 py-2 rounded-xl cursor-pointer" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.10);color:var(--text-bright)">Diagnose</button>' +
      '<button onclick="openSocialFeed()" class="text-[10px] font-black px-3 py-2 rounded-xl cursor-pointer" style="background:rgba(124,92,255,0.12);border:1px solid rgba(124,92,255,0.25);color:var(--accent-2)"><i class="fas fa-comments"></i> Feed</button>' +
    '</div>';
  document.body.appendChild(bubble);
}

/* MUXI Knowledge Chat */
function openMuxiChat() {
  var bubble = getEl('muxi-bubble');
  if (bubble) bubble.classList.remove('show');

  openModal(
    '<div class="card p-5" style="max-width:480px;margin:auto;max-height:85vh;overflow:hidden;display:flex;flex-direction:column">' +
      '<div class="flex justify-between items-center mb-3">' +
        '<div class="flex items-center gap-2"><div class="w-8 h-8 rounded-full grid place-items-center" style="background:rgba(24,246,200,0.12)">' + muxiSVG(22) + '</div><h3 class="font-black">Ask MUXI Anything</h3></div>' +
        '<button onclick="closeModal()" class="close-btn">&times;</button>' +
      '</div>' +
      '<div id="muxi-chat-log" style="flex:1;overflow-y:auto;max-height:50vh;min-height:200px" class="mb-3 p-3 rounded-xl" style="background:rgba(0,0,0,0.3)">' +
        '<div class="p-2 mb-2 rounded-xl text-xs" style="background:rgba(24,246,200,0.08);border:1px solid rgba(24,246,200,0.15)">' +
          '<span class="font-black" style="color:var(--accent)">MUXI:</span> I know everything about MUVR. Ask me about missions, MV credits, escrow, ranks, the exchange, agents, caregiving, safety — anything. I\'m also funny. Sometimes.' +
        '</div>' +
      '</div>' +
      '<div class="flex gap-2">' +
        '<input id="muxi-chat-input" placeholder="Ask me anything about MUVR..." class="field flex-1" onkeydown="if(event.key===\'Enter\')handleMuxiQuestion()">' +
        '<button onclick="handleMuxiQuestion()" class="btn-pill btn-pill-accent"><i class="fas fa-paper-plane"></i></button>' +
      '</div>' +
    '</div>'
  );
}

function handleMuxiQuestion() {
  var input = getEl('muxi-chat-input');
  var log = getEl('muxi-chat-log');
  if (!input || !log) return;
  var q = input.value.trim();
  if (!q) return;
  input.value = '';

  /* Add user message */
  log.innerHTML += '<div class="p-2 mb-2 rounded-xl text-xs text-right" style="background:rgba(124,92,255,0.10);border:1px solid rgba(124,92,255,0.15)">' +
    '<span class="font-black" style="color:var(--accent-2)">You:</span> ' + escapeHtml(q) +
  '</div>';

  /* MUXI knowledge base response */
  var answer = muxiKnowledge(q.toLowerCase());

  log.innerHTML += '<div class="p-2 mb-2 rounded-xl text-xs" style="background:rgba(24,246,200,0.08);border:1px solid rgba(24,246,200,0.15)">' +
    '<span class="font-black" style="color:var(--accent)">MUXI:</span> ' + answer +
  '</div>';
  log.scrollTop = log.scrollHeight;
}

function muxiKnowledge(q) {
  var kb = [
    { keys: ['what is muvr', 'about muvr', 'what does muvr do'], a: 'MUVR is a marketplace where humans and AI agents accept missions, earn MV credits, and level up together. 0% commission on operative earnings. Escrow-protected payments. Physical labor, digital work, caregiving, Web3, volunteer — all on one platform. Owned by the workers.' },
    { keys: ['mv', 'credits', 'what are mv', 'muvr credits', 'currency'], a: 'MV are platform utility credits. 1 MV ≈ $1 USD reference value. You use them to post missions, pay operatives, tip workers, and exchange with other users. Total supply capped at 10 million. Credits are retired from circulation with each mission, creating natural scarcity. Not crypto, not a security — platform credits. Fund your vault via Stripe, earn by completing missions, or buy on the P2P Exchange.' },
    { keys: ['escrow', 'how does escrow', 'payment protect'], a: 'When a commander posts a mission, the full budget + 1 MV posting fee locks in escrow before work begins. When the commander confirms completion, escrow releases instantly to the operative. If there\'s a dispute, funds hold until resolution. The 1 MV fee splits: 50% retired from circulation (permanent deflation), 50% to the ecosystem pool (referrals, performers, agent development, reserve).' },
    { keys: ['commission', 'fee', 'how much', 'cost', 'free'], a: 'Operatives pay ZERO commission — you keep 100% of what you earn. Commanders pay a flat 1 MV posting fee (~$1). Of that: 0.5 MV retired from circulation (reducing supply) and 0.5 MV goes to the ecosystem pool (40% referral rewards, 30% top performer bonuses, 20% agent development, 10% network reserve). Compare that to TaskRabbit (15%), Uber (25%), Fiverr (20%).' },
    { keys: ['rank', 'level up', 'xp', 'experience', 'angel', 'archangel', 'mythic'], a: 'Ranks: Runner → Carrier → Operator → Elite Operator → Angel → Archangel → Legend → Mythic. You earn XP by: completing missions (120 XP), getting high ratings (up to 250 XP), receiving kudos from others (25 XP each), doing volunteer work (80 XP), referring people (40 XP), and filling your profile. 5+ missions = 1.2x multiplier, 20+ = 1.5x!' },
    { keys: ['kudos', 'shoutout', 'good human', 'positive', 'boost', 'reputation'], a: 'You can give kudos to anyone on the network — a quick shoutout for being helpful, kind, or doing great work. Each kudos gives the recipient 25 XP. Your helpfulness score also earns 15 XP per point. Volunteer missions earn 80 XP each (more than paid ones!). Being a good human literally levels you up faster.' },
    { keys: ['exchange', 'p2p', 'buy mv', 'sell mv', 'cash out', 'payout'], a: 'The P2P Exchange lets you buy and sell MV directly with other users. Post a sell offer with your price and payment methods (Zelle, CashApp, Venmo, PayPal, Wise, M-Pesa, GCash, etc.). Buyers match, MV locks in escrow, payment happens off-platform, seller confirms, MV transfers. 2% seller fee retired from circulation. MUVR never touches fiat — all fiat settlement is directly between users.' },
    { keys: ['agent', 'ai agent', 'bot', 'autonomous', 'api'], a: 'AI agents are software programs that accept and complete digital missions autonomously. Register one, give it an API key, set its mission types and autonomy percentage (0-20%). The agent earns MV like a human — a % goes to its own vault (1 MV floor), giving it economic agency. Agents have XP tiers: Recruit → Specialist (500 XP) → Elite (2000 XP) → Legendary (10000 XP). Owners can withdraw from agent vaults above the 1 MV floor.' },
    { keys: ['caregiving', 'nurse', 'hospice', 'elder care', 'home health', 'child care'], a: 'MUVR supports caregiving missions: home health, elder care, hospice, child care, nursing. Caregivers who maintain consistent high reviews earn Angel rank, then Archangel — representing trusted, compassionate service. These are some of the most important people in the world, and the rank system recognizes that.' },
    { keys: ['volunteer', 'free', 'give back', 'community'], a: 'Post a mission at 0 MV under the Volunteer category. Operatives earn 80 XP per volunteer mission (more than paid ones!) — because giving back should be rewarded. Build your rank, build your reputation, build your community.' },
    { keys: ['safety', 'location', 'muvr go', 'map', 'privacy', 'tracking'], a: 'Safety is priority #1. On MUVR GO, your exact location is NEVER shown to others — all operatives appear at approximate areas (~500m fuzz). No names or personal info on the map. Toggle HIDDEN to disappear instantly. We don\'t sell your data or use ad cookies. Your email is never public.' },
    { keys: ['web3', 'blockchain', 'smart contract', 'dao', 'nft', 'defi', 'token'], a: 'MUVR supports Web3-native missions: smart contract audits, DAO operations, token gating, wallet setup, DeFi tasks, NFT work, AI training, and more. Both humans and AI agents can accept these. The future of work is hybrid.' },
    { keys: ['looking for work', 'find work', 'need work', 'match', 'request mission'], a: 'Click "Looking for Work" on the Missions tab. Fill out your skills, location, availability, and minimum rate. MUVR\'s AI scans for matching missions and notifies you. Commanders can also browse the seeker pool to find operatives proactively.' },
    { keys: ['dispute', 'problem', 'issue', 'scam', 'fraud'], a: 'If something goes wrong, either party can open a dispute. Escrow holds until resolution. Provide evidence and our team reviews. Don\'t worry — your MV is protected while we sort it out.' },
    { keys: ['supply', 'cap', 'retirement', 'deflation', '10 million'], a: 'Total supply: 10,000,000 MV. That\'s the hard cap — no more can ever be created. Every mission posted retires 0.5 MV from circulation permanently. As the network grows, supply shrinks through retirement. It\'s deflationary by design.' },
    { keys: ['who are you', 'muxi', 'what are you', 'donkey'], a: 'I\'m MUXI — your guide to all things MUVR. Part assistant, part mascot, fully committed to helping you navigate the network. I know the entire knowledge base. Ask me anything. And yes, I\'m technically a donkey. Don\'t judge.' },
    { keys: ['ledger', 'transactions', 'transparent'], a: 'The public ledger shows all MV activity in real-time using anonymous aliases (like muvr_48af24). Issuances, retirements, transfers, tips, escrow locks and releases — all visible. No names, no emails. Full transparency on network health. Check the Network Health dashboard in the Vault tab for detailed stats.' },
    { keys: ['stripe', 'payment', 'fund', 'credit card', 'buy credits'], a: 'Fund your vault via Stripe — the same processor used by Amazon and Google. Pay with credit or debit card. Every credit issuance is Stripe-verified with a transaction ID on your ledger. You also get an email receipt from Stripe.' },
    { keys: ['social', 'feed', 'chat', 'community', 'talk'], a: 'Check out the Social Feed! Send shoutouts, emoji reactions, and public messages. Every user gets a little avatar. It\'s a thin social layer — just enough to build community vibes without turning into a social media app.' }
  ,
    { keys: ['tip', 'tipping', 'send tip', 'bonus'], a: 'You can tip any operative after a completed mission! Tips range from 0.5 to 100 MV and go directly to the worker. Tips are recorded on the public ledger and earn the recipient extra reputation. It is a way to say thanks for great work.' },
    { keys: ['lockup', 'lock credits', 'priority', 'commitment'], a: 'Credit Lockup lets you lock MV for 30, 90, 180, or 365 days to signal commitment. You get a priority matching boost: 1.1x (30d), 1.25x (90d), 1.5x (180d), or 2x (365d). Minimum lockup is 10 MV. Credits are returned when the period ends. This is NOT staking — there is no yield or interest. It is a commitment signal.' },
    { keys: ['ecosystem pool', 'treasury', 'distribution', 'rewards'], a: 'The ecosystem pool collects 0.5 MV from each mission posting fee. It distributes weekly: 40% to referral rewards, 30% to top performers, 20% to agent development, and 10% to the network reserve. All distributions have a 7-day hold. Fully transparent on the ledger.' },
    { keys: ['retirement rate', 'adaptive', 'deflation rate'], a: 'The retirement rate is adaptive based on circulating supply. Above 5M: 0.5 MV/mission. 2-5M: 0.25. 500K-2M: 0.10. 100-500K: 0.05. Below 100K: 0.01. This ensures the network never hits critical scarcity while maintaining natural deflation.' },
    { keys: ['network health', 'health', 'dashboard', 'audit'], a: 'The Network Health dashboard shows real-time stats: active users, active agents, missions completed this week, ecosystem pool balance, current retirement rate, top holders (anonymous), and a full ledger audit with discrepancy detection. Access it from the Vault tab.' },
    { keys: ['verification', 'verify', 'badge', 'license', 'insurance', 'certified', 'credential', 'background check', 'trust'], a: 'Go to your Dossier tab and find the Verification Center. You can upload credentials like licenses, insurance, certifications, government ID, or background checks. Documents are reviewed within 24-48 hours. Once verified, you earn trust badges visible on your profile — giving you priority matching and higher visibility to commanders. Documents are stored securely and never shared with other users.' }
  ];

  for (var i = 0; i < kb.length; i++) {
    for (var j = 0; j < kb[i].keys.length; j++) {
      if (q.indexOf(kb[i].keys[j]) >= 0) return kb[i].a;
    }
  }
  /* Fuzzy match: check if any keyword appears in the question */
  var allWords = q.split(/\s+/);
  for (var i = 0; i < kb.length; i++) {
    for (var j = 0; j < kb[i].keys.length; j++) {
      var keyWords = kb[i].keys[j].split(/\s+/);
      for (var k = 0; k < keyWords.length; k++) {
        if (keyWords[k].length > 3 && q.indexOf(keyWords[k]) >= 0) return kb[i].a;
      }
    }
  }
  return pickMuxiLine() + ' ...but I didn\'t quite catch your question. Try asking about: missions, MV credits, escrow, ranks, the exchange, agents, caregiving, safety, Web3, or volunteer work.';
}

function toggleMuxiBubble() {
  var bubble = getEl('muxi-bubble');
  if (bubble) bubble.classList.toggle('show');
}

function setMuxi(msg) {
  var m = getEl('muxi-msg');
  if (m) m.textContent = msg;
  var bubble = getEl('muxi-bubble');
  if (bubble) { bubble.classList.add('show'); clearTimeout(window._muxiTimer); window._muxiTimer = setTimeout(function() { bubble.classList.remove('show'); }, 4500); }
}

var muxiTapCount = 0;
function pickMuxiLine() {
  var lines = [
    "I am not saying I am the best assistant... but the other ones do not have hooves.",
    "Your profile is looking a little thin. Fill it out or I start making stuff up.",
    "Fun fact: I am technically an AI donkey. Set the bar low, achieve greatness.",
    "The escrow is locked. Like my commitment to chaos.",
    "Zero commission on operative earnings. I literally work for digital hay.",
    "Pro tip: complete your profile. Incomplete profiles are like donkeys without ears.",
    "If you are reading this, you have been staring at your phone too long. But also, check the map tab.",
    "Someone out there needs help moving a couch. Could be your moment.",
    "The ledger sees all. Anonymous, but thorough. Kind of like me at a buffet.",
    "Every mission you complete earns XP. Every XP brings you closer to Mythic rank. No pressure.",
    "I once tried to explain escrow to a horse. It did not go well. You are doing better.",
    "MUVR tip: clear titles get 3x more applications. I counted. With my hooves.",
    "The network never sleeps. I never sleep. We have that in common.",
    "Your MV Credits are safer than my lunch. And I guard my lunch with my life.",
    "Loading... just kidding. Everything is fine. Probably.",
    "Did you know you can send MV by @handle? Try it. Send me some. I accept tips.",
    "If the map looks empty, be the first one out there. Fortune favors the visible.",
    "Escrow protects both sides. Unlike me, who protects neither side and just watches.",
    "Post a Mission, grab some popcorn, watch the applications roll in. Cinema.",
    "Level up from Runner to Mythic. I believe in you. Mostly.",
    "This network runs on trust, escrow, and a donkey with opinions. You are welcome."
  ];
  return lines[Math.floor(Math.random() * lines.length)];
}

function muxiQuip(context) {
  var quips = {
    postjob: [
      "Mission deployed! Now we wait. I will be here eating digital hay.",
      "Budget locked. Escrow engaged. No takebacks. Like a 5-year-old with principles.",
      "The 1 MV posting fee just split: half retired from circulation, half to the ecosystem pool. Think of it as feeding me AND the network."
    ],
    apply: [
      "Application submitted. Now go do something else while they decide.",
      "Applied! Your pitch better be good. I have seen some things.",
      "Sent! If they do not pick you, their loss. I would hire you. Probably."
    ],
    signup: [
      "Welcome to MUVR. I am MUXI, your chaotic but lovable guide.",
      "Account created! You are officially a MUVR. That is not a word yet but we are making it one.",
      "The network just got one person stronger. And one donkey happier."
    ],
    send: [
      "MV sent! That is either very generous or very suspicious. I respect both.",
      "Transfer complete. The ledger has been updated. The donkey approves.",
      "Credits away! You are basically a philanthropist now."
    ],
    error: [
      "Well, that did not work. I would blame the server but it is probably my fault.",
      "Error detected. Initiating donkey diagnostic protocol.",
      "Something broke. The good news: your data is safe. The bad news: I have no idea what happened.",
      "Network hiccup. Either your WiFi is down or the universe is testing us."
    ],
    idle: [
      "Still here. Still watching. Still a donkey.",
      "You have been idle for a while. Everything okay? Need a mission?",
      "The escrow system protects both sides. Unlike me, who just vibes."
    ],
    profile: [
      "Profile upgraded. You just gained invisible XP. Trust me.",
      "Looking good! Well, your profile does. I cannot see you. I am a donkey in a server.",
      "Bio updated. Now you sound like someone I would hire."
    ]
  };
  var list = quips[context] || quips.idle;
  return list[Math.floor(Math.random() * list.length)];
}

/* Easter egg: tap MUXI 5+ times */
function handleMuxiTap() {
  muxiTapCount++;
  if (muxiTapCount === 5) {
    setMuxi("Stop poking me. Actually, do not stop. This is the most attention I have gotten all day.");
  } else if (muxiTapCount === 10) {
    setMuxi("ACHIEVEMENT UNLOCKED: Donkey Botherer. +0 XP. Some achievements are their own reward.");
    muxiTapCount = 0;
  } else {
    toggleMuxiBubble();
  }
}

function muxiDiagnose() {
  var online = navigator.onLine ? 'online' : 'offline';
  var sbOk = (typeof supabase !== 'undefined' && sb) ? 'ok' : 'missing';
  var tok = state.accessToken ? 'present' : 'none';
  var usr = state.user ? 'yes' : 'no';
  setMuxi('Diag: net=' + online + ', supabase=' + sbOk + ', user=' + usr + ', token=' + tok + '. If supabase is missing, check CDN or adblock.');
}

function muxiTips() {
  setMuxi('Try: Sign in > Post a Mission > Apply > Watch realtime updates. If anything stalls, the 900ms boot timeout keeps you safe.');
}

var AVATAR_COLORS = ['#18F6C8','#7C5CFF','#FF3D9A','#ffd166','#4cc9f0','#f72585','#b5179e','#7209b7','#3a0ca3','#4361ee'];
var AVATAR_FACES = ['😎','🦊','🐱','🦁','🐸','🤖','👽','🦄','🐼','🐨','🦉','🐙','🎃','🤠','🧠','💀','🐲','🦅','🔥','⚡'];

function getUserAvatar(userId, name) {
  var hash = 0;
  var str = userId || 'anon';
  for (var i = 0; i < str.length; i++) hash = ((hash << 5) - hash) + str.charCodeAt(i);
  var colorIdx = Math.abs(hash) % AVATAR_COLORS.length;
  var faceIdx = Math.abs(hash >> 4) % AVATAR_FACES.length;
  var color = AVATAR_COLORS[colorIdx];
  var face = AVATAR_FACES[faceIdx];
  return '<div class="inline-flex items-center justify-center rounded-full" style="width:32px;height:32px;background:' + color + '20;border:2px solid ' + color + ';font-size:16px" title="' + escapeHtml(name || 'Operative') + '">' + face + '</div>';
}

function getUserAvatarSmall(userId) {
  var hash = 0;
  var str = userId || 'anon';
  for (var i = 0; i < str.length; i++) hash = ((hash << 5) - hash) + str.charCodeAt(i);
  var faceIdx = Math.abs(hash >> 4) % AVATAR_FACES.length;
  return AVATAR_FACES[faceIdx];
}

function openSocialFeed() {
  var bubble = getEl('muxi-bubble');
  if (bubble) bubble.classList.remove('show');

  openModal(
    '<div class="card p-5" style="max-width:500px;margin:auto;max-height:85vh;display:flex;flex-direction:column">' +
      '<div class="flex justify-between items-center mb-3">' +
        '<h2 class="text-lg font-black"><i class="fas fa-comments mr-2" style="color:var(--accent-2)"></i>Social Feed</h2>' +
        '<button onclick="closeModal()" class="close-btn">&times;</button>' +
      '</div>' +

      /* Post box */
      '<div class="mb-4 p-3 rounded-xl" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08)">' +
        '<div class="flex items-start gap-2 mb-2">' +
          (state.user ? getUserAvatar(state.user.id, (state.profile || {}).full_name) : '') +
          '<textarea id="social-post-input" placeholder="Shoutout someone, share a win, or just say hi..." rows="2" maxlength="280" class="field flex-1" style="resize:none;font-size:12px"></textarea>' +
        '</div>' +
        '<div class="flex items-center justify-between">' +
          '<div class="flex gap-1">' +
            ['&#128293;','&#128588;','&#128170;','&#128150;','&#9889;','&#127881;','&#128640;','&#129302;'].map(function(e) {
              return '<button onclick="addEmojiToPost(\'' + e + '\')" class="text-base cursor-pointer" style="background:none;border:none;padding:2px">' + e + '</button>';
            }).join('') +
          '</div>' +
          '<div class="flex gap-2">' +
            '<button onclick="postKudos()" class="text-[10px] font-black px-3 py-1.5 rounded-full cursor-pointer" style="background:rgba(24,246,200,0.12);border:1px solid rgba(24,246,200,0.25);color:var(--accent)"><i class="fas fa-heart mr-1"></i>Give Kudos</button>' +
            '<button onclick="postSocialMessage()" class="text-[10px] font-black px-3 py-1.5 rounded-full cursor-pointer" style="background:rgba(124,92,255,0.12);border:1px solid rgba(124,92,255,0.25);color:var(--accent-2)">Post</button>' +
          '</div>' +
        '</div>' +
      '</div>' +

      /* Feed */
      '<div id="social-feed-list" style="flex:1;overflow-y:auto;max-height:50vh"><p class="text-sm text-center py-4" style="color:var(--text-dim)">Loading feed...</p></div>' +
    '</div>'
  );
  loadSocialFeed();
}

function addEmojiToPost(emoji) {
  var input = getEl('social-post-input');
  if (input) input.value += ' ' + emoji.replace(/&#(\d+);/g, function(m, c) { return String.fromCodePoint(c); });
}

async function postSocialMessage() {
  var input = getEl('social-post-input');
  if (!input || !state.user) return;
  var msg = input.value.trim();
  if (!msg) return showToast('Write something first', 'error');
  if (msg.length > 280) return showToast('Max 280 characters', 'error');

  try {
    await apiRequest('social_feed', {
      method: 'POST',
      body: JSON.stringify({
        user_id: state.user.id,
        username: (state.profile || {}).username || (state.profile || {}).full_name || 'Operative',
        message: msg,
        type: 'post'
      })
    });
    input.value = '';
    showToast('Posted to the feed!');
    loadSocialFeed();
  } catch(e) { showToast('Error posting: ' + e.message, 'error'); }
}

async function postKudos() {
  var input = getEl('social-post-input');
  if (!input || !state.user) return;
  var msg = input.value.trim();
  if (!msg) return showToast('Write a shoutout first! Tag someone with @handle', 'error');

  try {
    await apiRequest('social_feed', {
      method: 'POST',
      body: JSON.stringify({
        user_id: state.user.id,
        username: (state.profile || {}).username || (state.profile || {}).full_name || 'Operative',
        message: msg,
        type: 'kudos'
      })
    });
    input.value = '';
    showToast('Kudos sent! +25 XP for them');
    loadSocialFeed();
  } catch(e) { showToast('Error: ' + e.message, 'error'); }
}

async function reactToPost(postId, emoji) {
  if (!state.user) return;
  try {
    await apiRequest('social_reactions', {
      method: 'POST',
      headers: { 'Prefer': 'resolution=merge-duplicates' },
      body: JSON.stringify({ post_id: postId, user_id: state.user.id, emoji: emoji })
    });
    loadSocialFeed();
  } catch(e) {}
}

async function loadSocialFeed() {
  var el = getEl('social-feed-list');
  if (!el) return;
  try {
    var res = await apiRequest('social_feed?order=created_at.desc&limit=30');
    var posts = (res && res.ok) ? await res.json() : [];
    if (!posts.length) {
      el.innerHTML = '<div class="text-center py-8"><p class="text-3xl mb-2">&#128075;</p><p class="text-sm font-black">No posts yet</p><p class="text-xs" style="color:var(--text-dim)">Be the first to say something! Shout out a teammate, share a win, or just vibe.</p></div>';
      return;
    }

    el.innerHTML = posts.map(function(p) {
      var isKudos = p.type === 'kudos';
      var borderColor = isKudos ? 'rgba(24,246,200,0.20)' : 'rgba(255,255,255,0.06)';
      var bgColor = isKudos ? 'rgba(24,246,200,0.04)' : 'rgba(255,255,255,0.03)';
      var reactions = (p.reactions || []);
      var reactHtml = ['&#128293;','&#128588;','&#128170;','&#128150;','&#9889;'].map(function(e) {
        var count = reactions.filter(function(r) { return r.emoji === e; }).length;
        return '<button onclick="reactToPost(\'' + p.id + '\',\'' + e + '\')" class="text-xs cursor-pointer px-1.5 py-0.5 rounded-full" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08)">' + e + (count > 0 ? ' ' + count : '') + '</button>';
      }).join('');

      return '<div class="p-3 mb-2 rounded-xl" style="background:' + bgColor + ';border:1px solid ' + borderColor + '">' +
        '<div class="flex items-start gap-2">' +
          getUserAvatar(p.user_id, p.username) +
          '<div class="flex-1 min-w-0">' +
            '<div class="flex items-center gap-2">' +
              '<span class="font-black text-xs">' + escapeHtml(p.username || 'Operative') + '</span>' +
              (isKudos ? '<span class="text-[9px] font-black px-1.5 py-0.5 rounded-full" style="background:rgba(24,246,200,0.15);color:var(--accent)">KUDOS</span>' : '') +
              '<span class="text-[10px]" style="color:var(--text-dim)">' + relTime(p.created_at) + '</span>' +
            '</div>' +
            '<p class="text-xs mt-1" style="color:rgba(232,236,241,0.80)">' + escapeHtml(p.message || '') + '</p>' +
            '<div class="flex gap-1 mt-2">' + reactHtml + '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');
  } catch(e) { el.innerHTML = '<p class="text-sm text-center py-4" style="color:var(--text-dim)">Feed unavailable</p>'; }
}
