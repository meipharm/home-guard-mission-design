// 家園救援任務：六關防災教育互動（防災探索隊）
// 離線、不上傳；本機只儲存勾選與關卡進度，不儲存姓名、住址或電話。
(function () {
  'use strict';

  const app = document.getElementById('app');
  const ITEM = Object.fromEntries(ITEMS.map(i => [i.id, i]));
  const MBY = Object.fromEntries(MISSIONS.map(m => [m.id, m]));
  const MAIN = MISSIONS.filter(m => m.kind === 'mission' && !m.hidden).sort((a, b) => a.no - b.no);
  const GROUPS = [
    { t: '一、整備：先把家和背包準備好', ids: ['p2'] },
    { t: '二、避難與求助：保護自己、找到對的地方', ids: ['m1', 'f1', 'w1', 'a1', 'p3'] },
  ];
  const WM = {};
  MISSIONS.filter(m => !m.hidden).forEach(m => m.words.forEach(w => { (WM[w] = WM[w] || []).includes(m.id) || WM[w].push(m.id); }));
  ITEMS.filter(it => !it.hidden).forEach(it => { if (it.word) { WM[it.word] = WM[it.word] || []; if (!WM[it.word].includes('p2')) WM[it.word].push('p2'); } });

  // ---------- 本機儲存（失敗時照常運作） ----------
  // 自動測試（網址帶 ?test=1）使用獨立的儲存名稱，不會動到孩子真正的進度
  const NS = /[?&]test=1/.test(location.search) ? 'hg.test.' : 'hg.v1.';
  const store = {
    get(k, d) { try { const v = localStorage.getItem(NS + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(NS + k, JSON.stringify(v)); } catch (e) { /* 忽略 */ } },
    remove(k) { try { localStorage.removeItem(NS + k); } catch (e) { /* 忽略 */ } },
  };

  const S = {
    callsign: '救援一號',
    set: Object.assign({ mute: false, sfx: true, amb: true, calm: false, parent: false, showBleed: false }, store.get('settings', {})),
    loadout: store.get('loadout', []).filter(id => ITEMS.some(i => i.id === id && !i.hidden)).slice(0, SLOTS),
    done: store.get('done', {}),
    said: new Set(store.get('said', [])),
    fam: store.get('family', {}),
    times: store.get('times', {}),        // 每關第一次完成花的秒數
    doneAt: store.get('doneAt', {}),      // 每關第一次完成的時間點
    note: store.get('note', ''),          // 孩子寫的心得（只存在本機）
    timing: null,
    heard: new Set(),
    points: [],
    vocabFilter: 'all',
    family: { first: '', second: '', contact: '' },
    cur: null,
  };
  const save = () => { store.set('settings', S.set); store.set('loadout', S.loadout); store.set('done', S.done); store.set('said', [...S.said]); store.set('family', S.fam); store.set('times', S.times); store.set('doneAt', S.doneAt); store.set('note', S.note); };
  const applySettings = () => document.body.classList.toggle('calm', !!S.set.calm);
  // 計時：從按下「開始任務」起，只累計頁面在前景的時間（切到別的分頁不算）
  setInterval(() => { if (S.timing && !document.hidden) S.timing.sec++; }, 1000);

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const svg24 = body => `<svg viewBox="0 0 24 24" aria-hidden="true">${body}</svg>`;
  const icon = (id, label) => svg24(ITEM[id].icon) + (label ? `<span>${label}</span>` : '');
  const mIcon = m => svg24(m.icon);
  const timeline = steps => `<ol class="timeline">${steps.map(s => `<li><span>${esc(s)}</span></li>`).join('')}</ol>`;
  const SPEAKER = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 6h3l4-3v10l-4-3H2z"/><path d="M11 5c1.5 1.5 1.5 4.5 0 6" stroke="currentColor" fill="none" stroke-width="1.4"/></svg>';
  const now = () => { const d = new Date(); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
  const $ = sel => app.querySelector(sel);
  const $$ = sel => app.querySelectorAll(sel);
  const doneCount = () => MAIN.filter(m => S.done[m.id]).length;

  function toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => t.classList.remove('show'), 3500);
  }

  // ---------- 提示音效：柔和的短音，可在設定關閉；失敗時安靜略過 ----------
  let AC = null;
  const SFX = {
    ok: [[660, 0, 0.12], [880, 0.12, 0.2]],
    no: [[330, 0, 0.16], [262, 0.14, 0.2]],
    found: [[740, 0, 0.09], [988, 0.09, 0.12]],
    hint: [[520, 0, 0.1], [520, 0.14, 0.1]],
    win: [[523, 0, 0.14], [659, 0.14, 0.14], [784, 0.28, 0.14], [1047, 0.42, 0.34]],
    stamp: [[392, 0, 0.1], [587, 0.1, 0.24]],
  };
  function sfx(kind) {
    if (!S.set.sfx) return;
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      if (AC.state === 'suspended') AC.resume();
      const t = AC.currentTime;
      (SFX[kind] || []).forEach(([f, d, l]) => {
        const o = AC.createOscillator(), g = AC.createGain();
        o.type = 'sine'; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t + d);
        g.gain.exponentialRampToValueAtTime(0.1, t + d + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + d + l);
        o.connect(g); g.connect(AC.destination);
        o.start(t + d); o.stop(t + d + l + 0.03);
      });
    } catch (e) { /* 沒有音效也能玩 */ }
  }

  // ---------- 情境環境音：用 Web Audio 即時合成，音量很小、沒有爆炸或尖銳聲、可在設定關閉 ----------
  let AMB = null, ambKind = null;
  function ambStop() {
    ambKind = null;
    if (!AMB) return;
    const a = AMB; AMB = null;
    try { a.stop(); } catch (e) { /* 忽略 */ }
  }
  function ambStart(kind) {
    if (kind === ambKind) return;          // 同一種聲音不重複啟動（畫面重繪不會讓聲音中斷）
    ambStop();
    if (!kind || !S.set.amb) return;
    ambKind = kind;
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      if (AC.state === 'suspended') AC.resume();
      const nodes = [], timers = [];
      const master = AC.createGain(); master.gain.value = 0; master.connect(AC.destination);
      master.gain.linearRampToValueAtTime(1, AC.currentTime + 0.8);
      const noiseSrc = () => { const b = AC.createBuffer(1, AC.sampleRate * 2, AC.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; const s = AC.createBufferSource(); s.buffer = b; s.loop = true; return s; };
      const noise = (type, freq, q, gain) => { const s = noiseSrc(), f = AC.createBiquadFilter(), g = AC.createGain(); f.type = type; f.frequency.value = freq; f.Q.value = q; g.gain.value = gain; s.connect(f); f.connect(g); g.connect(master); s.start(); nodes.push(s); return g; };
      const osc = (type, freq, gain) => { const o = AC.createOscillator(), g = AC.createGain(); o.type = type; o.frequency.value = freq; g.gain.value = gain; o.connect(g); g.connect(master); o.start(); nodes.push(o); return { o, g }; };
      const lfo = (param, rate, depth) => { const l = AC.createOscillator(), g = AC.createGain(); l.frequency.value = rate; g.gain.value = depth; l.connect(g); g.connect(param); l.start(); nodes.push(l); };
      const beep = (freq, at, dur, vol) => { const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime + at; o.type = 'sine'; o.frequency.value = freq; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05); };
      if (kind === 'quake') { const g = noise('lowpass', 110, 0.7, 0.45); lfo(g.gain, 5, 0.22); const s = osc('sine', 48, 0.32); lfo(s.g.gain, 7, 0.18); }
      if (kind === 'fire') { const g = noise('bandpass', 2200, 0.6, 0.05); lfo(g.gain, 11, 0.035); noise('lowpass', 300, 0.6, 0.05); const ring = () => [0, 0.22, 0.44].forEach(t => beep(1900, t, 0.12, 0.035)); ring(); timers.push(setInterval(ring, 3200)); }
      if (kind === 'rain') { noise('highpass', 2600, 0.5, 0.06); const w = noise('lowpass', 420, 0.5, 0.06); lfo(w.gain, 0.2, 0.03); }
      if (kind === 'siren') { const s = osc('sine', 440, 0.028); lfo(s.o.frequency, 0.22, 90); }
      if (kind === 'crowd') { const g = noise('bandpass', 520, 0.8, 0.05); lfo(g.gain, 0.7, 0.02); noise('lowpass', 250, 0.5, 0.02); }
      AMB = { stop() {
        timers.forEach(clearInterval);
        try { master.gain.cancelScheduledValues(AC.currentTime); master.gain.setValueAtTime(master.gain.value, AC.currentTime); master.gain.linearRampToValueAtTime(0, AC.currentTime + 0.3); } catch (e) { /* 忽略 */ }
        setTimeout(() => { nodes.forEach(n => { try { n.stop(); } catch (e) { /* 忽略 */ } }); try { master.disconnect(); } catch (e) { /* 忽略 */ } }, 450);
      } };
    } catch (e) { /* 沒有音效也能玩 */ }
  }
  // 依關卡與步驟決定環境音
  function ambFor(m, c, st) {
    if (m.id === 'm1') return SC.classroomShake(c) ? 'quake' : null;
    if (m.id === 'f1') return 'fire';
    if (m.id === 'w1') return 'rain';
    if (m.id === 'a1') return c.i === 0 ? 'siren' : null;
    if (m.id === 'p3') return (st.type !== 'map' && c.i >= 3) ? 'crowd' : null;
    return null;
  }

  // ---------- 發音：瀏覽器內建語音，不錄音；任何失敗都不影響遊戲 ----------
  function speak(text, slow) {
    if (S.set.mute) { toast('語音已關閉，可在「設定」打開。'); return; }
    try {
      if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') { toast('這個瀏覽器不支援發音，請看音節拆分唸唸看。'); return; }
      const voices = speechSynthesis.getVoices();
      const voice = voices.find(v => /^en[-_]US/i.test(v.lang)) || voices.find(v => /^en/i.test(v.lang));
      if (voices.length && !voice) { toast('這台電腦沒有英文語音，請看音節拆分唸唸看。'); return; }
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      if (voice) u.voice = voice;
      u.rate = slow ? 0.6 : 0.95;
      u.onerror = () => toast('目前無法播放發音，請看音節拆分唸唸看。');
      speechSynthesis.cancel();
      speechSynthesis.speak(u);
      if (WORDS[text]) S.heard.add(text);
    } catch (e) { toast('目前無法播放發音，請看音節拆分唸唸看。'); }
  }
  try { if ('speechSynthesis' in window) speechSynthesis.getVoices(); } catch (e) { /* 忽略 */ }

  const sayBtns = text => `<button type="button" class="say" data-say="${esc(text)}" aria-label="播放 ${esc(text)} 發音">${SPEAKER}聽</button><button type="button" class="say" data-say="${esc(text)}" data-slow="1" aria-label="慢速播放 ${esc(text)}">慢</button>`;
  const wordChip = w => `<span class="word"><b>${esc(w)}</b><span class="syl">${esc(WORDS[w] ? WORDS[w].syl : w)}</span>${sayBtns(w)}</span>`;

  document.addEventListener('click', e => {
    const say = e.target.closest('[data-say]');
    if (say) { speak(say.dataset.say, !!say.dataset.slow); return; }
    const go = e.target.closest('[data-go]');
    if (go) { S.cur = null; show(go.dataset.go); }
  });

  const ROUTES = {};
  function show(name, arg) {
    if (name !== 'step') ambStop();
    document.querySelectorAll('.g-nav [data-go]').forEach(b => b.setAttribute('aria-current', String(b.dataset.go === name)));
    ROUTES[name](arg);
    window.scrollTo(0, 0);
  }

  const EMBLEM = `<svg viewBox="0 0 200 220" role="img" aria-label="防災探索隊徽章">
    <path d="M100 8 L184 40 V112 C184 162 146 196 100 212 C54 196 16 162 16 112 V40 Z" fill="#0b1411" stroke="#3ddc84" stroke-width="5"/>
    <path d="M100 26 L166 51 V112 C166 152 137 180 100 193 C63 180 34 152 34 112 V51 Z" fill="none" stroke="#2a6b49" stroke-width="2" stroke-dasharray="6 5"/>
    <path d="M84 62 H116 V94 H148 V126 H116 V158 H84 V126 H52 V94 H84 Z" fill="#3ddc84"/>
    <polyline points="44,110 74,110 84,96 96,128 106,104 114,110 156,110" fill="none" stroke="#0b1411" stroke-width="5" stroke-linejoin="round"/></svg>`;

  // =====================================================================
  // 場景插圖（每一步都有畫面；全部是內建向量圖，沒有外部圖檔）
  // =====================================================================
  const G = '#3ddc84', D = '#2a6b49', R = '#ff5d52', A = '#f2b33d', B = '#4a9ad9', INK = '#e4ebe7', PANEL = '#10211a', DARK = '#08100c';
  const T = (x, y, s, fill, size, anchor) => `<text x="${x}" y="${y}" fill="${fill}" font-family="Bahnschrift,Microsoft JhengHei,sans-serif" font-size="${size || 12}" text-anchor="${anchor || 'middle'}">${s}</text>`;
  const person = (x, y, s, col, extra) => `<g transform="translate(${x} ${y}) scale(${s || 1})" fill="none" stroke="${col || G}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="0" cy="-30" r="7"/><path d="M0 -23 V-4 M0 -18 L-9 -8 M0 -18 L9 -8 M0 -4 L-7 12 M0 -4 L7 12"/>${extra || ''}</g>`;
  const helmetOn = '<path d="M-8 -32 a8 8 0 0 1 16 0z" fill="#3ddc84" stroke="none"/>';
  const phone = (x, y, label, col) => `<g transform="translate(${x} ${y})"><rect x="-22" y="-38" width="44" height="76" rx="7" fill="#0b1411" stroke="${col || G}" stroke-width="2.5"/><rect x="-16" y="-28" width="32" height="48" fill="${PANEL}"/>${T(0, 3, label || '119', col || G, 18)}<circle cx="0" cy="30" r="3" fill="${col || G}"/></g>`;
  const ring = (cx, cy, r, col) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${col}" stroke-width="2" stroke-dasharray="5 4"/>`;
  const DEFS = `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#12302a"/><stop offset="1" stop-color="#07100c"/></linearGradient>
    <linearGradient id="storm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c2b36"/><stop offset="1" stop-color="#0a1117"/></linearGradient>
    <linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2d6f93" stop-opacity=".85"/><stop offset="1" stop-color="#1a3d55" stop-opacity=".9"/></linearGradient></defs>`;
  const wrap = (inner, cls) => `<svg viewBox="0 0 400 220" class="${cls || ''}" role="img" aria-label="情境畫面">${DEFS}${SC.defs}${inner}</svg>`;

  // 可點選的區塊
  function zonesSVG(st, c) {
    if (!c || c.solved) return '';
    return st.zones.map(z => `<g class="zone" data-zone="${z.id}" tabindex="0" role="button" aria-label="${esc(z.label)}">
      <rect x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}"/>${T(z.x + z.w / 2, st.map === 'leg' ? z.y - 6 : z.y + z.h / 2 + 5, esc(z.label), G, st.map === 'leg' ? 18 : 13)}</g>`).join('');
  }

  // ---- 防災背包 ----
  function bagScene(c) {
    const i = c ? c.i : 0;
    const bag = `<g fill="none" stroke="${G}" stroke-width="2.6" stroke-linejoin="round"><rect x="132" y="58" width="96" height="116" rx="20" fill="${PANEL}"/><path d="M158 58v-12h44v12"/><rect x="150" y="112" width="60" height="44" rx="8"/><path d="M150 134h60" stroke="${D}"/><path d="M142 78c-8 0-12 6-12 14v40" stroke="${D}"/><path d="M218 78c8 0 12 6 12 14v40" stroke="${D}"/><rect x="136" y="84" width="88" height="6" fill="${A}" stroke="none" opacity=".75"/></g>`;
    const wall = `<rect x="0" y="0" width="400" height="220" fill="url(#sky)"/><path d="M0 184h400" stroke="${D}" stroke-width="2"/><rect x="300" y="30" width="70" height="154" fill="none" stroke="${D}" stroke-width="2.5"/><circle cx="360" cy="112" r="3" fill="${D}"/><path d="M300 190h70v10h-70z" fill="${D}"/>`;
    const shoes = `<g fill="none" stroke="${i === 3 ? A : G}" stroke-width="2.4" stroke-linejoin="round"><path d="M268 184v-14l16-4 8 6h14l8 6v6z"/><path d="M60 184v-14l16-4 8 6h14l8 6v6z"/></g>`;
    const hook = `<g><path d="M96 40h30" stroke="${D}" stroke-width="3"/><rect x="62" y="56" width="62" height="40" rx="3" fill="${PANEL}" stroke="${i === 2 ? A : G}" stroke-width="2.2"/><path d="M70 68h30M70 78h38M70 88h22" stroke="${D}" stroke-width="2"/>${T(93, 52, '緊急聯絡卡', G, 10)}</g>`;
    let over = '';
    if (i === 0) over = phone(322, 100, '119', R);
    if (i === 1) over = phone(322, 100, '110', B);
    if (i === 2) over = '';
    if (i === 4) over = `<g transform="translate(322 130)"><rect x="-14" y="-24" width="28" height="44" rx="6" fill="#0b1411" stroke="${A}" stroke-width="2.4"/><rect x="-10" y="-34" width="20" height="9" rx="2" fill="none" stroke="${A}" stroke-width="2"/><path d="M-6 -6h12M0 -12v12" stroke="${A}" stroke-width="2"/></g>${person(250, 168, 0.9, INK)}${T(250, 52, '家長協助', A, 12)}`;
    return wrap(wall + hook + bag + shoes + over + T(180, 204, 'GO BAG', D, 12));
  }

  // ---- 教室：地震 ----
  function classroomScene(zones, c) {
    const i = c ? c.i : 0;
    const shaking = !c || (i <= 3 && !c.solved);
    const after = i >= 4;
    const books = `<g fill="none" stroke="${G}" stroke-width="2"><rect x="300" y="36" width="80" height="130"/><path d="M300 78h80M300 120h80" stroke="${D}"/><rect x="306" y="44" width="10" height="30" ${shaking ? 'transform="rotate(14 311 74)"' : ''}/><rect x="320" y="48" width="10" height="26"/><rect x="336" y="46" width="12" height="28" ${shaking ? 'transform="rotate(-16 342 74)"' : ''}/></g>`;
    const win = `<g fill="none" stroke="${G}" stroke-width="2.2"><rect x="22" y="16" width="104" height="68" fill="#17384a" fill-opacity=".6"/><path d="M74 16v68M22 50h104" stroke="${D}"/></g>`;
    const door = `<g fill="none" stroke="${G}" stroke-width="2.2"><rect x="220" y="46" width="60" height="126" fill="${PANEL}"/><circle cx="268" cy="112" r="3" fill="${G}"/></g>${T(250, 40, 'EXIT', G, 11)}`;
    const board = `<rect x="140" y="26" width="76" height="36" fill="${PANEL}" stroke="${D}" stroke-width="2"/><path d="M148 38h40M148 48h56" stroke="${D}" stroke-width="2"/>`;
    const desk = `<g fill="none" stroke="${G}" stroke-width="2.6" stroke-linecap="round"><path d="M44 128h162"/><path d="M50 128v58M200 128v58"/><path d="M56 154h140" stroke="${D}"/></g>`;
    const teacher = person(172, 118, 1, A, '');
    const bubble = after ? `<g><rect x="108" y="34" width="116" height="26" rx="8" fill="#0b1411" stroke="${A}" stroke-width="2"/>${T(166, 52, '大家冷靜，聽我指示', A, 11)}</g>` : '';
    const students = person(110, 150, 0.8, INK) + (i >= 1 && i <= 3 ? '' : person(140, 150, 0.8, INK));
    return wrap(`<rect width="400" height="220" fill="url(#sky)"/><path d="M0 188h400" stroke="${D}" stroke-width="2"/>${win}${board}${books}${door}${desk}${teacher}${bubble}
      ${i === 1 ? `<g stroke="${R}" stroke-width="2.4" fill="none" stroke-linecap="round"><path d="M10 100l8 6-8 6M392 100l-8 6 8 6"/></g>` : ''}${T(200, 210, 'CLASSROOM', D, 11)}${zones || ''}`, shaking ? 'shake' : '');
  }

  // ---- 走廊：火災 ----
  function corridorScene(zones, c) {
    const i = c ? c.i : 0, b = c ? c.branch : null;
    const smoke = b === 'B' ? `<g class="smoke" fill="#9aa8a1"><ellipse cx="200" cy="96" rx="74" ry="40" fill-opacity=".55"/><ellipse cx="150" cy="120" rx="64" ry="34" fill-opacity=".45"/><ellipse cx="256" cy="130" rx="70" ry="36" fill-opacity=".5"/><ellipse cx="200" cy="170" rx="120" ry="28" fill-opacity=".35"/></g><g stroke="${A}" fill="none" stroke-width="2.4" opacity=".8"><path d="M196 120c-6-12 8-14 0-26 14 6 12 16 6 26z"/></g>`
      : i === 0 ? `<g class="smoke" fill="#9aa8a1"><ellipse cx="200" cy="100" rx="60" ry="28" fill-opacity=".22"/></g>` : '';
    return wrap(`<rect width="400" height="220" fill="${DARK}"/>
      <polygon points="0,6 130,70 130,128 0,220" fill="${PANEL}" stroke="${D}" stroke-width="2"/>
      <polygon points="400,6 270,70 270,128 400,220" fill="${PANEL}" stroke="${D}" stroke-width="2"/>
      <polygon points="0,220 130,128 270,128 400,220" fill="#0d1a14" stroke="${D}" stroke-width="2"/>
      <rect x="130" y="70" width="140" height="58" fill="#0c1511" stroke="${D}" stroke-width="2"/>
      <rect x="164" y="80" width="72" height="48" fill="none" stroke="${G}" stroke-width="2.2"/><circle cx="226" cy="106" r="2.5" fill="${G}"/>
      <rect x="14" y="62" width="70" height="120" fill="none" stroke="${R}" stroke-width="2" stroke-dasharray="6 4"/><path d="M49 62v120M14 122h70" stroke="${D}" stroke-width="2"/>${T(49, 56, 'ELEVATOR', R, 10)}
      <rect x="300" y="56" width="86" height="130" fill="none" stroke="${G}" stroke-width="2.2"/><path d="M306 176h20v-16h20v-16h20v-16h20v-16" fill="none" stroke="${G}" stroke-width="2.6"/>
      <rect x="312" y="30" width="62" height="20" rx="3" fill="${G}"/>${T(343, 45, 'EXIT', '#04130b', 13)}
      <g transform="translate(200 24)"><path d="M-9 8a9 9 0 0 1 18 0v6h-18z" fill="none" stroke="${A}" stroke-width="2.2"/><path d="M-14 4l-4-4M14 4l4-4" stroke="${A}" stroke-width="2"/></g>
      ${smoke}${person(200, 196, 0.9, INK)}${zones || ''}`, '');
  }

  // ---- 街道：颱風與淹水 ----
  function floodScene(zones, c) {
    const i = c ? c.i : 0;
    const rain = Array.from({ length: 18 }, (_, k) => `<path d="M${14 + k * 22} ${6 + (k % 4) * 10}l-6 16" stroke="#4a6d8c" stroke-width="1.6" opacity=".6"/>`).join('');
    if (i === 0) {
      return wrap(`<rect width="400" height="220" fill="url(#storm)"/><g class="rain">${rain}</g>
        <path d="M0 186h400" stroke="${D}" stroke-width="2"/><g fill="none" stroke="${G}" stroke-width="2.2"><path d="M40 186V90h70v96"/><path d="M290 186V60h80v126"/><rect x="304" y="76" width="14" height="14"/><rect x="330" y="76" width="14" height="14"/><rect x="56" y="104" width="14" height="14"/></g>
        <g transform="translate(200 94)"><rect x="-44" y="-40" width="88" height="68" rx="8" fill="#0b1411" stroke="${A}" stroke-width="2.5"/>${T(0, -14, '颱風警報', A, 15)}${T(0, 6, 'TYPHOON WARNING', A, 9)}<path d="M-44 20l-10 18M44 20l10 18" stroke="${A}" stroke-width="2"/></g>
        <path d="M24 56q40-16 70 0M300 36q40-12 66 4" fill="none" stroke="#4a6d8c" stroke-width="2.4" stroke-linecap="round"/>${T(200, 208, '在家不外出', G, 13)}${zones || ''}`);
    }
    return wrap(`<rect width="400" height="220" fill="url(#storm)"/><g class="rain">${rain}</g>
      <path d="M0 150h400" stroke="${D}" stroke-width="2"/>
      <g fill="none" stroke="${G}" stroke-width="2.2"><path d="M296 134V30h92v104z" fill="${PANEL}"/><rect x="308" y="44" width="16" height="16" fill="${A}" fill-opacity=".5"/><rect x="336" y="44" width="16" height="16" fill="${A}" fill-opacity=".5"/><rect x="364" y="44" width="16" height="16" fill="${A}" fill-opacity=".5"/><rect x="308" y="74" width="16" height="16" fill="${A}" fill-opacity=".5"/>${T(342, 120, '避難處所', G, 12)}</g>
      <path d="M8 180V120a46 46 0 0 1 92 0v60z" fill="#050a08" stroke="${D}" stroke-width="2.4"/>${T(54, 146, '地下道', D, 12)}<rect x="8" y="160" width="92" height="22" fill="url(#water)"/>
      <path d="M0 150h110v62H0z" fill="none"/><rect x="108" y="150" width="174" height="62" fill="url(#water)"/><path d="M118 168q14-8 28 0t28 0t28 0t28 0t28 0" fill="none" stroke="#9ad0ea" stroke-width="2" opacity=".7"/>
      <rect x="290" y="150" width="108" height="62" fill="url(#water)"/><path d="M298 172q14-8 28 0t28 0t28 0" fill="none" stroke="#9ad0ea" stroke-width="2"/>${T(344, 196, '河', '#9ad0ea', 12)}
      <path d="M190 4v110" stroke="${D}" stroke-width="4"/><path d="M190 30l46 6 26 34" fill="none" stroke="${A}" stroke-width="2.4" stroke-linecap="round"/><path d="M262 70l-6 8 8 2-6 10" fill="none" stroke="${A}" stroke-width="2.4" stroke-linecap="round"/>
      ${person(150, 148, 0.9, INK)}${zones || ''}`);
  }

  // ---- 防空演練：依步驟切換（柔和、沒有爆炸或驚嚇畫面） ----
  function sirenScene(c) {
    const i = c ? c.i : 0;
    const tag = `<g><rect x="132" y="6" width="136" height="22" rx="11" fill="#0b1411" stroke="${A}" stroke-width="2"/>${T(200, 22, '模擬演練 DRILL', A, 12)}</g>`;
    const base = `<rect width="400" height="220" fill="url(#sky)"/>${tag}`;
    if (i === 0) return wrap(base + `<g fill="none" stroke="${G}" stroke-width="2.2"><path d="M30 190V110h50v80M100 190V80h60v110M250 190V96h50v94M310 190V124h60v66"/><path d="M0 190h400" stroke="${D}"/><path d="M186 120h14l20-16v52l-20-16h-14z"/></g><g fill="none" stroke="${B}" stroke-width="2" opacity=".8"><path d="M232 118q10 8 0 16M244 110q18 16 0 32"/></g>${person(210, 190, 0.8, INK)}${T(200, 212, '先一聲長鳴，再兩聲短鳴，重複 3 次', G, 11)}`);
    if (i === 1) return wrap(base + `<g fill="none" stroke="${G}" stroke-width="2.2"><rect x="60" y="48" width="280" height="86"/><path d="M60 92h280"/><rect x="60" y="134" width="280" height="62" fill="${PANEL}" stroke="${A}"/><path d="M128 134v34h20v-14h20" stroke="${A}"/><rect x="82" y="60" width="26" height="20" fill="#17384a"/><rect x="292" y="60" width="26" height="20" fill="#17384a"/></g>${T(200, 182, '地下室', A, 14)}<g fill="none" stroke="${R}" stroke-width="2"><rect x="214" y="100" width="34" height="30" stroke-dasharray="5 4"/>${T(231, 119, '電梯', R, 11)}</g>${person(140, 128, 0.7, INK)}${person(168, 186, 0.7, INK)}`);
    if (i === 2) return wrap(base + `<g fill="none" stroke="${G}" stroke-width="2.2"><rect x="30" y="48" width="340" height="140"/><rect x="48" y="62" width="64" height="48" fill="#17384a" fill-opacity=".5"/><path d="M80 62v48M48 86h64"/></g><g stroke="${R}" fill="none" stroke-width="2" stroke-dasharray="5 4"><path d="M48 62l64 48M112 62l-64 48" opacity=".6"/></g>${T(80, 128, '離窗戶遠', R, 11)}<g fill="none" stroke="${G}" stroke-width="2.4"><circle cx="300" cy="136" r="7"/><path d="M300 143v18l-12 16M300 161l12 16M300 150l-10-6M300 150l10-6"/></g>${T(300, 202, '靠牆坐下、雙手抱頭', G, 11)}`);
    if (i === 3) return wrap(base + `<path d="M0 170h400" stroke="${D}" stroke-width="2"/><path d="M130 170q70 24 140 0" fill="none" stroke="${G}" stroke-width="2.4"/><g stroke="${G}" stroke-width="2.4" fill="none" stroke-linecap="round"><circle cx="196" cy="172" r="6"/><path d="M202 174h36M214 174l4 10M232 174l4 10M190 176l-14-8M190 178l-14 2"/></g>${T(200, 208, '空曠處：找堅固掩蔽，沒有就選低處趴下', G, 11)}`);
    if (i === 4) return wrap(base + `<g fill="none" stroke="${G}" stroke-width="2.2"><path d="M20 190V90h80v100M290 190V60h90v130"/><rect x="304" y="120" width="62" height="70" fill="${PANEL}" stroke="${B}" stroke-width="2.6"/><path d="M0 190h400" stroke="${D}"/></g><rect x="308" y="96" width="54" height="18" rx="3" fill="${B}"/>${T(335, 110, '防空避難', '#04130b', 11)}${person(230, 190, 0.9, INK)}<path d="M246 160h40" stroke="${A}" stroke-width="2.4" stroke-linecap="round" marker-end="url(#ar)"/><path d="M280 154l8 6-8 6" fill="none" stroke="${A}" stroke-width="2.4"/>`);
    if (i === 5) return wrap(base + `<g fill="none" stroke="${G}" stroke-width="2.6" stroke-linecap="round"><path d="M70 40v150" stroke="${D}" stroke-width="4"/><circle cx="130" cy="120" r="9"/><path d="M130 129v26l-18 20M130 155l20 20M130 138l-12-14M130 138l12-14"/><path d="M122 112q8-14 16 0" stroke="${A}"/></g>${T(260, 100, '身體縮小、雙手抱頭', G, 14)}${T(260, 126, '嘴巴微張、保持姿勢', G, 14)}${T(260, 152, '在室內靠牆坐下；在戶外趴下', D, 12)}`);
    return wrap(base + `<g fill="none" stroke="${G}" stroke-width="2.4"><path d="M170 120h14l22-18v56l-22-18h-14z"/><path d="M60 120h80M60 140h80" stroke="${D}"/><path d="M218 150l10 10 20-26" stroke="${G}" stroke-width="3.2"/></g>${T(200, 190, '持續長聲 90 秒 = 解除警報', G, 13)}${T(200, 210, '聽到解除聲，並聽大人指示後才解除', D, 11)}`);
  }

  // ---- 小鎮：集結點與走散 ----
  function townBase() {
    return `<rect width="400" height="220" fill="url(#sky)"/>
      <g stroke="#24332d" stroke-width="14" fill="none"><path d="M0 110H400M220 0V220M110 110V220"/></g>
      <g fill="none" stroke="${D}" stroke-width="2"><path d="M30 60l30-24 30 24v40h-60z"/><rect x="45" y="78" width="14" height="22"/></g>${T(60, 30, '我們家', G, 13)}
      <rect x="236" y="18" width="116" height="70" fill="rgba(61,220,132,0.08)"/><g fill="${D}"><circle cx="260" cy="45" r="8"/><circle cx="330" cy="60" r="9"/><circle cx="300" cy="35" r="7"/></g>
      <rect x="118" y="124" width="92" height="10" fill="${D}"/><path d="M122 124v-12h84v12" fill="none" stroke="${D}" stroke-width="2"/>
      <rect x="248" y="150" width="38" height="24" fill="none" stroke="${R}" stroke-width="2"/><path d="M262 150v-8h10v8" stroke="${R}" fill="none"/>
      <rect x="318" y="146" width="76" height="66" fill="rgba(61,220,132,0.05)"/><ellipse cx="356" cy="182" rx="28" ry="18" fill="none" stroke="${D}" stroke-width="2"/>`;
  }
  function crowdScene(c) {
    const i = c ? c.i : 3;
    const crowd = [40, 80, 120, 290, 330, 365].map((x, k) => person(x, 184, 0.85 + (k % 2) * 0.1, D)).join('');
    const kid = `<g>${person(200, 184, 1, A)}<circle cx="200" cy="110" r="22" fill="none" stroke="${A}" stroke-width="2" stroke-dasharray="4 4"/>${T(226, 98, '？', A, 22)}</g>`;
    const base = `<rect width="400" height="220" fill="url(#sky)"/><path d="M0 188h400" stroke="${D}" stroke-width="2"/>`;
    if (i === 3) return wrap(base + crowd + kid + T(200, 18, '人好多，找不到爸爸媽媽了…', INK, 13) + T(200, 208, '留在安全的地方，主動找可靠的大人', G, 12));
    if (i === 4) return wrap(base + `${person(300, 184, 1.05, R)}${T(300, 120, '陌生人', R, 12)}<path d="M268 96l-12 8" stroke="${R}" stroke-width="2"/><g>${person(96, 184, 1.1, G)}<rect x="78" y="126" width="36" height="10" rx="2" fill="${G}"/>${T(96, 118, '穿制服的服務人員', G, 12)}</g>${person(200, 184, 0.95, A)}<path d="M190 150l-60 0M130 144l-8 6 8 6" fill="none" stroke="${G}" stroke-width="3" stroke-linecap="round"/><path d="M212 150l50 0" stroke="${R}" stroke-width="3" stroke-dasharray="6 5"/>${T(236, 176, '✗', R, 22)}${T(150, 176, '✓', G, 22)}`);
    if (i === 5) return wrap(base + `<rect x="230" y="110" width="130" height="30" fill="${PANEL}" stroke="${G}" stroke-width="2.2"/>${T(295, 130, '服務台 INFO', G, 13)}${person(190, 184, 1, A)}${person(300, 106, 1, G)}<rect x="30" y="30" width="170" height="64" rx="10" fill="#0b1411" stroke="${A}" stroke-width="2"/>${T(115, 54, '我是誰・我在哪裡', A, 13)}${T(115, 76, '發生什麼事・需要幫忙', A, 13)}`);
    return wrap(base + phone(130, 100, '110', B) + phone(270, 100, '119', R) + T(130, 170, '警察', B, 14) + T(270, 170, '火災・救護', R, 14) + T(200, 204, '模擬練習，不會真的撥打', INK, 11));
  }
  function townScene(zones, c, st) {
    if (st && st.type !== 'map') return crowdScene(c);
    return wrap(townBase() + (zones || ''));
  }

  // 可檢查的地方：顯示「?」記號，點到後顯示名稱
  const spotMark = (s, col) => `<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="rgba(61,220,132,0.14)" stroke="${col || G}" stroke-width="2"/><text class="lbl" x="${s.x + s.w / 2}" y="${s.y + s.h - 6}" fill="${col || G}" font-size="11" text-anchor="middle" font-family="Microsoft JhengHei,sans-serif">✓ ${esc(s.t)}</text>`;
  const huntZone = (s, i, c) => {
    const found = c.found.has(i);
    return `<g class="zone hot ${c.hint && !found ? 'hinted' : ''} ${found ? 'found' : ''}" data-spot="${i}" tabindex="0" role="button" aria-label="${found ? esc(s.t) : '檢查點 ' + (i + 1)}"><rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}"/>${found ? spotMark(s) : `<circle class="q" cx="${s.x + Math.min(14, s.w / 2)}" cy="${s.y + 14}" r="10"/><text class="qt" x="${s.x + Math.min(14, s.w / 2)}" y="${s.y + 19}" text-anchor="middle">?</text>`}</g>`;
  };
  const safeZone = (s, i) => `<g class="zone hot" data-safe="${i}" tabindex="0" role="button" aria-label="這裡是安全的地方"><rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}"/></g>`;

  // ---- 現場評估：危險在哪裡 ----
  function hazardScene(c, st) {
    const i = c ? c.i : 0;
    const spots = MBY.s1.steps[0].spots, safe = MBY.s1.steps[0].safe;
    const active = c && i === 0 && !c.solved;
    const hot = active ? spots.map((s, idx) => huntZone(s, idx, c)).join('') + safe.map(safeZone).join('')
      : (c ? spots.map(s => spotMark(s, R)).join('') : '');
    return wrap(`<rect width="400" height="220" fill="${DARK}"/><path d="M0 196h400" stroke="${D}" stroke-width="2"/>
      <g fill="none" stroke="${D}" stroke-width="2"><rect x="30" y="30" width="96" height="90"/><path d="M30 50l96 0" /><path d="M40 120l70-60" stroke="${A}"/></g><path d="M36 100l20 14 12-8 18 10" fill="none" stroke="${A}" stroke-width="2"/>
      <g fill="none" stroke="${A}" stroke-width="2.6" stroke-linecap="round"><path d="M236 4v30q40 8 60 30t60 12"/></g><path d="M338 70l-8 10 10 2-8 12" fill="none" stroke="${A}" stroke-width="2.6" stroke-linecap="round"/>
      <g fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"><circle cx="204" cy="150" r="7"/><path d="M211 152h40M222 152l4 10M240 152l4 10M198 154l-14 4M198 156l-14 8"/></g>${T(222, 138, '有人跌倒', INK, 12)}
      <g fill="none" stroke="${G}" stroke-width="2"><path d="M100 188l12-14 10 16M130 190l14-12 8 14M150 186l10-14 12 14M114 176l6 8"/></g>
      <ellipse cx="336" cy="172" rx="42" ry="14" fill="url(#water)"/>
      ${hot}${i >= 1 ? ring(204, 150, 82, A) + T(204, 66, '安全距離', A, 12) : ''}`);
  }

  // ---- 包紮 / 傷患 ----
  function handScene(c) {
    const i = c ? c.i : 0;
    const drops = (n, x0, y0) => Array.from({ length: n }, (_, k) => `<circle cx="${x0 + k * 9}" cy="${y0 + (k % 2) * 9}" r="3.5" fill="${R}"/>`).join('');
    if (i === 0) {
      return wrap(`<rect width="400" height="220" fill="url(#sky)"/><path d="M0 190h400" stroke="${D}" stroke-width="2"/><path d="M150 40l30 80-14 70M180 120l40 70" fill="none" stroke="${G}" stroke-width="3" stroke-linejoin="round"/><circle cx="182" cy="122" r="13" fill="none" stroke="${G}" stroke-width="2.6"/><ellipse cx="182" cy="122" rx="6" ry="4" fill="${R}" fill-opacity=".6"/>${T(240, 118, '輕微擦傷', A, 14)}${T(240, 140, '告訴大人、清洗、覆蓋', G, 12)}${person(320, 188, 0.9, INK)}`);
    }
    if (i === 6) {
      return wrap(`<rect width="400" height="220" fill="url(#sky)"/>${phone(300, 96, '119', R)}<path d="M20 118Q120 108 220 124L250 130" fill="none" stroke="${G}" stroke-width="3"/><path d="M20 150Q120 146 214 152L250 148" fill="none" stroke="${G}" stroke-width="3"/><ellipse cx="130" cy="136" rx="14" ry="7" fill="${R}" fill-opacity=".8"/>${T(130, 106, '大量出血', R, 13)}${T(150, 192, '先叫大人、撥 119、持續加壓', INK, 12)}${person(60, 196, 0.8, A)}`);
    }
    const pressing = i >= 3;
    const wound = i <= 2 ? `<path d="M150 125l40 10" stroke="${R}" stroke-width="5" stroke-linecap="round"/>${drops(c && c.bleed ? Math.round(c.bleed / 20) : 4, 165, 150)}` : '';
    return wrap(`<rect width="400" height="220" fill="url(#sky)"/>
      <g fill="none" stroke="${G}" stroke-width="2.6"><path d="M120 190v-60l-20-30 10-8 30 28v-60a8 8 0 0 1 16 0v50v-62a8 8 0 0 1 16 0v62v-55a8 8 0 0 1 16 0v58v-44a8 8 0 0 1 16 0v76a45 45 0 0 1-45 45h-10z"/></g>${wound}
      ${i >= 1 ? `<g fill="none" stroke="${B}" stroke-width="2.4"><path d="M100 82q16-14 36-6M240 82q-16-14-36-6" opacity=".6"/></g>` : ''}
      ${pressing ? `<rect x="128" y="108" width="72" height="38" rx="6" fill="#e4ebe7" fill-opacity=".88"/><path d="M134 118h58M134 128h58" stroke="#9aa8a1" stroke-width="2"/>${i >= 5 ? `<rect x="128" y="108" width="72" height="38" rx="6" fill="${R}" fill-opacity=".35"/>` : ''}` : ''}
      ${i === 7 ? `<path d="M118 112q4 36 0 0" /><text x="300" y="100" fill="${A}" font-size="13" font-family="Microsoft JhengHei">手指顏色？</text>` : ''}
      ${T(300, 150, i >= 3 ? 'PRESSURE' : 'STAY SAFE', G, 13)}`);
  }
  // 腿部圖：髖部在左、膝蓋在右；傷口在大腿中段
  function legScene(c, zones) {
    const drops = Math.round((c ? c.bleed : 0) / 17);
    const hold = c ? c.hold : 0;
    const band = c && c.band != null ? `<g><rect x="${c.band - 9}" y="62" width="18" height="76" fill="#1b1b1b" stroke="${G}" stroke-width="2"/>
      <line x1="${c.band}" y1="40" x2="${c.band}" y2="160" stroke="${G}" stroke-width="5" stroke-linecap="round" transform="rotate(${hold * 3.6} ${c.band} 100)"/></g>` : '';
    return wrap(`<rect width="400" height="220" fill="url(#sky)"/>
      <path d="M0 55 Q150 50 285 68 Q300 64 320 72 L400 82 L400 128 L320 132 Q300 140 285 134 Q150 152 0 148 Z" fill="#1d2a24" stroke="${G}" stroke-width="2.5"/>
      <ellipse cx="302" cy="100" rx="16" ry="26" fill="none" stroke="${D}" stroke-width="2" stroke-dasharray="4 3"/>
      ${T(302, 180, '膝蓋', '#9aa8a1')}${T(10, 180, '← 靠近身體', '#9aa8a1', 12, 'start')}${T(200, 206, '虛擬模型：不可在真人身上練習綁緊', A, 11)}
      <ellipse cx="190" cy="100" rx="13" ry="7" fill="${R}"/>
      ${Array.from({ length: drops }, (_, k) => `<circle cx="${182 + (k % 3) * 8}" cy="${116 + Math.floor(k / 3) * 9}" r="3" fill="${R}"/>`).join('')}
      ${T(190, 88, '傷口', R)}${band}${zones || ''}`);
  }
  // 嚴重出血前段：安全、求救、加壓
  function aidScene(c) {
    const i = c ? c.i : 0;
    const debris = `<g fill="none" stroke="${A}" stroke-width="2.2"><path d="M30 40l70-12 20 30-60 14z"/><path d="M40 60l-8 14"/></g>`;
    const patient = `<g fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"><circle cx="230" cy="110" r="8"/><path d="M230 118v34M230 126l-16 14M230 126l16 14M230 152l-20 30M230 152l24 30"/></g><ellipse cx="236" cy="166" rx="9" ry="5" fill="${R}"/>`;
    const helper = person(300, 186, 1, G);
    let over = '';
    if (i === 0) over = debris + ring(70, 56, 56, R) + T(70, 128, '還有掉落物', R, 12) + `<path d="M180 110l-24 0M160 104l-8 6 8 6" stroke="${G}" stroke-width="3" fill="none" stroke-linecap="round"/>` + T(152, 134, '先到較安全處', G, 12);
    if (i === 1) over = phone(100, 100, '119', R) + T(100, 160, '先求救', R, 13);
    if (i >= 2) over = `<rect x="210" y="156" width="44" height="22" rx="4" fill="#e4ebe7" fill-opacity=".9"/><path d="M222 148l10 8 10-8" fill="none" stroke="${G}" stroke-width="3"/>${T(100, 110, '直接加壓', G, 15)}${T(100, 134, '持續壓住傷口', G, 12)}${i === 3 ? T(100, 160, '壓不住才考慮止血帶', A, 12) : ''}`;
    return wrap(`<rect width="400" height="220" fill="url(#sky)"/><path d="M0 188h400" stroke="${D}" stroke-width="2"/>${patient}${helper}${over}`);
  }
  // ---- 居家檢查 ----
  function roomScene(c, st) {
    const spots = MBY.p1.steps[0].spots, safe = MBY.p1.steps[0].safe;
    const zones = (c && c.i === 0 && !c.solved) ? spots.map((s, i) => huntZone(s, i, c)).join('') + safe.map(safeZone).join('')
      : (c ? spots.map(s => spotMark(s)).join('') : '');
    return wrap(`<rect width="400" height="220" fill="url(#sky)"/><path d="M0 196H400" stroke="${D}" stroke-width="2"/>
      <g fill="none" stroke="${G}" stroke-width="2.2">
        <rect x="30" y="46" width="60" height="142"/><path d="M30 82h60M30 118h60M30 154h60"/><rect x="38" y="22" width="44" height="22" fill="#1d2a24"/>
        <rect x="140" y="150" width="120" height="40"/><rect x="146" y="138" width="34" height="14"/><rect x="172" y="56" width="56" height="42"/><path d="M180 64l40 26" stroke="${D}"/>
        <rect x="316" y="58" width="58" height="134" stroke="${D}"/><circle cx="364" cy="128" r="3"/><rect x="302" y="168" width="22" height="22" fill="#1d2a24"/><rect x="318" y="156" width="26" height="34" fill="#1d2a24"/><rect x="306" y="152" width="16" height="16" fill="#1d2a24"/>
        <path d="M296 110h-40M276 110v-10"/><circle cx="276" cy="100" r="7" stroke="${R}"/></g>
      <rect x="104" y="150" width="20" height="38" rx="6" fill="#5a1f1b" stroke="${R}" stroke-width="2"/><path d="M110 150v-6h10" stroke="${R}" fill="none" stroke-width="2"/>${zones}`);
  }

  // 居家安全檢查：擬真客廳＋可檢查的「?」記號
  function roomSC(c) {
    const spots = MBY.p1.steps[0].spots, safe = MBY.p1.steps[0].safe;
    const zones = (c && c.i === 0 && !c.solved) ? spots.map((s, i) => huntZone(s, i, c)).join('') + safe.map(safeZone).join('')
      : (c ? spots.map(s => spotMark(s)).join('') : '');
    return wrap(SC.room() + zones);
  }

  // 依關卡與步驟選擇畫面
  function sceneHTML(m, c, st) {
    const z = st && st.type === 'map' ? zonesSVG(st, c) : '';
    const sc = (st && st.scene) || m.scene;
    // 六關使用 scenes.js 的擬真場景；隱藏的關卡（現場評估、包紮、止血帶）仍使用原本的線條場景
    switch (sc) {
      case 'bag': return wrap(SC.bag(c));
      case 'classroom': return wrap(SC.classroom(c) + z, SC.classroomShake(c) ? 'shake' : '');
      case 'corridor': return wrap(SC.corridor(c) + z);
      case 'flood': return wrap(SC.flood(c) + z);
      case 'siren': return wrap(SC.siren(c));
      case 'town': return wrap(st && st.type !== 'map' ? SC.crowd(c) : SC.town() + z);
      case 'room': return roomSC(c);
      case 'hazard': return hazardScene(c, st);
      case 'hand': return handScene(c);
      case 'leg': {
        const early = c && c.m.id === 'm2' && c.i <= 3;
        return early ? aidScene(c) : legScene(c, st && st.type === 'map' ? z : '');
      }
      default: return '';
    }
  }

  // =====================================================================
  // 畫面
  // =====================================================================
  const settingsPanel = () => `
    <div class="panel settings"><strong>設定</strong>
      <label class="check" title="答對、答錯、找到東西時的柔和短音"><input id="st-sfx" type="checkbox" ${S.set.sfx ? 'checked' : ''}> 提示音效</label>
      <label class="check" title="地震的低沉震動、雨聲、遠處提示音等，音量很小"><input id="st-amb" type="checkbox" ${S.set.amb ? 'checked' : ''}> 情境環境音</label>
      <label class="check" title="勾選後，英文發音按鈕會安靜"><input id="st-mute" type="checkbox" ${S.set.mute ? 'checked' : ''}> 關閉英文語音</label>
      <label class="check" title="不搖晃、不漂移"><input id="st-calm" type="checkbox" ${S.set.calm ? 'checked' : ''}> 降低動畫</label>
    </div>`;
  function bindSettings() {
    const map = { 'st-sfx': 'sfx', 'st-amb': 'amb', 'st-mute': 'mute', 'st-calm': 'calm', 'st-parent': 'parent', 'st-bleed': 'showBleed' };
    Object.keys(map).forEach(id => { const el = $('#' + id); if (el) el.onchange = () => { S.set[map[id]] = el.checked; save(); applySettings(); if (id === 'st-sfx' && el.checked) sfx('ok'); if (id === 'st-amb' && !el.checked) ambStop(); }; });
  }

  ROUTES.title = function () {
    app.innerHTML = `
      <section class="title-hero">
        <div>
          <p class="eyebrow">DISASTER PREPAREDNESS // 防災探索隊</p>
          <h1>先保護自己，<br>再幫助別人</h1>
          <p class="lead">地震、火災、淹水、防空警報、與家人走散。完成六個任務，學會辨識危險、保護自己、知道何時怎麼求救。這是防災教育模擬，不是正式救護訓練。</p>
          <p class="en" style="color:var(--green);letter-spacing:2px;margin:0">Stay calm. Stay safe. ${sayBtns('Stay calm.')}</p>
          <div class="row"><button type="button" class="btn big" id="start">▶ 進入演習基地</button><span class="note">先在右邊填呼號（可以先不改），再按這裡。</span></div>
        </div>
        ${EMBLEM}
      </section>
      <div class="title-grid">
        <div class="callout alert"><strong>出任務前請先讀：</strong>
          <ul style="margin:4px 0 0">
            <li>這是模擬演練，沒有真的警報，也不會真的撥打電話；內容整理自公開資料，不代表任何機關認證。</li>
            <li>真實遇到狀況：先保護自己，大聲叫大人，撥打 119（火災、救護）或 110（警察）。</li>
            <li>本機只儲存勾選與關卡進度，不儲存姓名、住址或電話，也不會上傳。</li>
          </ul>
        </div>
        <div class="title-side">
          <div class="panel">
            <div class="field"><label for="cs">你的呼號</label><input id="cs" type="text" maxlength="12" value="${esc(S.callsign)}"><span class="note">用暱稱或代號，不要用真實姓名。</span></div>
            <p class="note" style="margin:4px 0 0">建議和家長一起玩，每一關都有給家長的小卡。</p>
          </div>
          ${settingsPanel()}
        </div>
      </div>`;
    bindSettings();
    $('#start').onclick = () => { S.callsign = $('#cs').value.trim() || '救援一號'; show('hub'); };
  };

  // 新芽成長：完成越多，小芽越長越高，最後開花（家庭檢查表與演習基地共用）
  const growthStage = (n, total) => n <= 0 ? 0 : n >= total ? 5 : Math.min(4, 1 + Math.floor(n * 4 / total));
  const GROW_TEXT = ['種子還在土裡，完成一項，讓它發芽！', '冒出小芽了，繼續加油！', '長出新葉子了！', '小芽越長越高，快要長花苞了！', '花苞冒出來了，就差一點點！', '開花了！你是防災小勇士 🎉'];
  function growthSVG(n, total) {
    const st = growthStage(n, total), g = '#3ddc84', g2 = '#2a9d5c';
    const top = 118 - [0, 20, 40, 58, 70, 76][st];
    const lf = (y, w) => `<ellipse cx="${80 - w}" cy="${y}" rx="${w * 0.9}" ry="${w * 0.42}" fill="${g}" transform="rotate(-28 ${80 - w} ${y})"/><ellipse cx="${80 + w}" cy="${y}" rx="${w * 0.9}" ry="${w * 0.42}" fill="${g}" transform="rotate(28 ${80 + w} ${y})"/>`;
    let s = `<ellipse cx="80" cy="146" rx="46" ry="5" fill="#000" opacity=".35"/><path d="M50 120h60l-8 26H58z" fill="#b8673a"/><rect x="46" y="114" width="68" height="9" rx="3" fill="#cd7b4a"/><ellipse cx="80" cy="115" rx="32" ry="4" fill="#6b4a2b"/>`;
    if (st === 0) s += '<ellipse cx="80" cy="113" rx="5" ry="3.5" fill="#d9b36a"/>';
    if (st >= 1) s += `<path d="M80 116V${top}" stroke="${g2}" stroke-width="5" stroke-linecap="round" fill="none"/>` + lf(top + 6, 9);
    if (st >= 2) s += lf(top + 22, 13);
    if (st >= 3) s += lf(top + 38, 16);
    if (st === 4) s += `<ellipse cx="80" cy="${top - 7}" rx="8" ry="11" fill="#9bd86a"/><path d="M80 ${top - 18}q-4 8 0 14" stroke="#f2b33d" stroke-width="3" fill="none"/>`;
    if (st === 5) {
      const cy = top - 6;
      s += [0, 72, 144, 216, 288].map(a => `<ellipse cx="80" cy="${cy - 13}" rx="8" ry="13" fill="#f2b33d" transform="rotate(${a} 80 ${cy})"/>`).join('') + `<circle cx="80" cy="${cy}" r="8" fill="#e8590c"/>`
        + '<text x="34" y="52" fill="#f2b33d" font-size="18">✦</text><text x="120" y="40" fill="#f2b33d" font-size="14">✦</text><text x="124" y="84" fill="#3ddc84" font-size="16">★</text><text x="26" y="96" fill="#3ddc84" font-size="12">✦</text>';
    }
    return s;
  }
  const growthBlock = (n, total, label, mini) => {
    const st = growthStage(n, total);
    return `<div class="growth ${mini ? 'mini' : ''}" data-stage="${st}"><svg viewBox="0 0 160 150" role="img" aria-label="新芽成長圖：第 ${st} 階段，共 5 階段">${growthSVG(n, total)}</svg>
      <div class="growth-t"><strong>${esc(label)} ${n} / ${total}</strong><div class="progress" aria-label="完成進度"><i style="width:${Math.round(n / total * 100)}%"></i></div><p>${GROW_TEXT[st]}</p></div></div>`;
  };

  // 徽章集點卡：每關一格，完成就蓋章；完整版另有隊員呼號、通關日期、通關總時間與心得
  const pad2 = n => String(n).padStart(2, '0');
  const fmtDate = ts => { const d = new Date(ts); return `${d.getFullYear()}/${pad2(d.getMonth() + 1)}/${pad2(d.getDate())}`; };
  const fmtShort = ts => { const d = new Date(ts); return `${pad2(d.getMonth() + 1)}/${pad2(d.getDate())}`; };
  const fmtDur = s => (typeof s !== 'number') ? '—' : s < 60 ? `${s} 秒` : s < 3600 ? `${Math.floor(s / 60)} 分 ${pad2(s % 60)} 秒` : `${Math.floor(s / 3600)} 小時 ${pad2(Math.floor(s % 3600 / 60))} 分`;
  function clearInfo() {
    const ids = MAIN.map(m => m.id), all = ids.every(id => S.done[id]);
    const secs = ids.filter(id => S.done[id] && typeof S.times[id] === 'number').map(id => S.times[id]);
    const last = Math.max(0, ...ids.map(id => S.doneAt[id] || 0));
    return { all, total: secs.reduce((x, y) => x + y, 0), hasTime: secs.length > 0, date: all && last ? fmtDate(last) : null };
  }
  function stampCard(newId, mini) {
    const n = doneCount(), info = clearInfo();
    const head = mini ? '' : `<p class="eyebrow">HOME GUARD // 徽章集點卡</p><h3>防災探索隊員集點卡</h3>
      <div class="s-info">
        <div><span>隊員呼號</span><b>${esc(S.callsign)}</b></div>
        <div><span>通關日期</span><b>${info.date || '尚未通關'}</b></div>
        <div><span>${info.all ? '通關總時間' : '累計時間（已完成的關卡）'}</span><b>${info.hasTime ? fmtDur(info.total) : '—'}</b></div>
      </div>`;
    const cells = MAIN.map(m => {
      const got = !!S.done[m.id];
      const when = (!mini && got && S.doneAt[m.id]) ? `<span class="s-when">${fmtShort(S.doneAt[m.id])}${typeof S.times[m.id] === 'number' ? ' · ' + fmtDur(S.times[m.id]) : ''}</span>` : '';
      return `<div class="stamp ${got ? 'got' : ''} ${newId === m.id ? 'new' : ''}" title="${esc(m.name)}">
          <span class="s-no">${m.no}</span>${got ? '<span class="s-star" aria-hidden="true">★</span>' : ''}<span class="s-ic">${mIcon(m)}</span>
          <span class="s-badge">${got ? esc(m.badge) : '？'}</span>${mini ? '' : `<span class="s-name">${esc(m.name.split('：')[0])}</span>`}${when}
          <span class="s-mark">${got ? '已蓋章' : '未完成'}</span></div>`;
    }).join('');
    const note = mini ? '' : `<div class="s-note"><b>我的心得</b><div class="note-box" id="notebox">${esc(S.note)}</div></div>`;
    return `<div id="stampcard" class="stampcard ${mini ? 'mini' : ''}" aria-label="徽章集點卡，已蓋 ${n} 枚">${head}
      <div class="stamps">${cells}</div>
      <p class="s-sum">已蓋 <strong>${n}</strong> / ${MAIN.length} 枚${n === MAIN.length ? '　🎉 恭喜成為防災探索隊員！' : ''}</p>${note}</div>`;
  }

  const card = m => `
    <button type="button" class="mission-card ${S.done[m.id] ? 'done' : ''}" data-m="${m.id}">
      <span class="mc-head"><span class="m-icon">${mIcon(m)}</span><span class="mc-titles"><span class="code">${m.no ? '第 ' + m.no + ' 關' : '家庭練習'}${m.advanced ? '｜進階・家長陪同' : ''}</span><span class="mname">${esc(m.name)}</span></span></span>
      <span class="note">${esc(m.brief)}</span>
      <span class="status">${S.done[m.id] ? '✓ 完成｜' + esc(m.badge) : '待執行'}</span>
    </button>`;

  ROUTES.hub = function () {
    app.innerHTML = `
      <p class="eyebrow">HOME BASE // 演習基地</p>
      <h1>六個任務，平日先練習</h1>
      <p class="lead">呼號 <strong>${esc(S.callsign)}</strong>，已完成 ${doneCount()} / ${MAIN.length} 關。可以照順序玩，也可以先挑想練習的。答錯不扣分，隊長會說明並讓你再選一次。</p>
      <div class="hub-top">
        ${growthBlock(doneCount(), MAIN.length, '已完成關卡', true)}
        <div>${stampCard(null, true)}<div class="row" style="margin:6px 0 0"><button type="button" class="btn ghost" data-go="stamps">看完整集點卡</button></div></div>
      </div>
      ${GROUPS.map(g => `<h2>${esc(g.t)}</h2><div class="missions">${g.ids.map(id => card(MBY[id])).join('')}</div>`).join('')}
      <h2>三、家庭防災練習</h2>
      <div class="missions">${card(MBY.p1)}
        <button type="button" class="mission-card" data-go="family"><span class="mc-head"><span class="m-icon">${svg24('<path d="M5 4h14v16H5z"/><path d="M9 9l2 2 4-4M9 15h6"/>')}</span><span class="mc-titles"><span class="code">FAMILY</span><span class="mname">家庭防災檢查表</span></span></span><span class="note">勾選 7 項家庭防災行動，確認全家都知道出口、集合地點和電話，讓小芽慢慢長大。</span></button></div>
      <div class="row">
        <button type="button" class="btn ghost" data-go="vocab">英文單字庫</button>
        <button type="button" class="btn ghost" data-go="card">防災關鍵卡</button>
        <button type="button" class="btn ghost" data-go="sources">教材來源</button>
      </div>
      ${settingsPanel()}`;
    bindSettings();
    $$('[data-m]').forEach(b => b.onclick = () => show('brief', MBY[b.dataset.m]));
  };

  const parentCard = m => `
    <details class="parent"><summary>家長小卡</summary><dl>
      <dt>這關在學什麼</dt><dd>${esc(m.parent.learn)}</dd>
      <dt>可以問孩子的一句話</dt><dd>${esc(m.parent.ask)}</dd>
      <dt>孩子卡住時的提示</dt><dd>${esc(m.parent.hint)}</dd>
      <dt>真實生活延伸</dt><dd>${esc(m.parent.real)}</dd>
    </dl></details>`;

  // 補充教學影片：只放連結（點選後在新分頁開啟，需要連網），不內嵌播放器，遊戲本身維持離線
  const videoCard = m => m.video ? `
    <div class="panel video"><strong>補充教學影片（點選觀看，需要連網）</strong>
      <p style="margin:6px 0"><a class="btn ghost" href="${esc(m.video.url)}" target="_blank" rel="noopener">▶ ${esc(m.video.title)}</a></p>
      <p class="note" style="margin:0">${esc(m.video.org)}｜${esc(m.video.len)}｜在新分頁開啟 YouTube。建議家長先看過，再陪孩子一起看；影片是補充，不取代實體急救課程，也不要在真人身上練習綁緊。</p></div>` : '';

  const gearList = (m, withAlt) => m.gear.length ? `<ul class="gear">${m.gear.map(g => {
    const has = S.loadout.includes(g.id);
    return `<li class="${has ? 'yes' : 'no'}"><span class="mark">${has ? '✓ 有帶' : '○ 沒帶'}</span> <strong>${esc(ITEM[g.id].name)}</strong>：${esc(has ? g.why : (withAlt ? '沒關係，替代做法：' + g.alt : g.why))}</li>`;
  }).join('')}</ul>` : '';

  ROUTES.brief = function (m) {
    const gate = m.advanced ? `
      <div class="panel gate"><strong>進階單元：建議家長或老師陪同</strong>
        <p class="note" style="margin:4px 0 8px">這個單元認識嚴重出血與止血帶。只使用虛擬模型，不要在真人身上練習綁緊。</p>
        <label class="check"><input id="g-ok" type="checkbox" ${S.set.parent ? 'checked' : ''}> 已有家長或老師陪同</label>
        <label class="check"><input id="g-bleed" type="checkbox" ${S.set.showBleed ? 'checked' : ''}> 顯示出血量條（預設關閉）</label></div>` : '';
    app.innerHTML = `
      <p class="eyebrow">${m.code} // ${m.kind === 'extra' ? 'FAMILY PRACTICE' : 'MISSION BRIEFING'}</p>
      <h1 class="with-icon"><span class="m-icon big">${mIcon(m)}</span>${esc(m.name)}</h1>
      <div class="start-top"><button type="button" class="btn big" id="go2">▶ 開始任務</button><span class="note">準備好了就按這裡開始；下面是這關的流程、裝備和單字。</span></div>
      <div class="viewport preview">${m.gobag ? wrap(SC.bag(null)) : sceneHTML(m, null, m.steps[0])}</div>
      <div class="panel"><p class="radio" style="margin:0"><span class="who">隊長</span>${esc(S.callsign)}，${esc(m.brief)}</p></div>
      ${m.note ? `<div class="callout amber">${esc(m.note)}</div>` : ''}
      ${gate}
      ${videoCard(m)}
      <div class="callout"><strong>安全提醒：</strong>${esc(m.safety)}</div>
      <h2>流程</h2>
      ${timeline(m.flow)}
      ${m.gear.length ? `<h2>這關可能用到的裝備</h2><p class="note">沒帶也沒關係，隊長會教你替代做法。</p>${gearList(m, true)}` : ''}
      <p>這關的英文單字：</p>
      <div class="opts">${m.words.map(w => `<div>${wordChip(w)} <span class="note">${esc(WORDS[w].zh)}</span></div>`).join('')}</div>
      ${parentCard(m)}
      <div class="startbar"><button type="button" class="btn big" id="go">▶ 開始任務</button><button type="button" class="btn ghost" data-go="hub">回演習基地</button></div>`;
    const go = $('#go'), go2 = $('#go2'), ok = $('#g-ok');
    if (ok) {
      const sync = () => { go.disabled = go2.disabled = !ok.checked; };
      ok.onchange = sync;
      $('#g-bleed').onchange = e => { S.set.showBleed = e.target.checked; save(); };
      sync();
    }
    go.onclick = go2.onclick = () => {
      S.timing = { id: m.id, sec: 0 };
      if (m.gobag) { show('gobag', m); return; }
      startRun(m);
    };
  };

  function listOf(m, c) {
    return m.steps.filter(s => !s.only || s.only === c.branch);
  }
  function startRun(m) {
    const c = { m, i: 0, branch: null, bleed: m.bleed ? 85 : 0, missing: [], picked: new Set(), found: new Set(), seq: 0, hold: 0, band: null, time: null, solved: false, slot: 0, slotText: [], hint: false };
    c.list = listOf(m, c);
    S.cur = c;
    show('step');
  }

  // ---------- 防災包整備 ----------
  ROUTES.gobag = function (m, checked) {
    const slots = Array.from({ length: SLOTS }, (_, i) => {
      const id = S.loadout[i];
      return id ? `<button type="button" class="slot filled" data-rm="${id}" title="拿出：${esc(ITEM[id].name)}" aria-label="拿出 ${esc(ITEM[id].name)}">${icon(id)}</button>` : `<div class="slot" title="空格"></div>`;
    }).join('');
    const needAll = ITEMS.filter(it => !it.hidden && it.need), needHave = needAll.filter(it => S.loadout.includes(it.id)).length;
    const missNeed = ITEMS.filter(it => !it.hidden && it.need && !S.loadout.includes(it.id));
    const decoys = S.loadout.filter(id => ITEM[id].decoy);
    const report = checked ? `
      <div class="panel" id="report"><strong>防災包檢查</strong>
        ${missNeed.length ? `<p>還缺 ${missNeed.length} 樣建議優先準備的物品（沒帶也可以繼續，隊長會教替代做法）：</p><ul>${missNeed.map(it => `<li><strong>${esc(it.name)}</strong>：${esc(it.use)}</li>`).join('')}</ul>` : '<p>優先準備的物品全部到齊！</p>'}
        ${decoys.length ? `<p>背包裡有${decoys.map(id => esc(ITEM[id].name)).join('、')}：${decoys.map(id => esc(ITEM[id].use)).join(' ')}</p>` : ''}
        <strong>防災包要放哪裡？</strong>
        <ul class="tips">${BAG_TIPS.place.map(p => `<li class="${p.ok ? 'yes' : 'no'}">${p.ok ? '✓' : '✗'} ${esc(p.t)}</li>`).join('')}</ul>
        <strong>背包怎麼選、怎麼管理？</strong>
        <ul>${BAG_TIPS.bag.map(t => `<li>${esc(t)}</li>`).join('')}</ul>
        <div class="row"><button type="button" class="btn" id="finish">完成整備，繼續下一步</button><span class="note">還想調整可以繼續改，再按一次「檢查防災包」。</span></div>
      </div>` : '';
    const group = cat => ITEMS.filter(it => !it.hidden && it.cat === cat).map(it => `
        <div class="item-card ${S.loadout.includes(it.id) ? 'on' : ''}">
          ${it.need ? '<span class="pill need">優先</span>' : it.opt ? '<span class="pill opt">建議</span>' : ''}
          <div class="top">${icon(it.id)}<div><div class="name">${esc(it.name)}</div>${it.word ? wordChip(it.word) : ''}</div></div>
          <p class="use">${checked || !it.decoy ? esc(it.use) : '這個要帶嗎？想一想。'}</p>
          <button type="button" class="toggle" data-item="${it.id}">${S.loadout.includes(it.id) ? '已放入（點一下拿出）' : '放進防災包'}</button>
        </div>`).join('');
    app.innerHTML = `
      <p class="eyebrow">${m.code} // GO BAG</p>
      <h1 class="with-icon"><span class="m-icon big">${mIcon(m)}</span>整理我們家的防災包</h1>
      <div class="viewport preview">${wrap(SC.bag(null))}</div>
      <p class="lead">背包有 ${SLOTS} 格。「優先」的先放，再用剩下的空間取捨「建議」物品。沒有唯一正確的組合，依家人需要調整。<strong>你的防災包就在旁邊（手機在上方），放進去的東西會馬上出現，點一下格子可以拿出來。</strong></p>
      ${report}
      <div class="gobag-layout">
        <div class="gb-items">${CATS.map((cat, i) => `<h2>${i < 4 ? `${i + 1}. ` : ''}${esc(cat)}</h2><div class="items">${group(cat)}</div>`).join('')}</div>
        <aside class="gb-side" aria-label="我的防災包"><div class="panel bagpanel"><strong>🎒 我的防災包（${S.loadout.length} / ${SLOTS}）</strong><div class="slots">${slots}</div>
          <p class="note gb-need">優先物品：已放 ${needHave} / ${needAll.length}</p>
          <button type="button" class="btn" id="check" ${S.loadout.length ? '' : 'disabled'}>檢查防災包</button></div></aside>
      </div>
      <div class="gb-bar"><span>🎒 <strong>${S.loadout.length} / ${SLOTS}</strong>　優先 ${needHave} / ${needAll.length}</span><button type="button" class="btn" id="check2" ${S.loadout.length ? '' : 'disabled'}>檢查防災包</button></div>
      <p class="note">清單參考：${SOURCES.slice(2, 5).map(s => `<a href="${s.url}" target="_blank" rel="noopener">${esc(s.name)}</a>`).join('、')}。「優先」與「建議」是本遊戲為孩子整理的順序，請依家人需要調整。</p>
      ${parentCard(m)}`;
    $$('[data-item]').forEach(b => b.onclick = () => {
      const id = b.dataset.item;
      if (S.loadout.includes(id)) S.loadout = S.loadout.filter(x => x !== id);
      else if (S.loadout.length >= SLOTS) { toast(`防災包滿了（${SLOTS} 格），先拿出一樣再放。`); return; }
      else S.loadout.push(id);
      save();
      const y = window.scrollY;
      ROUTES.gobag(m, false);
      window.scrollTo(0, y);
    });
    $$('[data-rm]').forEach(b => b.onclick = () => { S.loadout = S.loadout.filter(x => x !== b.dataset.rm); save(); const y = window.scrollY; ROUTES.gobag(m, false); window.scrollTo(0, y); });
    $('#check').onclick = $('#check2').onclick = () => { ROUTES.gobag(m, true); $('#report').scrollIntoView({ block: 'center' }); };
    if (checked) $('#finish').onclick = () => startRun(m);
  };

  // ---------- 第一人稱 HUD ----------
  const CAPTAIN = `<svg viewBox="0 0 40 40" class="captain" aria-hidden="true"><circle cx="20" cy="22" r="11" fill="#10211a" stroke="${G}" stroke-width="2"/><path d="M9 20a11 11 0 0 1 22 0" fill="${G}" stroke="none" opacity=".85"/><path d="M9 21v7M31 21v7M31 28l-6 4" fill="none" stroke="${G}" stroke-width="2" stroke-linecap="round"/><circle cx="16" cy="24" r="1.6" fill="${G}"/><circle cx="24" cy="24" r="1.6" fill="${G}"/></svg>`;
  // 每種題型的操作說明（寫在任務橫幅裡，孩子一進來就知道要做什麼）
  const HOW = { map: '👆 在畫面上點一個位置', choice: '👇 從下面選一個答案', multi: '☑ 勾選所有適合的，再按「確認」', sequence: '1️⃣ 照順序，一個一個點', item: '🎒 從下面選一件裝備', hold: '👇 按住按鈕不放', hunt: '🔍 點畫面上有「?」的地方', slots: '💬 一句一句選出適合的話' };
  ROUTES.step = function () {
    const c = S.cur, m = c.m, st = c.list[c.i];
    const total = c.branch ? c.list.length : m.steps.filter(s => !s.only || s.only === 'A').length;
    const pack = S.loadout.length ? S.loadout.map(id => `<div class="slot filled" title="${esc(ITEM[id].name)}">${icon(id)}</div>`).join('') : '<span class="note">防災包是空的</span>';
    const bleed = m.bleed && S.set.showBleed ? `<span class="bleed">出血量 <span class="bar"><i style="width:${c.bleed}%"></i></span></span>` : '';
    app.innerHTML = `
      <div class="hud">
        <div class="hud-top"><span>${esc(m.name)}</span><span class="obj">STEP ${c.i + 1} / ${total}</span><span class="sim">模擬演練</span>${bleed}</div>
        <div class="stepbar"><i style="width:${Math.round((c.i + (c.solved ? 1 : 0)) / total * 100)}%"></i></div>
        <div class="goal"><span class="goal-t">🎯 你的任務</span><b>${esc(st.prompt)}</b><span class="goal-how">${HOW[st.type] || ''}</span></div>
        <div class="viewport"><span class="visor">VISOR // ${esc(S.callsign)}</span>
          <span class="corner tl"></span><span class="corner tr"></span><span class="corner bl"></span><span class="corner br"></span>${sceneHTML(m, c, st)}
          ${c.solved ? `<div class="okmark" role="status">${c.lastKind === 'alt' ? '✔ 用替代做法完成' : '✓ 做對了！'}</div>` : ''}</div>
        <div class="hud-bottom"><div class="pack-mini" aria-label="防災包">${pack}</div>
          <p class="radio" aria-live="polite" style="margin:0">${CAPTAIN}<span class="who">隊長</span>${esc(st.radio)}</p></div>
        <div class="action${c.solved ? ' solved' : ''}"><p class="prompt sr-only">${esc(st.prompt)}</p><div id="ctl"></div><div id="fb" aria-live="polite"></div>
          <div class="row hintrow"><button type="button" class="say big" id="hintbtn">需要提示</button>${m.video ? `<a class="say big" href="${esc(m.video.url)}" target="_blank" rel="noopener">▶ 補充影片</a>` : ''}<span class="note safe">安全提醒：${esc(m.safety)}</span></div></div>
      </div>
      ${parentCard(m)}
      <div class="row"><button type="button" class="btn ghost" id="quit">暫停，回演習基地</button></div>`;
    $('#quit').onclick = () => { S.cur = null; show('hub'); };
    $('#hintbtn').onclick = () => hint(st);
    ambStart(ambFor(m, c, st));
    ({ choice: ctlChoice, multi: ctlMulti, sequence: ctlSequence, item: ctlItem, hold: ctlHold, map: ctlMap, hunt: ctlHunt, slots: ctlSlots })[st.type](st, c);
    if (c.solved) solvedUI(c.lastFb, c.lastKind);
  };

  function feedback(text, kind) {
    $('#fb').innerHTML = `<div class="fb ${kind || ''}">${text}</div>`;
    sfx(kind === 'bad' ? 'no' : kind === 'alt' ? 'hint' : 'found');
  }

  function hint(st) {
    const c = S.cur;
    c.hint = true;
    if (st.type === 'hunt') { ROUTES.step(); return; }
    // 選擇題：淡化一個比較危險的選項
    if (st.type === 'choice') {
      const wrongBtn = [...app.querySelectorAll('[data-k]')].find(b => !st.options[b.dataset.k].ok && !b.disabled && !b.classList.contains('dim'));
      if (wrongBtn) { wrongBtn.classList.add('dim'); wrongBtn.setAttribute('aria-label', wrongBtn.textContent + '（提示：先不考慮這個）'); }
    }
    feedback('提示：' + esc(st.hint || c.m.hint), 'alt');
  }

  function solve(text, kind) {
    const c = S.cur;
    c.solved = true; c.lastFb = text; c.lastKind = kind;
    if (c.m.bleed && c.list[c.i].type !== 'hold') c.bleed = Math.max(c.bleed - 5, c.bleed > 0 ? 5 : 0);
    sfx(kind === 'alt' ? 'hint' : 'ok');
    ROUTES.step();
  }
  function solvedUI(text, kind) {
    $$('#ctl button').forEach(b => b.disabled = true);
    const last = S.cur.i === S.cur.list.length - 1;
    $('#fb').innerHTML = `<div class="fb ${kind || ''}">${text}</div><div class="row"><button type="button" class="btn" id="next">${last ? '完成，回報隊長' : '下一步'}</button></div>`;
    $('#next').onclick = next;
    $('#next').focus();
  }
  function next() {
    const c = S.cur;
    if (c.i === c.list.length - 1) {
      S.done[c.m.id] = true;
      if (!S.doneAt[c.m.id]) { S.doneAt[c.m.id] = Date.now(); if (S.timing && S.timing.id === c.m.id) S.times[c.m.id] = S.timing.sec; }
      save(); show('debrief'); return;
    }
    c.i++;
    Object.assign(c, { picked: new Set(), seq: 0, slot: 0, slotText: [], hint: false, solved: false, lastFb: '', lastKind: '' });
    if (c.list[c.i].type === 'hold') c.hold = 0;
    ROUTES.step();
  }

  function ctlChoice(st, c) {
    $('#ctl').innerHTML = `<div class="opts">${st.options.map((o, k) => `<button type="button" class="opt" data-k="${k}">${esc(o.t)}</button>`).join('')}</div>`;
    $$('[data-k]').forEach(b => b.onclick = () => {
      const o = st.options[b.dataset.k];
      if (o.ok) {
        if (o.branch) { c.branch = o.branch; c.list = listOf(c.m, c); }
        b.classList.add('right');
        solve(esc(o.fb || '正確！'));
      } else { b.classList.add('wrong'); feedback(`隊長：${esc(o.fb)} 再想想看，換一個選項。`, 'bad'); }
    });
  }

  function ctlMulti(st, c) {
    $('#ctl').innerHTML = `<div class="opts">${st.options.map((o, k) => `<button type="button" class="opt ${c.picked.has(k) ? 'picked' : ''}" data-k="${k}" aria-pressed="${c.picked.has(k)}">${c.picked.has(k) ? '☑' : '☐'} ${esc(o.t)}</button>`).join('')}</div>
      <div class="row"><button type="button" class="btn" id="ok">確認</button></div>`;
    $$('[data-k]').forEach(b => b.onclick = () => {
      const k = +b.dataset.k;
      c.picked.has(k) ? c.picked.delete(k) : c.picked.add(k);
      ctlMulti(st, c);
    });
    $('#ok').onclick = () => {
      const wrong = st.options.filter((o, k) => !o.ok && c.picked.has(k));
      const missing = st.options.filter((o, k) => o.ok && !c.picked.has(k)).length;
      if (wrong.length) feedback('隊長：' + wrong.map(o => `「${esc(o.t)}」：${esc(o.fb)}`).join('<br>') + ' 取消不對的選項再確認一次。', 'bad');
      else if (missing) feedback(`隊長：方向對了！還有 ${missing} 個也很重要，再找找看。`, 'alt');
      else solve('全部正確！');
    };
  }

  function ctlSequence(st, c) {
    const opts = st.order.map(t => ({ t })).concat(st.decoys);
    // 固定的打散順序，讓正確順序不會直接照排列出現
    const shuffled = [opts[2], opts[3], opts[0], opts[4], opts[1]].filter(Boolean);
    $('#ctl').innerHTML = `<div class="seq-done">${st.order.slice(0, c.seq).map((t, i) => `<span>${i + 1}. ${esc(t)}</span>`).join('')}</div>
      <div class="opts">${shuffled.map(o => `<button type="button" class="opt" data-t="${esc(o.t)}" ${st.order.indexOf(o.t) > -1 && st.order.indexOf(o.t) < c.seq ? 'hidden' : ''}>${esc(o.t)}</button>`).join('')}</div>`;
    $$('[data-t]').forEach(b => b.onclick = () => {
      const t = b.dataset.t, idx = st.order.indexOf(t);
      if (idx === c.seq) {
        c.seq++;
        if (c.seq === st.order.length) solve('順序完全正確！趴下、掩護、穩住。');
        else { ctlSequence(st, c); feedback('對！下一個動作是什麼？'); }
      } else if (idx > -1) feedback('隊長：這個動作是對的，但順序還沒到，先想想第一步。', 'alt');
      else { b.classList.add('wrong'); feedback(`隊長：${esc(st.decoys.find(d => d.t === t).fb)} 再選一次。`, 'bad'); }
    });
  }

  function ctlItem(st, c) {
    const has = S.loadout.includes(st.need);
    $('#ctl').innerHTML = `<div class="picks">${S.loadout.map(id => `<button type="button" class="pick" data-id="${id}">${icon(id, esc(ITEM[id].name))}</button>`).join('')}
      <button type="button" class="pick none" id="none">防災包裡沒有合適的</button></div>`;
    $$('[data-id]').forEach(b => b.onclick = () => {
      if (b.dataset.id === st.need) {
        const extra = st.time ? `<br>寫下時間：<strong class="en">T ${c.time = c.time || now()}</strong>` : '';
        solve(`${esc(ITEM[st.need].name)} 上場！ ${ITEM[st.need].word ? wordChip(ITEM[st.need].word) : ''}${extra}`);
      } else feedback(`隊長：${esc(ITEM[b.dataset.id].name)}現在派不上用場，再看看。`, 'bad');
    });
    $('#none').onclick = () => {
      if (has) { feedback('隊長：再看看防災包，你有帶喔！', 'alt'); return; }
      if (!c.missing.includes(st.need)) c.missing.push(st.need);
      if (st.time) c.time = c.time || now();
      solve(`隊長：沒關係，用替代做法。${esc(st.alt)}${st.time ? `<br>記下的時間：<strong class="en">${c.time}</strong>` : ''}`, 'alt');
    };
  }

  function ctlHold(st, c) {
    const start = c.bleed;
    $('#ctl').innerHTML = `<button type="button" class="hold-btn" id="hold" style="--p:${c.hold}%">${esc(st.label)}（${Math.round(c.hold)}%）</button>
      <p class="note">用滑鼠或手指按住不放；也可以按住空白鍵。放開會暫停，慢慢來沒關係。 ${wordChip(st.verb)}</p>`;
    const btn = $('#hold');
    let timer = null;
    const stop = () => { clearInterval(timer); timer = null; };
    const tick = () => {
      c.hold = Math.min(100, c.hold + 2.5);
      c.bleed = Math.round(start * (1 - c.hold / 100));
      btn.style.setProperty('--p', c.hold + '%');
      btn.textContent = `${st.label}（${Math.round(c.hold)}%）`;
      const bar = app.querySelector('.bleed i'); if (bar) bar.style.width = c.bleed + '%';
      if (c.hold >= 100) { stop(); solve(st.verb === 'pressure' ? '出血變少了，繼續保持壓住！' : `不再流血了！${st.after ? '<br>' + esc(st.after) : ''}`); }
    };
    const go = e => { e.preventDefault(); if (!timer) timer = setInterval(tick, 50); };
    btn.addEventListener('pointerdown', go);
    ['pointerup', 'pointerleave', 'pointercancel', 'blur'].forEach(ev => btn.addEventListener(ev, stop));
    btn.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') go(e); });
    btn.addEventListener('keyup', stop);
  }

  function bindZones(sel, fn) {
    app.querySelectorAll(sel).forEach(g => {
      g.addEventListener('click', () => fn(g));
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(g); } });
    });
  }

  function ctlMap(st, c) {
    $('#ctl').innerHTML = `<p class="note">在上方畫面點選（也可以用 Tab 鍵移動、Enter 選取）。</p>`;
    bindZones('[data-zone]', g => {
      const z = st.zones.find(z => z.id === g.dataset.zone);
      if (!z.ok) { feedback(`隊長：${esc(z.fb)} 再選一個位置。`, 'bad'); return; }
      if (st.map === 'leg') c.band = z.x + z.w / 2;
      if (c.m.id === 'p3' && st.map === 'town') S.family[c.i === 0 ? 'first' : 'second'] = z.label;
      solve(esc(z.fb));
    });
  }

  function ctlHunt(st, c) {
    const list = st.spots.map((s, i) => c.found.has(i) ? `<li><strong>${esc(s.t)}</strong>：${esc(s.fix)}</li>` : '').join('');
    $('#ctl').innerHTML = `<p class="note"><strong>怎麼玩：</strong>畫面上有「?」記號的地方，用手指或滑鼠點一下，就會顯示那是什麼。已找到 ${c.found.size} / ${st.spots.length}。</p><ol class="found">${list}</ol>`;
    bindZones('[data-spot]', g => {
      const i = +g.dataset.spot;
      if (c.found.has(i)) return;
      c.found.add(i);
      if (c.found.size === st.spots.length) solve('全部找到了！先認出危險，才知道怎麼保護自己。');
      else { ROUTES.step(); feedback(`找到了：${esc(st.spots[i].t)}。${esc(st.spots[i].fix)}`); }
    });
    bindZones('[data-safe]', g => feedback(`隊長：${esc(st.safe[+g.dataset.safe].fb)}`, 'alt'));
  }

  // 求救對話：依序為每個欄位選出適合的句子
  function ctlSlots(st, c) {
    const sl = st.slots[c.slot];
    const said = c.slotText.map((t, i) => `<span class="say-line"><b>${esc(st.slots[i].label)}</b> ${esc(t)}</span>`).join('');
    if (!sl) { $('#ctl').innerHTML = `<div class="seq-done">${said}</div>`; return; }
    $('#ctl').innerHTML = `<div class="seq-done">${said}</div><p class="note">第 ${c.slot + 1} / ${st.slots.length} 句：<strong>${esc(sl.label)}</strong></p>
      <div class="opts">${sl.options.map((o, k) => `<button type="button" class="opt" data-k="${k}">${esc(o.t)}</button>`).join('')}</div>`;
    $$('[data-k]').forEach(b => b.onclick = () => {
      const o = sl.options[b.dataset.k];
      if (!o.ok) { b.classList.add('wrong'); feedback(`隊長：${esc(o.fb)} 換一句試試看。`, 'bad'); return; }
      c.slotText.push(o.t);
      c.slot++;
      if (c.slot === st.slots.length) solve('說得很清楚！把這四句話連起來，可靠的大人就知道怎麼幫你了。這只是練習，不會真的撥打電話。');
      else { ctlSlots(st, c); feedback('好！繼續下一句。'); }
    });
  }

  // ---------- 覆盤 ----------
  ROUTES.debrief = function () {
    const c = S.cur, m = c.m;
    const report = m.id === 'm2' ? `Tourniquet on! Time ${c.time || now()}.` : null;
    const missing = c.missing || [];
    app.innerHTML = `
      <p class="eyebrow">${m.code} // DEBRIEF</p>
      <h1>完成：${esc(m.name)}</h1>
      <div class="unlock">
        <p class="eyebrow">UNLOCKED // 解鎖英文句子</p>
        <p class="phrase">${esc(m.phrases[0].en)}</p><p class="zh">${esc(m.phrases[0].zh)}</p>${sayBtns(m.phrases[0].en)}
        <p class="slogan">口訣：${esc(m.slogan)}</p>
        <div><span class="badge">徽章：${esc(m.badge)}</span></div>
      </div>
      <p class="note">這些英文句子只是輔助記憶，不能取代實際的安全行動。</p>
      <div class="panel"><strong>本關的英文句型</strong>${m.phrases.map(p => `<p class="en" style="font-size:19px;margin:6px 0">${esc(p.en)} ${sayBtns(p.en)} <span class="note">${esc(p.zh)}</span></p>`).join('')}
        ${report ? `<p class="en" style="font-size:19px;margin:6px 0">${esc(report)} ${sayBtns(report)}</p>` : ''}</div>
      <h2>1. 本關學會了什麼</h2>
      <ol>${m.keyPoints.map(k => `<li><strong>${esc(k.t)}</strong><br><span class="note">${esc(k.d)}</span></li>`).join('')}</ol>
      <h2>流程回顧</h2>
      ${timeline(m.flow)}
      <h2>2. 遊戲 vs 現實</h2>
      <div id="myth"><button type="button" class="btn ghost" id="flip">翻開破解卡</button></div>
      ${videoCard(m)}
      <h2>3. 如果真的發生</h2>
      <div class="callout">${esc(m.ifReal)}</div>
      <h2>4. 和家人一起練習</h2>
      <div class="callout amber">${esc(m.practice)}</div>
      ${m.gear.length ? `<h2>5. 我的裝備</h2><p class="note">缺少裝備不代表失敗，下面是這關可以怎麼做。</p>${gearList(m, true)}${missing.length ? `<p class="note">這次演習中，因為沒帶${missing.map(id => esc(ITEM[id].name)).join('、')}，用了替代做法。</p>` : ''}` : ''}
      <h2>6. 反思三問</h2>
      <ol>${m.reflect.map(q => `<li>${esc(q)}</li>`).join('')}</ol>
      <h2>7. 完成徽章：蓋章！</h2>
      ${stampCard(m.kind === 'mission' ? m.id : null, false)}
      <p><span class="badge">${esc(m.badge)}</span> 已完成 ${doneCount()} / ${MAIN.length} 關。可以隨時重玩這一關。</p>
      <div class="row"><button type="button" class="btn" data-go="hub">回演習基地</button><button type="button" class="btn ghost" id="replay">重玩這一關</button><button type="button" class="btn ghost" data-go="stamps">看集點卡</button><button type="button" class="btn ghost" data-go="card">看防災關鍵卡</button></div>`;
    sfx('win');
    setTimeout(() => sfx('stamp'), 650);
    $('#flip').onclick = () => {
      $('#myth').innerHTML = `<div class="myth"><div class="game"><span class="mark x" aria-hidden="true">✗</span><b>IN GAME 遊戲裡的想法</b><span class="mt">${esc(m.myth.game)}</span><span class="tag-no">✗ 現實中不能這樣</span></div><div class="real"><span class="mark o" aria-hidden="true">✓</span><b>IN REAL LIFE 現實中要這樣</b><span class="mt">${esc(m.myth.real)}</span><span class="tag-yes">✓ 正確做法</span></div></div>
        <p class="note">你也可以想一張自己的破解卡，說給家人聽。</p>`;
    };
    $('#replay').onclick = () => show('brief', m);
    S.cur = null;
  };

  // ---------- 單字庫 ----------
  ROUTES.vocab = function () {
    const words = Object.keys(WORDS).filter(w => WM[w] && WM[w].length);
    const f = S.vocabFilter;
    const shown = f === 'all' ? words : words.filter(w => (WM[w] || []).includes(f));
    app.innerHTML = `
      <p class="eyebrow">CODEBOOK // 單字庫</p>
      <h1>防災探索隊英文單字</h1>
      <p class="lead">點「聽」或「慢」聽發音，跟著唸。英文不計時，也可以跳過。網頁不使用麥克風、不錄音。「說出來了」由家長勾選，只是學習紀錄，不是能力測驗。</p>
      <div class="chips" role="group" aria-label="依關卡篩選">
        <button type="button" class="chip ${f === 'all' ? 'on' : ''}" data-f="all">全部 ${words.length}</button>
        ${MAIN.concat(MBY.p1).map(m => `<button type="button" class="chip ${f === m.id ? 'on' : ''}" data-f="${m.id}">${m.no ? m.no + '. ' : ''}${esc(m.name.split('：')[0])}</button>`).join('')}
      </div>
      <p class="note">顯示 ${shown.length} 個；已聽過 ${S.heard.size} 個；家長勾選「說出來了」 ${S.said.size} 個。</p>
      <div class="table-wrap"><table>
        <tr><th>單字</th><th>中文</th><th>出現的關卡</th><th>說出來了（家長勾選）</th></tr>
        ${shown.map(w => `<tr><td>${wordChip(w)}</td><td>${esc(WORDS[w].zh)}</td><td class="note">${(WM[w] || []).map(id => MBY[id].no ? '第 ' + MBY[id].no + ' 關' : '家庭練習').join('、') || '—'}</td>
          <td><label class="check"><input type="checkbox" data-w="${esc(w)}" ${S.said.has(w) ? 'checked' : ''}> 說出來了</label></td></tr>`).join('')}
      </table></div>
      <h2>任務句</h2>
      ${MISSIONS.filter(m => !m.hidden).flatMap(m => m.phrases.map(p => ({ m, p }))).filter((x, i, a) => a.findIndex(y => y.p.en === x.p.en) === i).map(x => `<p class="en" style="font-size:18px;margin:4px 0">${esc(x.p.en)} ${sayBtns(x.p.en)} <span class="note">${esc(x.p.zh)}</span></p>`).join('')}
      <div class="row"><button type="button" class="btn ghost" id="vreset">清除單字勾選紀錄</button></div>`;
    $$('[data-f]').forEach(b => b.onclick = () => { S.vocabFilter = b.dataset.f; ROUTES.vocab(); });
    $$('[data-w]').forEach(b => b.onchange = () => { b.checked ? S.said.add(b.dataset.w) : S.said.delete(b.dataset.w); save(); });
    $('#vreset').onclick = () => { S.said = new Set(); save(); ROUTES.vocab(); };
  };

  // ---------- 家庭防災檢查表與聯絡卡 ----------
  ROUTES.family = function () {
    const n = CHECKLIST.filter(i => S.fam[i.id]).length;
    app.innerHTML = `
      <p class="eyebrow">FAMILY // 家庭防災練習</p>
      <h1>家庭防災檢查表</h1>
      <p class="lead">和家人一起檢查，完成一項勾一項。勾選只存在這台裝置，不會上傳，也不需要輸入姓名、住址或電話。</p>
      <div class="panel">${growthBlock(n, CHECKLIST.length, '已完成')}
        ${CHECKLIST.map(i => `<label class="check big"><input type="checkbox" data-c="${i.id}" ${S.fam[i.id] ? 'checked' : ''}> ${esc(i.t)}</label>`).join('')}
        <div class="row"><button type="button" class="btn ghost" id="creset">重設檢查表</button></div></div>
      <p class="note">集結點、緊急聯絡人、電話等要寫下來的資訊，請到「防災關鍵卡」的<strong>家庭防災小約定</strong>，列印後由家長手寫。</p>
      <div class="row"><button type="button" class="btn" data-go="card">到防災關鍵卡填寫小約定</button><button type="button" class="btn ghost" data-m-go="p1">做居家安全檢查</button><button type="button" class="btn ghost" id="wipe">清除本機所有紀錄</button></div>`;
    $$('[data-c]').forEach(b => b.onchange = () => { S.fam[b.dataset.c] = b.checked; save(); ROUTES.family(); });
    $('#creset').onclick = () => { S.fam = {}; save(); ROUTES.family(); };
    $('[data-m-go]').onclick = () => show('brief', MBY.p1);
    $('#wipe').onclick = () => { ['settings', 'loadout', 'done', 'said', 'family', 'times', 'doneAt', 'note'].forEach(k => store.remove(k)); S.done = {}; S.said = new Set(); S.fam = {}; S.loadout = []; S.times = {}; S.doneAt = {}; S.note = ''; toast('已清除這台裝置上的遊戲紀錄。'); ROUTES.family(); };
  };
  // 關鍵卡的小約定：集結點會帶入遊戲中選的地點（只是地點名稱）；電話、稱呼等請列印後手寫，網頁不輸入
  const lineV = (l, v) => `<div class="cc-row"><b>${l}</b><span class="cc-line">${esc(v || '')}</span></div>`;

  function printArea(which) {
    document.body.classList.add('print-' + which);
    const done = () => { document.body.classList.remove('print-' + which); window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    try { window.print(); } catch (e) { done(); toast('這個瀏覽器無法開啟列印視窗。'); }
  }

  // 關鍵卡的重點：把第一段關鍵句加粗（到第一個「：」或「，」為止），一眼抓到重點
  const lead = t => { const i = t.search(/[：，]/); return i > 0 && i < 20 ? `<strong>${esc(t.slice(0, i))}</strong>${esc(t.slice(i))}` : `<strong>${esc(t)}</strong>`; };

  // ---------- 防災關鍵卡：六關各一組「孩子須知」（固定內容，不需挑選） ----------
  ROUTES.card = function () {
    app.innerHTML = `
      <p class="eyebrow">KEY CARD // 防災關鍵卡</p>
      <h1>防災關鍵卡</h1>
      <p class="lead">六關各一組「孩子須知」：一句口訣加三個重點，整理成一張 A4 卡片。列印後貼在家裡，和家人一起複習。</p>
      <div id="poster" class="poster a4 keycard">
        <p class="eyebrow">HOME GUARD // 防災關鍵卡</p>
        <h3>先保護自己，再幫助別人</h3>
        <div class="kc-grid">${MAIN.map(m => `<section class="kc"><header><span class="m-icon">${mIcon(m)}</span><b>${m.no}. ${esc(m.name.split('：')[0])}</b></header>
          <p class="slogan">★ ${esc(m.slogan)}</p><ul>${m.keyPoints.map(k => `<li>${lead(k.t)}</li>`).join('')}</ul></section>`).join('')}</div>
        <p class="cc-num"><b class="n119">119</b> 火災、緊急救護　<b class="n110">110</b> 警察</p>
        <div class="promise"><b>家庭防災小約定</b>
          ${lineV('第一集結點（家附近）', S.family.first)}${lineV('第二集結點（較遠）', S.family.second)}${lineV('緊急聯絡人（稱呼）', '')}${lineV('聯絡電話（手寫）', '')}${lineV('學校避難集合地點', '')}${lineV('避難包放在', '')}${lineV('我們約好的集合方式', '')}
        </div>
        <p class="sign">隊員：${esc(S.callsign)}</p>
      </div>
      <p class="note">「家庭防災小約定」是分項的填寫欄：集結點會帶入你在遊戲裡選的地點；緊急聯絡人、電話等請列印後由家長手寫，網頁不輸入也不儲存。</p>
      <div class="row"><button type="button" class="btn" id="print">列印防災關鍵卡</button><span class="note">列印視窗可選「另存為 PDF」，只會印出關鍵卡本身。</span></div>`;
    $('#print').onclick = () => printArea('poster');
  };

  // ---------- 徽章集點卡 ----------
  ROUTES.stamps = function () {
    app.innerHTML = `
      <p class="eyebrow">STAMP CARD // 徽章集點卡</p>
      <h1>我的徽章集點卡</h1>
      <p class="lead">每完成一關蓋一枚章，集滿 ${MAIN.length} 枚就是防災探索隊員！卡片上會記下隊員呼號、通關日期、通關總時間和你的心得。可以重玩任何一關，章不會消失。</p>
      ${stampCard(null, false)}
      <div class="panel"><strong>✍ 我的心得</strong>
        <p class="note">寫下學到了什麼、最有印象的一關。請不要寫真實姓名、住址或電話；心得只存在這台裝置，不會上傳。</p>
        <textarea id="notein" maxlength="300" rows="4" placeholder="例如：我學到地震時要先趴下、掩護、穩住，不能衝樓梯…">${esc(S.note)}</textarea>
        <p class="note"><span id="notecnt">${S.note.length}</span> / 300 字</p></div>
      <div class="grid2">${MAIN.map(m => `<p class="note"><strong>${m.no}. ${esc(m.badge)}</strong>：${esc(m.name)}</p>`).join('')}</div>
      <div class="row"><button type="button" class="btn" data-go="hub">回演習基地</button><button type="button" class="btn ghost" id="ps">列印集點卡</button></div>`;
    $('#notein').oninput = e => { S.note = e.target.value.slice(0, 300); save(); $('#notebox').textContent = S.note; $('#notecnt').textContent = S.note.length; };
    $('#ps').onclick = () => printArea('stamps');
  };

  // ---------- 教材來源 ----------
  ROUTES.sources = function () {
    app.innerHTML = `
      <p class="eyebrow">SOURCES // 教材來源</p>
      <h1>家長參考資料</h1>
      <div class="callout alert"><strong>請先看：</strong>這是一個家庭自製的學習網頁，<strong>沒有獲得任何機關認證或背書</strong>。內容整理自下列公開資料，避難與急救技術以實體課程、官方最新公告與現場指示為準。</div>
      <ul class="src">${SOURCES.map(s => `<li><a href="${s.url}" target="_blank" rel="noopener">${esc(s.name)}</a><br><span class="note">用在：${esc(s.used)}</span></li>`).join('')}</ul>
      <h2>已核對與尚待確認</h2>
      <ul>
        <li><strong>已對照官方頁面：</strong>地震（室內蹲下或趴下、躲堅固桌下、保護頭頸）、防空警報（警報聲、室內與戶外掩蔽方式、避難姿勢、解除聲）、大量出血（直接加壓、止血帶位置與記錄時間、頸頭胸腹不可用；這部分的關卡目前隱藏）、緊急避難包清單。</li>
        <li><strong>一般防災原則、請家長自行對照：</strong>火災逃生（不搭電梯、不躲浴室、濃煙擋路關門求救）、颱風淹水（不涉水、不碰掉落電線）、與家人失散（找可靠的大人、不跟不明人士走）、一般擦傷處理、居家防災檢查。</li>
        <li><strong>「趴下、掩護、穩住」中的「穩住」：</strong>為國際常用口訣；全民安全指引只列蹲下或趴下、掩護、保護頭頸、等待搖晃停止。</li>
        <li><strong>止血帶（關卡目前隱藏）：</strong>若日後恢復，只做虛擬認識，需受過訓練並由大人操作；請參加實體急救課程。</li>
      </ul>
      <div class="row"><button type="button" class="btn" data-go="hub">回演習基地</button></div>`;
  };

  window.HG = { S, show, store, MISSIONS, ITEMS, WORDS, ROUTES, ambKind: () => ambKind };
  applySettings();
  show('title');
})();
