// PartsLister Pro server — v389
// v389: yard tickets are now sold tickets — each one prints the REAL date and time it was sold, its own
//       ticket number and a barcode of that number ({barcode}). "Sell for tomorrow" makes an advance ticket
//       marked VALID FOR tomorrow's date (it still shows when it was really sold). {logo} puts the logo on
//       any line, {big} makes a line large. The saved time and Randomize are gone. Home shows money made.
//       Also fixed: ticket_settings was changed before it was created (broke setup on a new database).
// v302: dashboard.html is the homepage (/). The listing tool moved to /list.
// v305: eBay sales connection — real sold orders on the dashboard.
// v306: asks eBay for two more permissions — fees/payouts and seller metrics.
// v307: imports eBay fees — total fees and penalty fees on the dashboard.
// v308: fee check — itemized fees for exact dates, to compare with eBay's reports.
// v309: sales tax per order, for the dashboard's sales-tax toggle.
// v312: refunds subtracted the way eBay does (partial refunds too) + orders download.
// v313: refunds also read per item, in case eBay lists one only there +
//       Admin "Look up one order" to see exactly what eBay sends for an order.
// v314: refunds take the sales tax back off too, like eBay (checked against
//       892 orders: matches eBay's All orders report within 1 cent).
// v315: remembers the new dashboard ranges (this/last month, a month, custom dates).
// v316: new Home page (/) and Listings page (/listings); the sales dashboard moved to /sales.
//       Active listing count + value from eBay (Trading API GetMyeBaySelling), cached an hour.
// v318: the active-listings page is now Active (/active, active.html); the Listings tab opens the Listing Tool (/list).
// v319: Orders page (/orders) — your sold items. Saves each order's items (title, SKU,
//       quantity, price) and shipping status. No buyer names or addresses are saved.
// v320: item photos and full listing details (photos, description, item specifics) for the
//       Orders page, from eBay's Trading API GetItem. Saved once per item, so eBay is asked once.
// v321: Messages page — your eBay messages (Trading API GetMyMessages), read them, reply
//       (AddMemberMessageRTQ). Messages are read live from eBay and never saved here.
// v322: message THREADS (eBay Message API, commerce/message/v1) and offers: answer a buyer's
//       Best Offer (accept / counter / decline) and send an offer to everyone interested in an
//       item (Negotiation API). Two new eBay permissions — Reconnect eBay once to approve them.
// v323: delete / restore conversations + a Trash list; AI-drafted replies that read the
//       conversation and the listing (uses the Anthropic key saved in your Listing Tool settings).
// v324: Returns page — returns, "item not received" claims and cases (eBay Post-Order API):
//       approve / decline / partial refund / refund a return; add tracking or refund a claim.
// v325: keep eBay's own link for each return action, so "Open on eBay" lands on that return
//       at whatever stage it's in (eBay picks the right page).
// v326: Sales download (one row per order for any date range) + account keys (Anthropic,
//       eBay, Cloudinary, SerpApi) are edited in the main Settings now, not the Listing Tool.
//       The Listing Tool can no longer overwrite them when it saves.
// v327: Diagnostics page (/diagnostics, admin) — file versions, connections, live checks of
//       every eBay / AI / photo service, recent errors in plain English, and what to do.
// v328: every Diagnostics check now really tests the service (no "a key is saved, so OK"):
//       the Listing Tool's eBay token is tried with eBay exactly the way Launch uses it, the eBay
//       sign-in is refreshed fresh, the AI key sends a 1-word test, offers + claims are tested too.
// v329: "Can you ship to my country?" — checks a listing for a country two ways (eBay's shopper
//       view for that country + your listing's ship-to / excluded lists) and gives the answer to
//       the AI draft. Also a Ships-to check box in Messages.
// v330: Settings → Messages (your AI reply instructions + Use default, how to answer problems,
//       auto-translate). AI drafts now get the real sale date, the listing's return policy and the
//       days left — worked out here, not guessed by the AI. Buyer messages auto-translate to English.
// v331: a separate reply choice for each problem type (didn't arrive / damaged / defective / wrong
//       part), and an optional discount: when a buyer asks for a lower price, the draft offers your
//       % off and the app can send that offer when you press Send.
// v332: AI drafts know whether the listing HAS a part number (and write it out for the buyer to
//       compare; if there's none, they don't ask the buyer to compare). Drafts also get the
//       tracking number, carrier, shipped date, eBay's expected delivery date and the delivered
//       date (Trading GetOrders) — and the return window now counts from the delivery date.
//       Buyer asks which vehicle the part came from and the listing doesn't say → it says so.
// v333: Settings → Messages → Fitment questions: "Also ask for the buyer's VIN" (off by default —
//       no VIN checking yet). Off: the draft never asks for a VIN; it asks the buyer to compare
//       the listing's part number, or, with no part number, to compare their original part with
//       the listing photos. Drafts answer the question directly (no condition filler).
// v334: whenever a draft offers a return or asks the buyer to open one, it says how many days
//       they have left and the last day (the app works out the date; the AI never does).
// v335: "Didn't arrive" drafts always give the carrier + tracking number and never send the buyer
//       to open a case first. New Messages settings: delivered-but-missing (check around first /
//       open a request now), modules (ask if it was programmed first), tone (friendly / short),
//       and your sign-off (added by the app, word for word). Drafts must answer every question
//       the buyer asks or say the seller doesn't have that information.
// v336: drafts never make up anything about the seller or the part (where it is, why you can't…).
//       New settings: "Buyer asks for more photos or a closer look" (default: check the part and
//       get back to them) and "When you're available" (used whenever a draft says you'll get back
//       to them). "Waiting on me" follow-up list: when a draft promises a follow-up, sending it adds
//       the conversation to the list (msg_followups: conversation id, item, your to-do — never the
//       buyer's messages) until you mark it complete.
// v337: discount detection also catches "would you consider $65?", "below your asking price",
//       "my offer" etc. Messages shows a listing + order strip on each conversation (title, price,
//       shipping, and for THIS buyer: not bought / bought / shipped + tracking / delivered). Order
//       facts for drafts now use the order this buyer placed, not another buyer's.
// v338: Admin → Download messages (for tuning AI drafts): buyer conversations from the last 30 / 90 /
//       365 days (up to 300) as one text file, built live and never stored. Usernames, emails,
//       phone numbers and street addresses are removed.
// v339: from 106 real conversations — the AI now decides whether the buyer is asking for a lower
//       price (the word list missed 13 of 29), and new answer choices in Settings → Messages →
//       Common questions: tested / warranty, programming, donor vehicle, "has it shipped / when",
//       ships-to-my-country, your shipping days, and replying in the buyer's language (with English
//       shown to you). Download messages removes more: VINs, names signed in messages, more street
//       types — and no longer mistakes part numbers for phone numbers.
// v340: "tested?" answers never claim the part was tested or checked working — even if the listing
//       description says "good working condition" (that's the condition, not a test).
// v341: "Needs reply" leaves out conversations where you wrote last or the buyer's last message is
//       just "ok thanks" / "got it" etc. AI draft won't write a reply when there's nothing to answer
//       (it tells you instead; type a note in the box to write a follow-up). New setting "Do you test
//       your parts?" (no / yes / some — only when the listing says that part was tested); the
//       warranty choice is now separate from it.
// v342: drafts speak as the seller ("the listing", never "your listing"), and know live whether the
//       listing has ended / sold out — if this buyer didn't buy it, the draft says it has sold.
// v343: drafts know the timeline — if the buyer asked before they bought it (and it's shipped or
//       delivered since), the draft doesn't offer to check the part; it notes they went ahead and
//       bought it and asks them to say if it isn't what they needed.
// v345: (v344 Test AI drafts was dropped — built from v343.) From 300 real conversations: drafts only
//       bring up part numbers when the buyer asks about fit; never send buyers to other sellers or
//       off eBay; "still available?" answered from the live status; natural "I'll get back to you
//       by…" wording. New answer choices: changed mind / bought the wrong one, change my address,
//       faster shipping, sell part of it, radio / anti-theft code, local pickup. Download messages
//       also removes names in quoted email replies and "-Name" sign-offs.
// v346: Admin → Download messages with drafts: 7 / 14 / 30 / 90 / 365 days, 50 / 100 / 300
//       conversations, optional "AI drafts only" (found by your sign-off), progress bar, and a
//       "Facts now" line per conversation (price, shipping, part #, live status, returns, this
//       buyer's order) so drafts can be checked against the real facts.
// v347: "Write sandbox AI replies" (replaces "AI drafts only"): the download also writes an AI reply
//       for each conversation with your Anthropic key — the same draft code and settings as the
//       Messages page — into the FILE ONLY. Nothing is sent, no offer is sent, nothing is added to
//       Waiting on me. If you already answered, the AI answers as of that moment (it only sees the
//       conversation up to your reply) and your actual reply is shown under it to compare.
// v348: PART NUMBER picks real part numbers out of item specifics (your listings also put years and
//       keywords there — "2006 2007 2008, MODULE UNIT"); drafts give at most the main few. Orders that
//       were cancelled or refunded are handled as such (no "check around your porch" for a refunded order).
// v349: from 100 sandbox replies — no discount offer once the buyer has bought it or the listing has
//       ended; "this has sold" now leads the facts so it isn't missed; the AI is told it can't see
//       buyers' photos; never "good working condition"; VIN / programming / part-number wording
//       tightened; questions about details not in the listing → check and get back. New settings:
//       after the return window ends (default: check and get back — never "sold as-is"), and
//       "my parts come from US (left-hand-drive) vehicles".
// v350: optional "Honor returns up to 30 / 60 / 90 days after delivery" (counted from delivery) with
//       your return address: after eBay's window closes but inside your days, the draft says they
//       can still ship it back to your address and you'll refund them when it arrives. Past your
//       days (or when it's off), "Problem after the return window ended" applies.
// v351: the AI's own thinking leaked into a draft ("Wait, let me reconsider. The buyer is asking…").
//       The message to the buyer must now be inside <reply> tags and only that is used; a draft
//       that still reads like notes about the buyer is rewritten once automatically.
// v352: who pays return shipping depends on WHY it's coming back (eBay's rule): changed mind /
//       ordered wrong / doesn't need it → the listing's policy (you said: buyer pays); damaged,
//       defective, not working, wrong item sent, listed wrong / not as described → the seller pays
//       (eBay gives the buyer a prepaid label). Reason unclear → the draft doesn't mention it.
// v353: AI drafts can SEE the photos buyers send (up to 4, from their recent messages): it reads a
//       part number off a label and compares it with the listing ("I see 56029423AG on your label —
//       that matches"). Blurry / dark / cut off → it asks for a closer, well-lit photo instead of
//       guessing. Photos are fetched from eBay into memory for that one AI call and thrown away —
//       never saved to the database, a file, or your computer.
// v354: drafts know the listing's shipping (live from eBay): flat rate → they give the amount,
//       free → they say free, calculated → shipping depends on the buyer's location and they can
//       see it by entering their ZIP on the listing. No more "check the listing yourself" for flat rate.
// v355: before a draft offers your discount, the app asks eBay whether this listing has anyone an
//       offer can be sent to. If not, the draft doesn't promise an offer (no stuck "I sent you 5%").
// v356: eBay refused offers of exactly 5% off ("price must be at least 5% less than your Buy It
//       Now"). The offer price is now rounded DOWN and kept at least 1 cent past 5% off, and it's
//       worked out from the live listing price, not the saved copy.
// v357: drafts never invite returns or problems on their own ("let me know if it isn't what you
//       needed", "you can return it") — returns only come up when the buyer reports a problem or
//       asks about sending it back.
// v359: (v358 undone — built from v357.) Fitment answers never say "yes, it fits" because the year /
//       make / model match. The draft says the vehicle is in the listing's compatibility list but
//       fit depends on the part number — match it to the original part. Computer modules (ECM,
//       PCM, TCM, BCM, TIPM, ABS module, clusters, radios…) always get the part-number check and
//       the "may need to be programmed" note.
// v360: the "No discount offer: …" note only shows when the buyer actually asked about price.
//       Replies to messages more than 2 days old start with a short "sorry for the slow reply".
// v361: "I'll get back to you by…" uses the NEXT of your available days, worked out from today's
//       date in your time zone (Friday night → Monday, not Wednesday). Diesel / gas / engine-size
//       questions: fit goes by part number, so the draft asks them to match it.
// v362: fit / diesel-or-gas / engine / "will it work" questions ALWAYS end with the part-number check —
//       if the AI leaves it out, the app adds it ("To know if it fits your vehicle, please compare
//       the part number … with the one on your original part to see if it's a match."). Settings →
//       Messages → Your time zone (default Central) for "get back to you by…".
// v363: the fitment list was cut off at 200 rows, so vehicles further down (2011 Tucson on a
//       2009–2014 radio) looked "not listed". The app now reads the whole list and sums it up by
//       make and model with year ranges, and also gives the years in the title. A vehicle in either
//       one is "listed" — and fit still goes by part number.
// v364: the "may need to be programmed" note only goes on parts that can need it — engine /
//       transmission / body / ABS / airbag / key-immobilizer modules, TIPMs and smart junction
//       boxes, instrument clusters. Radios get "may need a radio code" instead. Mirrors, lights,
//       switches, motors, trim and plain fuse boxes get no note. The app decides from the title.
// v365: Settings → Messages → "Write an AI draft automatically" (only for conversations that need a reply).
// v366: smarter "doesn't need a reply" check (no AI): short messages made only of thank-you / ok /
//       got-it / received words drop out of Needs reply ("Ok thank you for your help", "Just
//       purchased. Thank you!"). Anything with a question or any other word stays in.
// v388: yard tickets — "Randomize" picks a time up to an hour LATER than your saved time (never earlier),
//       and "Print tomorrow's" prints a yard's ticket with tomorrow's date.
// v387: yard tickets — + a logo per yard (uploaded in Manage, prints at the top in black & white).
// v386: YARD TICKETS — print your yard entry ticket from Home on a receipt printer. Each yard has a
//       name, a ticket price and the ticket's text (with {date} {time} {price} {yard} {number} filled in
//       when you print). One saved time for all yards; today's date fills in by itself. Every print is
//       logged, so Home shows "Money saved" (week / month / year / lifetime) and a print count per yard.
// v379: pigtails — don't bring up programming at all (only answer it if the buyer asks).
// v378: PIGTAILS — a title with plugs / pigtail / connector(s) / wiring harness is the wiring, not the
//       module, even when it names one ("ECM PCM WIRING HARNESS PLUGS"). Drafts never say it needs
//       programming (if asked: no — it's just wires and plugs), and the part number is described as
//       the module the plugs connect to.
// v377: Late returns on, but the buyer asked AFTER your extra days → the draft politely says the return
//       window has passed. No "I'll look into it / get back to you" promise.
// v376: Late returns count up to when the buyer FIRST ASKED (their first message after buying), not
//       today — a buyer who asked in time still gets your address even if you reply late. Your
//       availability understands day ranges ("Mon-Fri", "Tuesday through Thursday" = every day in
//       between, not just the two ends). The draft says which day it used and why.
// v375: Listings per day loads in the background — the page asks every few seconds instead of waiting
//       on one long request (which could time out and show "Could not reach the server").
// v374: LISTINGS PER DAY (Active page) — every listing that went up in the last 90 days, from eBay's
//       GetSellerList by start date (includes ones that since sold or ended), counted per day in your
//       time zone (Settings → Messages). Kept in memory 30 minutes; nothing saved.
// v373: Returns page — + CANCELLATION REQUESTS (open / closed, approve or decline — same eBay
//       Post-Order system as returns, no new permission) and + PAYMENT DISPUTES (needs your response /
//       awaiting eBay's decision / closed — needs the new "Payment disputes" permission, so reconnect
//       eBay once). Stage filters for returns are worked out on the page.
// v371: LATE RETURNS — when you send a buyer your return address (Settings → Messages → late returns
//       on), the app adds it to a Late returns list on the Returns page: address sent date, then you
//       mark it received, then refund it (eBay's refund shows up there by itself). Not received in 30
//       days → it drops off. "Add to Late returns" in Messages adds one by hand. The address reply asks
//       the buyer to mail it within 2 weeks. Stores only the conversation, item, title, order number,
//       order total and dates — no buyer name, address or messages.
// v370: Returns — fees. Each return also reads eBay's money records (Payments → transactions) for
//       that order: the fees eBay charged on the sale, and after a refund, the fee credit eBay gave
//       back, so the page shows what the refund really cost. Before refunding it shows an "about"
//       figure (sale fees, scaled to the refund). Only amounts and dates are used — nothing saved.
// v369: Returns — refunds use eBay's own refund breakdown for that return (item price, original
//       shipping, … each line as eBay estimates it), so eBay no longer refuses with "refund amount
//       exceeds estimated amount". The return's live stage and eBay's available actions come with
//       it, so the page only offers Approve on new requests and Refund when eBay allows it.
// Accounts with email + password login. Each account's settings (including its
// own API keys) and history are saved ENCRYPTED in Postgres, so you can log in
// from any computer and everything is there. Also keeps a lifetime listing count.
//
// Railway variables this service needs:
//   DATABASE_URL     → reference your Postgres service: ${{Postgres.DATABASE_URL}}
//   ENCRYPTION_KEY   → a long random secret (32+ characters). NEVER change or lose
//                      it — saved settings can't be decrypted without it.
//   ALLOW_SIGNUP     → optional. The FIRST account can always be created (it becomes
//                      the admin). After that, new signups are blocked unless this
//                      is set to "true".
//   SERPAPI_KEY      → optional fallback if an account has no SerpApi key saved.

const express = require('express');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');   // v327: Diagnostics reads the version of each page file
const { Pool } = require('pg');

// v327: remember the last 100 server errors (time + message) for the Diagnostics page.
// Kept in memory only — they disappear when the server restarts.
const recentErrors = [];
const SERVER_STARTED = new Date();
const _consoleError = console.error;
console.error = function (...args) {
  try {
    const text = args.map(x => (x instanceof Error ? (x.message || String(x)) : typeof x === 'string' ? x : JSON.stringify(x))).join(' ');
    recentErrors.unshift({ at: new Date().toISOString(), text: text.slice(0, 600) });
    if (recentErrors.length > 100) recentErrors.length = 100;
  } catch (e) { /* never let logging break anything */ }
  _consoleError.apply(console, args);
};

const app = express();
app.set('trust proxy', 1); // Railway sits in front of us and handles HTTPS
const PORT = process.env.PORT || 3000;
const env = (k) => (process.env[k] || '').trim();

// ─── STARTUP CHECKS ──────────────────────────────────────────────────────────
if (!env('DATABASE_URL')) { console.error('DATABASE_URL is not set'); process.exit(1); }
if (env('ENCRYPTION_KEY').length < 32) { console.error('ENCRYPTION_KEY must be at least 32 characters'); process.exit(1); }

const pool = new Pool({ connectionString: env('DATABASE_URL') });

async function setupDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id            SERIAL PRIMARY KEY,
      email         TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      is_admin      BOOLEAN NOT NULL DEFAULT FALSE,
      listing_count INTEGER NOT NULL DEFAULT 0,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
      last_login    TIMESTAMPTZ
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL
    );
    CREATE TABLE IF NOT EXISTS user_data (
      user_id    INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      data_enc   TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    -- v305: eBay sales
    CREATE TABLE IF NOT EXISTS ebay_connections (
      user_id         INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      runame          TEXT,
      refresh_enc     TEXT,
      refresh_expires TIMESTAMPTZ,
      connected_at    TIMESTAMPTZ,
      history_from    TIMESTAMPTZ,
      last_sync       TIMESTAMPTZ,
      last_error      TEXT
    );
    ALTER TABLE ebay_connections ADD COLUMN IF NOT EXISTS scopes TEXT;   -- v306: permissions you approved
    -- v307: eBay fees
    CREATE TABLE IF NOT EXISTS ebay_fee_lines (
      user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      tx_key   TEXT NOT NULL,
      line_no  INTEGER NOT NULL,
      tx_date  TIMESTAMPTZ NOT NULL,
      fee_type TEXT NOT NULL,
      cost     NUMERIC(12,2) NOT NULL,
      PRIMARY KEY (user_id, tx_key, line_no)
    );
    CREATE INDEX IF NOT EXISTS ebay_fee_lines_user_date ON ebay_fee_lines (user_id, tx_date);
    ALTER TABLE ebay_connections ADD COLUMN IF NOT EXISTS fees_sync TIMESTAMPTZ;
    ALTER TABLE ebay_connections ADD COLUMN IF NOT EXISTS fees_error TEXT;
    CREATE TABLE IF NOT EXISTS ebay_orders (
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      order_id   TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      total      NUMERIC(12,2) NOT NULL DEFAULT 0,
      payout     NUMERIC(12,2),
      fees       NUMERIC(12,2),
      item_count INTEGER NOT NULL DEFAULT 0,
      status     TEXT,
      counted    BOOLEAN NOT NULL DEFAULT TRUE,
      PRIMARY KEY (user_id, order_id)
    );
    CREATE INDEX IF NOT EXISTS ebay_orders_user_created ON ebay_orders (user_id, created_at);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS dash_range TEXT;
    -- v309: sales tax per order + the dashboard's tax toggle
    ALTER TABLE ebay_orders ADD COLUMN IF NOT EXISTS tax NUMERIC(12,2) NOT NULL DEFAULT 0;
    ALTER TABLE ebay_connections ADD COLUMN IF NOT EXISTS orders_v INTEGER NOT NULL DEFAULT 0;
    -- v319: what was in each order (for the Orders page) + whether it has shipped
    CREATE TABLE IF NOT EXISTS ebay_order_items (
      user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      order_id     TEXT NOT NULL,
      line_item_id TEXT NOT NULL,
      item_id      TEXT,
      sku          TEXT,
      title        TEXT,
      qty          INTEGER NOT NULL DEFAULT 1,
      price        NUMERIC(12,2),
      PRIMARY KEY (user_id, line_item_id)
    );
    CREATE INDEX IF NOT EXISTS ebay_order_items_order ON ebay_order_items (user_id, order_id);
    ALTER TABLE ebay_orders ADD COLUMN IF NOT EXISTS ship_status TEXT;
    -- v320: listing details (photos, description, item specifics) saved per item
    CREATE TABLE IF NOT EXISTS ebay_items (
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      item_id    TEXT NOT NULL,
      data       JSONB,
      error      TEXT,
      fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (user_id, item_id)
    );
    CREATE TABLE IF NOT EXISTS msg_followups (                                            -- v336: "Waiting on me"
      id              SERIAL PRIMARY KEY,
      user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      conversation_id TEXT NOT NULL,
      item_id         TEXT,
      title           TEXT,
      task            TEXT,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
      done_at         TIMESTAMPTZ
    );
    CREATE INDEX IF NOT EXISTS msg_followups_open ON msg_followups (user_id, done_at);
    CREATE TABLE IF NOT EXISTS late_returns (                                             -- v371: Late returns
      id              SERIAL PRIMARY KEY,
      user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      conversation_id TEXT NOT NULL,
      item_id         TEXT,
      order_id        TEXT,
      title           TEXT,
      order_total     NUMERIC(12,2),
      source          TEXT,
      sent_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
      received_at     TIMESTAMPTZ,
      refunded_at     TIMESTAMPTZ,
      refund_amount   NUMERIC(12,2)
    );
    CREATE INDEX IF NOT EXISTS late_returns_user ON late_returns (user_id);
    CREATE TABLE IF NOT EXISTS yards (                                                    -- v386: yard tickets
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name       TEXT NOT NULL,
      price      NUMERIC(10,2) NOT NULL DEFAULT 0,
      template   TEXT,
      sort       INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS ticket_prints (
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      yard_id    INTEGER,
      yard_name  TEXT,
      price      NUMERIC(10,2) NOT NULL DEFAULT 0,
      printed_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS ticket_prints_user ON ticket_prints (user_id, printed_at);
    ALTER TABLE yards ADD COLUMN IF NOT EXISTS logo TEXT;                                 -- v387: ticket logo (small black & white image)
    ALTER TABLE yards ADD COLUMN IF NOT EXISTS logo_size INTEGER NOT NULL DEFAULT 70;     -- v387: % of the paper width
    ALTER TABLE yards ADD COLUMN IF NOT EXISTS design JSONB;                              -- v390: ticket designer settings (font, sizes, logo + barcode position)
    CREATE TABLE IF NOT EXISTS ticket_settings (
      user_id    INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      time       TEXT NOT NULL DEFAULT '09:00',
      width      INTEGER NOT NULL DEFAULT 80
    );
    -- ALTER TABLE ticket_settings ADD COLUMN IF NOT EXISTS randomize BOOLEAN NOT NULL DEFAULT FALSE;   (v388 — v389: no longer used; it also ran before the table was created)
    ALTER TABLE ticket_prints ADD COLUMN IF NOT EXISTS valid_for DATE;                    -- v389: the day an advance ticket is good for (NULL = the day it was sold)
    ALTER TABLE ebay_connections ADD COLUMN IF NOT EXISTS active_count INTEGER;          -- v316: live listings on eBay
    ALTER TABLE ebay_connections ADD COLUMN IF NOT EXISTS active_value NUMERIC(14,2);    -- v316: their asking prices added up
    ALTER TABLE ebay_connections ADD COLUMN IF NOT EXISTS active_sync TIMESTAMPTZ;       -- v316: when that was last checked
    ALTER TABLE ebay_connections ADD COLUMN IF NOT EXISTS active_error TEXT;             -- v316: last problem checking it
    ALTER TABLE ebay_orders ADD COLUMN IF NOT EXISTS refunded NUMERIC(12,2) NOT NULL DEFAULT 0;   -- v312: money refunded to the buyer
    ALTER TABLE ebay_orders ADD COLUMN IF NOT EXISTS refunded_tax NUMERIC(12,2) NOT NULL DEFAULT 0;   -- v314: sales tax eBay gave back with the refund
    ALTER TABLE users ADD COLUMN IF NOT EXISTS dash_tax BOOLEAN NOT NULL DEFAULT FALSE;
  `);
  await pool.query('DELETE FROM sessions WHERE expires_at < now()');
}

// ─── ENCRYPTION (AES-256-GCM) ────────────────────────────────────────────────
// Settings are scrambled before they touch the database. The key that unscrambles
// them lives only in the ENCRYPTION_KEY variable, never in the database.
const ENC_KEY = crypto.createHash('sha256').update(env('ENCRYPTION_KEY')).digest();

function encrypt(text) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', ENC_KEY, iv);
  const ct = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return ['v1', iv.toString('base64'), tag.toString('base64'), ct.toString('base64')].join(':');
}

function decrypt(stored) {
  const [ver, iv, tag, ct] = String(stored).split(':');
  if (ver !== 'v1') throw new Error('Unknown encryption format');
  const decipher = crypto.createDecipheriv('aes-256-gcm', ENC_KEY, Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(tag, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(ct, 'base64')), decipher.final()]).toString('utf8');
}

// ─── PASSWORDS (scrypt, one-way) ─────────────────────────────────────────────
// Only a one-way hash is stored. Nobody — including you — can read a password back.
function hashPassword(pw) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16);
    crypto.scrypt(pw, salt, 64, (err, key) => {
      if (err) return reject(err);
      resolve('scrypt:' + salt.toString('hex') + ':' + key.toString('hex'));
    });
  });
}

function checkPassword(pw, stored) {
  return new Promise((resolve) => {
    const [kind, saltHex, keyHex] = String(stored).split(':');
    if (kind !== 'scrypt' || !saltHex || !keyHex) return resolve(false);
    crypto.scrypt(pw, Buffer.from(saltHex, 'hex'), 64, (err, key) => {
      if (err) return resolve(false);
      const expected = Buffer.from(keyHex, 'hex');
      resolve(expected.length === key.length && crypto.timingSafeEqual(expected, key));
    });
  });
}

// ─── SESSIONS ────────────────────────────────────────────────────────────────
const COOKIE = 'plp_session';
const SESSION_DAYS = 30;
const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

function readCookie(req, name) {
  const header = req.headers.cookie || '';
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i > -1 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return null;
}

function setSessionCookie(req, res, token, maxAgeSec) {
  const secure = req.secure ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSec}${secure}`);
}

async function startSession(req, res, userId) {
  const token = crypto.randomBytes(32).toString('base64url');
  await pool.query(
    `INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, now() + interval '${SESSION_DAYS} days')`,
    [sha256(token), userId]
  );
  await pool.query('UPDATE users SET last_login = now() WHERE id = $1', [userId]);
  setSessionCookie(req, res, token, SESSION_DAYS * 86400);
}

async function requireUser(req, res, next) {
  try {
    const token = readCookie(req, COOKIE);
    if (!token) return res.status(401).json({ error: 'Not signed in' });
    const r = await pool.query(
      `SELECT u.id, u.email, u.is_admin, u.listing_count, u.dash_range, u.dash_tax
         FROM sessions s JOIN users u ON u.id = s.user_id
        WHERE s.token_hash = $1 AND s.expires_at > now()`,
      [sha256(token)]
    );
    if (!r.rows.length) return res.status(401).json({ error: 'Not signed in' });
    req.user = r.rows[0];
    next();
  } catch (e) {
    console.error('[auth]', e);
    res.status(500).json({ error: 'Server error' });
  }
}

// ─── LOGIN RATE LIMIT ────────────────────────────────────────────────────────
// Slows down anyone trying to guess passwords: after 10 failed tries from one
// address in 15 minutes, that address has to wait. Successful sign-ins don't count.
const failures = new Map();
const WINDOW_MS = 15 * 60 * 1000;
function recentFailures(ip) {
  const now = Date.now();
  const list = (failures.get(ip) || []).filter(t => now - t < WINDOW_MS);
  failures.set(ip, list);
  return list;
}
function tooManyAttempts(ip) { return recentFailures(ip).length >= 10; }
function recordFailure(ip) { recentFailures(ip).push(Date.now()); }

const cleanEmail = (e) => String(e || '').trim().toLowerCase();
const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length <= 200;

// ─── AUTH ROUTES ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.send('ok'));

async function signupOpen() {
  const r = await pool.query('SELECT COUNT(*)::int AS n FROM users');
  return r.rows[0].n === 0 || env('ALLOW_SIGNUP').toLowerCase() === 'true';
}

app.get('/api/auth-status', async (req, res) => {
  try { res.json({ signupOpen: await signupOpen() }); }
  catch (e) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/signup', express.json(), async (req, res) => {
  try {
    if (tooManyAttempts(req.ip)) return res.status(429).json({ error: 'Too many attempts — wait 15 minutes.' });
    const email = cleanEmail(req.body && req.body.email);
    const password = String((req.body && req.body.password) || '');
    if (!validEmail(email)) return recordFailure(req.ip), res.status(400).json({ error: 'Enter a valid email address.' });
    if (password.length < 8) return recordFailure(req.ip), res.status(400).json({ error: 'Password must be at least 8 characters.' });
    if (!(await signupOpen())) return recordFailure(req.ip), res.status(403).json({ error: 'New accounts are not open right now.' });

    const count = (await pool.query('SELECT COUNT(*)::int AS n FROM users')).rows[0].n;
    const hash = await hashPassword(password);
    let r;
    try {
      r = await pool.query(
        'INSERT INTO users (email, password_hash, is_admin) VALUES ($1, $2, $3) RETURNING id',
        [email, hash, count === 0] // the very first account is the admin
      );
    } catch (e) {
      if (e.code === '23505') return recordFailure(req.ip), res.status(409).json({ error: 'An account with that email already exists.' });
      throw e;
    }
    await startSession(req, res, r.rows[0].id);
    res.json({ ok: true });
  } catch (e) {
    console.error('[signup]', e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/login', express.json(), async (req, res) => {
  try {
    if (tooManyAttempts(req.ip)) return res.status(429).json({ error: 'Too many attempts — wait 15 minutes.' });
    const email = cleanEmail(req.body && req.body.email);
    const password = String((req.body && req.body.password) || '');
    const r = await pool.query('SELECT id, password_hash FROM users WHERE email = $1', [email]);
    const ok = r.rows.length && await checkPassword(password, r.rows[0].password_hash);
    if (!ok) { recordFailure(req.ip); return res.status(401).json({ error: 'Wrong email or password.' }); }
    await startSession(req, res, r.rows[0].id);
    res.json({ ok: true });
  } catch (e) {
    console.error('[login]', e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/logout', async (req, res) => {
  const token = readCookie(req, COOKIE);
  if (token) await pool.query('DELETE FROM sessions WHERE token_hash = $1', [sha256(token)]).catch(() => {});
  setSessionCookie(req, res, '', 0);
  res.json({ ok: true });
});

// ─── ACCOUNT DATA ────────────────────────────────────────────────────────────
// Everything the page used to keep in the browser — settings (with your keys)
// and pigtail / other-side history — saved encrypted to your account.
app.get('/api/data', requireUser, async (req, res) => {
  try {
    const r = await pool.query('SELECT data_enc FROM user_data WHERE user_id = $1', [req.user.id]);
    let data = { settings: null, history: { pigtail: [], otherside: [] } };
    if (r.rows.length) data = JSON.parse(decrypt(r.rows[0].data_enc));
    res.json({
      account: { email: req.user.email, isAdmin: req.user.is_admin, listingCount: req.user.listing_count },
      settings: data.settings || null,
      history: data.history || { pigtail: [], otherside: [] }
    });
  } catch (e) {
    console.error('[data:get]', e);
    res.status(500).json({ error: 'Could not load your account data' });
  }
});

// v326: account keys — edited only in the main Settings (/api/account/keys). When the
// Listing Tool saves its settings, the saved keys are kept, so a Listing Tool tab that
// was opened before you changed a key can't put the old one back.
const ACCOUNT_KEYS = ['apiKey', 'claudeModel', 'ebayClientId', 'ebayClientSecret', 'ebayUserToken', 'ebayTokenExpiry',
  'ebayUsername', 'cloudinaryCloudName', 'cloudinaryApiKey', 'cloudinaryApiSecret', 'serpApiKey'];
async function readUserData(userId) {
  const r = await pool.query('SELECT data_enc FROM user_data WHERE user_id = $1', [userId]);
  return r.rows.length ? JSON.parse(decrypt(r.rows[0].data_enc)) : null;
}
async function writeUserData(userId, data) {
  await pool.query(
    `INSERT INTO user_data (user_id, data_enc, updated_at) VALUES ($1, $2, now())
     ON CONFLICT (user_id) DO UPDATE SET data_enc = EXCLUDED.data_enc, updated_at = now()`,
    [userId, encrypt(JSON.stringify(data))]
  );
}

// POST so the page can also save with sendBeacon when the tab closes
app.post('/api/data', requireUser, express.json({ limit: '10mb' }), async (req, res) => {
  try {
    const b = req.body || {};
    if (!b.settings || typeof b.settings !== 'object') return res.status(400).json({ error: 'Missing settings' });
    const history = (b.history && typeof b.history === 'object') ? b.history : { pigtail: [], otherside: [] };
    // v326: keep the saved account keys (see ACCOUNT_KEYS above)
    const saved = await readUserData(req.user.id).catch(() => null);
    const prev = (saved && saved.settings) || {};
    // ACCOUNT_KEYS.forEach(k => { if (prev[k] !== undefined) b.settings[k] = prev[k]; });
    ACCOUNT_KEYS.concat(['msgSettings']).forEach(k => { if (prev[k] !== undefined) b.settings[k] = prev[k]; });   // v330: + Messages settings
    const blob = encrypt(JSON.stringify({ settings: b.settings, history }));
    await pool.query(
      `INSERT INTO user_data (user_id, data_enc, updated_at) VALUES ($1, $2, now())
       ON CONFLICT (user_id) DO UPDATE SET data_enc = EXCLUDED.data_enc, updated_at = now()`,
      [req.user.id, blob]
    );
    res.json({ ok: true });
  } catch (e) {
    console.error('[data:save]', e);
    res.status(500).json({ error: 'Could not save' });
  }
});

// v326: ACCOUNT KEYS — for Settings → Account on the main pages
app.get('/api/account/keys', requireUser, async (req, res) => {
  try {
    const d = await readUserData(req.user.id);
    const s = (d && d.settings) || {};
    const out = {};
    ACCOUNT_KEYS.forEach(k => { out[k] = s[k] === undefined || s[k] === null ? '' : String(s[k]); });
    res.json({ keys: out });
  } catch (e) {
    console.error('[keys:get]', e);
    res.status(500).json({ error: 'Could not load your keys' });
  }
});

app.post('/api/account/keys', requireUser, express.json(), async (req, res) => {
  try {
    const b = (req.body && req.body.keys) || {};
    const d = (await readUserData(req.user.id)) || { settings: {}, history: { pigtail: [], otherside: [] } };
    d.settings = d.settings || {};
    ACCOUNT_KEYS.filter(k => k !== 'ebayTokenExpiry').forEach(k => {
      if (b[k] === undefined) return;
      const v = String(b[k] || '').trim().slice(0, 4000);
      if (k === 'ebayUserToken' && v && v !== d.settings.ebayUserToken) {
        d.settings.ebayTokenExpiry = new Date(Date.now() + 548 * 86400000).toISOString();   // Auth'n'Auth tokens last 18 months
      }
      d.settings[k] = k === 'claudeModel' ? (v || 'claude-sonnet-4-5') : v;
    });
    await writeUserData(req.user.id, d);
    accessTokens.delete(req.user.id);   // eBay keys may have changed
    res.json({ ok: true, tokenExpiry: d.settings.ebayTokenExpiry || null });
  } catch (e) {
    console.error('[keys:save]', e);
    res.status(500).json({ error: 'Could not save your keys' });
  }
});

// v326: SALES DOWNLOAD — one row per order for any dates, for every account
app.get('/api/sales/export', requireUser, async (req, res) => {
  try {
    const from = isoDate(req.query.from), to = isoDate(req.query.to);
    if (!from || !to || from > to) return res.status(400).send('Pick a start and end date');
    const tz = safeTimeZone(String(req.query.tz || 'UTC'));
    const r = await pool.query(
      `SELECT o.order_id, to_char(o.created_at AT TIME ZONE $2, 'YYYY-MM-DD HH24:MI') AS sold_at,
              o.total::float, o.tax::float, o.refunded::float, o.refunded_tax::float, o.fees::float, o.counted, o.status,
              COALESCE(string_agg(i.title, ' | ' ORDER BY i.line_item_id), '') AS titles,
              COALESCE(string_agg(i.sku, ' | ' ORDER BY i.line_item_id), '') AS skus,
              COALESCE(SUM(i.qty), o.item_count)::int AS qty
         FROM ebay_orders o
         LEFT JOIN ebay_order_items i ON i.user_id = o.user_id AND i.order_id = o.order_id
        WHERE o.user_id = $1 AND (o.created_at AT TIME ZONE $2)::date BETWEEN $3::date AND $4::date
        GROUP BY o.order_id, o.created_at, o.total, o.tax, o.refunded, o.refunded_tax, o.fees, o.counted, o.status, o.item_count
        ORDER BY o.created_at`,
      [req.user.id, tz, from, to]
    );
    const f = (n) => (Math.round((n || 0) * 100) / 100).toFixed(2);
    const q = (t) => '"' + String(t || '').replace(/"/g, '""') + '"';
    const lines = [['Sold (eBay time)', 'Order Number', 'Items', 'SKU', 'Qty', 'Item + Shipping', 'Sales Tax', 'Refunded (incl. tax)', 'Total (like eBay)', 'eBay Fees', 'Net', 'Status'].join(',')];
    const sum = { total: 0, tax: 0, ref: 0, eb: 0, fees: 0, net: 0, qty: 0, n: 0 };
    for (const x of r.rows) {
      const refunded = (x.refunded || 0) + (x.refunded_tax || 0);
      const ebayTotal = x.counted ? x.total + x.tax - refunded : 0;
      const fees = x.fees || 0;
      const net = x.counted ? x.total - (x.refunded || 0) - fees : 0;
      lines.push([x.sold_at, x.order_id, q(x.titles), q(x.skus), x.qty, f(x.total), f(x.tax), f(refunded), f(ebayTotal), f(fees), f(net), q(x.status)].join(','));
      sum.total += x.total; sum.tax += x.tax; sum.ref += refunded; sum.eb += ebayTotal; sum.fees += fees; sum.net += net; sum.qty += x.qty || 0; sum.n++;
    }
    lines.push(['TOTAL', sum.n + ' orders', '', '', sum.qty, f(sum.total), f(sum.tax), f(sum.ref), f(sum.eb), f(sum.fees), f(sum.net), ''].join(','));
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="partslister-sales-${from}-to-${to}.csv"`);
    res.send('\uFEFF' + lines.join('\r\n') + '\r\n');   // the mark at the start helps Excel read it right
  } catch (e) {
    console.error('[sales export]', e);
    res.status(500).send('Could not build the download');
  }
});

// v302: just the account — the dashboard uses this so it never pulls your keys
app.get('/api/me', requireUser, (req, res) => {
  // res.json({ email: req.user.email, isAdmin: req.user.is_admin, listingCount: req.user.listing_count });
  res.json({ email: req.user.email, isAdmin: req.user.is_admin, listingCount: req.user.listing_count, dashRange: req.user.dash_range || null, dashTax: !!req.user.dash_tax });   // v305, v309: + dashTax
});

// Lifetime listing counter — +1 for every successful Launch or Scheduled Listing
app.post('/api/listing-count', requireUser, async (req, res) => {
  try {
    const r = await pool.query(
      'UPDATE users SET listing_count = listing_count + 1 WHERE id = $1 RETURNING listing_count',
      [req.user.id]
    );
    res.json({ count: r.rows[0].listing_count });
  } catch (e) {
    console.error('[count]', e);
    res.status(500).json({ error: 'Could not update count' });
  }
});

// ─── EBAY TRADING API (port of netlify/functions/ebay.js) ───────────────────
// Uses the keys from YOUR settings, sent by the page. Only listing calls are
// allowed. The old Finding API branch is gone — eBay shut that API down.
const ALLOWED_CALLS = ['AddItem', 'VerifyAddItem'];

app.post('/api/ebay', requireUser, express.text({ type: '*/*', limit: '2mb' }), async (req, res) => {
  const callName = req.get('x-ebay-api-call-name') || '';
  if (!ALLOWED_CALLS.includes(callName)) {
    return res.status(400).type('text/xml').send(`<error>Call not allowed: ${callName}</error>`);
  }
  try {
    const r = await fetch('https://api.ebay.com/ws/api.dll', {
      method: 'POST',
      headers: {
        'X-EBAY-API-CALL-NAME': callName,
        'X-EBAY-API-APP-NAME': req.get('x-ebay-api-app-name') || '',
        'X-EBAY-API-DEV-NAME': req.get('x-ebay-api-dev-name') || '',
        'X-EBAY-API-CERT-NAME': req.get('x-ebay-api-cert-name') || '',
        'X-EBAY-API-SITEID': req.get('x-ebay-api-siteid') || '0',
        'X-EBAY-API-COMPATIBILITY-LEVEL': '967',
        'Content-Type': 'text/xml'
      },
      body: String(req.body || '')
    });
    res.status(200).type('text/xml').send(await r.text());
  } catch (e) {
    res.status(500).type('text/xml').send(`<error>${e.message}</error>`);
  }
});

// ─── EBAY BROWSE (port of netlify/functions/ebaybrowse.js) ──────────────────
// App tokens are cached per Client ID so every search doesn't fetch a new one.
const appTokens = new Map();

async function getAppToken(clientId, clientSecret) {
  const cached = appTokens.get(clientId);
  if (cached && cached.secret === clientSecret && Date.now() < cached.expires) return cached.token;
  const r = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
    },
    body: 'grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope',
    signal: AbortSignal.timeout(8000)
  });
  const d = await r.json();
  if (!d.access_token) {
    const err = new Error('Failed to get eBay token');
    err.detail = d.error_description || JSON.stringify(d);
    throw err;
  }
  appTokens.set(clientId, {
    token: d.access_token,
    secret: clientSecret,
    expires: Date.now() + Math.max(60, (d.expires_in || 7200) - 300) * 1000
  });
  return d.access_token;
}

app.post('/api/ebaybrowse', requireUser, express.json(), async (req, res) => {
  const b = req.body || {};
  const clientId = String(b.clientId || '');
  const clientSecret = String(b.clientSecret || '');
  const keywords = String(b.keywords || '');
  const limit = Math.min(parseInt(b.limit) || 10, 50);
  const offset = parseInt(b.offset) || 0;
  const fullData = !!b.fullData;
  const zipCode = String(b.zipCode || '').trim();
  const seller = String(b.seller || '').trim();
  const categoryId = String(b.categoryId || '').trim();

  if (!clientId || !clientSecret || !keywords) {
    return res.status(400).json({ error: 'Missing clientId, clientSecret, or keywords' });
  }

  let token;
  try { token = await getAppToken(clientId, clientSecret); }
  catch (e) { return res.status(401).json({ error: e.message, detail: e.detail }); }

  try {
    const q = encodeURIComponent(keywords);
    const sortParam = zipCode ? '&sort=distance' : '';
    const postalParam = zipCode ? `&buyerPostalCode=${encodeURIComponent(zipCode)}` : '';
    // Seller filter — literal braces, seller username only (not store name)
    const sellerFilter = seller ? `&filter=sellers%3A%7B${encodeURIComponent(seller)}%7D` : '&filter=conditions%3A%7BUSED%7D';
    const categoryParam = categoryId ? `&category_ids=${encodeURIComponent(categoryId)}` : '';
    const url = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${q}&limit=${limit}&offset=${offset}${sellerFilter}${sortParam}${postalParam}${categoryParam}`;

    const r = await fetch(url, {
      headers: { 'Authorization': 'Bearer ' + token, 'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US', 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(8000)
    });
    const browseData = await r.json();

    if (browseData.errors && browseData.errors.length) {
      if (r.status === 401) appTokens.delete(clientId); // stale token — fetch a fresh one next time
      const errMsg = browseData.errors.map(e => e.message || e.longMessage || JSON.stringify(e)).join('; ');
      return res.json({ error: 'eBay API error: ' + errMsg, items: [], titles: [], total: 0 });
    }

    if (fullData) {
      let items = (browseData.itemSummaries || []).map(item => ({
        title: item.title || '',
        price: item.price ? item.price.value : null,
        shipping: (() => {
          if (item.shippingOptions && item.shippingOptions.length > 0) {
            const opt = item.shippingOptions[0];
            if (!opt.shippingCost) return 'Free';
            const cost = parseFloat(opt.shippingCost.value);
            return isNaN(cost) ? 'Free' : cost;
          }
          return null;
        })(),
        image: item.image ? item.image.imageUrl : null,
        // Primary LEAF category (listable) — the categories array mixes levels
        categoryId: (() => {
          if (Array.isArray(item.leafCategoryIds) && item.leafCategoryIds.length) return String(item.leafCategoryIds[0]);
          return item.categories && item.categories.length ? String(item.categories[item.categories.length - 1].categoryId) : null;
        })(),
        categoryName: (() => {
          const leaf = (Array.isArray(item.leafCategoryIds) && item.leafCategoryIds.length) ? String(item.leafCategoryIds[0]) : null;
          if (leaf && item.categories && item.categories.length) {
            const hit = item.categories.find(c => String(c.categoryId) === leaf);
            if (hit) return hit.categoryName;
          }
          return item.categories && item.categories.length ? item.categories[item.categories.length - 1].categoryName : null;
        })(),
        url: item.itemWebUrl || null,
        sellerUsername: item.seller ? (item.seller.username || '').toLowerCase() : null
      }));
      // Backstop in case eBay ignores the seller filter
      if (seller && items.length > 0) {
        const sellerLower = seller.toLowerCase();
        const sellerFiltered = items.filter(i => i.sellerUsername && i.sellerUsername === sellerLower);
        if (sellerFiltered.length === 0) return res.json({ items: [], total: 0, sellerFilterIgnored: true });
        items = sellerFiltered;
      }
      return res.json({ items, total: items.length });
    }
    const titles = (browseData.itemSummaries || [])
      .map(item => item.title || '')
      .filter(t => t.length >= 10 && t.length <= 120);
    return res.json({ titles, total: browseData.total || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── SERPAPI GOOGLE LENS (port of netlify/functions/serplens.js) ────────────
// Uses the SerpApi key from your settings; falls back to SERPAPI_KEY if set.
function renderAiOverview(ov) {
  if (!ov || typeof ov !== 'object') return '';
  const out = [];
  const walk = (b) => {
    if (!b) return;
    if (b.snippet) out.push(String(b.snippet));
    if (Array.isArray(b.list)) b.list.forEach(walk);
    if (Array.isArray(b.text_blocks)) b.text_blocks.forEach(walk);
  };
  if (Array.isArray(ov.text_blocks)) ov.text_blocks.forEach(walk);
  else if (typeof ov.snippet === 'string') out.push(ov.snippet);
  return out.join('\n').trim();
}

const mapMatches = (arr) => (Array.isArray(arr) ? arr.slice(0, 25) : []).map(m => ({
  title: m.title || '', source: m.source || '', link: m.link || ''
}));

app.post('/api/serplens', requireUser, express.json(), async (req, res) => {
  const imageUrl = String((req.body && req.body.imageUrl) || '').trim();
  const apiKey = String((req.body && req.body.serpApiKey) || '').trim() || env('SERPAPI_KEY');
  if (!imageUrl) return res.status(400).json({ error: 'Missing imageUrl' });
  if (!apiKey) return res.status(400).json({ error: 'No SerpApi key — add one in Settings → Account' });

  const getJson = async (url) => {
    const r = await fetch(url, { signal: AbortSignal.timeout(20000) });
    const t = await r.text();
    try { return JSON.parse(t); }
    catch (e) { const err = new Error('Bad response from SerpApi'); err.detail = t.slice(0, 300); throw err; }
  };

  try {
    const params = new URLSearchParams({ engine: 'google_lens', url: imageUrl, country: 'us', hl: 'en', api_key: apiKey });
    let data;
    try { data = await getJson('https://serpapi.com/search.json?' + params.toString()); }
    catch (e) { return res.status(502).json({ error: e.message, detail: e.detail }); }
    if (data.error) return res.status(502).json({ error: 'SerpApi error', detail: data.error });

    const visualMatches = mapMatches(data.visual_matches);
    const exactMatches = mapMatches(data.exact_matches);
    const knowledgeGraph = Array.isArray(data.knowledge_graph)
      ? data.knowledge_graph.slice(0, 5).map(k => ({ title: k.title || '', subtitle: k.subtitle || '' }))
      : [];

    let aiOverview = '';
    let aiOverviewSource = 'none';
    const ov = data.ai_overview || null;
    if (ov && Array.isArray(ov.text_blocks)) {
      aiOverview = renderAiOverview(ov);
      aiOverviewSource = aiOverview ? 'inline' : 'inline_empty';
    } else if (ov && (ov.serpapi_link || ov.page_token)) {
      try {
        let url;
        if (ov.serpapi_link) {
          const u = new URL(ov.serpapi_link);
          if (!u.searchParams.has('api_key')) u.searchParams.set('api_key', apiKey);
          url = u.toString();
        } else {
          url = 'https://serpapi.com/search.json?engine=google_ai_overview&page_token=' + encodeURIComponent(ov.page_token) + '&api_key=' + apiKey;
        }
        const data2 = await getJson(url);
        aiOverview = renderAiOverview(data2.ai_overview);
        aiOverviewSource = aiOverview ? 'fetched' : 'fetch_empty';
      } catch (e) {
        aiOverviewSource = 'fetch_failed';
      }
    }

    res.json({
      aiOverview, exactMatches, visualMatches, knowledgeGraph,
      _meta: { aiOverviewSource, visualCount: visualMatches.length, exactCount: exactMatches.length }
    });
  } catch (e) {
    res.status(500).json({ error: 'Lens request failed', detail: String(e && e.message || e) });
  }
});

// ─── v305: EBAY SALES ────────────────────────────────────────────────────────
// Connects your eBay seller account (one-time "allow" click) and imports your
// sold orders so the dashboard shows real sales.
//
// • Uses the eBay Client ID + Client Secret you already saved in the Listing
//   Tool's Settings — nothing to re-enter.
// • The RuName is saved from the dashboard's Admin settings.
// • The token eBay hands back is stored ENCRYPTED, like your other keys.
// • Only dates and dollar amounts are stored for each order — no buyer names
//   or addresses.
const EBAY_AUTH_HOST = env('EBAY_AUTH_HOST') || 'https://auth.ebay.com';   // override for testing only
const EBAY_API_HOST  = env('EBAY_API_HOST')  || 'https://api.ebay.com';    // override for testing only
// const SALES_SCOPES = [
//   'https://api.ebay.com/oauth/api_scope',
//   'https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly'
// ].join(' ');

// v306: every permission the app asks for, with a plain-English name for the
// Admin page. Add a line here to ask for something new — then Reconnect once.
const EBAY_SCOPES = [
  { scope: 'https://api.ebay.com/oauth/api_scope',                            label: 'Basic access' },
  { scope: 'https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly',  label: 'Your orders (sales)' },
  { scope: 'https://api.ebay.com/oauth/api_scope/sell.finances',              label: 'Fees, payouts & sales tax' },
  { scope: 'https://api.ebay.com/oauth/api_scope/sell.analytics.readonly',    label: 'Seller metrics & standing' },
  { scope: 'https://api.ebay.com/oauth/api_scope/commerce.message',           label: 'Message threads (read & reply)' },   // v322
  { scope: 'https://api.ebay.com/oauth/api_scope/sell.inventory',             label: 'Send offers to buyers' },            // v322
  { scope: 'https://api.ebay.com/oauth/api_scope/sell.payment.dispute',       label: 'Payment disputes' }                  // v373
];
const SALES_SCOPES = EBAY_SCOPES.map(x => x.scope).join(' ');

// What v305 asked for — used for connections made before v306, so their
// token keeps refreshing (eBay refuses a refresh that asks for MORE than was approved).
const V305_SCOPES = [
  'https://api.ebay.com/oauth/api_scope',
  'https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly'
].join(' ');
const grantedScopes = (conn) => (conn && conn.scopes) || V305_SCOPES;
const HISTORY_DAYS = 728;               // eBay keeps orders about two years
const AUTO_SYNC_MINUTES = 15;           // refresh in the background when older than this
const CALLBACK_PATH = '/api/ebay-callback';

function requireAdmin(req, res, next) {
  if (!req.user || !req.user.is_admin) return res.status(403).json({ error: 'Admin only' });
  next();
}

// The eBay keys you saved in the Listing Tool (read only — never changed here)
async function getEbayKeys(userId) {
  const r = await pool.query('SELECT data_enc FROM user_data WHERE user_id = $1', [userId]);
  if (!r.rows.length) return { clientId: '', clientSecret: '' };
  const s = (JSON.parse(decrypt(r.rows[0].data_enc)).settings) || {};
  return { clientId: String(s.ebayClientId || '').trim(), clientSecret: String(s.ebayClientSecret || '').trim() };
}

async function getConnection(userId) {
  const r = await pool.query('SELECT * FROM ebay_connections WHERE user_id = $1', [userId]);
  return r.rows[0] || null;
}

async function ebayToken(keys, body) {
  const r = await fetch(EBAY_API_HOST + '/identity/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(keys.clientId + ':' + keys.clientSecret).toString('base64')
    },
    body: new URLSearchParams(body).toString(),
    signal: AbortSignal.timeout(20000)
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.access_token) {
    const err = new Error(d.error_description || d.error || ('eBay token request failed (' + r.status + ')'));
    err.code = d.error;
    throw err;
  }
  return d;
}

// Short-lived access tokens (2 hours) are kept in memory and re-made from the
// stored refresh token (18 months) whenever needed.
const accessTokens = new Map();

async function getAccessToken(userId) {
  const cached = accessTokens.get(userId);
  if (cached && Date.now() < cached.expires) return cached.token;
  const conn = await getConnection(userId);
  if (!conn || !conn.refresh_enc) throw new Error('eBay is not connected');
  const keys = await getEbayKeys(userId);
  // if (!keys.clientId || !keys.clientSecret) throw new Error('Your eBay Client ID / Client Secret are missing from Listing Tool settings');
  if (!keys.clientId || !keys.clientSecret) throw new Error('Your eBay Client ID / Client Secret are missing — add them in Settings → Account');   // v326
  let d;
  try {
    // d = await ebayToken(keys, { grant_type: 'refresh_token', refresh_token: decrypt(conn.refresh_enc), scope: SALES_SCOPES });
    d = await ebayToken(keys, { grant_type: 'refresh_token', refresh_token: decrypt(conn.refresh_enc), scope: grantedScopes(conn) });   // v306
  } catch (e) {
    if (e.code === 'invalid_grant') throw new Error('eBay connection expired or was revoked — click Connect eBay again');
    throw e;
  }
  accessTokens.set(userId, { token: d.access_token, expires: Date.now() + Math.max(60, (d.expires_in || 7200) - 300) * 1000 });
  return d.access_token;
}

const money = (x) => {
  const n = parseFloat(x && x.value !== undefined ? x.value : x);
  return Number.isFinite(n) ? n : null;
};

// v314: states where eBay's sales tax is on the item only, not shipping —
// worked out from QPUD's own eBay All orders reports (Jul–Oct 2026).
const NO_SHIPPING_TAX_STATES = new Set(['AL','AZ','CA','IA','ID','IN','KS','LA','MA','MD','ME','MI','NV','OK','UT','VA','WY']);

// One eBay order → the few numbers the dashboard needs
function mapOrder(o) {
  const ps = o.pricingSummary || {};
  const sub = money(ps.priceSubtotal);
  const ship = money(ps.deliveryCost);
  // Sales = item price + shipping charged (what eBay's Seller Hub calls sales, before tax)
  const total = sub !== null ? sub + (ship || 0) : (money(ps.total) || 0);
  const cancel = o.cancelStatus && o.cancelStatus.cancelState;
  const pay = o.orderPaymentStatus || '';
  const counted = cancel !== 'CANCELED' && pay !== 'FULLY_REFUNDED' && pay !== 'FAILED';
  const items = (o.lineItems || []).reduce((s, li) => s + (parseInt(li.quantity, 10) || 1), 0);
  // v309: sales tax & government fees on the order — what eBay collects and
  // remits for you, plus any tax you collected yourself
  let tax = 0;
  for (const li of o.lineItems || []) {
    for (const t of li.ebayCollectAndRemitTaxes || []) tax += money(t.amount) || 0;
    for (const t of li.taxes || []) tax += money(t.amount) || 0;
  }
  // v314: replaced — kept for reference:
  // v312: money refunded to the buyer (full or partial). eBay's order total
  // drops by this amount, so ours does too.
  //   let refunded = 0;
  //   const orderRefunds = ((o.paymentSummary && o.paymentSummary.refunds) || []).filter(x => x.refundStatus !== 'FAILED');
  // if (orderRefunds.length) orderRefunds.forEach(x => { refunded += money(x.amount) || 0; });
  // else for (const li of o.lineItems || []) for (const x of li.refunds || []) refunded += money(x.amount) || 0;
  // v313: add up both places eBay reports refunds and use the bigger one.
  // They describe the same money, so adding them together would double it.
  //   let orderLevel = 0, itemLevel = 0;
  //   orderRefunds.forEach(x => { orderLevel += money(x.amount) || 0; });
  //   for (const li of o.lineItems || []) for (const x of li.refunds || []) itemLevel += money(x.amount) || 0;
  //   refunded = Math.max(orderLevel, itemLevel);
  // v314: refunds per item, the way eBay counts them.
  //  - The per-item refund is what the buyer got back for the item/shipping,
  //    before tax. (The whole-order refund list is your amount after eBay's
  //    fee credit, so it is only used if eBay lists no per-item refunds.)
  //  - eBay also gives back the sales tax on that refund. In states that don't
  //    tax shipping, refunding the full item price gives back ALL the tax;
  //    otherwise the tax comes back in proportion to the refund.
  //  - Fees like Colorado's retail delivery fee are not given back.
  // The buyer's state is read only for this math — it is never saved.
  const shipState = String((((((o.fulfillmentStartInstructions || [])[0] || {}).shippingStep || {}).shipTo || {}).contactAddress || {}).stateOrProvince || '').trim().toUpperCase();
  const noShipTax = NO_SHIPPING_TAX_STATES.has(shipState);
  let refunded = 0, refundedTax = 0;
  for (const li of o.lineItems || []) {
    let liRefund = 0;
    for (const x of li.refunds || []) liRefund += money(x.amount) || 0;
    if (liRefund <= 0) continue;
    refunded += liRefund;
    const itemCost = money(li.lineItemCost) || 0;
    const liShip = money(li.deliveryCost && li.deliveryCost.shippingCost) || 0;
    const liTotal = itemCost + liShip;
    let salesTax = 0;
    for (const t of (li.ebayCollectAndRemitTaxes || []).concat(li.taxes || [])) {
      if (!t.taxType || /SALES_TAX|GST|VAT|HST|PST|QST/i.test(t.taxType)) salesTax += money(t.amount) || 0;
    }
    if (salesTax <= 0) continue;
    if (noShipTax && liRefund >= itemCost - 0.005) refundedTax += salesTax;
    else if (liTotal > 0) refundedTax += Math.min(salesTax, Math.round(salesTax * liRefund / liTotal * 100) / 100);
  }
  if (refunded <= 0) {   // no per-item refunds listed — fall back to the order's list
    ((o.paymentSummary && o.paymentSummary.refunds) || []).filter(x => x.refundStatus !== 'FAILED')
      .forEach(x => { refunded += money(x.amount) || 0; });
  }
  return {
    orderId: String(o.orderId),
    created: o.creationDate,
    total: Math.round(total * 100) / 100,
    payout: money(o.paymentSummary && o.paymentSummary.totalDueSeller),
    fees: money(o.totalMarketplaceFee),
    items,
    status: pay + (cancel && cancel !== 'NONE_REQUESTED' ? ' / ' + cancel : ''),
    counted,
    tax: Math.round(tax * 100) / 100,   // v309
    refunded: Math.round(refunded * 100) / 100,   // v312
    refundedTax: Math.round(refundedTax * 100) / 100,   // v314
    shipStatus: o.orderFulfillmentStatus || null,          // v319: NOT_STARTED / IN_PROGRESS / FULFILLED
    lineItems: (o.lineItems || []).map(li => ({            // v319: what was sold (no buyer details)
      lineItemId: String(li.lineItemId || ''),
      itemId: li.legacyItemId ? String(li.legacyItemId) : null,
      sku: li.sku || null,
      title: li.title || null,
      qty: parseInt(li.quantity, 10) || 1,
      price: money(li.lineItemCost)
    })).filter(li => li.lineItemId)
  };
}

async function saveOrders(userId, orders) {
  if (!orders.length) return;
  const values = [];
  const params = [];
  orders.forEach((o, i) => {
    const b = i * 13;   // v309: + tax, v312: + refunded, v314: + refunded_tax, v319: + ship_status
    values.push(`($${b + 1},$${b + 2},$${b + 3},$${b + 4},$${b + 5},$${b + 6},$${b + 7},$${b + 8},$${b + 9},$${b + 10},$${b + 11},$${b + 12},$${b + 13})`);
    params.push(userId, o.orderId, o.created, o.total, o.payout, o.fees, o.items, o.status, o.counted, o.tax, o.refunded, o.refundedTax, o.shipStatus);
  });
  await pool.query(
    `INSERT INTO ebay_orders (user_id, order_id, created_at, total, payout, fees, item_count, status, counted, tax, refunded, refunded_tax, ship_status)
     VALUES ${values.join(',')}
     ON CONFLICT (user_id, order_id) DO UPDATE SET
       created_at = EXCLUDED.created_at, total = EXCLUDED.total, payout = EXCLUDED.payout,
       fees = EXCLUDED.fees, item_count = EXCLUDED.item_count, status = EXCLUDED.status, counted = EXCLUDED.counted,
       tax = EXCLUDED.tax, refunded = EXCLUDED.refunded, refunded_tax = EXCLUDED.refunded_tax, ship_status = EXCLUDED.ship_status`,
    params
  );
  // v319: the items in each order
  const lis = [];
  orders.forEach(o => (o.lineItems || []).forEach(li => lis.push([o.orderId, li])));
  if (lis.length) {
    const v2 = [], p2 = [];
    lis.forEach(([orderId, li], i) => {
      const b = i * 8;
      v2.push(`($${b + 1},$${b + 2},$${b + 3},$${b + 4},$${b + 5},$${b + 6},$${b + 7},$${b + 8})`);
      p2.push(userId, orderId, li.lineItemId, li.itemId, li.sku, li.title ? String(li.title).slice(0, 300) : null, li.qty, li.price);
    });
    await pool.query(
      `INSERT INTO ebay_order_items (user_id, order_id, line_item_id, item_id, sku, title, qty, price)
       VALUES ${v2.join(',')}
       ON CONFLICT (user_id, line_item_id) DO UPDATE SET
         order_id = EXCLUDED.order_id, item_id = EXCLUDED.item_id, sku = EXCLUDED.sku,
         title = EXCLUDED.title, qty = EXCLUDED.qty, price = EXCLUDED.price`,
      p2
    );
  }
}

// First sync pulls about two years; later syncs pull only orders that changed
// since the last one (new sales, cancellations, refunds).
const syncing = new Set();

async function syncOrders(userId) {
  if (syncing.has(userId)) return;
  syncing.add(userId);
  const started = new Date();
  try {
    const conn = await getConnection(userId);
    if (!conn || !conn.refresh_enc) return;
    let token = await getAccessToken(userId);
    let filter, historyFrom = null;
    // if (!conn.last_sync) {
    // if (!conn.last_sync || (conn.orders_v || 0) < 3) {   // v309: tax, v312: refunds — re-import once
    // if (!conn.last_sync || (conn.orders_v || 0) < 4) {   // v313: refunds per item — re-import once
    // if (!conn.last_sync || (conn.orders_v || 0) < 5) {   // v314: tax on refunds — re-import once
    if (!conn.last_sync || (conn.orders_v || 0) < 6) {   // v319: order items for the Orders page — re-import once
      historyFrom = new Date(started.getTime() - HISTORY_DAYS * 86400000);
      filter = `creationdate:[${historyFrom.toISOString()}..]`;
    } else {
      const since = new Date(new Date(conn.last_sync).getTime() - 2 * 86400000);
      filter = `lastmodifieddate:[${since.toISOString()}..]`;
    }
    let offset = 0, total = Infinity, pages = 0, retried = false;
    while (offset < total && pages < 250) {
      const url = `${EBAY_API_HOST}/sell/fulfillment/v1/order?filter=${encodeURIComponent(filter)}&limit=200&offset=${offset}`;
      const r = await fetch(url, {
        headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' },
        signal: AbortSignal.timeout(30000)
      });
      if (r.status === 401 && !retried) {          // token went stale mid-sync
        accessTokens.delete(userId);
        token = await getAccessToken(userId);
        retried = true;
        continue;
      }
      if (!r.ok) {
        const t = await r.text().catch(() => '');
        let msg = t.slice(0, 200);
        try { const j = JSON.parse(t); msg = (j.errors || []).map(e => e.longMessage || e.message).join('; ') || msg; } catch (e) { /* keep text */ }
        throw new Error('eBay orders request failed (' + r.status + '): ' + msg);
      }
      const d = await r.json();
      const orders = (d.orders || []).map(mapOrder).filter(o => o.orderId && o.created);
      await saveOrders(userId, orders);
      total = Number.isFinite(d.total) ? d.total : 0;
      offset += (d.orders || []).length;
      pages++;
      if (!(d.orders || []).length) break;
    }
    await pool.query(
      `UPDATE ebay_connections SET last_sync = $2, last_error = NULL,
         history_from = COALESCE($3, history_from), orders_v = 6 WHERE user_id = $1`,   // v313: was 3, v314: was 4, v319: was 5
      [userId, started, historyFrom]
    );
    await syncFees(userId);   // v307: fees import has its own error handling
  } catch (e) {
    console.error('[ebay sync]', e.message);
    await pool.query('UPDATE ebay_connections SET last_error = $2 WHERE user_id = $1', [userId, String(e.message).slice(0, 500)]).catch(() => {});
  } finally {
    syncing.delete(userId);
  }
}

// One-time "allow" — state links eBay's reply back to your account
const oauthStates = new Map();
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of oauthStates) if (v.expires < now) oauthStates.delete(k);
}, 60000).unref();

app.get('/api/ebay/status', requireUser, requireAdmin, async (req, res) => {
  try {
    const conn = await getConnection(req.user.id);
    const keys = await getEbayKeys(req.user.id);
    const count = await pool.query('SELECT COUNT(*)::int AS n FROM ebay_orders WHERE user_id = $1', [req.user.id]);
    res.json({
      ruName: (conn && conn.runame) || '',
      hasKeys: !!(keys.clientId && keys.clientSecret),
      connected: !!(conn && conn.refresh_enc),
      connectedAt: conn && conn.connected_at,
      refreshExpires: conn && conn.refresh_expires,
      lastSync: conn && conn.last_sync,
      historyFrom: conn && conn.history_from,
      lastError: (conn && conn.last_error) || null,
      syncing: syncing.has(req.user.id),
      // v307: fees
      feesApproved: hasScope(conn, FIN_SCOPE),
      feesSync: (conn && conn.fees_sync) || null,
      feesError: (conn && conn.fees_error) || null,
      feeLines: (await pool.query('SELECT COUNT(*)::int AS n FROM ebay_fee_lines WHERE user_id = $1', [req.user.id])).rows[0].n,
      orders: count.rows[0].n,
      callbackPath: CALLBACK_PATH,
      // v306: each permission and whether you've approved it
      permissions: EBAY_SCOPES.map(x => ({
        label: x.label,
        granted: !!(conn && conn.refresh_enc) && grantedScopes(conn).split(' ').includes(x.scope)
      }))
    });
  } catch (e) {
    console.error('[ebay status]', e);
    res.status(500).json({ error: 'Could not load eBay status' });
  }
});

app.post('/api/ebay/settings', requireUser, requireAdmin, express.json(), async (req, res) => {
  const ruName = String((req.body && req.body.ruName) || '').trim();
  if (!/^[A-Za-z0-9_\-]{5,200}$/.test(ruName)) {
    return res.status(400).json({ error: 'That doesn’t look like a RuName — it should look like Your_Name-YourApp-PRD-abc123' });
  }
  await pool.query(
    `INSERT INTO ebay_connections (user_id, runame) VALUES ($1, $2)
     ON CONFLICT (user_id) DO UPDATE SET runame = EXCLUDED.runame`,
    [req.user.id, ruName]
  );
  res.json({ ok: true });
});

// The page sends you here; this sends you on to eBay's "allow" screen
app.get('/api/ebay/connect', requireUser, requireAdmin, async (req, res) => {
  try {
    const conn = await getConnection(req.user.id);
    const keys = await getEbayKeys(req.user.id);
    if (!conn || !conn.runame) return res.redirect('/sales?ebay=error&msg=' + encodeURIComponent('Save your RuName first'));   // v316: was /
    if (!keys.clientId || !keys.clientSecret) {
      // return res.redirect('/sales?ebay=error&msg=' + encodeURIComponent('Add your eBay Client ID and Client Secret in Listing Tool settings first'));
      return res.redirect('/sales?ebay=error&msg=' + encodeURIComponent('Add your eBay Client ID and Client Secret in Settings → Account first'));   // v326
    }
    const state = crypto.randomBytes(24).toString('base64url');
    oauthStates.set(state, { userId: req.user.id, expires: Date.now() + 10 * 60 * 1000 });
    const url = EBAY_AUTH_HOST + '/oauth2/authorize?' + new URLSearchParams({
      client_id: keys.clientId,
      redirect_uri: conn.runame,
      response_type: 'code',
      scope: SALES_SCOPES,
      state,
      prompt: 'login'
    }).toString();
    res.redirect(url);
  } catch (e) {
    console.error('[ebay connect]', e);
    res.redirect('/sales?ebay=error&msg=' + encodeURIComponent('Could not start the eBay connection'));   // v316: was /
  }
});

// eBay sends you back here after you click "allow" (this is the
// "auth accepted URL" registered in your eBay developer account)
app.get(CALLBACK_PATH, async (req, res) => {
  const fail = (msg) => res.redirect('/sales?ebay=error&msg=' + encodeURIComponent(msg));   // v316: was /
  const { code, state, error } = req.query;
  // if (error) return fail('eBay said: ' + String(error));
  if (error === 'invalid_scope') {   // v306
    // return fail('eBay refused one of the permissions. Your app keyset may not have Fees or Seller Metrics enabled — check OAuth Scopes in your eBay developer account. Your existing connection still works.');
    return fail('eBay refused one of the permissions the app asked for. Your eBay developer keyset may not have it turned on — check "OAuth Scopes" for your Production keyset in your eBay developer account. Your existing connection still works.');   // v322
  }
  if (error) return fail('eBay said: ' + String(error));
  const st = oauthStates.get(String(state || ''));
  if (!st || st.expires < Date.now()) return fail('That eBay sign-in link expired — click Connect eBay again');
  oauthStates.delete(String(state));
  if (!code) return fail('eBay did not send an authorization code');
  try {
    const conn = await getConnection(st.userId);
    const keys = await getEbayKeys(st.userId);
    const d = await ebayToken(keys, { grant_type: 'authorization_code', code: String(code), redirect_uri: conn.runame });
    if (!d.refresh_token) throw new Error('eBay did not return a refresh token');
    await pool.query(
      `UPDATE ebay_connections SET refresh_enc = $2, refresh_expires = $3, connected_at = now(),
         last_sync = NULL, last_error = NULL, history_from = NULL, scopes = $4,
         fees_sync = NULL, fees_error = NULL
       WHERE user_id = $1`,
      [st.userId, encrypt(d.refresh_token), new Date(Date.now() + (d.refresh_token_expires_in || 47304000) * 1000), SALES_SCOPES]   // v306: + scopes
    );
    accessTokens.set(st.userId, { token: d.access_token, expires: Date.now() + Math.max(60, (d.expires_in || 7200) - 300) * 1000 });
    syncOrders(st.userId);                 // start importing in the background
    res.redirect('/sales?ebay=connected');   // v316: was /
  } catch (e) {
    console.error('[ebay callback]', e.message);
    fail('eBay connection failed: ' + e.message);
  }
});

app.post('/api/ebay/sync', requireUser, requireAdmin, async (req, res) => {
  const conn = await getConnection(req.user.id);
  if (!conn || !conn.refresh_enc) return res.status(400).json({ error: 'eBay is not connected' });
  syncOrders(req.user.id);
  res.json({ ok: true, syncing: true });
});

app.post('/api/ebay/disconnect', requireUser, requireAdmin, async (req, res) => {
  accessTokens.delete(req.user.id);
  await pool.query(
    `UPDATE ebay_connections SET refresh_enc = NULL, refresh_expires = NULL, connected_at = NULL,
       last_sync = NULL, last_error = NULL, history_from = NULL, scopes = NULL,
       fees_sync = NULL, fees_error = NULL WHERE user_id = $1`,
    [req.user.id]
  );
  await pool.query('DELETE FROM ebay_orders WHERE user_id = $1', [req.user.id]);
  await pool.query('DELETE FROM ebay_order_items WHERE user_id = $1', [req.user.id]);   // v319
  await pool.query('DELETE FROM ebay_items WHERE user_id = $1', [req.user.id]);         // v320
  await pool.query('DELETE FROM ebay_fee_lines WHERE user_id = $1', [req.user.id]);   // v307
  res.json({ ok: true });
});

// Daily sales totals for the dashboard, bucketed in YOUR time zone
function safeTimeZone(tz) {
  try { new Intl.DateTimeFormat('en-US', { timeZone: tz }); return tz; } catch (e) { return 'UTC'; }
}

app.get('/api/sales', requireUser, async (req, res) => {
  try {
    const conn = await getConnection(req.user.id);
    if (!conn || !conn.refresh_enc) return res.json({ connected: false });
    const tz = safeTimeZone(String(req.query.tz || 'UTC'));
    const r = await pool.query(
      `SELECT to_char((created_at AT TIME ZONE $2)::date, 'YYYY-MM-DD') AS day,
              -- v312: refunds come off the order the way eBay does. With tax on,
              -- that's exactly total + tax - refunded; the refund is split between
              -- sales and tax in proportion so the tax-off number stays sensible.
              -- COALESCE(SUM(CASE WHEN total + tax > 0 THEN total - refunded * total / (total + tax) ELSE 0 END) FILTER (WHERE counted), 0)::float AS sales,
              -- COALESCE(SUM(CASE WHEN total + tax > 0 THEN tax - refunded * tax / (total + tax) ELSE 0 END) FILTER (WHERE counted), 0)::float AS tax
              -- v314: refund comes off sales; the tax eBay gave back comes off tax.
              COALESCE(SUM(total - refunded) FILTER (WHERE counted), 0)::float AS sales,
              (COUNT(*) FILTER (WHERE counted))::int AS orders,
              COALESCE(SUM(tax - refunded_tax) FILTER (WHERE counted), 0)::float AS tax
         FROM ebay_orders
        WHERE user_id = $1 AND created_at > now() - interval '740 days'
        GROUP BY 1 ORDER BY 1`,
      [req.user.id, tz]
    );
    const stale = !conn.last_sync || (Date.now() - new Date(conn.last_sync).getTime()) > AUTO_SYNC_MINUTES * 60000;
    // if (stale && !syncing.has(req.user.id) && !conn.last_error) syncOrders(req.user.id);
    const feesNeeded = hasScope(conn, FIN_SCOPE) && !conn.fees_sync && !conn.fees_error;   // v307
    // const taxNeeded = (conn.orders_v || 0) < 3;   // v309/v312: one-time re-import for tax + refunds
    // const taxNeeded = (conn.orders_v || 0) < 5;   // v314: re-import right away for tax on refunds
    const taxNeeded = (conn.orders_v || 0) < 6;   // v319: re-import right away for order items
    if ((stale || feesNeeded || taxNeeded) && !syncing.has(req.user.id) && !conn.last_error) syncOrders(req.user.id);
    let historyFrom = null;
    if (conn.history_from) {
      const h = await pool.query(`SELECT to_char(($1::timestamptz AT TIME ZONE $2)::date, 'YYYY-MM-DD') AS d`, [conn.history_from, tz]);
      historyFrom = h.rows[0].d;
    }
    res.json({
      connected: true,
      syncing: syncing.has(req.user.id),
      lastSync: conn.last_sync,
      lastError: conn.last_error || null,
      historyFrom,
      taxReady: (conn.orders_v || 0) >= 3,   // v309, v312: refunds imported too
      days: r.rows.map(x => [x.day, Math.round(x.sales * 100) / 100, x.orders, Math.round(x.tax * 100) / 100])
    });
  } catch (e) {
    console.error('[sales]', e);
    res.status(500).json({ error: 'Could not load sales' });
  }
});

// Remember the dashboard's date range on your account (any computer)
app.post('/api/prefs', requireUser, express.json(), async (req, res) => {
  // v309: either setting can be saved on its own
  const b = req.body || {};
  if (b.dashRange !== undefined) {
    const range = String(b.dashRange);
    // if (!['today', 'week', '31', '90', 'year'].includes(range)) return res.status(400).json({ error: 'Bad range' });
    // v315: + this month, last month, one month (m:2026-09), custom dates (c:2026-09-01:2026-09-30)
    if (!/^(today|week|31|90|year|thismonth|lastmonth|m:\d{4}-\d{2}|c:\d{4}-\d{2}-\d{2}:\d{4}-\d{2}-\d{2})$/.test(range)) return res.status(400).json({ error: 'Bad range' });
    await pool.query('UPDATE users SET dash_range = $2 WHERE id = $1', [req.user.id, range]);
  }
  if (b.dashTax !== undefined) await pool.query('UPDATE users SET dash_tax = $2 WHERE id = $1', [req.user.id, !!b.dashTax]);
  res.json({ ok: true });
});

// ─── v307: EBAY FEES ─────────────────────────────────────────────────────────
// Imports your eBay fees from the Finances API (needs the "Fees, payouts &
// sales tax" permission). Each fee is stored as a cost: positive = eBay charged
// you, negative = eBay credited it back (e.g. on a refund).
//
// • SALE      → that order's fees (final value fee, per-order fee, penalties…)
// • REFUND    → fees eBay credited back on the refund
// • NON_SALE_CHARGE → ad fees, store subscription, and other account charges
// The penalty box adds up only eBay's two penalty fee types.
const EBAY_FIN_HOST = env('EBAY_FIN_HOST') || 'https://apiz.ebay.com';   // override for testing only
const FIN_SCOPE = 'https://api.ebay.com/oauth/api_scope/sell.finances';
const PENALTY_FEES = [
  'BELOW_STANDARD_FEE',                        // Below Standard seller surcharge
  'BELOW_STANDARD_SHIPPING_FEE',
  'HIGH_ITEM_NOT_AS_DESCRIBED_FEE',            // too many "not as described" returns
  'HIGH_ITEM_NOT_AS_DESCRIBED_SHIPPING_FEE'
];
const hasScope = (conn, scope) => !!(conn && conn.refresh_enc) && grantedScopes(conn).split(' ').includes(scope);

// One eBay transaction → its fee lines
function feeLines(t) {
  const lines = [];
  const type = t.transactionType;
  if (type === 'SALE' || type === 'REFUND') {
    const sign = type === 'SALE' ? 1 : -1;
    let listed = 0;
    for (const li of t.orderLineItems || []) {
      for (const f of li.marketplaceFees || []) {
        const a = money(f.amount);
        if (a === null || a === 0) continue;
        lines.push({ feeType: String(f.feeType || 'OTHER_FEES'), cost: sign * Math.abs(a) });
        listed += Math.abs(a);
      }
    }
    // eBay's own total for the transaction wins — anything not itemized is "other"
    const total = money(t.totalFeeAmount);
    if (total !== null && Math.abs(total) - listed > 0.004) {
      lines.push({ feeType: 'OTHER_FEES', cost: sign * (Math.abs(total) - listed) });
    }
  } else if (type === 'NON_SALE_CHARGE') {
    const a = money(t.amount);
    if (a !== null && a !== 0) lines.push({ feeType: String(t.feeType || 'OTHER_FEES'), cost: (t.bookingEntry === 'CREDIT' ? -1 : 1) * Math.abs(a) });
  }
  return lines.map(l => ({ ...l, cost: Math.round(l.cost * 100) / 100 }));
}

async function saveFeeTransactions(userId, transactions) {
  const keys = [];
  const rows = [];
  for (const t of transactions) {
    if (!t.transactionId || !t.transactionDate) continue;
    const key = t.transactionType + ':' + t.transactionId;
    keys.push(key);
    feeLines(t).forEach((l, i) => rows.push([userId, key, i, t.transactionDate, l.feeType, l.cost]));
  }
  if (!keys.length) return;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM ebay_fee_lines WHERE user_id = $1 AND tx_key = ANY($2)', [userId, keys]);
    for (let i = 0; i < rows.length; i += 500) {
      const chunk = rows.slice(i, i + 500);
      const values = chunk.map((_, j) => `($${j * 6 + 1},$${j * 6 + 2},$${j * 6 + 3},$${j * 6 + 4},$${j * 6 + 5},$${j * 6 + 6})`);
      await client.query(
        `INSERT INTO ebay_fee_lines (user_id, tx_key, line_no, tx_date, fee_type, cost) VALUES ${values.join(',')}`,
        chunk.flat()
      );
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {});
    throw e;
  } finally {
    client.release();
  }
}

// First run pulls about two years (in 90-day pieces); later runs re-pull the
// last week so late adjustments are caught.
async function syncFees(userId) {
  const conn = await getConnection(userId);
  if (!hasScope(conn, FIN_SCOPE)) return;
  const started = new Date();
  try {
    let token = await getAccessToken(userId);
    const from = conn.fees_sync
      ? new Date(new Date(conn.fees_sync).getTime() - 7 * 86400000)
      : new Date(started.getTime() - HISTORY_DAYS * 86400000);
    for (let winStart = from; winStart < started; ) {
      const winEnd = new Date(Math.min(started.getTime(), winStart.getTime() + 90 * 86400000));
      const filter = `transactionDate:[${winStart.toISOString()}..${winEnd.toISOString()}]`;
      let offset = 0, total = Infinity, pages = 0, retried = false;
      while (offset < total && pages < 50) {
        const url = `${EBAY_FIN_HOST}/sell/finances/v1/transaction?filter=${encodeURIComponent(filter)}&limit=1000&offset=${offset}`;
        const r = await fetch(url, {
          headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json', 'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US' },
          signal: AbortSignal.timeout(45000)
        });
        if (r.status === 204) break;                     // nothing in this window
        if (r.status === 401 && !retried) {
          accessTokens.delete(userId);
          token = await getAccessToken(userId);
          retried = true;
          continue;
        }
        if (!r.ok) {
          const t = await r.text().catch(() => '');
          let msg = t.slice(0, 200);
          try { const j = JSON.parse(t); msg = (j.errors || []).map(e => e.longMessage || e.message).join('; ') || msg; } catch (e) { /* keep text */ }
          throw new Error('eBay fees request failed (' + r.status + '): ' + msg);
        }
        const d = await r.json();
        const list = d.transactions || [];
        await saveFeeTransactions(userId, list);
        total = Number.isFinite(d.total) ? d.total : 0;
        offset += list.length;
        pages++;
        if (!list.length) break;
      }
      winStart = winEnd;
    }
    await pool.query('UPDATE ebay_connections SET fees_sync = $2, fees_error = NULL WHERE user_id = $1', [userId, started]);
  } catch (e) {
    console.error('[ebay fees]', e.message);
    await pool.query('UPDATE ebay_connections SET fees_error = $2 WHERE user_id = $1', [userId, String(e.message).slice(0, 500)]).catch(() => {});
  }
}

// v308: FEE CHECK — every fee type for exact dates, to line up against an
// eBay report. Also counts orders vs. sales with fees, to spot missing ones.
function isoDate(x) { return /^\d{4}-\d{2}-\d{2}$/.test(String(x || '')) ? String(x) : null; }

// v313: LOOK UP ONE ORDER — asks eBay for one order right now and shows only
// the money parts (no buyer name, address or email), plus what this app counts.
app.get('/api/orders/raw', requireUser, requireAdmin, async (req, res) => {
  try {
    const id = String(req.query.id || '').trim();
    if (!/^[0-9A-Za-z-]{5,40}$/.test(id)) return res.status(400).json({ error: 'Enter an order number like 09-15200-23105' });
    const token = await getAccessToken(req.user.id);
    const r = await fetch(`${EBAY_API_HOST}/sell/fulfillment/v1/order/${encodeURIComponent(id)}`, {
      headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' },
      signal: AbortSignal.timeout(30000)
    });
    const t = await r.text();
    if (!r.ok) return res.status(502).json({ error: 'eBay said (' + r.status + '): ' + t.slice(0, 300) });
    const o = JSON.parse(t);
    const p = o.paymentSummary || {};
    res.json({
      orderId: o.orderId,
      creationDate: o.creationDate,
      orderPaymentStatus: o.orderPaymentStatus,
      cancelStatus: o.cancelStatus && o.cancelStatus.cancelState,
      pricingSummary: o.pricingSummary,
      payments: (p.payments || []).map(x => ({ amount: x.amount, paymentStatus: x.paymentStatus, paymentDate: x.paymentDate })),
      refunds: p.refunds || [],
      totalDueSeller: p.totalDueSeller,
      lineItems: (o.lineItems || []).map(li => ({
        lineItemId: li.lineItemId, sku: li.sku, quantity: li.quantity,
        lineItemCost: li.lineItemCost, deliveryCost: li.deliveryCost, total: li.total,
        ebayCollectAndRemitTaxes: li.ebayCollectAndRemitTaxes, taxes: li.taxes,
        refunds: li.refunds || []
      })),
      thisAppCounts: mapOrder(o)
    });
  } catch (e) {
    console.error('[order lookup]', e);
    res.status(500).json({ error: e.message || 'Could not look up that order' });
  }
});

// v312: ORDERS DOWNLOAD — one row per order, to line up against eBay's
// "All orders" report. Dates are in the time zone the page asks for.
app.get('/api/orders/export', requireUser, requireAdmin, async (req, res) => {
  try {
    const from = isoDate(req.query.from), to = isoDate(req.query.to);
    if (!from || !to || from > to) return res.status(400).send('Pick a start and end date');
    const tz = safeTimeZone(String(req.query.tz || 'UTC'));
    const r = await pool.query(
      `SELECT order_id, to_char(created_at AT TIME ZONE $2, 'YYYY-MM-DD HH24:MI') AS sold_at,
              total::float, tax::float, refunded::float, refunded_tax::float, counted, status
         FROM ebay_orders
        WHERE user_id = $1 AND (created_at AT TIME ZONE $2)::date BETWEEN $3::date AND $4::date
        ORDER BY created_at`,
      [req.user.id, tz, from, to]
    );
    const f = (n) => (Math.round(n * 100) / 100).toFixed(2);
    const lines = ['Order Number,Sold (' + tz + '),Items + Shipping,Tax,Refunded,Tax Refunded,Counted,Total like eBay,Status'];   // v314: + Tax Refunded
    for (const x of r.rows) {
      const ebayTotal = x.counted ? x.total + x.tax - x.refunded - x.refunded_tax : 0;   // v314: - refunded_tax
      lines.push([x.order_id, x.sold_at, f(x.total), f(x.tax), f(x.refunded), f(x.refunded_tax), x.counted ? 'Yes' : 'No', f(ebayTotal), '"' + String(x.status || '').replace(/"/g, '') + '"'].join(','));
    }
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="partslister-orders-${from}-to-${to}.csv"`);
    res.send(lines.join('\n') + '\n');
  } catch (e) {
    console.error('[orders export]', e);
    res.status(500).send('Could not build the download');
  }
});

app.get('/api/fees/breakdown', requireUser, requireAdmin, async (req, res) => {
  try {
    const from = isoDate(req.query.from), to = isoDate(req.query.to);
    if (!from || !to || from > to) return res.status(400).json({ error: 'Pick a start and end date' });
    const tz = safeTimeZone(String(req.query.tz || 'UTC'));
    const conn = await getConnection(req.user.id);
    if (!hasScope(conn, FIN_SCOPE) || !conn.fees_sync) return res.json({ available: false });
    const range = `(tx_date AT TIME ZONE $2)::date BETWEEN $3::date AND $4::date`;
    const types = await pool.query(
      `SELECT fee_type,
              COALESCE(SUM(cost) FILTER (WHERE cost > 0), 0)::float AS charged,
              COALESCE(-SUM(cost) FILTER (WHERE cost < 0), 0)::float AS credited,
              COUNT(*)::int AS entries
         FROM ebay_fee_lines WHERE user_id = $1 AND ${range}
        GROUP BY fee_type ORDER BY charged DESC`,
      [req.user.id, tz, from, to]
    );
    const tx = await pool.query(
      `SELECT split_part(tx_key, ':', 1) AS kind, COUNT(DISTINCT tx_key)::int AS n
         FROM ebay_fee_lines WHERE user_id = $1 AND ${range}
        GROUP BY 1 ORDER BY 1`,
      [req.user.id, tz, from, to]
    );
    const orders = await pool.query(
      `SELECT COUNT(*) FILTER (WHERE counted)::int AS sold, COUNT(*)::int AS all_orders,
              COALESCE(SUM(item_count) FILTER (WHERE counted), 0)::int AS items
         FROM ebay_orders WHERE user_id = $1 AND (created_at AT TIME ZONE $2)::date BETWEEN $3::date AND $4::date`,
      [req.user.id, tz, from, to]
    );
    const r2 = (x) => Math.round(x * 100) / 100;
    res.json({
      available: true, from, to, tz,
      feeTypes: types.rows.map(x => ({ feeType: x.fee_type, charged: r2(x.charged), credited: r2(x.credited), entries: x.entries })),
      transactions: Object.fromEntries(tx.rows.map(x => [x.kind, x.n])),
      orders: orders.rows[0],
      lastSync: conn.fees_sync
    });
  } catch (e) {
    console.error('[fees breakdown]', e);
    res.status(500).json({ error: 'Could not build the fee check' });
  }
});

// Daily fee totals for the dashboard, in YOUR time zone
app.get('/api/fees', requireUser, async (req, res) => {
  try {
    const conn = await getConnection(req.user.id);
    if (!conn || !conn.refresh_enc) return res.json({ available: false, reason: 'not_connected' });
    if (!hasScope(conn, FIN_SCOPE)) return res.json({ available: false, reason: 'not_approved' });
    if (!conn.fees_sync) {
      return res.json({ available: false, reason: conn.fees_error ? 'error' : 'importing', error: conn.fees_error || null });
    }
    const tz = safeTimeZone(String(req.query.tz || 'UTC'));
    const r = await pool.query(
      `SELECT to_char((tx_date AT TIME ZONE $2)::date, 'YYYY-MM-DD') AS day,
              COALESCE(SUM(cost), 0)::float AS fees,
              COALESCE(SUM(cost) FILTER (WHERE fee_type = ANY($3)), 0)::float AS penalty
         FROM ebay_fee_lines
        WHERE user_id = $1 AND tx_date > now() - interval '740 days'
        GROUP BY 1 ORDER BY 1`,
      [req.user.id, tz, PENALTY_FEES]
    );
    res.json({
      available: true,
      lastSync: conn.fees_sync,
      error: conn.fees_error || null,
      days: r.rows.map(x => [x.day, Math.round(x.fees * 100) / 100, Math.round(x.penalty * 100) / 100])
    });
  } catch (e) {
    console.error('[fees]', e);
    res.status(500).json({ error: 'Could not load fees' });
  }
});

// ─── v319: ORDERS PAGE ───────────────────────────────────────────────────────
// Your sold orders with what was in them, newest first. Days are in the time
// zone the page asks for (eBay's Pacific time).
app.get('/api/orders/list', requireUser, async (req, res) => {
  try {
    const conn = await getConnection(req.user.id);
    if (!conn || !conn.refresh_enc) return res.json({ connected: false });
    const days = Math.max(1, Math.min(730, parseInt(req.query.days, 10) || 31));
    const tz = safeTimeZone(String(req.query.tz || 'UTC'));
    if ((conn.orders_v || 0) < 6 && !syncing.has(req.user.id) && !conn.last_error) syncOrders(req.user.id);
    const r = await pool.query(
      `SELECT o.order_id, o.created_at, to_char(o.created_at AT TIME ZONE $2, 'YYYY-MM-DD HH24:MI') AS sold_local,
              o.total::float, o.tax::float, o.refunded::float, o.refunded_tax::float, o.counted, o.status, o.ship_status,
              COALESCE(json_agg(json_build_object('itemId', i.item_id, 'sku', i.sku, 'title', i.title, 'qty', i.qty, 'price', i.price::float)
                         ORDER BY i.line_item_id) FILTER (WHERE i.line_item_id IS NOT NULL), '[]') AS items
         FROM ebay_orders o
         LEFT JOIN ebay_order_items i ON i.user_id = o.user_id AND i.order_id = o.order_id
        WHERE o.user_id = $1 AND (o.created_at AT TIME ZONE $2)::date > (now() AT TIME ZONE $2)::date - $3::int
        GROUP BY o.order_id, o.created_at, o.total, o.tax, o.refunded, o.refunded_tax, o.counted, o.status, o.ship_status
        ORDER BY o.created_at DESC
        LIMIT 3000`,
      [req.user.id, tz, days]
    );
    res.json({
      connected: true,
      ready: (conn.orders_v || 0) >= 6,
      syncing: syncing.has(req.user.id),
      lastSync: conn.last_sync,
      lastError: conn.last_error || null,
      orders: r.rows.map(x => ({
        id: x.order_id, sold: x.sold_local, counted: x.counted, status: x.status || '', ship: x.ship_status || null,
        total: x.counted ? Math.round((x.total + x.tax - x.refunded - x.refunded_tax) * 100) / 100 : 0,
        refunded: Math.round((x.refunded + x.refunded_tax) * 100) / 100,
        items: x.items
      }))
    });
  } catch (e) {
    console.error('[orders list]', e);
    res.status(500).json({ error: 'Could not load orders' });
  }
});

// ─── v320: ITEM PHOTOS + LISTING DETAILS ────────────────────────────────────
// One Trading API GetItem per item, saved in ebay_items so eBay is asked once.
// If eBay can't give an item (e.g. a very old listing), that's remembered for a
// day before trying again.
const xmlDecode = (t) => String(t || '')
  .replace(/^<!\[CDATA\[([\s\S]*)\]\]>$/, '$1')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#(\d+);/g, (m, n) => String.fromCharCode(+n)).replace(/&amp;/g, '&');
const xmlAll = (xml, tag) => (String(xml || '').match(new RegExp('<' + tag + '(?:\\s[^>]*)?>[\\s\\S]*?</' + tag + '>', 'g')) || [])
  .map(x => x.replace(new RegExp('^<' + tag + '(?:\\s[^>]*)?>'), '').replace(new RegExp('</' + tag + '>$'), ''));

async function tradingCall(userId, callName, inner) {
  const token = await getAccessToken(userId);
  const r = await fetch('https://api.ebay.com/ws/api.dll', {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml',
      'X-EBAY-API-CALL-NAME': callName,
      'X-EBAY-API-SITEID': '0',
      'X-EBAY-API-COMPATIBILITY-LEVEL': '1193',
      'X-EBAY-API-IAF-TOKEN': token
    },
    body: `<?xml version="1.0" encoding="utf-8"?>\n<${callName}Request xmlns="urn:ebay:apis:eBLBaseComponents">${inner}</${callName}Request>`,
    signal: AbortSignal.timeout(30000)
  });
  const xml = await r.text();
  if (!r.ok || xmlTag(xml, 'Ack') === 'Failure') {
    const msg = xmlTag(xml, 'LongMessage') || xmlTag(xml, 'ShortMessage') || ('HTTP ' + r.status);
    throw new Error(xmlDecode(msg).replace(/<[^>]+>/g, '').slice(0, 300));
  }
  return xml;
}

async function fetchItem(userId, itemId) {
  try {
    const xml = await tradingCall(userId, 'GetItem',
      `<ItemID>${itemId}</ItemID><DetailLevel>ReturnAll</DetailLevel><IncludeItemSpecifics>true</IncludeItemSpecifics>`);
    const item = xmlTag(xml, 'Item') || '';
    const pics = xmlAll(xmlTag(item, 'PictureDetails') || '', 'PictureURL').map(xmlDecode).filter(u => /^https:\/\//.test(u));
    const specifics = xmlAll(xmlTag(item, 'ItemSpecifics') || '', 'NameValueList').map(nv => ({
      name: xmlDecode(xmlTag(nv, 'Name')),
      value: xmlAll(nv, 'Value').map(xmlDecode).join(', ')
    })).filter(x => x.name);
    const ld = xmlTag(item, 'ListingDetails') || '';
    const data = {
      itemId: String(itemId),
      title: xmlDecode(xmlTag(item, 'Title')),
      sku: xmlDecode(xmlTag(item, 'SKU')) || null,
      pictures: pics,
      description: xmlDecode(xmlTag(item, 'Description')),
      condition: xmlDecode(xmlTag(item, 'ConditionDisplayName')) || null,
      conditionNote: xmlDecode(xmlTag(item, 'ConditionDescription')) || null,
      category: xmlDecode(xmlTag(xmlTag(item, 'PrimaryCategory') || '', 'CategoryName')) || null,
      price: parseFloat(xmlTag(xmlTag(item, 'SellingStatus') || '', 'CurrentPrice') || '') || null,
      listingStatus: xmlTag(xmlTag(item, 'SellingStatus') || '', 'ListingStatus') || null,
      started: xmlTag(ld, 'StartTime') || null,
      ended: xmlTag(ld, 'EndTime') || null,
      url: xmlDecode(xmlTag(ld, 'ViewItemURL')) || ('https://www.ebay.com/itm/' + itemId),
      specifics
    };
    await pool.query(
      `INSERT INTO ebay_items (user_id, item_id, data, error, fetched_at) VALUES ($1, $2, $3, NULL, now())
       ON CONFLICT (user_id, item_id) DO UPDATE SET data = EXCLUDED.data, error = NULL, fetched_at = now()`,
      [userId, String(itemId), JSON.stringify(data)]
    );
    return { data };
  } catch (e) {
    const error = String(e.message || e).slice(0, 300);
    await pool.query(
      `INSERT INTO ebay_items (user_id, item_id, data, error, fetched_at) VALUES ($1, $2, NULL, $3, now())
       ON CONFLICT (user_id, item_id) DO UPDATE SET error = EXCLUDED.error, fetched_at = now()`,
      [userId, String(itemId), error]
    ).catch(() => {});
    return { error };
  }
}

// Saved copy, or ask eBay (again after a day if eBay couldn't give it last time)
async function getItemData(userId, itemId) {
  const r = await pool.query('SELECT data, error, fetched_at FROM ebay_items WHERE user_id = $1 AND item_id = $2', [userId, itemId]);
  const row = r.rows[0];
  if (row && row.data) return { data: row.data };
  if (row && row.error && Date.now() - new Date(row.fetched_at).getTime() < 86400000) return { error: row.error };
  return fetchItem(userId, itemId);
}

const smallPic = (u) => (u ? u.replace(/\/s-l\d+\.(jpg|jpeg|png|webp)/i, '/s-l225.$1').replace(/\$_\d+\.(JPG|JPEG|PNG)/i, '$_35.$1') : null);

// First photo of up to 40 items: { "376490833387": "https://i.ebayimg.com/…", … }
app.get('/api/items/thumbs', requireUser, async (req, res) => {
  try {
    const ids = [...new Set(String(req.query.ids || '').split(',').map(s => s.trim()).filter(s => /^\d{6,20}$/.test(s)))].slice(0, 40);
    const out = {};
    let i = 0;
    async function worker() {
      while (i < ids.length) {
        const id = ids[i++];
        const r = await getItemData(req.user.id, id);
        out[id] = r.data && r.data.pictures && r.data.pictures[0] ? smallPic(r.data.pictures[0]) : null;
      }
    }
    await Promise.all([worker(), worker(), worker(), worker()]);
    res.json({ thumbs: out });
  } catch (e) {
    console.error('[thumbs]', e);
    res.status(500).json({ error: 'Could not load photos' });
  }
});

// Everything about one item, for the order detail view
app.get('/api/items/:id', requireUser, async (req, res) => {
  const id = String(req.params.id || '');
  if (!/^\d{6,20}$/.test(id)) return res.status(400).json({ error: 'Bad item number' });
  try {
    const r = await getItemData(req.user.id, id);
    if (r.error) return res.json({ error: r.error });
    res.json({ item: r.data });
  } catch (e) {
    console.error('[item]', e);
    res.status(500).json({ error: 'Could not load that item' });
  }
});

// ─── v321: MESSAGES ──────────────────────────────────────────────────────────
// Read live from eBay every time — nothing about your messages is saved here.
const xmlEsc = (t) => String(t || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const isMsgId = (s) => /^[0-9]{3,20}$/.test(String(s || ''));

function mapMessage(m) {
  const flag = (t) => xmlTag(m, t) === 'true';
  return {
    id: xmlTag(m, 'MessageID'),
    externalId: xmlTag(m, 'ExternalMessageID') || null,
    from: xmlDecode(xmlTag(m, 'Sender')) || null,
    to: xmlDecode(xmlTag(m, 'RecipientUserID') || xmlTag(m, 'SendToName')) || null,
    subject: xmlDecode(xmlTag(m, 'Subject')) || '(no subject)',
    date: xmlTag(m, 'ReceiveDate') || null,
    itemId: xmlTag(m, 'ItemID') || null,
    itemTitle: xmlDecode(xmlTag(m, 'ItemTitle')) || null,
    type: xmlTag(m, 'MessageType') || null,
    read: flag('Read'),
    replied: flag('Replied'),
    flagged: flag('Flagged'),
    canReply: xmlTag(xmlTag(m, 'ResponseDetails') || '', 'ResponseEnabled') === 'true',
    replyUrl: xmlDecode(xmlTag(xmlTag(m, 'ResponseDetails') || '', 'ResponseURL')) || null
  };
}

// List: ?folder=inbox|sent&days=30
app.get('/api/messages', requireUser, async (req, res) => {
  try {
    const conn = await getConnection(req.user.id);
    if (!conn || !conn.refresh_enc) return res.json({ connected: false });
    const folder = req.query.folder === 'sent' ? 1 : 0;
    const days = Math.max(1, Math.min(365, parseInt(req.query.days, 10) || 30));
    const end = new Date(), start = new Date(end.getTime() - days * 86400000);
    const out = [];
    for (let page = 1; page <= 5; page++) {
      const xml = await tradingCall(req.user.id, 'GetMyMessages',
        `<DetailLevel>ReturnHeaders</DetailLevel><FolderID>${folder}</FolderID>` +
        `<StartTime>${start.toISOString()}</StartTime><EndTime>${end.toISOString()}</EndTime>` +
        `<Pagination><EntriesPerPage>200</EntriesPerPage><PageNumber>${page}</PageNumber></Pagination>`);
      const msgs = xmlAll(xmlTag(xml, 'Messages') || '', 'Message').map(mapMessage).filter(m => m.id);
      out.push(...msgs);
      const pages = parseInt(xmlTag(xmlTag(xml, 'PaginationResult') || '', 'TotalNumberOfPages') || '1', 10) || 1;
      if (page >= pages || !msgs.length) break;
    }
    out.sort((a, b) => String(b.date).localeCompare(String(a.date)));
    res.json({ connected: true, messages: out });
  } catch (e) {
    console.error('[messages]', e.message);
    res.json({ connected: true, error: 'eBay didn\u2019t give us your messages: ' + e.message, messages: [] });
  }
});

// Unread count for Home (asked at most every 2 minutes)
const msgCounts = new Map();
app.get('/api/messages/summary', requireUser, async (req, res) => {
  try {
    const conn = await getConnection(req.user.id);
    if (!conn || !conn.refresh_enc) return res.json({ connected: false });
    const c = msgCounts.get(req.user.id);
    if (c && Date.now() - c.at < 120000) return res.json(c.data);
    const xml = await tradingCall(req.user.id, 'GetMyMessages', '<DetailLevel>ReturnSummary</DetailLevel>');
    const sum = xmlTag(xml, 'Summary') || '';
    const data = { connected: true, unread: parseInt(xmlTag(sum, 'NewMessageCount') || '0', 10) || 0 };
    msgCounts.set(req.user.id, { at: Date.now(), data });
    res.json(data);
  } catch (e) {
    console.error('[messages summary]', e.message);
    res.json({ connected: true, unread: null, error: e.message });
  }
});

// One message, in full. Opening it marks it read on eBay too.
app.get('/api/messages/:id', requireUser, async (req, res) => {
  const id = String(req.params.id || '');
  if (!isMsgId(id)) return res.status(400).json({ error: 'Bad message number' });
  try {
    const xml = await tradingCall(req.user.id, 'GetMyMessages',
      `<DetailLevel>ReturnMessages</DetailLevel><MessageIDs><MessageID>${id}</MessageID></MessageIDs>`);
    const m = xmlAll(xmlTag(xml, 'Messages') || '', 'Message')[0];
    if (!m) return res.json({ error: 'eBay couldn\u2019t find that message.' });
    const msg = mapMessage(m);
    msg.html = xmlDecode(xmlTag(m, 'Text')) || null;
    msg.text = xmlDecode(xmlTag(m, 'Content')) || null;
    if (!msg.read) {
      tradingCall(req.user.id, 'ReviseMyMessages', `<MessageIDs><MessageID>${id}</MessageID></MessageIDs><Read>true</Read>`)
        .then(() => msgCounts.delete(req.user.id))
        .catch(e => console.error('[mark read]', e.message));
    }
    res.json({ message: msg });
  } catch (e) {
    console.error('[message]', e.message);
    res.json({ error: 'eBay didn\u2019t give us that message: ' + e.message });
  }
});

// Reply to a buyer's question about an item. eBay sends it as a normal eBay message.
app.post('/api/messages/:id/reply', requireUser, express.json(), async (req, res) => {
  const b = req.body || {};
  const text = String(b.text || '').trim();
  const itemId = String(b.itemId || ''), parent = String(b.externalId || ''), to = String(b.to || '');
  if (!text) return res.status(400).json({ error: 'Type a reply first.' });
  if (text.length > 2000) return res.status(400).json({ error: 'eBay allows up to 2,000 characters.' });
  if (!/^\d{6,20}$/.test(itemId) || !isMsgId(parent) || !/^[^<>&\s]{1,64}$/.test(to)) {
    return res.status(400).json({ error: 'This message can\u2019t be answered from here — reply on eBay.' });
  }
  try {
    await tradingCall(req.user.id, 'AddMemberMessageRTQ',
      `<ItemID>${itemId}</ItemID><MemberMessage><Body>${xmlEsc(text)}</Body><DisplayToPublic>false</DisplayToPublic>` +
      `<EmailCopyToSender>true</EmailCopyToSender><ParentMessageID>${parent}</ParentMessageID><RecipientID>${xmlEsc(to)}</RecipientID></MemberMessage>`);
    res.json({ ok: true });
  } catch (e) {
    console.error('[reply]', e.message);
    res.status(502).json({ error: 'eBay didn\u2019t accept the reply: ' + e.message });
  }
});

// ─── v322: MESSAGE THREADS (eBay Message API) ───────────────────────────────
// Read live from eBay — nothing is saved here. Needs the commerce.message permission.
const MSG_SCOPE = 'https://api.ebay.com/oauth/api_scope/commerce.message';
const INV_SCOPE = 'https://api.ebay.com/oauth/api_scope/sell.inventory';

// A call to one of eBay's newer (REST) APIs → { status, data }
async function restCall(userId, method, path, body, headers) {
  const token = await getAccessToken(userId);
  const r = await fetch(EBAY_API_HOST + path, {
    method,
    headers: Object.assign({ 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' },
      body ? { 'Content-Type': 'application/json' } : {}, headers || {}),
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(30000)
  });
  if (r.status === 204) return { status: 204, data: null };
  const t = await r.text();
  let d = null; try { d = t ? JSON.parse(t) : null; } catch (e) { /* not JSON */ }
  if (!r.ok) {
    const msg = (d && d.errors && d.errors.map(e => e.longMessage || e.message).join('; ')) || t.slice(0, 200) || ('HTTP ' + r.status);
    const err = new Error(msg); err.status = r.status; throw err;
  }
  return { status: r.status, data: d };
}

// Your own eBay user ID (so we know which side of a thread is you)
const myUserIds = new Map();
async function myEbayUser(userId) {
  if (myUserIds.has(userId)) return myUserIds.get(userId);
  try {
    const xml = await tradingCall(userId, 'GetUser', '<DetailLevel>ReturnSummary</DetailLevel>');
    const id = xmlDecode(xmlTag(xmlTag(xml, 'User') || '', 'UserID')) || null;
    if (id) myUserIds.set(userId, id);
    return id;
  } catch (e) { return null; }
}

function threadsBlocked(conn) {
  if (!conn || !conn.refresh_enc) return { connected: false };
  if (!hasScope(conn, MSG_SCOPE)) return { connected: true, needScope: true };
  return null;
}
const convType = (t) => (t === 'ebay' ? 'FROM_EBAY' : 'FROM_MEMBERS');
const scopeError = (e) => e.status === 403 || /scope|access denied|insufficient permissions/i.test(e.message || '');

// Conversations: ?type=members|ebay&unread=1
app.get('/api/threads', requireUser, async (req, res) => {
  try {
    const conn = await getConnection(req.user.id);
    const blocked = threadsBlocked(conn); if (blocked) return res.json(blocked);
    const type = convType(req.query.type);
    const me = await myEbayUser(req.user.id);
    const out = [];
    for (let offset = 0; offset < 200; offset += 50) {
      const q = new URLSearchParams({ conversation_type: type, limit: '50', offset: String(offset) });
      if (req.query.unread === '1') q.set('conversation_status', 'UNREAD');
      if (req.query.trash === '1') q.set('conversation_status', 'DELETE');   // v323: the Trash
      // const { data } = await restCall(req.user.id, 'GET', '/commerce/message/v1/conversation?' + q);
      let data;   // v323: eBay's docs name the deleted status two ways — try the other if one is refused
      try { ({ data } = await restCall(req.user.id, 'GET', '/commerce/message/v1/conversation?' + q)); }
      catch (e) {
        if (req.query.trash !== '1' || e.status !== 400) throw e;
        q.set('conversation_status', 'DELETED');
        ({ data } = await restCall(req.user.id, 'GET', '/commerce/message/v1/conversation?' + q));
      }
      const list = (data && data.conversations) || [];
      list.forEach(c => {
        const lm = c.latestMessage || {};
        const other = me ? (lm.senderUsername && lm.senderUsername !== me ? lm.senderUsername : lm.recipientUsername) : (lm.senderUsername || lm.recipientUsername);
        out.push({
          id: c.conversationId, title: c.conversationTitle || '', status: c.conversationStatus || '', unread: c.unreadCount || 0,
          itemId: c.referenceType === 'LISTING' ? (c.referenceId || null) : null,
          other: type === 'FROM_EBAY' ? 'eBay' : (other || ''),
          last: { text: lm.messageBody || '', from: lm.senderUsername || '', date: lm.createdDate || c.createdDate || null, mine: !!(me && lm.senderUsername === me) },
          needsReply: type !== 'FROM_EBAY' && !(me && lm.senderUsername === me) && !isCloser(lm.messageBody)   // v341
        });
      });
      if (!data || !data.next || list.length < 50) break;
    }
    out.sort((a, b) => String(b.last.date).localeCompare(String(a.last.date)));
    res.json({ connected: true, me, threads: out });
  } catch (e) {
    console.error('[threads]', e.message);
    if (scopeError(e)) return res.json({ connected: true, needScope: true, error: e.message });
    res.json({ connected: true, error: 'eBay didn\u2019t give us your conversations: ' + e.message, threads: [] });
  }
});

// One conversation, oldest message first. ?type=…&markRead=1 also marks it read on eBay.
app.get('/api/threads/:id', requireUser, async (req, res) => {
  const id = String(req.params.id || '');
  if (!/^[\w.:-]{1,80}$/.test(id)) return res.status(400).json({ error: 'Bad conversation' });
  try {
    const conn = await getConnection(req.user.id);
    const blocked = threadsBlocked(conn); if (blocked) return res.json(blocked);
    const type = convType(req.query.type);
    const me = await myEbayUser(req.user.id);
    const msgs = []; let head = null;
    for (let offset = 0; offset < 300; offset += 50) {
      const q = new URLSearchParams({ conversation_type: type, limit: '50', offset: String(offset) });
      const { data } = await restCall(req.user.id, 'GET', '/commerce/message/v1/conversation/' + encodeURIComponent(id) + '?' + q);
      if (!head) head = data || {};
      const list = (data && data.messages) || [];
      list.forEach(m => msgs.push({
        id: m.messageId, from: m.senderUsername || '', to: m.recipientUsername || '', date: m.createdDate || null,
        text: m.messageBody || '', subject: m.subject || '', mine: !!(me && m.senderUsername === me),
        media: (m.messageMedia || []).filter(x => x && /^https:\/\//.test(x.mediaUrl || '')).map(x => ({ name: x.mediaName || '', type: x.mediaType || '', url: x.mediaUrl }))
      }));
      if (!data || !data.next || list.length < 50) break;
    }
    msgs.sort((a, b) => String(a.date).localeCompare(String(b.date)));
    if (req.query.markRead === '1') {
      restCall(req.user.id, 'POST', '/commerce/message/v1/update_conversation', { conversationId: id, conversationType: type, read: true })
        .then(() => msgCounts.delete(req.user.id))
        .catch(e => console.error('[thread read]', e.message));
    }
    res.json({ me, title: (head && head.conversationTitle) || '', messages: msgs });
  } catch (e) {
    console.error('[thread]', e.message);
    if (scopeError(e)) return res.json({ needScope: true, error: e.message });
    res.json({ error: 'eBay didn\u2019t give us that conversation: ' + e.message });
  }
});

// Reply in a conversation
app.post('/api/threads/:id/send', requireUser, express.json(), async (req, res) => {
  const id = String(req.params.id || '');
  const text = String((req.body && req.body.text) || '').trim();
  if (!/^[\w.:-]{1,80}$/.test(id)) return res.status(400).json({ error: 'Bad conversation' });
  if (!text) return res.status(400).json({ error: 'Type a message first.' });
  if (text.length > 2000) return res.status(400).json({ error: 'eBay allows up to 2,000 characters.' });
  try {
    const conn = await getConnection(req.user.id);
    const blocked = threadsBlocked(conn); if (blocked) return res.status(400).json({ error: 'Reconnect eBay to approve message threads first.' });
    const { data } = await restCall(req.user.id, 'POST', '/commerce/message/v1/send_message', { conversationId: id, messageText: text, emailCopyToSender: true });
    msgCounts.delete(req.user.id);
    // res.json({ ok: true, message: data ? { id: data.messageId, text: data.messageBody || text, date: data.createdDate || new Date().toISOString(), mine: true } : null });
    // v371: the message gave your return address (late returns on) → add it to Late returns
    let lateAdded = null;
    try {
      const ms = msgSettingsOf(await getUserSettings(req.user.id));
      const itemId = String((req.body && req.body.itemId) || '');
      if (ms.honorLate.enabled && /^\d{6,20}$/.test(itemId) && hasReturnAddress(text, ms.honorLate.address)) {
        const r = await addLateReturn(req.user.id, id, itemId, String((req.body && req.body.buyer) || '').slice(0, 80), 'auto');
        if (r.ok) lateAdded = r.existed ? 'already' : 'added';
      }
    } catch (e) { console.warn('[late return add]', e.message); }
    res.json({ ok: true, lateReturn: lateAdded, message: data ? { id: data.messageId, text: data.messageBody || text, date: data.createdDate || new Date().toISOString(), mine: true } : null });
  } catch (e) {
    console.error('[thread send]', e.message);
    res.status(502).json({ error: 'eBay didn\u2019t send it: ' + e.message });
  }
});

// ─── v323: DELETE / RESTORE A CONVERSATION ──────────────────────────────────
// { type, action: 'delete' | 'restore' } — delete moves it to eBay's deleted folder
// (the Trash here); restore puts it back with your other conversations.
app.post('/api/threads/:id/status', requireUser, express.json(), async (req, res) => {
  const id = String(req.params.id || '');
  const action = String((req.body || {}).action || '');
  if (!/^[\w.:-]{1,80}$/.test(id) || !['delete', 'restore'].includes(action)) return res.status(400).json({ error: 'Bad request' });
  try {
    const conn = await getConnection(req.user.id);
    const blocked = threadsBlocked(conn); if (blocked) return res.status(400).json({ error: 'Reconnect eBay to approve message threads first.' });
    await restCall(req.user.id, 'POST', '/commerce/message/v1/update_conversation', {
      conversationId: id, conversationType: convType((req.body || {}).type), conversationStatus: action === 'delete' ? 'DELETE' : 'ACTIVE'
    });
    msgCounts.delete(req.user.id);
    res.json({ ok: true });
  } catch (e) {
    console.error('[thread status]', e.message);
    res.status(502).json({ error: 'eBay didn\u2019t ' + (action === 'delete' ? 'delete' : 'restore') + ' it: ' + e.message });
  }
});

// ─── v323: AI-DRAFTED REPLIES ────────────────────────────────────────────────
// Reads the conversation + the listing it's about (title, price, condition, item
// specifics, description, and the fitment list if the listing has one), then asks
// Claude for a reply. The draft goes into your reply box — nothing is sent until
// you press Send. Uses the Anthropic key + model from your Listing Tool settings.
async function getUserSettings(userId) {
  const r = await pool.query('SELECT data_enc FROM user_data WHERE user_id = $1', [userId]);
  if (!r.rows.length) return {};
  try { return (JSON.parse(decrypt(r.rows[0].data_enc)).settings) || {}; } catch (e) { return {}; }
}
const htmlToText = (h) => String(h || '')
  .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
  .replace(/<br\s*\/?>|<\/(p|div|li|tr|h\d)>/gi, '\n')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim();

// v363: the whole compatibility list, summed up by make + model with year ranges
function fitmentSummary(rows) {
  const groups = new Map();
  rows.forEach(r => {
    const y = parseInt(r.Year, 10); if (!y || !r.Make || !r.Model) return;
    const k = r.Make + ' ' + r.Model;
    if (!groups.has(k)) groups.set(k, { years: new Set(), trims: new Set() });
    const g = groups.get(k); g.years.add(y); if (r.Trim) g.trims.add(r.Trim);
  });
  const ranges = (ys) => { const a = [...ys].sort((x, y) => x - y), out = []; let st = a[0], pv = a[0];
    for (let i = 1; i <= a.length; i++) { if (a[i] === pv + 1) { pv = a[i]; continue; } out.push(st === pv ? String(st) : st + '\u2013' + pv); st = pv = a[i]; } return out.join(', '); };
  return [...groups.entries()].map(([k, g]) => k + ': ' + ranges(g.years) + (g.trims.size ? ' (trims: ' + [...g.trims].slice(0, 12).join(', ') + (g.trims.size > 12 ? ', …' : '') + ')' : ''));
}
async function getFitmentRows(userId, itemId) {   // v363
  try {
    const xml = await tradingCall(userId, 'GetItem',
      `<ItemID>${itemId}</ItemID><IncludeItemCompatibilityList>true</IncludeItemCompatibilityList><OutputSelector>ItemCompatibilityList</OutputSelector>`);
    return xmlAll(xmlTag(xml, 'ItemCompatibilityList') || '', 'Compatibility').map(c => {
      const o = {}; xmlAll(c, 'NameValueList').forEach(nv => { const n = xmlDecode(xmlTag(nv, 'Name')); if (n) o[n] = xmlDecode(xmlTag(nv, 'Value')); }); return o;
    });
  } catch (e) { return []; }
}
async function getFitment(userId, itemId) {
  try {
    const xml = await tradingCall(userId, 'GetItem',
      `<ItemID>${itemId}</ItemID><IncludeItemCompatibilityList>true</IncludeItemCompatibilityList><OutputSelector>ItemCompatibilityList</OutputSelector>`);
    const rows = xmlAll(xmlTag(xml, 'ItemCompatibilityList') || '', 'Compatibility').slice(0, 200).map(c =>
      xmlAll(c, 'NameValueList').map(nv => xmlDecode(xmlTag(nv, 'Value'))).filter(Boolean).join(' '));
    return rows.filter(Boolean);
  } catch (e) { return []; }
}

// ─── v329: CAN THIS LISTING SHIP TO A COUNTRY? ───────────────────────────────
// Two looks, so one unclear answer doesn't decide it:
//  1) eBay's shopper view of the listing for a buyer in that country (Browse API with the
//     country as the buyer's location) — lists the shipping options that buyer would see.
//     This includes eBay International Shipping, which can block items your settings allow.
//  2) Your listing's own settings (Trading API GetItem): ship-to places, excluded places,
//     and whether eBay International Shipping is on.
// [code, name, other names, a sample postal code so calculated shipping can be priced]
const COUNTRIES = [
  ['CA', 'Canada', [], 'M5V 2T6'], ['MX', 'Mexico', [], '06000'], ['GB', 'United Kingdom', ['uk', 'england', 'britain', 'great britain', 'scotland', 'wales', 'northern ireland'], 'SW1A 1AA'],
  ['IE', 'Ireland', [], 'D02 X285'], ['DE', 'Germany', ['deutschland'], '10115'], ['FR', 'France', [], '75001'], ['IT', 'Italy', ['italia'], '00118'],
  ['ES', 'Spain', ['espana', 'españa'], '28001'], ['PT', 'Portugal', [], '1100-148'], ['NL', 'Netherlands', ['holland', 'the netherlands'], '1012 JS'],
  ['BE', 'Belgium', [], '1000'], ['AT', 'Austria', [], '1010'], ['CH', 'Switzerland', [], '8001'], ['DK', 'Denmark', [], '1050'], ['SE', 'Sweden', [], '111 52'],
  ['NO', 'Norway', [], '0150'], ['FI', 'Finland', [], '00100'], ['PL', 'Poland', [], '00-001'], ['CZ', 'Czech Republic', ['czechia'], '110 00'],
  ['GR', 'Greece', [], '105 57'], ['HU', 'Hungary', [], '1051'], ['RO', 'Romania', [], '010011'], ['LT', 'Lithuania', [], '01100'], ['LV', 'Latvia', [], 'LV-1050'],
  ['EE', 'Estonia', [], '10111'], ['UA', 'Ukraine', [], '01001'], ['RU', 'Russia', ['russian federation'], '101000'], ['TR', 'Turkey', ['türkiye', 'turkiye'], '34000'],
  ['IL', 'Israel', [], '6100000'], ['AE', 'United Arab Emirates', ['uae', 'dubai', 'abu dhabi'], ''], ['SA', 'Saudi Arabia', [], '11564'], ['KW', 'Kuwait', [], ''],
  ['QA', 'Qatar', [], ''], ['JO', 'Jordan', [], '11118'], ['EG', 'Egypt', [], '11511'], ['ZA', 'South Africa', [], '2001'], ['NG', 'Nigeria', [], '100001'],
  ['KE', 'Kenya', [], '00100'], ['AU', 'Australia', [], '2000'], ['NZ', 'New Zealand', [], '6011'], ['JP', 'Japan', [], '100-0001'], ['KR', 'South Korea', ['korea'], '04524'],
  ['CN', 'China', [], '100000'], ['HK', 'Hong Kong', [], ''], ['TW', 'Taiwan', [], '100'], ['SG', 'Singapore', [], '018989'], ['MY', 'Malaysia', [], '50000'],
  ['TH', 'Thailand', [], '10200'], ['PH', 'Philippines', [], '1000'], ['ID', 'Indonesia', [], '10110'], ['VN', 'Vietnam', ['viet nam'], '100000'], ['IN', 'India', [], '110001'],
  ['PK', 'Pakistan', [], '44000'], ['BR', 'Brazil', ['brasil'], '01000-000'], ['AR', 'Argentina', [], 'C1000'], ['CL', 'Chile', [], '8320000'], ['CO', 'Colombia', [], '110111'],
  ['PE', 'Peru', [], '15001'], ['CR', 'Costa Rica', [], '10101'], ['PA', 'Panama', [], ''], ['DO', 'Dominican Republic', [], '10101'], ['JM', 'Jamaica', [], ''],
  ['TT', 'Trinidad and Tobago', ['trinidad'], ''], ['BS', 'Bahamas', ['the bahamas'], ''], ['BB', 'Barbados', [], ''], ['GU', 'Guam', [], '96910'],
  ['IS', 'Iceland', [], '101'], ['CY', 'Cyprus', [], '1010'], ['MT', 'Malta', [], 'VLT 1000'], ['LU', 'Luxembourg', [], '1009'], ['SK', 'Slovakia', [], '811 01'],
  ['SI', 'Slovenia', [], '1000'], ['HR', 'Croatia', [], '10000'], ['BG', 'Bulgaria', [], '1000'], ['RS', 'Serbia', [], '11000']
];
const countryByCode = (c) => COUNTRIES.find(x => x[0] === String(c || '').toUpperCase()) || null;
// eBay's region names (used in excluded / ship-to lists) for each country above
const REGION_OF = {
  Europe: 'GB IE DE FR IT ES PT NL BE AT CH DK SE NO FI PL CZ GR HU RO LT LV EE UA RU IS CY MT LU SK SI HR BG RS TR',
  Asia: 'JP KR CN HK TW IN PK', 'Southeast Asia': 'SG MY TH PH ID VN', 'Middle East': 'IL AE SA KW QA JO EG TR',
  Africa: 'ZA NG KE EG', Oceania: 'AU NZ GU', 'North America': 'CA MX', Americas: 'CA MX BR AR CL CO PE CR PA DO JM TT BS BB',
  'South America': 'BR AR CL CO PE', 'Central America and Caribbean': 'CR PA DO JM TT BS BB'
};
const regionsOf = (code) => Object.keys(REGION_OF).filter(r => REGION_OF[r].split(' ').includes(code));
// Find countries named in a buyer's text, e.g. "do you ship to the UK?" → ['GB']
function detectCountries(text) {
  const t = ' ' + String(text || '').toLowerCase().replace(/[^a-z\u00c0-\u024f ]+/g, ' ') + ' ';
  const found = [];
  for (const [code, name, alts] of COUNTRIES) {
    if ([name.toLowerCase()].concat(alts).some(w => t.includes(' ' + w + ' '))) found.push(code);
  }
  return found.slice(0, 3);
}

async function shipCheck(userId, itemId, code) {
  const c = countryByCode(code);
  if (!c) throw new Error('Unknown country');
  const out = { code: c[0], country: c[1], verdict: 'unknown', options: [], how: [], sellerShipTo: [], sellerExcluded: [], ebayIntlShipping: null };
  // 2) your listing's own settings
  try {
    const xml = await tradingCall(userId, 'GetItem', `<ItemID>${itemId}</ItemID><DetailLevel>ReturnAll</DetailLevel>`);
    const item = xmlTag(xml, 'Item') || '';
    const sd = xmlTag(item, 'ShippingDetails') || '';
    out.sellerShipTo = xmlAll(item, 'ShipToLocations').map(xmlDecode).filter(Boolean);
    xmlAll(sd, 'InternationalShippingServiceOption').forEach(o => xmlAll(o, 'ShipToLocation').forEach(l => { if (!out.sellerShipTo.includes(l)) out.sellerShipTo.push(xmlDecode(l)); }));
    out.sellerExcluded = xmlAll(sd, 'ExcludeShipToLocation').map(xmlDecode).filter(Boolean);
    out.ebayIntlShipping = xmlTag(sd, 'GlobalShipping') === 'true';
  } catch (e) { out.how.push('Couldn\u2019t read the listing\u2019s shipping settings: ' + e.message); }
  // 1) eBay's shopper view from that country
  try {
    const s = await getUserSettings(userId);
    const appToken = await getAppToken(String(s.ebayClientId || '').trim(), String(s.ebayClientSecret || '').trim());
    const ctx = 'contextualLocation=' + encodeURIComponent('country=' + c[0] + (c[3] ? ',zip=' + c[3] : ''));
    const r = await fetch('https://api.ebay.com/buy/browse/v1/item/get_item_by_legacy_id?legacy_item_id=' + encodeURIComponent(itemId), {
      headers: { Authorization: 'Bearer ' + appToken, 'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US', 'X-EBAY-C-ENDUSERCTX': ctx, Accept: 'application/json' },
      signal: AbortSignal.timeout(20000)
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) {
      const msg = (d.errors || []).map(e => e.longMessage || e.message).join('; ') || ('HTTP ' + r.status);
      if (/ship|deliver|location|not available/i.test(msg)) { out.verdict = 'no'; out.how.push('eBay: ' + msg); }
      else out.how.push('eBay\u2019s shopper view didn\u2019t answer: ' + msg);
    } else {
      out.options = (d.shippingOptions || []).map(o => ({
        service: o.shippingServiceCode || o.shippingCarrierCode || o.type || 'Shipping',
        cost: o.shippingCost ? parseFloat(o.shippingCost.value) : null,
        type: o.optionalShippingFeeType || o.type || '',
        arrives: o.maxEstimatedDeliveryDate || null
      }));
      const excl = ((d.shipToLocations && d.shipToLocations.regionExcluded) || []).map(x => x.regionId || x.regionName);
      if (excl.some(x => String(x).toUpperCase() === c[0] || String(x).toLowerCase() === c[1].toLowerCase())) out.verdict = 'no';
      else if (out.options.length) out.verdict = 'yes';
      else out.verdict = 'no';
      out.how.push(out.options.length ? 'eBay shows ' + out.options.length + ' shipping option' + (out.options.length === 1 ? '' : 's') + ' for a buyer in ' + c[1] : 'eBay shows no shipping options for a buyer in ' + c[1]);
    }
  } catch (e) { out.how.push('eBay\u2019s shopper view didn\u2019t answer: ' + e.message); }
  // If the shopper view couldn't answer, fall back to your settings (less sure)
  if (out.verdict === 'unknown' && (out.sellerShipTo.length || out.sellerExcluded.length)) {
    const ex = out.sellerExcluded.map(x => x.toLowerCase());
    const exRegion = regionsOf(c[0]).find(r => ex.includes(r.toLowerCase()));
    if (ex.includes(c[0].toLowerCase()) || ex.includes(c[1].toLowerCase())) { out.verdict = 'no'; out.how.push(c[1] + ' is on the listing\u2019s excluded list'); }
    else if (exRegion) { out.verdict = 'no'; out.how.push('The listing excludes ' + exRegion + ', which includes ' + c[1]); }
    else if (out.sellerShipTo.some(x => /worldwide/i.test(x) || x.toUpperCase() === c[0])) { out.verdict = 'probably'; out.how.push('The listing ships worldwide and doesn\u2019t exclude ' + c[1] + ' (eBay\u2019s own checks could still block it)'); }
  }
  return out;
}

function shipCheckText(sc) {
  const v = { yes: 'YES', no: 'NO', probably: 'PROBABLY (not confirmed)', unknown: 'UNKNOWN' }[sc.verdict];
  const opts = sc.options.length ? ' Options: ' + sc.options.map(o => o.service + (o.cost !== null ? ' $' + o.cost.toFixed(2) : '')).join('; ') + '.' : '';
  return 'Shipping to ' + sc.country + ' (' + sc.code + '): ' + v + '.' + opts + (sc.how.length ? ' How we know: ' + sc.how.join('; ') + '.' : '');
}

app.get('/api/shipcheck/countries', requireUser, (req, res) => res.json({ countries: COUNTRIES.map(c => ({ code: c[0], name: c[1] })).sort((a, b) => a.name.localeCompare(b.name)) }));
app.get('/api/shipcheck/:itemId', requireUser, async (req, res) => {
  const itemId = String(req.params.itemId || '');
  if (!/^\d{6,20}$/.test(itemId)) return res.status(400).json({ error: 'Bad item number' });
  if (!countryByCode(req.query.country)) return res.status(400).json({ error: 'Pick a country' });
  try {
    const conn = await getConnection(req.user.id);
    if (!conn || !conn.refresh_enc) return res.status(400).json({ error: 'Connect eBay first' });
    res.json(await shipCheck(req.user.id, itemId, req.query.country));
  } catch (e) {
    console.error('[shipcheck]', e.message);
    res.status(500).json({ error: 'Could not check: ' + e.message });
  }
});

// ─── v330: MESSAGES SETTINGS ─────────────────────────────────────────────────
const DEFAULT_MSG_INSTRUCTIONS = [
  'You draft replies for a small eBay seller of used auto parts (pulled from salvage vehicles) to buyer messages.',
  'Write the reply the seller will send, answering the buyer\'s latest message.',
  // 'Fitment questions: if the buyer\'s vehicle is in the fitment list, say it is listed as fitting and suggest they match the part number to their original part. If it is not listed or there is no fitment list, say you can\'t confirm it and ask them to compare the part number on their original part (or send the VIN). Never promise fit.',
  // 'Fitment questions: if the buyer\'s vehicle is in the fitment list, say it is listed as fitting. If it is not listed or there is no fitment list, say you can\'t confirm it and ask for their VIN. Follow the PART NUMBER rule for comparing part numbers. Never promise fit.',   // v332
  // 'Fitment questions: if the buyer\'s vehicle is in the fitment list, say it is listed as fitting. If it is not listed or there is no fitment list, say the listing doesn\'t show their vehicle as a fit, so you can\'t confirm it. Then follow the PART NUMBER rule. Never promise fit.',   // v333
  'Fitment questions: never say "yes, it fits" or "it will work". If their vehicle is in the fitment list OR the title covers its year and model (a title range like "2009 2014" includes 2011), say it\'s listed for their vehicle, but fit goes by part number. If it isn\'t listed or there\'s no fitment list, say the listing doesn\'t show their vehicle. Either way, follow the PART NUMBER rule.',   // v359
  'Answer the buyer\'s question directly. Don\'t open by repeating the condition or other listing facts they didn\'t ask about.',   // v333
  // 'Price/offer questions: don\'t invent a price; if the seller gave instructions, follow them, otherwise suggest they send an offer through the listing.',
  'Price/discount questions: if a DISCOUNT section is given, follow it exactly. Otherwise don\'t offer or invent a discount — politely say the price is as listed (unless the seller\'s instructions say otherwise).',   // v331
  'Keep it short (1–4 sentences), friendly and plain.'
].join(' ');
// What the AI offers when a buyer has a problem (inside the return window)
const PROBLEM_POLICIES = {
  return_or_refund: { label: 'Offer a return for a refund', ai: 'apologize and offer a return for a full refund through eBay\'s return process.' },
  exchange_or_refund: { label: 'Offer an exchange or a refund (buyer picks)', ai: 'apologize and offer either an exchange for a replacement part (if one is available) or a return for a refund — the buyer can choose.' },
  refund_no_return: { label: 'Refund without asking for the part back', ai: 'apologize and say the seller will issue a refund and the buyer does not need to send the part back.' },
  photos_first: { label: 'Ask for photos first, then decide', ai: 'apologize and ask the buyer to send clear photos of the part and the problem so the seller can make it right; don\'t promise a refund or return yet.' },
  open_return: { label: 'Ask them to open a return on eBay', ai: 'politely ask the buyer to open a return request on eBay so it can be handled there.' }
};
// v331: each kind of problem gets its own choice. The AI works out which kind the buyer has.
const PROBLEM_TYPES = [
  { key: 'notReceived', label: 'Didn\u2019t arrive', when: 'the buyer says the item hasn\u2019t arrived / was lost / tracking hasn\u2019t moved', def: 'nr_tracking', options: {
    // nr_tracking: { label: 'Check tracking first, refund if it\u2019s lost', ai: 'say you\u2019re sorry and will check the tracking right away, and that if it\u2019s lost they\u2019ll get a full refund. Never ask for photos.' },
    // nr_tracking: { label: 'Check tracking first, refund if it\u2019s lost', ai: 'use the SHIPMENT facts in ORDER & RETURNS: give the carrier and tracking number. If eBay shows it delivered, give the delivery date and kindly ask them to check around the delivery spot and with neighbors, and to let you know if it still doesn\u2019t turn up. If it\u2019s not delivered and the expected date hasn\u2019t passed, say when it\u2019s expected. If the expected date has passed, apologize, say you\u2019ll look into it, and that if it\u2019s lost they\u2019ll get a full refund. If there\u2019s no tracking info, say you\u2019ll check on it right away and refund in full if it\u2019s lost. Never ask for photos.' },   // v332
    // nr_refund: { label: 'Refund right away', ai: 'say you\u2019re sorry and that you\u2019ll issue a full refund. Never ask for photos.' },
    // nr_refund: { label: 'Refund right away', ai: 'say you\u2019re sorry and that you\u2019ll issue a full refund (you may also give the tracking number from SHIPMENT). Never ask for photos.' },   // v332
    // nr_open: { label: 'Ask them to open an \u201citem not received\u201d request on eBay', ai: 'say you\u2019re sorry and ask them to open an \u201citem not received\u201d request on eBay so it can be sorted out there. Never ask for photos.' }   (v331)
    // v335: these cover a package eBay does NOT show delivered. Delivered-but-missing follows the
    //       separate "delivered" setting. Every option gives the carrier + tracking number first.
    nr_tracking: { label: 'Check tracking first, refund if it’s lost', ai: 'if the expected date hasn’t passed, say when it’s expected. If it has passed, apologize, say you’ll look into it, and that if it’s lost they’ll get a full refund. If there’s no tracking info, say you’ll check on it right away and refund in full if it’s lost.' },
    nr_refund: { label: 'Refund right away', ai: 'apologize and say you’ll issue a full refund.' },
    nr_open: { label: 'Ask them to open an “item not received” request (once it’s late)', ai: 'if the expected date hasn’t passed, say when it’s expected and ask them to wait until then, and if it still hasn’t come by then, to open an “item not received” request on eBay. If the expected date has passed, apologize and ask them to open an “item not received” request on eBay so it can be sorted out there.' } } },
  { key: 'damaged', label: 'Arrived damaged', when: 'the buyer says the item arrived broken, cracked, bent or damaged in shipping', def: 'photos_first', options: {} },
  { key: 'defective', label: 'Defective / not working', when: 'the buyer says the part doesn\u2019t work, is faulty, or throws codes', def: 'return_or_refund', options: {} },
  { key: 'wrongPart', label: 'Wrong part / doesn\u2019t fit', when: 'the buyer says it\u2019s the wrong part or doesn\u2019t fit their vehicle', def: 'wp_compare', options: {
    // wp_compare: { label: 'Ask them to compare part numbers, then offer a return', ai: 'ask them to compare the part number on the listing with the one on their original part; if it was listed wrong or doesn\u2019t match the listing, offer a return for a refund.' },
    wp_compare: { label: 'Ask them to compare part numbers, then offer a return', ai: 'if the PART NUMBER line has a number, write it out and ask them to compare it with the number on their original part; if it has none, ask them to compare their original part with the listing photos instead. If it was listed wrong or doesn\u2019t match the listing, offer a return for a refund.' },   // v332
    wp_fitment: { label: 'Check the fitment list, then offer a return', ai: 'check the fitment list in the LISTING: if their vehicle is listed, say so and ask them to compare part numbers; either way, offer a return for a refund if it truly doesn\u2019t fit.' } } }
];
// damaged / defective use the general choices (PROBLEM_POLICIES); every type can also use them
PROBLEM_TYPES.forEach(t => { Object.keys(PROBLEM_POLICIES).forEach(k => { if (!t.options[k] && t.key !== 'notReceived') t.options[k] = PROBLEM_POLICIES[k]; }); });

// v335: more Messages settings
const DELIVERED_MISSING = {
  check_first: { label: 'Ask them to check around and with neighbors first', ai: 'ask them to check around the door, mailbox and porch, with neighbors, and with anyone else at the address, and to let you know if it still doesn’t turn up' },
  open_now: { label: 'Tell them to open an “item not received” request right away', ai: 'ask them to open an “item not received” request on eBay so it can be sorted out there' }
};
// v336
const PHOTO_REQUESTS = {
  check_back: { label: 'Say you\u2019ll check the part and get back to them', ai: 'say you\u2019ll take a close look at the part (name what they asked about) and get back to them' },
  more_photos: { label: 'Say you\u2019ll take more photos and send them', ai: 'say you\u2019ll take the photos they asked for and send them' },
  listing_photos: { label: 'Say all the photos are in the listing', ai: 'politely say all the photos you have are in the listing — give no reason or excuse' }
};
// v339: common questions
const TESTED_ANSWERS = {
  // (v339 labels said "Not tested — …"; v341: testing is its own setting, this is just the warranty part)
  warranty_return: { label: 'The warranty is the return policy in the listing', ai: 'say it\u2019s covered by a warranty, which is the return policy in the listing (give the days from the Return policy line)' },
  return_only: { label: 'They can return it under the listing\u2019s return policy', ai: 'say they can return it under the listing\u2019s return policy (give the days from the Return policy line)' },
  both: { label: 'Mention the warranty and the return policy', ai: 'say it comes with a warranty and the listing\u2019s return policy (give the days from the Return policy line)' }
};
// v341: does the seller test parts?
const TESTS_PARTS = {
  no: { label: 'No', ai: 'Say plainly that the part has not been tested. Never say or suggest it was tested, checked, verified working or came from a running vehicle \u2014 even if the listing description says "good working condition" or "tested" (that is standard wording, not a test).' },
  yes: { label: 'Yes, I test my parts', ai: 'Say the part was tested before it was listed (unless the LISTING says it was not).' },
  some: { label: 'Some \u2014 only when the listing says that part was tested', ai: 'Only say it was tested if the LISTING clearly says this part was tested (e.g. "tested", "tested working", "tested good"). Otherwise say plainly that it has not been tested. "Good working condition" alone does NOT mean tested.' }
};
const PROGRAMMING_ANSWERS = {
  may_need: { label: 'Some need programming, some don\u2019t \u2014 check with a mechanic or dealer', ai: 'say that some parts like this need to be programmed to the vehicle and some don\u2019t, so you can\u2019t say for sure, and that it\u2019s worth checking with their mechanic or dealer before installing' },
  usually: { label: 'Used modules usually need programming by a shop or dealer', ai: 'say that used modules like this usually need to be programmed to the vehicle by a shop or dealer' }
};
const DONOR_ANSWERS = {
  dont_have: { label: 'Say you don\u2019t have the donor vehicle info', ai: 'say you don\u2019t have the donor vehicle information for this part (unless the LISTING gives it)' },
  check_back: { label: 'Say you\u2019ll check and get back to them', ai: 'unless the LISTING gives it, say you\u2019ll check and get back to them' }
};
const SHIP_WHEN = {
  ship_days: { label: 'Give your shipping days', ai: 'say it will ship on the seller\u2019s next shipping day, using the shipping days given' },
  handling: { label: 'Say it ships within the listing\u2019s handling time', ai: 'say it will ship within the listing\u2019s handling time (from the Handling time line)' }
};
const INTL_NO = {
  ebay_no: { label: 'Say eBay doesn\u2019t allow it to ship there', ai: 'say that unfortunately eBay doesn\u2019t allow this item to ship to their country' },
  us_only: { label: 'Say you only ship within the US', ai: 'say that sorry, you only ship within the US' },
  check_back: { label: 'Say you\u2019ll look into it and get back to them', ai: 'say you\u2019ll look into shipping to their country and get back to them' }
};
// v345: more answers, from 300 real conversations (your own past replies are the defaults)
const REMORSE = {
  open_return: { label: 'They can open a return on eBay (return shipping per the listing’s policy)', ai: 'say they can return it: open a return request on eBay within the return window (give the time left); return shipping as the listing’s return policy says for changed-mind returns (follow the RETURN SHIPPING rule)' },
  ask_first: { label: 'Say you’ll check and get back to them', ai: 'say you’ll look into it and get back to them' }
};
const ADDRESS_CHANGE = {
  cancel_reorder: { label: 'I can’t change it — cancel and reorder with the right address', ai: 'say you can’t change the shipping address on an order; you can cancel it so they can reorder with the right address (if it hasn’t shipped yet)' },
  check_back: { label: 'Say you’ll see what you can do and get back to them', ai: 'say you’ll see what you can do and get back to them' }
};
const FASTER = {
  checkout: { label: 'They can pick a faster shipping option at checkout', ai: 'say they can choose a faster shipping option at checkout if the listing offers one, and it ships on your shipping days; never promise a delivery date' },
  no: { label: 'Sorry, it ships with the listing’s shipping only', ai: 'say sorry, it ships with the shipping shown on the listing; never promise a delivery date' }
};
const PARTIAL = {
  as_shown: { label: 'Sorry — it’s only sold as shown', ai: 'say sorry, it’s only sold as shown in the listing' },
  check_back: { label: 'Say you’ll check and get back to them', ai: 'say you’ll check and get back to them' }
};
const RADIO_CODE = {
  dont_have: { label: 'I don’t have the code', ai: 'say you don’t have the code for it (a dealer can usually get it from the radio’s serial number)' },
  check_back: { label: 'Say you’ll check and get back to them', ai: 'say you’ll check and get back to them' }
};
const PICKUP = {
  ship_only: { label: 'Shipping only — no local pickup', ai: 'say sorry, you only ship (no local pickup)' },
  check_back: { label: 'Say you’ll check and get back to them', ai: 'say you’ll check and get back to them' }
};
// v349
const AFTER_WINDOW = {
  check_back: { label: 'Say you\u2019ll look into it and get back to them', ai: 'say the return window has passed, but you\u2019ll look into it and get back to them' },
  passed: { label: 'Politely say the return window has passed', ai: 'politely say the return window has passed' },
  still_ok: { label: 'Say you\u2019ll still take it back for a refund', ai: 'say the return window has passed, but you\u2019ll still take it back for a refund and will get back to them with the details' }
};
const TONES = {
  friendly: { label: 'Friendly', ai: 'Tone: warm and friendly. If the buyer sounds worried or upset, briefly acknowledge it.' },
  short: { label: 'Short and to the point', ai: 'Tone: polite but short and to the point. No small talk.' }
};

function msgSettingsOf(settings) {
  const m = (settings && settings.msgSettings) || {};
  const problems = {};
  PROBLEM_TYPES.forEach(t => {
    const saved = m.problems && m.problems[t.key];
    // before v331 there was one choice for everything — use it for damaged / defective if set
    const legacy = (t.key === 'damaged' || t.key === 'defective') && PROBLEM_POLICIES[m.problemPolicy] ? m.problemPolicy : null;
    problems[t.key] = t.options[saved] ? saved : (legacy && t.options[legacy] ? legacy : t.def);
  });
  const pct = parseFloat(m.discount && m.discount.percent);
  return {
    instructions: String(m.instructions || '').trim(),
    problemPolicy: PROBLEM_POLICIES[m.problemPolicy] ? m.problemPolicy : 'return_or_refund',
    autoTranslate: m.autoTranslate !== false,
    problems,   // v331
    discount: { enabled: !!(m.discount && m.discount.enabled), percent: pct > 0 && pct < 90 ? pct : 5 },   // v331
    fitment: { askVin: !!(m.fitment && m.fitment.askVin) },   // v333: off until VIN checking exists
    // v335
    deliveredMissing: DELIVERED_MISSING[m.deliveredMissing] ? m.deliveredMissing : 'check_first',
    modules: { askProgrammed: !(m.modules && m.modules.askProgrammed === false) },
    tone: TONES[m.tone] ? m.tone : 'friendly',
    signoff: String(m.signoff || '').trim().slice(0, 120),
    // v336
    photoRequests: PHOTO_REQUESTS[m.photoRequests] ? m.photoRequests : 'check_back',
    availability: String(m.availability || '').trim().slice(0, 200),
    // v339
    tested: TESTED_ANSWERS[m.tested] ? m.tested : 'warranty_return',
    testsParts: TESTS_PARTS[m.testsParts] ? m.testsParts : 'no',   // v341
    programming: PROGRAMMING_ANSWERS[m.programming] ? m.programming : 'may_need',
    offersProgramming: !!m.offersProgramming,
    donor: DONOR_ANSWERS[m.donor] ? m.donor : 'dont_have',
    shipWhen: SHIP_WHEN[m.shipWhen] ? m.shipWhen : 'ship_days',
    shipDays: String(m.shipDays || '').trim().slice(0, 200),
    intlNo: INTL_NO[m.intlNo] ? m.intlNo : 'ebay_no',
    buyerLanguage: !!m.buyerLanguage,
    // v345
    remorse: REMORSE[m.remorse] ? m.remorse : 'open_return',
    addressChange: ADDRESS_CHANGE[m.addressChange] ? m.addressChange : 'cancel_reorder',
    faster: FASTER[m.faster] ? m.faster : 'checkout',
    partial: PARTIAL[m.partial] ? m.partial : 'as_shown',
    radioCode: RADIO_CODE[m.radioCode] ? m.radioCode : 'dont_have',
    pickup: PICKUP[m.pickup] ? m.pickup : 'ship_only',
    afterWindow: AFTER_WINDOW[m.afterWindow] ? m.afterWindow : 'check_back',   // v349
    usVehicles: m.usVehicles !== false,   // v349: on unless turned off
    timezone: TIMEZONES[m.timezone] ? m.timezone : 'America/Chicago',   // v362
    autoDraft: !!m.autoDraft,   // v365
    honorLate: { enabled: !!(m.honorLate && m.honorLate.enabled), days: [30, 60, 90].includes(m.honorLate && m.honorLate.days) ? m.honorLate.days : 60, address: String((m.honorLate && m.honorLate.address) || '').trim().slice(0, 300) },   // v350
  };
}
// v341: a buyer message that doesn't need an answer ("ok thanks", "got it", "👍")
// const isCloser = (text) => /^\s*(ok(ay)?|k+|kk|thanks?( you)?( so much| a lot)?|thank u|thx|ty|tysm|got it|gotcha|cool|great|perfect|awesome|sounds good|will do|no worries|no problem|np|understood|alright|all right|appreciate it|much appreciated)([\s,.!]+(ok(ay)?|thanks?( you)?|thx|ty|again|man|bro|buddy|sir|so much|a lot|appreciate it))*[\s.!,]*[\u{1F44D}\u{1F64F}\u{1F642}\u{1F60A}\u{263A}️]*\s*$/iu.test(String(text || '')) || /^\s*([\u{1F44D}\u{1F64F}\u{1F642}\u{1F60A}\u{263A}]\uFE0F?\s*)+$/u.test(String(text || ''));   (v341)
// v366: a smarter "doesn't need a reply" check — a short message (no question mark) made ONLY of
//       thank-you / okay / got-it words. Any other word (a question, a problem, a part, a date) keeps
//       it in Needs reply, so a real question is never hidden.
const CLOSER_WORDS = new Set(('ok okay okey k kk alright aight right sure yes yep yeah yup cool great good perfect awesome excellent wonderful amazing nice fantastic ' +
  'thanks thank thankyou thx ty tysm tyvm appreciate appreciated appreciated much very so a lot lots again too as always ' +
  'you u your ya for the it its this that all of in a an and i im ill will we me my sir mam maam bro man buddy friend boss brother dude ' +
  'got gotcha understood understand noted copy see sounds fair enough no worries problem prob np fine deal done ' +
  'just purchased bought ordered paid order purchase received receive got arrived came today yesterday quick fast speedy response reply replies help helping info information ' +
  'matter assistance time patience have nice good great day weekend evening night one blessed take care talk later soon cheers regards best bye goodbye ' +
  'works worked working well looks look happy pleased glad love it perfectly').split(/\s+/));
function isCloserSmart(text) {
  const t = String(text || '').trim();
  if (!t || t.length > 160 || /\?/.test(t)) return false;
  const words = t.toLowerCase().replace(/[’']/g, '').replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(Boolean);
  if (!words.length || words.length > 18) return false;
  if (!words.some(w => /^(ok|okay|okey|k|kk|alright|aight|thanks|thank|thankyou|thx|ty|tysm|tyvm|appreciate|appreciated|gotcha|got|understood|noted|perfect|great|awesome|cool|sounds|worries|np|cheers|received|purchased|bought|ordered|bye|goodbye)$/.test(w))) return false;   // must actually be a thank-you / ok
  return words.every(w => CLOSER_WORDS.has(w));
}
const isCloser = (text) => isCloserSmart(text) || /^\s*(ok(ay)?|k+|kk|thanks?( you)?( so much| a lot)?|thank u|thx|ty|tysm|got it|gotcha|cool|great|perfect|awesome|sounds good|will do|no worries|no problem|np|understood|alright|all right|appreciate it|much appreciated)([\s,.!]+(ok(ay)?|thanks?( you)?|thx|ty|again|man|bro|buddy|sir|so much|a lot|appreciate it))*[\s.!,]*[\u{1F44D}\u{1F64F}\u{1F642}\u{1F60A}\u{263A}️]*\s*$/iu.test(String(text || '')) || /^\s*([\u{1F44D}\u{1F64F}\u{1F642}\u{1F60A}\u{263A}]\uFE0F?\s*)+$/u.test(String(text || ''));   // v366: + isCloserSmart
// v356: the offer price — your % off, rounded DOWN to the cent, and always more than 5% below the
//       listing price (eBay refuses an offer that isn't at least 5% less than Buy It Now)
function offerPriceFor(price, pct) {
  const cents = Math.round(price * 100);
  let off = Math.floor(cents * (1 - pct / 100));
  const max5 = Math.floor(cents * 0.95) - 1;   // at least 1 cent past 5% off
  if (off > max5) off = max5;
  return off / 100;
}
// v361: the next day you're available, from your "When you're available" text ("Monday, Wednesday
//       and Friday afternoons", "Mon/Wed/Fri 12-4"). Today counts only if it's before the end time
//       (an "X-4" range ends at 4 pm; "afternoon(s)" ends at 5 pm; otherwise noon).
const SELLER_TZ = 'America/Chicago';   // default — v362: Settings → Messages → Your time zone
const TIMEZONES = {'America/New_York': 'Eastern', 'America/Chicago': 'Central', 'America/Denver': 'Mountain', 'America/Phoenix': 'Arizona (no daylight saving)', 'America/Los_Angeles': 'Pacific', 'America/Anchorage': 'Alaska', 'Pacific/Honolulu': 'Hawaii' };   // v362
function nextAvailableDay(text, now = new Date(), tz = SELLER_TZ) {
  const t = String(text || '').toLowerCase();
  const names = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const short = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  let days = names.map((n, i) => new RegExp('\\b(' + n + 's?|' + short[i] + (i === 2 ? '|tues' : i === 4 ? '|thur|thurs' : '') + ')\\b').test(t) ? i : -1).filter(i => i >= 0);
  // v376: ranges — "mon-fri", "monday through friday", "tue–thu" mean every day in between
  const dayIdx = (w) => { w = w.toLowerCase(); const i = short.findIndex(s => w.startsWith(s)); return i; };
  const dayWord = '(sun|mon|tue|wed|thu|fri|sat)[a-z]*';
  const rangeRe = new RegExp('\\b' + dayWord + '\\s*(?:-|–|—|to|through|thru|till|until)\\s*' + dayWord + '\\b', 'g');
  let rm;
  while ((rm = rangeRe.exec(t))) {
    const a = dayIdx(rm[1]), b = dayIdx(rm[2]);
    if (a < 0 || b < 0) continue;
    for (let k = a; ; k = (k + 1) % 7) { days.push(k); if (k === b) break; }
  }
  if (/\bweekdays?\b/.test(t)) days = days.concat([1, 2, 3, 4, 5]);
  if (/\bweekends?\b/.test(t)) days = days.concat([0, 6]);
  if (/\b(every ?day|daily)\b/.test(t)) days = [0, 1, 2, 3, 4, 5, 6];
  if (!days.length) return null;
  const local = new Date(now.toLocaleString('en-US', { timeZone: TIMEZONES[tz] ? tz : SELLER_TZ }));   // v362: your time zone   // wall-clock time in your time zone
  const range = /(\d{1,2})(?::\d\d)?\s*(am|pm)?\s*(?:-|–|to)\s*(\d{1,2})(?::\d\d)?\s*(am|pm)?/.exec(t);
  let endHour = /afternoon/.test(t) ? 17 : /morning/.test(t) ? 12 : /evening/.test(t) ? 21 : 12;
  if (range) { let e = parseInt(range[3], 10); if (range[4] === 'pm' || (!range[4] && e < 9)) e += e < 12 ? 12 : 0; endHour = e; }
  for (let add = 0; add < 8; add++) {
    const d = new Date(local.getFullYear(), local.getMonth(), local.getDate() + add);
    if (!days.includes(d.getDay())) continue;
    if (add === 0 && local.getHours() >= endHour) continue;   // today's window is over
    return { add, label: (add === 0 ? 'today (' : add === 1 ? 'tomorrow (' : '') + d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) + (add <= 1 ? ')' : '') };
  }
  return null;
}
// v364: what kind of part is it? (from the title + category) → which note fit answers get
function partKind(title, category) {
  const t = ' ' + String(title || '') + ' ' + String(category || '') + ' ';
  // v378: pigtails / connector plugs / harnesses — checked first, since their titles name the module they plug into
  if (/\b(pig ?tails?|plugs?|connectors?|wiring harness(es)?|wire harness(es)?|harness(es)?)\b/i.test(String(title || '')) && !/\b(spark|glow) plugs?\b/i.test(String(title || '')))
    return { kind: 'pigtail', note: null };
  if (/\b(ECM|ECU|PCM|ECM\/PCM|engine (control|computer)|computer|brain box|TCM|TCU|TCCM|transmission (control|computer)|transfer case (control|module)|BCM|body control|GEM|SJB|smart junction|TIPM|IPDM|totally integrated power|ABS (pump|module|control|unit)|anti[- ]?lock|brake (control )?module|EBCM|airbag (module|control)|SRS|restraint control|RCM|occupant|immobili[sz]er|SKIM|PATS|smart key|keyless (entry )?module|key (fob )?module|instrument cluster|speedometer|gauge cluster|cluster|control module|control unit)\b/i.test(t))
    return { kind: 'module', note: 'may need programming' };
  if (/\b(radio|stereo|head unit|receiver|cd player|navigation|nav unit|amplifier|\bamp\b|infotainment)\b/i.test(t)) return { kind: 'radio', note: 'may need a radio code' };
  return { kind: 'other', note: null };
}
// v331: does the buyer's latest message ask for a lower price?
function asksForDiscount(text) {
  const t = String(text || '').toLowerCase();
  // careful with part names: "lower control arm", "less" in "wireless", "offer free shipping?"
  // return /\bdiscount|…|for less\b/.test(t);   (v331)
  if (/\bdiscount|\bcoupon|best price|lowest price|lower (the |your )?price|go (any )?lower|any lower|(price|it) (is )?(firm|negotiable)|negotiat|cheaper|knock (some|anything|it) off|wiggle room|(make|cut|give) (me )?(a|any) deal|best you can do|(would|will|can) you (do|take|accept) \$?\d|(take|do) \$\d|\$\d+(\.\d\d)? (and|&) (i'?ll|i will) buy|for less\b/.test(t)) return true;
  // v337: more ways buyers ask
  return /\b(would|will|could|can) you (please )?(consider|do|take|accept|let (it|this) go for|sell (it |this )?for|go) (\w+ )?\$?\d|\b(consider|accept|take) (an |my )?offer|\bmy offer\b|\bmake (you )?an offer|\b(below|under|less than) (your |the )?(asking|list(ed|ing)?) ?price|\bbelow (your |the )?asking\b|\bfor \$\d+(\.\d\d)?\s*\?|\$\d+(\.\d\d)? (shipped|firm|cash)\b.*\?|\bcounter ?offer|\boffer (you )?\$\d|\bbudget is\b|\byou'?d (go|take|do|accept|consider) \$?\d/.test(t);
}
app.get('/api/msg-settings', requireUser, async (req, res) => {
  try {
    const ms = msgSettingsOf(await getUserSettings(req.user.id));
    res.json({ ...ms, defaultInstructions: DEFAULT_MSG_INSTRUCTIONS,
      problemPolicies: Object.keys(PROBLEM_POLICIES).map(k => ({ value: k, label: PROBLEM_POLICIES[k].label })),
      problemTypes: PROBLEM_TYPES.map(t => ({ key: t.key, label: t.label, when: t.when, options: Object.keys(t.options).map(k => ({ value: k, label: t.options[k].label })) })),   // v331
      deliveredOptions: Object.keys(DELIVERED_MISSING).map(k => ({ value: k, label: DELIVERED_MISSING[k].label })),   // v335
      toneOptions: Object.keys(TONES).map(k => ({ value: k, label: TONES[k].label })),
      photoOptions: Object.keys(PHOTO_REQUESTS).map(k => ({ value: k, label: PHOTO_REQUESTS[k].label })),   // v336
      // v339
      testedOptions: Object.keys(TESTED_ANSWERS).map(k => ({ value: k, label: TESTED_ANSWERS[k].label })),
      testsPartsOptions: Object.keys(TESTS_PARTS).map(k => ({ value: k, label: TESTS_PARTS[k].label })),   // v341
      programmingOptions: Object.keys(PROGRAMMING_ANSWERS).map(k => ({ value: k, label: PROGRAMMING_ANSWERS[k].label })),
      donorOptions: Object.keys(DONOR_ANSWERS).map(k => ({ value: k, label: DONOR_ANSWERS[k].label })),
      shipWhenOptions: Object.keys(SHIP_WHEN).map(k => ({ value: k, label: SHIP_WHEN[k].label })),
      intlOptions: Object.keys(INTL_NO).map(k => ({ value: k, label: INTL_NO[k].label })),
      // v345
      remorseOptions: Object.keys(REMORSE).map(k => ({ value: k, label: REMORSE[k].label })),
      addressChangeOptions: Object.keys(ADDRESS_CHANGE).map(k => ({ value: k, label: ADDRESS_CHANGE[k].label })),
      fasterOptions: Object.keys(FASTER).map(k => ({ value: k, label: FASTER[k].label })),
      partialOptions: Object.keys(PARTIAL).map(k => ({ value: k, label: PARTIAL[k].label })),
      radioCodeOptions: Object.keys(RADIO_CODE).map(k => ({ value: k, label: RADIO_CODE[k].label })),
      pickupOptions: Object.keys(PICKUP).map(k => ({ value: k, label: PICKUP[k].label })),
      afterWindowOptions: Object.keys(AFTER_WINDOW).map(k => ({ value: k, label: AFTER_WINDOW[k].label })),   // v349
      timezoneOptions: Object.keys(TIMEZONES).map(k => ({ value: k, label: TIMEZONES[k] })) });   // v362
  } catch (e) { res.status(500).json({ error: 'Could not load Messages settings' }); }
});
app.post('/api/msg-settings', requireUser, express.json(), async (req, res) => {
  try {
    const b = req.body || {};
    const d = (await readUserData(req.user.id)) || { settings: {}, history: { pigtail: [], otherside: [] } };
    d.settings = d.settings || {};
    const instr = String(b.instructions || '').trim().slice(0, 4000);
    // v331: one choice per problem type + discount
    const problems = {};
    PROBLEM_TYPES.forEach(t => { const v = b.problems && b.problems[t.key]; problems[t.key] = t.options[v] ? v : t.def; });
    const pct = parseFloat(b.discount && b.discount.percent);
    d.settings.msgSettings = {
      instructions: instr === DEFAULT_MSG_INSTRUCTIONS ? '' : instr,   // the default is stored as "use default"
      problemPolicy: PROBLEM_POLICIES[b.problemPolicy] ? b.problemPolicy : 'return_or_refund',
      autoTranslate: b.autoTranslate !== false,
      problems,
      discount: { enabled: !!(b.discount && b.discount.enabled), percent: pct > 0 && pct < 90 ? Math.round(pct * 10) / 10 : 5 },
      fitment: { askVin: !!(b.fitment && b.fitment.askVin) },   // v333
      // v335
      deliveredMissing: DELIVERED_MISSING[b.deliveredMissing] ? b.deliveredMissing : 'check_first',
      modules: { askProgrammed: !(b.modules && b.modules.askProgrammed === false) },
      tone: TONES[b.tone] ? b.tone : 'friendly',
      signoff: String(b.signoff || '').trim().slice(0, 120),
      // v336
      photoRequests: PHOTO_REQUESTS[b.photoRequests] ? b.photoRequests : 'check_back',
      availability: String(b.availability || '').trim().slice(0, 200),
      // v339
      tested: TESTED_ANSWERS[b.tested] ? b.tested : 'warranty_return',
      testsParts: TESTS_PARTS[b.testsParts] ? b.testsParts : 'no',   // v341
      programming: PROGRAMMING_ANSWERS[b.programming] ? b.programming : 'may_need',
      offersProgramming: !!b.offersProgramming,
      donor: DONOR_ANSWERS[b.donor] ? b.donor : 'dont_have',
      shipWhen: SHIP_WHEN[b.shipWhen] ? b.shipWhen : 'ship_days',
      shipDays: String(b.shipDays || '').trim().slice(0, 200),
      intlNo: INTL_NO[b.intlNo] ? b.intlNo : 'ebay_no',
      buyerLanguage: !!b.buyerLanguage,
      // v345
      remorse: REMORSE[b.remorse] ? b.remorse : 'open_return',
      addressChange: ADDRESS_CHANGE[b.addressChange] ? b.addressChange : 'cancel_reorder',
      faster: FASTER[b.faster] ? b.faster : 'checkout',
      partial: PARTIAL[b.partial] ? b.partial : 'as_shown',
      radioCode: RADIO_CODE[b.radioCode] ? b.radioCode : 'dont_have',
      pickup: PICKUP[b.pickup] ? b.pickup : 'ship_only',
      afterWindow: AFTER_WINDOW[b.afterWindow] ? b.afterWindow : 'check_back',   // v349
      usVehicles: b.usVehicles !== false,
      timezone: TIMEZONES[b.timezone] ? b.timezone : 'America/Chicago',   // v362
      autoDraft: !!b.autoDraft,   // v365
      honorLate: { enabled: !!(b.honorLate && b.honorLate.enabled), days: [30, 60, 90].includes(parseInt(b.honorLate && b.honorLate.days, 10)) ? parseInt(b.honorLate.days, 10) : 60, address: String((b.honorLate && b.honorLate.address) || '').trim().slice(0, 300) },   // v350
    };
    await writeUserData(req.user.id, d);
    res.json({ ok: true });
  } catch (e) {
    console.error('[msg-settings]', e);
    res.status(500).json({ error: 'Could not save Messages settings' });
  }
});

// (v330 returnFacts — replaced in v332, kept for reference)
// // v330: the facts the AI gets about the sale and the return window — all worked out here
// async function returnFacts(userId, itemId) {
//   const lines = [];
//   let sold = null;
//   try {
//     const r = await pool.query(
//       `SELECT o.order_id, o.created_at, o.status, o.counted, o.ship_status FROM ebay_order_items i
//          JOIN ebay_orders o ON o.user_id = i.user_id AND o.order_id = i.order_id
//         WHERE i.user_id = $1 AND i.item_id = $2 ORDER BY o.created_at DESC LIMIT 1`, [userId, itemId]);
//     if (r.rows.length) {
//       sold = new Date(r.rows[0].created_at);
//       const ago = Math.floor((Date.now() - sold.getTime()) / 86400000);
//       lines.push('Sold on ' + sold.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'America/Los_Angeles' }) + ' (' + ago + ' day' + (ago === 1 ? '' : 's') + ' ago), order ' + r.rows[0].order_id + '.'
//         + (r.rows[0].ship_status === 'FULFILLED' ? ' It has shipped.' : r.rows[0].ship_status ? ' Not marked shipped yet.' : '')
//         + (!r.rows[0].counted ? ' This order was cancelled or refunded (' + r.rows[0].status + ').' : ''));
//     }
//   } catch (e) { /* no order info */ }
//   try {
//     const xml = await tradingCall(userId, 'GetItem', `<ItemID>${itemId}</ItemID><DetailLevel>ReturnAll</DetailLevel>`);
//     const rp = xmlTag(xmlTag(xml, 'Item') || '', 'ReturnPolicy') || '';
//     const accepted = xmlTag(rp, 'ReturnsAcceptedOption') || '';
//     if (/NotAccepted/i.test(accepted)) lines.push('Return policy: the listing does NOT accept returns (eBay\'s Money Back Guarantee still covers items not as described).');
//     else if (rp) {
//       const within = xmlTag(rp, 'ReturnsWithinOption') || '';
//       const days = parseInt((/(\d+)/.exec(within) || [])[1], 10);
//       const payer = xmlTag(rp, 'ShippingCostPaidByOption') || '';
//       lines.push('Return policy: returns accepted' + (days ? ' within ' + days + ' days' : '') + (payer ? '; return shipping paid by the ' + payer.toLowerCase() : '') + '.');
//       if (days && sold) {
//         const left = days - Math.floor((Date.now() - sold.getTime()) / 86400000);
//         lines.push(left >= 0
//           ? 'Return window: INSIDE — about ' + left + ' day' + (left === 1 ? '' : 's') + ' left counting from the sale date (eBay counts from delivery, so the buyer may have a few days more).'
//           : 'Return window: ENDED — about ' + (-left) + ' day' + (left === -1 ? '' : 's') + ' ago counting from the sale date (eBay counts from delivery, so if it was very recent, the seller should double-check).');
//       }
//     }
//   } catch (e) { lines.push('The listing\'s return policy could not be loaded.'); }
//   return lines.join('\n');
// }

// (v332–v336 shipmentFacts / returnFacts start — replaced in v337, kept for reference)
// // v332: SHIPMENT — tracking, carrier and delivery dates for one order, from Trading GetOrders
// // (ShipmentTrackingDetails + ShippingPackageInfo). Read live, never stored.
// async function shipmentFacts(userId, orderId) {
//   const xml = await tradingCall(userId, 'GetOrders',
//     `<OrderIDArray><OrderID>${xmlEsc(orderId)}</OrderID></OrderIDArray><DetailLevel>ReturnAll</DetailLevel>`);
//   const order = xmlTag(xml, 'Order') || '';
//   if (!order) return null;
//   const firstOf = (tag) => xmlAll(order, tag).map(v => xmlDecode(v).trim()).find(Boolean) || null;
//   const tracks = [];
//   xmlAll(order, 'ShipmentTrackingDetails').forEach(t => {
//     const num = xmlDecode(xmlTag(t, 'ShipmentTrackingNumber') || '').trim();
//     const car = xmlDecode(xmlTag(t, 'ShippingCarrierUsed') || '').trim();
//     if (num && !tracks.some(x => x.number === num)) tracks.push({ number: num, carrier: car });
//   });
//   return {
//     tracks,
//     shippedTime: firstOf('ShippedTime'),
//     deliveredTime: firstOf('ActualDeliveryTime'),
//     expectedMax: firstOf('ScheduledDeliveryTimeMax') || firstOf('EstimatedDeliveryTimeMax')
//   };
// }
// const dayText = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'America/Los_Angeles' });
// const daysSince = (d) => Math.floor((Date.now() - new Date(d).getTime()) / 86400000);

// // v330: the facts the AI gets about the sale and the return window — all worked out here
// // v332: + SHIPMENT (tracking / delivered), and the return window counts from delivery like eBay
// async function returnFacts(userId, itemId) {
//   const lines = [];
//   let sold = null, ship = null, shipErr = null;
//   try {
//     const r = await pool.query(
//       `SELECT o.order_id, o.created_at, o.status, o.counted, o.ship_status FROM ebay_order_items i
//          JOIN ebay_orders o ON o.user_id = i.user_id AND o.order_id = i.order_id
//         WHERE i.user_id = $1 AND i.item_id = $2 ORDER BY o.created_at DESC LIMIT 1`, [userId, itemId]);
//     if (r.rows.length) {
//       const o = r.rows[0];
//       sold = new Date(o.created_at);
//       const ago = daysSince(sold);
//       lines.push('Sold on ' + sold.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'America/Los_Angeles' }) + ' (' + ago + ' day' + (ago === 1 ? '' : 's') + ' ago), order ' + o.order_id + '.'
//         + (o.ship_status === 'FULFILLED' ? ' It has shipped.' : o.ship_status ? ' Not marked shipped yet.' : '')
//         + (!o.counted ? ' This order was cancelled or refunded (' + o.status + ').' : ''));
//       try { ship = await shipmentFacts(userId, o.order_id); } catch (e) { shipErr = e.message; }
//     }
//   } catch (e) { /* no order info */ }

//   // SHIPMENT

// v332: SHIPMENT — tracking, carrier and delivery dates for one order, from Trading GetOrders
// (ShipmentTrackingDetails + ShippingPackageInfo). Read live, never stored.
// v337: split so one GetOrders call can read several orders; also reads the buyer's user ID
//       (only to match the order to the conversation — never stored).
function parseOrderShip(order) {
  const firstOf = (tag) => xmlAll(order, tag).map(v => xmlDecode(v).trim()).find(Boolean) || null;
  const tracks = [];
  xmlAll(order, 'ShipmentTrackingDetails').forEach(t => {
    const num = xmlDecode(xmlTag(t, 'ShipmentTrackingNumber') || '').trim();
    const car = xmlDecode(xmlTag(t, 'ShippingCarrierUsed') || '').trim();
    if (num && !tracks.some(x => x.number === num)) tracks.push({ number: num, carrier: car });
  });
  return {
    orderId: xmlDecode(xmlTag(order, 'OrderID') || '').trim(),
    buyer: xmlDecode(xmlTag(order, 'BuyerUserID') || '').trim(),
    tracks,
    paidTime: firstOf('PaidTime'),
    shippedTime: firstOf('ShippedTime'),
    deliveredTime: firstOf('ActualDeliveryTime'),
    expectedMax: firstOf('ScheduledDeliveryTimeMax') || firstOf('EstimatedDeliveryTimeMax')
  };
}
async function ordersShipInfo(userId, orderIds) {
  if (!orderIds.length) return [];
  const xml = await tradingCall(userId, 'GetOrders',
    `<OrderIDArray>${orderIds.map(id => `<OrderID>${xmlEsc(id)}</OrderID>`).join('')}</OrderIDArray><DetailLevel>ReturnAll</DetailLevel>`);
  return xmlAll(xmlTag(xml, 'OrderArray') || xml, 'Order').map(parseOrderShip);
}
// async function shipmentFacts(userId, orderId) { … }   (v332 — now ordersShipInfo)
async function shipmentFacts(userId, orderId) {
  const list = await ordersShipInfo(userId, [orderId]);
  return list[0] || null;
}

// v337: the order for THIS conversation's buyer (an item can sell more than once). Without a buyer
//       name, the latest order. Returns { row, ship, shipErr, otherBuyer }.
async function findBuyerOrder(userId, itemId, buyer) {
  const out = { row: null, ship: null, shipErr: null, otherBuyer: false };
  let rows = [];
  try {
    rows = (await pool.query(
      `SELECT o.order_id, o.created_at, o.status, o.counted, o.ship_status, o.total FROM ebay_order_items i
         JOIN ebay_orders o ON o.user_id = i.user_id AND o.order_id = i.order_id
        WHERE i.user_id = $1 AND i.item_id = $2 ORDER BY o.created_at DESC LIMIT 5`, [userId, itemId])).rows;
  } catch (e) { return out; }
  if (!rows.length) return out;
  let infos = [];
  try { infos = await ordersShipInfo(userId, rows.map(r => r.order_id)); } catch (e) { out.shipErr = e.message; }
  if (buyer && infos.some(x => x.buyer)) {   // only when eBay gave buyer IDs
    const hit = infos.find(x => x.buyer && x.buyer.toLowerCase() === String(buyer).toLowerCase());
    if (!hit) { out.otherBuyer = true; return out; }
    out.ship = hit;
    out.matched = true;   // v343: this buyer's own order
    out.row = rows.find(r => r.order_id === hit.orderId) || rows[0];
    return out;
  }
  out.row = rows[0];
  out.ship = infos.find(x => x.orderId === rows[0].order_id) || infos[0] || null;
  return out;
}
const dayText = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'America/Los_Angeles' });
const daysSince = (d) => Math.floor((Date.now() - new Date(d).getTime()) / 86400000);

// v330: the facts the AI gets about the sale and the return window — all worked out here
// v332: + SHIPMENT (tracking / delivered), and the return window counts from delivery like eBay
// v337: + buyer — uses the order this buyer placed (not another buyer's)
async function returnFacts(userId, itemId, buyer, info) {   // v343: + info (filled with the order dates)
  const lines = [];
  let sold = null, ship = null, shipErr = null;
  const fo = await findBuyerOrder(userId, itemId, buyer);
  if (fo.otherBuyer) lines.push('This buyer has NOT bought this item (it was sold to someone else).');
  else if (fo.row) {
    const o = fo.row;
    sold = new Date(o.created_at);
    const ago = daysSince(sold);
    lines.push((fo.matched ? 'THIS BUYER bought it on ' : 'Sold on ') + sold.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'America/Los_Angeles' }) + ' (' + ago + ' day' + (ago === 1 ? '' : 's') + ' ago), order ' + o.order_id + '.'
      + (o.ship_status === 'FULFILLED' ? ' It has shipped.' : o.ship_status ? ' Not marked shipped yet.' : '')
      + (!o.counted ? ' This order was cancelled or refunded (' + o.status + ').' : ''));
    ship = fo.ship; shipErr = fo.shipErr;
    if (info) { info.boughtAt = o.created_at; info.shippedAt = (fo.ship && fo.ship.shippedTime) || null; info.deliveredAt = (fo.ship && fo.ship.deliveredTime) || null; info.cancelled = !o.counted; }   // v343
  }

  // SHIPMENT
  if (ship) {
    const s = [];
    if (ship.tracks.length) s.push('Tracking: ' + ship.tracks.map(t => (t.carrier ? t.carrier + ' ' : '') + t.number).join(', ') + '.');
    else s.push('Tracking: no tracking number on the order.');
    if (ship.shippedTime) s.push('Shipped ' + dayText(ship.shippedTime) + '.');
    if (ship.deliveredTime) s.push('eBay shows it DELIVERED on ' + dayText(ship.deliveredTime) + ' (' + daysSince(ship.deliveredTime) + ' days ago).');
    else if (ship.expectedMax) {
      const late = daysSince(ship.expectedMax);
      s.push('eBay does not show it delivered yet. Expected by ' + dayText(ship.expectedMax) + (late > 0 ? ' — that date PASSED ' + late + ' day' + (late === 1 ? '' : 's') + ' ago.' : '.'));
    } else s.push('eBay does not show it delivered yet.');
    lines.push('SHIPMENT: ' + s.join(' ') + ' (eBay doesn\'t give the carrier\'s scan-by-scan status — don\'t describe where the package is.)');
  } else if (shipErr) lines.push('SHIPMENT: tracking info could not be loaded.');

  try {
    const xml = await tradingCall(userId, 'GetItem', `<ItemID>${itemId}</ItemID><DetailLevel>ReturnAll</DetailLevel>`);
    const rp = xmlTag(xmlTag(xml, 'Item') || '', 'ReturnPolicy') || '';
    const ht = parseInt(xmlTag(xmlTag(xml, 'Item') || '', 'DispatchTimeMax') || '', 10);   // v339
    // v342: live listing status — ended / sold out matters for buyers who haven't bought it
    {
      const it = xmlTag(xml, 'Item') || '';
      const st = xmlTag(xmlTag(it, 'SellingStatus') || '', 'ListingStatus') || '';
      const qty = parseInt(xmlTag(it, 'Quantity') || '', 10);
      const sold = parseInt(xmlTag(xmlTag(it, 'SellingStatus') || '', 'QuantitySold') || '0', 10) || 0;
      const left = qty >= 0 ? Math.max(0, qty - sold) : null;
      if (info) info.listingEnded = (st && st !== 'Active') || left === 0;   // v349
      if (info) info.livePrice = parseFloat(xmlTag(xmlTag(it, 'SellingStatus') || '', 'CurrentPrice') || '') || null;   // v356
      // v354: the listing's US shipping, live
      const sd = xmlTag(it, 'ShippingDetails') || '';
      const opt = xmlAll(sd, 'ShippingServiceOptions')[0] || '';
      const stype = xmlTag(sd, 'ShippingType') || '';
      const free = opt && xmlTag(opt, 'FreeShipping') === 'true';
      const cost = parseFloat(xmlTag(opt, 'ShippingServiceCost') || '');
      const svc = xmlDecode(xmlTag(opt, 'ShippingService') || '').replace(/([a-z])([A-Z])/g, '$1 $2');
      if (free) lines.push('SHIPPING COST (live, US): FREE shipping' + (svc ? ' (' + svc + ')' : '') + '.');
      else if (/Calculated/i.test(stype)) lines.push('SHIPPING COST (live, US): CALCULATED — it depends on the buyer\'s location; they see the exact cost by entering their ZIP code on the listing.');
      else if (!isNaN(cost)) lines.push('SHIPPING COST (live, US): FLAT RATE $' + cost.toFixed(2) + (svc ? ' (' + svc + ')' : '') + ' to anywhere in the US.');
      if (st && st !== 'Active') lines.push('LISTING STATUS (live): ENDED' + (sold > 0 ? ' \u2014 sold' : '') + '. It is no longer available to buy.');
      else if (left === 0) lines.push('LISTING STATUS (live): SOLD OUT \u2014 none left to buy.');
      else if (st) lines.push('LISTING STATUS (live): active' + (left !== null ? ', ' + left + ' available' : '') + '.');
    }
    if (ht >= 0) lines.push('Handling time (listing): ships within ' + ht + ' business day' + (ht === 1 ? '' : 's') + ' of payment.');
    const accepted = xmlTag(rp, 'ReturnsAcceptedOption') || '';
    if (/NotAccepted/i.test(accepted)) lines.push('Return policy: the listing does NOT accept returns (eBay\'s Money Back Guarantee still covers items not as described).');
    else if (rp) {
      const within = xmlTag(rp, 'ReturnsWithinOption') || '';
      const days = parseInt((/(\d+)/.exec(within) || [])[1], 10);
      const payer = xmlTag(rp, 'ShippingCostPaidByOption') || '';
      // lines.push('Return policy: returns accepted' + (days ? ' within ' + days + ' days' : '') + (payer ? '; return shipping paid by the ' + payer.toLowerCase() : '') + '.');
      lines.push('Return policy: returns accepted' + (days ? ' within ' + days + ' days' : '') + (payer ? '; for changed-mind returns, return shipping is paid by the ' + payer.toLowerCase() + ' (for damaged / defective / not-as-described items the seller always pays — eBay rule)' : '') + '.');   // v352
      if (days && ship && ship.deliveredTime) {
        // eBay counts the return window from delivery
        const left = days - daysSince(ship.deliveredTime);
        const lastDay = dayText(new Date(new Date(ship.deliveredTime).getTime() + days * 86400000));   // v334
        lines.push(left >= 0
          // ? 'Return window: INSIDE — ' + left + ' day' + (left === 1 ? '' : 's') + ' left, counting from the delivery date.'
          ? 'Return window: INSIDE — ' + left + ' day' + (left === 1 ? '' : 's') + ' left, counting from the delivery date. Last day to open a return: ' + lastDay + '.'   // v334
          : 'Return window: ENDED — ' + (-left) + ' day' + (left === -1 ? '' : 's') + ' ago, counting from the delivery date.');
      } else if (days && ship && ship.shippedTime) {
        // lines.push('Return window: INSIDE — it hasn\'t started yet (eBay doesn\'t show the package delivered).');
        lines.push('Return window: INSIDE — it hasn\'t started yet (eBay doesn\'t show the package delivered). The buyer will have ' + days + ' days from delivery to open a return.');   // v334
      } else if (days && sold) {
        const left = days - daysSince(sold);
        const lastDay = dayText(new Date(sold.getTime() + days * 86400000));   // v334
        lines.push(left >= 0
          // ? 'Return window: INSIDE — about ' + left + ' day' + (left === 1 ? '' : 's') + ' left counting from the sale date (eBay counts from delivery, so the buyer may have a few days more).'
          ? 'Return window: INSIDE — at least ' + left + ' day' + (left === 1 ? '' : 's') + ' left (counted from the sale date; eBay counts from delivery, so the buyer may have a few days more). Say they have until at least ' + lastDay + '.'   // v334
          : 'Return window: ENDED — about ' + (-left) + ' day' + (left === -1 ? '' : 's') + ' ago counting from the sale date (eBay counts from delivery, so if it was very recent, the seller should double-check).');
      }
    }
  } catch (e) { lines.push('The listing\'s return policy could not be loaded.'); }
  return lines.join('\n');
}

// v332: the listing's part number(s), from item specifics. "Does not apply" etc. count as none.
// (v332 partNumbersOf — replaced in v348)
// function partNumbersOf(specifics) {
//   const out = [];
//   (specifics || []).forEach(sp => {
//     if (!/part\s*number|^mpn$|interchange/i.test(sp.name || '')) return;
//     String(sp.value || '').split(/\s*,\s*/).forEach(v => {
//       v = v.trim();
//       if (!v || /^(does not apply|not applicable|n\/?a|na|none|unknown|unbranded|-+|\.)$/i.test(v)) return;
//       if (!out.some(x => x.value.toLowerCase() === v.toLowerCase())) out.push({ name: sp.name, value: v });
//     });
//   });
//   return out;
// }
// v348: your listings put years and keywords in the part-number item specifics (for search), so
//       pick out only things that look like part numbers: at least 5 letters/digits with a digit, not
//       a year; the same number written different ways (spaces, dashes) counts once.
function partNumbersOf(specifics) {
  const out = [];
  const norm = (t) => String(t).toUpperCase().replace(/[^A-Z0-9]/g, '');
  const list = (specifics || []).filter(sp => /part\s*number|^mpn$|interchange/i.test(sp.name || ''))
    .sort((x, y) => (/manufacturer|^mpn$/i.test(y.name) ? 1 : 0) - (/manufacturer|^mpn$/i.test(x.name) ? 1 : 0));   // Manufacturer Part Number first
  list.forEach(sp => {
    String(sp.value || '').split(/\s*[,;\/|]\s*/).forEach(piece => {
      piece = piece.trim();
      if (!piece || /^(does not apply|not applicable|n\/?a|na|none|unknown|unbranded|-+|\.)$/i.test(piece)) return;
      const toks = piece.split(/\s+/).map(t => t.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, '')).filter(Boolean);
      toks.forEach(tok => {
        const n = norm(tok);
        if (n.length < 5 || (n.match(/\d/g) || []).length < 2) return;   // too short / hardly any digits (words like "MODULE", engine codes like "1AZ-FE")
        if (toks.some(o => o !== tok && norm(o).length > n.length && norm(o).includes(n))) return;   // a piece of a longer number written with spaces ("YL34 14B205 BA")
        if (/^(19|20)\d\d$/.test(n) || /^\d{1,4}$/.test(n)) return;   // years
        if (/^\d+(\.\d+)?L$/i.test(tok)) return;                // engine sizes like 2.3L
        const same = out.find(x => norm(x.value) === n);
        if (same) { if (/-/.test(tok) && !/-/.test(same.value)) same.value = tok; return; }   // prefer the dashed way of writing it
        out.push({ name: sp.name, value: tok });
      });
    });
  });
  return out;
}

// v330: AUTO-TRANSLATE — only messages that don't look English are sent to the AI; answers are
// remembered in memory so reopening a conversation doesn't spend tokens again.
const translateCache = new Map();   // messageId → { lang, english } or null (already English)
// (no 'a', 'no', 'me' — they're also Spanish/Italian words)
const EN_WORDS = new Set('the an and or is are was it this that to for of in on with you your my we have has do does can will would not yes please thanks thank hi hello what when where how if part fit fits car truck shipping ship price'.split(' '));
function looksEnglish(text) {
  const words = String(text || '').toLowerCase().match(/[a-z\u00c0-\u024f\u0400-\u04ff']+/g) || [];
  if (/[^\u0000-\u024f\s\d.,!?;:'"()\-\/$%&@#*+=]/.test(text)) return false;   // other alphabets (Cyrillic, Chinese, Arabic…)
  if (words.length < 3) return true;
  const hits = words.filter(w => EN_WORDS.has(w)).length;
  return hits / words.length >= 0.12;
}
app.post('/api/threads/:id/translate', requireUser, express.json({ limit: '200kb' }), async (req, res) => {
  try {
    const list = ((req.body && req.body.messages) || []).slice(0, 60)
      .map(m => ({ id: String(m.id || '').slice(0, 80), text: String(m.text || '').slice(0, 3000) })).filter(m => m.id && m.text);
    const out = {};
    const todo = [];
    list.forEach(m => {
      if (translateCache.has(m.id)) { const c = translateCache.get(m.id); if (c) out[m.id] = c; }
      else if (looksEnglish(m.text)) translateCache.set(m.id, null);
      else todo.push(m);
    });
    if (todo.length) {
      const settings = await getUserSettings(req.user.id);
      const apiKey = String(settings.apiKey || '').trim();
      if (!apiKey) return res.json({ translations: out, error: 'Add your Anthropic API key in ⚙ Settings → Account to translate.' });
      const model = String(settings.claudeModel || '').trim() || 'claude-sonnet-4-5';
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model, max_tokens: 2500,
          system: 'Translate eBay buyer messages to English. Reply with ONLY a JSON array, one object per message: {"id": "...", "lang": "language name in English", "english": "the translation"}. If a message is already English, use "lang": "English" and "english": "". Keep part numbers, names and numbers exactly as written.',
          messages: [{ role: 'user', content: JSON.stringify(todo) }] }),
        signal: AbortSignal.timeout(60000)
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) return res.json({ translations: out, error: 'Translation failed: ' + ((d.error && d.error.message) || ('HTTP ' + r.status)) });
      const txt = ((d.content || []).filter(c => c.type === 'text').map(c => c.text).join('') || '');
      let arr = [];
      try { arr = JSON.parse((/\[[\s\S]*\]/.exec(txt) || ['[]'])[0]); } catch (e) { arr = []; }
      arr.forEach(x => {
        if (!x || !x.id) return;
        const val = x.english && !/^english$/i.test(x.lang || '') ? { lang: String(x.lang || 'another language'), english: String(x.english) } : null;
        translateCache.set(String(x.id), val);
        if (val) out[x.id] = val;
      });
      if (translateCache.size > 5000) translateCache.clear();
    }
    res.json({ translations: out });
  } catch (e) {
    console.error('[translate]', e.message);
    res.json({ translations: {}, error: 'Translation failed: ' + e.message });
  }
});

// app.post('/api/threads/:id/draft', requireUser, express.json(), async (req, res) => {
const draftHandler = async (req, res) => {   // v347: named, so the sandbox download can run the same code
  const id = String(req.params.id || '');
  const b = req.body || {};
  const itemId = /^\d{6,20}$/.test(String(b.itemId || '')) ? String(b.itemId) : null;
  const hint = String(b.hint || '').trim().slice(0, 500);
  const pickedCountry = countryByCode(b.country) ? String(b.country).toUpperCase() : null;   // v329: from the Ships-to box
  if (!/^[\w.:-]{1,80}$/.test(id)) return res.status(400).json({ error: 'Bad conversation' });
  try {
    const settings = await getUserSettings(req.user.id);
    const apiKey = String(settings.apiKey || '').trim();
    // if (!apiKey) return res.status(400).json({ error: 'Add your Anthropic API key in the Listing Tool → ⚙ Settings first.' });
    if (!apiKey) return res.status(400).json({ error: 'Add your Anthropic API key in ⚙ Settings → Account first.' });   // v326
    const model = String(settings.claudeModel || '').trim() || 'claude-sonnet-4-5';
    const ms0 = msgSettingsOf(settings);   // v331
    const conn = await getConnection(req.user.id);
    const blocked = threadsBlocked(conn); if (blocked) return res.status(400).json({ error: 'Reconnect eBay to approve message threads first.' });

    // the conversation (last 30 messages)
    const me = await myEbayUser(req.user.id);
    const msgs = [];
    for (let offset = 0; offset < 300; offset += 50) {
      const q = new URLSearchParams({ conversation_type: 'FROM_MEMBERS', limit: '50', offset: String(offset) });
      const { data } = await restCall(req.user.id, 'GET', '/commerce/message/v1/conversation/' + encodeURIComponent(id) + '?' + q);
      // ((data && data.messages) || []).forEach(m => msgs.push({ from: m.senderUsername || '', date: m.createdDate || '', text: m.messageBody || '', mine: !!(me && m.senderUsername === me) }));
      ((data && data.messages) || []).forEach(m => msgs.push({ from: m.senderUsername || '', date: m.createdDate || '', text: m.messageBody || '', mine: !!(me && m.senderUsername === me), media: (m.messageMedia || []).length, images: (m.messageMedia || []).filter(x => x && /IMAGE/i.test(x.mediaType || 'IMAGE') && /^https:\/\//.test(x.mediaUrl || '')).map(x => x.mediaUrl) }));   // v349: + media count, v353: + image links
      if (!data || !data.next || ((data && data.messages) || []).length < 50) break;
    }
    msgs.sort((x, y) => String(x.date).localeCompare(String(y.date)));
    // v347: sandbox — only the conversation before your actual reply
    if (req._sandbox && req._sandbox.before) { const keep = msgs.filter(m => String(m.date) < req._sandbox.before); msgs.length = 0; keep.forEach(m => msgs.push(m)); }
    if (req._sandbox) req._sandbox.msgs = msgs;
    // const convo = msgs.slice(-30).map(m => (m.mine ? 'SELLER (me)' : 'BUYER (' + m.from + ')') + ' [' + String(m.date).slice(0, 10) + ']: ' + m.text).join('\n');
    const convo = msgs.slice(-30).map(m => (m.mine ? 'SELLER (me)' : 'BUYER (' + m.from + ')') + ' [' + String(m.date).slice(0, 10) + ']: ' + m.text + (m.media ? ' [' + m.media + ' photo(s) attached]' : '')).join('\n');   // v349, v353: whether you can see them is said below
    if (!convo) return res.status(400).json({ error: 'There\u2019s no message to answer yet.' });
    // v341: nothing to answer → say so instead of drafting (a note in the box still writes a follow-up)
    const lastMsg = msgs[msgs.length - 1];
    if (!hint && lastMsg && lastMsg.mine) return res.json({ noReply: true, reason: 'You sent the last message, so there\u2019s nothing new to answer. To send a follow-up, type what you want to say in the box next to AI draft and click AI draft again.' });
    if (!hint && lastMsg && isCloser(lastMsg.text)) return res.json({ noReply: true, reason: 'The buyer\u2019s last message (\u201c' + String(lastMsg.text).trim().slice(0, 60) + '\u201d) doesn\u2019t need an answer. To reply anyway, type what you want to say in the box next to AI draft.' });

    // the listing
    // let listing = 'No listing is attached to this conversation.';
    let listing = 'No listing is attached to this conversation.\nPART NUMBER: unknown (no listing).';   // v332
    let mainPN = null, listingLoaded = false;   // v362: for the part-number check the app adds if the AI leaves it out
    if (itemId) {
      const it = await getItemData(req.user.id, itemId);
      // const fit = await getFitment(req.user.id, itemId);
      const fitRows = await getFitmentRows(req.user.id, itemId);   // v363: the whole list
      const fit = fitmentSummary(fitRows);
      if (it.data) {
        const d = it.data;
        listingLoaded = true; mainPN = (partNumbersOf(d.specifics)[0] || {}).value || null;   // v362
        listing = [
          'Title: ' + (d.title || ''),
          'Item number: ' + d.itemId,
          (() => { const pk = partKind(d.title, d.category); return 'PART TYPE: ' + (pk.kind === 'pigtail' ? 'wiring pigtail / connector plugs — just the wires and plugs, NOT the module itself. Programming and codes don\'t apply, so don\'t bring them up. Any part number listed is the module these plugs connect to.' : pk.kind === 'module' ? 'computer/control module — can need programming to the vehicle' : pk.kind === 'radio' ? 'radio/audio — doesn\'t need programming, but may need a radio (anti-theft) code' : 'not a module — no programming or code needed'); })(),   // v364
          d.price ? 'Price: $' + d.price : '',
          d.condition ? 'Condition: ' + d.condition + (d.conditionNote ? ' — ' + d.conditionNote : '') : '',
          d.category ? 'Category: ' + d.category : '',
          // d.listingStatus ? 'Listing status: ' + d.listingStatus : '',   (v342: saved copy can be old — the live status is in ORDER & RETURNS)
          (d.specifics || []).length ? 'Item specifics:\n' + d.specifics.map(s => '- ' + s.name + ': ' + s.value).join('\n') : '',
          // v332: say plainly whether there is a part number
          // (() => { const pn = partNumbersOf(d.specifics); return pn.length ? 'PART NUMBER: ' + pn.map(x => x.value + ' (' + x.name + ')').join('; ') : 'PART NUMBER: NONE — this listing has no part number.'; })(),
          (() => { const pn = partNumbersOf(d.specifics); return pn.length ? 'PART NUMBER: ' + pn.slice(0, 4).map(x => x.value).join(', ') + (pn.length > 4 ? ' (and ' + (pn.length - 4) + ' more interchange numbers)' : '') + ' — the first is the main one' : 'PART NUMBER: NONE — this listing has no part number.'; })(),   // v348
          // fit.length ? 'Fitment list (vehicles the listing says it fits' + (fit.length >= 200 ? ', first 200' : '') + '):\n' + fit.map(f => '- ' + f).join('\n') : 'Fitment list: none on the listing.',
          fit.length ? 'Fitment list (every vehicle the listing\'s compatibility chart covers, by make and model; year ranges include every year between):\n' + fit.map(f => '- ' + f).join('\n') : 'Fitment list: none on the listing.',   // v363
          (() => { const ys = (String(d.title || '').match(/\b(19[5-9]\d|20[0-4]\d)\b/g) || []).map(Number); return ys.length ? 'Years in the title: ' + (ys.length > 1 ? Math.min(...ys) + '\u2013' + Math.max(...ys) + ' (every year in between)' : ys[0]) + ' — the title\'s years and models count as listed fitment too.' : ''; })(),   // v363
          'Description:\n' + htmlToText(d.description).slice(0, 6000)
        ].filter(Boolean).join('\n');
      } else listing = 'The listing details could not be loaded (' + (it.error || 'unknown') + ').';
    }

    // v331: DISCOUNT — if it's switched on and the buyer's latest message asks for a lower price
    let discount = null;
    if (itemId && ms0.discount.enabled) {
      const lastBuyer = msgs.filter(m => !m.mine).slice(-1)[0];
      const it0 = await getItemData(req.user.id, itemId);
      const price = it0.data && it0.data.price;
      // if (lastBuyer && price && asksForDiscount(lastBuyer.text)) {
      // v339: the AI decides whether the buyer is asking for a lower price (it says OFFER: yes)
      if (lastBuyer && price) {
        // const offer = Math.round(price * (1 - ms0.discount.percent / 100) * 100) / 100;
        const offer = offerPriceFor(price, ms0.discount.percent);   // v356
        discount = { percent: ms0.discount.percent, price, offerPrice: offer, wordMatch: asksForDiscount(lastBuyer.text) };
      }
    }

    // v330: ORDER & RETURNS — the sale date and return window, calculated here (the AI never does date math)
    // const orderFacts = itemId ? await returnFacts(req.user.id, itemId) : '';
    const buyerName = (msgs.find(m => !m.mine && m.from) || {}).from || '';   // v337: this conversation's buyer
    // const orderFacts = itemId ? await returnFacts(req.user.id, itemId, buyerName) : '';
    const orderInfo = {};   // v343
    const orderFacts = itemId ? await returnFacts(req.user.id, itemId, buyerName, orderInfo) : '';
    // v349: no discount once this buyer has bought it, or the listing has ended / sold out
    if (discount && ((orderInfo.boughtAt && !orderInfo.cancelled) || orderInfo.listingEnded)) discount = null;
    // v356: use the live listing price (the saved copy can be out of date)
    if (discount && orderInfo.livePrice && orderInfo.livePrice !== discount.price) { discount.price = orderInfo.livePrice; discount.offerPrice = offerPriceFor(orderInfo.livePrice, discount.percent); }
    // v355: can eBay actually send an offer on this listing right now? (same check as the Offers panel)
    let discountSkipped = null;
    if (discount && !req._sandbox) {
      try {
        if (!hasScope(conn, INV_SCOPE)) discountSkipped = 'eBay offers need one more permission (⚙ Settings → Admin → Reconnect eBay)';
        else {
          let eligible = false;
          for (let offset = 0; offset < 1000 && !eligible; offset += 200) {
            const { status, data } = await restCall(req.user.id, 'GET', '/sell/negotiation/v1/find_eligible_items?limit=200&offset=' + offset, null, { 'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US' });
            const list = (status === 204 || !data) ? [] : (data.eligibleItems || []);
            if (list.some(x => String(x.listingId) === String(itemId))) eligible = true;
            if (!data || !data.next || list.length < 200) break;
          }
          if (!eligible) discountSkipped = 'eBay has no interested buyers to send an offer to on this listing';
        }
      } catch (e) { discountSkipped = 'couldn\u2019t check with eBay (' + String(e.message).slice(0, 80) + ')'; }
      // if (discountSkipped) discount = null;   // → the draft says the price is as listed instead
      if (discountSkipped) { const asked = discount.wordMatch; discount = null; if (!asked) discountSkipped = null; }   // v360: no offer either way; the note only when they asked about price
    }
    // v350: LATE RETURN — your own extra days, counted from delivery (from the purchase date if eBay has no delivery date)
    let lateReturn = '';
    let lateInfo = null;   // v376: shown under the draft
    // if (ms0.honorLate.enabled && orderInfo.boughtAt && !orderInfo.cancelled && /Return window: ENDED/.test(orderFacts)) {
    //   const from = orderInfo.deliveredAt || orderInfo.boughtAt;
    //   const left = … (counted to today)
    if (ms0.honorLate.enabled && orderInfo.boughtAt && !orderInfo.cancelled && /Return window: ENDED/.test(orderFacts)) {
      // v376: counted up to when the buyer FIRST ASKED (their first message after buying), not today
      const from = orderInfo.deliveredAt || orderInfo.boughtAt;
      const firstAsk = msgs.find(m => !m.mine && m.date && new Date(m.date) >= new Date(orderInfo.boughtAt));
      const askedAt = firstAsk ? new Date(firstAsk.date) : new Date();
      const askedDay = Math.max(0, Math.floor((askedAt.getTime() - new Date(from).getTime()) / 86400000));
      const askedText = askedAt.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', timeZone: 'America/Los_Angeles' });
      const lateReply = Date.now() - askedAt.getTime() > 2 * 86400000;
      lateInfo = { ok: askedDay <= ms0.honorLate.days, askedDay, days: ms0.honorLate.days, asked: askedAt.toISOString() };
      if (askedDay <= ms0.honorLate.days) lateReturn = 'The eBay return window has closed, but the seller accepts returns up to ' + ms0.honorLate.days + ' days after delivery, and this buyer asked on ' + askedText + ' — day ' + askedDay + ' after delivery, inside that' + (lateReply ? ' (the seller is replying late, which is not the buyer\'s fault, so the seller still honors it)' : '') + '. If they want to return it or say it doesn\'t work: say the eBay return window has closed, but they can still ship it back '
        + (ms0.honorLate.address ? 'to this address: ' + ms0.honorLate.address.replace(/\s*\n\s*/g, ', ') : '(say you\'ll send them the return address)') + ' — and ask them to please mail it within 2 weeks, and you\'ll refund them once it arrives (no calendar date).';
      // v377: past your extra days → just say the window has passed
      else lateReturn = 'The buyer asked on ' + askedText + ' — day ' + askedDay + ' after delivery, which is PAST both eBay\'s return window and the seller\'s own ' + ms0.honorLate.days + '-day late-return limit. If they want to return it or say it doesn\'t work: politely say sorry, the return window has passed, so you can\'t take it back. Do NOT offer to look into it, check, or get back to them, and don\'t name a day. Never call it "sold as-is" and never blame eBay.';
    }
    if (false) {   // v371 version below, kept for reference (v376: replaced above)
      const from = orderInfo.deliveredAt || orderInfo.boughtAt;
      const left = ms0.honorLate.days - Math.floor((Date.now() - new Date(from).getTime()) / 86400000);
      const lastDay = new Date(new Date(from).getTime() + ms0.honorLate.days * 86400000).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', timeZone: 'America/Los_Angeles' });
      if (left >= 0) lateReturn = 'The eBay return window has closed, but the seller still accepts returns up to ' + ms0.honorLate.days + ' days after delivery, and this buyer is inside that: ' + left + ' day' + (left === 1 ? '' : 's') + ' left (until ' + lastDay + '). If they want to return it or say it doesn\'t work: say the eBay return window has closed, but they can still ship it back '
        + (ms0.honorLate.address ? 'to this address: ' + ms0.honorLate.address.replace(/\s*\n\s*/g, ', ') : '(say you\'ll send them the return address)') + ' — and ask them to please mail it within 2 weeks, and you\'ll refund them once it arrives (no calendar date).';   // v371 (was: "Give the last day.")
    }
    const statusLead = (orderInfo.listingEnded && !orderInfo.boughtAt) ? 'IMPORTANT: this listing has SOLD / ENDED and this buyer did not buy it. Start the reply by saying sorry, it has sold and is no longer available.\n\n' : '';
    // v343: TIMELINE — did the buyer's questions come before they bought it?
    let timeline = '';
    const lastBuyerMsg = msgs.filter(m => !m.mine).slice(-1)[0];
    if (orderInfo.boughtAt && !orderInfo.cancelled && lastBuyerMsg) {
      const asked = Date.parse(lastBuyerMsg.date), bought = Date.parse(orderInfo.boughtAt);
      const fmt = (x) => new Date(x).toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'America/Los_Angeles' });
      const status = orderInfo.deliveredAt ? 'it was delivered on ' + fmt(orderInfo.deliveredAt) : orderInfo.shippedAt ? 'it shipped on ' + fmt(orderInfo.shippedAt) : 'it has not shipped yet';
      timeline = asked < bought
        ? 'The buyer\'s latest message (' + fmt(asked) + ') was sent BEFORE they bought the item (' + fmt(bought) + '); ' + status + '. Their earlier question was never answered before they bought.'
        : 'This buyer bought the item on ' + fmt(bought) + ' and wrote after that; ' + status + '.';
    }

    // v329: shipping-to-a-country answers — the country picked in Messages, or ones the buyer named
    let shipping = '';
    const shipChecks = [];
    if (itemId) {
      const buyerText = msgs.filter(m => !m.mine).slice(-5).map(m => m.text).join(' ');
      const codes = pickedCountry ? [pickedCountry] : (/\bship|shipping|deliver|send\b/i.test(buyerText) ? detectCountries(buyerText) : []);
      for (const code of codes) {
        try { const sc = await shipCheck(req.user.id, itemId, code); shipChecks.push(sc); } catch (e) { /* skip that one */ }
      }
      if (shipChecks.length) shipping = shipChecks.map(shipCheckText).join('\n');
    }

    /*
    const system = [
      'You draft replies for a small eBay seller of used auto parts (pulled from salvage vehicles) to buyer messages.',
      'Write the reply the seller will send, answering the buyer\'s latest message.',
      'Use ONLY facts from the listing and the conversation. Never invent part numbers, fitment, measurements, condition details, shipping times, or policies.',
      'Fitment questions: if the buyer\'s vehicle is in the fitment list, say it is listed as fitting and suggest they match the part number to their original part. If it is not listed or there is no fitment list, say you can\'t confirm it and ask them to compare the part number on their original part (or send the VIN). Never promise fit.',
      'Price/offer questions: don\'t invent a price; if the seller gave instructions, follow them, otherwise suggest they send an offer through the listing.',
      'Shipping-to-a-country questions: use only the SHIPPING CHECK section. YES: say it can ship there (you may mention the cost shown). NO: say that unfortunately eBay doesn\'t allow this item to ship to their country. PROBABLY or UNKNOWN, or no check given: say they can see the shipping options for their country by entering their address on the listing page. Never promise international shipping beyond what the check says.',
      'Keep it short (1–4 sentences), friendly and plain. Plain text only: no markdown, no subject line, no placeholders like [Name], no signature.',
      'Reply with only the message text.'
    ].join(' ');
    */
    // v330: your own instructions (⚙ Settings → Messages) or the default, plus fixed safety rules
    // that always apply — so a custom prompt can't make it invent policies, dates or fitment.
    const ms = ms0;   // v331: read once, above
    // v353: the buyer's recent photos — fetched into memory for this one AI call, never saved
    const buyerPhotos = [];   // { n, media_type, data }
    {
      const recentBuyer = msgs.filter(m => !m.mine).slice(-3);
      const urls = [];
      recentBuyer.forEach(m => (m.images || []).forEach(u => { if (urls.length < 4) urls.push(u); }));
      for (const u of urls) {
        try {
          const host = new URL(u).hostname;
          if (!/(^|\.)(ebayimg\.com|ebay\.com|ebaystatic\.com|ebaydesc\.com)$/i.test(host)) { console.warn('[draft photos] skipped a photo from ' + host + ' (not an eBay picture server)'); continue; }   // only eBay's own picture servers
          const pr = await fetch(u, { signal: AbortSignal.timeout(15000) });
          const type = (pr.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
          if (!pr.ok || !/^image\/(jpeg|png|gif|webp)$/.test(type)) continue;
          const buf = Buffer.from(await pr.arrayBuffer());
          if (buf.length > 4.5 * 1024 * 1024) continue;   // the AI's size limit
          buyerPhotos.push({ n: buyerPhotos.length + 1, media_type: type, data: buf.toString('base64') });
        } catch (e) { /* skip that photo */ }
      }
    }
    const system = [
      ms.instructions || DEFAULT_MSG_INSTRUCTIONS,
      'RULES THAT ALWAYS APPLY:',
      'Use ONLY facts from the LISTING, ORDER & RETURNS, SHIPPING CHECK and CONVERSATION sections. Never invent part numbers, fitment, measurements, condition details, dates, deadlines, shipping times, or policies.',
      // v354
      'Shipping cost questions (US): use the SHIPPING COST line. FLAT RATE → give the exact amount ("Shipping is a flat $19.86 anywhere in the US"). FREE → say shipping is free. CALCULATED → say it depends on their location and they can see the exact cost by entering their ZIP on the listing. Never tell a flat-rate or free-shipping buyer to check the cost themselves.',
      'Shipping-to-a-country questions: use only the SHIPPING CHECK section. YES: say it can ship there (you may mention the cost shown). NO: say that unfortunately eBay doesn\'t allow this item to ship to their country. PROBABLY or UNKNOWN, or no check given: say they can see the shipping options for their country by entering their address on the listing page.',
      // 'Returns, refunds, problems …: respond as the seller\'s problem policy says: ' + PROBLEM_POLICIES[ms.problemPolicy].ai …   (v330 — one choice for every problem)
      // v331: work out which kind of problem it is, then follow the seller's choice for that kind
      'Problems: first decide which kind the buyer has, then follow the seller\'s choice for that kind. ' + PROBLEM_TYPES.map(t => 'If ' + t.when + ': ' + t.options[ms.problems[t.key]].ai).join(' ') + ' Any other problem (not as described, missing pieces): ' + PROBLEM_POLICIES[ms.problemPolicy].ai,
      'Return windows: use only the ORDER & RETURNS section — never calculate dates yourself. For damaged, defective or wrong-part problems: if it says the buyer is INSIDE the return window, follow the choice above; if the window has ENDED: follow the LATE RETURN section if there is one, otherwise ' + AFTER_WINDOW[ms.afterWindow].ai + ' (never call the part "sold as-is" and never blame eBay). A package that never arrived is not limited by the return window. If no order or return policy is given, don\'t mention any time limit.',
      // v332
      // 'PART NUMBER rule: use only the PART NUMBER line. If it gives a number, write the number out in the reply whenever you suggest comparing, so the buyer has it right there. If it says NONE or unknown, never ask the buyer to compare part numbers with the listing or say the listing has one — ask for their VIN, or suggest comparing their original part with the listing photos.',   (v332)
      // v333: VIN only when the seller turned it on
      'PART NUMBER rule: use only the PART NUMBER line. If it gives a number, ask the buyer to compare it with the number on their original part and write the number out in the reply. If it says NONE or unknown, never mention comparing part numbers or say the listing has one — say this listing doesn\'t have a part number, so please compare their original part with the listing photos.'
        + (ms.fitment.askVin ? ' You may also ask for their VIN so the seller can check fitment.' : ' Never ask for a VIN or offer to check one.'),
      'If the buyer asks which vehicle the part came from (year, model, mileage, VIN of the donor vehicle) and the LISTING doesn\'t say, say plainly that you don\'t have that information for this part — don\'t skip the question.',
      // v335
      'Answer EVERY question in the buyer\'s latest message. If the facts given don\'t answer one, say plainly that you don\'t have that information — never skip a question.',
      'Package not arrived: always start with the carrier and tracking number from SHIPMENT (if there is one). Never ask for photos. If eBay shows it DELIVERED: give the delivery date; if they ask who received it, say the tracking only shows it was delivered, not who received it; then ' + DELIVERED_MISSING[ms.deliveredMissing].ai + '. Otherwise follow the seller\'s choice for packages that didn\'t arrive.',
      ms.modules.askProgrammed ? 'Computer modules (TCM, PCM, ECM, BCM, ABS module and other control modules): if the buyer says the module doesn\'t work, first ask whether it was programmed to their vehicle — used modules often need programming — and say that if it was programmed and still doesn\'t work, they can return it (with the return-window time left). This comes before the seller\'s defective choice.' : '',
      TONES[ms.tone].ai,
      // v334
      // v352
      'RETURN SHIPPING — who pays depends on the reason: (1) changed their mind, ordered the wrong part for their vehicle, no longer needs it → the listing\'s return policy (if it says buyer, write "you\'d cover the return shipping"). (2) arrived damaged, defective / doesn\'t work, wrong item sent, or it doesn\'t match the listing (wrong part number, the fitment list includes their vehicle but it doesn\'t fit, listed wrong) → the seller pays: say "I\'ll cover the return shipping — eBay will give you a prepaid return label when you open the return." (3) reason not clear → don\'t mention who pays. Always say it to the buyer ("you"), never "paid by the buyer".',
      'Whenever the reply offers a return or asks the buyer to open a return request, also tell them how long they have, using the Return window line in ORDER & RETURNS (days left and the last day, exactly as given). If the window hasn\'t started, say they\'ll have the stated number of days from delivery. If there\'s no Return window line, don\'t mention a time limit.',
      'Tracking and delivery: use only the SHIPMENT facts. You may give the carrier, tracking number, shipped date, expected date and delivered date shown there. Never describe where the package is or make up a delivery date.',
      // v336
      // v343
      'If this buyer has already bought the item and it has shipped or been delivered, never offer to check, measure or photograph the part \u2014 it isn\'t with the seller any more. If TIMELINE says their question came BEFORE they bought it: apologize for the slow reply, say you see they went ahead and bought it (and it was delivered on the date given, if so), and thank them for the order \u2014 nothing more (no "let me know if it isn\'t what you needed", no returns).',   // v357 (was: ask them to say if it isn't right, then the return-window rule)
      // v357
      'NEVER bring up returns, refunds, the return window or "let me know if there\'s an issue / if it isn\'t what you needed" unless the buyer reports a problem with the part or asks about returning it. Don\'t advertise returns.',
      // v348
      'If ORDER & RETURNS says this order was cancelled or refunded: tell the buyer it shows as cancelled/refunded on your end (don\'t troubleshoot delivery, returns or the part as if it were still open) and ask them to let you know if they have a question about it.',
      // v342
      'You ARE the seller, writing to the buyer. Call it "the listing" or "my listing" \u2014 never "your listing". "Your" means the buyer\'s vehicle or part.',
      'If LISTING STATUS says ENDED or SOLD OUT and this buyer has not bought the item: start by saying sorry, this one has sold / is no longer available. Don\'t walk them through fitment or part numbers for it, but still answer any simple question briefly if the facts allow.',
      'Never make up anything about the seller or the part that isn\'t in the sections given: where the part is, whether the seller has it on hand, the seller\'s schedule, or reasons why something can\'t be done. If you don\'t know, say less.',
      'Requests for more photos, measurements or a closer look at the part: ' + PHOTO_REQUESTS[ms.photoRequests].ai + '.',
      // ms.availability ? 'When the reply says … use the seller\'s availability for when: "' + ms.availability + '". Never promise a sooner time.' : '…',   (v336)
      (() => {   // v361: name the NEXT available day, worked out here
        if (!ms.availability) return 'When the reply says the seller will check something or get back to them, don\'t name a day or time.';
        const nd = nextAvailableDay(ms.availability, new Date(), ms.timezone);   // v362
        return nd ? 'When the reply says the seller will check something, take photos or get back to them, say by ' + nd.label + ' — that is the seller\'s next available day (availability: "' + ms.availability + '"). Use only that day; never a different or sooner one.'
          : 'When the reply says the seller will check something, take photos or get back to them, use the seller\'s availability for when: "' + ms.availability + '". Never promise a sooner time.';
      })(),
      // v339: common questions
      // 'Tested / working / warranty questions: ' + TESTED_ANSWERS[ms.tested].ai + '. Never claim it was tested or works unless the LISTING says so.',
      // 'Tested / working / warranty questions (including …): ' + TESTED_ANSWERS[ms.tested].ai + '. The seller does NOT test parts: …',   // v340
      'Tested / working / warranty questions (including "did you test it before you removed it?", "is it working?", "was it checked?"): ' + TESTS_PARTS[ms.testsParts].ai + ' Then ' + TESTED_ANSWERS[ms.tested].ai + '.',   // v341
      'Programming questions (does it need programming / coding to the VIN): if the PART TYPE line says wiring pigtail / connector plugs, say no programming is needed — it\'s just the wires and plugs. Otherwise: ' + PROGRAMMING_ANSWERS[ms.programming].ai + '. If they ask the seller to program it: ' + (ms.offersProgramming ? 'say you can and they should message you to arrange it.' : 'say you don\'t offer programming.'),
      'Donor vehicle questions (what year/model/VIN/mileage/engine it came from, right-hand drive, etc.): ' + DONOR_ANSWERS[ms.donor].ai + '.',
      'Diesel or gas / engine size / trim questions ("did it come out of a diesel?", "is it for the 5.7?"): don\'t guess — say what matters is the part number, and ask them to match the part number on their original part (PART NUMBER rule). Even a part from the same engine type may not fit if the number differs.',   // v361
      'Has it shipped / when will it ship: use ORDER & RETURNS and SHIPMENT. If it has shipped, give the shipped date, carrier and tracking number. If it hasn\'t shipped: ' + SHIP_WHEN[ms.shipWhen].ai + (ms.shipDays ? ' (the seller ships: ' + ms.shipDays + ')' : '') + '. Never promise a specific day you weren\'t given.',
      'If the SHIPPING CHECK says NO for the buyer\'s country (or they ask you to enable shipping to their country): ' + INTL_NO[ms.intlNo].ai + '.',
      // v345
      'Buyer changed their mind, bought the wrong one, or no longer needs it (not a problem with the part): ' + REMORSE[ms.remorse].ai + '.',
      'Buyer wants to change the shipping address: ' + ADDRESS_CHANGE[ms.addressChange].ai + '.',
      'Buyer asks for faster shipping, overnight, or delivery by a certain day: ' + FASTER[ms.faster].ai + '.',
      'Buyer asks to buy only part of the item, or the item without something that\'s included: ' + PARTIAL[ms.partial].ai + '.',
      'Buyer asks for the radio / anti-theft / security code: ' + RADIO_CODE[ms.radioCode].ai + '.',
      'Buyer asks about local pickup or picking it up in person: ' + PICKUP[ms.pickup].ai + '.',
      // v349
      buyerPhotos.length ? 'BUYER PHOTOS: the photos the buyer sent are attached after the facts (newest last). If one clearly shows a part number or label, say what you read ("I see 56029423AG on your label") and compare it with the PART NUMBER line — say whether it matches the listing (never promise fit). Read every character carefully; if the photo is blurry, dark, glare-covered, cut off, or you are not sure of ANY character, do not guess — kindly ask for a closer, well-lit photo of the label/part number. Don\'t describe other things in the photo unless asked. Photos the buyer sent that are not attached: you can\'t see those.' : '',
      'Buyers\' photos and attachments that are NOT attached here: you can NOT see them. If they ask you to look at a photo (does this match, is this compatible), never say it matches or doesn\'t — ' + PHOTO_REQUESTS.check_back.ai + ' (they sent a photo).',
      'Never describe the part as "working", "in working condition" or "good working condition", even if the listing says so. Say it is used, and give the condition notes only if they ask about condition.',
      'If the buyer gives THEIR VIN to check fitment' + (ms.fitment.askVin ? ': say you\'ll check it and get back to them.' : ': say you aren\'t able to check fitment by VIN, then use the fitment list and the PART NUMBER rule. Don\'t confuse their VIN with the donor vehicle\'s VIN.'),
      // v359
      // v360
      (() => { const lb = msgs.filter(m => !m.mine).slice(-1)[0]; const age = lb ? (Date.now() - Date.parse(lb.date)) / 86400000 : 0; return age > 2 ? 'The buyer\'s latest message is ' + Math.floor(age) + ' days old: start with a short "Sorry for the slow reply" (once), then answer. Don\'t promise anything by a day that has already passed.' : ''; })(),
      'FITMENT (always, whatever the instructions above say): never tell the buyer it fits, works, or "yes" because the year, make and model match — the same vehicle can use different part numbers by engine, trim, options or build date. Say whether the vehicle is listed (in the compatibility list, or within the title\'s years and models — never say it isn\'t listed when the title covers it), and that they need to match the part number on their original part (write the number out, per the PART NUMBER rule). Then use the PART TYPE line: wiring pigtail / connector plugs → don\'t mention programming or codes at all — not even to say none is needed — unless the buyer asked about programming (then say it doesn\'t need any — it\'s just the wires and plugs); for the part number, ask them to compare it with the number on their module (the part these plugs connect to). Computer/control module → ALWAYS add: ' + PROGRAMMING_ANSWERS[ms.programming].ai.replace(/^say that /, 'mention that ') + '. Radio/audio → don\'t mention programming; add that it may need a radio (anti-theft) code, which a dealer can usually get from the radio\'s serial number. Anything else (mirrors, lights, switches, motors, trim, plain fuse boxes…) → no programming or code note.',   // v364 (v359 put the programming note on radios and fuse boxes too)
      'Programming: only say what the programming rule says. Never say a part "will need" or "typically needs" programming.',
      // 'Part numbers: do NOT add part numbers … to answers about the donor vehicle, mileage, condition, warranty, shipping or price — only when they ask whether it fits or for the part number.',   (v349)
      'Part numbers: do NOT add part numbers to answers about mileage, condition, warranty, shipping or price. DO include the part-number check whenever they ask if it fits / will work, or ask about the engine, diesel or gas, trim, or which vehicle it came from.',   // v362
      'Questions about a detail of the part that the LISTING doesn\'t answer (features like cornering lights or navigation, clips, connectors, color, corrosion, what\'s included): ' + PHOTO_REQUESTS[ms.photoRequests].ai + '. Never guess.',
      ms.usVehicles ? 'Right-hand drive / European / Japanese-market questions: the seller\'s parts come from US vehicles (left-hand drive, US market).' : '',
      '"Is it still available?": answer from LISTING STATUS (active with some available = yes).',
      'Only bring up part numbers or comparing part numbers when the buyer asks whether it fits, asks for the part number, or names their own part number. If the listing has many part numbers, give the main one or two, not a long list.',
      'Never suggest other sellers, searching eBay or anywhere else for the part, or dealing outside eBay (no off-eBay payments, no changing the price for another account, no sharing the seller\'s address or contact details).',
      'When saying you\'ll get back to them, word it naturally, e.g. "I\'ll take a look and get back to you by Wednesday afternoon."',
      // 'Write in English. Plain text only: no markdown, no subject line, no placeholders like [Name], no signature.',
      ms.buyerLanguage
        ? 'Write the reply in the same language as the buyer\'s latest message. Plain text only: no markdown, no subject line, no placeholders like [Name], no signature. If that language is not English, after the reply add a line "ENGLISH:" followed by an English translation of your reply (one paragraph).'
        : 'Write in English. Plain text only: no markdown, no subject line, no placeholders like [Name], no signature.',
      discount ? 'After the reply, add a line "OFFER: yes" if you followed the DISCOUNT section (the buyer asked about price), otherwise "OFFER: no".' : '',
      // 'Reply with only the message text.'
      // v341
      hint ? '' : 'If the buyer\'s latest message doesn\'t need an answer (it\'s only thanks / ok / goodbye), reply with exactly NO_REPLY_NEEDED and nothing else. Never write notes to the seller in place of a reply.',
      // v351
      'FORMAT: put the message to the buyer — and nothing else — inside <reply> and </reply>. It is the seller speaking directly to the buyer ("I", "you"); never refer to "the buyer" or "the seller", never think out loud, never add notes. Any ENGLISH:, OFFER: and FOLLOWUP: lines go after </reply>.',
      'Reply with only the message text, then one last line: "FOLLOWUP: " plus a short to-do for the seller (under 12 words, e.g. "Check level sensor opening for cracks, send photos") if the reply promises the seller will check, look, measure, take photos or get back to the buyer — otherwise "FOLLOWUP: none".'
    ].filter(Boolean).join(' ');   // v335: filter — the modules rule can be off
    // const user = 'LISTING\n' + listing + '\n\nCONVERSATION (oldest first)\n' + convo + (hint ? '\n\nSELLER\'S INSTRUCTIONS FOR THIS REPLY\n' + hint : '') + '\n\nWrite the seller\'s reply now.';
    // const user = 'LISTING\n' + listing + (shipping ? '\n\nSHIPPING CHECK (checked with eBay just now)\n' + shipping : '') + '\n\nCONVERSATION (oldest first)\n' + convo + (hint ? '\n\nSELLER\'S INSTRUCTIONS FOR THIS REPLY\n' + hint : '') + '\n\nWrite the seller\'s reply now.';   // v329: + shipping check
    // const discountText = discount ? 'The buyer asked for a lower price. The seller\'s best is ' + discount.percent + '% off: $' + discount.offerPrice.toFixed(2) + ' (listed at $' + discount.price.toFixed(2) + '). Say that the best you can do is ' + discount.percent + '% off and that you\'ve sent them an offer for $' + discount.offerPrice.toFixed(2) + ' — if they don\'t receive it, they should let you know. Don\'t offer any other price.' : '';
    // v339: only IF the buyer is asking for a lower price / making an offer
    const discountText = discount ? 'IF the buyer\'s latest message asks for a lower price, makes an offer or names their own price (e.g. "150$?", "can I have it for 160", "would you take anything less?", "is the price firm?"): say that the best you can do is ' + discount.percent + '% off and that you\'ve sent them an offer for $' + discount.offerPrice.toFixed(2) + ' (listed at $' + discount.price.toFixed(2) + ') — if they don\'t receive it, they should let you know. Don\'t offer any other price. If they are NOT asking about price, ignore this section.' : '';
    const user = statusLead + 'LISTING\n' + listing + '\n\nORDER & RETURNS (worked out by the app from eBay)\n' + (orderFacts || 'No order found for this item yet (the buyer may not have bought it).') + (timeline ? '\n\nTIMELINE\n' + timeline : '') + (lateReturn ? '\n\nLATE RETURN (seller\'s own policy)\n' + lateReturn : '') + (shipping ? '\n\nSHIPPING CHECK (checked with eBay just now)\n' + shipping : '') + (discountText ? '\n\nDISCOUNT\n' + discountText : '') + '\n\nCONVERSATION (oldest first)\n' + convo + (hint ? '\n\nSELLER\'S INSTRUCTIONS FOR THIS REPLY\n' + hint : '') + '\n\nWrite the seller\'s reply now.';   // v330: + order & returns, v331: + discount

    // v351: ask, keep only what's inside <reply>…</reply> (plus the ENGLISH / OFFER / FOLLOWUP lines),
    //       and if it still reads like notes about the buyer, ask once more
    const askAI = async (messages) => {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model, max_tokens: 900, system, messages }),   // v339: 600 → 900 (room for the English copy)
        signal: AbortSignal.timeout(60000)
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw Object.assign(new Error('Claude didn\u2019t answer: ' + ((d.error && d.error.message) || ('HTTP ' + r.status))), { aiError: true });
      return ((d.content || []).filter(c => c.type === 'text').map(c => c.text).join('\n') || '').trim();
    };
    const pickReply = (raw) => {
      const m = /<reply>([\s\S]*?)<\/reply>/i.exec(raw);
      if (!m) return { text: raw.replace(/<\/?reply>/gi, '').trim(), tagged: false };
      const rest = raw.slice(0, m.index) + '\n' + raw.slice(m.index + m[0].length);
      const meta = (/(ENGLISH:[\s\S]*?)(?=\n\s*(OFFER|FOLLOWUP):|$)/i.exec(rest) || [''])[0].trim();
      const extra = [meta, (/OFFER:\s*(yes|no)\b/i.exec(rest) || [''])[0], (/FOLLOWUP:.*$/im.exec(rest) || [''])[0]].filter(Boolean).join('\n');
      return { text: (m[1].trim() + (extra ? '\n' + extra : '')).trim(), tagged: true };
    };
    const looksLikeNotes = (t) => /\b(let me (reconsider|think)|wait,|the buyer (is|wants|asked|says|has)|I need to (answer|reply|respond)|the seller (should|would|is)|draft (a )?reply)\b/i.test(t.split(/\n\s*(ENGLISH|OFFER|FOLLOWUP):/i)[0]);
    let text;
    try {
      // v353: + the buyer's photos (memory only)
      const firstContent = buyerPhotos.length
        ? [{ type: 'text', text: user }].concat(buyerPhotos.flatMap(ph => [{ type: 'text', text: 'BUYER PHOTO ' + ph.n + ':' }, { type: 'image', source: { type: 'base64', media_type: ph.media_type, data: ph.data } }]))
        : user;
      // const raw1 = await askAI([{ role: 'user', content: user }]);
      const raw1 = await askAI([{ role: 'user', content: firstContent }]);
      if (/NO_REPLY_NEEDED/.test(raw1) && !/<reply>[\s\S]*?\w[\s\S]*?<\/reply>/i.test(raw1)) text = 'NO_REPLY_NEEDED';
      else {
        let pick = pickReply(raw1);
        if (!pick.text || looksLikeNotes(pick.text)) {
          const raw2 = await askAI([{ role: 'user', content: firstContent }, { role: 'assistant', content: raw1 },
            { role: 'user', content: 'That included notes or thinking. Write ONLY the message the seller sends to the buyer, speaking directly to them, inside <reply></reply> — then the ENGLISH / OFFER / FOLLOWUP lines after it if needed.' }]);
          pick = pickReply(raw2);
        }
        text = pick.text;
      }
    } catch (e) { if (e.aiError) return res.status(502).json({ error: e.message }); throw e; }
    if (/^\s*NO_REPLY_NEEDED\b/.test(text)) return res.json({ noReply: true, reason: 'The buyer\u2019s last message doesn\u2019t need an answer. To reply anyway, type what you want to say in the box next to AI draft.' });   // v341
    // v336: the follow-up to-do line (removed from the draft)
    let followUp = null;
    const fu = /\n?\s*FOLLOWUP:\s*(.*)\s*$/i.exec(text);
    if (fu) { text = text.slice(0, fu.index).trim(); const task = fu[1].trim().replace(/^["']|["']$/g, ''); if (task && !/^none\.?$/i.test(task)) followUp = task.slice(0, 140); }
    // v339: OFFER: yes/no (the AI decided whether it's a price question) and ENGLISH: (buyer's-language replies)
    let offerUsed = null;
    const om = /\n?\s*OFFER:\s*(yes|no)\b\.?\s*/i.exec(text);
    if (om) { offerUsed = /yes/i.test(om[1]); text = (text.slice(0, om.index) + '\n' + text.slice(om.index + om[0].length)).trim(); }
    let english = null;
    const em = /\n?\s*ENGLISH:\s*([\s\S]*)$/i.exec(text);
    if (em) { english = em[1].trim().slice(0, 2000) || null; text = text.slice(0, em.index).trim(); }
    if (discount) {
      const used = offerUsed === null ? discount.wordMatch : offerUsed;   // no OFFER line → fall back to the word list
      if (!used) discount = null; else delete discount.wordMatch;
    }
    // v362: fit-type questions always get the part-number check — added here if the AI left it out
    {
      const lastQ = (msgs.filter(m => !m.mine).slice(-1)[0] || {}).text || '';
      const fitQ = /\b(fit|fits|fitment|work (on|with|for)|compatible|compatibility|diesel|gas(oline)?|engine|motor size|\d\.\d ?l|liter|v6|v8|trim|same as|interchange|donor|came (out of|from)|removed from|pulled from|vin)\b/i.test(lastQ);
      const soldToOther = orderInfo.listingEnded && !orderInfo.boughtAt;
      if (text && fitQ && !soldToOther && listingLoaded) {
        const hasCheck = mainPN ? text.replace(/[^A-Z0-9]/gi, '').toUpperCase().includes(mainPN.replace(/[^A-Z0-9]/gi, '').toUpperCase()) : /listing photos/i.test(text);
        if (!hasCheck) text += '\n\n' + (mainPN
          ? 'To know if it fits your vehicle, please compare the part number ' + mainPN + ' with the one on your original part to see if it\'s a match.'
          : 'To know if it fits your vehicle, please compare your original part with the listing photos to see if it\'s a match.');
      }
    }
    // v371: a reply with your return address always asks them to mail it within 2 weeks
    if (text && lateReturn && hasReturnAddress(text, ms.honorLate.address) && !/\b(2|two)\s+weeks\b|\b14\s+days\b/i.test(text))
      text += '\n\nPlease mail it within 2 weeks, and I\'ll refund you once it arrives.';
    if (text && ms.signoff && !text.endsWith(ms.signoff)) text += '\n\n' + ms.signoff;   // v335: your sign-off, word for word
    if (!text) return res.status(502).json({ error: 'Claude returned an empty draft — try again.' });
    // res.json({ draft: text.slice(0, 2000), usedListing: !!itemId });
    // res.json({ draft: text.slice(0, 2000), usedListing: !!itemId, shipChecks: shipChecks.map(sc => ({ country: sc.country, verdict: sc.verdict })) });   // v329
    // res.json({ draft: text.slice(0, 2000), usedListing: !!itemId, shipChecks: shipChecks.map(sc => ({ country: sc.country, verdict: sc.verdict })), orderFacts: orderFacts || null });   // v330
    // res.json({ draft: text.slice(0, 2000), usedListing: !!itemId, shipChecks: shipChecks.map(sc => ({ country: sc.country, verdict: sc.verdict })), orderFacts: orderFacts || null, discount });   // v331: + discount
    // res.json({ draft: …, discount, followUp });   // v336: + followUp
    // res.json({ draft: text.slice(0, 2000), usedListing: !!itemId, shipChecks: shipChecks.map(sc => ({ country: sc.country, verdict: sc.verdict })), orderFacts: orderFacts || null, discount, followUp, english, discountSkipped });   // v339: + english, v355: + discountSkipped
    const nextDay = ms.availability ? nextAvailableDay(ms.availability, new Date(), ms.timezone) : null;   // v376: shown under the draft
    res.json({ draft: text.slice(0, 2000), usedListing: !!itemId, shipChecks: shipChecks.map(sc => ({ country: sc.country, verdict: sc.verdict })), orderFacts: orderFacts || null, discount, followUp, english, discountSkipped,
      lateInfo, nextDay: nextDay ? nextDay.label : null, availability: ms.availability || null });   // v376
  } catch (e) {
    console.error('[draft]', e.message);
    res.status(500).json({ error: 'Could not draft a reply: ' + e.message });
  }
};
app.post('/api/threads/:id/draft', requireUser, express.json(), draftHandler);   // v347

// ─── v338: ADMIN — DOWNLOAD MESSAGES (development) ──────────────────────────
// (v338 redactMsg — replaced in v339)
// function redactMsg(text, names) {
//   let t = String(text || '');
//   names.forEach(n => { if (n.name) t = t.replace(new RegExp(n.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), n.as); });
//   t = t.replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[email]');
//   t = t.replace(/(\+?1[\s.-]?)?\(?\b\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g, '[phone]');
//   t = t.replace(/\b(p\.?\s?o\.?\s?box)\s*\d+/gi, '[address]');
//   t = t.replace(/\b\d{1,6}\s+(?:[A-Za-z0-9.'-]+\s+){0,4}(?:st|street|ave|avenue|rd|road|blvd|boulevard|dr|drive|ln|lane|ct|court|way|pl|place|cir|circle|pkwy|parkway|hwy|highway|ter|terrace|trl|trail)\b\.?(?:,?\s*(?:apt|unit|suite|ste|#)\s*[\w-]+)?/gi, '[address]');
//   t = t.replace(/\b[A-Z]{2}\s+\d{5}(?:-\d{4})?\b/g, '[state zip]');
//   t = t.replace(/\b(my name is|name's)\s+[A-Z][a-z]+(\s+[A-Z][a-z]+)?/gi, '$1 [name]');
//   return t;
// }
function redactMsg(text, names) {   // v339
  let t = String(text || '');
  names.forEach(n => { if (n.name) t = t.replace(new RegExp(n.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), n.as); });
  t = t.replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[email]');
  t = t.replace(/\b[A-HJ-NPR-Z0-9]{17}\b/gi, m => (/\d/.test(m) && /[a-z]/i.test(m) ? '[VIN]' : m));
  // phone numbers only when written like one (separators / brackets / +1), or after call/text/phone
  t = t.replace(/(\+?1[\s.-])?\(\d{3}\)\s*\d{3}[\s.-]?\d{4}\b|(\+?1[\s.-])?\b\d{3}[.-]\d{3}[.-]\d{4}\b/g, '[phone]');
  t = t.replace(/\b(call|text|phone|cell|tel)(\s*(me|at|#|:|number))*\s*\+?1?\s*\d{10}\b/gi, '$1 [phone]');
  t = t.replace(/\b(p\.?\s?o\.?\s?box)\s*\d+/gi, '[address]');
  t = t.replace(/\b\d{1,6}\s+(?:[A-Za-z0-9.'-]+\s+){0,4}(?:st|street|ave|avenue|rd|road|blvd|boulevard|dr|drive|ln|lane|ct|court|way|pl|plz|plaza|place|cir|circle|pkwy|parkway|hwy|highway|ter|terrace|trl|trail|loop|sq|square|pike|run|xing|crossing|row|aly|alley)\b\.?(?:,?\s*(?:apt|unit|suite|ste|#)\.?\s*[\w-]+)?/gi, '[address]');
  t = t.replace(/\b(apt|unit|suite|ste)\.?\s*#?\s*\d+\w*/gi, '[address]');
  t = t.replace(/\b[A-Z]{2}\s+\d{5}(?:-\d{4})?\b/g, '[state zip]');
  // v345: names in quoted email replies ("Name <email> wrote / escribió") and "-Name" sign-offs
  t = t.replace(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2}\s*<\[email\]>/g, '[name] <[email]>');
  t = t.replace(/(^|[\s,])-\s?[A-Z][a-z]+\s*$/, '$1-[name]');
  t = t.replace(/\b([Mm]y name is|[Nn]ame's|[Ii]'?m|[Tt]his is)\s+([A-Z][a-z]+)(\s+[A-Z][a-z]+)?\b(?=[\s.,!]|$)/g, (m, a, b) => (/^(interested|looking|wondering|trying|not|sorry|good|the|a|in)$/i.test(b) ? m : a + ' [name]'));
  // a sign-off at the end: " / Name", "Thanks, Name", " / COMPANY INC." lines
  t = t.replace(/((?:thanks|thank you|regards|cheers|best)[,!.]?\s*(?:\/\s*)?)([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z.]*){0,2})\s*$/i, '$1[name]');
  t = t.split(/\r?\n/).map((seg, i, arr) => ((i > 0 || (arr.length === 1 && /^[A-Z][a-z]+(\s+[A-Z][a-z]+){1,2}$/.test(seg.trim()))) && /^[A-Z][A-Za-z.&']*(\s+[A-Z][A-Za-z.&']*){0,3}\.?$/.test(seg.trim()) && seg.trim().length < 40 && !/^(Thank|Thanks|Hi|Hello|Ok|Okay|Yes|No)\b/.test(seg.trim()) ? '[name]' : seg)).join('\n');
  return t;
}
app.get('/api/admin/messages-export', requireUser, requireAdmin, async (req, res) => {
  const days = [30, 90, 365].includes(parseInt(req.query.days, 10)) ? parseInt(req.query.days, 10) : 90;
  const CAP = 300;
  try {
    const conn = await getConnection(req.user.id);
    const blocked = threadsBlocked(conn); if (blocked) return res.status(400).send('Connect eBay (with message permission) first.');
    const me = await myEbayUser(req.user.id);
    const cutoff = Date.now() - days * 86400000;
    // 1) the conversation list (up to 2,000 looked at), newest first, within the date range
    const convs = [];
    for (let offset = 0; offset < 2000; offset += 50) {
      const q = new URLSearchParams({ conversation_type: 'FROM_MEMBERS', limit: '50', offset: String(offset) });
      const { data } = await restCall(req.user.id, 'GET', '/commerce/message/v1/conversation?' + q);
      const list = (data && data.conversations) || [];
      list.forEach(c => {
        const lm = c.latestMessage || {};
        const when = Date.parse(lm.createdDate || c.createdDate || '') || 0;
        if (when >= cutoff) convs.push({ id: c.conversationId, title: c.conversationTitle || '', itemId: c.referenceType === 'LISTING' ? (c.referenceId || '') : '', when });
      });
      if (!data || !data.next || list.length < 50) break;
    }
    convs.sort((a, b) => b.when - a.when);
    const pick = convs.slice(0, CAP);
    // 2) each conversation's messages (a few at a time)
    const texts = new Array(pick.length);
    let next = 0;
    async function worker() {
      while (next < pick.length) {
        const i = next++, c = pick[i];
        try {
          const q = new URLSearchParams({ conversation_type: 'FROM_MEMBERS', limit: '50', offset: '0' });
          const { data } = await restCall(req.user.id, 'GET', '/commerce/message/v1/conversation/' + encodeURIComponent(c.id) + '?' + q);
          const msgs = ((data && data.messages) || []).slice().sort((x, y) => String(x.createdDate).localeCompare(String(y.createdDate)));
          const others = [...new Set(msgs.map(m => m.senderUsername).filter(u => u && u !== me))];
          const names = [{ name: me, as: 'Seller' }].concat(others.map((u, k) => ({ name: u, as: others.length > 1 ? 'Buyer' + (k + 1) : 'Buyer' })));
          const lines = msgs.map(m => {
            const who = m.senderUsername === me ? 'Seller' : 'Buyer' + (others.length > 1 ? (others.indexOf(m.senderUsername) + 1) : '');
            const media = (m.messageMedia || []).length ? ' [' + (m.messageMedia || []).length + ' photo/attachment]' : '';
            return '[' + String(m.createdDate || '').slice(0, 16).replace('T', ' ') + '] ' + who + ': ' + redactMsg(m.messageBody || '', names).replace(/\r?\n+/g, ' / ') + media;
          });
          texts[i] = '=== Conversation ' + (i + 1) + (c.itemId ? ' · item ' + c.itemId : '') + (c.title ? ' · ' + redactMsg(c.title, names) : '') + ' ===\n' + (lines.join('\n') || '(no messages)');
        } catch (e) { texts[i] = '=== Conversation ' + (i + 1) + ' ===\n(couldn\'t load: ' + e.message + ')'; }
      }
    }
    await Promise.all([1, 2, 3, 4, 5].map(worker));
    const head = 'PartsLister Pro — buyer messages, last ' + days + ' days — ' + pick.length + ' conversation' + (pick.length === 1 ? '' : 's') + (convs.length > CAP ? ' (newest ' + CAP + ' of ' + convs.length + ')' : '') + '\n'
      + 'Downloaded ' + new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC. Usernames, emails, phone numbers and street addresses are removed (names written inside a message may remain).\n\n';
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="partslister-messages-' + days + 'd-' + new Date().toISOString().slice(0, 10) + '.txt"');
    res.send(head + texts.join('\n\n') + '\n');
  } catch (e) {
    console.error('[messages export]', e.message);
    res.status(500).send('Could not download messages: ' + e.message);
  }
});

// ─── v346: ADMIN — DOWNLOAD MESSAGES WITH DRAFTS (development) ───────────────
// Like Download messages, plus one line per conversation with the listing and order facts the AI
// sees (price, shipping, part number, live status, return policy, this buyer's order), so drafts can
// be checked against the real facts. Runs in the background with progress; kept in memory only.
const msgExports = new Map();   // jobId → { userId, target, checked, found, started, finished, error, text }

async function exportFactsLine(userId, itemId, buyer) {
  const bits = [];
  try {
    const xml = await tradingCall(userId, 'GetItem', `<ItemID>${itemId}</ItemID><DetailLevel>ReturnAll</DetailLevel><IncludeItemSpecifics>true</IncludeItemSpecifics>`);
    const item = xmlTag(xml, 'Item') || '';
    const ss = xmlTag(item, 'SellingStatus') || '';
    const sd = xmlTag(item, 'ShippingDetails') || '';
    const price = parseFloat(xmlTag(ss, 'CurrentPrice') || '');
    const opt = xmlAll(sd, 'ShippingServiceOptions')[0] || '';
    const free = opt && xmlTag(opt, 'FreeShipping') === 'true';
    const shipCost = parseFloat(xmlTag(opt, 'ShippingServiceCost') || '');
    const calc = /Calculated/i.test(xmlTag(sd, 'ShippingType') || '');
    bits.push((price ? '$' + price.toFixed(2) : 'price ?') + (free ? ' + free ship' : calc ? ' + calculated ship' : !isNaN(shipCost) ? ' + $' + shipCost.toFixed(2) + ' ship' : ''));
    const specifics = xmlAll(xmlTag(item, 'ItemSpecifics') || '', 'NameValueList').map(nv => ({ name: xmlDecode(xmlTag(nv, 'Name')), value: xmlAll(nv, 'Value').map(xmlDecode).join(', ') }));
    const pn = partNumbersOf(specifics);
    bits.push(pn.length ? 'part # ' + pn.slice(0, 3).map(x => x.value).join(', ') + (pn.length > 3 ? ' (+' + (pn.length - 3) + ' more)' : '') : 'no part #');
    const st = xmlTag(ss, 'ListingStatus') || '';
    const qty = parseInt(xmlTag(item, 'Quantity') || '', 10);
    const sold = parseInt(xmlTag(ss, 'QuantitySold') || '0', 10) || 0;
    const left = qty >= 0 ? Math.max(0, qty - sold) : null;
    bits.push(st && st !== 'Active' ? 'ENDED' + (sold ? ' (sold)' : '') : left === 0 ? 'SOLD OUT' : 'active' + (left !== null ? ' (' + left + ' left)' : ''));
    const rp = xmlTag(item, 'ReturnPolicy') || '';
    if (/NotAccepted/i.test(xmlTag(rp, 'ReturnsAcceptedOption') || '')) bits.push('no returns');
    else if (rp) { const days = parseInt((/(\d+)/.exec(xmlTag(rp, 'ReturnsWithinOption') || '') || [])[1], 10); const payer = xmlTag(rp, 'ShippingCostPaidByOption') || ''; bits.push('returns ' + (days ? days + ' days' : '?') + (payer ? ', ' + payer.toLowerCase() + ' pays return ship' : '')); }
  } catch (e) { bits.push('listing info unavailable (' + String(e.message).slice(0, 60) + ')'); }
  try {
    const fo = await findBuyerOrder(userId, itemId, buyer);
    const fmt = (x) => new Date(x).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'America/Los_Angeles' });
    if (fo.otherBuyer) bits.push('this buyer did NOT buy it (sold to someone else)');
    else if (fo.row) {
      const o = fo.row, sh = fo.ship || {};
      bits.push((fo.matched ? 'this buyer bought it ' : 'sold ') + fmt(o.created_at)
        + (!o.counted ? ', cancelled/refunded' : '')
        + (sh.shippedTime ? ', shipped ' + fmt(sh.shippedTime) : o.ship_status === 'FULFILLED' ? ', shipped' : ', not shipped')
        + (sh.deliveredTime ? ', delivered ' + fmt(sh.deliveredTime) : sh.expectedMax && sh.shippedTime ? ', expected by ' + fmt(sh.expectedMax) : '')
        + ((sh.tracks || [])[0] && sh.tracks[0].carrier ? ' (' + sh.tracks[0].carrier + ')' : ''));
    } else bits.push('this buyer hasn\'t bought it');
  } catch (e) { bits.push('order info unavailable'); }
  return 'Facts now: ' + bits.join(' · ');
}

// (v346 runMsgExport — replaced in v347)
// async function runMsgExport(job, user, days, count, draftsOnly) {
//   try {
//     const conn = await getConnection(user.id);
//     if (threadsBlocked(conn)) throw new Error('Connect eBay (with message permission) first.');
//     const me = await myEbayUser(user.id);
//     const signoff = msgSettingsOf(await getUserSettings(user.id)).signoff;   // used to spot your AI drafts
//     if (draftsOnly && !signoff) throw new Error('"AI drafts only" finds your drafts by your sign-off — set one in Settings → Messages first.');
//     const cutoff = Date.now() - days * 86400000;
//     const convs = [];
//     for (let offset = 0; offset < 2000; offset += 50) {
//       const q = new URLSearchParams({ conversation_type: 'FROM_MEMBERS', limit: '50', offset: String(offset) });
//       const { data } = await restCall(user.id, 'GET', '/commerce/message/v1/conversation?' + q);
//       const list = (data && data.conversations) || [];
//       list.forEach(c => {
//         const lm = c.latestMessage || {};
//         const when = Date.parse(lm.createdDate || c.createdDate || '') || 0;
//         if (when >= cutoff) convs.push({ id: c.conversationId, title: c.conversationTitle || '', itemId: c.referenceType === 'LISTING' ? (c.referenceId || '') : '', when });
//       });
//       if (!data || !data.next || list.length < 50) break;
//     }
//     convs.sort((a, b) => b.when - a.when);
//     job.candidates = convs.length;
//     job.target = draftsOnly ? count : Math.min(count, convs.length);
//     const picked = [];   // { i, text }
//     let next = 0;
//     async function worker() {
//       while (next < convs.length && picked.length < count) {
//         const i = next++, c = convs[i];
//         try {
//           const q = new URLSearchParams({ conversation_type: 'FROM_MEMBERS', limit: '50', offset: '0' });
//           const { data } = await restCall(user.id, 'GET', '/commerce/message/v1/conversation/' + encodeURIComponent(c.id) + '?' + q);
//           const msgs = ((data && data.messages) || []).slice().sort((x, y) => String(x.createdDate).localeCompare(String(y.createdDate)));
//           job.checked++;
//           const isDraft = (m) => !!signoff && m.senderUsername === me && String(m.messageBody || '').trim().endsWith(signoff);
//           if (draftsOnly && !msgs.some(isDraft)) continue;
//           if (picked.length >= count) break;
//           const others = [...new Set(msgs.map(m => m.senderUsername).filter(u => u && u !== me))];
//           const names = [{ name: me, as: 'Seller' }].concat(others.map((u, k) => ({ name: u, as: others.length > 1 ? 'Buyer' + (k + 1) : 'Buyer' })));
//           const facts = c.itemId ? await exportFactsLine(user.id, c.itemId, others[0] || '') : 'Facts now: no listing attached';
//           const lines = msgs.map(m => {
//             const who = m.senderUsername === me ? (isDraft(m) ? 'Seller (AI draft)' : 'Seller') : 'Buyer' + (others.length > 1 ? (others.indexOf(m.senderUsername) + 1) : '');
//             const media = (m.messageMedia || []).length ? ' [' + (m.messageMedia || []).length + ' photo/attachment]' : '';
//             return '[' + String(m.createdDate || '').slice(0, 16).replace('T', ' ') + '] ' + who + ': ' + redactMsg(m.messageBody || '', names).replace(/\r?\n+/g, ' / ') + media;
//           });
//           picked.push({ i, text: (c.itemId ? ' · item ' + c.itemId : '') + (c.title ? ' · ' + redactMsg(c.title, names) : '') + ' ===\n' + facts + '\n' + (lines.join('\n') || '(no messages)') });
//           job.found = picked.length;
//         } catch (e) { job.checked++; }
//       }
//     }
//     await Promise.all([1, 2, 3, 4].map(worker));
//     picked.sort((a, b) => a.i - b.i);
//     job.text = 'PartsLister Pro — buyer messages with listing & order facts, last ' + days + ' days — ' + picked.length + ' conversation' + (picked.length === 1 ? '' : 's') + (draftsOnly ? ' answered with an AI draft' : '') + '\n'
//       + 'Downloaded ' + new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC. "Facts now" is the listing and this buyer\'s order as of the download (not when the message was sent). Usernames, emails, phone numbers, addresses and VINs are removed.\n\n'
//       + picked.map((p, k) => '=== Conversation ' + (k + 1) + p.text).join('\n\n') + '\n';
//   } catch (e) { job.error = e.message; }
//   job.finished = Date.now();
// }
// v347: + sandbox AI replies (written into the file only — never sent)
async function runMsgExport(job, user, days, count, sandbox) {
  try {
    const conn = await getConnection(user.id);
    if (threadsBlocked(conn)) throw new Error('Connect eBay (with message permission) first.');
    const me = await myEbayUser(user.id);
    const settings = await getUserSettings(user.id);
    const signoff = msgSettingsOf(settings).signoff;   // used to label replies you sent from an AI draft
    if (sandbox && !String(settings.apiKey || '').trim()) throw new Error('Sandbox AI replies use your Anthropic key — add it in ⚙ Settings → Account first.');
    const cutoff = Date.now() - days * 86400000;
    const convs = [];
    for (let offset = 0; offset < 2000; offset += 50) {
      const q = new URLSearchParams({ conversation_type: 'FROM_MEMBERS', limit: '50', offset: String(offset) });
      const { data } = await restCall(user.id, 'GET', '/commerce/message/v1/conversation?' + q);
      const list = (data && data.conversations) || [];
      list.forEach(c => {
        const lm = c.latestMessage || {};
        const when = Date.parse(lm.createdDate || c.createdDate || '') || 0;
        if (when >= cutoff) convs.push({ id: c.conversationId, title: c.conversationTitle || '', itemId: c.referenceType === 'LISTING' ? (c.referenceId || '') : '', when });
      });
      if (!data || !data.next || list.length < 50) break;
    }
    convs.sort((a, b) => b.when - a.when);
    const pick = convs.slice(0, count);
    job.candidates = convs.length;
    job.target = pick.length;
    const out = new Array(pick.length);
    let next = 0;
    async function worker() {
      while (next < pick.length) {
        const i = next++, c = pick[i];
        try {
          const q = new URLSearchParams({ conversation_type: 'FROM_MEMBERS', limit: '50', offset: '0' });
          const { data } = await restCall(user.id, 'GET', '/commerce/message/v1/conversation/' + encodeURIComponent(c.id) + '?' + q);
          const msgs = ((data && data.messages) || []).slice().sort((x, y) => String(x.createdDate).localeCompare(String(y.createdDate)));
          const isDraft = (m) => !!signoff && m.senderUsername === me && String(m.messageBody || '').trim().endsWith(signoff);
          const others = [...new Set(msgs.map(m => m.senderUsername).filter(u => u && u !== me))];
          const names = [{ name: me, as: 'Seller' }].concat(others.map((u, k) => ({ name: u, as: others.length > 1 ? 'Buyer' + (k + 1) : 'Buyer' })));
          const facts = c.itemId ? await exportFactsLine(user.id, c.itemId, others[0] || '') : 'Facts now: no listing attached';
          const line = (m) => {
            const who = m.senderUsername === me ? (isDraft(m) ? 'Seller (AI draft)' : 'Seller') : 'Buyer' + (others.length > 1 ? (others.indexOf(m.senderUsername) + 1) : '');
            const media = (m.messageMedia || []).length ? ' [' + (m.messageMedia || []).length + ' photo/attachment]' : '';
            return '[' + String(m.createdDate || '').slice(0, 16).replace('T', ' ') + '] ' + who + ': ' + redactMsg(m.messageBody || '', names).replace(/\r?\n+/g, ' / ') + media;
          };
          let body;
          if (!sandbox) body = msgs.map(line).join('\n') || '(no messages)';
          else {
            // the AI answers the buyer's newest message — if you already replied, as of just before your reply
            let lb = -1; msgs.forEach((m, k) => { if (m.senderUsername !== me) lb = k; });
            if (lb < 0) body = (msgs.map(line).join('\n') || '(no messages)') + '\n>>> Sandbox AI reply: (no buyer message to answer)';
            else {
              const s = msgs.findIndex((m, k) => k > lb && m.senderUsername === me);
              const before = s >= 0 ? msgs.slice(0, s) : msgs;
              const after = s >= 0 ? msgs.slice(s) : [];
              let status = 200, res = null;
              const sb = { before: s >= 0 ? String(msgs[s].createdDate || '') : null };
              const fakeReq = { user, params: { id: c.id }, body: { itemId: c.itemId || null }, _sandbox: sb };
              const fakeRes = { status(x) { status = x; return this; }, json(o) { res = o; return this; } };
              await draftHandler(fakeReq, fakeRes);   // the same code as AI draft on the Messages page — it only returns text
              let ai;
              if (status !== 200 || !res) ai = '(error: ' + ((res && res.error) || ('HTTP ' + status)) + ')';
              else if (res.noReply) ai = '(no reply — ' + (res.reason || 'nothing to answer') + ')';
              else {
                ai = redactMsg(res.draft || '', names).replace(/\r?\n+/g, ' / ');
                if (res.english) ai += '\n    (English: ' + redactMsg(res.english, names).replace(/\r?\n+/g, ' / ') + ')';
                if (res.discount) ai += '\n    (would send a ' + res.discount.percent + '% offer: $' + Number(res.discount.offerPrice).toFixed(2) + ' — NOT sent)';
                if (res.followUp) ai += '\n    (would add to Waiting on me: ' + redactMsg(res.followUp, names) + ')';
              }
              body = (before.map(line).join('\n') || '(no messages)')
                + '\n>>> Sandbox AI reply' + (s >= 0 ? ' (as of ' + String(msgs[s].createdDate || '').slice(0, 16).replace('T', ' ') + ')' : '') + ': ' + ai
                + (after.length ? '\n--- Your actual reply and what came after:\n' + after.map(line).join('\n') : '\n--- (you haven\'t replied yet)');
            }
          }
          out[i] = (c.itemId ? ' · item ' + c.itemId : '') + (c.title ? ' · ' + redactMsg(c.title, names) : '') + ' ===\n' + facts + '\n' + body;
        } catch (e) { out[i] = ' ===\n(couldn\'t load: ' + e.message + ')'; }
        job.found++;
        job.checked = job.found;
      }
    }
    await Promise.all((sandbox ? [1, 2, 3] : [1, 2, 3, 4]).map(worker));
    job.text = 'PartsLister Pro — buyer messages with listing & order facts' + (sandbox ? ' + SANDBOX AI replies' : '') + ', last ' + days + ' days — ' + out.filter(Boolean).length + ' conversations\n'
      + 'Downloaded ' + new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC. "Facts now" is the listing and this buyer\'s order as of the download (not when the message was sent).'
      + (sandbox ? ' Sandbox AI replies were written for this file only — nothing was sent to buyers. If you had already replied, the AI only saw the conversation up to your reply (but the listing/order facts are as of now).' : '')
      + ' Usernames, emails, phone numbers, addresses and VINs are removed.\n\n'
      + out.map((t, k) => '=== Conversation ' + (k + 1) + (t || ' ===\n(missing)')).join('\n\n') + '\n';
  } catch (e) { job.error = e.message; }
  job.finished = Date.now();
}

app.post('/api/admin/messages-export2', requireUser, requireAdmin, express.json(), (req, res) => {
  const b = req.body || {};
  const days = [7, 14, 30, 90, 365].includes(parseInt(b.days, 10)) ? parseInt(b.days, 10) : 14;
  const count = [50, 100, 300].includes(parseInt(b.count, 10)) ? parseInt(b.count, 10) : 100;
  for (const j of msgExports.values()) if (j.userId === req.user.id && !j.finished) return res.status(409).json({ error: 'A download is already being prepared.' });
  for (const [k, j] of msgExports) if (j.finished && Date.now() - j.finished > 3600000) msgExports.delete(k);   // keep an hour
  const id = crypto.randomBytes(8).toString('hex');
  const job = { userId: req.user.id, days, target: count, candidates: null, checked: 0, found: 0, started: Date.now(), finished: null, error: null, text: '' };
  msgExports.set(id, job);
  // runMsgExport(job, req.user, days, count, !!b.draftsOnly);
  runMsgExport(job, req.user, days, count, !!b.sandbox);   // v347
  res.json({ id });
});
app.get('/api/admin/messages-export2/:id', requireUser, requireAdmin, (req, res) => {
  const job = msgExports.get(String(req.params.id));
  if (!job || job.userId !== req.user.id) return res.status(404).json({ error: 'Download not found (the server may have restarted) — start it again.' });
  if (req.query.download === '1') {
    if (!job.finished || !job.text) return res.status(409).send(job.error || 'Not ready yet.');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="partslister-messages-' + (job.text.includes('SANDBOX') ? 'sandbox-' : 'facts-') + job.days + 'd-' + new Date(job.started).toISOString().slice(0, 10) + '.txt"');
    return res.send(job.text);
  }
  res.json({ target: job.target, candidates: job.candidates, checked: job.checked, found: job.found, finished: !!job.finished, error: job.error });
});

// ─── v337: LISTING + ORDER STRIP for a conversation ─────────────────────────
// Title, price, shipping (live GetItem) and, for this conversation's buyer, whether they bought it,
// shipped / tracking / delivered (live GetOrders). Nothing new is stored.
app.get('/api/threads/:id/info', requireUser, async (req, res) => {
  const itemId = String(req.query.itemId || '');
  const buyer = String(req.query.buyer || '').slice(0, 80);
  if (!/^\d{6,20}$/.test(itemId)) return res.status(400).json({ error: 'Bad item number' });
  try {
    const out = { itemId, title: null, price: null, shipping: null, listingStatus: null, url: 'https://www.ebay.com/itm/' + itemId, order: null };
    try {
      const xml = await tradingCall(req.user.id, 'GetItem', `<ItemID>${itemId}</ItemID><DetailLevel>ReturnAll</DetailLevel>`);
      const item = xmlTag(xml, 'Item') || '';
      const ss = xmlTag(item, 'SellingStatus') || '';
      const sd = xmlTag(item, 'ShippingDetails') || '';
      out.title = xmlDecode(xmlTag(item, 'Title')) || null;
      out.price = parseFloat(xmlTag(ss, 'CurrentPrice') || '') || null;
      out.listingStatus = xmlTag(ss, 'ListingStatus') || null;
      out.quantitySold = parseInt(xmlTag(ss, 'QuantitySold') || '0', 10) || 0;
      const opt = xmlAll(sd, 'ShippingServiceOptions')[0] || '';
      const stype = xmlTag(sd, 'ShippingType') || '';
      if (opt) {
        const free = xmlTag(opt, 'FreeShipping') === 'true';
        const cost = parseFloat(xmlTag(opt, 'ShippingServiceCost') || '');
        out.shipping = { service: xmlDecode(xmlTag(opt, 'ShippingService') || ''), free, cost: free ? 0 : (isNaN(cost) ? null : cost), calculated: /Calculated/i.test(stype) && !free };
      } else if (/Calculated/i.test(stype)) out.shipping = { calculated: true, cost: null, free: false, service: '' };
    } catch (e) {
      const it = await getItemData(req.user.id, itemId).catch(() => ({}));
      if (it && it.data) { out.title = it.data.title; out.price = it.data.price; out.listingStatus = it.data.listingStatus; }
      out.itemError = e.message;
    }
    const fo = await findBuyerOrder(req.user.id, itemId, buyer);
    if (fo.otherBuyer) out.order = { status: 'other_buyer' };
    else if (fo.row) {
      const o = fo.row, sh = fo.ship || {};
      out.order = {
        status: !o.counted ? 'cancelled' : sh.deliveredTime ? 'delivered' : (sh.shippedTime || o.ship_status === 'FULFILLED') ? 'shipped' : 'bought',
        orderId: o.order_id, sold: o.created_at, total: o.total !== null ? Number(o.total) : null, rawStatus: o.status,
        shipped: sh.shippedTime || null, delivered: sh.deliveredTime || null, expected: sh.expectedMax || null,
        tracks: sh.tracks || [], shipError: fo.shipErr || null
      };
    } else out.order = { status: 'not_bought' };
    try {   // v371: already in Late returns?
      const lr = await pool.query('SELECT id, sent_at, received_at, refunded_at FROM late_returns WHERE user_id = $1 AND conversation_id = $2 ORDER BY id DESC LIMIT 1', [req.user.id, String(req.params.id)]);
      out.lateReturn = lr.rows[0] ? { id: lr.rows[0].id, sent: lr.rows[0].sent_at, received: lr.rows[0].received_at, refunded: lr.rows[0].refunded_at } : null;
    } catch (e) { out.lateReturn = null; }
    res.json(out);
  } catch (e) {
    console.error('[thread info]', e.message);
    res.status(500).json({ error: 'Could not load the listing info' });
  }
});

// ─── v336: "WAITING ON ME" — conversations you promised to get back to ─────────
// Stores only the conversation id, the item, its title and your to-do — never buyer messages.
app.get('/api/followups', requireUser, async (req, res) => {
  try {
    const r = await pool.query(`SELECT id, conversation_id, item_id, title, task, created_at FROM msg_followups
      WHERE user_id = $1 AND done_at IS NULL ORDER BY created_at`, [req.user.id]);
    res.json({ followups: r.rows.map(x => ({ id: x.id, conversationId: x.conversation_id, itemId: x.item_id, title: x.title, task: x.task, since: x.created_at })) });
  } catch (e) { console.error('[followups]', e.message); res.status(500).json({ error: 'Could not load Waiting on me' }); }
});
app.post('/api/followups', requireUser, express.json(), async (req, res) => {
  const b = req.body || {};
  const conv = String(b.conversationId || '');
  if (!/^[\w.:-]{1,80}$/.test(conv)) return res.status(400).json({ error: 'Bad conversation' });
  const itemId = /^\d{6,20}$/.test(String(b.itemId || '')) ? String(b.itemId) : null;
  const title = String(b.title || '').slice(0, 200) || null;
  const task = String(b.task || '').trim().slice(0, 200) || 'Get back to the buyer';
  try {
    // one open to-do per conversation: a new promise replaces the old wording
    const open = await pool.query('SELECT id FROM msg_followups WHERE user_id = $1 AND conversation_id = $2 AND done_at IS NULL', [req.user.id, conv]);
    if (open.rows.length) await pool.query('UPDATE msg_followups SET task = $1, item_id = COALESCE($2, item_id), title = COALESCE($3, title) WHERE id = $4', [task, itemId, title, open.rows[0].id]);
    else await pool.query('INSERT INTO msg_followups (user_id, conversation_id, item_id, title, task) VALUES ($1, $2, $3, $4, $5)', [req.user.id, conv, itemId, title, task]);
    res.json({ ok: true });
  } catch (e) { console.error('[followups add]', e.message); res.status(500).json({ error: 'Could not add to Waiting on me' }); }
});
app.post('/api/followups/:id/done', requireUser, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!(id > 0)) return res.status(400).json({ error: 'Bad id' });
  try {
    await pool.query('UPDATE msg_followups SET done_at = now() WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: 'Could not mark it complete' }); }
});

// ─── v371: LATE RETURNS ──────────────────────────────────────────────────────
// Returns you agreed to take back after eBay's window closed. The buyer mails it on their own (no
// eBay tracking), so: address sent → you mark it received → refunded (picked up from eBay's money
// records for the order, or marked by hand). Not received within 30 days → removed. Refunded ones
// show for 7 days, then go. Stores no buyer name, address or messages.
const LATE_DAYS = 30;
function returnAddressKey(address) {
  const first = String(address || '').split(/\n|,/).map(s => s.trim()).find(s => /\d/.test(s) && s.length >= 5) || '';
  return first.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10);   // house number + start of the street (so "Rd" vs "Road" still matches)
}
function hasReturnAddress(text, address) {
  const k = returnAddressKey(address);
  return k.length >= 6 && String(text || '').toLowerCase().replace(/[^a-z0-9]/g, '').includes(k);
}
async function addLateReturn(userId, conv, itemId, buyer, source) {
  const fo = await findBuyerOrder(userId, itemId, buyer);
  if (fo.otherBuyer) return { ok: false, error: 'This buyer didn\u2019t buy this item.' };
  if (!fo.row) return { ok: false, error: 'No order found for this buyer and item.' };
  const ex = await pool.query('SELECT id FROM late_returns WHERE user_id = $1 AND order_id = $2 AND refunded_at IS NULL', [userId, fo.row.order_id]);
  if (ex.rows.length) return { ok: true, existed: true, id: ex.rows[0].id };
  let title = null;
  try { const it = await getItemData(userId, itemId); title = (it && it.data && it.data.title) || null; } catch (e) { /* title is optional */ }
  const r = await pool.query(`INSERT INTO late_returns (user_id, conversation_id, item_id, order_id, title, order_total, source)
    VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`, [userId, conv, itemId, fo.row.order_id, title, fo.row.total, source]);
  return { ok: true, id: r.rows[0].id };
}
app.get('/api/late-returns', requireUser, async (req, res) => {
  try {
    await pool.query(`DELETE FROM late_returns WHERE user_id = $1 AND (
      (received_at IS NULL AND refunded_at IS NULL AND sent_at < now() - interval '${LATE_DAYS} days') OR
      (refunded_at IS NOT NULL AND refunded_at < now() - interval '7 days'))`, [req.user.id]);
    const rows = (await pool.query('SELECT * FROM late_returns WHERE user_id = $1 ORDER BY sent_at', [req.user.id])).rows;
    // refunded on eBay since the address was sent? → mark it
    for (const x of rows.filter(x => !x.refunded_at && x.order_id)) {
      try {
        const f = await orderFees(req.user.id, x.order_id);
        const rf = ((f && f.refunds) || []).filter(t => t.date && new Date(t.date) >= new Date(x.sent_at));
        if (rf.length) {
          const amount = Math.round(rf.reduce((s, t) => s + t.amount + t.credit, 0) * 100) / 100;
          const when = rf[rf.length - 1].date;
          await pool.query('UPDATE late_returns SET refunded_at = $2, refund_amount = $3 WHERE id = $1', [x.id, when, amount]);
          x.refunded_at = when; x.refund_amount = amount;
        }
      } catch (e) { /* check again next time */ }
    }
    const ms = msgSettingsOf(await getUserSettings(req.user.id));
    res.json({ enabled: ms.honorLate.enabled, days: LATE_DAYS, items: rows.map(x => ({
      id: x.id, conversationId: x.conversation_id, itemId: x.item_id, orderId: x.order_id, title: x.title,
      total: x.order_total !== null ? Number(x.order_total) : null, source: x.source,
      sent: x.sent_at, received: x.received_at, refunded: x.refunded_at, refundAmount: x.refund_amount !== null ? Number(x.refund_amount) : null,
      dropsOn: x.received_at ? null : new Date(new Date(x.sent_at).getTime() + LATE_DAYS * 86400000).toISOString()
    })) });
  } catch (e) { console.error('[late returns]', e.message); res.status(500).json({ error: 'Could not load Late returns' }); }
});
app.post('/api/late-returns', requireUser, express.json(), async (req, res) => {
  const b = req.body || {};
  const conv = String(b.conversationId || ''), itemId = String(b.itemId || '');
  if (!/^[\w.:-]{1,80}$/.test(conv) || !/^\d{6,20}$/.test(itemId)) return res.status(400).json({ error: 'This conversation has no item.' });
  try {
    const r = await addLateReturn(req.user.id, conv, itemId, String(b.buyer || '').slice(0, 80), 'manual');
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json({ ok: true, existed: !!r.existed });
  } catch (e) { console.error('[late returns add]', e.message); res.status(500).json({ error: 'Could not add it to Late returns' }); }
});
app.post('/api/late-returns/:id/:action', requireUser, async (req, res) => {
  const id = parseInt(req.params.id, 10), action = req.params.action;
  if (!(id > 0)) return res.status(400).json({ error: 'Bad id' });
  const sql = {
    received: 'UPDATE late_returns SET received_at = now() WHERE id = $1 AND user_id = $2',
    unreceived: 'UPDATE late_returns SET received_at = NULL WHERE id = $1 AND user_id = $2',
    refunded: 'UPDATE late_returns SET refunded_at = now() WHERE id = $1 AND user_id = $2',
    remove: 'DELETE FROM late_returns WHERE id = $1 AND user_id = $2'
  }[action];
  if (!sql) return res.status(400).json({ error: 'Unknown action' });
  try { await pool.query(sql, [id, req.user.id]); res.json({ ok: true }); }
  catch (e) { res.status(500).json({ error: 'Could not update it' }); }
});

// ─── v386: YARD TICKETS ──────────────────────────────────────────────────────
// const TICKET_TEMPLATE = '{yard}\nENTRY TICKET\nADMIT ONE\n…Date: {date}\nTime: {time}…';   (v386)
// v389: {date} {time} = when the ticket was really sold; {valid} = the day it's good for; {number} = its own
//       ticket number; {barcode} = a barcode of that number; {logo} = your logo; {big} = this line large
const TICKET_TEMPLATE = '{logo}\n{big}{yard}\nENTRY TICKET\nADMIT ONE\n--------------------------------\nValid: {valid}\nSold: {date} {time}\nPrice: {price}\n--------------------------------\nTicket #{number}\n{barcode}\nThank you!';
// v390: ticket designer — everything is clamped here so a saved design can never break printing
const TICKET_FONTS = ['Courier New', 'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Trebuchet MS', 'Impact', 'Arial Black'];
function cleanRow(r) {
  r = (r && typeof r === 'object') ? r : {};
  const n = (v, def, lo = 1, hi = 100) => { v = parseInt(v, 10); return Number.isFinite(v) ? Math.max(lo, Math.min(hi, v)) : def; };
  const al = (v, def) => ['left', 'center', 'right'].includes(v) ? v : def;
  const type = ['text', 'line', 'logo', 'barcode'].includes(r.type) ? r.type : 'text';
  const out = { type, align: al(r.align, 'center'), top: n(r.top, 0, 0), bottom: n(r.bottom, type === 'text' ? 0 : 5, 0) };
  if (type === 'text') Object.assign(out, { text: String(r.text || '').replace(/[\r\n]+/g, ' ').slice(0, 200), font: TICKET_FONTS.includes(r.font) ? r.font : 'Courier New', size: n(r.size, 45), bold: !!r.bold });
  if (type === 'logo') Object.assign(out, { width: n(r.width, 70), weather: n(r.weather, 0, 0), fuzzy: n(r.fuzzy, 0, 0), fade: n(r.fade, 0, 0), spots: n(r.spots, 0, 0) });
  if (type === 'barcode') Object.assign(out, { value: String(r.value || '').replace(/[^\x20-\x7E]/g, '').trim().slice(0, 40), width: n(r.width, 75), height: n(r.height, 22) });   // value '' = each ticket's own number
  return out;
}
// v391: a ticket is a list of rows (text, divider line, logo, barcode) — each row has its own font, size and position
function cleanDesign(d) {
  d = (d && typeof d === 'object') ? d : {};
  const rows = Array.isArray(d.rows) ? d.rows.slice(0, 60).map(cleanRow) : null;
  return { rows: rows && rows.length ? rows : null };   // null = not redesigned yet (the page builds rows from the old ticket text)
}
async function ticketSettings(userId) {
  // const r = await pool.query('SELECT time, width, randomize FROM ticket_settings …');   (v388)
  const r = await pool.query('SELECT width FROM ticket_settings WHERE user_id = $1', [userId]);   // v389: paper width only
  return { width: r.rows[0] ? r.rows[0].width : 80 };
}
app.get('/api/tickets', requireUser, async (req, res) => {
  try {
    // first time: a sample yard so there's something to print (edit or remove it in Manage)
    const first = await pool.query('INSERT INTO ticket_settings (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING RETURNING user_id', [req.user.id]);
    if (first.rows.length) await pool.query('INSERT INTO yards (user_id, name, price, template, sort) VALUES ($1, $2, $3, NULL, 1)', [req.user.id, 'Sample Yard', 2]);
    const yards = (await pool.query('SELECT id, name, price, template, logo, logo_size, design FROM yards WHERE user_id = $1 ORDER BY sort, id', [req.user.id])).rows;   // v387: + logo
    const tz = msgSettingsOf(await getUserSettings(req.user.id)).timezone || 'America/Chicago';
    // money made from tickets sold — week (since Monday), month, year, lifetime — counted in your time zone
    const sums = (await pool.query(`SELECT yard_id,
        COUNT(*)::int AS prints,
        COALESCE(SUM(price), 0)::float AS total,
        COALESCE(SUM(price) FILTER (WHERE printed_at >= date_trunc('week',  now() AT TIME ZONE $2) AT TIME ZONE $2), 0)::float AS week,
        COALESCE(SUM(price) FILTER (WHERE printed_at >= date_trunc('month', now() AT TIME ZONE $2) AT TIME ZONE $2), 0)::float AS month,
        COALESCE(SUM(price) FILTER (WHERE printed_at >= date_trunc('year',  now() AT TIME ZONE $2) AT TIME ZONE $2), 0)::float AS year
      FROM ticket_prints WHERE user_id = $1 GROUP BY yard_id`, [req.user.id, tz])).rows;
    const by = new Map(sums.map(s => [s.yard_id, s]));
    const tot = sums.reduce((a, s) => ({ week: a.week + s.week, month: a.month + s.month, year: a.year + s.year, total: a.total + s.total, prints: a.prints + s.prints }), { week: 0, month: 0, year: 0, total: 0, prints: 0 });
    res.json({ settings: await ticketSettings(req.user.id), tz, defaultTemplate: TICKET_TEMPLATE, defaultDesign: cleanDesign({}), made: tot,   // v389: saved → made (money from tickets sold)
      yards: yards.map(y => { const s = by.get(y.id) || {}; return { id: y.id, name: y.name, price: Number(y.price), template: y.template || TICKET_TEMPLATE, logo: y.logo || null, logoSize: y.logo_size || 70, design: cleanDesign(y.design), sold: s.prints || 0, made: s.total || 0 }; }) });
  } catch (e) { console.error('[tickets]', e.message); res.status(500).json({ error: 'Could not load yard tickets' }); }
});
app.post('/api/tickets/yards', requireUser, express.json({ limit: '3mb' }), async (req, res) => {   // v387: room for a logo
  const b = req.body || {};
  // v387: logo — a PNG/JPEG data URL (made black & white and shrunk on the page); '' removes it; left out = keep it
  let logo;
  if (typeof b.logo === 'string') {
    if (b.logo === '') logo = null;
    else if (/^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(b.logo) && b.logo.length <= 2000000) logo = b.logo;
    else return res.status(400).json({ error: 'That logo file didn\u2019t work — use a PNG or JPG picture.' });
  }
  const logoSize = Math.max(1, Math.min(100, parseInt(b.logoSize, 10) || 70));   // v390: any size 1–100
  const design = JSON.stringify(cleanDesign(b.design));
  const name = String(b.name || '').trim().slice(0, 80);
  const price = Math.max(0, Math.min(10000, parseFloat(b.price) || 0));
  const template = String(b.template || '').replace(/\r/g, '').slice(0, 2000) || null;
  if (!name) return res.status(400).json({ error: 'Give the yard a name.' });
  try {
    const id = parseInt(b.id, 10);
    // if (id > 0) await pool.query('UPDATE yards SET name = $3, price = $4, template = $5 WHERE id = $1 AND user_id = $2', [id, req.user.id, name, price, template]);
    // else await pool.query('INSERT INTO yards (user_id, name, price, template, sort) VALUES (…)', [req.user.id, name, price, template]);
    if (id > 0) {
      await pool.query('UPDATE yards SET name = $3, price = $4, template = $5, logo_size = $6, design = $7::jsonb WHERE id = $1 AND user_id = $2', [id, req.user.id, name, price, template, logoSize, design]);
      if (logo !== undefined) await pool.query('UPDATE yards SET logo = $3 WHERE id = $1 AND user_id = $2', [id, req.user.id, logo]);
    } else await pool.query('INSERT INTO yards (user_id, name, price, template, logo, logo_size, design, sort) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, (SELECT COALESCE(MAX(sort), 0) + 1 FROM yards WHERE user_id = $1))', [req.user.id, name, price, template, logo || null, logoSize, design]);   // v387: + logo
    res.json({ ok: true });
  } catch (e) { console.error('[tickets save]', e.message); res.status(500).json({ error: 'Could not save the yard' }); }
});
app.post('/api/tickets/yards/:id/delete', requireUser, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!(id > 0)) return res.status(400).json({ error: 'Bad yard' });
  try { await pool.query('DELETE FROM yards WHERE id = $1 AND user_id = $2', [id, req.user.id]); res.json({ ok: true }); }   // its sales log (money made) is kept
  catch (e) { res.status(500).json({ error: 'Could not remove it' }); }
});
app.post('/api/tickets/settings', requireUser, express.json(), async (req, res) => {
  const b = req.body || {};
  // v389: paper width only (the saved time and Randomize are gone — every ticket shows when it was really sold)
  const width = [58, 80].includes(parseInt(b.width, 10)) ? parseInt(b.width, 10) : null;
  if (!width) return res.status(400).json({ error: 'Pick a paper width.' });
  try {
    await pool.query(`INSERT INTO ticket_settings (user_id, width) VALUES ($1, $2)
      ON CONFLICT (user_id) DO UPDATE SET width = EXCLUDED.width`, [req.user.id, width]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: 'Could not save' }); }
});
// Sell: logs the sale (adds the price to Money made) and sends back the filled-in ticket.
// v389: the date and time are the real moment of the sale. { advance: true } = a ticket sold today that is
//       good for tomorrow; it says VALID FOR tomorrow's date and still shows the real sale date and time.
app.post('/api/tickets/yards/:id/print', requireUser, express.json(), async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const y = (await pool.query('SELECT id, name, price, template, logo, logo_size, design FROM yards WHERE id = $1 AND user_id = $2', [id, req.user.id])).rows[0];
    if (!y) return res.status(404).json({ error: 'That yard isn\u2019t set up anymore.' });
    const st = await ticketSettings(req.user.id);
    const tz = msgSettingsOf(await getUserSettings(req.user.id)).timezone || 'America/Chicago';
    const advance = !!(req.body || {}).advance;
    const now = new Date();
    const todayKey = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
    const [ty, tm, td] = todayKey.split('-').map(Number);
    const validDay = new Date(Date.UTC(ty, tm - 1, td + (advance ? 1 : 0)));
    const validKey = validDay.toISOString().slice(0, 10);
    const row = (await pool.query('INSERT INTO ticket_prints (user_id, yard_id, yard_name, price, printed_at, valid_for) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [req.user.id, y.id, y.name, y.price, now, validKey])).rows[0];
    let number = String(row.id).padStart(6, '0'); if (number.length % 2) number = '0' + number;   // unique per ticket, even length so the barcode (Code 128-C) encodes it exactly
    const date = new Intl.DateTimeFormat('en-US', { timeZone: tz, month: '2-digit', day: '2-digit', year: 'numeric' }).format(now);
    const time = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit', hour12: true }).format(now);
    const valid = String(validDay.getUTCMonth() + 1).padStart(2, '0') + '/' + String(validDay.getUTCDate()).padStart(2, '0') + '/' + validDay.getUTCFullYear() + (advance ? ' (advance)' : '');
    const price = '$' + Number(y.price).toFixed(2);
    let tpl = String(y.template || TICKET_TEMPLATE);
    // an advance ticket always says which day it's good for, even if the ticket text has no {valid}
    if (advance && !tpl.includes('{valid}')) tpl += '\n{big}VALID FOR {valid}';
    const text = tpl.replace(/\{(yard|date|time|price|number|valid)\}/g, (m, k) => ({ yard: y.name, date, time, price, number, valid })[k]);
    res.json({ ok: true, text, number, template: tpl, vals: { yard: y.name, date, time, price, number, valid }, width: st.width, yard: y.name, logo: y.logo || null, logoSize: y.logo_size || 70, design: cleanDesign(y.design), advance });
  } catch (e) { console.error('[tickets print]', e.message); res.status(500).json({ error: 'Could not print the ticket' }); }
});

// ─── v322: OFFERS ────────────────────────────────────────────────────────────
// • Best Offers a buyer sent on an item → accept / counter / decline (Trading API)
// • "Send offer" → eBay's Negotiation API sends it to EVERYONE interested in the
//   item (watching it or has it in their cart). eBay doesn't let apps pick one buyer.
app.get('/api/offers/:itemId', requireUser, async (req, res) => {
  const itemId = String(req.params.itemId || '');
  if (!/^\d{6,20}$/.test(itemId)) return res.status(400).json({ error: 'Bad item number' });
  try {
    const conn = await getConnection(req.user.id);
    if (!conn || !conn.refresh_enc) return res.json({ connected: false });
    let best = [], bestError = null;
    try {
      const xml = await tradingCall(req.user.id, 'GetBestOffers', `<ItemID>${itemId}</ItemID><BestOfferStatus>Active</BestOfferStatus>`);
      best = xmlAll(xmlTag(xml, 'BestOfferArray') || '', 'BestOffer').map(b => ({
        id: xmlTag(b, 'BestOfferID'),
        buyer: xmlDecode(xmlTag(xmlTag(b, 'Buyer') || '', 'UserID')) || '',
        price: parseFloat(xmlTag(b, 'Price') || '') || null,
        qty: parseInt(xmlTag(b, 'Quantity') || '1', 10) || 1,
        status: xmlTag(b, 'Status') || '',
        kind: xmlTag(b, 'BestOfferCodeType') || '',
        message: xmlDecode(xmlTag(b, 'BuyerMessage')) || '',
        expires: xmlTag(b, 'ExpirationTime') || null
      })).filter(b => b.id);
    } catch (e) { if (!/no best offer|not found|no offers/i.test(e.message)) bestError = e.message; }
    let interested = null, sendError = null;
    if (!hasScope(conn, INV_SCOPE)) sendError = 'needScope';
    else {
      try {
        interested = false;
        for (let offset = 0; offset < 1000 && !interested; offset += 200) {
          const { status, data } = await restCall(req.user.id, 'GET', '/sell/negotiation/v1/find_eligible_items?limit=200&offset=' + offset, null, { 'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US' });
          const list = (status === 204 || !data) ? [] : (data.eligibleItems || []);
          if (list.some(x => String(x.listingId) === itemId)) interested = true;
          if (!data || !data.next || list.length < 200) break;
        }
      } catch (e) { sendError = scopeError(e) ? 'needScope' : e.message; interested = null; }
    }
    res.json({ connected: true, bestOffers: best, bestError, interested, sendError });
  } catch (e) {
    console.error('[offers]', e.message);
    res.status(500).json({ error: 'Could not load offers' });
  }
});

// Answer a Best Offer: { bestOfferId, action: accept|counter|decline, price?, message? }
app.post('/api/offers/:itemId/respond', requireUser, express.json(), async (req, res) => {
  const itemId = String(req.params.itemId || '');
  const b = req.body || {};
  const action = { accept: 'Accept', counter: 'Counter', decline: 'Decline' }[String(b.action)];
  const boId = String(b.bestOfferId || '');
  const price = parseFloat(b.price);
  const note = String(b.message || '').trim().slice(0, 250);
  if (!/^\d{6,20}$/.test(itemId) || !/^\d{1,20}$/.test(boId) || !action) return res.status(400).json({ error: 'Bad request' });
  if (action === 'Counter' && !(price > 0)) return res.status(400).json({ error: 'Enter your counter price.' });
  try {
    await tradingCall(req.user.id, 'RespondToBestOffer',
      `<ItemID>${itemId}</ItemID><BestOfferID>${boId}</BestOfferID><Action>${action}</Action>` +
      (action === 'Counter' ? `<CounterOfferPrice currencyID="USD">${price.toFixed(2)}</CounterOfferPrice><CounterOfferQuantity>1</CounterOfferQuantity>` : '') +
      (note ? `<SellerResponse>${xmlEsc(note)}</SellerResponse>` : ''));
    res.json({ ok: true });
  } catch (e) {
    console.error('[offer respond]', e.message);
    res.status(502).json({ error: 'eBay didn\u2019t accept that: ' + e.message });
  }
});

// Send an offer to everyone interested in the item: { price, message? } — good for 2 days
app.post('/api/offers/:itemId/send', requireUser, express.json(), async (req, res) => {
  const itemId = String(req.params.itemId || '');
  const price = parseFloat((req.body || {}).price);
  const message = String((req.body || {}).message || '').trim().slice(0, 2000);
  if (!/^\d{6,20}$/.test(itemId)) return res.status(400).json({ error: 'Bad item number' });
  if (!(price > 0)) return res.status(400).json({ error: 'Enter the offer price.' });
  try {
    const conn = await getConnection(req.user.id);
    if (!hasScope(conn, INV_SCOPE)) return res.status(400).json({ error: 'Reconnect eBay to approve "Send offers to buyers" first.' });
    const { data } = await restCall(req.user.id, 'POST', '/sell/negotiation/v1/send_offer_to_interested_buyers', {
      offeredItems: [{ listingId: itemId, price: { currency: 'USD', value: price.toFixed(2) }, quantity: 1 }],
      allowCounterOffer: false,
      message: message || undefined,
      offerDuration: { unit: 'DAY', value: 2 }
    }, { 'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US' });
    res.json({ ok: true, sent: ((data && data.offers) || []).length });
  } catch (e) {
    console.error('[offer send]', e.message);
    res.status(502).json({ error: 'eBay didn\u2019t send the offer: ' + e.message });
  }
});

// ─── v324: RETURNS, "NOT RECEIVED" CLAIMS, CASES (eBay Post-Order API) ──────
// Read live from eBay — nothing saved here. Uses your normal eBay sign-in.
async function poCall(userId, method, path, body) {
  const token = await getAccessToken(userId);
  const r = await fetch(EBAY_API_HOST + '/post-order/v2' + path, {
    method,
    headers: Object.assign({ 'Authorization': 'IAF ' + token, 'Accept': 'application/json', 'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US' },
      body ? { 'Content-Type': 'application/json' } : {}),
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(30000)
  });
  if (r.status === 204) return null;
  const t = await r.text();
  let d = null; try { d = t ? JSON.parse(t) : null; } catch (e) { /* not JSON */ }
  if (!r.ok) {
    const msg = (d && (d.error || d.errors) && [].concat(d.error || d.errors).map(e => e.longMessage || e.message).filter(Boolean).join('; ')) || t.slice(0, 200) || ('HTTP ' + r.status);
    const err = new Error(msg); err.status = r.status; throw err;
  }
  return d;
}
const dval = (x) => (x && typeof x === 'object' ? (x.value !== undefined ? x.value : null) : (x || null));
const amt = (x) => { const v = parseFloat(x && typeof x === 'object' ? x.value : x); return Number.isFinite(v) ? v : null; };
const poId = (s) => /^[0-9]{3,20}$/.test(String(s || ''));

function mapReturn(m) {
  const ci = m.creationInfo || {};
  const due = m.sellerResponseDue || {};
  const refund = m.sellerTotalRefund || {};
  return {
    kind: 'return', id: String(m.returnId), state: m.state || '', status: m.status || '', type: m.currentType || '',
    buyer: m.buyerLoginName || '', orderId: m.orderId || null,
    itemId: ci.item && ci.item.itemId ? String(ci.item.itemId) : null, qty: ci.item && ci.item.returnQuantity || 1,
    reason: ci.reason || '', comments: (ci.comments && (ci.comments.content || ci.comments)) || '',
    created: dval(ci.creationDate), due: dval(due.respondByDate), todo: due.activityDue || '',
    amount: amt(refund.actualRefundAmount) || amt(refund.estimatedRefundAmount),
    refunded: amt(refund.actualRefundAmount),
    options: (m.sellerAvailableOptions || []).map(o => o.actionType).filter(Boolean),
    links: (m.sellerAvailableOptions || []).filter(o => o.actionType && /^https:\/\/[^/]*ebay\.com\//i.test(o.actionURL || ''))
      .map(o => ({ type: o.actionType, url: o.actionURL })),   // v325: eBay's own page for each next step
    escalated: !!(m.escalationInfo && m.escalationInfo.caseId)
  };
}
// v373: cancellation requests (Post-Order API)
function mapCancel(m) {
  const state = m.cancelState || '', status = m.cancelStatus || '';
  const due = dval(m.sellerResponseDueDate);
  return {
    kind: 'cancel', id: String(m.cancelId), state, status, buyer: m.buyerLoginName || '',
    orderId: m.legacyOrderId || null, itemId: null, reason: m.cancelReason || '', closeReason: m.cancelCloseReason || '',
    amount: amt(m.requestRefundAmount), created: dval(m.cancelRequestDate), closedAt: dval(m.cancelCloseDate),
    due: /CLOSED/i.test(state) ? null : due, requestor: m.requestorType || '',
    needsMe: !/CLOSED/i.test(state) && !/SELLER/i.test(m.requestorType || '') && (!!due || /REQUEST|PENDING/i.test(status)),   // the buyer asked; waiting on you
    shipped: dval(m.shipmentDate)
  };
}
// v373: payment disputes (Fulfillment API — camelCase in JSON; snake_case accepted just in case)
function mapDispute(m) {
  const g = (a, b) => m[a] !== undefined ? m[a] : m[b];
  const status = g('paymentDisputeStatus', 'payment_dispute_status') || '';
  return {
    kind: 'dispute', id: String(g('paymentDisputeId', 'payment_dispute_id') || ''), status, reason: g('reason', 'reason') || '',
    orderId: g('orderId', 'order_id') || null, itemId: null, buyer: g('buyerUsername', 'buyer_username') || '',
    amount: amt(g('amount', 'amount')), created: g('openDate', 'open_date') || null, due: g('respondByDate', 'respond_by_date') || null,
    closedAt: g('closedDate', 'closed_date') || null
  };
}
const DISPUTE_SCOPE = 'https://api.ebay.com/oauth/api_scope/sell.payment.dispute';
// item number for an order (from the saved sales) — cancellations and disputes only give the order
async function itemsForOrders(userId, orderIds) {
  const ids = [...new Set(orderIds.filter(Boolean))];
  if (!ids.length) return {};
  const r = await pool.query('SELECT order_id, item_id FROM ebay_order_items WHERE user_id = $1 AND order_id = ANY($2)', [userId, ids]);
  const out = {}; r.rows.forEach(x => { if (!out[x.order_id]) out[x.order_id] = x.item_id; });
  return out;
}
function mapInquiry(m) {
  return {
    kind: 'inquiry', id: String(m.inquiryId), status: m.inquiryStatusEnum || '', buyer: m.buyer || '',
    itemId: m.itemId ? String(m.itemId) : null, amount: amt(m.claimAmount),
    created: dval(m.creationDate), due: dval(m.respondByDate), updated: dval(m.lastModifiedDate)
  };
}
function mapCase(m) {
  return {
    kind: 'case', id: String(m.caseId), status: m.caseStatusEnum || '', buyer: m.buyer || '',
    itemId: m.itemId ? String(m.itemId) : null, amount: amt(m.claimAmount),
    created: dval(m.creationDate), due: dval(m.respondByDate), updated: dval(m.lastModifiedDate)
  };
}

// ?view=open|closed — closed shows the last 90 days
async function loadReturns(userId, view) {
  const out = [], errors = [];
  const closed = view === 'closed';
  const from = new Date(Date.now() - 90 * 86400000).toISOString();
  try {
    const q = new URLSearchParams({ role: 'SELLER', limit: '200', sort: '-FILING_DATE', return_state: closed ? 'CLOSED' : 'ALL_OPEN' });
    if (closed) q.set('creation_date_range_from', from);
    const d = await poCall(userId, 'GET', '/return/search?' + q);
    ((d && d.members) || []).forEach(m => out.push(mapReturn(m)));
  } catch (e) { errors.push('Returns: ' + e.message); }
  try {
    const d = await poCall(userId, 'GET', '/inquiry/search?' + new URLSearchParams({ limit: '200' }));
    ((d && d.members) || []).map(mapInquiry)
      .filter(x => (/CLOSED/i.test(x.status) === closed) && (!closed || !x.created || x.created >= from))
      .forEach(x => out.push(x));
  } catch (e) { errors.push('Not-received claims: ' + e.message); }
  try {
    const q = new URLSearchParams({ limit: '200' });
    if (!closed) q.set('case_status_filter', 'OPEN'); else q.set('case_creation_date_range_from', from);
    const d = await poCall(userId, 'GET', '/casemanagement/search?' + q);
    ((d && d.members) || []).map(mapCase)
      .filter(x => closed ? /CLOSED/i.test(x.status) : !/CLOSED/i.test(x.status))
      .forEach(x => out.push(x));
  } catch (e) { errors.push('Cases: ' + e.message); }
  // v373: cancellation requests
  try {
    const q = new URLSearchParams({ role: 'SELLER', limit: '200', sort: '-CANCEL_REQUEST_DATE',
      creation_date_range_from: new Date(Date.now() - (closed ? 90 : 60) * 86400000).toISOString(), creation_date_range_to: new Date().toISOString() });
    const d = await poCall(userId, 'GET', '/cancellation/search?' + q);
    ((d && d.cancellations) || []).map(mapCancel)
      .filter(x => /CLOSED/i.test(x.state) === closed)
      .forEach(x => out.push(x));
  } catch (e) { errors.push('Cancellations: ' + e.message); }
  // v373: payment disputes (only with the permission)
  let disputesNeedScope = false;
  try {
    const conn = await getConnection(userId);
    if (!hasScope(conn, DISPUTE_SCOPE)) disputesNeedScope = true;
    else {
      const token = await getAccessToken(userId);
      const q = new URLSearchParams({ limit: '200', open_date_from: from, open_date_to: new Date().toISOString() });
      const r = await fetch(EBAY_FIN_HOST + '/sell/fulfillment/v1/payment_dispute_summary?' + q, {
        headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json', 'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US' }, signal: AbortSignal.timeout(30000) });
      if (r.status !== 204) {
        const t = await r.text(); let d = null; try { d = JSON.parse(t); } catch (e) { /* not JSON */ }
        if (!r.ok) throw new Error((d && d.errors && d.errors.map(e => e.longMessage || e.message).join('; ')) || ('HTTP ' + r.status));
        ((d && (d.paymentDisputeSummaries || d.payment_dispute_summaries)) || []).map(mapDispute)
          .filter(x => x.id && (/CLOSED/i.test(x.status) === closed))
          .forEach(x => out.push(x));
      }
    }
  } catch (e) { errors.push('Payment disputes: ' + e.message); }
  // item numbers for cancellations / disputes (they only give the order)
  try {
    const need = out.filter(x => !x.itemId && x.orderId);
    const map = await itemsForOrders(userId, need.map(x => x.orderId));
    need.forEach(x => { x.itemId = map[x.orderId] || (/^(\d{9,15})-\d+$/.exec(x.orderId) || [])[1] || null; });
  } catch (e) { /* titles are optional */ }
  out.sort((a, b) => String(b.created || '').localeCompare(String(a.created || '')));
  return { items: out, errors, disputesNeedScope };   // v373: + disputesNeedScope
}

app.get('/api/returns', requireUser, async (req, res) => {
  try {
    const conn = await getConnection(req.user.id);
    if (!conn || !conn.refresh_enc) return res.json({ connected: false });
    // const { items, errors } = await loadReturns(req.user.id, req.query.view === 'closed' ? 'closed' : 'open');
    // res.json({ connected: true, items, errors });
    const { items, errors, disputesNeedScope } = await loadReturns(req.user.id, req.query.view === 'closed' ? 'closed' : 'open');
    res.json({ connected: true, items, errors, disputesNeedScope });   // v373
  } catch (e) {
    console.error('[returns]', e.message);
    res.json({ connected: true, items: [], errors: [e.message] });
  }
});

// Count for Home: open returns/claims/cases (asked at most every 5 minutes)
const returnCounts = new Map();
app.get('/api/returns/summary', requireUser, async (req, res) => {
  try {
    const conn = await getConnection(req.user.id);
    if (!conn || !conn.refresh_enc) return res.json({ connected: false });
    const c = returnCounts.get(req.user.id);
    if (c && Date.now() - c.at < 300000) return res.json(c.data);
    const { items, errors } = await loadReturns(req.user.id, 'open');
    // const data = { connected: true, open: items.length, needMe: items.filter(x => x.kind !== 'return' || /SELLER/i.test(x.todo || '') || (x.options || []).length).length, errors };
    const needs = (x) => x.kind === 'return' ? (/SELLER/i.test(x.todo || '') || (x.options || []).length > 0)
      : x.kind === 'cancel' ? !!x.needsMe : x.kind === 'dispute' ? /ACTION_NEEDED/i.test(x.status) : true;   // v373
    const data = { connected: true, open: items.length, needMe: items.filter(needs).length, errors };
    returnCounts.set(req.user.id, { at: Date.now(), data });
    res.json(data);
  } catch (e) { res.json({ connected: true, open: null, error: e.message }); }
});

// v369: eBay's refund estimate for a return — one line per refund type (item price, original shipping…)
function returnEstimate(d) {
  const det = (d && d.detail) || {};
  const ri = det.refundInfo || (d && d.refundInfo) || {};
  const est = ri.estimatedRefundDetail || {};
  const lines = (est.itemizedRefundDetails || est.itemizedRefundDetail || []).map(x => ({
    type: x.refundFeeType || '', amount: amt(x.estimatedAmount), max: amt(x.maxAmount)
  })).filter(x => x.type && x.amount !== null);
  const total = Math.round(lines.reduce((s, x) => s + x.amount, 0) * 100) / 100;
  return lines.length ? { lines, total } : null;
}
// v370: eBay's money records for one order — the sale's fees and any refunds with their fee credit.
// Only amounts, dates and status are kept (no buyer details). Asked live, cached 2 minutes.
const orderFinCache = new Map();
async function orderFees(userId, orderId) {
  if (!orderId || !/^[0-9A-Za-z-]{5,40}$/.test(String(orderId))) return null;
  const conn = await getConnection(userId);
  if (!hasScope(conn, FIN_SCOPE)) return { needScope: true };
  const ck = userId + ':' + orderId, c = orderFinCache.get(ck);
  if (c && Date.now() - c.at < 120000) return c.data;
  const token = await getAccessToken(userId);
  const url = EBAY_FIN_HOST + '/sell/finances/v1/transaction?filter=' + encodeURIComponent('orderId:{' + orderId + '}') + '&limit=200';
  const r = await fetch(url, { headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json', 'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US' }, signal: AbortSignal.timeout(30000) });
  let list = [];
  if (r.status !== 204) {
    const t = await r.text();
    let d = null; try { d = JSON.parse(t); } catch (e) { /* not JSON */ }
    if (!r.ok) throw new Error((d && d.errors && d.errors.map(e => e.longMessage || e.message).join('; ')) || ('HTTP ' + r.status));
    list = (d && d.transactions) || [];
  }
  const feeSum = (t) => {
    let s = 0;
    (t.orderLineItems || []).forEach(li => (li.marketplaceFees || []).forEach(f => { const a = money(f.amount); if (a) s += Math.abs(a); }));
    const tot = money(t.totalFeeAmount);
    return Math.round((tot !== null && Math.abs(tot) > s ? Math.abs(tot) : s) * 100) / 100;
  };
  const sales = list.filter(t => t.transactionType === 'SALE');
  const data = {
    saleFees: sales.length ? Math.round(sales.reduce((s, t) => s + feeSum(t), 0) * 100) / 100 : null,
    saleBasis: sales.length ? Math.round(sales.reduce((s, t) => s + Math.abs(money(t.totalFeeBasisAmount) || 0), 0) * 100) / 100 : null,
    refunds: list.filter(t => t.transactionType === 'REFUND').map(t => ({
      date: t.transactionDate || null, amount: Math.abs(money(t.amount) || 0), credit: feeSum(t), status: t.transactionStatus || ''
    })).sort((a, b) => String(a.date).localeCompare(String(b.date)))
  };
  orderFinCache.set(ck, { at: Date.now(), data });
  return data;
}
// One return in full (history, notes) — shown as-is from eBay
app.get('/api/returns/return/:id', requireUser, async (req, res) => {
  if (!poId(req.params.id)) return res.status(400).json({ error: 'Bad return number' });
  try {
    const d = await poCall(req.user.id, 'GET', '/return/' + req.params.id + '?fieldgroups=FULL');
    const det = (d && d.detail) || {};
    const history = (det.responseHistory || []).map(h => ({
      when: dval(h.creationDate), who: h.author || '', what: h.activity || '', note: (h.notes && (h.notes.content || h.notes)) || ''
    }));
    // res.json({ summary: d && d.summary ? mapReturn(d.summary) : null, history });
    // res.json({ summary: d && d.summary ? mapReturn(d.summary) : null, history, estimate: returnEstimate(d) });   // v369: + eBay's refund breakdown
    const summary = d && d.summary ? mapReturn(d.summary) : null;
    let fees = null;   // v370: what eBay charged / credited back for this order
    if (summary && summary.orderId) {
      try { fees = await orderFees(req.user.id, summary.orderId); }
      catch (e) { console.warn('[return fees]', e.message); fees = { error: e.message }; }
    }
    res.json({ summary, history, estimate: returnEstimate(d), fees });
  } catch (e) {
    console.error('[return]', e.message);
    res.json({ error: 'eBay didn\u2019t give us that return: ' + e.message });
  }
});

const clearReturnCount = (userId) => returnCounts.delete(userId);

// Return: { decision: APPROVE | DECLINE | OFFER_PARTIAL_REFUND, amount?, comment?, keepItem? }
app.post('/api/returns/return/:id/decide', requireUser, express.json(), async (req, res) => {
  const b = req.body || {};
  const decision = String(b.decision || '');
  if (!poId(req.params.id) || !['APPROVE', 'DECLINE', 'OFFER_PARTIAL_REFUND'].includes(decision)) return res.status(400).json({ error: 'Bad request' });
  const comment = String(b.comment || '').trim().slice(0, 1000);
  const amount = parseFloat(b.amount);
  if (decision === 'OFFER_PARTIAL_REFUND' && !(amount > 0)) return res.status(400).json({ error: 'Enter the partial refund amount.' });
  if (decision === 'DECLINE' && !comment) return res.status(400).json({ error: 'eBay needs a reason to decline — type one in the note.' });
  try {
    const body = { decision };
    if (comment) body.comments = { content: comment };
    if (decision === 'OFFER_PARTIAL_REFUND') body.partialRefundAmount = { value: amount.toFixed(2), currency: 'USD' };
    if (b.keepItem) body.keepOriginalItem = true;
    await poCall(req.user.id, 'POST', '/return/' + req.params.id + '/decide', body);
    clearReturnCount(req.user.id);
    res.json({ ok: true });
  } catch (e) {
    console.error('[return decide]', e.message);
    res.status(502).json({ error: 'eBay didn\u2019t accept that: ' + e.message });
  }
});

// Return: refund the buyer { amount, comment? }
app.post('/api/returns/return/:id/refund', requireUser, express.json(), async (req, res) => {
  const amount = parseFloat((req.body || {}).amount);
  const comment = String((req.body || {}).comment || '').trim().slice(0, 1000);
  // if (!poId(req.params.id) || !(amount > 0)) return res.status(400).json({ error: 'Enter the refund amount.' });
  if (!poId(req.params.id)) return res.status(400).json({ error: 'Bad return number' });   // v369: the amount comes from eBay's estimate
  try {
    // const money = { value: amount.toFixed(2), currency: 'USD' };
    // const body = { refundDetail: { itemizedRefundDetail: [{ refundAmount: money, refundFeeType: 'PURCHASE_PRICE' }], totalAmount: money } };
    // v369: refund exactly eBay's breakdown for this return (it refused a single full-amount line)
    const full = await poCall(req.user.id, 'GET', '/return/' + req.params.id + '?fieldgroups=FULL');
    const est = returnEstimate(full);
    let body;
    if (est) {
      if (amount > 0 && Math.abs(amount - est.total) > 0.01) return res.status(400).json({ error: 'eBay\u2019s refund for this return is ' + est.total.toFixed(2) + ' — the app can only send that amount. For a different amount, use Open on eBay.' });
      const money = (v) => ({ value: v.toFixed(2), currency: 'USD' });
      orderFinCache.clear();   // v370: so the page re-reads eBay's money records after the refund
      body = { refundDetail: { itemizedRefundDetail: est.lines.map(x => ({ refundAmount: money(x.amount), refundFeeType: x.type })), totalAmount: money(est.total) } };
    } else {
      if (!(amount > 0)) return res.status(400).json({ error: 'eBay didn\u2019t give a refund estimate for this return — use Open on eBay to refund it.' });
      const money = { value: amount.toFixed(2), currency: 'USD' };
      body = { refundDetail: { itemizedRefundDetail: [{ refundAmount: money, refundFeeType: 'PURCHASE_PRICE' }], totalAmount: money } };
    }
    if (comment) body.comments = { content: comment };
    const d = await poCall(req.user.id, 'POST', '/return/' + req.params.id + '/issue_refund', body);
    clearReturnCount(req.user.id);
    res.json({ ok: true, status: (d && d.refundStatus) || null });
  } catch (e) {
    console.error('[return refund]', e.message);
    res.status(502).json({ error: 'eBay didn\u2019t issue the refund: ' + e.message });
  }
});

// "Not received" claim: refund in full { comment? }
app.post('/api/returns/inquiry/:id/refund', requireUser, express.json(), async (req, res) => {
  const comment = String((req.body || {}).comment || '').trim().slice(0, 1000);
  if (!poId(req.params.id)) return res.status(400).json({ error: 'Bad claim number' });
  try {
    const d = await poCall(req.user.id, 'POST', '/inquiry/' + req.params.id + '/issue_refund', comment ? { comments: { content: comment } } : {});
    clearReturnCount(req.user.id);
    res.json({ ok: true, status: (d && d.refundResult && d.refundResult.refundStatus) || null });
  } catch (e) {
    console.error('[inquiry refund]', e.message);
    res.status(502).json({ error: 'eBay didn\u2019t issue the refund: ' + e.message });
  }
});

// "Not received" claim: add tracking { carrier, tracking, shipped (YYYY-MM-DD), comment? }
app.post('/api/returns/inquiry/:id/tracking', requireUser, express.json(), async (req, res) => {
  const b = req.body || {};
  const carrier = String(b.carrier || '').trim().slice(0, 40), tracking = String(b.tracking || '').replace(/\s+/g, '').slice(0, 60);
  const shipped = /^\d{4}-\d{2}-\d{2}$/.test(String(b.shipped || '')) ? String(b.shipped) : null;
  if (!poId(req.params.id) || !carrier || !tracking || !shipped) return res.status(400).json({ error: 'Enter the carrier, tracking number and ship date.' });
  try {
    const body = { shippingCarrierName: carrier, trackingNumber: tracking, shippingDate: { value: shipped + 'T12:00:00.000Z' }, shippedWithTracking: true };
    if (b.comment) body.sellerComments = { content: String(b.comment).trim().slice(0, 1000) };
    await poCall(req.user.id, 'POST', '/inquiry/' + req.params.id + '/provide_shipment_info', body);
    clearReturnCount(req.user.id);
    res.json({ ok: true });
  } catch (e) {
    console.error('[inquiry tracking]', e.message);
    res.status(502).json({ error: 'eBay didn\u2019t take the tracking: ' + e.message });
  }
});

// v373: cancellation request — approve (cancels the order; refund the buyer on eBay if it's not
// automatic) or decline (sends the ship date and tracking from the order when it has shipped)
app.post('/api/returns/cancel/:id/approve', requireUser, async (req, res) => {
  if (!poId(req.params.id)) return res.status(400).json({ error: 'Bad cancellation number' });
  try {
    await poCall(req.user.id, 'POST', '/cancellation/' + req.params.id + '/approve');
    clearReturnCount(req.user.id);
    res.json({ ok: true });
  } catch (e) {
    console.error('[cancel approve]', e.message);
    res.status(502).json({ error: 'eBay didn\u2019t approve the cancellation: ' + e.message });
  }
});
app.post('/api/returns/cancel/:id/decline', requireUser, express.json(), async (req, res) => {
  if (!poId(req.params.id)) return res.status(400).json({ error: 'Bad cancellation number' });
  const orderId = String((req.body || {}).orderId || '');
  try {
    const body = {};
    if (/^[0-9A-Za-z-]{5,40}$/.test(orderId)) {
      try {
        const sh = await shipmentFacts(req.user.id, orderId);
        if (sh && sh.shippedTime) {
          body.shipmentDate = { value: new Date(sh.shippedTime).toISOString() };
          if (sh.tracks && sh.tracks[0]) body.trackingNumber = sh.tracks[0].number;
        }
      } catch (e) { /* decline without ship info */ }
    }
    await poCall(req.user.id, 'POST', '/cancellation/' + req.params.id + '/reject', body);
    clearReturnCount(req.user.id);
    res.json({ ok: true, sentShipInfo: !!body.shipmentDate });
  } catch (e) {
    console.error('[cancel decline]', e.message);
    res.status(502).json({ error: 'eBay didn\u2019t decline the cancellation: ' + e.message });
  }
});

// ─── v327: DIAGNOSTICS (admin) ───────────────────────────────────────────────
// One place to see what's working, what isn't, and what to do about it.
const PAGE_FILES = ['home.html', 'dashboard.html', 'orders.html', 'messages.html', 'messages-classic.html', 'returns.html', 'active.html', 'index.html', 'diagnostics.html'];
const PAGE_NAMES = { 'home.html': 'Home', 'dashboard.html': 'Sales', 'orders.html': 'Orders', 'messages.html': 'Messages', 'messages-classic.html': 'Messages (classic)',
  'returns.html': 'Returns', 'active.html': 'Active', 'index.html': 'Listing Tool', 'diagnostics.html': 'Diagnostics' };
function fileVersion(file) {
  try {
    const head = fs.readFileSync(path.join(__dirname, file), 'utf8').slice(0, 3000);
    const m = /<title>[^<]*?v(\d+)[^<]*<\/title>/i.exec(head) || /PartsLister Pro server — v(\d+)/.exec(head);
    return m ? 'v' + m[1] : '?';
  } catch (e) { return null; }   // file missing
}
// Turn an error into what it means and what to do
function explain(msg) {
  const m = String(msg || '');
  // v328: the Listing Tool's own token (Auth'n'Auth) — reconnecting eBay doesn't fix this one
  if (/Listing Tool\u2019s User Token|hard expired|regenerate a new token/i.test(m)) return 'The Listing Tool\u2019s eBay User Token was cancelled or ran out. Fix: developer.ebay.com → User Tokens → Auth\u2019n\u2019Auth → Sign in to Production → copy the token → ⚙ Settings → Account → paste → Save keys → reload the Listing Tool.';
  if (/invalid_grant|refresh token|not connected/i.test(m)) return 'eBay sign-in has expired or was removed. Fix: ⚙ Settings → Admin → Reconnect eBay.';
  if (/missing.*(client id|client secret)|Client ID \/ Client Secret/i.test(m)) return 'Your eBay Client ID / Secret are missing. Fix: ⚙ Settings → Account, add them, Save keys.';
  if (/\b401\b|unauthori[sz]ed|invalid.*token|IAF/i.test(m)) return 'The service didn\u2019t accept the sign-in. Fix: Reconnect eBay (or check the key in ⚙ Settings → Account).';
  if (/\b403\b|scope|access denied|insufficient permission/i.test(m)) return 'eBay says the app doesn\u2019t have permission for this. Fix: Reconnect eBay and approve everything on eBay\u2019s screen.';
  if (/\b429\b|rate limit|too many|call limit|exceeded/i.test(m)) return 'A daily call limit was hit. It resets on its own — try again in a few hours.';
  if (/timeout|timed out|aborted|ETIMEDOUT|ECONNRESET|ENOTFOUND|fetch failed|socket/i.test(m)) return 'Couldn\u2019t reach the service — it may be down for a bit. Try again in a few minutes.';
  if (/\b5\d\d\b|internal server error|service unavailable/i.test(m)) return 'The other service had a problem on its end. Usually temporary — try again later.';
  if (/credit balance|billing|insufficient.*credit/i.test(m)) return 'Your Anthropic account is out of credit. Fix: add credit at console.anthropic.com.';
  return null;
}
const daysUntil = (d) => (d ? Math.round((new Date(d).getTime() - Date.now()) / 86400000) : null);

app.get('/api/diag', requireUser, requireAdmin, async (req, res) => {
  try {
    const conn = await getConnection(req.user.id);
    const settings = await getUserSettings(req.user.id);
    let db = { ok: true };
    const t0 = Date.now();
    try { await pool.query('SELECT 1'); db.ms = Date.now() - t0; } catch (e) { db = { ok: false, error: e.message }; }
    const counts = await pool.query(
      `SELECT (SELECT COUNT(*) FROM ebay_orders WHERE user_id = $1)::int AS orders,
              (SELECT MAX(created_at) FROM ebay_orders WHERE user_id = $1) AS newest,
              (SELECT COUNT(*) FROM ebay_fee_lines WHERE user_id = $1)::int AS fee_lines,
              (SELECT COUNT(*) FROM ebay_items WHERE user_id = $1)::int AS items_saved`, [req.user.id]).catch(() => ({ rows: [{}] }));
    const c = counts.rows[0] || {};
    let serverVersion = '?';
    try { serverVersion = 'v' + (/v(\d+)/.exec(fs.readFileSync(__filename, 'utf8').slice(0, 200)) || [])[1]; } catch (e) { /* ? */ }
    let pkgVersion = '?';
    try { pkgVersion = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8')).version; } catch (e) { /* ? */ }
    res.json({
      server: { version: serverVersion, packageVersion: pkgVersion, started: SERVER_STARTED, node: process.version, db },
      pages: PAGE_FILES.map(f => ({ file: f, name: PAGE_NAMES[f], version: fileVersion(f) })),
      ebay: conn && conn.refresh_enc ? {
        connected: true, connectedAt: conn.connected_at, signInDaysLeft: daysUntil(conn.refresh_expires),
        permissions: EBAY_SCOPES.map(x => ({ label: x.label, granted: grantedScopes(conn).split(' ').includes(x.scope) })),
        lastSync: conn.last_sync, syncError: conn.last_error || null, syncErrorHelp: explain(conn.last_error),
        feesSync: conn.fees_sync, feesError: conn.fees_error || null, feesErrorHelp: explain(conn.fees_error),
        activeCheck: conn.active_sync, activeError: conn.active_error || null, activeErrorHelp: explain(conn.active_error),
        orders: c.orders || 0, newestOrder: c.newest || null, feeLines: c.fee_lines || 0, itemsSaved: c.items_saved || 0
      } : { connected: false },
      keys: {
        anthropic: !!String(settings.apiKey || '').trim(), model: settings.claudeModel || 'claude-sonnet-4-5',
        ebayApp: !!(String(settings.ebayClientId || '').trim() && String(settings.ebayClientSecret || '').trim()),
        listingToken: !!String(settings.ebayUserToken || '').trim(), listingTokenDaysLeft: daysUntil(settings.ebayTokenExpiry),
        cloudinary: !!(settings.cloudinaryCloudName && settings.cloudinaryApiKey && settings.cloudinaryApiSecret),
        serpapi: !!String(settings.serpApiKey || '').trim()
      },
      errors: recentErrors.slice(0, 50).map(e => ({ at: e.at, text: e.text, help: explain(e.text) }))
    });
  } catch (e) {
    console.error('[diag]', e);
    res.status(500).json({ error: 'Could not load diagnostics: ' + e.message });
  }
});

// Live checks — each one makes one small, free request to the service
app.post('/api/diag/run', requireUser, requireAdmin, async (req, res) => {
  const uid = req.user.id;
  const conn = await getConnection(uid).catch(() => null);
  const settings = await getUserSettings(uid).catch(() => ({}));
  const results = [];
  async function check(name, what, fn) {
    const t0 = Date.now();
    try {
      const r = await fn();
      if (r && r.skip) results.push({ name, what, status: 'skip', detail: r.skip, ms: 0 });
      else results.push({ name, what, status: (r && r.warn) ? 'warn' : 'ok', detail: (r && (r.warn || r.detail)) || 'Working', ms: Date.now() - t0 });
    } catch (e) {
      results.push({ name, what, status: 'bad', detail: String(e.message || e).slice(0, 300), help: explain(e.message), ms: Date.now() - t0 });
    }
  }
  const ebayOn = !!(conn && conn.refresh_enc);
  const need = (scope) => (!ebayOn ? { skip: 'eBay isn\u2019t connected' } : !hasScope(conn, scope) ? { skip: 'Permission not approved yet — Reconnect eBay' } : null);
  const get = async (url, headers) => {
    const r = await fetch(url, { headers, signal: AbortSignal.timeout(20000) });
    if (!r.ok && r.status !== 204) { const t = await r.text().catch(() => ''); throw new Error('HTTP ' + r.status + ' ' + t.slice(0, 200)); }
    return r.status === 204 ? null : r.json().catch(() => null);
  };

  await check('Database', 'Your saved settings, orders and fees', async () => { await pool.query('SELECT 1'); });
  await check('eBay sign-in', 'Everything eBay', async () => {
    if (!ebayOn) return { skip: 'eBay isn\u2019t connected — ⚙ Settings → Admin' };
    // await getAccessToken(uid);
    accessTokens.delete(uid);   // v328: don't trust the saved copy — ask eBay for a fresh one
    await getAccessToken(uid);
    const d = daysUntil(conn.refresh_expires);
    if (d !== null && d < 30) return { warn: 'Works, but the eBay sign-in runs out in ' + d + ' days — Reconnect eBay soon' };
    return { detail: 'Working' + (d !== null ? ' · good for about ' + d + ' more days' : '') };
  });
  await check('eBay orders', 'Sales, Orders, Home', async () => {
    const s = need('https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly'); if (s) return s;
    const tok = await getAccessToken(uid);
    await get(EBAY_API_HOST + '/sell/fulfillment/v1/order?limit=1', { Authorization: 'Bearer ' + tok });
  });
  await check('eBay fees', 'Fees and penalty tiles', async () => {
    const s = need(FIN_SCOPE); if (s) return s;
    const tok = await getAccessToken(uid);
    await get(EBAY_FIN_HOST + '/sell/finances/v1/transaction?limit=1', { Authorization: 'Bearer ' + tok });
  });
  await check('eBay listings', 'Active page, photos, classic messages, offers', async () => {
    if (!ebayOn) return { skip: 'eBay isn\u2019t connected' };
    // const id = await myEbayUser(uid);
    // v328: ask eBay every time (myEbayUser remembers the answer, so it couldn't catch a new problem)
    const xml = await tradingCall(uid, 'GetUser', '<DetailLevel>ReturnSummary</DetailLevel>');
    const id = xmlDecode(xmlTag(xmlTag(xml, 'User') || '', 'UserID')) || null;
    if (!id) throw new Error('eBay didn\u2019t say who you are (GetUser failed)');
    return { detail: 'Working · signed in as ' + id };
  });
  await check('eBay message threads', 'Messages page', async () => {
    const s = need(MSG_SCOPE); if (s) return s;
    await restCall(uid, 'GET', '/commerce/message/v1/conversation?conversation_type=FROM_MEMBERS&limit=1');
  });
  await check('eBay returns', 'Returns page', async () => {
    if (!ebayOn) return { skip: 'eBay isn\u2019t connected' };
    await poCall(uid, 'GET', '/return/search?role=SELLER&limit=1');
    // v328: also the "not received" claims and cases lists the Returns page shows
    await poCall(uid, 'GET', '/inquiry/search?limit=1');
    await poCall(uid, 'GET', '/casemanagement/search?limit=1');
    return { detail: 'Working · returns, not-received claims and cases all answered' };
  });
  // v328: offers (Messages → Offers) — Best Offers use the eBay listings check above; this is "send an offer"
  await check('eBay offers', 'Send an offer (Messages → Offers)', async () => {
    const s = need(INV_SCOPE); if (s) return s;
    await restCall(uid, 'GET', '/sell/negotiation/v1/find_eligible_items?limit=1', null, { 'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US' });
  });
  await check('Anthropic (AI)', 'Photo scans, titles, Identify Part, AI drafts', async () => {
    const key = String(settings.apiKey || '').trim();
    if (!key) return { skip: 'No key saved — ⚙ Settings → Account' };
    // await get('https://api.anthropic.com/v1/models?limit=1', { 'x-api-key': key, 'anthropic-version': '2023-06-01' });
    // v328: listing the models only proved the key exists. Send a 1-word test with your model instead —
    // that also catches "credit balance too low" and a retired model name. Costs a tiny fraction of a cent.
    const model = String(settings.claudeModel || '').trim() || 'claude-sonnet-4-5';
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model, max_tokens: 1, messages: [{ role: 'user', content: 'Hi' }] }),
      signal: AbortSignal.timeout(30000)
    });
    if (!r.ok) {
      const d = await r.json().catch(() => ({}));
      const msg = (d.error && d.error.message) || ('HTTP ' + r.status);
      if (/model/i.test(msg) && r.status === 404) throw new Error('The model name "' + model + '" isn\u2019t available — change it in ⚙ Settings → Account (' + msg + ')');
      throw new Error('HTTP ' + r.status + ' ' + msg);
    }
    return { detail: 'Working · test message answered by ' + model };
  });
  await check('Listing Tool eBay token', 'Launch and Save Draft in the Listing Tool', async () => {
    const token = String(settings.ebayUserToken || '').trim();
    if (!token) return { warn: 'No User Token saved — the Listing Tool can\u2019t launch. Add it in ⚙ Settings → Account' };
    // v328: the old check only looked at the saved date — it said OK even after eBay cancelled the
    // token. Now it asks eBay with the token, the same way Launch does (same headers, eBay Motors site).
    const body = '<?xml version="1.0" encoding="utf-8"?><GetUserRequest xmlns="urn:ebay:apis:eBLBaseComponents">'
      + '<RequesterCredentials><eBayAuthToken>' + xmlEsc(token) + '</eBayAuthToken></RequesterCredentials></GetUserRequest>';
    const r = await fetch('https://api.ebay.com/ws/api.dll', {
      method: 'POST',
      headers: {
        'X-EBAY-API-CALL-NAME': 'GetUser', 'X-EBAY-API-APP-NAME': settings.ebayClientId || '', 'X-EBAY-API-DEV-NAME': '',
        'X-EBAY-API-CERT-NAME': settings.ebayClientSecret || '', 'X-EBAY-API-SITEID': '100', 'X-EBAY-API-COMPATIBILITY-LEVEL': '967', 'Content-Type': 'text/xml'
      },
      body, signal: AbortSignal.timeout(20000)
    });
    const xml = await r.text();
    if (xmlTag(xml, 'Ack') === 'Failure' || !r.ok) {
      const code = xmlTag(xml, 'ErrorCode') || '';
      const msg = xmlDecode(xmlTag(xml, 'LongMessage') || xmlTag(xml, 'ShortMessage') || ('HTTP ' + r.status));
      if (/^(931|932|16110|17470|21916984)$/.test(code) || /token/i.test(msg)) {
        throw new Error('eBay rejected the Listing Tool\u2019s User Token: ' + msg);   // the fix is added by explain()
      }
      throw new Error(msg);
    }
    const who = xmlDecode(xmlTag(xmlTag(xml, 'User') || '', 'UserID')) || '';
    const oauthUser = ebayOn ? await myEbayUser(uid).catch(() => null) : null;
    if (who && oauthUser && who.toLowerCase() !== oauthUser.toLowerCase()) {
      return { warn: 'Token works, but it\u2019s for eBay account "' + who + '" while your sales connection is "' + oauthUser + '" — listings would go to ' + who };
    }
    const d = daysUntil(settings.ebayTokenExpiry);
    if (d !== null && d < 30) return { warn: 'Works (account ' + who + '), but runs out in about ' + d + ' days — get a new one soon' };
    return { detail: 'Working · eBay accepted it' + (who ? ' (account ' + who + ')' : '') + (d !== null ? ' · good for about ' + d + ' more days' : '') };
  });
  await check('Cloudinary (photos)', 'Uploading listing photos', async () => {
    const { cloudinaryCloudName: cn, cloudinaryApiKey: k, cloudinaryApiSecret: sec } = settings;
    if (!(cn && k && sec)) return { skip: 'Not set up — ⚙ Settings → Account' };
    const d = await get('https://api.cloudinary.com/v1_1/' + encodeURIComponent(cn) + '/usage', { Authorization: 'Basic ' + Buffer.from(k + ':' + sec).toString('base64') });
    const st = d && d.storage, cr = d && d.credits;
    const pct = cr && typeof cr.used_percent === 'number' ? cr.used_percent : (st && typeof st.used_percent === 'number' ? st.used_percent : null);
    if (pct !== null && pct >= 90) return { warn: 'Works, but ' + pct.toFixed(0) + '% of your Cloudinary allowance is used — uploads will stop when it\u2019s full' };
    return { detail: 'Working' + (pct !== null ? ' · ' + pct.toFixed(0) + '% of allowance used' : '') };
  });
  await check('SerpApi', 'Identify Part (Google Lens)', async () => {
    const key = String(settings.serpApiKey || '').trim();
    if (!key) return { skip: 'Not set up (optional)' };
    const d = await get('https://serpapi.com/account?api_key=' + encodeURIComponent(key));
    const left = d && (d.total_searches_left ?? d.plan_searches_left);
    if (typeof left === 'number' && left <= 10) return { warn: 'Works, but only ' + left + ' searches left this month' };
    return { detail: 'Working' + (typeof left === 'number' ? ' · ' + left + ' searches left this month' : '') };
  });
  res.json({ ran: new Date().toISOString(), results });
});

// ─── v316: ACTIVE LISTINGS ───────────────────────────────────────────────────
// How many listings are live on eBay and what their asking prices add up to.
// Uses the Trading API's GetMyeBaySelling (ActiveList), 200 listings per call.
// Checked at most once an hour unless you press Refresh.
const ACTIVE_MAX_AGE_MIN = 60;
const activeChecking = new Set();
// const xmlTag = (xml, tag) => { const m = new RegExp('<' + tag + '[^>]*>([\\s\\S]*?)</' + tag + '>').exec(xml); return m ? m[1] : null; };
// v320: the tag name must end there, so <Item> doesn't also match <ItemID>
const xmlTag = (xml, tag) => { const m = new RegExp('<' + tag + '(?:\\s[^>]*)?>([\\s\\S]*?)</' + tag + '>').exec(xml); return m ? m[1] : null; };

async function checkActiveListings(userId) {
  if (activeChecking.has(userId)) return;
  activeChecking.add(userId);
  try {
    const token = await getAccessToken(userId);
    let page = 1, pages = 1, count = 0, value = 0;
    while (page <= pages && page <= 150) {
      const body = `<?xml version="1.0" encoding="utf-8"?>
<GetMyeBaySellingRequest xmlns="urn:ebay:apis:eBLBaseComponents">
  <ActiveList><Include>true</Include><Pagination><EntriesPerPage>200</EntriesPerPage><PageNumber>${page}</PageNumber></Pagination></ActiveList>
  <ScheduledList><Include>false</Include></ScheduledList>
  <SoldList><Include>false</Include></SoldList>
  <UnsoldList><Include>false</Include></UnsoldList>
  <BidList><Include>false</Include></BidList>
  <DeletedFromSoldList><Include>false</Include></DeletedFromSoldList>
  <DeletedFromUnsoldList><Include>false</Include></DeletedFromUnsoldList>
</GetMyeBaySellingRequest>`;
      const r = await fetch('https://api.ebay.com/ws/api.dll', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml',
          'X-EBAY-API-CALL-NAME': 'GetMyeBaySelling',
          'X-EBAY-API-SITEID': '0',
          'X-EBAY-API-COMPATIBILITY-LEVEL': '1193',
          'X-EBAY-API-IAF-TOKEN': token
        },
        body,
        signal: AbortSignal.timeout(45000)
      });
      const xml = await r.text();
      const ack = xmlTag(xml, 'Ack');
      if (!r.ok || ack === 'Failure') {
        const msg = xmlTag(xml, 'LongMessage') || xmlTag(xml, 'ShortMessage') || ('HTTP ' + r.status);
        throw new Error('eBay listings request failed: ' + msg.replace(/<[^>]+>/g, '').slice(0, 300));
      }
      const active = xmlTag(xml, 'ActiveList') || '';
      if (page === 1) {
        const pr = xmlTag(active, 'PaginationResult') || '';
        count = parseInt(xmlTag(pr, 'TotalNumberOfEntries') || '0', 10) || 0;
        pages = parseInt(xmlTag(pr, 'TotalNumberOfPages') || '1', 10) || 1;
      }
      const items = active.match(/<Item>[\s\S]*?<\/Item>/g) || [];
      for (const it of items) {
        const price = parseFloat(xmlTag(xmlTag(it, 'SellingStatus') || '', 'CurrentPrice') || xmlTag(it, 'BuyItNowPrice') || '0') || 0;
        const qtyAvail = parseInt(xmlTag(it, 'QuantityAvailable') || '1', 10);
        value += price * (Number.isFinite(qtyAvail) && qtyAvail > 0 ? qtyAvail : 1);
      }
      if (!items.length) break;
      page++;
    }
    await pool.query(
      'UPDATE ebay_connections SET active_count = $2, active_value = $3, active_sync = now(), active_error = NULL WHERE user_id = $1',
      [userId, count, Math.round(value * 100) / 100]
    );
  } catch (e) {
    console.error('[active listings]', e.message);
    await pool.query('UPDATE ebay_connections SET active_error = $2, active_sync = now() WHERE user_id = $1', [userId, String(e.message).slice(0, 500)]).catch(() => {});
  } finally {
    activeChecking.delete(userId);
  }
}

// v374: LISTINGS PER DAY — start times of every listing started in the last 91 days
const listedCache = new Map();   // userId → { at, data } or { at, promise }
async function listingStarts(userId) {
  const to = new Date(), from = new Date(to.getTime() - 91 * 86400000);   // under eBay's 120-day limit
  const starts = [];
  for (let page = 1; page <= 60; page++) {
    const xml = await tradingCall(userId, 'GetSellerList',
      `<StartTimeFrom>${from.toISOString()}</StartTimeFrom><StartTimeTo>${to.toISOString()}</StartTimeTo>`
      + `<DetailLevel>ReturnAll</DetailLevel><Pagination><EntriesPerPage>200</EntriesPerPage><PageNumber>${page}</PageNumber></Pagination>`
      + `<OutputSelector>ItemArray.Item.ItemID</OutputSelector><OutputSelector>ItemArray.Item.ListingDetails.StartTime</OutputSelector>`
      + `<OutputSelector>PaginationResult</OutputSelector><OutputSelector>HasMoreItems</OutputSelector>`);
    const items = xmlAll(xmlTag(xml, 'ItemArray') || '', 'Item');
    items.forEach(it => { const st = xmlTag(xmlTag(it, 'ListingDetails') || '', 'StartTime'); if (st) starts.push(st); });
    const pages = parseInt(xmlTag(xmlTag(xml, 'PaginationResult') || '', 'TotalNumberOfPages') || '1', 10) || 1;
    if (!items.length || page >= pages) break;
  }
  return starts;
}
app.get('/api/listings/daily', requireUser, async (req, res) => {
  try {
    const conn = await getConnection(req.user.id);
    if (!conn || !conn.refresh_enc) return res.json({ connected: false });
    const tz = msgSettingsOf(await getUserSettings(req.user.id)).timezone || 'America/Chicago';
    let c = listedCache.get(req.user.id);
    if (!c || req.query.refresh === '1' && !c.promise || (c.data && Date.now() - c.at > 30 * 60000)) {
      const promise = listingStarts(req.user.id);
      c = { at: Date.now(), promise };
      listedCache.set(req.user.id, c);
      promise.then(starts => listedCache.set(req.user.id, { at: Date.now(), data: starts }),
                   e => listedCache.set(req.user.id, { at: Date.now(), error: e.message }));
    }
    let starts;
    // if (c.promise) starts = await c.promise.catch(e => { throw e; });
    if (c.promise) return res.json({ connected: true, loading: true });   // v375: still asking eBay — the page checks back
    else if (c.error) { listedCache.delete(req.user.id); throw new Error(c.error); }
    else starts = c.data;
    // count per day / per hour in your time zone
    const dayKey = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' });
    const hourOf = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', hourCycle: 'h23' });
    const today = dayKey.format(new Date());
    const byDay = {}, hours = new Array(24).fill(0);
    starts.forEach(s => {
      const d = new Date(s); if (isNaN(d)) return;
      const k = dayKey.format(d); byDay[k] = (byDay[k] || 0) + 1;
      if (k === today) hours[parseInt(hourOf.format(d), 10) % 24]++;
    });
    const days = [];
    const [y, m, dd] = today.split('-').map(Number);
    for (let i = 89; i >= 0; i--) {
      const t = new Date(Date.UTC(y, m - 1, dd - i));
      const k = t.toISOString().slice(0, 10);
      days.push({ date: k, n: byDay[k] || 0 });
    }
    res.json({ connected: true, tz, today, days, hours, checkedAt: new Date(listedCache.get(req.user.id).at || Date.now()).toISOString() });
  } catch (e) {
    console.error('[listings daily]', e.message);
    res.json({ connected: true, error: 'eBay didn\u2019t give us your listing dates: ' + e.message });
  }
});

app.get('/api/listings/summary', requireUser, async (req, res) => {
  try {
    const conn = await getConnection(req.user.id);
    const base = { listedLifetime: req.user.listing_count || 0 };
    if (!conn || !conn.refresh_enc) return res.json({ ...base, connected: false });
    const age = conn.active_sync ? (Date.now() - new Date(conn.active_sync).getTime()) / 60000 : Infinity;
    if ((req.query.refresh === '1' || age > ACTIVE_MAX_AGE_MIN) && !activeChecking.has(req.user.id)) checkActiveListings(req.user.id);
    res.json({
      ...base,
      connected: true,
      checking: activeChecking.has(req.user.id),
      activeCount: conn.active_count === null || conn.active_count === undefined ? null : conn.active_count,
      activeValue: conn.active_value === null || conn.active_value === undefined ? null : parseFloat(conn.active_value),
      lastCheck: conn.active_sync || null,
      error: conn.active_error || null
    });
  } catch (e) {
    console.error('[listings summary]', e);
    res.status(500).json({ error: 'Could not load listings' });
  }
});

// ─── THE PAGES ───────────────────────────────────────────────────────────────
// v302: two pages. Only these two files are ever served — server.js and
// package.json stay private.
//   /      → dashboard.html (homepage, where you land after signing in)
//   /list  → index.html     (the listing tool)
// Each page shows its own sign-in screen when you're signed out.
const DASHBOARD = path.join(__dirname, 'dashboard.html');
const LISTING = path.join(__dirname, 'index.html');
const HOME = path.join(__dirname, 'home.html');            // v316
// const LISTINGS = path.join(__dirname, 'listings.html');    // v316
const ACTIVE = path.join(__dirname, 'active.html');        // v318: was listings.html
const ORDERS = path.join(__dirname, 'orders.html');        // v319
const MESSAGES = path.join(__dirname, 'messages.html');    // v321
const MESSAGES_CLASSIC = path.join(__dirname, 'messages-classic.html');   // v322: the v321 email-style view
const RETURNS = path.join(__dirname, 'returns.html');      // v324
const DIAGNOSTICS = path.join(__dirname, 'diagnostics.html');   // v327

// app.get('/', (req, res) => res.sendFile(DASHBOARD));
// v316: Home is the landing page; the sales dashboard is /sales
app.get('/', (req, res) => res.sendFile(HOME));
app.get(['/sales', '/sales/'], (req, res) => res.sendFile(DASHBOARD));
// app.get(['/listings', '/listings/'], (req, res) => res.sendFile(LISTINGS));
app.get(['/active', '/active/'], (req, res) => res.sendFile(ACTIVE));                     // v318
app.get(['/orders', '/orders/'], (req, res) => res.sendFile(ORDERS));                     // v319
app.get(['/messages', '/messages/'], (req, res) => res.sendFile(MESSAGES));               // v321
app.get(['/messages/classic'], (req, res) => res.sendFile(MESSAGES_CLASSIC));             // v322
app.get(['/returns', '/returns/'], (req, res) => res.sendFile(RETURNS));                  // v324
app.get(['/returns.html'], (req, res) => res.redirect(301, '/returns'));                  // v324
app.get(['/diagnostics', '/diagnostics/'], (req, res) => res.sendFile(DIAGNOSTICS));      // v327 (the page itself checks you're the admin)
app.get(['/diagnostics.html'], (req, res) => res.redirect(301, '/diagnostics'));          // v327
app.get(['/listings', '/listings/'], (req, res) => res.redirect(301, '/active'));         // v318: old address
app.get(['/list', '/list/'], (req, res) => res.sendFile(LISTING));
// Old links and bookmarks to the file names still work
app.get(['/index.html'], (req, res) => res.redirect(301, '/list'));
// app.get(['/dashboard', '/dashboard.html'], (req, res) => res.redirect(301, '/'));
app.get(['/dashboard', '/dashboard.html'], (req, res) => res.redirect(301, '/sales'));   // v316
app.get(['/home.html'], (req, res) => res.redirect(301, '/'));                           // v316
// app.get(['/listings.html'], (req, res) => res.redirect(301, '/listings'));               // v316
app.get(['/listings.html', '/active.html'], (req, res) => res.redirect(301, '/active'));  // v318
app.get(['/orders.html'], (req, res) => res.redirect(301, '/orders'));                    // v319
app.get(['/messages.html'], (req, res) => res.redirect(301, '/messages'));                // v321

// v301 sent every unknown address to the listing tool:
// const INDEX = path.join(__dirname, 'index.html');
// app.get('*', (req, res) => {
//   if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found' });
//   res.sendFile(INDEX);
// });
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found' });
  res.redirect('/');   // anything else goes to the dashboard
});

setupDatabase()
  .then(() => app.listen(PORT, () => console.log('PartsLister Pro v389 listening on ' + PORT)))
  .catch((e) => { console.error('Database setup failed:', e); process.exit(1); });
