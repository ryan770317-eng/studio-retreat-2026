// 旅行手帳 — reads trips from /api (which reads Notion) and renders them.
// Routes: #/ trip list, #/t/<id> one trip, #/t/<id>/<tab>.
(() => {
  const PASS_KEY = 'journal.passcode';
  const CACHE_KEY = 'journal.cache.';
  const TABS = [
    ['plan', '行程'], ['todo', '待辦'], ['buy', '代購'], ['cost', '花費'], ['info', '資料'],
  ];
  const WEEK = ['日', '一', '二', '三', '四', '五', '六'];
  const ARCHIVE = [
    { name: '清邁 × 曼谷 員工旅遊', city: '清邁 · 曼谷', code: 'CNX', start: '2026-05-14', end: '2026-05-20', href: 'archive/2026-05-chiangmai/' },
  ];

  const $app = document.getElementById('app');
  const $gate = document.getElementById('gate');

  // ---------- small helpers ----------
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} },
    del(k) { try { localStorage.removeItem(k); } catch {} },
  };
  const mapsUrl = (q) => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q);
  const money = (n) => Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 2 });

  // Parse "YYYY-MM-DD" as a calendar date (no timezone shift).
  function ymd(s) {
    const m = String(s || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
    return m ? { y: +m[1], m: +m[2], d: +m[3] } : null;
  }
  function addDays(s, n) {
    const p = ymd(s); if (!p) return null;
    const d = new Date(Date.UTC(p.y, p.m - 1, p.d + n));
    return d.toISOString().slice(0, 10);
  }
  function dayDiff(a, b) {
    const pa = ymd(a), pb = ymd(b); if (!pa || !pb) return 0;
    return Math.round((Date.UTC(pb.y, pb.m - 1, pb.d) - Date.UTC(pa.y, pa.m - 1, pa.d)) / 864e5);
  }
  const weekday = (s) => { const p = ymd(s); return p ? WEEK[new Date(Date.UTC(p.y, p.m - 1, p.d)).getUTCDay()] : ''; };
  const md = (s) => { const p = ymd(s); return p ? `${String(p.m).padStart(2, '0')}/${String(p.d).padStart(2, '0')}` : ''; };
  const dots = (s) => { const p = ymd(s); return p ? `${p.y}.${String(p.m).padStart(2, '0')}.${String(p.d).padStart(2, '0')}` : ''; };

  // Today's date in a given timezone, as YYYY-MM-DD.
  function todayIn(zone) {
    try {
      return new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    } catch { return new Date().toISOString().slice(0, 10); }
  }
  // Date + time of an ISO datetime shown in a zone.
  function inZone(iso, zone) {
    try {
      const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
        timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
      }).formatToParts(new Date(iso)).map((x) => [x.type, x.value]));
      return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour === '24' ? '00' : p.hour}:${p.minute}` };
    } catch { return { date: String(iso).slice(0, 10), time: '' }; }
  }
  const hasTime = (s) => /T\d{2}:\d{2}/.test(String(s || ''));

  function tripStatus(t) {
    const today = todayIn(t.zone || 'Asia/Taipei');
    if (!t.start) return { key: 'none', label: '' };
    if (today < t.start) {
      const n = dayDiff(today, t.start);
      return { key: 'soon', label: n === 1 ? '明天出發' : `${n} 天後出發` };
    }
    if (today <= (t.end || t.start)) return { key: 'now', label: `旅途中 · 第 ${dayDiff(t.start, today) + 1} 天` };
    return { key: 'past', label: '已結束' };
  }

  // ---------- data ----------
  async function api(path) {
    const pass = store.get(PASS_KEY);
    if (!pass) throw Object.assign(new Error('需要通關密語'), { gate: true });
    const res = await fetch(path, { headers: { 'x-passcode': pass } });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) { store.del(PASS_KEY); throw Object.assign(new Error(data.error || '通關密語不對'), { gate: true }); }
    if (!res.ok) throw new Error(data.error || `讀取失敗（${res.status}）`);
    store.set(CACHE_KEY + path, JSON.stringify({ at: Date.now(), data }));
    return data;
  }
  function cached(path) {
    try { return JSON.parse(store.get(CACHE_KEY + path)); } catch { return null; }
  }
  // Show cached data right away, then refresh from the network.
  async function load(path, render) {
    const c = cached(path);
    if (c) render(c.data, { stale: true, at: c.at });
    try {
      render(await api(path), { stale: false, at: Date.now() });
    } catch (e) {
      if (e.gate) return showGate(e.message);
      if (c) render(c.data, { stale: true, at: c.at, error: e.message });
      else $app.innerHTML = `<div class="page"><div class="banner err">${esc(e.message)}</div><p><a class="btn ghost" href="#/">回旅程列表</a></p></div>`;
    }
  }

  function showGate(msg) {
    $gate.hidden = false;
    document.getElementById('gate-msg').textContent = msg || '輸入通關密語';
    document.getElementById('gate-input').focus();
  }
  $gate.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = document.getElementById('gate-input').value.trim();
    if (!v) return;
    store.set(PASS_KEY, v);
    $gate.hidden = true;
    route();
  });

  function syncNote(meta) {
    const t = new Date(meta.at);
    const hhmm = `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;
    if (meta.error) return `<div class="banner err">沒連上：${esc(meta.error)}。先顯示 ${hhmm} 存下的內容。</div>`;
    if (meta.stale) return `<div class="banner">顯示 ${hhmm} 存下的內容，更新中…</div>`;
    return '';
  }

  // ---------- trip list ----------
  function renderList(data, meta) {
    const trips = data.trips || [];
    const groups = { now: [], soon: [], past: [] };
    for (const t of trips) {
      const s = tripStatus(t);
      (groups[s.key] || groups.past).push({ t, s });
    }
    groups.soon.sort((a, b) => a.t.start.localeCompare(b.t.start));
    const card = ({ t, s }) => `
      <a class="trip-card ${s.key}" href="#/t/${t.id}">
        <span class="code">${esc(t.code || '✈')}</span>
        <span class="trip-main">
          <span class="trip-name">${esc(t.name)}</span>
          <span class="trip-meta"><span class="mono">${esc(dots(t.start))} – ${esc(md(t.end))}</span>${t.city ? `<span>${esc(t.city)}</span>` : ''}</span>
        </span>
        <span class="trip-side">${s.label ? `<span class="chip st-${s.key}">${esc(s.label)}</span>` : ''}${t.format !== '手帳' ? '<span class="chip old">舊格式</span>' : ''}</span>
      </a>`;
    const section = (title, list) => list.length ? `<section class="group"><h2>${title}</h2>${list.map(card).join('')}</section>` : '';
    const archive = ARCHIVE.map((a) => `
      <a class="trip-card past" href="${esc(a.href)}">
        <span class="code">${esc(a.code)}</span>
        <span class="trip-main"><span class="trip-name">${esc(a.name)}</span>
        <span class="trip-meta"><span class="mono">${esc(dots(a.start))} – ${esc(md(a.end))}</span><span>${esc(a.city)}</span></span></span>
        <span class="trip-side"><span class="chip old">封存網站</span></span>
      </a>`).join('');

    $app.innerHTML = `
      <header class="hero list-hero">
        <p class="eyebrow">Travel Journal</p>
        <h1>旅行手帳</h1>
        <p class="sub">${trips.length} 趟旅行，資料來自 Notion 旅程總覽</p>
      </header>
      <main class="page">
        ${syncNote(meta)}
        ${section('旅途中', groups.now)}
        ${section('準備出發', groups.soon)}
        ${section('去過的', groups.past)}
        <section class="group"><h2>封存</h2>${archive}</section>
        <p class="foot">新開一趟：跟 Claude 說「開一趟 YYYY/MM 某地」，會在 Notion 建好頁面並登錄到旅程總覽，這裡就會多一張卡。</p>
      </main>`;
    document.title = '旅行手帳';
  }

  // ---------- one trip ----------
  function tripDays(t) {
    if (!t.start) return [];
    const n = Math.max(0, dayDiff(t.start, t.end || t.start)) + 1;
    return Array.from({ length: n }, (_, i) => {
      const date = addDays(t.start, i);
      const label = t.dayLabels[i] || '';
      return { i, date, label, key: `${md(date)} ${weekday(date)} ${label}`.trim() };
    });
  }

  // 時區 column wins. When blank, look at where the row starts: "桃園機場 T2 到蘇凡納布" starts
  // in Taiwan so it is Taipei time; "蘇凡納布 BKK 到桃園機場 T2" starts abroad so it is local.
  const TW = /桃園|松山|天母|台北|臺北|TPE|TSA/;
  function rowZone(p, t) {
    if (p['時區'] === '台北') return 'Asia/Taipei';
    if (p['時區'] === '當地') return t.zone || 'Asia/Taipei';
    const origin = String(p['地點'] || p['事項'] || '').replace(/^上車\s*/, '').split(/\s*(?:到|→|；|;)\s*/)[0];
    return TW.test(origin) ? 'Asia/Taipei' : (t.zone || 'Asia/Taipei');
  }

  // Which calendar day a 行程 row belongs to, and its display time.
  function placeRow(r, t) {
    const p = r.props;
    const d = p['日期'] && p['日期'].start;
    const zone = rowZone(p, t);
    if (!d) return { date: null, time: '', zone, sort: Infinity };
    if (!hasTime(d)) return { date: d.slice(0, 10), time: '', zone, sort: new Date(d.slice(0, 10) + 'T00:00:00Z').getTime() - 1 };
    const z = inZone(d, zone);
    return { date: z.date, time: z.time, zone, sort: new Date(d).getTime() };
  }

  const kindClass = (k) => 'k-' + ({ 移動: 'move', 住宿: 'stay', 吃: 'eat', 玩: 'play', 買: 'shop', 記: 'note' }[k] || 'note');
  const statusClass = (s) => 's-' + ({ 已付: 'paid', 已訂: 'booked', 未訂: 'open', 待確認: 'check', 放棄: 'drop', 完成: 'done' }[s] || 'none');

  function telHref(ph) {
    let d = String(ph || '').replace(/[^\d+]/g, '');
    if (!d) return '';
    if (d.startsWith('+')) return 'tel:' + d;
    if (d.startsWith('0')) return 'tel:+886' + d.slice(1);
    return 'tel:+' + d;
  }
  function mapQuery(loc) {
    let s = String(loc || '').trim(); if (!s) return '';
    const m = s.match(/下車\s*([^；;]+)/); if (m) s = m[1];
    else if (s.includes('；')) s = s.split('；')[0].replace(/^上車\s*/, '');
    return s.replace(/（[^）]*）|\([^)]*\)/g, '').trim();
  }

  function planRow(r, place, t) {
    const p = r.props;
    const title = p['事項'] || r.title || '（未命名）';
    const loc = p['地點'] || '';
    const ph = p['電話'] || '';
    const q = mapQuery(loc);
    const other = place.zone !== t.zone && place.time ? `<small>${place.zone === 'Asia/Taipei' ? '台北' : ''}</small>` : '';
    return `
      <details class="row ${p['狀態'] === '放棄' ? 'dropped' : ''}">
        <summary>
          <span class="time ${place.time ? '' : 'none'}">${place.time ? esc(place.time) + other : '全天'}</span>
          <span class="what">
            <span class="t">${esc(title)}</span>
            ${loc ? `<span class="m">${esc(loc)}</span>` : ''}
          </span>
          <span class="side">
            ${p['類型'] ? `<span class="chip ${kindClass(p['類型'])}">${esc(p['類型'])}</span>` : ''}
            ${p['狀態'] ? `<span class="chip ${statusClass(p['狀態'])}">${esc(p['狀態'])}</span>` : ''}
          </span>
        </summary>
        <div class="detail">
          <div class="acts">
            ${q ? `<a class="ic" href="${esc(mapsUrl(q))}" target="_blank" rel="noopener">地圖</a>` : ''}
            ${telHref(ph) ? `<a class="ic" href="${esc(telHref(ph))}">${esc(ph)}</a>` : ''}
            <a class="ic ghost" href="${esc(r.url)}" target="_blank" rel="noopener">在 Notion 改</a>
          </div>
          ${p['編號'] ? `<p class="kv"><b>編號</b>${esc(p['編號'])}</p>` : ''}
          ${p['備註'] ? `<p class="note">${esc(p['備註'])}</p>` : ''}
        </div>
      </details>`;
  }

  function ticket(f, label) {
    if (!f) return '';
    return `
      <article class="ticket" aria-label="${esc(label)} ${esc(f.flight)}">
        <div class="tk-main">
          <div class="tk-brand"><span>${esc(label)}${f.airline ? ' · ' + esc(f.airline) : ''}</span><b>${esc(f.flight)}</b></div>
          <div class="tk-codes"><strong>${esc(f.from)}</strong><span class="tk-line">✈</span><strong>${esc(f.to)}</strong></div>
          <div class="tk-times"><span>${esc(md(f.date))} ${esc(weekday(f.date))} ${esc(f.dep)}</span><span>${esc(f.arr)}</span></div>
        </div>
        <div class="tk-stub"><small>${esc(f.pnr || '—')}</small><b>${esc(f.from)}</b><i></i><b>${esc(f.to)}</b></div>
      </article>`;
  }

  function viewPlan(data) {
    const t = data.trip;
    const days = tripDays(t);
    const byDate = new Map(days.map((d) => [d.date, []]));
    const loose = [];
    for (const r of data.plan) {
      const place = placeRow(r, t);
      const bucket = place.date && byDate.get(place.date);
      (bucket || loose).push({ r, place });
    }
    const today = todayIn(t.zone);
    const daySection = (d, list) => {
      list.sort((a, b) => a.place.sort - b.place.sort);
      const head = d.date ? `${esc(md(d.date))} <small>${esc(weekday(d.date))}　${esc(d.label)}</small>` : '未排日期';
      return `
        <section class="day ${d.date && d.date === today ? 'today' : ''}" id="day-${d.date || 'none'}">
          <div class="day-h"><h2>${head}</h2><span class="n">${list.length} 項</span></div>
          <div class="card">${list.length ? list.map(({ r, place }) => planRow(r, place, t)).join('') : '<div class="empty">這天還沒排東西</div>'}</div>
        </section>`;
    };
    const pills = days.map((d) => `
      <a class="pill ${d.date === today ? 'on' : ''}" href="#day-${d.date}" data-jump="day-${d.date}">
        <span class="disc"><b>${esc(String(ymd(d.date).d).padStart(2, '0'))}</b><small>${esc(weekday(d.date))}</small></span>
        <span class="lbl">${esc(d.label || 'D' + (d.i + 1))}</span>
      </a>`).join('');
    return `
      <div class="daybar">${pills}</div>
      <div class="tickets">${ticket(t.outbound, '去程')}${ticket(t.inbound, '回程')}</div>
      ${days.map((d) => daySection(d, byDate.get(d.date))).join('')}
      ${loose.length ? daySection({ date: '' }, loose) : ''}`;
  }

  function viewTodo(data) {
    const groups = ['出發前', '旅途中', '回台後', ''];
    const rows = data.todo;
    if (!rows.length) return '<div class="card"><div class="empty">沒有待辦</div></div>';
    return groups.map((g) => {
      const list = rows.filter((r) => (r.props['時機'] || '') === g);
      if (!list.length) return '';
      const done = list.filter((r) => r.props['完成']).length;
      list.sort((a, b) => Number(!!a.props['完成']) - Number(!!b.props['完成']));
      return `
        <div class="card">
          <div class="card-h"><h3>${esc(g || '其他')}</h3><span class="n">${done}/${list.length}</span></div>
          ${list.map((r) => `
            <details class="row ${r.props['完成'] ? 'done' : ''}">
              <summary><span class="box" aria-checked="${!!r.props['完成']}"></span><span class="what"><span class="t">${esc(r.props['事項'] || r.title)}</span></span></summary>
              <div class="detail">${r.props['備註'] ? `<p class="note">${esc(r.props['備註'])}</p>` : ''}<div class="acts"><a class="ic ghost" href="${esc(r.url)}" target="_blank" rel="noopener">在 Notion 改</a></div></div>
            </details>`).join('')}
        </div>`;
    }).join('');
  }

  function viewBuy(data, legacy) {
    const rows = data.buy;
    if (!rows.length) return '<div class="card"><div class="empty">沒有要代購的東西</div></div>';
    if (legacy) return genericList(rows, '代購');
    return `<div class="card">${rows.map((r) => {
      const p = r.props;
      const sub = [p['幫誰買'] && '幫 ' + p['幫誰買'], p['數量'] && '× ' + p['數量'], p['哪裡買']].filter(Boolean).join('　');
      return `
        <details class="row ${p['已買'] ? 'done' : ''}">
          <summary><span class="box" aria-checked="${!!p['已買']}"></span><span class="what"><span class="t">${esc(p['項目'] || r.title)}</span>${sub ? `<span class="m">${esc(sub)}</span>` : ''}</span>
          ${p['泰銖'] != null ? `<span class="amt">${esc(money(p['泰銖']))}</span>` : ''}</summary>
          <div class="detail">${p['備註'] ? `<p class="note">${esc(p['備註'])}</p>` : ''}<div class="acts"><a class="ic ghost" href="${esc(r.url)}" target="_blank" rel="noopener">在 Notion 改</a></div></div>
        </details>`;
    }).join('')}</div>`;
  }

  function viewCost(data) {
    const rows = data.cost;
    if (!rows.length) return '<div class="card"><div class="empty">還沒記花費</div></div>';
    const sums = {};
    for (const r of rows) {
      const cur = r.props['幣別'] || '—';
      const st = r.props['狀態'] || '已付';
      sums[cur] = sums[cur] || { paid: 0, due: 0 };
      if (st === '已付') sums[cur].paid += r.props['金額'] || 0; else sums[cur].due += r.props['金額'] || 0;
    }
    const tiles = Object.entries(sums).map(([cur, s]) => `
      <div class="tile"><span class="chip">${esc(cur)}</span>
        <span class="amt">${esc(money(s.paid))}</span><span class="lbl">已付</span>
        ${s.due ? `<span class="amt due">${esc(money(s.due))}</span><span class="lbl">現場付或掛房帳</span>` : ''}
      </div>`).join('');
    rows.sort((a, b) => String(a.props['日期']?.start || '').localeCompare(String(b.props['日期']?.start || '')));
    return `
      <div class="tiles">${tiles}</div>
      <div class="card">${rows.map((r) => {
        const p = r.props;
        return `
          <details class="row">
            <summary><span class="what"><span class="t">${esc(p['項目'] || r.title)}</span><span class="m">${esc([p['類型'], p['狀態'], p['日期'] && md(p['日期'].start)].filter(Boolean).join('　'))}</span></span>
            <span class="amt">${esc(p['幣別'] || '')} ${esc(money(p['金額']))}</span></summary>
            <div class="detail">${p['備註'] ? `<p class="note">${esc(p['備註'])}</p>` : ''}<div class="acts"><a class="ic ghost" href="${esc(r.url)}" target="_blank" rel="noopener">在 Notion 改</a></div></div>
          </details>`;
      }).join('')}</div>`;
  }

  function viewInfo(data) {
    const t = data.trip;
    const f = (x, label) => x ? `<dt>${label}</dt><dd><b>${esc(x.flight)}</b>　${esc(md(x.date))} ${esc(weekday(x.date))}　${esc(x.dep)} ${esc(x.from)} → ${esc(x.arr)} ${esc(x.to)}${x.pnr ? `　訂位 ${esc(x.pnr)}` : ''}</dd>` : '';
    return `
      <div class="card">
        <div class="card-h"><h3>這趟</h3><span class="n">${esc(t.format)}</span></div>
        <dl class="kv-list">
          <dt>日期</dt><dd class="mono">${esc(dots(t.start))} – ${esc(dots(t.end))}</dd>
          ${t.city ? `<dt>城市</dt><dd>${esc(t.city)}</dd>` : ''}
          <dt>時區</dt><dd>${esc(t.zone)}${t.currency ? `　幣別 ${esc(t.currency)}` : ''}</dd>
          ${f(t.outbound, '去程')}${f(t.inbound, '回程')}
          ${t.note ? `<dt>備註</dt><dd>${esc(t.note)}</dd>` : ''}
        </dl>
      </div>
      <div class="card">
        <div class="card-h"><h3>完整資料在 Notion</h3></div>
        <p class="info-p">飯店福利、接送規則、電話一覽、編號速查、已決定的事、已知風險都寫在 Notion 主頁，這裡不重抄一份，免得兩邊對不上。</p>
        ${t.notionUrl ? `<p class="info-p"><a class="btn" href="${esc(t.notionUrl)}" target="_blank" rel="noopener">打開 Notion 主頁</a></p>` : ''}
      </div>`;
  }

  // Old-format trips: schema varies, so show whatever fields exist.
  function genericList(rows, what) {
    const dateOf = (r) => { for (const v of Object.values(r.props)) if (v && typeof v === 'object' && v.start) return v.start; return ''; };
    rows.sort((a, b) => String(dateOf(a)).localeCompare(String(dateOf(b))));
    return `<div class="card">${rows.map((r) => {
      const d = dateOf(r);
      const fields = Object.entries(r.props).filter(([, v]) => v !== null && v !== '' && v !== false && !(Array.isArray(v) && !v.length) && typeof v !== 'object' && v !== r.title);
      return `
        <details class="row">
          <summary><span class="time ${d ? '' : 'none'}">${d ? esc(md(d)) : '—'}</span><span class="what"><span class="t">${esc(r.title || '（未命名）')}</span></span></summary>
          <div class="detail">${fields.map(([k, v]) => `<p class="kv"><b>${esc(k)}</b>${esc(v === true ? '是' : v)}</p>`).join('')}
            <div class="acts"><a class="ic ghost" href="${esc(r.url)}" target="_blank" rel="noopener">在 Notion 看</a></div></div>
        </details>`;
    }).join('') || `<div class="empty">沒有${esc(what)}資料</div>`}</div>`;
  }

  function renderTrip(data, meta, tab) {
    const t = data.trip;
    const legacy = t.format !== '手帳';
    const tabs = legacy ? TABS.filter(([k]) => ['plan', 'buy', 'info'].includes(k)) : TABS;
    if (!tabs.some(([k]) => k === tab)) tab = 'plan';
    const s = tripStatus(t);
    const counts = {
      todo: data.todo.filter((r) => !r.props['完成']).length,
      open: data.plan.filter((r) => ['未訂', '待確認'].includes(r.props['狀態'])).length,
    };
    let body;
    if (tab === 'plan') body = legacy ? `<div class="tickets">${ticket(t.outbound, '去程')}${ticket(t.inbound, '回程')}</div><div class="banner">舊格式的行程表，欄位照原本 Notion 顯示，只能看。</div>${genericList(data.plan, '行程')}` : viewPlan(data);
    else if (tab === 'todo') body = viewTodo(data);
    else if (tab === 'buy') body = viewBuy(data, legacy);
    else if (tab === 'cost') body = viewCost(data);
    else body = viewInfo(data);

    $app.innerHTML = `
      <header class="hero">
        <div class="hero-top">
          <a class="back" href="#/" aria-label="回旅程列表">‹ 全部旅程</a>
          <button class="round" id="refresh" type="button" aria-label="重新整理">↻</button>
        </div>
        <p class="eyebrow">${esc(t.city || '')}</p>
        <h1>${esc(t.name)}</h1>
        <p class="sub"><span class="mono">${esc(dots(t.start))} – ${esc(md(t.end))}</span>${s.label ? `<span class="chip st-${s.key}">${esc(s.label)}</span>` : ''}</p>
        ${legacy ? '' : `<p class="pulse"><span><b>${counts.todo}</b> 件待辦</span><span><b>${counts.open}</b> 件還沒訂到</span></p>`}
      </header>
      <main class="page">
        ${syncNote(meta)}
        ${body}
      </main>
      <nav class="tabbar">${tabs.map(([k, label]) => `<a href="#/t/${t.id}/${k}" class="${k === tab ? 'on' : ''}">${label}</a>`).join('')}</nav>`;
    document.title = `${t.name} · 旅行手帳`;
    document.getElementById('refresh').onclick = () => route(true);
  }

  // ---------- router ----------
  let lastKey = '';
  function route(force) {
    const parts = location.hash.replace(/^#\/?/, '').split('/');
    if (parts[0] === 't' && /^[0-9a-f]{32}$/i.test(parts[1] || '')) {
      const key = parts[1];
      const tab = parts[2] || 'plan';
      if (key !== lastKey || force) window.scrollTo(0, 0);
      lastKey = key;
      load(`/api/trip?id=${key}`, (d, meta) => renderTrip(d, meta, tab));
    } else if (!location.hash.startsWith('#day-')) {
      lastKey = '';
      load('/api/trips', renderList);
    }
  }
  // Day pills scroll within the page instead of changing the route.
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-jump]');
    if (!a) return;
    e.preventDefault();
    const el = document.getElementById(a.dataset.jump);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  window.addEventListener('hashchange', () => route());
  route();
})();
