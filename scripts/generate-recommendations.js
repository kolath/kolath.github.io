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
 *   node scripts/generate-recommendations.js              # only missing recs or labels
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

// ── All available labels (keep in sync with designers.html LABEL_ORDER) ───────

const KNOWN_LABELS = [
  'AI', 'Autonomous', 'Fintech', 'Dev Tools', 'Productivity',
  'B2B', 'B2C', 'Enterprise', 'Consumer', 'Healthcare',
  'Creator Tools', 'No-Code', 'Open Source', 'Infrastructure',
  'Social', 'Education', 'E-commerce', 'Gaming', 'Climate',
];

// ── Claude generator (recommendation + labels together) ───────────────────────

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function generateInsights(designer, portfolioText) {
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
    max_tokens: 600,
    thinking: { type: 'adaptive' },
    system: `你是一名经验丰富的设计招聘负责人（Design Hiring Manager），擅长从面试和 offer 决策的角度评估设计师作品集。
你的语气专业、直接，像在给同行设计团队负责人写内部评估备注。
不要写泛泛的夸奖，要具体指出这份作品集里哪个特质在招聘中最有说服力。`,
    messages: [
      {
        role: 'user',
        content: `请根据以下设计师信息，输出一个 JSON 对象，包含两个字段：

1. "recommendation"：用中文写 2-3 句话（约 60-100 字）的招聘推荐理由，说明：
   - 适合什么类型的公司或职位
   - 作品集里最有说服力的具体特质
   - 面试时为什么会让人印象深刻

2. "labels"：从下面的列表中选出 1-4 个最匹配的行业/方向标签（数组）：
   ${KNOWN_LABELS.join(', ')}
   如果都不匹配可以返回空数组。

设计师信息：
${context}

只输出 JSON，不要任何解释或 markdown 代码块。格式：{"recommendation":"...","labels":["..."]}`,
      },
    ],
  });

  const textBlock = response.content.find(b => b.type === 'text');
  const raw = textBlock?.text?.trim();
  if (!raw) return null;

  try {
    // Strip possible markdown fences just in case
    const clean = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    return JSON.parse(clean);
  } catch {
    // Fallback: treat entire output as recommendation if JSON parse fails
    return { recommendation: raw, labels: [] };
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌  Missing ANTHROPIC_API_KEY environment variable');
    process.exit(1);
  }

  const designers = JSON.parse(readFileSync(DATA_FILE, 'utf8'));

  // Filter: process designers missing recommendation OR labels (unless --force)
  const targets = designers.filter(d => {
    if (ONLY_ID !== null) return d.id === ONLY_ID;
    if (FORCE) return true;
    return !d.recommendation || !d.labels?.length;
  });

  if (targets.length === 0) {
    console.log('✅  All designers already have recommendations. Use --force to regenerate.');
    return;
  }

  console.log(`\n🤖 Generating recommendations + labels for ${targets.length} designer(s)…\n`);

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

    // 2. Ask Claude for recommendation + labels
    process.stdout.write(`    → Asking Claude… `);
    let insights = null;
    try {
      insights = await generateInsights(designer, portfolioText);
      console.log('done');
      if (insights?.recommendation) console.log(`    ✦ ${insights.recommendation}`);
      if (insights?.labels?.length) console.log(`    🏷  ${insights.labels.join(', ')}`);
      console.log('');
    } catch (e) {
      console.log(`failed: ${e.message}`);
    }

    if (insights) {
      const idx = designers.findIndex(d => d.id === designer.id);
      if (insights.recommendation) designers[idx].recommendation = insights.recommendation;
      if (insights.labels?.length) {
        // Merge with any existing manually-set labels, dedup
        const existing = designers[idx].labels || [];
        designers[idx].labels = [...new Set([...existing, ...insights.labels])];
      }
      saved++;
      writeFileSync(DATA_FILE, JSON.stringify(designers, null, 2));
    }

    // Polite delay between designers
    await page.waitForTimeout(1500);
  }

  await browser.close();

  console.log(`\n💾 Saved ${saved} designer(s) to designers.json`);
}

main().catch(err => {
  console.error('\n❌ Fatal:', err.message);
  process.exit(1);
});
