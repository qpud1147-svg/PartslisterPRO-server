// PartsLister Pro server — v300 (Phase 1)
// Serves index.html and holds every secret. Replaces the three Netlify
// functions (ebay.js, ebaybrowse.js, serplens.js) plus the direct
// browser→Anthropic and browser-side Cloudinary signing.
//
// Required environment variables (set in Railway → service → Variables):
//   APP_PASSWORD          password to open the app (username can be anything)
//   ANTHROPIC_API_KEY
//   EBAY_CLIENT_ID        App ID
//   EBAY_CLIENT_SECRET    Cert ID
//   EBAY_DEV_ID           Dev ID
//   EBAY_USER_TOKEN       your Auth'n'Auth user token (same one v299 uses)
//   CLOUDINARY_CLOUD_NAME
//   CLOUDINARY_API_KEY
//   CLOUDINARY_API_SECRET
//   SERPAPI_KEY

const express = require('express');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const env = (k) => (process.env[k] || '').trim();

// ─── PASSWORD GATE ───────────────────────────────────────────────────────────
// The server now holds your keys, so it must not be open to the public.
// Uses the browser's built-in login prompt; it remembers you after the first time.
function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}

app.use((req, res, next) => {
  if (req.path === '/health') return next();
  const pass = env('APP_PASSWORD');
  if (!pass) return res.status(500).send('APP_PASSWORD is not set on the server.');
  const header = req.headers.authorization || '';
  if (header.startsWith('Basic ')) {
    const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
    const given = decoded.slice(decoded.indexOf(':') + 1);
    if (safeEqual(given, pass)) return next();
  }
  res.set('WWW-Authenticate', 'Basic realm="PartsLister Pro"');
  res.status(401).send('Login required');
});

app.get('/health', (req, res) => res.send('ok'));

// ─── CONFIG (non-secret values the page needs) ──────────────────────────────
app.get('/api/config', (req, res) => {
  res.json({
    cloudinaryCloudName: env('CLOUDINARY_CLOUD_NAME'),
    cloudinaryApiKey: env('CLOUDINARY_API_KEY')
  });
});

// ─── ANTHROPIC PROXY ─────────────────────────────────────────────────────────
// Photo scans send many base64 images, so allow large bodies.
app.post('/api/claude', express.json({ limit: '40mb' }), async (req, res) => {
  const key = env('ANTHROPIC_API_KEY');
  if (!key) return res.status(500).json({ error: { message: 'ANTHROPIC_API_KEY not set on server' } });
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    });
    const text = await r.text();
    res.status(r.status).type('application/json').send(text);
  } catch (e) {
    res.status(502).json({ error: { message: 'Claude request failed: ' + e.message } });
  }
});

// ─── CLOUDINARY SIGNING ──────────────────────────────────────────────────────
// Browser still uploads straight to Cloudinary; the server only signs.
app.post('/api/cloudinary-sign', express.json(), (req, res) => {
  const secret = env('CLOUDINARY_API_SECRET');
  if (!secret) return res.status(500).json({ error: 'CLOUDINARY_API_SECRET not set on server' });
  const folder = String((req.body && req.body.folder) || '');
  const timestamp = parseInt(req.body && req.body.timestamp, 10);
  if (folder !== 'partslister') return res.status(400).json({ error: 'Bad folder' });
  if (!timestamp || Math.abs(Date.now() / 1000 - timestamp) > 600) {
    return res.status(400).json({ error: 'Bad timestamp' });
  }
  const signature = crypto.createHash('sha1')
    .update(`folder=${folder}&timestamp=${timestamp}${secret}`)
    .digest('hex');
  res.json({ signature });
});

// ─── EBAY BROWSE (was netlify/functions/ebaybrowse.js) ──────────────────────
// Application token is cached so every search doesn't request a new one.
let _appToken = null;
let _appTokenExpires = 0;

async function getAppToken() {
  if (_appToken && Date.now() < _appTokenExpires) return _appToken;
  const id = env('EBAY_CLIENT_ID');
  const secret = env('EBAY_CLIENT_SECRET');
  if (!id || !secret) throw new Error('EBAY_CLIENT_ID / EBAY_CLIENT_SECRET not set on server');
  const r = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(id + ':' + secret).toString('base64')
    },
    body: 'grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope',
    signal: AbortSignal.timeout(8000)
  });
  const d = await r.json();
  if (!d.access_token) throw new Error('Failed to get eBay token: ' + (d.error_description || JSON.stringify(d)));
  _appToken = d.access_token;
  // Refresh 5 minutes before eBay says it expires
  _appTokenExpires = Date.now() + Math.max(60, (d.expires_in || 7200) - 300) * 1000;
  return _appToken;
}

