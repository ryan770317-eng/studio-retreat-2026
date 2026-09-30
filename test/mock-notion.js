// Replaces global fetch with a fake Notion API backed by fixtures.js.
import { registryRows, dataSources, REGISTRY } from './fixtures.js';

export function installMockNotion() {
  const calls = [];
  globalThis.fetch = async (u, opts = {}) => {
    calls.push({ u, opts });
    const path = new URL(u).pathname;
    let m;
    const ok = (body) => ({ ok: true, status: 200, json: async () => body });
    if ((m = path.match(/^\/v1\/data_sources\/([^/]+)\/query$/))) {
      const norm = (x) => x.replace(/-/g, '');
      const id = norm(m[1]);
      const key = Object.keys(dataSources).find((k) => norm(k) === id);
      const results = id === norm(REGISTRY) ? registryRows : dataSources[key];
      if (!results) return { ok: false, status: 404, json: async () => ({ message: 'not found' }) };
      return ok({ results, has_more: false });
    }
    if ((m = path.match(/^\/v1\/pages\/([^/]+)$/))) {
      const pg = [...registryRows, ...Object.values(dataSources).flat()].find((p) => p.id.replace(/-/g, '') === m[1]);
      return pg ? ok(pg) : { ok: false, status: 404, json: async () => ({}) };
    }
    throw new Error('unexpected fetch ' + u);
  };
  return calls;
}
