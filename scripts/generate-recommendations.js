/**
 * generate-recommendations.js
 *
 * For each designer in designers.json that has no recommendation (or all, with --force),
 * this script:
 *   1. Scrapes their portfolio website with Playwright to extract text content
 *   2. Combines that with their X bio
 *   3. Asks Claude to generate a hiring-perspective recommendation in Chinese
 *   4. Writes the result back to designers.json
 *
 * Usage:
 *   node scripts/generate-recommendations.js              # only missing recs
 *   node scripts/generate-recommendations.js --force      # regenerate all
 *   node scripts/generate-recommendations.js --id 3       # single designer by id
 *
 * Requirements:
 *   npm install
 *   npx playwright install chromium
 *   export ANTHROPIC_API_KEY=sk-ant-...
 */

import Anthropic from '@anthropic-ai/sdk';
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '..', 'designers.json');

const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const ONLY_ID = args.includes('--id') ? parseInt(args[args.indexOf('--id') + 1], 10) : null;

// ── Portfolio scraper ─────────────────────────────────────────────────────────

async function scrapePortfolio(page, url) {
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 18000 });
    await page.waitForTimeout(2000);

    const content = await page.evaluate(() => {
      // Remove noisy elements
      ['script', 'style', 'nav', 'footer', 'iframe', 'noscript'].forEach(tag => {
        document.querySelectorAll(tag).forEach(el => el.remove());
      });

      const title = document.title || '';
      const meta = document.querySelector('meta[name="description"]')?.content || '';

      // Headings — strongest signal for what the designer focuses on
      const headings = [...document.querySelectorAll('h1, h2, h3')]
        .map(el => el.textContent.trim())
        .filter(t => t.length > 2 && t.length < 200)
        .slice(0, 12)
        .join(' · ');

      // "About" section text
      const aboutEl =
        document.querySelector('[class*="about"], [id*="about"], [class*="bio"], [id*="bio"]') ||
        document.querySelector('section, article, main');
      const aboutText = aboutEl
        ? aboutEl.textContent.replace(/\s+/g, ' ').trim().slice(0, 600)
        : '';

      // Case study keywords
      const body = document.body.textContent.replace(/\s+/g, ' ').trim().slice(0, 800);

      return { title, meta, headings, aboutText, body };
    });

    // Combine and truncate to stay well under Claude's context limit
    const combined = [
      content.title && `Page title: ${content.title}`,
      content.meta && `Meta description: ${content.meta}`,
      content.headings && `Headings: ${content.headings}`,
      content.aboutText && `About section: ${content.aboutText}`,
      `Body text excerpt: ${content.body}`,
    ]
      .filter(Boolean)
      .join('\n\n')
      .slice(0, 2500);

    return combined;
  } catch (e) {
    console.log(`    ⚠ Could not scrape ${url}: ${e.message}`);
    return null;
  }
}

// ── Claude recommendation generator ──────────────────────────────────────────

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function generateRecommendation(designer, portfolioText) {
  const context = [
    `设计师姓名：${designer.name}`,
    designer.title ? `职位：${designer.title}` : null,
    designer.company ? `公司：${designer.company}` : null,
    designer.category ? `类别：${designer.category}` : null,
    designer.specialties?.length ? `专长标签：${designer.specialties.join(', ')}` : null,
    designer.bio ? `X 简介：${designer.bio}` : null,
    portfolioText ? `\n作品集网站内容摘录：\n${portfolioText}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const response = await anthropic.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 400,
    thinking: { type: 'adaptive' },
    system: `你是一名经验丰富的设计招聘负责人（Design Hiring Manager），擅长从面试和 offer 决策的角度评估设计师作品集。
你的语气专业、直接，像在给同行设计团队负责人写内部评估备注。
不要写泛泛的夸奖，要具体指出这份作品集里哪个特质在招聘中最有说服力。`,
    messages: [
      {
        role: 'user',
        content: `请根据以下信息，用中文写一段 2-3 句话的推荐理由（约 60-100 字），说明这个设计师的作品集从招聘角度好在哪里：
——适合什么类型的公司或职位
——作品集里最有说服力的一个具体特质
——面试时为什么会让人印象深刻

设计师信息：
${context}

只输出推荐理由本身，不要标题，不要引号，不要解释。`,
      },
    ],
  });

  const textBlock = response.content.find(b => b.type === 'text');
  return textBlock?.text?.trim() || null;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌  Missing ANTHROPIC_API_KEY environment variable');
    process.exit(1);
  }

  const designers = JSON.parse(readFileSync(DATA_FILE, 'utf8'));

  // Filter which designers need a recommendation
  const targets = designers.filter(d => {
    if (ONLY_ID !== null) return d.id === ONLY_ID;
    if (FORCE) return true;
    return !d.recommendation;
  });

  if (targets.length === 0) {
    console.log('✅  All designers already have recommendations. Use --force to regenerate.');
    return;
  }

  console.log(`\n🤖 Generating recommendations for ${targets.length} designer(s)…\n`);

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  let saved = 0;

  for (const designer of targets) {
    console.log(`  [${targets.indexOf(designer) + 1}/${targets.length}] ${designer.name}`);

    // 1. Scrape portfolio
    let portfolioText = null;
    if (designer.url) {
      process.stdout.write(`    → Scraping ${designer.url}… `);
      portfolioText = await scrapePortfolio(page, designer.url);
      console.log(portfolioText ? `${portfolioText.length} chars` : 'failed');
    }

    // 2. Ask Claude
    process.stdout.write(`    → Asking Claude… `);
    let rec = null;
    try {
      rec = await generateRecommendation(designer, portfolioText);
      console.log('done');
      console.log(`    ✦ ${rec}\n`);
    } catch (e) {
      console.log(`failed: ${e.message}`);
    }

    if (rec) {
      // Update in-place in the array
      const idx = designers.findIndex(d => d.id === designer.id);
      designers[idx].recommendation = rec;
      saved++;

      // Save after each success so partial progress is preserved
      writeFileSync(DATA_FILE, JSON.stringify(designers, null, 2));
    }

    // Polite delay between designers
    await page.waitForTimeout(1500);
  }

  await browser.close();

  console.log(`\n💾 Saved ${saved} recommendation(s) to designers.json`);
}

main().catch(err => {
  console.error('\n❌ Fatal:', err.message);
  process.exit(1);
});
