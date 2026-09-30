// Notion API-shaped fixtures built from the real 曼谷・華欣 2026/10 trip.
const rt = (s) => ({ type: 'rich_text', rich_text: s ? [{ plain_text: s }] : [] });
const title = (s) => ({ type: 'title', title: [{ plain_text: s }] });
const sel = (s) => ({ type: 'select', select: s ? { name: s } : null });
const date = (start, end = null) => ({ type: 'date', date: start ? { start, end } : null });
const num = (n) => ({ type: 'number', number: n });
const box = (b) => ({ type: 'checkbox', checkbox: b });
const phone = (s) => ({ type: 'phone_number', phone_number: s || null });
const url = (s) => ({ type: 'url', url: s || null });

export const REGISTRY = '99fc2894-fbfa-4aa0-8210-f204df140a92';
export const TRIP_ID = '3df2a7ef8d60817f91ffd6003ba7cab8';
export const OLD_ID = '3df2a7ef8d6081e0b7e3cde771a1a891';
const PLAN = '719ef03d-4087-4b05-947f-3146b9e7e02b';
const TODO = '6d0b9a10-ab93-4df8-bafa-f904a440491b';
const BUY = '0783e725-c69b-4767-85c9-86d8c116a937';
const COST = '0ecd6a9e-c05f-4549-bfe9-c5cebb7b0019';
const OLD_PLAN = '2e02a7ef-8d60-8160-8bcd-000becece82f';
const OLD_BUY = '2e02a7ef-8d60-812f-989d-000b13d24141';

const page = (id, properties, parent) => ({
  object: 'page', id, url: `https://www.notion.so/${id.replace(/-/g, '')}`,
  parent: parent || { type: 'data_source_id', data_source_id: 'x' }, properties,
});
const reg = (id, p) => page(id, {
  旅程: title(p.name), 城市: rt(p.city), 代碼: rt(p.code), 日期: date(p.start, p.end), 時區: sel(p.zone),
  幣別: sel(p.cur), 格式: sel(p.format), 去程: rt(p.out), 回程: rt(p.back), 每天標籤: rt(p.labels || ''),
  備註: rt(p.note || ''), 主頁: url(p.home), 行程DS: rt(p.plan || ''), 待辦DS: rt(p.todo || ''),
  代購DS: rt(p.buy || ''), 花費DS: rt(p.cost || ''),
}, { type: 'data_source_id', data_source_id: REGISTRY });

export const registryRows = [
  reg(TRIP_ID, {
    name: '曼谷・華欣 2026/10', city: '曼谷 · 華欣', code: 'BKK', start: '2026-10-01', end: '2026-10-06',
    zone: 'Asia/Bangkok', cur: 'THB', format: '手帳',
    out: 'JX741|TPE|09:00|BKK|12:00|2026-10-01|星宇|EZYN8V', back: 'JX746\\|BKK\\|17:50\\|TPE\\|22:40\\|2026-10-06\\|星宇\\|EZYN8V',
    labels: '台北到曼谷,曼谷,曼谷,曼谷到華欣,華欣,華欣回台北', note: '第一趟用手帳系統的旅行。',
    home: 'https://app.notion.com/p/3dc2a7ef8d6081a28dfafade99fed6b2', plan: PLAN, todo: TODO, buy: BUY, cost: COST,
  }),
  reg(OLD_ID, {
    name: '2026/01 大阪', city: '大阪', code: 'KIX', start: '2026-01-14', end: '2026-01-17', zone: 'Asia/Tokyo', cur: 'JPY',
    format: '舊頁', out: 'JX822|TPE|09:20|KIX|12:50|2026-01-14|星宇|', back: 'JX823|KIX|14:00|TPE|16:15|2026-01-17|星宇|',
    note: '舊格式頁。', home: 'https://app.notion.com/p/2e02a7ef8d6080fc942ac9ff0f142b7a', plan: OLD_PLAN, buy: OLD_BUY,
  }),
];

