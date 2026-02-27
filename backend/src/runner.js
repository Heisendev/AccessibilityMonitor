import { chromium } from 'playwright';
import { createRequire } from 'module';
import db from './db.js';

// axe-core is a CommonJS package — resolve its path so we can inject it into pages
const require = createRequire(import.meta.url);
const axeCorePath = require.resolve('axe-core');

export async function triggerRun(runId) {
  const urls = db.prepare('SELECT id, name, url FROM urls WHERE active = 1').all();
  let browser;

  try {
    browser = await chromium.launch({ headless: true });

    const insert = db.prepare(`
      INSERT INTO violations (run_id, url_id, violation_id, impact, description, help, help_url, nodes_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const { id: urlId, name, url } of urls) {
      const page = await browser.newPage();
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.addScriptTag({ path: axeCorePath });

        const violations = await page.evaluate(async () => {
          const results = await window.axe.run(document, {
            runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] },
          });
          return results.violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            description: v.description,
            help: v.help,
            helpUrl: v.helpUrl,
            nodesCount: v.nodes.length,
          }));
        });

        if (violations.length > 0) {
          db.transaction(() => {
            for (const v of violations) {
              insert.run(runId, urlId, v.id, v.impact, v.description, v.help, v.helpUrl, v.nodesCount);
            }
          })();
          console.log(`[runner] ${name}: ${violations.length} violations`);
        } else {
          console.log(`[runner] ${name}: no violations`);
        }
      } catch (err) {
        console.error(`[runner] Error auditing ${url}:`, err.message);
      } finally {
        await page.close();
      }
    }

    db.prepare("UPDATE test_runs SET status = 'completed', finished_at = datetime('now') WHERE id = ?").run(runId);
    console.log(`[runner] Run ${runId} complete`);
  } catch (err) {
    console.error('[runner] Run failed:', err.message);
    db.prepare("UPDATE test_runs SET status = 'failed', finished_at = datetime('now') WHERE id = ?").run(runId);
  } finally {
    await browser?.close();
  }
}
