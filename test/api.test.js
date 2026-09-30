import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { dataSources, TRIP_ID, OLD_ID } from './fixtures.js';

process.env.NOTION_TOKEN = 'secret_test';
process.env.JOURNAL_PASSCODE = 'bkk2026';

import { installMockNotion } from './mock-notion.js';

const calls = installMockNotion();

const { default: trips } = await import('../api/trips.js');
const { default: trip } = await import('../api/trip.js');

function call(handler, url, headers = { 'x-passcode': 'bkk2026' }) {
  return new Promise((resolve) => {
    const res = {
      statusCode: 0, headers: {},
      setHeader(k, v) { this.headers[k] = v; },
      end(body) { resolve({ status: this.statusCode, body: JSON.parse(body), headers: this.headers }); },
    };
    handler({ url, headers }, res);
  });
}

beforeEach(() => { calls.length = 0; });

test('trips: lists registry newest first and parses flights', async () => {
  const r = await call(trips, '/api/trips');
  assert.equal(r.status, 200);
  assert.equal(r.headers['Cache-Control'], 'private, no-store');
  const [first, second] = r.body.trips;
  assert.equal(first.name, '曼谷・華欣 2026/10');
  assert.equal(second.name, '2026/01 大阪');
  assert.deepEqual(first.inbound, { flight: 'JX746', from: 'BKK', dep: '17:50', to: 'TPE', arr: '22:40', date: '2026-10-06', airline: '星宇', pnr: 'EZYN8V' });
  assert.equal(first.dayLabels.length, 6);
  assert.equal(calls[0].opts.headers['Notion-Version'], '2025-09-03');
  assert.equal(calls[0].opts.headers.Authorization, 'Bearer secret_test');
});

test('passcode is required', async () => {
  assert.equal((await call(trips, '/api/trips', {})).status, 401);
  assert.equal((await call(trips, '/api/trips', { 'x-passcode': 'wrong' })).status, 401);
  assert.equal(calls.length, 0, 'no Notion call without a valid passcode');
});

test('trip: 手帳 format returns all four lists', async () => {
  const r = await call(trip, `/api/trip?id=${TRIP_ID}`);
  assert.equal(r.status, 200);
  assert.equal(r.body.trip.format, '手帳');
  assert.equal(r.body.plan.length, 9);
  assert.equal(r.body.todo.length, 3);
  assert.equal(r.body.buy.length, 1);
  assert.equal(r.body.cost.length, 2);
  const ugo = r.body.plan.find((p) => p.title.startsWith('UGO'));
  assert.equal(ugo.props['電話'], '+886 906598115');
  assert.deepEqual(ugo.props['日期'], { start: '2026-09-30T22:20:00.000Z', end: null });
});

test('trip: 舊頁 format skips todo and cost', async () => {
  const r = await call(trip, `/api/trip?id=${OLD_ID}`);
  assert.equal(r.status, 200);
  assert.equal(r.body.plan[0].title, '黑門市場');
  assert.deepEqual(r.body.todo, []);
  assert.deepEqual(r.body.cost, []);
});

test('trip: refuses ids that are not registry rows', async () => {
  const notTrip = dataSources[Object.keys(dataSources)[0]][0];
  notTrip.id = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
  const r = await call(trip, `/api/trip?id=${notTrip.id}`);
  assert.equal(r.status, 404);
  assert.equal((await call(trip, '/api/trip?id=../../users')).status, 400);
});

test('missing server config gives a readable error', async () => {
  const saved = process.env.NOTION_TOKEN;
  delete process.env.NOTION_TOKEN;
  const r = await call(trips, '/api/trips');
  process.env.NOTION_TOKEN = saved;
  assert.equal(r.status, 500);
  assert.match(r.body.error, /NOTION_TOKEN/);
});
