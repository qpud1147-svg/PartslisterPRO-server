// PartsLister Pro server — v315
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
const { Pool } = require('pg');

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

// POST so the page can also save with sendBeacon when the tab closes
app.post('/api/data', requireUser, express.json({ limit: '10mb' }), async (req, res) => {
  try {
    const b = req.body || {};
    if (!b.settings || typeof b.settings !== 'object') return res.status(400).json({ error: 'Missing settings' });
    const history = (b.history && typeof b.history === 'object') ? b.history : { pigtail: [], otherside: [] };
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
  { scope: 'https://api.ebay.com/oauth/api_scope/sell.analytics.readonly',    label: 'Seller metrics & standing' }
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
  if (!keys.clientId || !keys.clientSecret) throw new Error('Your eBay Client ID / Client Secret are missing from Listing Tool settings');
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
    refundedTax: Math.round(refundedTax * 100) / 100   // v314
  };
}

async function saveOrders(userId, orders) {
  if (!orders.length) return;
  const values = [];
  const params = [];
  orders.forEach((o, i) => {
    const b = i * 12;   // v309: + tax, v312: + refunded, v314: + refunded_tax
    values.push(`($${b + 1},$${b + 2},$${b + 3},$${b + 4},$${b + 5},$${b + 6},$${b + 7},$${b + 8},$${b + 9},$${b + 10},$${b + 11},$${b + 12})`);
    params.push(userId, o.orderId, o.created, o.total, o.payout, o.fees, o.items, o.status, o.counted, o.tax, o.refunded, o.refundedTax);
  });
  await pool.query(
    `INSERT INTO ebay_orders (user_id, order_id, created_at, total, payout, fees, item_count, status, counted, tax, refunded, refunded_tax)
     VALUES ${values.join(',')}
     ON CONFLICT (user_id, order_id) DO UPDATE SET
       created_at = EXCLUDED.created_at, total = EXCLUDED.total, payout = EXCLUDED.payout,
       fees = EXCLUDED.fees, item_count = EXCLUDED.item_count, status = EXCLUDED.status, counted = EXCLUDED.counted,
       tax = EXCLUDED.tax, refunded = EXCLUDED.refunded, refunded_tax = EXCLUDED.refunded_tax`,
    params
  );
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
    if (!conn.last_sync || (conn.orders_v || 0) < 5) {   // v314: tax on refunds — re-import once
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
         history_from = COALESCE($3, history_from), orders_v = 5 WHERE user_id = $1`,   // v313: was 3, v314: was 4
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
    if (!conn || !conn.runame) return res.redirect('/?ebay=error&msg=' + encodeURIComponent('Save your RuName first'));
    if (!keys.clientId || !keys.clientSecret) {
      return res.redirect('/?ebay=error&msg=' + encodeURIComponent('Add your eBay Client ID and Client Secret in Listing Tool settings first'));
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
    res.redirect('/?ebay=error&msg=' + encodeURIComponent('Could not start the eBay connection'));
  }
});

// eBay sends you back here after you click "allow" (this is the
// "auth accepted URL" registered in your eBay developer account)
app.get(CALLBACK_PATH, async (req, res) => {
  const fail = (msg) => res.redirect('/?ebay=error&msg=' + encodeURIComponent(msg));
  const { code, state, error } = req.query;
  // if (error) return fail('eBay said: ' + String(error));
  if (error === 'invalid_scope') {   // v306
    return fail('eBay refused one of the permissions. Your app keyset may not have Fees or Seller Metrics enabled — check OAuth Scopes in your eBay developer account. Your existing connection still works.');
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
    res.redirect('/?ebay=connected');
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
    const taxNeeded = (conn.orders_v || 0) < 5;   // v314: re-import right away for tax on refunds
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

// ─── THE PAGES ───────────────────────────────────────────────────────────────
// v302: two pages. Only these two files are ever served — server.js and
// package.json stay private.
//   /      → dashboard.html (homepage, where you land after signing in)
//   /list  → index.html     (the listing tool)
// Each page shows its own sign-in screen when you're signed out.
const DASHBOARD = path.join(__dirname, 'dashboard.html');
const LISTING = path.join(__dirname, 'index.html');

app.get('/', (req, res) => res.sendFile(DASHBOARD));
app.get(['/list', '/list/'], (req, res) => res.sendFile(LISTING));
// Old links and bookmarks to the file names still work
app.get(['/index.html'], (req, res) => res.redirect(301, '/list'));
app.get(['/dashboard', '/dashboard.html'], (req, res) => res.redirect(301, '/'));

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
  .then(() => app.listen(PORT, () => console.log('PartsLister Pro v315 listening on ' + PORT)))
  .catch((e) => { console.error('Database setup failed:', e); process.exit(1); });
