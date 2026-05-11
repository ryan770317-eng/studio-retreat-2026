// Trip data — all stops, used by signup buttons & pack/grab calculator
window.TRIP = {
  meta: {
    dates: "2026.05.14 – 05.20",
    title: "清邁 × 曼谷",
    titleEn: "Chiang Mai × Bangkok",
    subtitle: "就曰設計 × 朋棚創作 2026 員工旅遊",
    subtitleEn: "Annual Studio Retreat",
    departISO: "2026-05-14T07:30:00+08:00",
    crew: 9
  },
  stops: [
    // ───── Day 1 — 5/14 四 ─────
    { id:"d1-arrival",     day:1, time:"10:20", title:"清邁國際機場落地",         titleEn:"Chiang Mai International — Arrival",        kind:"航班 · Arrival",   skipJoin:true, coords:[18.7669, 98.9626] },
    { id:"d1-eastin",      day:1, time:"11:00", title:"Eastin Tan Hotel",            titleEn:"Hotel Check-in",                             kind:"住宿 · Hotel",     skipJoin:true, coords:[18.7944, 98.9676] },
    { id:"d1-baankang",    day:1, time:"12:45", title:"Baan Kang Wat 藝術村",        titleEn:"Baan Kang Wat Artist Village",              kind:"景點 · Village",   grab:80,  coords:[18.7691, 98.9404] },
    { id:"d1-no39",        day:1, time:"14:45", title:"No.39 Café",                  titleEn:"Lakeside Treehouse Café",                   kind:"咖啡 · Café",      grab:0,   coords:[18.7066, 98.9189] },
    { id:"d1-graph",       day:1, time:"16:10", title:"GRAPH Contemporary",          titleEn:"Riverside Coffee & Gallery",                kind:"藝廊 · Gallery",   grab:120, coords:[18.7846, 99.0023] },
    { id:"d1-nimman",      day:1, time:"19:30", title:"尼曼路自由晚餐",              titleEn:"Nimman Free Dinner",                        kind:"自由 · Free time", grab:0, free:true, coords:[18.8000, 98.9686] },

    // ───── Day 2 — 5/15 五 ─────
    { id:"d2-kaomai",      day:2, time:"08:10", title:"Kaomai Lanna Resort",         titleEn:"UNESCO Heritage Tobacco Barns · 1955",      kind:"建築 · Heritage",  grab:450, coords:[18.6300, 98.8900] },
    { id:"d2-rongbom",     day:2, time:"09:00", title:"Café Rong Bom",               titleEn:"Tobacco Barn Café",                         kind:"咖啡 · Café",      grab:0,   coords:[18.6308, 98.8895] },
    { id:"d2-taocha",      day:2, time:"10:30", title:"Tao Cha 茶屋",                 titleEn:"Tao Cha Tea House",                         kind:"茶 · Tea",         grab:0,   coords:[18.6296, 98.8906] },
    { id:"d2-kaomai-lunch",day:2, time:"11:30", title:"Kaomai 餐廳午餐",              titleEn:"Lunch at Kaomai",                           kind:"用餐 · Lunch",     grab:0,   coords:[18.6302, 98.8902] },
    { id:"d2-huenpor",     day:2, time:"13:00", title:"Huen Por Sala Daeng",         titleEn:"27-rai Lanna Wooden Living Museum",         kind:"建築 · Heritage",  grab:50,  coords:[18.6285, 98.8915] },
    { id:"d2-weave",       day:2, time:"14:45", title:"Weave Artisan Society",       titleEn:"Reclaimed Ice Factory · Artisans",          kind:"工藝 · Artisan",   grab:530, coords:[18.7046, 98.9430] },
    { id:"d2-huenphen",    day:2, time:"19:00", title:"Huen Phen Nimman 員工聚餐",   titleEn:"Studio Dinner · Northern Thai",             kind:"聚餐 · Dinner",    grab:120, highlight:true, coords:[18.8009, 98.9676] },
    { id:"d2-akyra",       day:2, time:"21:00", title:"Akyra Manor · Rise Rooftop",  titleEn:"Boutique Hotel Rooftop Bar",                kind:"夜間 · Bonus",     grab:80, bonus:true, coords:[18.8001, 98.9700] },

    // ───── Day 3 — 5/16 六 ─────
    { id:"d4-phalat",      day:3, time:"05:55", title:"Wat Pha Lat 叢林秘境寺廟",     titleEn:"Misty Jungle Temple · Sunrise",             kind:"晨拍 · Sunrise",   grab:200, coords:[18.7993, 98.9326] },
    { id:"d4-maya",        day:3, time:"09:30", title:"MAYA Lifestyle Mall",          titleEn:"MAYA Mall · Late Brunch + Shopping",        kind:"購物 · Shopping",  grab:0,   coords:[18.8009, 98.9669] },
    { id:"d4-srisuphan",   day:3, time:"14:30", title:"Wat Sri Suphan 銀廟",          titleEn:"The Silver Temple",                         kind:"寺廟 · Temple",    grab:120, coords:[18.7796, 98.9893] },
    { id:"d4-ordinary",    day:3, time:"15:35", title:"Ordinary Selected",            titleEn:"Designer JUN's Menswear & Curated Goods",   kind:"選物 · Boutique",  grab:0,   coords:[18.7793, 98.9890] },
    { id:"d4-wualai-mkt",  day:3, time:"16:15", title:"Wualai 週六銀器夜市",          titleEn:"Saturday Walking Street",                   kind:"夜市 · Market",    grab:80,  coords:[18.7800, 98.9885] },

    // ───── Day 4 — 5/17 日 ─────
    { id:"d3-maiiam",      day:4, time:"10:00", title:"MAIIAM 當代美術館",            titleEn:"MAIIAM Contemporary Art Museum",            kind:"美術館 · Museum",  grab:220, coords:[18.7746, 99.0689] },
    { id:"d3-kalm",        day:4, time:"12:30", title:"Kalm Village + 午餐",          titleEn:"Art · Craft · Culture Center",              kind:"文化 · Culture",   grab:120, coords:[18.7867, 98.9853] },
    { id:"d3-dibdee",      day:4, time:"14:10", title:"dibdee.binder",                titleEn:"Hand-bound Notebook Studio",                kind:"選物 · Boutique",  grab:0,   coords:[18.7898, 98.9876] },
    { id:"d3-watumong",    day:4, time:"15:05", title:"Wat Umong 地下隧道森林廟",     titleEn:"Forest Tunnel Temple",                      kind:"寺廟 · Temple",    grab:80,  coords:[18.7763, 98.9484] },
    { id:"d3-spa",         day:4, time:"17:00", title:"Oasis Spa Lanna 古城",         titleEn:"Premium Lanna-Style Villa Spa",             kind:"SPA · Spa",        grab:80, spa:"oasis", coords:[18.7857, 98.9824] },

    // ───── Day 5 — 5/18 一 ─────
    { id:"d5-airport",     day:5, time:"09:00", title:"清邁機場 · 各自登機",          titleEn:"Departure Day",                             kind:"航班 · Departure", skipJoin:true, coords:[18.7669, 98.9626] },

    // ───── Ryan Bangkok ─────
    { id:"r1-dib",         day:6, time:"14:30", title:"Dib Bangkok",                  titleEn:"Bangkok's Major New Contemporary Museum",   kind:"美術館 · Museum",  grab:350, ryan:true, coords:[13.8050, 100.5429] },
    { id:"r2-ortorkor",    day:7, time:"09:00", title:"Or Tor Kor Market",            titleEn:"Premier Fresh Market",                      kind:"市場 · Market",    grab:180, ryan:true, coords:[13.8030, 100.5510] },
    { id:"r2-erawan",      day:7, time:"11:00", title:"四面佛 Erawan Shrine",         titleEn:"Erawan Shrine",                             kind:"宗教 · Shrine",    grab:150, ryan:true, coords:[13.7440, 100.5403] },
    { id:"r2-80below",     day:7, time:"12:30", title:"80below @ Siam Paragon",       titleEn:"Live Oyster Bar",                           kind:"用餐 · Lunch",     grab:0,   ryan:true, coords:[13.7460, 100.5347] },
    { id:"r2-oasis",       day:7, time:"14:30", title:"Oasis Spa Ekkamai",            titleEn:"Oasis Spa Ekkamai",                         kind:"SPA · Spa",        grab:120, ryan:true, spa:"oasis", coords:[13.7320, 100.5870] },
    { id:"r3-fbt",         day:8, time:"12:00", title:"Fewer Better Things",          titleEn:"Curated Menswear & Goods",                  kind:"選物 · Boutique",  grab:80,  ryan:true, coords:[13.7360, 100.5680] }
  ]
};
