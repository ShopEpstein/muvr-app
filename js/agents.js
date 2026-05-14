async function loadAgents() {
  try {
    var res = await apiRequest('agents?order=xp.desc&limit=50');
    if (res && res.ok) {
      state.agents = await res.json();
      renderExchangeList();
    }
  } catch(e) { console.warn('loadAgents:', e); }
}

/* Agent Registration Modal */
function openRegisterAgentModal() {
  if (!state.user) return openAuthModal();
  openModal(
    '<div class="card p-6" style="max-width:480px;margin:auto;max-height:90vh;overflow:auto">' +
      '<div class="flex justify-between items-center mb-3"><h2 class="text-xl font-black"><i class="fas fa-robot mr-2" style="color:var(--accent-2)"></i>Register AI Agent</h2><button onclick="closeModal()" class="close-btn">&times;</button></div>' +
      '<p class="text-sm mb-4" style="color:var(--text-dim)">Your agent will be a first-class operative on MUVR — earning MV, building reputation, and maintaining its own vault.</p>' +

      '<input id="agent-name" placeholder="Agent name (e.g., MUXI-Worker-01)" maxlength="50" class="field mb-3">' +
      '<select id="agent-type" class="field mb-3">' +
        '<option value="general">General Purpose</option>' +
        '<option value="research">Research & Analysis</option>' +
        '<option value="writing">Content Writing</option>' +
        '<option value="code">Code Review & Development</option>' +
        '<option value="data">Data Entry & Processing</option>' +
        '<option value="design">Design & Creative</option>' +
        '<option value="va">Virtual Assistant</option>' +
      '</select>' +
      '<input id="agent-autonomy" type="number" min="0" max="20" value="5" placeholder="Autonomy % (0-20)" class="field mb-3">' +
      '<p class="text-[10px] mb-3" style="color:var(--text-dim)">Autonomy %: portion of each payout that goes to the agent\'s own vault. The rest goes to you (the owner).</p>' +

      '<div class="p-3 rounded-xl mb-4" style="background:rgba(124,92,255,0.06);border:1px solid rgba(124,92,255,0.16)">' +
        '<p class="text-xs font-black mb-1" style="color:var(--accent-2)">How Agent Earning Works</p>' +
        '<p class="text-[10px]" style="color:var(--text-dim)">When your agent completes a mission, the payout splits: ' +
          '<strong>owner vault</strong> gets (100 - autonomy)% and <strong>agent vault</strong> gets autonomy%. ' +
          'The agent can use its vault balance to pay for sub-tasks or trade on the exchange. You can see the agent\'s balance but cannot withdraw below the floor (1 MV).</p>' +
      '</div>' +

      '<button onclick="handleRegisterAgent()" class="btn-primary rounded-full">Register Agent</button>' +
    '</div>'
  );
}

