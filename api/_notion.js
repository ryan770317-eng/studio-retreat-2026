// Notion API helpers shared by /api/trips and /api/trip.
// Files starting with "_" are not exposed as routes by Vercel.
import { timingSafeEqual } from 'node:crypto';

const NOTION_VERSION = '2025-09-03';
const API = 'https://api.notion.com/v1';

// 旅程總覽 data source (the registry of trips). Override with REGISTRY_DS if it ever moves.
export const REGISTRY_DS = process.env.REGISTRY_DS || '99fc2894-fbfa-4aa0-8210-f204df140a92';

export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

async function notion(path, { method = 'GET', body } = {}) {
  const token = process.env.NOTION_TOKEN;
  if (!token) throw new HttpError(500, '伺服器還沒設定 NOTION_TOKEN。');
  const res = await fetch(API + path, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 404 || res.status === 403) {
      throw new HttpError(502, 'Notion 讀不到這份資料。請確認 Notion 整合已經被加到「旅行手帳系統」和「旅行計劃」頁面。');
    }
    if (res.status === 401) throw new HttpError(502, 'NOTION_TOKEN 無效或已被撤銷。');
    throw new HttpError(502, `Notion 回應錯誤（${res.status}）：${data.message || ''}`);
  }
  return data;
}

// Query every row of a data source, following pagination.
export async function queryAll(dataSourceId, sorts) {
  const rows = [];
  let cursor;
  do {
    const data = await notion(`/data_sources/${dataSourceId}/query`, {
      method: 'POST',
      body: { page_size: 100, start_cursor: cursor, sorts },
    });
    rows.push(...data.results);
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);
  return rows;
}

export const getPage = (id) => notion(`/pages/${id}`);

const plain = (arr) => (arr || []).map((t) => t.plain_text).join('');

// Flatten one Notion property to plain JSON.
export function value(prop) {
  if (!prop) return null;
  switch (prop.type) {
    case 'title': return plain(prop.title);
    case 'rich_text': return plain(prop.rich_text);
    case 'select': return prop.select ? prop.select.name : null;
    case 'status': return prop.status ? prop.status.name : null;
    case 'multi_select': return prop.multi_select.map((o) => o.name);
    case 'date': return prop.date ? { start: prop.date.start, end: prop.date.end } : null;
    case 'number': return prop.number;
    case 'checkbox': return prop.checkbox;
    case 'phone_number': return prop.phone_number;
    case 'url': return prop.url;
    case 'email': return prop.email;
    case 'formula': return prop.formula ? prop.formula[prop.formula.type] ?? null : null;
    case 'created_time': return prop.created_time;
    case 'last_edited_time': return prop.last_edited_time;
    default: return null;
  }
}

// One Notion page -> { id, url, title, props: { name: value } }.
export function flatten(page) {
  const props = {};
  let title = '';
  for (const [name, prop] of Object.entries(page.properties || {})) {
    props[name] = value(prop);
    if (prop.type === 'title') title = props[name];
  }
  return { id: page.id.replace(/-/g, ''), url: page.url, title, props };
}

// Registry text fields sometimes carry markdown escapes ("JX741\|TPE").
export const unescape = (s) => (s == null ? '' : String(s).replace(/\\([|\\*_~`[\]])/g, '$1'));

// "航班|出發機場|起飛|抵達機場|降落|日期|航空公司|訂位代號"
export function parseFlight(s) {
  const f = unescape(s).split('|').map((x) => x.trim());
  if (!f[0]) return null;
  const [flight, from, dep, to, arr, date, airline, pnr] = f;
  return { flight, from, dep, to, arr, date, airline, pnr };
}

const cleanId = (s) => unescape(s).trim().replace(/-/g, '');
export const isId = (s) => /^[0-9a-f]{32}$/i.test(cleanId(s));
export const idOf = (s) => cleanId(s);

// Shared passcode so the trip data is not readable by anyone who finds the URL.
export function checkPasscode(req) {
  const expected = process.env.JOURNAL_PASSCODE;
  if (!expected) throw new HttpError(500, '伺服器還沒設定 JOURNAL_PASSCODE。');
  const given = String(req.headers['x-passcode'] || '');
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) throw new HttpError(401, '通關密語不對。');
}

export function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'private, no-store');
  res.end(JSON.stringify(body));
}

export function handle(fn) {
  return async (req, res) => {
    try {
      checkPasscode(req);
      send(res, 200, await fn(req));
    } catch (e) {
      send(res, e.status || 500, { error: e.status ? e.message : '伺服器出錯了。' });
      if (!e.status) console.error(e);
    }
  };
}
