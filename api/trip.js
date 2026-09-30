// GET /api/trip?id=<registry row id> — one trip with its itinerary, todo, shopping and costs.
import { REGISTRY_DS, HttpError, getPage, queryAll, flatten, isId, idOf, handle } from './_notion.js';
import { toTrip } from './trips.js';

const rows = async (ds) => (isId(ds) ? (await queryAll(idOf(ds))).map(flatten) : []);

export default handle(async (req) => {
  const id = String(new URL(req.url, 'http://x').searchParams.get('id') || '').replace(/-/g, '');
  if (!/^[0-9a-f]{32}$/i.test(id)) throw new HttpError(400, '缺少旅程 id。');

  const page = await getPage(id);
  // Only rows of the registry are trips; refuse any other page id.
  const parent = (page.parent && (page.parent.data_source_id || page.parent.database_id)) || '';
  if (parent.replace(/-/g, '') !== REGISTRY_DS.replace(/-/g, '')) throw new HttpError(404, '找不到這趟旅程。');

  const reg = flatten(page);
  const trip = toTrip(reg);
  const p = reg.props;
  const [plan, todo, buy, cost] = await Promise.all([
    rows(p['行程DS']),
    trip.format === '手帳' ? rows(p['待辦DS']) : [],
    rows(p['代購DS']),
    trip.format === '手帳' ? rows(p['花費DS']) : [],
  ]);
  return { trip, plan, todo, buy, cost, fetchedAt: new Date().toISOString() };
});
