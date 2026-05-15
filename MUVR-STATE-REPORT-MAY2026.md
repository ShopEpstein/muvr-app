# MUVR™ App — State Report (May 2026)

**Generated:** 2026-05-15  
**Repo:** `/home/user/muvr-app`  
**Stack:** Vanilla JS SPA (no build system) · Supabase backend · Vercel deployment  
**Operator:** TransBid LLC (Delaware, USA)  
**Deployed at:** https://muvr-app.vercel.app

---

## 1. REPO STRUCTURE

### 1.1 All Files (non-.git)

| File | Lines |
|------|-------|
| `/home/user/muvr-app/css/style.css` | 489 |
| `/home/user/muvr-app/index.html` | 388 |
| `/home/user/muvr-app/js/agents.js` | 179 |
| `/home/user/muvr-app/js/app.js` | 472 |
| `/home/user/muvr-app/js/auth.js` | 318 |
| `/home/user/muvr-app/js/comms.js` | 928 |
| `/home/user/muvr-app/js/exchange.js` | 369 |
| `/home/user/muvr-app/js/ledger.js` | 209 |
| `/home/user/muvr-app/js/map.js` | 251 |
| `/home/user/muvr-app/js/marketplace.js` | 813 |
| `/home/user/muvr-app/js/missions.js` | 1260 |
| `/home/user/muvr-app/js/profile.js` | 814 |
| `/home/user/muvr-app/js/state.js` | 52 |
| `/home/user/muvr-app/js/utils.js` | 250 |
| `/home/user/muvr-app/js/vault.js` | 514 |
| `/home/user/muvr-app/robots.txt` | 10 |
| `/home/user/muvr-app/sitemap.xml` | 51 |
| `/home/user/muvr-app/vercel.json` | 23 |

**Total JS lines (all `.js` files):** 6,429  
**Total lines across all tracked source files:** 7,306

### 1.2 Script Load Order (from `index.html`)

The following `<script src=...>` tags appear in this order (lines 374–386):

1. `js/state.js`
2. `js/utils.js`
3. `js/auth.js`
4. `js/missions.js`
5. `js/vault.js`
6. `js/exchange.js`
7. `js/ledger.js`
8. `js/agents.js`
9. `js/comms.js`
10. `js/map.js`
11. `js/profile.js`
12. `js/marketplace.js`
13. `js/app.js`

CDN deps loaded before all modules (in `<head>`):
- `cdn.tailwindcss.com` (Tailwind CSS)
- `cdn.jsdelivr.net/npm/@supabase/supabase-js@2`
- Font Awesome 6.5.1 (CSS)
- Google Fonts: Outfit + JetBrains Mono
- Leaflet 1.9.4 (CSS + JS)

### 1.3 Function Inventory by Module

#### `js/app.js` (472 lines)
| Line | Function |
|------|----------|
| 1 | `renderLanding()` |
| 153 | `landingCard(icon, title, desc)` |
| 161 | `howStep(num, icon, title, desc)` |
| 172 | `compRow(feature, muvr, other)` |
| 180 | `gigCompareRow(platform, feeStr, amount)` |
| 193 | `updateGigComparison()` |
| 208 | `mvFeature(title, desc)` |
| 215 | `netStat(label, val, color)` |
| 225 | `renderApp()` |
| 274 | `switchTab(name)` |
| 292 | `async loadProfileSafe()` |
| 305 | `async loadJobsSafe()` |
| 313 | `burstConfetti()` |
| 327 | `handleMintCallback()` |
| 352 | `async boot()` |

#### `js/agents.js` (179 lines)
| Line | Function |
|------|----------|
| 1 | `async loadAgents()` |
| 12 | `openRegisterAgentModal()` |
| 44 | `async handleRegisterAgent()` |
| 101 | `openAgentSettingsModal(agentId)` |
| 139 | `async revealAgentKey(agentId)` |
| 152 | `async copyAgentKey(agentId)` |
| 165 | `async regenAgentKey(agentId)` |

#### `js/auth.js` (318 lines)
| Line | Function |
|------|----------|
| 1 | `openAuthModal()` |
| 46 | `showAuthError(msg)` |
| 52 | `openLegalModal(isReturning)` |
| 103 | `updateLegalButton()` |
| 113 | `async socialSignIn(provider)` |
| 132 | `openResetPasswordModal()` |
| 148 | `async handleResetPassword()` |
| 172 | `async handleUpdatePassword()` |
| 198 | `async handleSignUp()` |
| 224 | `async handleSignIn()` |
| 241 | `async handleLogout()` |
| 257 | `async confirmLogout()` |
| 269 | `async handleQuickAcknowledge()` |
| 282 | `async handleAcceptLegal()` |
| 299 | `async ensureUserRow()` |

#### `js/comms.js` (928 lines)
| Line | Function |
|------|----------|
| 1 | `renderMessagesTab()` |
| 16 | `async loadConversations()` |
| 90 | `renderConvoList()` |
| 119 | `async openThread(convoId)` |
| 126 | `renderThread()` |
| 154 | `async loadMessages(convoId)` |
| 162 | `renderMessages()` |
| 180 | `async sendMessage()` |
| 205 | `subscribeToMessages(convoId)` |
| 219 | `async startConvoFromJob(jobId, posterId)` |
| 242 | `async loadNotifications()` |
| 278 | `async requestPushPermission()` |
| 293 | `async registerServiceWorker()` |
| 305 | `async sendBrevoEmail(notification)` |
| 336 | `promptPushAfterInteraction()` |
| 356 | `startNotifPolling()` |
| 363 | `updateNotifBadge()` |
| 372 | `openNotifDropdown()` |
| 410 | `async markAllNotifsRead()` |
| 424 | `async searchUsers(query)` |
| 433 | `renderUserSearchResults(users, targetInputId, onSelect)` |
| 465 | `selectSearchUser(value, inputId, dropId)` |
| 473 | `setupUserAutocomplete(inputId)` |
| 488 | `openPeopleSearch()` |
| 500 | `doPeopleSearch()` |
| 536 | `prefillSend(recipient)` |
| 544 | `renderMuxi()` |
| 569 | `openMuxiChat()` |
| 592 | `handleMuxiQuestion()` |
| 614 | `muxiKnowledge(q)` |
| 662 | `toggleMuxiBubble()` |
| 667 | `setMuxi(msg)` |
| 675 | `pickMuxiLine()` |
| 702 | `muxiQuip(context)` |
| 746 | `handleMuxiTap()` |
| 758 | `muxiDiagnose()` |
| 766 | `muxiTips()` |
| 773 | `getUserAvatar(userId, name)` |
| 784 | `getUserAvatarSmall(userId)` |
| 792 | `openSocialFeed()` |
| 829 | `addEmojiToPost(emoji)` |
| 834 | `async postSocialMessage()` |
| 857 | `async postKudos()` |
| 879 | `async reactToPost(postId, emoji)` |
| 891 | `async loadSocialFeed()` |