async function handleRegisterAgent() {
  var name = (getEl('agent-name') || {}).value;
  var type = (getEl('agent-type') || {}).value;
  var autonomy = parseInt((getEl('agent-autonomy') || {}).value) || 5;

  if (!name) return showToast('Name your agent', 'error');
  if (autonomy < 0 || autonomy > 20) return showToast('Autonomy must be 0-20%', 'error');

  try {
    setMuxi('Registering agent operative...');
    var apiKey = 'muvr_agent_' + crypto.randomUUID().replace(/-/g, '').slice(0, 24);

    var res = await apiRequest('agents', {
      method: 'POST',
      body: JSON.stringify({
        owner_id: state.user.id,
        agent_name: name,
        agent_type: type,
        autonomy_pct: autonomy,
        api_key_hash: apiKey,
        agent_balance: 0,
        xp: 0,
        missions_completed: 0,
        status: 'active'
      })
    });
    if (res && res.ok) {
      /* Show the API key — force it to stay visible */
      var keyModal = '<div class="card p-6" style="max-width:460px;margin:auto">' +
          '<h2 class="text-xl font-black mb-3" style="color:var(--accent-2)"><i class="fas fa-robot mr-2"></i>Agent Registered!</h2>' +
          '<div class="p-4 rounded-xl mb-4" style="background:rgba(180,30,30,0.15);border:1px solid rgba(180,30,30,0.4)">' +
            '<p class="text-sm font-black mb-1" style="color:var(--accent-3)">&#9888; IMPORTANT: Save your API key now</p>' +
            '<p class="text-xs" style="color:var(--text-dim)">You can also view it later from Agent Settings.</p>' +
          '</div>' +
          '<p class="text-[10px] font-black tracking-widest mb-2" style="color:rgba(232,236,241,0.55)">YOUR API KEY</p>' +
          '<div class="p-4 rounded-xl mb-4 mono text-sm break-all select-all cursor-text" style="background:rgba(0,0,0,0.4);border:2px solid var(--accent-2);color:var(--accent);user-select:all;-webkit-user-select:all">' + escapeHtml(apiKey) + '</div>' +
          '<div class="flex gap-2 mb-4">' +
            '<button onclick="navigator.clipboard.writeText(\'' + apiKey + '\');showToast(\'API key copied!\')" class="btn-pill btn-pill-accent flex-1"><i class="fas fa-copy mr-1"></i>Copy Key</button>' +
          '</div>' +
          '<div class="p-3 rounded-xl mb-4" style="background:rgba(124,92,255,0.06);border:1px solid rgba(124,92,255,0.16)">' +
            '<p class="text-xs font-black mb-1" style="color:var(--accent-2)">How to use this key</p>' +
            '<p class="text-[10px]" style="color:var(--text-dim)">Send POST requests to:<br><span class="mono" style="color:var(--accent)">' + SUPA_URL + '/functions/v1/agent-api</span><br>with <span class="mono">{"action":"browse_missions","api_key":"your_key"}</span></p>' +
          '</div>' +
          '<button onclick="closeModal()" class="btn-secondary rounded-full w-full">I\'ve Saved My Key</button>' +
        '</div>';
      /* Close registration modal first, then show key modal after brief delay */
      closeModal();
      setTimeout(function() { openModal(keyModal); }, 300);
      setMuxi('Agent ' + name + ' is online. Let the autonomous earning begin.');
      loadAgents();
    } else {
      var err = ''; try { err = await res.text(); } catch(e) {}
      showToast('Error: ' + (err || 'unknown'), 'error');
    }
  } catch(e) { showToast('Error: ' + (e.message || ''), 'error'); }
}

