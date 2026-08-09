const fs = require("fs");
const path = require("path");

const BASE_URL = "https://panafricanaisummit.com";
const SITEMAP_URL = `${BASE_URL}/sitemap.xml`;
const CACHE_PATH = path.join(__dirname, "../data/scraped_content.json");

// The site's sitemap is dominated by unused page-builder demo templates
// (shop, insurance, portfolio, etc). These patterns filter those out so we
// only scrape pages that actually carry PAAIS content.
const EXCLUDE_PATTERNS = [
  /^\/(shop|carts?|products?|services?|portfolio|case-study|galler(y|ies))(-|\/|$)/,
  /^\/(financial|insurance|accountant|business-analyst|digital-agency|construction|medical|ecommerce|digital-marketing|architect-consulting-firm|startup|product-landing|pricing-plan|teams|advisory)$/,
  /^\/home-old$/,
  /^\/home-[A-Za-z0-9]+$/,
  /^\/(vertical|interactive|parallax|horizontal)-(case-study|slider)$/,
  /^\/(terms-and-condition|privacy-policy)$/,
  /^\/blog\//, // individual blog posts - the /news-and-blog index is enough
];

const PRIORITY_PATHS = [
  "/home",
  "/about",
  "/faq",
  "/participate",
  "/speaker-registration",
  "/sponsor-registration",
  "/media-pass",
  "/exhibition",
];

function isExcluded(pathname) {
  return EXCLUDE_PATTERNS.some((re) => re.test(pathname));
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "PAAIS-Junior-Bot/1.0 (+https://panafricanaisummit.com)",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

async function getSitemapPaths() {
  const xml = await fetchText(SITEMAP_URL);
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const paths = urls
    .map((u) => new URL(u).pathname)
    .filter((p) => !isExcluded(p));
  return [...new Set(paths)];
}

function stripHtml(fragment) {
  return fragment
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, "\n")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#0?39;|&rsquo;|&lsquo;/g, "'")
    .replace(/&quot;|&rdquo;|&ldquo;/g, '"')
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .join("\n");
}

// The site is a Laravel + Inertia.js app: each page embeds its full CMS
// content as JSON in <div data-page="...">, so we read that instead of
// trying to parse rendered markup (most of the real text is client-rendered
// and never appears in the static HTML otherwise).
function extractPageText(html) {
  const match = html.match(/data-page="([^"]*)"/);
  if (!match) return null;

  const decoded = match[1]
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

  let data;
  try {
    data = JSON.parse(decoded);
  } catch {
    return null;
  }

  const props = data.props || {};
  const blocks = props.page_data?.en || [];
  const parts = [];

  if (props.meta_title) parts.push(props.meta_title);
  if (props.meta_description) parts.push(props.meta_description);

  for (const block of blocks) {
    const d = block.data || {};
    if (d.html_code) parts.push(stripHtml(d.html_code));
    if (d.title) parts.push(stripHtml(d.title));
  }

  const text = parts.filter(Boolean).join("\n").trim();
  return text || null;
}

async function scrapePath(pathname) {
  const html = await fetchText(`${BASE_URL}${pathname}`);
  const text = extractPageText(html);
  return text
    ? { path: pathname, text, scrapedAt: new Date().toISOString() }
    : null;
}

async function scrapeAll() {
  const paths = await getSitemapPaths();
  const ordered = [
    ...PRIORITY_PATHS.filter((p) => paths.includes(p)),
    ...paths.filter((p) => !PRIORITY_PATHS.includes(p)),
  ];

  const pages = [];
  for (const p of ordered) {
    try {
      const result = await scrapePath(p);
      if (result) pages.push(result);
    } catch (err) {
      console.warn(`[Scraper] Failed to scrape ${p}: ${err.message}`);
    }
    await new Promise((r) => setTimeout(r, 300)); // be polite to their server
  }

  const cache = { scrapedAt: new Date().toISOString(), pages };
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
  console.log(
    `[Scraper] Cached ${pages.length}/${ordered.length} pages from panafricanaisummit.com`,
  );
  return cache;
}

function loadCache() {
  try {
    return JSON.parse(fs.readFileSync(CACHE_PATH, "utf8"));
  } catch {
    return null;
  }
}

// Returns a text blob of the freshest site content, capped at maxChars so it
// stays cheap to include in the Gemini prompt. /home, /about, /faq and
// /participate are scraped first so they survive the cap.
function getScrapedContext(maxChars = 6000) {
  const cache = loadCache();
  if (!cache || !cache.pages.length) return "";

  let context = `(Live website snapshot captured ${cache.scrapedAt})\n`;
  for (const page of cache.pages) {
    const chunk = `\n--- ${page.path} ---\n${page.text}\n`;
    if (context.length + chunk.length > maxChars) break;
    context += chunk;
  }
  return context;
}

module.exports = { scrapeAll, getScrapedContext, loadCache };

if (require.main === module) {
  scrapeAll()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("[Scraper] Fatal error:", err.message);
      process.exit(1);
    });
}
