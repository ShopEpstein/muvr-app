var SUPA_URL = 'https://cfenkstusggrcthehffn.supabase.co';
var SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmZW5rc3R1c2dncmN0aGVoZmZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMTIyNTMsImV4cCI6MjA4NzU4ODI1M30.XcZKrytjAnju05w_7ly7j4bsnwLK08kBoXAhi3xYV5o';

/* Stripe publishable key — set this when you have it. null = beta mode (direct mint) */
window.STRIPE_PK = 'pk_live_51T1HjHCgo0ieTaQCWsiqHk1bn7RZUye5sMb7llRYcDKVAal0UFhFtyxduQ9FwFnoW3uH1NNK2pfg1P4mrkK0oadI00nX6m29aY'; /* Replace with 'pk_live_...' or 'pk_test_...' when ready */

var sb = null;
try {
  sb = supabase.createClient(SUPA_URL, SUPA_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
} catch(e) { console.error('Supabase init failed:', e); }

/* =============================================================================
   STATE
============================================================================= */
var state = {
  user: null,
  accessToken: null,
  profile: null,
  jobs: [],
  jobFilter: 'all',
  balanceVisible: false,
  currentTab: 'jobs',
  conversations: [],
  activeConvoId: null,
  activeMessages: [],
  mapObj: null,
  myPresence: { status: 'offline', lat: null, lng: null },
  publicEvents: [],
  ledgerFilter: 'all',
  realtimeSubs: [],
  unreadMsgCount: 0,
  presenceInterval: null,
  notifications: [],
  pushPermission: (typeof Notification !== 'undefined') ? Notification.permission : 'unsupported',
  pushPrompted: false,
  myGigsView: false,
  myGigs: [],
  myActiveWork: [],
  deliverables: [],
  p2pOffers: [],
  p2pMarketRate: '~1.00',
  p2pPayFilter: 'All',
  myTrades: [],
  exchangeView: 'buy',
  agents: [],
  verifications: [],
  browseOperatives: [],
  onboardingDismissed: false,
  ratingPending: null,
  unreadAppsCount: 0
};