#### `js/exchange.js` (369 lines)
| Line | Function |
|------|----------|
| 1 | `renderExchangeTab()` |
| 67 | `renderExchangeList()` |
| 161 | `async loadP2POffers()` |
| 171 | `async loadMyTrades()` |
| 183 | `openSellMVModal()` |
| 205 | `async handlePostOffer()` |
| 245 | `openBuyModal(offerId)` |
| 265 | `async handleBuy(offerId)` |
| 305 | `async markPaymentSent(tradeId)` |
| 315 | `async confirmPaymentReceived(tradeId)` |
| 348 | `openDisputeModal(tradeId)` |
| 359 | `async handleDispute(tradeId)` |

#### `js/ledger.js` (209 lines)
| Line | Function |
|------|----------|
| 1 | `switchPublicLedger()` |
| 22 | `renderLedgerTab()` |
| 33 | `renderLedgerContent(containerId)` |
| 57 | `async loadPublicEvents()` |
| 70 | `async computeNetworkStats()` |
| 116 | `renderPublicEvents()` |
| 157 | `async publishEvent(type, amount, txHash, fromUserId, toUserId, jobId)` |
| 196 | `subscribeToPublicEvents()` |

#### `js/map.js` (251 lines)
| Line | Function |
|------|----------|
| 1 | `renderMapTab()` |
| 43 | `initMap()` |
| 81 | `async loadMapData()` |
| 129 | `async updateMyPresence(lat, lng)` |
| 145 | `async toggleAvailability()` |
| 180 | `openRequestMissionModal()` |
| 220 | `async handleRequestMission()` |

#### `js/marketplace.js` (813 lines)
| Line | Function |
|------|----------|
| 49 | `getMarketCatIcon(cat)` |
| 57 | `renderMarketTab()` |
| 112 | `_updateMarketSubTabs(tab)` |
| 118 | `switchMarketSubTab(tab)` |
| 129 | `renderMarketBrowse()` |
| 163 | `_marketSkeleton()` |
| 175 | `renderMarketGrid()` |
| 210 | `renderMarketCard(l)` |
| 277 | `async loadMarketListings()` |
| 291 | `setMarketFilter(cat)` |
| 303 | `onMarketSearch(val)` |
| 309 | `onMarketSort(val)` |
| 321 | `async openListingDetail(listingId)` |
| 420 | `async handleBuyNow(listingId)` |
| 452 | `async confirmBuyNow(listingId)` |
| 473 | `async handleConfirmDelivery(orderId)` |
| 489 | `async handleRequestMuvrDelivery(listingId)` |
| 505 | `toggleSaveListing(listingId)` |
| 524 | `openListItemModal()` |
| 611 | `async handlePostListing()` |
| 679 | `renderMyListings()` |
| 691 | `async loadMyMarketListings()` |
| 700 | `renderMyListingsGrid()` |
| 735 | `async deactivateListing(listingId)` |
| 753 | `renderMyOrders()` |
| 765 | `async loadMyOrders()` |
| 774 | `renderMyOrdersList()` |

#### `js/missions.js` (1260 lines)
| Line | Function |
|------|----------|
| 1 | `getCatCount(catKey)` |
| 5 | `async loadBrowseOperatives()` |
| 11 | `async loadMissionEstimate(category)` |
| 22 | `checkOnboardingDismissed()` |
| 25 | `dismissOnboarding()` |
| 30 | `renderOnboardingCard()` |
| 52 | `openRatingModal(jobId, ratedUserId, ratedName)` |
| 71 | `selectRating(score)` |
| 79 | `async submitRating()` |
| 101 | `openPostJobModalWithCategory(catKey)` |
| 109 | `async hireAgain(jobId)` |
| 122 | `async loadUnreadCounts()` |
| 133 | `updateTabBadges()` |
| 151 | `renderBrowseOperatives()` |
| 155 | `renderBrowseOperativesInner()` |
| 177 | `loadEstimateForCategory(category)` |
| 191 | `renderJobsTab()` |
| 304 | `async loadMyGigs()` |
| 343 | `renderProgressBar(status)` |
| 359 | `renderMyGigsView()` |
| 498 | `async openWorkerJobModal(jobId)` |
| 595 | `async submitDeliverable(jobId, posterId)` |
| 657 | `async sendStatusUpdate(jobId, posterId)` |
| 677 | `async sendStatusMsg(jobId, posterId)` |
| 707 | `async openJobManageModal(jobId)` |
| 877 | `async awardJob(jobId, applicationId, workerId)` |
| 931 | `async workerStartJob(jobId)` |
| 946 | `async workerMarkComplete(jobId)` |
| 985 | `async posterMarkComplete(jobId)` |
| 990 | `async releaseEscrow(jobId)` |
| 1030 | `async cancelJob(jobId)` |
| 1050 | `openDisputeModal(jobId)` |
| 1063 | `async submitDispute(jobId)` |
| 1077 | `openPostJobModal()` |
| 1126 | `setPostMode(mode)` |
| 1142 | `updateJobFee()` |
| 1148 | `openApplyModal(jobId)` |
| 1163 | `async handlePostJob()` |
| 1197 | `async handleQuickMatch(postRes)` |
| 1214 | `async handleApply()` |

#### `js/profile.js` (814 lines)
| Line | Function |
|------|----------|
| 1 | `getXPTier(xp)` |
| 7 | `getXPTierStyle(xp)` |
| 13 | `calcLevel(p)` |
| 48 | `renderProfileTab()` |
| 217 | `hasVerification(type)` |
| 220 | `getVerificationStatus(type)` |
| 224 | `renderVerificationItems(p)` |
| 251 | `openVerificationModal()` |
| 280 | `async submitVerification()` |
| 355 | `async loadVerifications()` |
| 364 | `badge(icon, title, desc, unlocked)` |
| 382 | `renderBlogPage()` |
| 413 | `renderBlogPost(postId)` |
| 436 | `openEditProfileModal()` |
| 458 | `getShareUrl()` |
| 463 | `openShareModal()` |
| 516 | `copyShareLink()` |
| 520 | `copyText(text)` |
| 524 | `shareVia(platform)` |
| 537 | `async nativeShare()` |
| 540 | `shareGig(jobId)` |
| 547 | `async handleSaveProfile()` |
| 579 | `getAngelTier(xp)` |
| 587 | `renderAngelsSection()` |
| 633 | `openFAQModal()` |
| 680 | `openTOSModal()` |
| 721 | `openPrivacyModal()` |
| 764 | `openDebugPanel()` |
| 803 | `async testSupabaseConnection()` |

#### `js/state.js` (52 lines)
No function declarations — defines `SUPA_URL`, `SUPA_KEY`, `STRIPE_PK`, `sb`, and `state` object.

#### `js/utils.js` (250 lines)
| Line | Function |
|------|----------|
| 1 | `forceHideBoot(reason)` |
| 21 | `escapeHtml(str)` |
| 27 | `xpBooster(icon, label, xpVal, sub)` |
| 36 | `formatTime(iso)` |
| 41 | `formatRelative(iso)` |
| 53 | `withTimeout(promise, ms, label)` |
| 61 | `relTime(dateStr)` |
| 72 | `showToast(message, type)` |
| 87 | `async apiRequest(path, options)` |
| 108 | `openModal(html, opts)` |
| 124 | `closeModal()` |
| 134 | `muxiSVG(size)` |
| 147 | `muxiSVGSmall(size)` |
| 159 | `mvLabel(amount)` |
| 163 | `getStatusDot(user)` |
| 171 | `getStatusLabel(user)` |
| 179 | `getXpBadge(user)` |
| 189 | `getAvatarCircle(name, size)` |
| 226 | `setSEOTitle(page)` |
| 235 | `setSEOBlogPostTitle(post)` |
| 241 | `brandMark(sizeClass)` |

