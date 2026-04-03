/**
 * fetch-designers.js
 *
 * Finds product designers on X (Twitter) via Google search,
 * then visits each profile to extract name, bio, and website URL.
 *
 * Usage:
 *   node scripts/fetch-designers.js              # fetch 20 designers
 *   node scripts/fetch-designers.js --limit 50   # fetch more
 *   node scripts/fetch-designers.js --dry-run    # preview without saving
 *
 * Requirements:
 *   npm install playwright
 *   npx playwright install chromium
 */

import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '..', 'designers.json');

// ── Config ───────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const LIMIT = parseInt(args[args.indexOf('--limit') + 1] || '20', 10);
const DRY_RUN = args.includes('--dry-run');

// Google search queries — focused on product designers, not UI-only
// Using X bios that signal product thinking over visual craft
const SEARCH_QUERIES = [
  'site:x.com "product designer" "case study"',
  'site:x.com "product designer at" "previously"',
  'site:x.com "head of design" "product"',
  'site:x.com "staff designer" portfolio',
  'site:x.com "principal designer" portfolio',
  'site:x.com "product designer" "0 to 1"',
  'site:x.com "ux" "product thinking" portfolio',
  'site:x.com "designer" openai portfolio',
  'site:x.com "designer" anthropic portfolio',
  'site:x.com "designer" figma "case study"',
  'site:x.com "designer" "midjourney" OR "runway" OR "perplexity"',
  'site:x.com "ai product designer" portfolio',
  'site:x.com "designing for ai" portfolio',
];

// Specialty keywords — weighted toward product/UX signals
const SPECIALTY_MAP = {
  'design system': 'Design Systems',
  'design systems': 'Design Systems',
  '0 to 1': '0→1',
  'zero to one': '0→1',
  'growth': 'Growth',
  'platform': 'Platform',
  'mobile': 'Mobile',
  'ios': 'Mobile',
  'android': 'Mobile',
  'web': 'Web',
  'interaction': 'Interaction',
  'research': 'Research',
  'ux research': 'Research',
  'user research': 'Research',
  'accessibility': 'Accessibility',
  'a11y': 'Accessibility',
  'motion': 'Motion',
  'animation': 'Motion',
  'brand': 'Branding',
  'typography': 'Typography',
  'prototyp': 'Prototyping',
  'figma': 'Figma',
  'saas': 'SaaS',
  'enterprise': 'Enterprise',
  'b2b': 'B2B',
  'consumer': 'Consumer',
};

// Label inference from bio text — industry/domain signals
const LABEL_MAP = {
  'ai': 'AI',
  'artificial intelligence': 'AI',
  'machine learning': 'AI',
  'llm': 'AI',
  'gpt': 'AI',
  'openai': 'AI',
  'anthropic': 'AI',
  'midjourney': 'AI',
  'runway': 'AI',
  'perplexity': 'AI',
  'cursor': 'AI',
  'copilot': 'AI',
  'chatgpt': 'AI',
  'claude': 'AI',
  'autonomous': 'Autonomous',
  'self-driving': 'Autonomous',
  'robotics': 'Autonomous',
  'fintech': 'Fintech',
  'payment': 'Fintech',
  'banking': 'Fintech',
  'crypto': 'Fintech',
  'defi': 'Fintech',
  'stripe': 'Fintech',
  'dev tool': 'Dev Tools',
  'developer tool': 'Dev Tools',
  'developer experience': 'Dev Tools',
  'devex': 'Dev Tools',
  'github': 'Dev Tools',
  'vercel': 'Dev Tools',
  'linear': 'Dev Tools',
  'productivity': 'Productivity',
  'notion': 'Productivity',
  'workflow': 'Productivity',
  'task management': 'Productivity',
  'b2b': 'B2B',
  'saas': 'B2B',
  'enterprise': 'Enterprise',
  'b2c': 'B2C',
  'consumer': 'Consumer',
  'social': 'Social',
  'creator': 'Creator Tools',
  'no-code': 'No-Code',
  'nocode': 'No-Code',
  'framer': 'No-Code',
  'webflow': 'No-Code',
  'open source': 'Open Source',
  'healthcare': 'Healthcare',
  'health': 'Healthcare',
  'medtech': 'Healthcare',
  'education': 'Education',
  'edtech': 'Education',
  'ecommerce': 'E-commerce',
  'e-commerce': 'E-commerce',
  'marketplace': 'E-commerce',
  'infrastructure': 'Infrastructure',
  'platform': 'Infrastructure',
};

