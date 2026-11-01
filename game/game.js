// 家園救援任務：規則式互動流程（離線、不儲存任何資料）
(function () {
  'use strict';

  const app = document.getElementById('app');
  const ITEM = Object.fromEntries(ITEMS.map(i => [i.id, i]));

  // 遊戲狀態只存在記憶體，重新整理就清空
  const S = {
    callsign: '救援一號',
    showBleed: true,
    loadout: [],
    done: {},        // 任務 id → true
    heard: new Set(),
    said: new Set(),
    poster: [],
    cur: null,
  };

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = (id, label) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ITEM[id].icon}</svg>${label ? `<span>${label}</span>` : ''}`;
  const SPEAKER = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 6h3l4-3v10l-4-3H2z"/><path d="M11 5c1.5 1.5 1.5 4.5 0 6" stroke="currentColor" fill="none" stroke-width="1.4"/></svg>';
  const now = () => { const d = new Date(); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };

  function toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => t.classList.remove('show'), 3500);
  }

  // ---------- 發音：瀏覽器內建語音，不錄音 ----------
  function speak(text, slow) {
    if (!('speechSynthesis' in window)) { toast('這個瀏覽器不支援發音，請看音節拆分唸唸看。'); return; }
    const voices = speechSynthesis.getVoices();
    const voice = voices.find(v => /^en[-_]US/i.test(v.lang)) || voices.find(v => /^en/i.test(v.lang));
    if (voices.length && !voice) { toast('這台電腦沒有英文語音，請看音節拆分唸唸看。'); return; }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    if (voice) u.voice = voice;
    u.rate = slow ? 0.6 : 0.95;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
    if (WORDS[text]) S.heard.add(text);
  }
  if ('speechSynthesis' in window) speechSynthesis.getVoices();

  const sayBtns = text => `<button type="button" class="say" data-say="${esc(text)}" aria-label="播放 ${esc(text)} 發音">${SPEAKER}聽</button><button type="button" class="say" data-say="${esc(text)}" data-slow="1" aria-label="慢速播放 ${esc(text)}">慢</button>`;
  const wordChip = w => `<span class="word"><b>${esc(w)}</b><span class="syl">${esc(WORDS[w].syl)}</span>${sayBtns(w)}</span>`;

  // 全域點擊：發音與頁首導覽
  document.addEventListener('click', e => {
    const say = e.target.closest('[data-say]');
    if (say) { speak(say.dataset.say, !!say.dataset.slow); return; }
    const go = e.target.closest('[data-go]');
    if (go) { S.cur = null; show(go.dataset.go); }
  });

  function setNav(name) {
    document.querySelectorAll('.g-nav [data-go]').forEach(b => b.setAttribute('aria-current', String(b.dataset.go === name)));
  }

  function show(name, arg) {
    setNav(name);
    ({ title: renderTitle, armory: renderArmory, map: renderMap, brief: renderBrief, step: renderStep, debrief: renderDebrief, vocab: renderVocab, poster: renderPoster })[name](arg);
    window.scrollTo(0, 0);
  }

  const $ = sel => app.querySelector(sel);
  const $$ = sel => app.querySelectorAll(sel);

  // ---------- 原創徽章 ----------
  const EMBLEM = `<svg viewBox="0 0 200 220" role="img" aria-label="救援隊徽章">
    <path d="M100 8 L184 40 V112 C184 162 146 196 100 212 C54 196 16 162 16 112 V40 Z" fill="#0b1411" stroke="#3ddc84" stroke-width="5"/>
    <path d="M100 26 L166 51 V112 C166 152 137 180 100 193 C63 180 34 152 34 112 V51 Z" fill="none" stroke="#2a6b49" stroke-width="2" stroke-dasharray="6 5"/>
    <path d="M84 62 H116 V94 H148 V126 H116 V158 H84 V126 H52 V94 H84 Z" fill="#3ddc84"/>
    <polyline points="44,110 74,110 84,96 96,128 106,104 114,110 156,110" fill="none" stroke="#0b1411" stroke-width="5" stroke-linejoin="round"/></svg>`;

  // ---------- 標題 ----------
  function renderTitle() {
    app.innerHTML = `
      <section class="title-hero">
        <div>
          <p class="eyebrow">MISSION BRIEFING // 救援隊招募</p>
          <h1>先做到，才能說<br>「別擔心，我來了」</h1>
          <p class="lead">現實中沒有急救針。你將以第一人稱扮演救援隊員，完成 6 個家園任務，學會真正能救人的步驟。</p>
          <p class="en" style="color:var(--green);letter-spacing:2px;margin:0">Don’t worry, I’ve got you. ${sayBtns("Don't worry, I've got you.")}</p>
        </div>
        ${EMBLEM}
      </section>
      <div class="callout alert"><strong>出任務前請先讀：</strong>
        <ul style="margin:4px 0 0">
          <li>這是學習遊戲，不能取代實體急救課程；急救與防災步驟為草案，尚待官方資料核對。</li>
          <li>真實遇到狀況：先確認自己安全，大聲叫大人，撥打 119。</li>
          <li>練習止血帶要有大人在旁，用訓練用止血帶，不要在人身上轉緊到會痛。</li>
        </ul>
      </div>
      <div class="panel">
        <div class="field"><label for="cs">你的呼號</label><input id="cs" type="text" maxlength="12" value="${esc(S.callsign)}"><span class="note">請用暱稱或代號，不要用真實姓名。</span></div>
        <div class="field"><input id="bl" type="checkbox" ${S.showBleed ? 'checked' : ''}><label for="bl">顯示出血量條（只用來表現急迫感，可以關掉）</label></div>
        <p class="note" style="margin:6px 0 0">建議和家長一起玩。每個任務都有給家長的小卡。</p>
      </div>
      <div class="row"><button type="button" class="btn" id="start">進入整備室</button></div>`;
    $('#start').onclick = () => {
      S.callsign = $('#cs').value.trim() || '救援一號';
      S.showBleed = $('#bl').checked;
      show('armory');
    };
  }

  // ---------- 整備室 ----------
  function renderArmory() {
    const slots = Array.from({ length: SLOTS }, (_, i) => {
      const id = S.loadout[i];
      return `<div class="slot ${id ? 'filled' : ''}" title="${id ? esc(ITEM[id].name) : '空格'}">${id ? icon(id) : ''}</div>`;
    }).join('');
    app.innerHTML = `
      <p class="eyebrow">ARMORY // 整備室</p>
      <h1>選擇你的裝備</h1>
      <p class="lead">背包只有 ${SLOTS} 格。想一想：哪些任務會用到照明、求救、止血、包紮？任務之間可以回來換裝備。</p>
      <div class="panel"><strong>背包（${S.loadout.length} / ${SLOTS}）</strong><div class="slots">${slots}</div></div>
      <div class="items">${ITEMS.map(it => `
        <div class="item-card ${S.loadout.includes(it.id) ? 'on' : ''}">
          <div class="top">${icon(it.id)}<div><div class="name">${esc(it.name)}</div>${it.word ? wordChip(it.word) : '<span class="note">（沒有任務單字）</span>'}</div></div>
          <p class="use">${esc(it.use)}</p>
          <button type="button" class="toggle" data-item="${it.id}">${S.loadout.includes(it.id) ? '已裝備（點一下卸下）' : '裝進背包'}</button>
        </div>`).join('')}
      </div>
      <div class="row"><button type="button" class="btn" id="go" ${S.loadout.length ? '' : 'disabled'}>出發：前往任務地圖</button><span class="note">${S.loadout.length ? '' : '至少裝備一件才能出發。'}</span></div>`;
    $$('[data-item]').forEach(b => b.onclick = () => {
      const id = b.dataset.item;
      if (S.loadout.includes(id)) S.loadout = S.loadout.filter(x => x !== id);
      else if (S.loadout.length >= SLOTS) { toast(`背包滿了（${SLOTS} 格），先卸下一件再裝。`); return; }
      else S.loadout.push(id);
      renderArmory();
    });
    $('#go').onclick = () => show('map');
  }

  // ---------- 任務地圖 ----------
  function renderMap() {
    const n = Object.keys(S.done).length;
    app.innerHTML = `
      <p class="eyebrow">OPERATIONS // 任務地圖</p>
      <h1>選擇任務</h1>
      <p class="lead">呼號 <strong>${esc(S.callsign)}</strong>，已完成 ${n} / ${MISSIONS.length} 個任務。可以照順序，也可以先挑想玩的。</p>
      <div class="missions">${MISSIONS.map(m => `
        <button type="button" class="mission-card ${S.done[m.id] ? 'done' : ''}" data-m="${m.id}">
          <span class="status">${S.done[m.id] ? '完成｜' + esc(m.badge) : '待執行'}</span>
          <span class="code">${m.code}</span>
          <span class="mname">${esc(m.name)}</span>
          <span class="note">${esc(m.brief)}</span>
        </button>`).join('')}
      </div>
      <div class="row">
        <button type="button" class="btn ghost" data-go="armory">回整備室換裝備</button>
        <button type="button" class="btn ghost" data-go="vocab">單字庫</button>
        <button type="button" class="btn ghost" data-go="poster" ${n ? '' : 'disabled'}>製作宣傳卡</button>
      </div>`;
    $$('[data-m]').forEach(b => b.onclick = () => show('brief', MISSIONS.find(m => m.id === b.dataset.m)));
  }

  const parentCard = m => `
    <details class="parent"><summary>家長小卡</summary><dl>
      <dt>這關在學什麼</dt><dd>${esc(m.parent.learn)}</dd>
      <dt>可以問孩子的一句話</dt><dd>${esc(m.parent.ask)}</dd>
      <dt>孩子卡住時的提示</dt><dd>${esc(m.parent.hint)}</dd>
      <dt>真實生活延伸</dt><dd>${esc(m.parent.real)}</dd>
    </dl></details>`;

  // ---------- 任務簡報 ----------
  function renderBrief(m) {
    app.innerHTML = `
      <p class="eyebrow">${m.code} // MISSION BRIEFING</p>
      <h1>${esc(m.name)}</h1>
      <div class="panel"><p class="radio" style="margin:0"><span class="who">隊長</span>${esc(S.callsign)}，${esc(m.brief)}</p></div>
      ${m.note ? `<div class="callout amber">${esc(m.note)}</div>` : ''}
      <p>這關的英文單字：</p>
      <div class="opts">${m.words.map(w => `<div>${wordChip(w)} <span class="note">${esc(WORDS[w].zh)}</span></div>`).join('')}</div>
      ${parentCard(m)}
      <div class="row"><button type="button" class="btn" id="go">開始任務</button><button type="button" class="btn ghost" data-go="map">回任務地圖</button></div>`;
    $('#go').onclick = () => {
      S.cur = { m, i: 0, bleed: m.bleed ? 85 : 0, missing: [], picked: new Set(), seq: 0, hold: 0, band: null, time: null, solved: false };
      show('step');
    };
  }

  // ---------- 第一人稱場景 ----------
  function sceneSVG(c) {
    const G = '#3ddc84', D = '#2a6b49', R = '#ff5d52';
    const k = c.m.scene;
    if (k === 'pack') return `<svg viewBox="0 0 400 200"><g fill="none" stroke="${G}" stroke-width="2.5">
      <path d="M150 50 h100 a20 20 0 0 1 20 20 v100 h-140 v-100 a20 20 0 0 1 20-20z"/><path d="M175 50 v-14 h50 v14"/><rect x="160" y="110" width="80" height="40" rx="6"/>
      <path d="M60 150 h40 v-50 l-20-20 l-20 20z" stroke="${D}"/><path d="M300 150 h50 M325 150 v-60 l-15-10 h30 l-15 10" stroke="${D}"/></g>
      <text x="200" y="185" fill="${D}" font-family="Bahnschrift,Arial" font-size="12" text-anchor="middle">GO BAG CHECK</text></svg>`;
    if (k === 'quake') return `<svg viewBox="0 0 400 200"><g fill="none" stroke="${G}" stroke-width="2.5">
      <path d="M0 160 h400" stroke="${D}"/><path d="M120 110 h160 M135 110 v50 M265 110 v50"/><rect x="40" y="40" width="50" height="120" stroke="${D}"/>
      <path d="M55 60 h20 M55 90 h20" stroke="${D}"/><rect x="300" y="30" width="60" height="40" stroke="${D}"/>
      <path d="M10 40 l10 6 l-10 6 M380 90 l10 6 l-10 6 M200 20 l-8 20 l10 5 l-8 20" stroke="${R}"/></g>
      <g fill="${R}"><rect x="96" y="70" width="10" height="10" transform="rotate(20 101 75)"/><circle cx="330" cy="100" r="5"/></g>
      <text x="200" y="185" fill="${R}" font-family="Bahnschrift,Arial" font-size="12" text-anchor="middle">SEISMIC ALERT</text></svg>`;
    if (k === 'siren') return `<svg viewBox="0 0 400 200"><g fill="none" stroke="${G}" stroke-width="2.5">
      <path d="M60 80 h20 l30-25 v90 l-30-25 h-20z"/><path d="M125 70 q20 30 0 60 M140 55 q35 45 0 90" stroke="${R}"/>
      <path d="M220 40 h120 v110 h-120z" stroke="${D}"/><path d="M220 150 h120 v35 h-120z"/><path d="M280 90 v45 m-10-10 l10 10 l10-10"/></g>
      <text x="280" y="175" fill="${G}" font-family="Bahnschrift,Arial" font-size="14" text-anchor="middle">B1 SHELTER</text></svg>`;
    if (k === 'kitchen') return `<svg viewBox="0 0 400 200"><g fill="none" stroke="${D}" stroke-width="2">
      <path d="M0 120 L400 120 M60 200 L150 120 M340 200 L250 120 M200 200 V120"/></g>
      <g fill="none" stroke="${G}" stroke-width="2.5"><path d="M140 150 l12-18 l6 20z M190 165 l18-8 l-4 16z M240 145 l10 14 l-16 2z M170 140 l8-6 l4 9z"/>
      <rect x="320" y="30" width="44" height="76" rx="6"/></g>
      <text x="342" y="75" fill="${R}" font-family="Bahnschrift,Arial" font-size="16" text-anchor="middle">119</text>
      <text x="200" y="40" fill="${R}" font-family="Bahnschrift,Arial" font-size="12" text-anchor="middle">CAUTION: BROKEN GLASS</text></svg>`;
    if (k === 'hand') {
      const drops = Math.round(c.bleed / 20);
      return `<svg viewBox="0 0 400 200"><g fill="none" stroke="${G}" stroke-width="2.5">
        <path d="M120 170 v-60 l-20-30 l10-8 l30 28 v-60 a8 8 0 0 1 16 0 v50 v-62 a8 8 0 0 1 16 0 v62 v-55 a8 8 0 0 1 16 0 v58 v-44 a8 8 0 0 1 16 0 v76 a45 45 0 0 1-45 45 h-10z"/></g>
        <path d="M150 125 l40 10" stroke="${R}" stroke-width="5" stroke-linecap="round"/>
        ${Array.from({ length: drops }, (_, i) => `<circle cx="${165 + i * 9}" cy="${150 + (i % 2) * 8}" r="3.5" fill="${R}"/>`).join('')}
        ${c.i >= 2 ? `<rect x="140" y="112" width="60" height="30" fill="#e4ebe7" opacity="0.85"/>` : ''}
        <text x="300" y="100" fill="${G}" font-family="Bahnschrift,Arial" font-size="13">BLEEDING ${c.bleed}%</text></svg>`;
    }
    if (k === 'leg') return legSVG(c, false);
    return '';
  }

  // 腿部圖：髖部在左、膝蓋在右；傷口在大腿中段
  const ZONES = [
    { id: 'A', x: 110, w: 50, ok: true, fb: '對！傷口上方約 5 到 8 公分，避開關節。' },
    { id: 'B', x: 170, w: 40, fb: '直接綁在傷口上壓不住血流，要綁在傷口「上方」。' },
    { id: 'C', x: 220, w: 45, fb: '血是從靠近身體（心臟）那一側流過來的，綁在傷口下方擋不住，要綁在傷口上方。' },
    { id: 'D', x: 280, w: 42, fb: '膝蓋是關節，有骨頭擋住綁不緊，要避開關節。' },
  ];
  function legSVG(c, clickable) {
    const G = '#3ddc84', R = '#ff5d52';
    const drops = Math.round(c.bleed / 17);
    const band = c.band != null ? `<g><rect x="${c.band - 9}" y="62" width="18" height="76" fill="#1b1b1b" stroke="${G}" stroke-width="2"/>
      <line x1="${c.band}" y1="40" x2="${c.band}" y2="160" stroke="${G}" stroke-width="5" stroke-linecap="round" transform="rotate(${c.hold * 3.6} ${c.band} 100)"/></g>` : '';
    const zones = clickable ? ZONES.map(z => `<g class="zone" data-zone="${z.id}" tabindex="0" role="button" aria-label="位置 ${z.id}">
      <rect x="${z.x}" y="50" width="${z.w}" height="100"/><text x="${z.x + z.w / 2}" y="44" text-anchor="middle">${z.id}</text></g>`).join('') : '';
    return `<svg viewBox="0 0 400 200">
      <path d="M0 55 Q150 50 285 68 Q300 64 320 72 L400 82 L400 128 L320 132 Q300 140 285 134 Q150 152 0 148 Z" fill="#1d2a24" stroke="${G}" stroke-width="2.5"/>
      <ellipse cx="302" cy="100" rx="16" ry="26" fill="none" stroke="#2a6b49" stroke-width="2" stroke-dasharray="4 3"/>
      <text x="302" y="178" fill="#9aa8a1" font-size="12" text-anchor="middle" font-family="Microsoft JhengHei,sans-serif">膝蓋</text>
      <text x="30" y="178" fill="#9aa8a1" font-size="12" font-family="Microsoft JhengHei,sans-serif">← 靠近身體</text>
      <ellipse cx="190" cy="100" rx="13" ry="7" fill="${R}"/>
      ${Array.from({ length: drops }, (_, i) => `<circle cx="${182 + (i % 3) * 8}" cy="${116 + Math.floor(i / 3) * 9}" r="3" fill="${R}"/>`).join('')}
      <text x="190" y="88" fill="${R}" font-size="12" text-anchor="middle" font-family="Microsoft JhengHei,sans-serif">傷口</text>
      ${band}${zones}</svg>`;
  }

  // ---------- 任務步驟（HUD） ----------
  function renderStep() {
    const c = S.cur, m = c.m, st = m.steps[c.i];
    const pack = Array.from({ length: SLOTS }, (_, i) => S.loadout[i] ? `<div class="slot filled" title="${esc(ITEM[S.loadout[i]].name)}">${icon(S.loadout[i])}</div>` : '<div class="slot"></div>').join('');
    const bleed = m.bleed && S.showBleed ? `<span class="bleed">出血量 <span class="bar"><i style="width:${c.bleed}%"></i></span></span>` : '';
    const view = st.type === 'target' ? legSVG(c, !c.solved) : sceneSVG(c);
    app.innerHTML = `
      <div class="hud">
        <div class="hud-top"><span>${m.code} ${esc(m.name)}</span><span class="obj">STEP ${c.i + 1} / ${m.steps.length}</span>${bleed}</div>
        <div class="viewport"><span class="visor">VISOR // ${esc(S.callsign)}</span>
          <span class="corner tl"></span><span class="corner tr"></span><span class="corner bl"></span><span class="corner br"></span>${view}</div>
        <div class="hud-bottom"><div class="pack-mini" aria-label="背包">${pack}</div>
          <p class="radio" aria-live="polite" style="margin:0"><span class="who">隊長</span>${esc(st.radio)}</p></div>
        <div class="action"><p class="prompt">${esc(st.prompt)}</p><div id="ctl"></div><div id="fb" aria-live="polite"></div></div>
      </div>
      ${parentCard(m)}
      <div class="row"><button type="button" class="btn ghost" id="quit">暫停任務，回地圖</button></div>`;
    $('#quit').onclick = () => { S.cur = null; show('map'); };
    ({ choice: ctlChoice, multi: ctlMulti, sequence: ctlSequence, item: ctlItem, hold: ctlHold, target: ctlTarget })[st.type](st, c);
    if (c.solved) solvedUI(c.lastFb, c.lastKind);
  }

  function feedback(text, kind) { $('#fb').innerHTML = `<div class="fb ${kind || ''}">${text}</div>`; }

  // 本步完成：顯示回饋與「下一步」
  function solve(text, kind) {
    const c = S.cur;
    c.solved = true; c.lastFb = text; c.lastKind = kind;
    if (c.m.bleed && c.m.steps[c.i].type !== 'hold') c.bleed = Math.max(c.bleed - 5, c.bleed > 0 ? 5 : 0);
    renderStep();
  }
  function solvedUI(text, kind) {
    $$('#ctl button').forEach(b => b.disabled = true);
    const last = S.cur.i === S.cur.m.steps.length - 1;
    $('#fb').innerHTML = `<div class="fb ${kind || ''}">${text}</div><div class="row"><button type="button" class="btn" id="next">${last ? '完成任務，回報隊長' : '下一步'}</button></div>`;
    $('#next').onclick = next;
    $('#next').focus();
  }
  function next() {
    const c = S.cur;
    if (c.i === c.m.steps.length - 1) { S.done[c.m.id] = true; show('debrief'); return; }
    Object.assign(c, { i: c.i + 1, picked: new Set(), seq: 0, hold: c.m.steps[c.i + 1].type === 'hold' ? 0 : c.hold, solved: false, lastFb: '', lastKind: '' });
    renderStep();
  }

  function ctlChoice(st) {
    $('#ctl').innerHTML = `<div class="opts">${st.options.map((o, k) => `<button type="button" class="opt" data-k="${k}">${esc(o.t)}</button>`).join('')}</div>`;
    $$('[data-k]').forEach(b => b.onclick = () => {
      const o = st.options[b.dataset.k];
      if (o.ok) solve(esc(o.fb || '正確！'));
      else { b.classList.add('wrong'); feedback(`隊長：${esc(o.fb)} 再想想看。`, 'bad'); }
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
      if (wrong.length) feedback('隊長：' + wrong.map(o => `「${esc(o.t)}」：${esc(o.fb)}`).join('<br>'), 'bad');
      else if (missing) feedback(`隊長：方向對了！還有 ${missing} 個也很重要，再找找看。`, 'alt');
      else solve('全部正確！');
    };
  }

  function ctlSequence(st, c) {
    const opts = st.order.map(t => ({ t, ok: true })).concat(st.decoys);
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
      else { b.classList.add('wrong'); feedback(`隊長：${esc(st.decoys.find(d => d.t === t).fb)}`, 'bad'); }
    });
  }

  function ctlItem(st, c) {
    const has = S.loadout.includes(st.need);
    $('#ctl').innerHTML = `<div class="picks">${S.loadout.map(id => `<button type="button" class="pick" data-id="${id}">${icon(id, esc(ITEM[id].name))}</button>`).join('')}
      <button type="button" class="pick none" id="none">背包裡沒有合適的</button></div>`;
    const done = () => {
      const w = ITEM[st.need].word;
      const extra = st.time ? `<br>寫下時間：<strong class="en">T ${c.time = c.time || now()}</strong>` : '';
      return `${esc(ITEM[st.need].name)} 上場！ ${wordChip(w)}${extra}`;
    };
    $$('[data-id]').forEach(b => b.onclick = () => {
      if (b.dataset.id === st.need) solve(done());
      else feedback(`隊長：${esc(ITEM[b.dataset.id].name)}現在派不上用場。${esc(ITEM[b.dataset.id].use)}`, 'bad');
    });
    $('#none').onclick = () => {
      if (has) { feedback('隊長：再看看背包，你有帶合適的裝備喔！', 'alt'); return; }
      c.missing.push(st.need);
      if (st.time) c.time = c.time || now();
      solve(`隊長：沒關係，用替代做法。${esc(st.alt)}${st.time ? `<br>記下的時間：<strong class="en">${c.time}</strong>` : ''}`, 'alt');
    };
  }

  function ctlHold(st, c) {
    const start = c.bleed;
    $('#ctl').innerHTML = `<button type="button" class="hold-btn" id="hold" style="--p:${c.hold}%">${esc(st.label)}（${Math.round(c.hold)}%）</button>
      <p class="note">用滑鼠或手指按住不放；也可以按住空白鍵。放開會暫停。 ${wordChip(st.verb)}</p>`;
    const btn = $('#hold');
    let timer = null;
    const tick = () => {
      c.hold = Math.min(100, c.hold + 2.5);
      c.bleed = Math.round(start * (1 - c.hold / 100) + (st.verb === 'press' ? 15 * c.hold / 100 : 0));
      btn.style.setProperty('--p', c.hold + '%');
      btn.textContent = `${st.label}（${Math.round(c.hold)}%）`;
      const bar = app.querySelector('.bleed i'); if (bar) bar.style.width = c.bleed + '%';
      if (c.hold >= 100) { stop(); solve(st.verb === 'press' ? '出血變少了，繼續保持壓住！' : `不再流血了！${st.after ? '<br>' + esc(st.after) : ''}`); }
    };
    const go = e => { e.preventDefault(); if (!timer) timer = setInterval(tick, 50); };
    const stop = () => { clearInterval(timer); timer = null; };
    btn.addEventListener('pointerdown', go);
    ['pointerup', 'pointerleave', 'pointercancel', 'blur'].forEach(ev => btn.addEventListener(ev, stop));
    btn.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') go(e); });
    btn.addEventListener('keyup', stop);
  }

  function ctlTarget(st, c) {
    $('#ctl').innerHTML = '<p class="note">在上方的腿部圖點選 A、B、C、D 其中一個位置。</p>';
    app.querySelectorAll('[data-zone]').forEach(g => {
      const pick = () => {
        const z = ZONES.find(z => z.id === g.dataset.zone);
        if (z.ok) { c.band = z.x + z.w / 2; solve(esc(z.fb) + ' 不確定位置時，就綁「高且緊」：盡量靠近身體那一側。'); }
        else feedback(`隊長：${esc(z.fb)}`, 'bad');
      };
      g.addEventListener('click', pick);
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
    });
  }

  // ---------- 任務覆盤 ----------
  function renderDebrief() {
    const c = S.cur, m = c.m;
    const decoys = S.loadout.filter(id => ITEM[id].decoy);
    const report = m.id === 'm6' ? `Tourniquet on! Time ${c.time || now()}.` : null;
    app.innerHTML = `
      <p class="eyebrow">${m.code} // DEBRIEF</p>
      <h1>任務完成：${esc(m.name)}</h1>
      <div class="unlock">
        <p class="eyebrow">UNLOCKED // 你做到了，現在可以說</p>
        <p class="phrase">Don’t worry, I’ve got you.</p>
        <p class="zh">別擔心，我來了</p>
        ${sayBtns("Don't worry, I've got you.")}
        <div><span class="badge">徽章：${esc(m.badge)}</span></div>
      </div>
      ${report ? `<div class="panel"><strong>無線電回報（英文）</strong><p class="en" style="font-size:20px;margin:4px 0">${report} ${sayBtns(report)}</p></div>` : ''}
      <h2>遊戲 vs 現實：破解卡</h2>
      <div id="myth"><button type="button" class="btn ghost" id="flip">翻開破解卡</button></div>
      <h2>這關的重點</h2>
      <ol>${m.keyPoints.map(k => `<li>${esc(k)}</li>`).join('')}</ol>
      ${c.missing.length ? `<div class="callout amber">這次背包裡沒有：${c.missing.map(id => esc(ITEM[id].name)).join('、')}，所以用了替代做法。下次出任務前，想想要不要帶上它。</div>` : ''}
      ${decoys.length ? `<div class="callout">你的背包裡有${decoys.map(id => esc(ITEM[id].name)).join('、')}。這次有用到嗎？</div>` : ''}
      <h2>和家長一起想三個問題</h2>
      <ol>${REFLECT.map(q => `<li>${esc(q)}</li>`).join('')}</ol>
      <h2>這關的單字</h2>
      <div class="opts">${m.words.map(w => `<div>${wordChip(w)} <span class="note">${esc(WORDS[w].zh)}</span></div>`).join('')}</div>
      <div class="row"><button type="button" class="btn" data-go="map">回任務地圖</button><button type="button" class="btn ghost" data-go="armory">回整備室換裝備</button></div>`;
    $('#flip').onclick = () => {
      $('#myth').innerHTML = `<div class="myth"><div class="game"><b>IN GAME 遊戲裡</b>${esc(m.myth.game)}</div><div class="real"><b>IN REAL LIFE 現實中</b>${esc(m.myth.real)}</div></div>
        <p class="note">你也可以想一張自己的破解卡，說給家人聽。</p>`;
    };
    S.cur = null;
  }

  // ---------- 單字庫 ----------
  function renderVocab() {
    const words = Object.keys(WORDS);
    app.innerHTML = `
      <p class="eyebrow">CODEBOOK // 單字庫</p>
      <h1>救援隊英文單字</h1>
      <p class="lead">點「聽」或「慢」聽發音，跟著唸。英文不計時，也可以跳過。網頁不使用麥克風、不錄音。</p>
      <p class="note">已聽過 ${S.heard.size} / ${words.length} 個；家長勾選「說出來了」 ${S.said.size} 個。</p>
      <div class="table-wrap"><table>
        <tr><th>單字</th><th>中文</th><th>說出來了（家長勾選）</th></tr>
        ${words.map(w => `<tr><td>${wordChip(w)}</td><td>${esc(WORDS[w].zh)}</td>
          <td><label class="check"><input type="checkbox" data-w="${esc(w)}" ${S.said.has(w) ? 'checked' : ''}> 說出來了</label></td></tr>`).join('')}
      </table></div>
      <h2>任務句</h2>
      <p class="en" style="font-size:19px">Don’t worry, I’ve got you. ${sayBtns("Don't worry, I've got you.")}</p>
      <p class="en" style="font-size:19px">Call for help! ${sayBtns('Call for help!')}</p>`;
    $$('[data-w]').forEach(b => b.onchange = () => { b.checked ? S.said.add(b.dataset.w) : S.said.delete(b.dataset.w); });
  }

  // ---------- 宣傳卡 ----------
  function renderPoster() {
    const done = MISSIONS.filter(m => S.done[m.id]);
    if (!done.length) {
      app.innerHTML = `<p class="eyebrow">PROPAGANDA // 宣傳卡</p><h1>救援隊宣傳卡</h1>
        <div class="callout amber">先完成至少一個任務，才有重點可以放進宣傳卡。</div>
        <div class="row"><button type="button" class="btn" data-go="map">前往任務地圖</button></div>`;
      return;
    }
    const pts = done.flatMap(m => m.keyPoints);
    S.poster = S.poster.filter(p => pts.includes(p));
    app.innerHTML = `
      <p class="eyebrow">PROPAGANDA // 宣傳卡</p>
      <h1>救援隊宣傳卡</h1>
      <p class="lead">從你學過的重點挑 3 個最重要的，做成宣傳卡，去教家人或同學。能教別人，才是真的學會。</p>
      <div class="panel">${pts.map(p => `<label class="check"><input type="checkbox" data-p="${esc(p)}" ${S.poster.includes(p) ? 'checked' : ''}> ${esc(p)}</label>`).join('')}</div>
      <div id="poster" class="poster">
        <p class="eyebrow">HOME GUARD // 救援隊宣傳卡</p>
        <h3>先做到，才能說「別擔心，我來了」</h3>
        <ol>${S.poster.map(p => `<li>${esc(p)}</li>`).join('') || '<li class="note">（請在上方勾選 3 個重點）</li>'}</ol>
        <p class="note">現實中沒有急救針，能救人的是平常學會的步驟。遇到危險：先確認安全、叫大人、撥 119。</p>
        <p class="sign">隊員：${esc(S.callsign)}</p>
      </div>
      <div class="row"><button type="button" class="btn" id="print" ${S.poster.length === 3 ? '' : 'disabled'}>列印宣傳卡</button><span class="note">已選 ${S.poster.length} / 3。列印視窗可選「另存為 PDF」。</span></div>`;
    $$('[data-p]').forEach(b => b.onchange = () => {
      const p = b.dataset.p;
      if (b.checked) {
        if (S.poster.length >= 3) { b.checked = false; toast('最多選 3 個重點，先取消一個再選。'); return; }
        S.poster.push(p);
      } else S.poster = S.poster.filter(x => x !== p);
      renderPoster();
    });
    $('#print').onclick = () => window.print();
  }

  show('title');
})();