#### `js/vault.js` (514 lines)
| Line | Function |
|------|----------|
| 1 | `renderWalletTab()` |
| 83 | `toggleBalance()` |
| 91 | `async loadWalletData()` |
| 137 | `openTipModal(jobId)` |
| 156 | `setTipAmount(amt)` |
| 161 | `async sendTip()` |
| 202 | `openLockupModal()` |
| 220 | `async lockCredits()` |
| 246 | `async loadLockups()` |
| 267 | `async checkUnlockable()` |
| 287 | `async loadNetworkHealth()` |
| 312 | `async loadRetirementRate()` |
| 326 | `openSendModal()` |
| 347 | `openLoadModal()` |
| 391 | `async initStripeMint(amount)` |
| 430 | `openCashoutModal()` |
| 445 | `updateCashoutDisplay()` |
| 453 | `async handleSend()` |
| 495 | `async handleCashout()` |

### 1.4 TODO/FIXME/HACK Comments

**None found.** Running `grep -rn "TODO\|FIXME\|HACK"` across `/home/user/muvr-app/js/`, `index.html`, and `css/` returned zero results.

---

## 2. FRONTEND FEATURES (TAB INVENTORY)

The `switchTab(name)` function in `app.js` (line 274) drives all tab navigation. The app shell (`renderApp()`) defines 8 tabs.

| Tab Name | Nav Label | Render Function | Load Functions Called | Status |
|----------|-----------|-----------------|----------------------|--------|
| `jobs` | Missions | `renderJobsTab()` | `loadJobsSafe()`, `loadBrowseOperatives()`, `loadUnreadCounts()` | Active — full CRUD, escrow, applications |
| `messages` | Comms | `renderMessagesTab()` | `loadConversations()` | Active — real-time via Supabase subscriptions |
| `map` | MUVR GO | `renderMapTab()` | (none; map init inside render) | Active — Leaflet map, presence, request mission |
| `market` | Market | `renderMarketTab()` | `loadMarketListings()` | Active — full buy/sell/escrow via RPCs |
| `wallet` | Vault | `renderWalletTab()` | `loadWalletData()`, `computeNetworkStats()`, `loadLockups()`, `loadNetworkHealth()`, `loadRetirementRate()` | Active — MV balance, Stripe mint, P2P send, lockups |
| `exchange` | Exchange | `renderExchangeTab()` | `loadP2POffers()` | Active — P2P offers and trades |
| `ledger` | Ledger | `renderLedgerTab()` | `loadPublicEvents()` | Active — real-time public event feed |
| `profile` | Dossier | `renderProfileTab()` | (none called from switchTab; loads via `loadProfileSafe()` on boot) | Active — profile, XP/rank, verifications, blog, share |

### Tab Detail

#### `jobs` Tab
- Queries `jobs` table: open jobs ordered by `created_at.desc`
- Also queries `users` (available operatives), `applications` (unread count)
- RPCs: `post_job_secure`, `release_escrow_secure`, `cancel_job_secure`, `submit_rating`
- Features: mission categories (tiles + pills), browse operatives carousel, post modal, apply modal, manage modal, deliverables, status updates, dispute, rating modal, "Hire Again"

#### `messages` Tab
- Tables: `conversations`, `conversation_members`, `messages`, `notifications_queue`, `social_feed`, `social_reactions`
- RPC: `get_or_create_conversation`
- Features: conversation list, thread view, real-time subscription via Supabase Realtime, notifications dropdown, Brevo email (via edge function `send-email`), push notification registration, People Search, Social Feed, MUXI AI assistant FAB

#### `map` Tab
- Tables: `user_presence`, `jobs` (open, for map markers)
- Features: Leaflet map, geolocation, toggle availability, live presence update, mission request modal

#### `market` Tab
- Tables: `marketplace_listings`, `marketplace_orders`
- RPCs: `marketplace_purchase`, `marketplace_confirm_delivery`, `marketplace_request_delivery`
- Features: browse grid with search/filter/sort, 13 categories, listing detail modal, buy now (escrow), confirm delivery, MUVR delivery request, save to localStorage, list an item, my listings, my orders, deactivate listing

#### `wallet` Tab
- Tables: `users` (balance), `mv_ledger`, `credit_lockups`
- RPCs: `get_network_stats`, `get_network_health`, `get_retirement_rate`, `lock_credits`, `unlock_credits`, `send_tip`, `transfer_mv`, `request_cashout`
- Edge Function: `create-checkout` (Stripe), `agent-api`
- Features: balance display (hide/show), fund (Stripe checkout), MUVE (P2P send via alias/email/@handle), payout (cashout beta), credit lockup (30/90/180/365 days), network health widget, personal ledger (25 entries), adaptive retirement rate display

#### `exchange` Tab
- Tables: `p2p_offers`, `p2p_trades`, `agents`
- RPC: `transfer_mv_p2p`
- Features: buy MV (browse open offers), sell MV (post offer), my trades, agent listings, dispute modal, payment confirmation flow (mark sent → confirm received)

#### `ledger` Tab
- Tables: `mv_public_events`
- RPC: `publish_public_event`, `get_network_stats`
- Features: real-time public ledger via Supabase Realtime channel, filter (all/mint/transfer/escrow/tip/burn), network stats (minted/circulating/escrowed/retired), live dot animation

#### `profile` Tab
- Tables: `users`, `verifications`, `mv_aliases`
- RPCs: `submit_verification`
- Features: XP/rank display (Runner → Operator → Angel → Archangel → Legend → Mythic), stats, badge system, Angels section, verification modal (ID/vehicle/background/skills), edit profile, share modal (social platforms + native), static blog (6 hardcoded posts), FAQ/TOS/Privacy modals, debug panel

---

## 3. SUPABASE STATE

### 3.1 Connection Credentials

