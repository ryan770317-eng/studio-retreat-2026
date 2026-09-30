// Local preview: serves the site and /api like Vercel does.
//   NOTION_TOKEN=... JOURNAL_PASSCODE=... node scripts/dev.js     (real Notion)
//   node scripts/dev.js --mock                                    (fake data, passcode "demo")
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const port = Number(process.env.PORT || 3000);

if (process.argv.includes('--mock')) {
  const { installMockNotion } = await import('../test/mock-notion.js');
  installMockNotion();
  process.env.NOTION_TOKEN ||= 'mock';
  process.env.JOURNAL_PASSCODE ||= 'demo';
}

const routes = {
  '/api/trips': (await import('../api/trips.js')).default,
  '/api/trip': (await import('../api/trip.js')).default,
};
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.png': 'image/png' };

http.createServer(async (req, res) => {
  const path = new URL(req.url, 'http://x').pathname;
  if (routes[path]) return routes[path](req, res);
  let file = normalize(join(root, decodeURIComponent(path)));
  if (!file.startsWith(root)) { res.statusCode = 403; return res.end(); }
  if (file.endsWith('/')) file += 'index.html';
  try {
    const body = await readFile(file);
    res.setHeader('Content-Type', types[extname(file)] || 'application/octet-stream');
    res.end(body);
  } catch {
    res.statusCode = 404; res.end('not found');
  }
}).listen(port, () => console.log(`http://localhost:${port}`));