app.post('/api/ebaybrowse', express.json(), async (req, res) => {
  const b = req.body || {};
  const keywords = String(b.keywords || '');
  const limit = Math.min(parseInt(b.limit) || 10, 50);
  const offset = parseInt(b.offset) || 0;
  const fullData = !!b.fullData;
  const zipCode = String(b.zipCode || '').trim();
  const seller = String(b.seller || '').trim();
  const categoryId = String(b.categoryId || '').trim();

  if (!keywords) return res.status(400).json({ error: 'Missing keywords' });

  try {
    const token = await getAppToken();

    const q = encodeURIComponent(keywords);
    const sortParam = zipCode ? '&sort=distance' : '';
    const postalParam = zipCode ? `&buyerPostalCode=${encodeURIComponent(zipCode)}` : '';
    // eBay Browse API seller filter — literal braces, seller username only (not store name)
    const sellerFilter = seller ? `&filter=sellers%3A%7B${encodeURIComponent(seller)}%7D` : '&filter=conditions%3A%7BUSED%7D';
    const categoryParam = categoryId ? `&category_ids=${encodeURIComponent(categoryId)}` : '';
    const url = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${q}&limit=${limit}&offset=${offset}${sellerFilter}${sortParam}${postalParam}${categoryParam}`;

    const r = await fetch(url, {
      headers: { 'Authorization': 'Bearer ' + token, 'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US', 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(8000)
    });
    const browseData = await r.json();

    if (browseData.errors && browseData.errors.length) {
      // A rejected token clears the cache so the next call gets a fresh one
      if (r.status === 401) { _appToken = null; _appTokenExpires = 0; }
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
        // Primary LEAF category (listable) — see original ebaybrowse.js note
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
    } else {
      const titles = (browseData.itemSummaries || [])
        .map(item => item.title || '')
        .filter(t => t.length >= 10 && t.length <= 120);
      return res.json({ titles, total: browseData.total || 0 });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── EBAY TRADING API (was netlify/functions/ebay.js) ───────────────────────
// Only listing calls are allowed through. The old Finding API branch is gone —
// eBay shut that API down.
const ALLOWED_CALLS = ['AddItem', 'VerifyAddItem'];

app.post('/api/ebay', express.text({ type: '*/*', limit: '2mb' }), async (req, res) => {
  const callName = req.get('x-ebay-api-call-name') || '';
  if (!ALLOWED_CALLS.includes(callName)) {
    return res.status(400).type('text/xml').send(`<error>Call not allowed: ${callName}</error>`);
  }
  const userToken = env('EBAY_USER_TOKEN');
  if (!userToken) return res.status(500).type('text/xml').send('<error>EBAY_USER_TOKEN not set on server</error>');

  // The page sends a placeholder; the real token is filled in here
  const xml = String(req.body || '').replace('__EBAY_USER_TOKEN__', userToken);

  try {
    const r = await fetch('https://api.ebay.com/ws/api.dll', {
      method: 'POST',
      headers: {
        'X-EBAY-API-CALL-NAME': callName,
        'X-EBAY-API-APP-NAME': env('EBAY_CLIENT_ID'),
        'X-EBAY-API-DEV-NAME': env('EBAY_DEV_ID'),
        'X-EBAY-API-CERT-NAME': env('EBAY_CLIENT_SECRET'),
        'X-EBAY-API-SITEID': req.get('x-ebay-api-siteid') || '0',
        'X-EBAY-API-COMPATIBILITY-LEVEL': '967',
        'Content-Type': 'text/xml'
      },
      body: xml
    });
    const text = await r.text();
    res.status(200).type('text/xml').send(text);
  } catch (e) {
    res.status(500).type('text/xml').send(`<error>${e.message}</error>`);
  }
});

// ─── SERPAPI GOOGLE LENS (was netlify/functions/serplens.js) ────────────────
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

app.post('/api/serplens', express.json(), async (req, res) => {
  const imageUrl = String((req.body && req.body.imageUrl) || '').trim();
  if (!imageUrl) return res.status(400).json({ error: 'Missing imageUrl' });
  const apiKey = env('SERPAPI_KEY');
  if (!apiKey) return res.status(500).json({ error: 'SerpApi key not configured on server' });

  const getJson = async (url) => {
    const r = await fetch(url, { signal: AbortSignal.timeout(20000) });
    const t = await r.text();
    try { return JSON.parse(t); } catch (e) { const err = new Error('Bad response from SerpApi'); err.detail = t.slice(0, 300); throw err; }
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

// ─── THE PAGE ────────────────────────────────────────────────────────────────
// Only index.html is served — server.js and package.json are never exposed.
const INDEX = path.join(__dirname, 'index.html');
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found' });
  res.sendFile(INDEX);
});

app.listen(PORT, () => console.log('PartsLister Pro v300 listening on ' + PORT));