const planRow = (id, p) => page(id, {
  事項: title(p.what), 日期: date(p.date), 時區: sel(p.zone), 地點: rt(p.loc), 第幾天: sel(p.day), 電話: phone(p.phone),
  備註: rt(p.note), 狀態: sel(p.status), 編號: rt(p.no), 類型: sel(p.kind),
});
export const dataSources = {
  [PLAN]: [
    planRow('p1', { what: 'UGO 到天母接，去桃園機場', date: '2026-09-30T22:20:00.000Z', zone: '', loc: '台北市士林區忠誠路二段 82 巷 1 號', day: '10/01 四 台北到曼谷', phone: '+886 906598115', note: '【9/30 23:46 已換司機】王耀賢', status: '已付', no: 'U9848875', kind: '移動' }),
    planRow('p2', { what: 'JX741 起飛，台北到曼谷', date: '2026-10-01T01:00:00.000Z', loc: '桃園機場 T2 到蘇凡納布 BKK', status: '已付', no: 'EZYN8V', kind: '移動' }),
    planRow('p3', { what: 'Kungthong Seafood กุ้งทอง ซีฟู้ด（泰式海鮮）', date: '2026-10-01T11:30:00.000Z', loc: '2927 Rama 4 Rd, Khlong Toei（近 BTS Phrom Phong）', phone: '+66 98 286 9180', status: '已訂', kind: '吃' }),
    planRow('p4', { what: '曼谷自由日', date: '2026-10-02', kind: '玩' }),
    planRow('p5', { what: 'Saawaan（泰式）', date: '2026-10-03T10:30:00.000Z', loc: '39/19 Soi Suan Phlu, Sathorn', status: '已訂', no: '6L9MYE', kind: '吃' }),
    planRow('p6', { what: 'Pane & Focaccia（義式 deli）', date: '2026-10-05T05:30:00.000Z', status: '待確認', kind: '吃' }),
    planRow('p7', { what: '落地桃園 T2，UGO 接回天母', date: '2026-10-06T14:40:00.000Z', zone: '台北', status: '已付', kind: '移動' }),
    planRow('p9', { what: 'JX746 起飛，曼谷到台北', date: '2026-10-06T10:50:00.000Z', loc: '蘇凡納布 BKK 到桃園機場 T2', status: '已付', kind: '移動' }),
    planRow('p8', { what: '還沒決定哪天去的店', kind: '買' }),
  ],
  [TODO]: [
    page('t1', { 事項: title('確認護照效期六個月以上'), 完成: box(false), 時機: sel('出發前'), 備註: rt('') }),
    page('t2', { 事項: title('填泰國數位入境卡 TDAC'), 完成: box(true), 時機: sel('出發前'), 備註: rt('Arrival Card No. ED6682E') }),
    page('t3', { 事項: title('COMO THB 1,500 抵用金用掉'), 完成: box(false), 時機: sel('旅途中'), 備註: rt('') }),
  ],
  [BUY]: [
    page('b1', { 項目: title('鼻通'), 已買: box(false), 幫誰買: rt('wawa'), 數量: rt('一排'), 哪裡買: rt('7-11'), 泰銖: num(null), 備註: rt('') }),
  ],
  [COST]: [
    page('c1', { 項目: title('星宇機票'), 金額: num(12000), 幣別: sel('TWD'), 狀態: sel('已付'), 類型: sel('機票'), 日期: date('2026-08-31'), 備註: rt('') }),
    page('c2', { 項目: title('COMO 房費餘額'), 金額: num(19401.46), 幣別: sel('THB'), 狀態: sel('現場付'), 類型: sel('住宿'), 日期: date('2026-10-04'), 備註: rt('退房時刷訂房那張卡') }),
  ],
  [OLD_PLAN]: [
    page('o1', { 名稱: title('黑門市場'), 日期: date('2026-01-15'), 備註: rt('早上去'), 類別: { type: 'multi_select', multi_select: [{ name: '吃' }] } }),
  ],
  [OLD_BUY]: [],
};
