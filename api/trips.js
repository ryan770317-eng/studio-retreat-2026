// GET /api/trips — every trip in the 旅程總覽 registry, newest first.
import { REGISTRY_DS, queryAll, flatten, parseFlight, unescape, handle } from './_notion.js';

export function toTrip(row) {
  const p = row.props;
  const date = p['日期'] || {};
  return {
    id: row.id,
    name: p['旅程'] || '',
    city: p['城市'] || '',
    code: p['代碼'] || '',
    start: date.start || null,
    end: date.end || date.start || null,
    zone: p['時區'] || 'Asia/Taipei',
    currency: p['幣別'] || null,
    format: p['格式'] || '舊頁',
    outbound: parseFlight(p['去程']),
    inbound: parseFlight(p['回程']),
    dayLabels: unescape(p['每天標籤']).split(/[,，]/).map((s) => s.trim()).filter(Boolean),
    note: p['備註'] || '',
    notionUrl: p['主頁'] || null,
  };
}

export default handle(async () => {
  const rows = (await queryAll(REGISTRY_DS)).map(flatten).map(toTrip);
  rows.sort((a, b) => String(b.start || '').localeCompare(String(a.start || '')));
  return { trips: rows };
});