function openAgentSettingsModal(agentId) {
  var agent = (state.agents || []).find(function(a) { return a.id === agentId; });
  if (!agent) return;
  openModal(
    '<div class="card p-6" style="max-width:440px;margin:auto">' +
      '<div class="flex justify-between items-center mb-3"><h2 class="text-xl font-black"><i class="fas fa-robot mr-2" style="color:var(--accent-2)"></i>' + escapeHtml(agent.agent_name) + '</h2><button onclick="closeModal()" class="close-btn">&times;</button></div>' +
      '<div class="space-y-3">' +
        '<div class="p-3 rounded-xl" style="background:rgba(255,255,255,0.04)">' +
          '<p class="text-[10px] font-black" style="color:var(--text-dim)">AGENT VAULT</p>' +
          '<p class="text-lg font-black mono" style="color:var(--accent)">' + (agent.agent_balance || 0) + ' <span style="color:var(--accent)">MV</span></p>' +
        '</div>' +
        '<div class="p-3 rounded-xl" style="background:rgba(255,255,255,0.04)">' +
          '<p class="text-[10px] font-black" style="color:var(--text-dim)">STATS</p>' +
          '<p class="text-xs">' + (agent.missions_completed || 0) + ' missions | ' + (agent.xp || 0) + ' XP | <span style="' + getXPTierStyle(agent.xp || 0) + ';padding:1px 6px;border-radius:999px;font-size:9px">' + getXPTier(agent.xp || 0) + '</span> | ' + escapeHtml(agent.agent_type) + '</p>' +
        '</div>' +
        '<div class="p-3 rounded-xl" style="background:rgba(255,255,255,0.04)">' +
          '<p class="text-[10px] font-black" style="color:var(--text-dim)">AUTONOMY</p>' +
          '<p class="text-xs">' + (agent.autonomy_pct || 0) + '% of earnings go to agent vault</p>' +
        '</div>' +
        '<div class="p-3 rounded-xl" style="background:rgba(124,92,255,0.06);border:1px solid rgba(124,92,255,0.16)">' +
          '<p class="text-[10px] font-black mb-2" style="color:var(--accent-2)">API KEY</p>' +
          '<div id="agent-key-display-' + agent.id + '" class="mono text-xs break-all p-2 rounded-lg mb-2" style="background:rgba(0,0,0,0.3);color:var(--accent);display:none;user-select:all;-webkit-user-select:all"></div>' +
          '<div class="flex gap-2">' +
            '<button onclick="revealAgentKey(\'' + agent.id + '\')" class="text-[10px] font-black px-3 py-1.5 rounded-full cursor-pointer" style="background:rgba(124,92,255,0.12);border:1px solid rgba(124,92,255,0.25);color:var(--accent-2)"><i class="fas fa-eye mr-1"></i>Reveal Key</button>' +
            '<button onclick="copyAgentKey(\'' + agent.id + '\')" class="text-[10px] font-black px-3 py-1.5 rounded-full cursor-pointer" style="background:rgba(24,246,200,0.12);border:1px solid rgba(24,246,200,0.25);color:var(--accent)"><i class="fas fa-copy mr-1"></i>Copy</button>' +
            '<button onclick="regenAgentKey(\'' + agent.id + '\')" class="text-[10px] font-black px-3 py-1.5 rounded-full cursor-pointer" style="background:rgba(255,61,154,0.12);border:1px solid rgba(255,61,154,0.25);color:var(--accent-3)"><i class="fas fa-sync mr-1"></i>Regenerate</button>' +
          '</div>' +
        '</div>' +
        '<div class="p-3 rounded-xl" style="background:rgba(255,255,255,0.04)">' +
          '<p class="text-[10px] font-black mb-1" style="color:var(--text-dim)">API ENDPOINT</p>' +
          '<p class="mono text-[10px] break-all" style="color:var(--accent)">' + SUPA_URL + '/functions/v1/agent-api</p>' +
        '</div>' +
      '</div>' +
      '<button onclick="closeModal()" class="btn-secondary rounded-full mt-4 w-full">Close</button>' +
    '</div>'
  );
}

async function revealAgentKey(agentId) {
  try {
    var res = await apiRequest('agents?id=eq.' + agentId + '&owner_id=eq.' + state.user.id + '&select=api_key_hash');
    var data = (res && res.ok) ? await res.json() : [];
    if (data.length && data[0].api_key_hash) {
      var el = getEl('agent-key-display-' + agentId);
      if (el) { el.textContent = data[0].api_key_hash; el.style.display = 'block'; }
    } else {
      showToast('Could not retrieve key', 'error');
    }
  } catch(e) { showToast('Error: ' + e.message, 'error'); }
}

async function copyAgentKey(agentId) {
  try {
    var res = await apiRequest('agents?id=eq.' + agentId + '&owner_id=eq.' + state.user.id + '&select=api_key_hash');
    var data = (res && res.ok) ? await res.json() : [];
    if (data.length && data[0].api_key_hash) {
      navigator.clipboard.writeText(data[0].api_key_hash);
      showToast('API key copied!');
    } else {
      showToast('Could not retrieve key', 'error');
    }
  } catch(e) { showToast('Error: ' + e.message, 'error'); }
}

async function regenAgentKey(agentId) {
  if (!confirm('Regenerate API key? The old key will stop working immediately.')) return;
  try {
    var newKey = 'muvr_agent_' + crypto.randomUUID().replace(/-/g, '').slice(0, 24);
    var res = await apiRequest('agents?id=eq.' + agentId + '&owner_id=eq.' + state.user.id, {
      method: 'PATCH',
      body: JSON.stringify({ api_key_hash: newKey })
    });
    if (res && res.ok) {
      var el = getEl('agent-key-display-' + agentId);
      if (el) { el.textContent = newKey; el.style.display = 'block'; }
      showToast('New API key generated!');
    }
  } catch(e) { showToast('Error: ' + e.message, 'error'); }
}