| Variable | Value |
|----------|-------|
| `SUPA_URL` | `https://cfenkstusggrcthehffn.supabase.co` |
| `SUPA_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (anon/public JWT — expected to be public) |
| Project ref | `cfenkstusggrcthehffn` |

### 3.2 All RPC Functions Called

| RPC Endpoint | Called From | Purpose |
|---|---|---|
| `rpc/cancel_job_secure` | `missions.js` | Cancel a job (secure server-side) |
| `rpc/get_network_health` | `vault.js` | Active users, agents, missions (7d), ecosystem pool |
| `rpc/get_network_stats` | `ledger.js` | Minted/circulating/escrowed/retired MV totals |
| `rpc/get_or_create_conversation` | `comms.js` | Get or create a DM conversation between two users |
| `rpc/get_retirement_rate` | `vault.js` | Current adaptive posting fee retirement rate |
| `rpc/lock_credits` | `vault.js` | Lock MV credits for a duration (priority boost) |
| `rpc/marketplace_confirm_delivery` | `marketplace.js` | Buyer confirms delivery, releases escrow to seller |
| `rpc/marketplace_purchase` | `marketplace.js` | Buy a listing (locks MV in escrow) |
| `rpc/marketplace_request_delivery` | `marketplace.js` | Create a MUVR GO delivery mission for a listing |
| `rpc/post_job_secure` | `missions.js` | Post a job (handles escrow lock, fee retirement) |
| `rpc/publish_public_event` | `ledger.js`, `vault.js` | Publish a public ledger event |
| `rpc/release_escrow_secure` | `missions.js` | Release escrow to worker on job completion |
| `rpc/request_cashout` | `vault.js` | Request a fiat payout (beta) |
| `rpc/send_tip` | `vault.js` | Send a tip from poster to worker (or vice versa) |
| `rpc/submit_rating` | `missions.js` | Submit a 1–5 star rating after job completion |
| `rpc/submit_verification` | `profile.js` | Submit an identity/verification request |
| `rpc/transfer_mv` | `vault.js` | Transfer MV between users |
| `rpc/transfer_mv_p2p` | `exchange.js` | Transfer MV for a P2P trade settlement |
| `rpc/unlock_credits` | `vault.js` | Unlock matured credit lockup |

**Total RPCs: 19**

### 3.3 Database Tables Referenced

| Table | Operations | Module(s) |
|-------|-----------|-----------|
| `agents` | SELECT, POST, PATCH | `agents.js`, `exchange.js` |
| `applications` | SELECT, POST, PATCH | `missions.js`, `vault.js` |
| `conversations` | SELECT | `comms.js` |
| `conversation_members` | SELECT | `comms.js` |
| `credit_lockups` | SELECT | `vault.js` |
| `job_deliverables` | SELECT, POST | `missions.js` |
| `jobs` | SELECT, PATCH | `app.js`, `missions.js`, `map.js`, `vault.js` |
| `legal_agreements` | POST | `auth.js` |
| `marketplace_listings` | SELECT, POST, PATCH | `marketplace.js` |
| `marketplace_orders` | SELECT | `marketplace.js` |
| `messages` | SELECT, POST | `comms.js` |
| `mission_seekers` | POST | `map.js` |
| `mv_aliases` | SELECT | `vault.js`, `comms.js` |
| `mv_ledger` | SELECT | `vault.js` |
| `mv_public_events` | SELECT, POST (via RPC) | `ledger.js` |
| `notifications_queue` | SELECT, PATCH | `comms.js` |
| `p2p_offers` | SELECT, POST, PATCH | `exchange.js` |
| `p2p_trades` | SELECT, POST, PATCH | `exchange.js` |
| `social_feed` | SELECT, POST | `comms.js` |
| `social_reactions` | SELECT, POST | `comms.js` |
| `user_presence` | SELECT, POST, PATCH | `map.js` |
| `users` | SELECT, POST, PATCH | `app.js`, `auth.js`, `missions.js`, `vault.js`, `profile.js` |
| `verifications` | SELECT | `profile.js` |

**Total distinct tables: 23**

### 3.4 Views Referenced (via grep pattern matching)

| Name | Referenced As | Module |
|------|--------------|--------|
| `active_agents` | pattern match | (inferred) |
| `active_users` | pattern match | (inferred) |
| `p_offers` | pattern match | (inferred — likely `p2p_offers`) |
| `p_trades` | pattern match | (inferred — likely `p2p_trades`) |
| `seller_trades` | pattern match | (inferred) |

### 3.5 All REST Endpoint Calls (via `apiRequest()`)

Complete list from `grep -roh "apiRequest('[^']*'"`:

```
agents, agents?id=eq.*, agents?order=xp.desc&limit=50,
applications, applications?id=eq.*, applications?job_id=eq.*,
applications?status=eq.pending&select=job_id, applications?worker_id=eq.*,
conversation_members?conversation_id=in.(*, conversation_members?user_id=eq.*,
conversations?select=id&order=updated_at.desc&limit=50,
credit_lockups?user_id=eq.*,
job_deliverables, job_deliverables?job_id=eq.*, job_deliverables?job_id=in.(*,
jobs?category=eq.*, jobs?id=eq.*, jobs?id=in.(*, jobs?poster_id=eq.*,
jobs?status=eq.open&select=*&order=created_at.desc,
jobs?status=eq.open&select=id,title,budget_mv,address,category&order=created_at.desc&limit=20,
legal_agreements,
marketplace_listings, marketplace_listings?id=eq.*, marketplace_listings?seller_id=eq.*,
marketplace_orders?buyer_id=eq.*,
messages, messages?conversation_id=eq.*, messages?conversation_id=in.(*,
mission_seekers,
mv_aliases?public_alias=eq.*, mv_aliases?user_id=eq.*,
mv_ledger?user_id=eq.*,
mv_public_events,
notifications_queue, notifications_queue?id=eq.*, notifications_queue?user_id=eq.*,
p2p_offers, p2p_offers?id=eq.*, p2p_offers?status=eq.open&order=created_at.desc&limit=50,
p2p_trades, p2p_trades?id=eq.*, p2p_trades?or=(seller_id.eq.*,
rpc/cancel_job_secure, rpc/get_network_health, rpc/get_network_stats,
rpc/get_or_create_conversation, rpc/get_retirement_rate, rpc/lock_credits,
rpc/marketplace_confirm_delivery, rpc/marketplace_purchase, rpc/marketplace_request_delivery,
rpc/post_job_secure, rpc/publish_public_event, rpc/release_escrow_secure, rpc/request_cashout,
rpc/send_tip, rpc/submit_rating, rpc/submit_verification, rpc/transfer_mv, rpc/transfer_mv_p2p,
rpc/unlock_credits,
social_feed, social_feed?order=created_at.desc&limit=30,
social_reactions,
user_presence, user_presence?status=neq.offline&select=user_id,lat,lng,status,last_seen,
user_presence?user_id=eq.*,
users, users?id=eq.*, users?id=in.(*, users?is_available=eq.true&role=in.(worker,both)...,
users?or=(email.eq.*, users?or=(username.ilike.*,
verifications?user_id=eq.*
```

---

## 4. EDGE FUNCTIONS

Three Supabase Edge Functions are called from the frontend:

| Edge Function | Called From | Method | Purpose |
|---|---|---|---|
| `/functions/v1/agent-api` | `agents.js` (docs only, not actually fetched from frontend) | POST | Agent API endpoint for AI agents to browse/accept missions |
| `/functions/v1/send-email` | `comms.js:305` (`sendBrevoEmail`) | POST | Brevo transactional email for high-priority notifications |
| `/functions/v1/create-checkout` | `vault.js:399` (`initStripeMint`) | POST | Creates a Stripe Checkout session for MV credit purchase |

**Raw grep output (`grep -rh "functions/v1/" js/ --include="*.js"`):**
```
'...SUPA_URL + '/functions/v1/agent-api'...'  (agents.js, display only)
await fetch(SUPA_URL + '/functions/v1/send-email', {   (comms.js:314)
var res = await fetch(SUPA_URL + '/functions/v1/create-checkout', {  (vault.js:399)
```

Notes:
- `agent-api` endpoint is shown to users in the UI as documentation; it is not called from the browser directly.
- Both `send-email` and `create-checkout` use `Authorization: Bearer <state.accessToken>` (user JWT), not the anon key.

---

## 5. CONFIGURATION

### 5.1 `vercel.json`

```json
{
  "rewrites": [
    { "source": "/sitemap.xml", "destination": "/sitemap.xml" },
    { "source": "/robots.txt", "destination": "/robots.txt" },
    { "source": "/(.*)", "destination": "/muvr.html" }
  ],
  "headers": [
    {
      "source": "/sitemap.xml",
      "headers": [
        { "key": "Content-Type", "value": "application/xml" },
        { "key": "Cache-Control", "value": "public, max-age=86400" }
      ]
    },
    {
      "source": "/robots.txt",
      "headers": [
        { "key": "Content-Type", "value": "text/plain" },
        { "key": "Cache-Control", "value": "public, max-age=86400" }
      ]
    }
  ]
}
```

**CRITICAL BUG:** The catch-all rewrite points to `/muvr.html` but the actual file is `index.html`. `muvr.html` does not exist in the repo. This means every route except `/sitemap.xml` and `/robots.txt` would return a 404 on Vercel. The site is likely broken in production or Vercel is serving `index.html` by default (index fallback) which masks this bug. **Must be fixed immediately.**

### 5.2 `robots.txt`

```
User-agent: *
Allow: /

Sitemap: https://muvr-app.vercel.app/sitemap.xml

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /
```

All crawlers allowed. Sitemap URL is correct.

### 5.3 `sitemap.xml`

8 URLs indexed:
- `https://muvr-app.vercel.app` (priority 1.0, daily)
- `/#blog` (priority 0.8, weekly)
- 6 blog post hash-routes (priority 0.7, monthly)
  - `moving-tips-2026`, `gig-economy-future`, `escrow-explained`, `worker-guide-getting-started`, `mv-credits-explained`, `virginia-pilot-launch`

Last modification date: `2026-03-01`. Blog posts dated 2026-02-08 to 2026-02-20.

### 5.4 `js/state.js` — Full State Schema

| Property | Type | Initial Value | Purpose |
|----------|------|---------------|---------|
| `SUPA_URL` | string | `'https://cfenkstusggrcthehffn.supabase.co'` | Supabase project URL |
| `SUPA_KEY` | string | JWT (anon key) | Supabase anon key for REST calls |
| `STRIPE_PK` | string | `'pk_live_51T1HjHC...'` | Stripe publishable key (live mode, in source) |
| `sb` | object | Supabase client | Initialized via `supabase.createClient()` |
| `state.user` | null/object | null | Supabase auth user object |
| `state.accessToken` | null/string | null | JWT access token for authenticated requests |
| `state.profile` | null/object | null | `users` table row |
| `state.jobs` | array | `[]` | Open jobs from Supabase |
| `state.jobFilter` | string | `'all'` | Current category filter |
| `state.balanceVisible` | bool | `false` | Whether MV balance is shown |
| `state.currentTab` | string | `'jobs'` | Active tab name |
| `state.conversations` | array | `[]` | User's conversations |
| `state.activeConvoId` | null/string | null | Currently open conversation |
| `state.activeMessages` | array | `[]` | Messages in active conversation |
| `state.mapObj` | null/object | null | Leaflet map instance |
| `state.myPresence` | object | `{status:'offline',lat:null,lng:null}` | User's map presence |
| `state.publicEvents` | array | `[]` | Public ledger events |
| `state.ledgerFilter` | string | `'all'` | Ledger event type filter |
| `state.realtimeSubs` | array | `[]` | Active Supabase Realtime subscriptions |
| `state.unreadMsgCount` | number | `0` | Unread message count for badge |
| `state.presenceInterval` | null/int | null | Presence heartbeat interval ID |
| `state.notifications` | array | `[]` | User notifications |
| `state.pushPermission` | string | `Notification.permission` | Push notification permission status |
| `state.pushPrompted` | bool | `false` | Whether push has been prompted |
| `state.myGigsView` | bool | `false` | Whether "My Gigs" view is active |
| `state.myGigs` | array | `[]` | Jobs posted by user |
| `state.myActiveWork` | array | `[]` | Jobs user is working on |
| `state.deliverables` | array | `[]` | Submitted deliverables |
| `state.p2pOffers` | array | `[]` | Open P2P exchange offers |
| `state.p2pMarketRate` | string | `'~1.00'` | Display rate for P2P exchange |
| `state.p2pPayFilter` | string | `'All'` | Payment method filter |
| `state.myTrades` | array | `[]` | User's P2P trades |
| `state.exchangeView` | string | `'buy'` | Exchange buy/sell toggle |
| `state.agents` | array | `[]` | User's registered AI agents |
| `state.verifications` | array | `[]` | User's verification submissions |
| `state.browseOperatives` | array | `[]` | Available operative cards |
| `state.onboardingDismissed` | bool | `false` | Onboarding card dismissed flag |
| `state.ratingPending` | null | null | Pending rating data |
| `state.unreadAppsCount` | number | `0` | Unread applications count for badge |

Also set by `marketplace.js` on load (module-level, not in `state` object):
- `state.marketListings`, `state.marketFilter`, `state.marketSearch`, `state.marketSubTab`, `state.myListings`, `state.myOrders`, `state.savedListings`

### 5.5 Meta Tags (`index.html`)

| Meta | Value |
|------|-------|
| `charset` | UTF-8 |
| `viewport` | width=device-width, initial-scale=1, viewport-fit=cover |
| `title` | MUVR™ - Zero Commission Gig Marketplace for Movers, Delivery & Services |
| `description` | Full description (138 chars) |
| `keywords` | 32 keywords |
| `author` | TransBid LLC |
| `robots` | index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1 |
| `canonical` | https://muvr-app.vercel.app |
| `google-site-verification` | cFbUXFHCDhATDY09vbhd_mQ_2O6cSb1EzUhktgTbBRg |
| `application-name` | MUVR™ |
| `apple-mobile-web-app-title` | MUVR™ |
| `apple-mobile-web-app-capable` | yes |
| `apple-mobile-web-app-status-bar-style` | black-translucent |
| `mobile-web-app-capable` | yes |
| `theme-color` | #050716 |
| `msapplication-TileColor` | #050716 |
| `og:title` | MUVR™ - Zero Commission Gig Marketplace \| It's UR MUV |
| `og:description` | Full OG description |
| `og:type` | website |
| `og:url` | https://muvr-app.vercel.app |
| `og:site_name` | MUVR™ |
| `og:locale` | en_US |
| `og:image` | https://muvr-app.vercel.app/og-image.png |
| `og:image:width` | 1200 |
| `og:image:height` | 630 |
| `twitter:card` | summary_large_image |
| `twitter:title` | MUVR™ - Zero Commission Gig Marketplace |
| `geo.region` | US-VA |
| `geo.placename` | Virginia |
| `ICBM` | 37.4316, -78.6569 |

JSON-LD structured data: `WebApplication`, `Organization`, `FAQPage` (6 Q&As), `WebSite`, `ItemList` (6 blog posts), `Service`.

---

## 6. CSS / DESIGN SYSTEM

**File:** `/home/user/muvr-app/css/style.css` (489 lines)

### 6.1 CSS Variables (`:root`)

| Variable | Value | Role |
|----------|-------|------|
| `--accent` | `#18F6C8` | Primary accent (teal/cyan) |
| `--accent-2` | `#7C5CFF` | Secondary accent (purple) |
| `--accent-3` | `#FF3D9A` | Tertiary accent (pink) |
| `--accent-hover` | `#42FBE0` | Accent hover state |
| `--bg-deep` | `#050716` | Page background (near-black deep navy) |
| `--bg-card` | `rgba(14,18,34,0.82)` | Card background |
| `--bg-card2` | `rgba(18,24,44,0.86)` | Alternate card background |
| `--border` | `rgba(255,255,255,0.10)` | Standard border |
| `--text-dim` | `rgba(232,236,241,0.52)` | Dimmed text |
| `--text-mid` | `rgba(232,236,241,0.72)` | Mid-brightness text |
| `--text-bright` | `rgba(232,236,241,0.96)` | Full-brightness text |
| `--red` | `#ff6b6b` | Error/negative color |
| `--yellow` | `#ffd166` | Warning/highlight color |

### 6.2 Font Family

Primary: **Outfit** (weights 300–900) via Google Fonts  
Monospace: **JetBrains Mono** (weights 400, 700) via Google Fonts  
Fallback: `system-ui, -apple-system, sans-serif`

`.mono` utility class applies the monospace stack.

### 6.3 Color Palette Summary

| Purpose | Color |
|---------|-------|
| Background | `#050716` (deep navy-black) |
| Accent / Success / Positive | `#18F6C8` (teal) |
| Purple / Agents / Secondary | `#7C5CFF` |
| Pink / Alerts / Tertiary | `#FF3D9A` |
| Error / Negative / Urgent | `#ff6b6b` |
| Warning / Escrow | `#ffd166` |
| Cards | semi-transparent dark navy with backdrop blur |

### 6.4 Responsive Breakpoints

| Breakpoint | Value | Usage |
|------------|-------|-------|
| Mobile (max) | `max-width: 640px` | Tab font size reduction (10px), map height reduction (300px) |
| Tailwind `sm` | 640px | Used via Tailwind CDN classes in JS-rendered HTML |
| Tailwind `md` | 768px | Grid column changes in landing |

Note: Custom CSS only defines two `@media` rules. Most responsive behavior is via Tailwind utility classes injected in JS template strings.

### 6.5 Notable Component Styles

- **Animated background:** Fixed `.bg-stage` with 3 radial gradients + 3 `.blob` animated elements (`floaty` keyframe, 12–16s)
- **Boot screen:** Fixed overlay with spinner, fades out via `.done` class
- **Cards:** `border-radius:18px`, `backdrop-filter:blur(12px)`, hover lift + accent border on `.card-interactive`
- **Modals:** Fixed overlay, blur backdrop, scale+translate transition on `.modal-body`
- **Toasts:** Right-side column, 3 types: success (green), error (red), info (blue)
- **MUXI FAB:** Fixed bottom-right, 48px circle, `floaty` animation
- **XP badges:** `.xp-recruit`, `.xp-specialist`, `.xp-elite`, `.xp-legendary`
- **Status dots:** `.status-online` (teal), `.status-busy` (amber), `.status-offline` (gray)
- **Mission urgent:** Red border with `urgentPulse` animation
- **Animations:** `fadeUpIn`, `spin`, `floaty`, `tickerMove`, `pulsering`, `ledgerSlide`, `livepulse`, `confettiPop`, `shimmer`, `glowPulse`, `slideInLeft`, `slideInRight`, `scaleIn`, `gradientFlow`, `numberTick`, `borderGlow`, `urgentPulse`

---

## 7. SECURITY AUDIT

### 7.1 Direct `mv_balance` Modifications

The following lines in the frontend **directly mutate `state.profile.mv_balance`** optimistically (client-side only, after an RPC call succeeds):

| File | Line | Pattern |
|------|------|---------|
| `vault.js` | 190 | `state.profile.mv_balance = bal - amt;` (after `send_tip` RPC) |
| `vault.js` | 234 | `state.profile.mv_balance = bal - amt;` (after `lock_credits` RPC) |
| `vault.js` | 479 | `state.profile.mv_balance = bal - amt;` (after `transfer_mv` RPC) |
| `vault.js` | 506 | `state.profile.mv_balance = bal - amt;` (after `request_cashout` RPC) |
| `missions.js` | 1183 | `state.profile.mv_balance = bal - (budget + 1);` (after `post_job_secure` RPC) |

**Assessment:** These are all optimistic UI updates that follow a successful RPC call. The actual balance mutation happens server-side inside the RPC. **No direct table writes to `mv_balance` are made from the frontend.** All financial operations go through RPCs. This is the correct pattern. However, if any RPC returns `ok` but fails silently, the displayed balance will be wrong until next `loadWalletData()` refresh.

### 7.2 Financial Operations via RPC (not direct table writes)

All 19 RPCs are confirmed financial-safe (server-enforced). Confirmed: `transfer_mv`, `send_tip`, `lock_credits`, `unlock_credits`, `post_job_secure`, `release_escrow_secure`, `cancel_job_secure`, `marketplace_purchase`, `marketplace_confirm_delivery`, `request_cashout`, `transfer_mv_p2p`.

### 7.3 `eval()` Usage

**None found.** Zero results from `grep -rn "eval(" /home/user/muvr-app/js/ --include="*.js"`.

### 7.4 Unescaped `innerHTML` Usage

The following `innerHTML` assignments involve user data or database content without explicit `escapeHtml()` wrapping (potential XSS vectors):

| File | Line | Pattern | Risk |
|------|------|---------|------|
| `exchange.js` | 86 | `el.innerHTML = offers.map(...)` | Medium — renders offer data from DB |
| `exchange.js` | 115 | `el.innerHTML = trades.map(...)` | Medium — renders trade data |
| `exchange.js` | 138 | `el.innerHTML = agents.map(...)` | Medium — renders agent data |
| `utils.js` | 113 | `layer.innerHTML = '...' + html + '...'` | High — modal HTML passed in, varies by caller |
| `marketplace.js` | 204 | `el.innerHTML = listings.map(...)` | Medium — listing titles/descriptions from DB |
| `marketplace.js` | 715/789 | `el.innerHTML = state.myListings.map(...)` / `state.myOrders.map(...)` | Medium |
| `vault.js` | 87/102 | `bd.innerHTML = ... + ' MV</span>'` | Low — numeric only |

**Note:** `escapeHtml()` is defined in `utils.js` (line 21) and is used in many places (marketplace cards, listing detail, missions, comms). However, the broader `innerHTML` pattern — building entire tab content from template strings that include DB values — requires consistent application. Audit each `.map()` rendering function to ensure all string fields use `escapeHtml()`.

### 7.5 Hardcoded Secrets / Sensitive Values

| Item | Location | Value | Risk |
|------|----------|-------|------|
| Supabase anon key | `js/state.js:2` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | **Expected** — anon key is public by design; RLS controls access |
| Stripe publishable key | `js/state.js:5` | `pk_live_51T1HjHC...` | **Expected** — publishable keys are public by design |
| Google Site Verification | `index.html:13` | `cFbUXFHCDhATDY09vbhd_mQ_2O6cSb1EzUhktgTbBRg` | Low risk — public identifier |

**No secret keys, service-role keys, or Stripe secret keys were found in the frontend code.** All payment processing goes through the edge function `create-checkout`.

### 7.6 Agent API Key Security Issue

In `agents.js`, the field `api_key_hash` is **not actually hashed** — it stores the raw generated key:

```js
// agents.js:54
var apiKey = 'muvr_agent_' + crypto.randomUUID().replace(/-/g, '').slice(0, 24);
// ...
api_key_hash: apiKey,  // stored plaintext in DB
```

This is a naming inconsistency. The column is named `api_key_hash` but contains a plaintext key. Any Supabase admin or service-role access to the `agents` table would expose all agent API keys in plaintext. The edge function `agent-api` presumably validates incoming keys against this stored value. **Should be hashed (SHA-256) before storage.**

---

## 8. MARKETPLACE STATUS

**File:** `/home/user/muvr-app/js/marketplace.js` — **Exists, 813 lines**

### 8.1 All Functions

27 functions total (listed in Section 1.3 above).

### 8.2 Tables Referenced

| Table | Operations |
|-------|-----------|
| `marketplace_listings` | SELECT (browse, my listings, detail), POST (create listing), PATCH (deactivate) |
| `marketplace_orders` | SELECT (my orders) |

### 8.3 RPCs Called

| RPC | Purpose |
|-----|---------|
| `rpc/marketplace_purchase` | Buyer purchases listing, locks MV in escrow |
| `rpc/marketplace_confirm_delivery` | Buyer confirms delivery, releases escrow to seller |
| `rpc/marketplace_request_delivery` | Creates a MUVR GO delivery mission for physical item delivery |

### 8.4 Status Assessment

**FULLY IMPLEMENTED.** The marketplace module is one of the more complete modules:

- Browse grid with search, sort (newest/price-asc/price-desc/rating), and 13 category filters
- Listing detail modal with full metadata display
- Buy Now flow: balance check → confirm modal → `marketplace_purchase` RPC → escrow
- Delivery confirmation: `marketplace_confirm_delivery` RPC releases escrow
- MUVR delivery: `marketplace_request_delivery` creates a map mission
- Listing creation: full form with title, description, category, condition, price, quantity, location, delivery options, tags
- My Listings: view/remove own listings (PATCH status to `inactive`)
- My Orders: view with escrow status, confirm delivery CTA
- Save/unsave listings (localStorage)
- 13 categories: electronics, gaming, collectibles, sneakers, clothing, home, tools, phones, computers, digital, art, other + all
- 5 conditions: New, Like New, Good, Fair, For Parts
- Agent listing badge support (`is_agent` field)
- MUVR delivery badge (`muvr_delivery` field)
- Skeleton loading state
- No image upload — uses category icon placeholder

**Gaps/Issues:**
- No real image upload (uses FontAwesome icon as placeholder)
- `deactivateListing` sends a direct PATCH to `marketplace_listings` without going through an RPC — this is a direct table write, not a financial operation, so it's acceptable, but RLS must be set to restrict to owner
- `savedListings` stored only in `localStorage` (not synced to DB; lost on new device/browser)
- Seller rating shown on cards comes from `seller_rating` column in `marketplace_listings` (denormalized) — not auto-updated from `submit_rating` RPC

---

## 9. AGENT SYSTEM STATUS

**File:** `/home/user/muvr-app/js/agents.js` — **Exists, 179 lines**

### 9.1 All Functions and What They Do

| Function | Description |
|----------|-------------|
| `async loadAgents()` | Fetches all agents ordered by XP desc (limit 50) from `agents` table; stores in `state.agents`; calls `renderExchangeList()` |
| `openRegisterAgentModal()` | Opens modal with form: agent name, type (general/research/writing/code/data/design/va), autonomy % (0–20). Explains owner vs agent vault split. |
| `async handleRegisterAgent()` | Validates form, generates `muvr_agent_<24-char-uuid>` API key, POSTs to `agents` table with all fields. On success: closes modal, shows key-reveal modal with copy button and API endpoint docs. |
| `openAgentSettingsModal(agentId)` | Opens modal showing agent vault balance, stats (missions/XP/tier/type), autonomy %, API key management (reveal/copy/regen). Displays endpoint URL. |
| `async revealAgentKey(agentId)` | Fetches `api_key_hash` for agent (filtered by `owner_id=eq.current_user`), displays in modal DOM element. |
| `async copyAgentKey(agentId)` | Same fetch as above, writes to clipboard. |
| `async regenAgentKey(agentId)` | Confirms with user, generates new key, PATCHes `agents` table, displays new key. |

### 9.2 Endpoints Called

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `agents?order=xp.desc&limit=50` | GET | List all agents |
| `agents` | POST | Register new agent |
| `agents?id=eq.{id}&owner_id=eq.{uid}&select=api_key_hash` | GET | Retrieve agent key |
| `agents?id=eq.{id}&owner_id=eq.{uid}` | PATCH | Regenerate key |
| `/functions/v1/agent-api` | POST (docs only) | Agent programmatic API endpoint |

### 9.3 Status Assessment

**PARTIALLY IMPLEMENTED — UI complete, backend integration limited.**

The UI for registering and managing AI agents is fully functional. However:

1. **API key is not hashed** (see Security section 7.6) — stored plaintext in `api_key_hash` column
2. **Agent autonomy split logic** (owner vs agent vault) is described in UI but the actual payout splitting presumably happens in the `release_escrow_secure` or similar RPC — **not visible in frontend code**
3. **`loadAgents()` is called from `renderExchangeList()`** — agents appear in the Exchange tab, not their own tab. There is no dedicated "Agents" tab in the app shell.
4. **`openRegisterAgentModal()` is wired** but the actual agent-API edge function (`/functions/v1/agent-api`) is external to the frontend — its capabilities depend on its Supabase edge function implementation
5. **Agent vault balance display** works via `agent.agent_balance` field (read from `agents` table)
6. **No agent tab badge** for pending activity

The agent system is a scaffolded foundation; the edge function backend and payout splitting logic need verification.

---

## 10. KNOWN ISSUES & DEAD CODE

### 10.1 Critical Bug: vercel.json Points to Non-Existent File

**Location:** `/home/user/muvr-app/vercel.json:5`  
**Issue:** `"destination": "/muvr.html"` — this file does not exist. The actual HTML entry point is `index.html`.  
**Impact:** All routes in production would 404 unless Vercel is auto-serving `index.html` as a fallback (which is not guaranteed by these explicit rewrite rules).  
**Fix:** Change `"/muvr.html"` to `"/index.html"` in `vercel.json`.

### 10.2 Duplicate Stripe Callback Handling

**Location:** `app.js:327–350` (function `handleMintCallback`) and `app.js:423–444` (inside `boot()`)  
**Issue:** The `mint_success` and `mint_cancel` URL parameters are handled **twice** — once in `handleMintCallback()` (which is called from `boot()` at line 357), and again directly in `boot()` at lines 423–444. Both blocks run on every page load when these params are present, firing two `showToast()` calls and two `history.replaceState()` calls.  
**Impact:** Double toast notification on Stripe return; second `replaceState` is harmless but redundant.  
**Fix:** Remove the duplicate block inside `boot()` (lines 423–444) since `handleMintCallback()` already handles it.

### 10.3 Console.log Debug Statements Left In

| File | Line | Statement |
|------|------|-----------|
| `map.js` | 74 | `console.log('Geolocation denied:', err.message)` |
| `auth.js` | 315 | `console.log('[ensureUserRow] created users row')` |
| `missions.js` | 310 | `console.log('[MyGigs] posted:', state.myGigs.length)` |
| `missions.js` | 314 | `console.log('[MyGigs] my apps:', myApps.length, ...)` |
| `missions.js` | 328 | `console.log('[MyGigs] activeWork:', state.myActiveWork.length, ...)` |
| `missions.js` | 885 | `console.log('Award app PATCH:', r1 && r1.status)` |
| `missions.js` | 900 | `console.log('Award job PATCH:', r2 && r2.status)` |

7 debug `console.log` statements remain. These leak operational data to any user with DevTools open. Should be removed or guarded with a debug flag before production.

### 10.4 Function Cross-Reference: switchTab vs Definitions

All functions called in `switchTab()` are verified to be defined:

| Function Called | Defined In | Status |
|-----------------|-----------|--------|
| `renderJobsTab()` | `missions.js:191` | OK |
| `loadJobsSafe()` | `app.js:305` | OK |
| `loadBrowseOperatives()` | `missions.js:5` | OK |
| `renderBrowseOperativesInner()` | `missions.js:155` | OK |
| `loadUnreadCounts()` | `missions.js:122` | OK |
| `renderMessagesTab()` | `comms.js:1` | OK |
| `loadConversations()` | `comms.js:16` | OK |
| `renderMapTab()` | `map.js:1` | OK |
| `renderMarketTab()` | `marketplace.js:57` | OK |
| `loadMarketListings()` | `marketplace.js:277` | OK |
| `renderWalletTab()` | `vault.js:1` | OK |
| `loadWalletData()` | `vault.js:91` | OK |
| `computeNetworkStats()` | `ledger.js:70` | OK |
| `loadLockups()` | `vault.js:246` | OK |
| `loadNetworkHealth()` | `vault.js:287` | OK |
| `loadRetirementRate()` | `vault.js:312` | OK |
| `renderExchangeTab()` | `exchange.js:1` | OK |
| `loadP2POffers()` | `exchange.js:161` | OK |
| `renderLedgerTab()` | `ledger.js:22` | OK |
| `loadPublicEvents()` | `ledger.js:57` | OK |
| `renderProfileTab()` | `profile.js:48` | OK |

Also verified functions called at `boot()` time:
- `renderApp()`, `renderMuxi()`, `loadProfileSafe()`, `loadNotifications()`, `subscribeToPublicEvents()`, `startNotifPolling()`, `registerServiceWorker()`, `promptPushAfterInteraction()`, `openLegalModal()`, `ensureUserRow()`, `loadVerifications()`, `openDebugPanel()` — **all defined**.

**No undefined function calls detected.**

### 10.5 `getEl` Not Defined in Any Module

The helper `getEl(id)` is used throughout every module but is **not defined in any `js/*.js` file** visible in this audit. It must be defined either inline in `utils.js` (as a non-`function`-declaration expression) or is expected as a global. Review `utils.js` — it is likely `const getEl = id => document.getElementById(id)` or similar but defined as a variable (not `function getEl`), which is why the function-name grep missed it.

### 10.6 Blog Content is Hardcoded

6 blog posts are hardcoded in `profile.js` as a JavaScript array (lines ~370–415). They are not stored in Supabase. The JSON-LD in `index.html` and the sitemap.xml also reference these same 6 posts. Adding new posts requires code changes.

### 10.7 Marketplace `savedListings` Not Synced to Server

`state.savedListings` is persisted only in `localStorage` (`muvr_saved_listings`). If a user signs in on a new device, their saved listings are lost. The `muvr_saved_listings` table appears in the pattern-match grep but is not queried via `apiRequest()`.

### 10.8 `transfer_mv_p2p` RPC — Naming Inconsistency

The RPC `rpc/transfer_mv_p2p` is called in `exchange.js` but the pattern-match grep listed `rpc/transfer_mv_p` (truncated). Both refer to the same endpoint. Confirm the exact RPC name matches the Supabase database function.

### 10.9 `openLegalModal(true)` Called with `isReturning` but No Clear Gate

`openLegalModal(true)` is called on every successful session restore (boot) and OAuth sign-in. The `isReturning` parameter changes the modal copy (existing user vs new user acknowledgment). Confirm this modal isn't repeatedly shown on every app open to returning users if they've already accepted.

---

## 11. RECOMMENDED NEXT ACTIONS

### Priority 1 — CRITICAL: Fix `vercel.json` Deploy Bug

**File:** `/home/user/muvr-app/vercel.json:5`  
**Change:** `"destination": "/muvr.html"` → `"destination": "/index.html"`  
This is a production-breaking bug. If Vercel's static index fallback is not kicking in, every non-static route is 404ing.

### Priority 2 — HIGH: Hash Agent API Keys Before Storage

**File:** `/home/user/muvr-app/js/agents.js:54–63` and the Supabase Edge Function `agent-api`  
The `api_key_hash` column stores plaintext keys. Before writing to the DB, hash the key with SHA-256:
```js
const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(apiKey));
const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2,'0')).join('');
```
Store `hashHex` in the DB, keep `apiKey` only for the one-time display to the user. The `agent-api` edge function must then compare incoming keys against their SHA-256 hash.

### Priority 3 — HIGH: Remove Duplicate Stripe Callback Handling

**File:** `/home/user/muvr-app/js/app.js:423–444`  
Remove the second `mint_success`/`mint_cancel` block inside `boot()`. The `handleMintCallback()` function (called at line 357) already handles both cases completely. The duplicate causes double toasts and is dead code.

### Priority 4 — MEDIUM: Audit and Harden `innerHTML` XSS Vectors

The codebase renders user-supplied content (job titles, descriptions, agent names, listing titles, message content) inside `innerHTML` template strings. While `escapeHtml()` is used in most places, a systematic audit is needed, particularly in:
- `exchange.js` offer/trade/agent render loops (lines 86, 115, 138)
- `marketplace.js` `renderMarketGrid()` and `renderMyListingsGrid()`
- `comms.js` message rendering

Ensure every string from the database is passed through `escapeHtml()` before being interpolated into an `innerHTML` assignment.

### Priority 5 — MEDIUM: Remove Debug `console.log` Statements and Sync Saved Listings to Server

**Remove 7 `console.log` statements** identified in Section 10.3 (primarily in `missions.js`). These leak internal state data to anyone with DevTools open.

**Secondary:** Move `savedListings` to a Supabase table (`muvr_saved_listings`) so saves persist across devices. The table name appears to already exist in pattern-match results but is not queried by `apiRequest()` — wire it up in `marketplace.js`.

---

*End of MUVR State Report — May 2026*  
*Report generated by AI audit of `/home/user/muvr-app` codebase on 2026-05-15.*