// Category inference from bio text
const CATEGORY_MAP = [
  { keywords: ['design engineer', 'engineer', 'developer', 'code', 'coding'], category: 'Design Engineer' },
  { keywords: ['design system', 'design systems', 'infrastructure'], category: 'Design Systems' },
  { keywords: ['ux researcher', 'user researcher', 'research lead'], category: 'UX Researcher' },
  { keywords: ['brand', 'visual design', 'art director'], category: 'Brand Designer' },
  { keywords: ['head of design', 'vp of design', 'director of design', 'staff designer', 'principal'], category: 'Product Designer' },
  { keywords: ['openai', 'anthropic', 'midjourney', 'runway', 'perplexity', 'cursor', 'ai product'], category: 'Product Designer' },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function loadExisting() {
  try {
    return JSON.parse(readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function extractSpecialties(bio = '') {
  const lower = bio.toLowerCase();
  const found = new Set();
  for (const [keyword, tag] of Object.entries(SPECIALTY_MAP)) {
    if (lower.includes(keyword)) found.add(tag);
  }
  if (found.size === 0) found.add('Product');
  return [...found].slice(0, 4);
}

function inferLabels(bio = '', company = '') {
  const lower = (bio + ' ' + company).toLowerCase();
  const found = new Set();
  for (const [keyword, label] of Object.entries(LABEL_MAP)) {
    if (lower.includes(keyword)) found.add(label);
  }
  return [...found].slice(0, 4);
}

function inferCategory(bio = '') {
  const lower = bio.toLowerCase();
  for (const { keywords, category } of CATEGORY_MAP) {
    if (keywords.some(k => lower.includes(k))) return category;
  }
  return 'Product Designer';
}

function cleanUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url.startsWith('http') ? url : 'https://' + url);
    return u.href.replace(/\/$/, '');
  } catch {
    return null;
  }
}

function formatHandle(handle) {
  return handle.replace(/^@/, '').replace(/^https?:\/\/(www\.)?x\.com\//, '').replace(/^https?:\/\/(www\.)?twitter\.com\//, '');
}

// ── Google Search for X Profiles ─────────────────────────────────────────────

async function searchGoogleForHandles(page, query) {
  const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&num=10`;
  console.log(`  Searching: ${query}`);

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1500 + Math.random() * 1000);

  // Extract X.com profile URLs from search results
  const handles = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a[href]'));
    const found = new Set();
    for (const a of links) {
      const href = a.href || '';
      const m = href.match(/(?:x\.com|twitter\.com)\/([A-Za-z0-9_]{1,15})(?:\/|$|\?)/);
      if (m) {
        const handle = m[1].toLowerCase();
        // Skip X's own pages
        if (!['search', 'explore', 'notifications', 'messages', 'home', 'i', 'settings', 'intent'].includes(handle)) {
          found.add(handle);
        }
      }
    }
    return [...found];
  });

  return handles;
}

// ── Scrape X Profile ──────────────────────────────────────────────────────────

async function scrapeXProfile(page, handle) {
  const url = `https://x.com/${handle}`;
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000 + Math.random() * 1000);

    // Check for login wall
    const loginWall = await page.$('[data-testid="loginButton"]');
    if (loginWall) {
      console.log(`    ⚠ Login required for @${handle}, skipping`);
      return null;
    }

    const data = await page.evaluate(() => {
      // Name
      const nameEl = document.querySelector('[data-testid="UserName"] span span');
      const name = nameEl?.textContent?.trim() || null;

      // Bio
      const bioEl = document.querySelector('[data-testid="UserDescription"]');
      const bio = bioEl?.textContent?.trim() || '';

      // Website URL in profile
      const urlEl = document.querySelector('[data-testid="UserUrl"] a');
      const website = urlEl?.href || urlEl?.textContent?.trim() || null;

      return { name, bio, website };
    });

    if (!data.name) return null;

    return {
      name: data.name,
      bio: data.bio,
      website: cleanUrl(data.website),
      handle,
    };
  } catch (e) {
    console.log(`    ✗ Error scraping @${handle}: ${e.message}`);
    return null;
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const existing = loadExisting();
  const existingHandles = new Set(existing.map(d => d.twitter?.toLowerCase()).filter(Boolean));
  const existingUrls = new Set(existing.map(d => d.url?.toLowerCase()).filter(Boolean));

  console.log(`\n🔍 Fetching up to ${LIMIT} new product designers from X\n`);

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 },
    locale: 'en-US',
  });

  const page = await context.newPage();

  // Step 1: Collect handles from Google
  const allHandles = new Set();
  for (const query of SEARCH_QUERIES) {
    if (allHandles.size >= LIMIT * 3) break;
    try {
      const found = await searchGoogleForHandles(page, query);
      found.forEach(h => allHandles.add(h));
      console.log(`  → Found ${found.length} handles (total: ${allHandles.size})`);
      await page.waitForTimeout(2000 + Math.random() * 1500);
    } catch (e) {
      console.log(`  ✗ Search failed: ${e.message}`);
    }
  }

  // Filter out already-known handles
  const newHandles = [...allHandles].filter(h => !existingHandles.has(h));
  console.log(`\n👤 Scraping ${Math.min(newHandles.length, LIMIT * 2)} X profiles…\n`);

  // Step 2: Scrape each profile
  const newDesigners = [];
  let scraped = 0;

  for (const handle of newHandles) {
    if (newDesigners.length >= LIMIT) break;
    scraped++;
    process.stdout.write(`  [${scraped}/${Math.min(newHandles.length, LIMIT * 2)}] @${handle}… `);

    const profile = await scrapeXProfile(page, handle);
    if (!profile || !profile.name) {
      console.log('skip (no data)');
      continue;
    }

    // Must have a portfolio URL to be useful
    if (!profile.website) {
      console.log('skip (no website)');
      continue;
    }

    // Skip if URL already exists
    if (existingUrls.has(profile.website.toLowerCase())) {
      console.log('skip (duplicate)');
      continue;
    }

    const specialties = extractSpecialties(profile.bio);
    const category = inferCategory(profile.bio);
    const labels = inferLabels(profile.bio);
    const designer = {
      id: existing.length + newDesigners.length + 1,
      name: profile.name,
      title: 'Product Designer',
      company: null,
      category,
      bio: profile.bio || null,
      specialties,
      labels,
      url: profile.website,
      twitter: profile.handle,
      recommendation: null,
      added: new Date().toISOString().split('T')[0],
    };

    newDesigners.push(designer);
    existingUrls.add(profile.website.toLowerCase());
    console.log(`✓ ${profile.name} → ${profile.website}`);

    await page.waitForTimeout(1500 + Math.random() * 1000);
  }

  await browser.close();

  // Step 3: Merge and save
  console.log(`\n✅ Found ${newDesigners.length} new designers`);

  if (DRY_RUN) {
    console.log('\nDry run — not saving. Preview:');
    console.log(JSON.stringify(newDesigners, null, 2));
  } else if (newDesigners.length > 0) {
    const merged = [...existing, ...newDesigners];
    writeFileSync(DATA_FILE, JSON.stringify(merged, null, 2));
    console.log(`💾 Saved to designers.json (total: ${merged.length})\n`);
  } else {
    console.log('\nNo new designers to save.\n');
  }
}

main().catch(err => {
  console.error('\n❌ Fatal error:', err.message);
  process.exit(1);
});
