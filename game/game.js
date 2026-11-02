// 家園救援任務：平日整備與演習的規則式互動（離線、不儲存任何資料）
(function () {
  'use strict';

  const app = document.getElementById('app');
  const ITEM = Object.fromEntries(ITEMS.map(i => [i.id, i]));
  const PREP = MISSIONS.filter(m => m.kind === 'prep');
  const DRILL = MISSIONS.filter(m => m.kind === 'drill');

  // 遊戲狀態只存在記憶體，重新整理就清空
  const S = {
    callsign: '救援一號',
    showBleed: true,
    loadout: [],
    done: {},
    heard: new Set(),
    said: new Set(),
    points: [],
    family: { first: '', second: '', contact: '' },
    cur: null,
  };

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const svg24 = body => `<svg viewBox="0 0 24 24" aria-hidden="true">${body}</svg>`;
  const icon = (id, label) => svg24(ITEM[id].icon) + (label ? `<span>${label}</span>` : '');
  const mIcon = m => svg24(m.icon);
  const timeline = steps => `<ol class="timeline">${steps.map(s => `<li><span>${esc(s)}</span></li>`).join('')}</ol>`;
  const SPEAKER = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 6h3l4-3v10l-4-3H2z"/><path d="M11 5c1.5 1.5 1.5 4.5 0 6" stroke="currentColor" fill="none" stroke-width="1.4"/></svg>';
  const now = () => { const d = new Date(); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
  const $ = sel => app.querySelector(sel);
  const $$ = sel => app.querySelectorAll(sel);

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

  document.addEventListener('click', e => {
    const say = e.target.closest('[data-say]');
    if (say) { speak(say.dataset.say, !!say.dataset.slow); return; }
    const go = e.target.closest('[data-go]');
    if (go) { S.cur = null; show(go.dataset.go); }
  });

  function show(name, arg) {
    document.querySelectorAll('.g-nav [data-go]').forEach(b => b.setAttribute('aria-current', String(b.dataset.go === name)));
    ({ title: renderTitle, hub: renderHub, brief: renderBrief, gobag: renderGobag, step: renderStep, debrief: renderDebrief, vocab: renderVocab, card: renderCard })[name](arg);
    window.scrollTo(0, 0);
  }

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
          <p class="eyebrow">MISSION BRIEFING // 平日演習</p>
          <h1>先做到，才能說<br>「別擔心，我來了」</h1>
          <p class="lead">大災難不會先通知。平常先把家整備好、先演習過，真的發生時才知道怎麼做。現實中沒有急救針，能救人的是平常學會的步驟。</p>
          <p class="en" style="color:var(--green);letter-spacing:2px;margin:0">Don’t worry, I’ve got you. ${sayBtns("Don't worry, I've got you.")}</p>
        </div>
        ${EMBLEM}
      </section>
      <div class="callout alert"><strong>出任務前請先讀：</strong>
        <ul style="margin:4px 0 0">
          <li>這是學習與演習遊戲，不能取代實體急救課程；防災與急救步驟為草案，尚待官方資料核對。</li>
          <li>真實遇到狀況：先確認自己安全，大聲叫大人，撥打 119。</li>
          <li>練習止血帶要有大人在旁，用訓練用止血帶，不要在人身上轉緊到會痛。</li>
        </ul>
      </div>
      <div class="panel">
        <div class="field"><label for="cs">你的呼號</label><input id="cs" type="text" maxlength="12" value="${esc(S.callsign)}"><span class="note">請用暱稱或代號，不要用真實姓名。</span></div>
        <div class="field"><input id="bl" type="checkbox" ${S.showBleed ? 'checked' : ''}><label for="bl">顯示出血量條（只用來表現急迫感，可以關掉）</label></div>
        <p class="note" style="margin:6px 0 0">建議和家長一起玩。每一站都有給家長的小卡。</p>
      </div>
      <div class="row"><button type="button" class="btn" id="start">進入演習基地</button></div>`;
    $('#start').onclick = () => {
      S.callsign = $('#cs').value.trim() || '救援一號';
      S.showBleed = $('#bl').checked;
      show('hub');
    };
  }

  // ---------- 演習基地 ----------
  const card = m => `
    <button type="button" class="mission-card ${S.done[m.id] ? 'done' : ''}" data-m="${m.id}">
      <span class="status">${S.done[m.id] ? '完成｜' + esc(m.badge) : '待執行'}</span>
      <span class="m-icon">${mIcon(m)}</span>
      <span class="code">${m.code}</span>
      <span class="mname">${esc(m.name)}</span>
      <span class="note">${esc(m.brief)}</span>
    </button>`;

  function renderHub() {
    const n = Object.keys(S.done).length;
    app.innerHTML = `
      <p class="eyebrow">HOME BASE // 演習基地</p>
      <h1>平日整備，災時不慌</h1>
      <p class="lead">呼號 <strong>${esc(S.callsign)}</strong>，已完成 ${n} / ${MISSIONS.length} 站。建議先完成平日整備，再進行演習：演習中會用到你準備的防災包和集結點。</p>
      <h2>平日整備</h2>
      <div class="missions">${PREP.map(card).join('')}</div>
      <h2>演習</h2>
      <div class="missions">${DRILL.map(card).join('')}</div>
      <div class="row">
        <button type="button" class="btn ghost" data-go="vocab">單字庫</button>
        <button type="button" class="btn ghost" data-go="card">製作我們家的防災卡</button>
      </div>`;
    $$('[data-m]').forEach(b => b.onclick = () => show('brief', MISSIONS.find(m => m.id === b.dataset.m)));
  }

  const parentCard = m => `
    <details class="parent"><summary>家長小卡</summary><dl>
      <dt>這站在學什麼</dt><dd>${esc(m.parent.learn)}</dd>
      <dt>可以問孩子的一句話</dt><dd>${esc(m.parent.ask)}</dd>
      <dt>孩子卡住時的提示</dt><dd>${esc(m.parent.hint)}</dd>
      <dt>真實生活延伸</dt><dd>${esc(m.parent.real)}</dd>
    </dl></details>`;

  // ---------- 簡報 ----------
  function renderBrief(m) {
    app.innerHTML = `
      <p class="eyebrow">${m.code} // ${m.kind === 'drill' ? 'DRILL BRIEFING' : 'PREPARATION'}</p>
      <h1 class="with-icon"><span class="m-icon big">${mIcon(m)}</span>${esc(m.name)}</h1>
      <div class="panel"><p class="radio" style="margin:0"><span class="who">隊長</span>${esc(S.callsign)}，${esc(m.brief)}</p></div>
      ${m.note ? `<div class="callout amber">${esc(m.note)}</div>` : ''}
      ${m.kind === 'drill' && !S.loadout.length ? '<div class="callout amber">你還沒準備防災包。演習中需要用到物品時，會改教替代做法；也可以先回基地完成「防災包整備」。</div>' : ''}
      <h2>流程</h2>
      ${timeline(m.flow)}
      <p>這站的英文單字：</p>
      <div class="opts">${m.words.map(w => `<div>${wordChip(w)} <span class="note">${esc(WORDS[w].zh)}</span></div>`).join('')}</div>
      ${parentCard(m)}
      <div class="row"><button type="button" class="btn" id="go">開始</button><button type="button" class="btn ghost" data-go="hub">回演習基地</button></div>`;
    $('#go').onclick = () => {
      if (m.gobag) { show('gobag', m); return; }
      S.cur = { m, i: 0, bleed: m.bleed ? 85 : 0, missing: [], picked: new Set(), found: new Set(), seq: 0, hold: 0, band: null, time: null, solved: false };
      show('step');
    };
  }

  // ---------- 防災包整備 ----------
  function renderGobag(m, checked) {
    const slots = Array.from({ length: SLOTS }, (_, i) => {
      const id = S.loadout[i];
      return `<div class="slot ${id ? 'filled' : ''}" title="${id ? esc(ITEM[id].name) : '空格'}">${id ? icon(id) : ''}</div>`;
    }).join('');
    const missNeed = ITEMS.filter(it => it.need && !S.loadout.includes(it.id));
    const decoys = S.loadout.filter(id => ITEM[id].decoy);
    const report = checked ? `
      <div class="panel" id="report"><strong>防災包檢查</strong>
        ${missNeed.length ? `<p>還缺 ${missNeed.length} 樣必備物品：</p><ul>${missNeed.map(it => `<li><strong>${esc(it.name)}</strong>：${esc(it.use)}</li>`).join('')}</ul>` : '<p>必備物品全部到齊！</p>'}
        ${decoys.length ? `<p>背包裡有${decoys.map(id => esc(ITEM[id].name)).join('、')}：${decoys.map(id => esc(ITEM[id].use)).join(' ')}</p>` : ''}
        ${!S.loadout.includes('tourniquet') ? '<p class="note">提示：演習二會用到止血帶和麥克筆，空間夠的話可以加帶。</p>' : ''}
        <div class="row"><button type="button" class="btn" id="finish">完成整備</button><span class="note">還想調整可以繼續改，再按一次「檢查防災包」。</span></div>
      </div>` : '';
    app.innerHTML = `
      <p class="eyebrow">${m.code} // GO BAG</p>
      <h1 class="with-icon"><span class="m-icon big">${mIcon(m)}</span>整理我們家的防災包</h1>
      <p class="lead">背包只有 ${SLOTS} 格。標示「必備」的要優先放，再用剩下的空間加帶建議物品。</p>
      <div class="panel"><strong>防災包（${S.loadout.length} / ${SLOTS}）</strong><div class="slots">${slots}</div>
        <div class="row" style="margin-bottom:0"><button type="button" class="btn" id="check" ${S.loadout.length ? '' : 'disabled'}>檢查防災包</button></div></div>
      ${report}
      <div class="items">${ITEMS.map(it => `
        <div class="item-card ${S.loadout.includes(it.id) ? 'on' : ''}">
          ${it.need ? '<span class="pill need">必備</span>' : it.opt ? '<span class="pill opt">建議</span>' : ''}
          <div class="top">${icon(it.id)}<div><div class="name">${esc(it.name)}</div>${it.word ? wordChip(it.word) : ''}</div></div>
          <p class="use">${checked || !it.decoy ? esc(it.use) : '這個要帶嗎？想一想。'}</p>
          <button type="button" class="toggle" data-item="${it.id}">${S.loadout.includes(it.id) ? '已放入（點一下拿出）' : '放進防災包'}</button>
        </div>`).join('')}
      </div>
      ${parentCard(m)}`;
    $$('[data-item]').forEach(b => b.onclick = () => {
      const id = b.dataset.item;
      if (S.loadout.includes(id)) S.loadout = S.loadout.filter(x => x !== id);
      else if (S.loadout.length >= SLOTS) { toast(`防災包滿了（${SLOTS} 格），先拿出一樣再放。`); return; }
      else S.loadout.push(id);
      const y = window.scrollY;
      renderGobag(m, false);
      window.scrollTo(0, y);
    });
    $('#check').onclick = () => { renderGobag(m, true); $('#report').scrollIntoView({ block: 'center' }); };
    if (checked) $('#finish').onclick = () => {
      S.done[m.id] = true;
      S.cur = { m, missing: [] };
      show('debrief');
    };
  }

  // ---------- 第一人稱場景 ----------
  const G = '#3ddc84', D = '#2a6b49', R = '#ff5d52';
  const T = (x, y, s, fill, size, anchor) => `<text x="${x}" y="${y}" fill="${fill}" font-family="Bahnschrift,Microsoft JhengHei,sans-serif" font-size="${size || 12}" text-anchor="${anchor || 'middle'}">${s}</text>`;

  function sceneSVG(c, st) {
    const k = st.scene || c.m.scene;
    if (k === 'quake') return `<svg viewBox="0 0 400 200"><g fill="none" stroke="${G}" stroke-width="2.5">
      <path d="M0 160 h400" stroke="${D}"/><path d="M120 110 h160 M135 110 v50 M265 110 v50"/><rect x="40" y="40" width="50" height="120" stroke="${D}"/>
      <path d="M55 60 h20 M55 90 h20" stroke="${D}"/><rect x="300" y="30" width="60" height="40" stroke="${D}"/>
      <path d="M10 40 l10 6 l-10 6 M380 90 l10 6 l-10 6 M200 20 l-8 20 l10 5 l-8 20" stroke="${R}"/></g>
      <g fill="${R}"><rect x="96" y="70" width="10" height="10" transform="rotate(20 101 75)"/><circle cx="330" cy="100" r="5"/></g>
      ${T(200, 185, 'SEISMIC ALERT', R)}</svg>`;
    if (k === 'raid') return `<svg viewBox="0 0 400 200"><g fill="none" stroke="${D}" stroke-width="2.5">
      <path d="M0 170 V110 h50 V80 h40 v90 M100 170 V95 h60 v75 M240 170 V70 h50 v100 M300 170 V100 h60 v70 M360 170 V120 h40"/></g>
      <path d="M0 170 h400" stroke="${D}" stroke-width="2"/>
      <g fill="none" stroke="${G}" stroke-width="2.5"><path d="M180 60 h14 l20-16 v56 l-20-16 h-14z"/></g>
      <path d="M222 50 q12 22 0 44 M234 40 q22 32 0 64" fill="none" stroke="${R}" stroke-width="2.5"/>
      <rect x="160" y="135" width="80" height="28" fill="#0b1411" stroke="${G}" stroke-width="2"/>${T(200, 154, 'SHELTER ↓', G, 13)}
      ${T(200, 22, 'AIR RAID ALERT', R)}</svg>`;
    if (k === 'leg') return legSVG(c, null);
    return '';
  }

  // 腿部圖：髖部在左、膝蓋在右；傷口在大腿中段
  function legSVG(c, zones) {
    const drops = Math.round(c.bleed / 17);
    const band = c.band != null ? `<g><rect x="${c.band - 9}" y="62" width="18" height="76" fill="#1b1b1b" stroke="${G}" stroke-width="2"/>
      <line x1="${c.band}" y1="40" x2="${c.band}" y2="160" stroke="${G}" stroke-width="5" stroke-linecap="round" transform="rotate(${c.hold * 3.6} ${c.band} 100)"/></g>` : '';
    return `<svg viewBox="0 0 400 200">
      <path d="M0 55 Q150 50 285 68 Q300 64 320 72 L400 82 L400 128 L320 132 Q300 140 285 134 Q150 152 0 148 Z" fill="#1d2a24" stroke="${G}" stroke-width="2.5"/>
      <ellipse cx="302" cy="100" rx="16" ry="26" fill="none" stroke="${D}" stroke-width="2" stroke-dasharray="4 3"/>
      ${T(302, 180, '膝蓋', '#9aa8a1')}${T(10, 180, '← 靠近身體', '#9aa8a1', 12, 'start')}
      <ellipse cx="190" cy="100" rx="13" ry="7" fill="${R}"/>
      ${Array.from({ length: drops }, (_, i) => `<circle cx="${182 + (i % 3) * 8}" cy="${116 + Math.floor(i / 3) * 9}" r="3" fill="${R}"/>`).join('')}
      ${T(190, 88, '傷口', R)}${band}${zones || ''}</svg>`;
  }

  // 小鎮地圖：家在左側，周圍有公園、騎樓、加油站、學校
  function townSVG(zones) {
    return `<svg viewBox="0 0 400 220">
      <g stroke="#24332d" stroke-width="14" fill="none"><path d="M0 110 H400 M220 0 V220 M110 110 V220"/></g>
      <g fill="none" stroke="${D}" stroke-width="2"><path d="M30 60 l30-24 30 24 v40 h-60z"/><rect x="45" y="78" width="14" height="22"/></g>
      ${T(60, 30, '我們家', G, 13)}
      <rect x="236" y="18" width="116" height="70" fill="rgba(61,220,132,0.08)"/><g fill="${D}"><circle cx="260" cy="45" r="8"/><circle cx="330" cy="60" r="9"/><circle cx="300" cy="35" r="7"/></g>
      <rect x="118" y="124" width="92" height="10" fill="${D}"/><path d="M122 124 v-12 h84 v12" fill="none" stroke="${D}" stroke-width="2"/>
      <rect x="248" y="150" width="38" height="24" fill="none" stroke="${R}" stroke-width="2"/><path d="M262 150 v-8 h10 v8" stroke="${R}" fill="none"/>
      <rect x="318" y="146" width="76" height="66" fill="rgba(61,220,132,0.05)"/><ellipse cx="356" cy="182" rx="28" ry="18" fill="none" stroke="${D}" stroke-width="2"/>
      ${zones}</svg>`;
  }

  // 居家巡視：書櫃、床、門口、瓦斯開關、滅火器
  function roomSVG(c, st) {
    const shown = (i, s) => c.found.has(i) ? `<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="rgba(61,220,132,0.18)" stroke="${G}" stroke-width="2"/>${T(s.x + s.w / 2, s.y + s.h / 2 + 5, '✓', G, 16)}` : '';
    const zones = st.spots.map((s, i) => `<g class="zone hot ${c.hint && !c.found.has(i) ? 'hinted' : ''}" data-spot="${i}" tabindex="0" role="button" aria-label="檢查點"><rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}"/></g>${shown(i, s)}`).join('')
      + st.safe.map((s, i) => `<g class="zone hot" data-safe="${i}" tabindex="0" role="button" aria-label="檢查點"><rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}"/></g>`).join('');
    return `<svg viewBox="0 0 400 220">
      <path d="M0 196 H400" stroke="${D}" stroke-width="2"/>
      <g fill="none" stroke="${G}" stroke-width="2.2">
        <rect x="30" y="46" width="60" height="142"/><path d="M30 82 h60 M30 118 h60 M30 154 h60"/>
        <rect x="38" y="22" width="44" height="22" fill="#1d2a24"/>
        <rect x="140" y="150" width="120" height="40"/><rect x="146" y="138" width="34" height="14"/>
        <rect x="172" y="56" width="56" height="42"/><path d="M180 64 l40 26" stroke="${D}"/>
        <rect x="316" y="58" width="58" height="134" stroke="${D}"/><circle cx="364" cy="128" r="3"/>
        <rect x="302" y="168" width="22" height="22" fill="#1d2a24"/><rect x="318" y="156" width="26" height="34" fill="#1d2a24"/><rect x="306" y="152" width="16" height="16" fill="#1d2a24"/>
        <path d="M296 110 h-40 M276 110 v-10"/><circle cx="276" cy="100" r="7" stroke="${R}"/>
      </g>
      <rect x="104" y="150" width="20" height="38" rx="6" fill="#5a1f1b" stroke="${R}" stroke-width="2"/><path d="M110 150 v-6 h10" stroke="${R}" fill="none" stroke-width="2"/>
      <rect x="150" y="196" width="110" height="10" fill="${D}"/>
      ${zones}</svg>`;
  }

  // ---------- 步驟（HUD） ----------
  function renderStep() {
    const c = S.cur, m = c.m, st = m.steps[c.i];
    const pack = S.loadout.length ? S.loadout.map(id => `<div class="slot filled" title="${esc(ITEM[id].name)}">${icon(id)}</div>`).join('') : '<span class="note">防災包是空的</span>';
    const bleed = m.bleed && S.showBleed ? `<span class="bleed">出血量 <span class="bar"><i style="width:${c.bleed}%"></i></span></span>` : '';
    let view;
    if (st.type === 'hunt') view = roomSVG(c, st);
    else if (st.type === 'map') {
      const z = c.solved ? '' : st.zones.map(z => `<g class="zone" data-zone="${z.id}" tabindex="0" role="button" aria-label="${esc(z.label)}">
        <rect x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}"/>${T(z.x + z.w / 2, st.map === 'leg' ? z.y - 6 : z.y + z.h / 2 + 5, esc(z.label), G, st.map === 'leg' ? 18 : 13)}</g>`).join('');
      view = st.map === 'leg' ? legSVG(c, z) : townSVG(z);
    } else view = sceneSVG(c, st);
    app.innerHTML = `
      <div class="hud">
        <div class="hud-top"><span>${m.code} ${esc(m.name)}</span><span class="obj">STEP ${c.i + 1} / ${m.steps.length}</span>${bleed}</div>
        <div class="viewport${st.type === 'hunt' || (st.type === 'map' && st.map !== 'leg') ? ' tall' : ''}"><span class="visor">VISOR // ${esc(S.callsign)}</span>
          <span class="corner tl"></span><span class="corner tr"></span><span class="corner bl"></span><span class="corner br"></span>${view}</div>
        <div class="hud-bottom"><div class="pack-mini" aria-label="防災包">${pack}</div>
          <p class="radio" aria-live="polite" style="margin:0"><span class="who">隊長</span>${esc(st.radio)}</p></div>
        <div class="action"><p class="prompt">${esc(st.prompt)}</p><div id="ctl"></div><div id="fb" aria-live="polite"></div></div>
      </div>
      ${parentCard(m)}
      <div class="row"><button type="button" class="btn ghost" id="quit">暫停，回演習基地</button></div>`;
    $('#quit').onclick = () => { S.cur = null; show('hub'); };
    ({ choice: ctlChoice, multi: ctlMulti, sequence: ctlSequence, item: ctlItem, hold: ctlHold, map: ctlMap, hunt: ctlHunt })[st.type](st, c);
    if (c.solved) solvedUI(c.lastFb, c.lastKind);
  }

  function feedback(text, kind) { $('#fb').innerHTML = `<div class="fb ${kind || ''}">${text}</div>`; }

  function solve(text, kind) {
    const c = S.cur;
    c.solved = true; c.lastFb = text; c.lastKind = kind;
    if (c.m.bleed && c.m.steps[c.i].type !== 'hold') c.bleed = Math.max(c.bleed - 5, c.bleed > 0 ? 5 : 0);
    renderStep();
  }
  function solvedUI(text, kind) {
    $$('#ctl button').forEach(b => b.disabled = true);
    const last = S.cur.i === S.cur.m.steps.length - 1;
    $('#fb').innerHTML = `<div class="fb ${kind || ''}">${text}</div><div class="row"><button type="button" class="btn" id="next">${last ? '完成，回報隊長' : '下一步'}</button></div>`;
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
      else { b.classList.add('wrong'); feedback(`隊長：${esc(st.decoys.find(d => d.t === t).fb)}`, 'bad'); }
    });
  }

  function ctlItem(st, c) {
    const has = S.loadout.includes(st.need);
    $('#ctl').innerHTML = `<div class="picks">${S.loadout.map(id => `<button type="button" class="pick" data-id="${id}">${icon(id, esc(ITEM[id].name))}</button>`).join('')}
      <button type="button" class="pick none" id="none">防災包裡沒有合適的</button></div>`;
    $$('[data-id]').forEach(b => b.onclick = () => {
      if (b.dataset.id === st.need) {
        const extra = st.time ? `<br>寫下時間：<strong class="en">T ${c.time = c.time || now()}</strong>` : '';
        solve(`${esc(ITEM[st.need].name)} 上場！ ${wordChip(ITEM[st.need].word)}${extra}`);
      } else feedback(`隊長：${esc(ITEM[b.dataset.id].name)}現在派不上用場。`, 'bad');
    });
    $('#none').onclick = () => {
      if (has) { feedback('隊長：再看看防災包，你有帶喔！', 'alt'); return; }
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
    const stop = () => { clearInterval(timer); timer = null; };
    const tick = () => {
      c.hold = Math.min(100, c.hold + 2.5);
      c.bleed = Math.round(start * (1 - c.hold / 100));
      btn.style.setProperty('--p', c.hold + '%');
      btn.textContent = `${st.label}（${Math.round(c.hold)}%）`;
      const bar = app.querySelector('.bleed i'); if (bar) bar.style.width = c.bleed + '%';
      if (c.hold >= 100) { stop(); solve(`不再流血了！${st.after ? '<br>' + esc(st.after) : ''}`); }
    };
    const go = e => { e.preventDefault(); if (!timer) timer = setInterval(tick, 50); };
    btn.addEventListener('pointerdown', go);
    ['pointerup', 'pointerleave', 'pointercancel', 'blur'].forEach(ev => btn.addEventListener(ev, stop));
    btn.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') go(e); });
    btn.addEventListener('keyup', stop);
  }

  // 點擊或鍵盤選取畫面上的區塊
  function bindZones(sel, fn) {
    app.querySelectorAll(sel).forEach(g => {
      g.addEventListener('click', () => fn(g));
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(g); } });
    });
  }

  function ctlMap(st, c) {
    $('#ctl').innerHTML = `<p class="note">在上方畫面點選一個位置。</p>`;
    bindZones('[data-zone]', g => {
      const z = st.zones.find(z => z.id === g.dataset.zone);
      if (!z.ok) { feedback(`隊長：${esc(z.fb)}`, 'bad'); return; }
      if (st.map === 'leg') c.band = z.x + z.w / 2;
      if (c.m.id === 'p3') S.family[c.i === 0 ? 'first' : 'second'] = z.label;
      solve(esc(z.fb));
    });
  }

  function ctlHunt(st, c) {
    const list = st.spots.map((s, i) => c.found.has(i) ? `<li><strong>${esc(s.t)}</strong>：${esc(s.fix)}</li>` : '').join('');
    $('#ctl').innerHTML = `<p class="note">已找到 ${c.found.size} / ${st.spots.length}。 <button type="button" class="say" id="hint">給我提示</button></p><ol class="found">${list}</ol>`;
    $('#hint').onclick = () => { c.hint = true; renderStep(); };
    bindZones('[data-spot]', g => {
      const i = +g.dataset.spot;
      if (c.found.has(i)) return;
      c.found.add(i);
      if (c.found.size === st.spots.length) solve('全部找到了！平常改善這些地方，地震時家裡就更安全。');
      else { renderStep(); feedback(`找到了：${esc(st.spots[i].t)}`); }
    });
    bindZones('[data-safe]', g => feedback(`隊長：${esc(st.safe[+g.dataset.safe].fb)}`, 'alt'));
  }

  // ---------- 覆盤 ----------
  function renderDebrief() {
    const c = S.cur, m = c.m, drill = m.kind === 'drill';
    const report = m.id === 'm2' ? `Tourniquet on! Time ${c.time || now()}.` : null;
    app.innerHTML = `
      <p class="eyebrow">${m.code} // DEBRIEF</p>
      <h1>${drill ? '演習完成' : '整備完成'}：${esc(m.name)}</h1>
      <div class="unlock">
        ${drill ? `<p class="eyebrow">UNLOCKED // 你做到了，現在可以說</p>
        <p class="phrase">Don’t worry, I’ve got you.</p><p class="zh">別擔心，我來了</p>${sayBtns("Don't worry, I've got you.")}`
        : `<p class="eyebrow">READY // 平日整備完成</p><p class="phrase">Be ready.</p><p class="zh">平常準備好，災時不慌張</p>${sayBtns('Be ready.')}`}
        <div><span class="badge">徽章：${esc(m.badge)}</span></div>
      </div>
      ${report ? `<div class="panel"><strong>無線電回報（英文）</strong><p class="en" style="font-size:20px;margin:4px 0">${report} ${sayBtns(report)}</p></div>` : ''}
      <h2>流程回顧</h2>
      ${timeline(m.flow)}
      <h2>遊戲 vs 現實：破解卡</h2>
      <div id="myth"><button type="button" class="btn ghost" id="flip">翻開破解卡</button></div>
      ${c.missing.length ? `<div class="callout amber">這次防災包裡沒有：${c.missing.map(id => esc(ITEM[id].name)).join('、')}，所以用了替代做法。回基地想想要不要補進防災包。</div>` : ''}
      <h2>和家長一起想三個問題</h2>
      <ol>${REFLECT.map(q => `<li>${esc(q)}</li>`).join('')}</ol>
      <div class="row"><button type="button" class="btn" data-go="hub">回演習基地</button><button type="button" class="btn ghost" data-go="card">製作防災卡</button></div>`;
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
      <p class="en" style="font-size:19px">Be ready. ${sayBtns('Be ready.')}</p>
      <p class="en" style="font-size:19px">Call for help! ${sayBtns('Call for help!')}</p>`;
    $$('[data-w]').forEach(b => b.onchange = () => { b.checked ? S.said.add(b.dataset.w) : S.said.delete(b.dataset.w); });
  }

  // ---------- 我們家的防災卡 ----------
  function renderCard() {
    const done = MISSIONS.filter(m => S.done[m.id]);
    const pts = done.flatMap(m => m.keyPoints);
    S.points = S.points.filter(p => pts.includes(p));
    const f = S.family;
    const needs = ITEMS.filter(it => it.need);
    const extra = S.loadout.filter(id => !ITEM[id].need && !ITEM[id].decoy);
    app.innerHTML = `
      <p class="eyebrow">FAMILY CARD // 我們家的防災卡</p>
      <h1>我們家的防災卡</h1>
      <p class="lead">把集結點、防災包清單和最重要的 3 個重點整理成一張卡，列印後貼在門口或冰箱上，也可以拿去教家人和同學。</p>
      <div class="callout amber">這裡填的內容只留在這個畫面，不會儲存或上傳；重新整理就會清空。電話號碼請列印後再用手寫。</div>
      <div class="panel">
        <div class="field"><label for="f1">第一集結點（家附近）</label><input id="f1" type="text" maxlength="20" value="${esc(f.first)}" placeholder="例如：社區公園"></div>
        <div class="field"><label for="f2">第二集結點（較遠）</label><input id="f2" type="text" maxlength="20" value="${esc(f.second)}" placeholder="例如：學校操場"></div>
        <div class="field"><label for="f3">外地聯絡人（稱呼）</label><input id="f3" type="text" maxlength="12" value="${esc(f.contact)}" placeholder="例如：外婆"></div>
      </div>
      ${pts.length ? `<div class="panel"><strong>從完成的站點挑 3 個最重要的重點（已選 ${S.points.length} / 3）</strong>
        ${pts.map(p => `<label class="check"><input type="checkbox" data-p="${esc(p)}" ${S.points.includes(p) ? 'checked' : ''}> ${esc(p)}</label>`).join('')}</div>`
        : '<div class="callout">完成任一站後，就可以挑重點放進防災卡。</div>'}
      <div id="poster" class="poster">
        <p class="eyebrow">HOME GUARD // 我們家的防災卡</p>
        <h3>平日準備好，災時不慌張</h3>
        <div class="card-grid">
          <div><b>集結點</b>
            <p>① 第一集結點：${esc(f.first) || '＿＿＿＿＿＿'}</p>
            <p>② 第二集結點：${esc(f.second) || '＿＿＿＿＿＿'}</p>
            <p>外地聯絡人：${esc(f.contact) || '＿＿＿＿'}　電話：＿＿＿＿＿＿＿＿</p>
            <p class="note">電話打不通：傳簡訊，或用 1991 報平安專線留言。到了集結點就留下來等。</p></div>
          <div><b>防災包清單</b>
            <ul class="bag">${needs.map(it => `<li>${S.loadout.includes(it.id) ? '☑' : '☐'} ${esc(it.name)}</li>`).join('')}${extra.map(id => `<li>☑ ${esc(ITEM[id].name)}</li>`).join('')}</ul></div>
        </div>
        <b>最重要的 3 個重點</b>
        <ol>${S.points.map(p => `<li>${esc(p)}</li>`).join('') || '<li class="note">（請在上方勾選 3 個重點）</li>'}</ol>
        <p class="note">遇到危險：先確認安全、叫大人、撥 119。現實中沒有急救針，能救人的是平常學會的步驟。</p>
        <p class="sign">隊員：${esc(S.callsign)}</p>
      </div>
      <div class="row"><button type="button" class="btn" id="print">列印防災卡</button><span class="note">列印視窗可選「另存為 PDF」。</span></div>`;
    [['f1', 'first'], ['f2', 'second'], ['f3', 'contact']].forEach(([id, key]) => {
      $('#' + id).onchange = e => { S.family[key] = e.target.value.trim(); renderCard(); };
    });
    $$('[data-p]').forEach(b => b.onchange = () => {
      const p = b.dataset.p;
      if (b.checked) {
        if (S.points.length >= 3) { b.checked = false; toast('最多選 3 個重點，先取消一個再選。'); return; }
        S.points.push(p);
      } else S.points = S.points.filter(x => x !== p);
      renderCard();
    });
    $('#print').onclick = () => window.print();
  }

  show('title');
})();
