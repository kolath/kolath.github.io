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

// Google search queries to find product designers on X
const SEARCH_QUERIES = [
  'site:x.com "product designer" "portfolio"',
  'site:x.com "ux designer" "portfolio"',
  'site:x.com "ui designer" "open to work"',
  'site:x.com "product designer at"',
];

// Specialty keywords to tag designers automatically
const SPECIALTY_MAP = {
  'design system': 'Design Systems',
  'design systems': 'Design Systems',
  'motion': 'Motion',
  'animation': 'Motion',
  'brand': 'Branding',
  'typography': 'Typography',
  'mobile': 'Mobile',
  'ios': 'Mobile',
  'android': 'Mobile',
  'web': 'Web',
  'interaction': 'Interaction',
  'research': 'Research',
  'ux research': 'Research',
  'accessibility': 'Accessibility',
  'a11y': 'Accessibility',
  'product': 'Product',
  'ui': 'UI Design',
  'ux': 'UX',
  'figma': 'Figma',
  'prototyp': 'Prototyping',
};

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
  // Default
  if (found.size === 0) found.add('Product');
  return [...found].slice(0, 4);
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
    const designer = {
      id: existing.length + newDesigners.length + 1,
      name: profile.name,
      title: 'Product Designer',
      company: null,
      bio: profile.bio || null,
      specialties,
      url: profile.website,
      twitter: profile.handle,
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
