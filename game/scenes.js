// 家園救援任務：六關的擬真 CG 風格場景（全部是內建向量圖，離線、沒有外部圖檔、不使用真人或真實場所照片）
// 每個函式回傳 SVG 內部標記（viewBox 0 0 400 220），可點選的區塊座標與 data.js 的 zones 對齊。
(function () {
  'use strict';
  const SC = {};
  const A = '#f2b33d', G = '#3ddc84', R = '#ff5d52', INK = '#f3efe2';

  SC.defs = `<defs>
    <linearGradient id="rWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dcd4bc"/><stop offset="1" stop-color="#b3aa8e"/></linearGradient>
    <linearGradient id="rFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8f6f4a"/><stop offset="1" stop-color="#553f29"/></linearGradient>
    <linearGradient id="rSkyD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fc0ec"/><stop offset="1" stop-color="#e3f2fb"/></linearGradient>
    <linearGradient id="rHallW" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8fae9f"/><stop offset="1" stop-color="#cfe0d6"/></linearGradient>
    <linearGradient id="rTile" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9aa19c"/><stop offset="1" stop-color="#d6dad6"/></linearGradient>
    <linearGradient id="rDusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c2a3a"/><stop offset="1" stop-color="#4a5f72"/></linearGradient>
    <linearGradient id="rAsph" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#454b51"/><stop offset="1" stop-color="#262a2e"/></linearGradient>
    <linearGradient id="rWaterV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4e93b8" stop-opacity=".92"/><stop offset="1" stop-color="#1c4863" stop-opacity=".95"/></linearGradient>
    <linearGradient id="rMetal" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8e999f"/><stop offset=".5" stop-color="#d4dadd"/><stop offset="1" stop-color="#8a959c"/></linearGradient>
    <linearGradient id="rWood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b3844f"/><stop offset="1" stop-color="#76522f"/></linearGradient>
    <linearGradient id="rPack" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6f8a4a"/><stop offset="1" stop-color="#3f5530"/></linearGradient>
    <radialGradient id="rGlow"><stop offset="0" stop-color="#fff4c2" stop-opacity=".95"/><stop offset="1" stop-color="#fff4c2" stop-opacity="0"/></radialGradient>
    <radialGradient id="rFire"><stop offset="0" stop-color="#ff9a3c" stop-opacity=".85"/><stop offset="1" stop-color="#ff5d2c" stop-opacity="0"/></radialGradient>
    <radialGradient id="rSmoke"><stop offset="0" stop-color="#8e979a" stop-opacity=".92"/><stop offset="1" stop-color="#5c6568" stop-opacity="0"/></radialGradient>
    <filter id="rBlur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="6"/></filter>
    <filter id="rBlurS" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="1.4"/></filter>
    <filter id="rShadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="3" stdDeviation="2.4" flood-color="#000" flood-opacity=".5"/></filter>
    <filter id="rGrain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 .1"/></feComponentTransfer></filter>
  </defs>`;
  const grain = '<rect width="400" height="220" filter="url(#rGrain)" opacity=".7"/>';
  const ringA = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${A}" stroke-width="2.4" stroke-dasharray="6 4"/>`;
  const T = (x, y, s, fill, size, anchor) => `<text x="${x}" y="${y}" fill="${fill}" font-family="Microsoft JhengHei,Bahnschrift,sans-serif" font-size="${size || 12}" font-weight="bold" text-anchor="${anchor || 'middle'}" style="paint-order:stroke;stroke:rgba(0,0,0,.65);stroke-width:3px">${s}</text>`;

  // ---- 人物（腳底在 x,y） ----
  const SKIN = '#e2b48c';
  SC.kid = (x, y, s, o) => {
    o = o || {};
    const shirt = o.shirt || '#d9822b', pants = o.pants || '#2b3a55';
    return `<g transform="translate(${x} ${y}) scale(${s || 1})"><ellipse cx="0" cy="2" rx="13" ry="3.4" fill="#000" opacity=".4"/>
      <rect x="-6.5" y="-17" width="5.5" height="17" rx="1.5" fill="${pants}"/><rect x="1" y="-17" width="5.5" height="17" rx="1.5" fill="${pants}"/>
      <rect x="-8.5" y="-35" width="17" height="21" rx="4" fill="${shirt}"/>
      ${o.pack ? '<rect x="-12" y="-34" width="6" height="17" rx="2.5" fill="url(#rPack)"/>' : ''}
      <rect x="-12" y="-32" width="4.2" height="15" rx="2" fill="${SKIN}"/><rect x="7.8" y="-32" width="4.2" height="15" rx="2" fill="${SKIN}"/>
      <circle cx="0" cy="-42" r="7.4" fill="${SKIN}"/><path d="M-7.6 -43a7.6 7.6 0 0 1 15.2 0z" fill="${o.helmet ? '#f2b33d' : (o.hair || '#2a1c14')}"/></g>`;
  };
  SC.adult = (x, y, s, o) => {
    o = o || {};
    const shirt = o.shirt || '#3f6fa8', pants = o.pants || '#3a3f4a';
    return `<g transform="translate(${x} ${y}) scale(${(s || 1) * 1.45})"><ellipse cx="0" cy="2" rx="13" ry="3.4" fill="#000" opacity=".4"/>
      <rect x="-6" y="-18" width="5.5" height="18" rx="1.5" fill="${pants}"/><rect x="0.5" y="-18" width="5.5" height="18" rx="1.5" fill="${pants}"/>
      <rect x="-8.5" y="-37" width="17" height="21" rx="4" fill="${shirt}"/>
      <rect x="-12" y="-35" width="4.2" height="16" rx="2" fill="${o.sleeve || shirt}"/><rect x="7.8" y="-35" width="4.2" height="16" rx="2" fill="${o.sleeve || shirt}"/>
      <circle cx="0" cy="-44" r="7.4" fill="${SKIN}"/><path d="M-7.6 -45a7.6 7.6 0 0 1 15.2 0z" fill="${o.cap || '#2a1c14'}"/></g>`;
  };
  const phone = (x, y, label, col) => `<g transform="translate(${x} ${y})" filter="url(#rShadow)"><rect x="-22" y="-38" width="44" height="76" rx="8" fill="#15191c" stroke="#69737a" stroke-width="2"/><rect x="-18" y="-31" width="36" height="58" rx="3" fill="${col}" opacity=".9"/><text x="0" y="3" fill="#fff" font-size="19" font-weight="bold" text-anchor="middle" font-family="Bahnschrift,Arial">${label}</text><circle cx="0" cy="32" r="3" fill="#69737a"/></g>`;

  // ---- 1 防災背包：玄關 ----
  SC.bag = c => {
    const i = c ? c.i : 0;
    return `<rect width="400" height="220" fill="url(#rWall)"/>
      <rect y="176" width="400" height="44" fill="url(#rFloor)"/><rect y="172" width="400" height="6" fill="#efe8d4"/>
      <polygon points="0,176 400,176 400,184 0,184" fill="#000" opacity=".18"/>
      <g filter="url(#rShadow)"><rect x="290" y="22" width="92" height="156" rx="3" fill="url(#rWood)"/><rect x="298" y="30" width="76" height="62" rx="2" fill="#6c4b2b"/><rect x="298" y="100" width="76" height="70" rx="2" fill="#6c4b2b"/><circle cx="366" cy="104" r="4" fill="#d8c27a"/></g>
      <rect x="296" y="176" width="80" height="8" rx="3" fill="#5d3f26"/>
      <polygon points="150,176 262,176 300,184 120,184" fill="#8a2f2b" opacity=".0"/>
      <g filter="url(#rShadow)"><rect x="46" y="44" width="70" height="46" rx="2" fill="#fffdf4"/><rect x="46" y="44" width="70" height="12" fill="#d33a2f"/><path d="M54 66h40M54 74h50M54 82h30" stroke="#8c8672" stroke-width="2.4"/><circle cx="81" cy="38" r="3.4" fill="#8a8f95"/></g>
      ${T(81, 53, '緊急聯絡卡', '#fff', 10)}
      <g filter="url(#rShadow)">
        <ellipse cx="190" cy="176" rx="62" ry="7" fill="#000" opacity=".35"/>
        <path d="M168 54v-10a14 14 0 0 1 28 0v10" fill="none" stroke="#2c3a22" stroke-width="5" stroke-linecap="round"/>
        <rect x="140" y="52" width="100" height="124" rx="22" fill="url(#rPack)"/>
        <rect x="152" y="104" width="76" height="52" rx="10" fill="#4a6234" stroke="#2c3a22" stroke-width="2"/><path d="M158 112h64" stroke="#d8d29a" stroke-width="3" stroke-dasharray="2 4"/>
        <rect x="150" y="84" width="80" height="7" fill="#f2b33d" opacity=".9"/>
        <path d="M148 70c-12 0-18 8-18 20v58" fill="none" stroke="#2c3a22" stroke-width="7" stroke-linecap="round"/><path d="M232 70c12 0 18 8 18 20v58" fill="none" stroke="#2c3a22" stroke-width="7" stroke-linecap="round"/>
        <rect x="178" y="62" width="24" height="18" rx="3" fill="#fffdf4"/><path d="M190 64v14M183 71h14" stroke="#d33a2f" stroke-width="3.4"/>
      </g>
      <g filter="url(#rShadow)">
        <path d="M262 176v-14l18-5 9 7h16l9 7v5z" fill="#d9e2ea"/><path d="M262 176h52v5h-52z" fill="#3b3f46"/>
        <path d="M60 176v-14l18-5 9 7h16l9 7v5z" fill="#b8c6a3"/><path d="M60 176h52v5h-52z" fill="#3b3f46"/>
      </g>
      ${i === 0 ? phone(334, 124, '119', '#d33a2f') : ''}${i === 1 ? phone(334, 124, '110', '#2f6fb3') : ''}
      ${i === 2 ? ringA(81, 66, 46) + T(81, 112, '家長電話', A, 12) : ''}
      ${i === 3 ? ringA(290, 168, 44) + T(290, 130, '輕便耐走的鞋', A, 12) : ''}
      ${i === 4 ? SC.adult(330, 176, 1, { shirt: '#7a5d9a' }) + '<g filter="url(#rShadow)"><rect x="296" y="150" width="18" height="26" rx="4" fill="#e8d6a0"/><rect x="298" y="144" width="14" height="8" rx="2" fill="#d33a2f"/></g>' + T(330, 70, '家長協助準備', A, 12) : ''}
      ${grain}`;
  };

  // ---- 2 地震：教室 ----
  SC.classroomShake = c => !c || (c.i <= 3 && !c.solved);
  SC.classroom = c => {
    const i = c ? c.i : 0, shaking = SC.classroomShake(c), after = i >= 4;
    const book = (x, y, w, h, col, rot) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${col}" ${rot ? `transform="rotate(${rot} ${x + w / 2} ${y + h})"` : ''}/>`;
    return `<rect width="400" height="220" fill="url(#rWall)"/>
      <rect y="172" width="400" height="48" fill="url(#rFloor)"/><rect y="168" width="400" height="6" fill="#4b3826"/>
      <g stroke="#3d2d1e" stroke-width="1" opacity=".35"><path d="M0 188h400M0 204h400M70 172l-30 48M170 172l-40 48M280 172l30 48M380 172l50 48"/></g>
      <polygon points="22,86 126,86 230,172 66,172" fill="#fff7cf" opacity=".16"/>
      <rect x="14" y="8" width="120" height="84" rx="2" fill="#3b3024"/><rect x="20" y="14" width="108" height="72" fill="url(#rSkyD)"/><path d="M74 14v72M20 50h108" stroke="#efe9d6" stroke-width="3.5"/>
      <ellipse cx="46" cy="34" rx="16" ry="6" fill="#fff" opacity=".85"/><ellipse cx="102" cy="64" rx="14" ry="5" fill="#fff" opacity=".7"/>
      <g filter="url(#rShadow)"><rect x="140" y="24" width="76" height="42" fill="#f4f2e8" stroke="#8d8265" stroke-width="3"/><path d="M148 36h44M148 46h58M148 56h30" stroke="#2f8f58" stroke-width="2.4"/></g>
      <circle cx="244" cy="22" r="9" fill="#f4f2e8" stroke="#3d3a32" stroke-width="2"/><path d="M244 22v-5M244 22l4 2" stroke="#3d3a32" stroke-width="1.6"/>
      <g filter="url(#rShadow)"><rect x="218" y="44" width="64" height="130" rx="2" fill="#8a7658"/><rect x="226" y="54" width="48" height="44" fill="#31424d" opacity=".85"/><circle cx="270" cy="124" r="3.4" fill="#d8c27a"/></g>
      <rect x="230" y="28" width="40" height="14" rx="2" fill="#1f9a57"/>${T(250, 39, 'EXIT', '#fff', 11)}
      <g filter="url(#rShadow)"><rect x="292" y="30" width="92" height="140" rx="2" fill="#5b4330"/>
        <rect x="298" y="36" width="80" height="30" fill="#3f2f22"/><rect x="298" y="76" width="80" height="30" fill="#3f2f22"/><rect x="298" y="116" width="80" height="30" fill="#3f2f22"/>
        ${book(302, 40, 9, 26, '#c9483c', shaking ? 18 : 0)}${book(313, 42, 8, 24, '#3b78b8')}${book(323, 40, 9, 26, '#e0b13f')}${book(334, 44, 8, 22, '#4c9a63', shaking ? -22 : 0)}${book(344, 40, 10, 26, '#8b5aa8')}${book(358, 42, 9, 24, '#c9483c')}
        ${book(302, 80, 10, 26, '#3b78b8')}${book(314, 82, 9, 24, '#e0b13f')}${book(326, 80, 12, 26, '#4c9a63')}${book(342, 84, 9, 22, '#c9483c')}${book(354, 80, 10, 26, '#8b5aa8')}
        ${book(302, 120, 12, 26, '#e0b13f')}${book(318, 122, 9, 24, '#3b78b8')}${book(330, 120, 10, 26, '#c9483c')}
      </g>
      ${shaking ? `<g><rect x="300" y="160" width="10" height="7" fill="#c9483c" transform="rotate(25 305 163)"/><rect x="320" y="164" width="9" height="6" fill="#4c9a63" transform="rotate(-15 324 167)"/><rect x="104" y="150" width="9" height="6" fill="#e0b13f" transform="rotate(30 108 153)" opacity=".8"/></g>` : ''}
      <g filter="url(#rShadow)"><rect x="36" y="124" width="176" height="11" rx="2" fill="#c49a62"/><rect x="36" y="124" width="176" height="3" fill="#dcb67e"/><path d="M52 135v50M196 135v50M52 160h144" stroke="#7d8890" stroke-width="4"/></g>
      <g filter="url(#rShadow)"><rect x="92" y="140" width="40" height="8" rx="2" fill="#4f6d8f"/><path d="M96 148v34M128 148v34" stroke="#59636a" stroke-width="3"/></g>
      ${SC.adult(176, 170, 1, { shirt: '#c25b46', pants: '#2c3340' })}
      ${after ? '<g filter="url(#rShadow)"><rect x="96" y="20" width="132" height="26" rx="10" fill="#fffdf4" stroke="#f2b33d" stroke-width="2.5"/></g>' + T(162, 38, '大家冷靜，聽我指示', '#7a4b00', 11).replace('stroke:rgba(0,0,0,.65)', 'stroke:rgba(255,255,255,0)') : ''}
      ${i === 1 ? `<g stroke="${R}" stroke-width="3" fill="none" stroke-linecap="round"><path d="M8 100l9 7-9 7M392 100l-9 7 9 7"/></g>` : ''}
      ${grain}`;
  };

  // ---- 3 火災：走廊 ----
  SC.corridor = c => {
    const i = c ? c.i : 0, b = c ? c.branch : null;
    const smoke = b === 'B' ? `<g filter="url(#rBlur)"><ellipse cx="200" cy="96" rx="100" ry="46" fill="url(#rSmoke)"/><ellipse cx="140" cy="130" rx="90" ry="44" fill="url(#rSmoke)"/><ellipse cx="262" cy="136" rx="96" ry="46" fill="url(#rSmoke)"/><ellipse cx="200" cy="176" rx="170" ry="34" fill="url(#rSmoke)" opacity=".8"/></g><ellipse cx="200" cy="104" rx="46" ry="26" fill="url(#rFire)"/>`
      : (i === 0 ? '<g filter="url(#rBlur)" opacity=".5"><ellipse cx="200" cy="100" rx="70" ry="30" fill="url(#rSmoke)"/></g>' : '');
    return `<rect width="400" height="220" fill="#2b3430"/>
      <polygon points="0,0 400,0 270,70 130,70" fill="#c9d0cc"/>
      <rect x="150" y="30" width="100" height="9" fill="#fffbe6"/><ellipse cx="200" cy="40" rx="90" ry="14" fill="url(#rGlow)" opacity=".5"/>
      <polygon points="0,6 130,70 130,128 0,220" fill="url(#rHallW)"/><polygon points="400,6 270,70 270,128 400,220" fill="url(#rHallW)"/>
      <polygon points="0,220 130,128 270,128 400,220" fill="url(#rTile)"/>
      <g stroke="#7b837e" stroke-width="1.2" opacity=".6"><path d="M200 128V220M165 128L110 220M235 128L290 220M130 150H270M110 180H290"/></g>
      <polygon points="150,210 250,210 240,190 160,190" fill="#fff" opacity=".1"/>
      <rect x="130" y="70" width="140" height="58" fill="#c3cbc6"/>
      <g filter="url(#rShadow)"><rect x="164" y="80" width="72" height="48" rx="2" fill="url(#rWood)"/><rect x="190" y="86" width="20" height="22" fill="#2e414d" opacity=".85"/><circle cx="228" cy="108" r="2.8" fill="#d8c27a"/></g>
      <g filter="url(#rShadow)"><rect x="14" y="62" width="70" height="122" rx="2" fill="url(#rMetal)"/><path d="M49 62v122" stroke="#59636a" stroke-width="2.4"/><rect x="88" y="104" width="7" height="14" rx="2" fill="#2a2f33"/><circle cx="91" cy="109" r="1.8" fill="#ff5d52"/></g>
      ${T(49, 56, '電梯', '#ffb3ac', 12)}
      <g filter="url(#rShadow)"><rect x="300" y="56" width="86" height="128" rx="2" fill="#6d7a74"/>
        <rect x="308" y="64" width="70" height="114" fill="#1b2626"/>
        <rect x="308" y="64" width="70" height="38" fill="#cfd8d3"/>
        <polygon points="312,102 374,102 368,116 318,116" fill="#aeb8b3"/><polygon points="318,116 368,116 363,130 323,130" fill="#8e9994"/><polygon points="323,130 363,130 359,144 327,144" fill="#707b76"/><polygon points="327,144 359,144 356,156 330,156" fill="#55605b"/><polygon points="330,156 356,156 353,166 333,166" fill="#3c4642"/>
        <path d="M310 98L372 98M310 98L330 168" stroke="#d6dde0" stroke-width="2.4" fill="none"/>
        <path d="M343 118v28m-8-8l8 10 8-10" stroke="#3ddc84" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <rect x="302.5" y="112" width="3" height="18" rx="1.5" fill="#c9cfd2"/></g>
      <rect x="312" y="30" width="62" height="22" rx="3" fill="#1f9a57"/>${T(336, 46, 'EXIT', '#fff', 13)}<path d="M362 36v10m-4-4l4 5 4-5" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      ${T(343, 198, '樓梯往下', '#bff0d2', 11)}
      <g filter="url(#rShadow)"><rect x="104" y="92" width="14" height="22" rx="2" fill="#d33a2f"/><circle cx="111" cy="103" r="3.4" fill="#fff"/></g>
      ${smoke}
      ${SC.kid(200, 214, 1.5, { pack: true, shirt: '#2f8f58', pants: '#2b3a55' })}
      ${b === 'B' ? T(200, 18, '濃煙！看不到出口', '#ffd9d4', 13) : ''}
      ${grain}`;
  };

  // ---- 4 颱風與淹水 ----
  SC.flood = c => {
    const i = c ? c.i : 0;
    const rain = Array.from({ length: 26 }, (_, k) => `<path d="M${6 + k * 15} ${(k * 17) % 120}l-7 18" stroke="#b7cfe0" stroke-width="1.3" opacity=".45"/>`).join('');
    const bld = (x, y, w, h, win) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#20303f"/>${win ? Array.from({ length: Math.floor(w / 18) * Math.floor(h / 22) }, (_, k) => { const cols = Math.floor(w / 18); const cx = x + 5 + (k % cols) * 18, cy = y + 6 + Math.floor(k / cols) * 22; return `<rect x="${cx}" y="${cy}" width="10" height="12" fill="${(k * 7) % 3 ? '#f7d57a' : '#2c3d4d'}" opacity=".9"/>`; }).join('') : ''}`;
    if (i === 0) {
      return `<rect width="400" height="220" fill="url(#rDusk)"/>${bld(30, 70, 70, 110, true)}${bld(120, 50, 80, 130, true)}${bld(230, 80, 60, 100, true)}${bld(310, 60, 80, 120, true)}
        <rect y="170" width="400" height="50" fill="url(#rAsph)"/>
        <g class="rain">${rain}</g>
        <path d="M20 40q60-22 110-6M250 30q60-18 120 4" fill="none" stroke="#c3d3df" stroke-width="3" stroke-linecap="round" opacity=".5"/>
        <g filter="url(#rShadow)"><rect x="132" y="56" width="136" height="76" rx="10" fill="#fff8e5" stroke="#f2b33d" stroke-width="3"/><circle cx="160" cy="94" r="16" fill="#f2b33d"/><path d="M160 84v12M160 101v2" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/></g>
        ${T(222, 90, '颱風警報', '#7a4b00', 17).replace('stroke:rgba(0,0,0,.65)', 'stroke:rgba(255,255,255,0)')}${T(222, 112, '請留在室內', '#7a4b00', 13).replace('stroke:rgba(0,0,0,.65)', 'stroke:rgba(255,255,255,0)')}
        ${T(200, 206, '在家不外出，確認物資', INK, 13)}${grain}`;
    }
    return `<rect width="400" height="220" fill="url(#rDusk)"/>
      ${bld(112, 40, 70, 110, true)}${bld(196, 62, 70, 90, true)}
      <rect y="150" width="400" height="70" fill="url(#rAsph)"/>
      <g filter="url(#rShadow)"><rect x="296" y="24" width="92" height="112" rx="2" fill="#33485a"/>${Array.from({ length: 6 }, (_, k) => `<rect x="${304 + (k % 3) * 28}" y="${34 + Math.floor(k / 3) * 28}" width="20" height="18" fill="#ffd978"/>`).join('')}<rect x="318" y="96" width="48" height="40" fill="#1f2c38"/><rect x="304" y="10" width="80" height="14" rx="2" fill="#1f9a57"/></g>
      ${T(342, 22, '避難處所', '#fff', 11)}
      <path d="M8 182V122a46 46 0 0 1 92 0v60z" fill="#0b1117" stroke="#58626b" stroke-width="3"/><ellipse cx="54" cy="150" rx="32" ry="24" fill="#05080b"/><rect x="26" y="96" width="56" height="12" rx="2" fill="#2c6a9c"/>${T(54, 106, '地下道', '#fff', 11)}
      <rect x="8" y="164" width="92" height="22" fill="url(#rWaterV)"/>
      <g class="rain">${rain}</g>
      <rect x="108" y="150" width="174" height="62" fill="url(#rWaterV)"/><path d="M116 168q14-7 28 0t28 0t28 0t28 0t28 0" fill="none" stroke="#d3ecfa" stroke-width="1.8" opacity=".75"/><path d="M130 190q14-7 28 0t28 0t28 0" fill="none" stroke="#d3ecfa" stroke-width="1.4" opacity=".55"/>
      <ellipse cx="190" cy="196" rx="30" ry="6" fill="#ffd978" opacity=".28"/>
      <rect x="290" y="150" width="110" height="70" fill="url(#rWaterV)"/><path d="M296 172q14-7 28 0t28 0t28 0t24 0" fill="none" stroke="#d3ecfa" stroke-width="1.8" opacity=".7"/>${T(346, 200, '河水', '#d3ecfa', 12)}
      <path d="M190 2v118" stroke="#3a3f44" stroke-width="5"/><rect x="176" y="14" width="30" height="6" fill="#3a3f44"/>
      <path d="M200 18c40 8 52 20 68 52" fill="none" stroke="#1c1f22" stroke-width="3" stroke-linecap="round"/><circle cx="268" cy="72" r="14" fill="url(#rFire)"/><path d="M262 68l-6 8 9 3-6 9" fill="none" stroke="#ffd04a" stroke-width="2.6" stroke-linecap="round"/>
      ${SC.kid(152, 150, 1, { shirt: '#d9822b', pants: '#2b3a55', pack: true })}
      ${grain}`;
  };

  // ---- 5 防空演練：依步驟切換（柔和，沒有爆炸或驚嚇畫面） ----
  SC.siren = c => {
    const i = c ? c.i : 0;
    const tag = `<g filter="url(#rShadow)"><rect x="128" y="6" width="144" height="24" rx="12" fill="#fff8e5" stroke="#f2b33d" stroke-width="2.5"/></g>${T(200, 23, '模擬演練 DRILL', '#7a4b00', 12).replace('stroke:rgba(0,0,0,.65)', 'stroke:rgba(255,255,255,0)')}`;
    const sky = `<rect width="400" height="220" fill="url(#rDusk)"/><ellipse cx="320" cy="60" rx="60" ry="22" fill="#e8c88a" opacity=".18"/>`;
    const skyline = (y) => `<g fill="#1a2733">${[[10, 70, 46], [60, 50, 60], [128, 84, 40], [270, 64, 56], [330, 80, 44]].map(([x, h, w]) => `<rect x="${x}" y="${y - h}" width="${w}" height="${h}"/>`).join('')}</g><g fill="#f7d57a" opacity=".85">${[[18, 126], [28, 144], [70, 118], [84, 138], [136, 140], [280, 128], [296, 146], [340, 138]].map(([x, yy]) => `<rect x="${x}" y="${yy}" width="7" height="9"/>`).join('')}</g>`;
    const ground = '<rect y="172" width="400" height="48" fill="url(#rAsph)"/>';
    if (i === 0) return `${sky}${skyline(172)}${ground}
      <g filter="url(#rShadow)"><rect x="190" y="70" width="8" height="102" fill="#59636a"/><path d="M176 62h36l-6 18h-24z" fill="#d6dde0"/><path d="M180 50l32-8v28l-32-8z" fill="#f2b33d"/></g>
      <g fill="none" stroke="#9fd0ea" stroke-width="2.4" opacity=".75"><path d="M222 52q12 10 0 22M234 44q20 18 0 38M246 36q28 26 0 54"/></g>
      ${SC.kid(120, 190, 1.4, { pack: true })}${T(200, 212, '先一聲長鳴，再兩聲短鳴，重複 3 次', INK, 11)}${tag}${grain}`;
    if (i === 1) return `<rect width="400" height="220" fill="#1c2630"/>
      <rect x="50" y="40" width="300" height="96" fill="#d3cbb4"/><rect x="50" y="136" width="300" height="70" fill="#4a5560"/><rect x="50" y="132" width="300" height="6" fill="#2a323a"/>
      <rect x="74" y="56" width="40" height="30" fill="url(#rSkyD)"/><rect x="286" y="56" width="40" height="30" fill="url(#rSkyD)"/><path d="M94 56v30M74 71h40M306 56v30M286 71h40" stroke="#efe9d6" stroke-width="2.4"/>
      <path d="M136 138v34h22v-14h22v-14h22" fill="none" stroke="#9aa6b0" stroke-width="5"/>
      <rect x="214" y="64" width="40" height="64" fill="#8e999f"/><path d="M234 64v64" stroke="#59636a" stroke-width="2"/>${T(234, 58, '電梯 ✗', '#ffb3ac', 11)}
      ${T(200, 162, '地下室', '#f7d57a', 14)}<rect x="56" y="150" width="288" height="46" fill="#f7d57a" opacity=".1"/>
      ${SC.adult(104, 132, 0.8)}${SC.kid(134, 132, 0.9, { pack: true })}${SC.kid(262, 204, 1, { helmet: true })}${tag}${grain}`;
    if (i === 2) return `<rect width="400" height="220" fill="url(#rWall)"/><rect y="176" width="400" height="44" fill="url(#rFloor)"/>
      <rect x="26" y="34" width="86" height="64" fill="#3b3024"/><rect x="31" y="39" width="76" height="54" fill="url(#rSkyD)"/><path d="M69 39v54M31 66h76" stroke="#efe9d6" stroke-width="3"/>
      <g stroke="${R}" stroke-width="2.4" stroke-dasharray="6 4" fill="none"><rect x="14" y="26" width="110" height="80"/></g>${T(69, 120, '離窗戶遠一點', '#ffd9d4', 12)}
      <rect x="224" y="60" width="60" height="116" fill="#8a7658" opacity=".55"/>
      ${SC.kid(318, 190, 1.7, { helmet: true, pack: true })}<path d="M302 170q-8-12 0-24M334 170q8-12 0-24" fill="none" stroke="#f2b33d" stroke-width="3" stroke-linecap="round"/>
      ${T(320, 210, '靠牆坐下、雙手抱頭', '#fff', 12)}${tag}${grain}`;
    if (i === 3) return `<rect width="400" height="220" fill="url(#rDusk)"/><ellipse cx="200" cy="40" rx="150" ry="30" fill="#e8c88a" opacity=".12"/>
      <path d="M0 150q100-14 200-6t200 8v70H0z" fill="#3c5a38"/><path d="M0 176q120 18 240 4t160 6v34H0z" fill="#2b4228"/>
      <ellipse cx="240" cy="192" rx="46" ry="9" fill="#000" opacity=".25"/>
      <g><ellipse cx="190" cy="186" rx="14" ry="8" fill="#d9822b"/><circle cx="164" cy="184" r="8" fill="${SKIN}"/><path d="M156 183a8 8 0 0 1 16 0z" fill="#f2b33d"/><rect x="198" y="180" width="30" height="9" rx="3" fill="#2b3a55"/><path d="M178 178l-14 10M180 190l-16 4" stroke="#d9822b" stroke-width="5" stroke-linecap="round"/></g>
      ${T(200, 120, '空曠處：找堅固掩蔽，沒有就選低處趴下', '#fff', 12)}${tag}${grain}`;
    if (i === 4) return `${sky}<g fill="#1a2733"><rect x="0" y="40" width="130" height="132"/><rect x="262" y="20" width="138" height="152"/></g>
      <g fill="#f7d57a" opacity=".7">${Array.from({ length: 18 }, (_, k) => `<rect x="${10 + (k % 6) * 20}" y="${52 + Math.floor(k / 6) * 30}" width="10" height="14"/>`).join('')}</g>
      ${ground}<g filter="url(#rShadow)"><rect x="292" y="104" width="66" height="68" rx="3" fill="#2a343d"/><rect x="300" y="112" width="50" height="60" fill="#10161b"/><rect x="288" y="78" width="74" height="22" rx="3" fill="#2f6fb3"/></g>${T(325, 94, '防空避難', '#fff', 12)}
      <g fill="none" stroke="${A}" stroke-width="3.4" stroke-linecap="round"><path d="M214 150h58M262 142l10 8-10 8"/></g>
      ${SC.kid(190, 190, 1.4, { pack: true })}${tag}${grain}`;
    if (i === 5) return `<rect width="400" height="220" fill="url(#rWall)"/><rect y="176" width="400" height="44" fill="url(#rFloor)"/><rect x="60" y="0" width="14" height="176" fill="#a99f84"/>
      <g><ellipse cx="116" cy="178" rx="26" ry="7" fill="#000" opacity=".3"/><rect x="82" y="150" width="34" height="26" rx="6" fill="#d9822b"/><rect x="96" y="132" width="30" height="24" rx="6" fill="#d9822b"/><circle cx="104" cy="122" r="9" fill="${SKIN}"/><path d="M95 120a9 9 0 0 1 18 0z" fill="#f2b33d"/><path d="M100 132l-6-12M110 132l8-14" stroke="${SKIN}" stroke-width="5" stroke-linecap="round"/><rect x="110" y="160" width="30" height="9" rx="3" fill="#2b3a55"/></g>
      ${T(272, 86, '身體縮小、雙手抱頭', '#fff', 14)}${T(272, 112, '嘴巴微張、保持姿勢', '#fff', 14)}${T(272, 138, '室內靠牆坐下；戶外趴下', '#ffe9a8', 12)}${tag}${grain}`;
    return `${sky}${skyline(172)}${ground}
      <g filter="url(#rShadow)"><rect x="190" y="70" width="8" height="102" fill="#59636a"/><path d="M176 62h36l-6 18h-24z" fill="#d6dde0"/><path d="M180 50l32-8v28l-32-8z" fill="#3ddc84"/></g>
      <path d="M72 140h96M72 154h96" stroke="#9fd0ea" stroke-width="3" opacity=".55"/><path d="M230 150l12 12 24-30" fill="none" stroke="#3ddc84" stroke-width="5" stroke-linecap="round"/>
      ${T(200, 198, '持續長聲 90 秒 = 解除警報', '#fff', 13)}${T(200, 214, '聽到解除聲，並聽大人指示後才解除', '#ffe9a8', 11)}${tag}${grain}`;
  };

  // ---- 6 小鎮空照圖：集結點 ----
  SC.town = () => `<rect width="400" height="220" fill="#7e9a6a"/>
    <g fill="#9aa1a4"><rect x="0" y="100" width="400" height="22"/><rect x="209" y="0" width="22" height="220"/><rect x="99" y="100" width="22" height="120"/></g>
    <g stroke="#f4f0dc" stroke-width="2" stroke-dasharray="10 8"><path d="M0 111H400M220 0V220M110 100V220"/></g>
    <g filter="url(#rShadow)"><polygon points="28,98 60,62 92,98" fill="#b8503f"/><rect x="34" y="98" width="52" height="4" fill="#00000030"/></g>
    <rect x="34" y="68" width="52" height="30" fill="#e9dfc8"/><polygon points="28,70 60,40 92,70" fill="#b8503f"/><rect x="52" y="78" width="14" height="20" fill="#7b5a3a"/>
    ${T(60, 30, '我們家', '#fff', 13)}
    <rect x="236" y="18" width="116" height="70" rx="6" fill="#4f8a43"/><g fill="#2f6a2f"><circle cx="258" cy="42" r="11"/><circle cx="330" cy="60" r="12"/><circle cx="296" cy="34" r="10"/><circle cx="270" cy="70" r="9"/><circle cx="318" cy="30" r="8"/></g><path d="M240 80Q290 52 348 78" stroke="#d8c9a0" stroke-width="5" fill="none"/>
    <g filter="url(#rShadow)"><rect x="118" y="130" width="92" height="12" fill="#c26a4a"/><rect x="118" y="142" width="92" height="22" fill="#e1d6bd"/><path d="M122 142h84" stroke="#a63b2a" stroke-width="5" stroke-dasharray="8 4"/></g>
    <g filter="url(#rShadow)"><rect x="240" y="150" width="46" height="26" fill="#e9e4d4"/><rect x="236" y="144" width="54" height="8" fill="#d33a2f"/><rect x="246" y="166" width="6" height="14" fill="#2a2f33"/><rect x="270" y="166" width="6" height="14" fill="#2a2f33"/></g>
    <g filter="url(#rShadow)"><rect x="318" y="146" width="76" height="22" fill="#dcd1b5"/><ellipse cx="356" cy="190" rx="34" ry="18" fill="#c9714b" stroke="#fff" stroke-width="2"/><ellipse cx="356" cy="190" rx="22" ry="10" fill="#4f8a43"/></g>
    ${grain}`;

  // ---- 6 失散：人潮、陌生人、服務台、電話 ----
  const crowdBack = () => `<rect width="400" height="220" fill="#cfc8b4"/><polygon points="0,150 400,150 400,220 0,220" fill="url(#rTile)"/>
    <g fill="#8d968f"><rect x="30" y="20" width="26" height="132"/><rect x="190" y="20" width="26" height="132"/><rect x="340" y="20" width="26" height="132"/></g>
    <g filter="url(#rShadow)"><rect x="110" y="22" width="76" height="22" rx="3" fill="#1f9a57"/><rect x="236" y="22" width="76" height="22" rx="3" fill="#2f6fb3"/></g>${T(148, 38, '出口 EXIT', '#fff', 12)}${T(274, 38, '服務台', '#fff', 12)}`;
  const crowd = () => {
    const cols = ['#c9483c', '#3b78b8', '#e0b13f', '#4c9a63', '#8b5aa8', '#d9822b', '#e8e2d0'];
    return `<g filter="url(#rBlurS)" opacity=".92">${[20, 62, 100, 146, 248, 290, 330, 372].map((x, k) => `<g transform="translate(${x} 176)"><rect x="-9" y="-48" width="18" height="30" rx="5" fill="${cols[k % 7]}"/><rect x="-7" y="-20" width="14" height="22" fill="#34404b"/><circle cx="0" cy="-58" r="8" fill="${SKIN}"/><path d="M-8 -60a8 8 0 0 1 16 0z" fill="#2a1c14"/></g>`).join('')}</g>`;
  };
  SC.crowd = c => {
    const i = c ? c.i : 3;
    if (i === 3) return `${crowdBack()}${crowd()}<ellipse cx="200" cy="108" rx="40" ry="46" fill="url(#rGlow)" opacity=".5"/>${SC.kid(200, 190, 1.9, { pack: true })}${ringA(200, 140, 52)}${T(236, 98, '？', A, 26)}${T(200, 16, '人好多，找不到爸爸媽媽了…', '#fff', 13)}${T(200, 214, '留在安全的地方，主動找可靠的大人', '#bff0d2', 12)}${grain}`;
    if (i === 4) return `${crowdBack()}${SC.adult(312, 190, 1.2, { shirt: '#262a30', pants: '#1c1f24', cap: '#15171a' })}${T(312, 108, '陌生人', '#ffb3ac', 13)}
      ${SC.adult(86, 190, 1.2, { shirt: '#2f5d8f', pants: '#25344a', cap: '#2f5d8f' })}<g filter="url(#rShadow)"><rect x="76" y="118" width="20" height="10" rx="2" fill="#f2b33d"/></g>${T(86, 100, '穿制服的服務人員', '#bff0d2', 12)}
      ${SC.kid(200, 190, 1.7, { pack: true })}<g stroke="#3ddc84" stroke-width="5" fill="none" stroke-linecap="round"><path d="M176 150h-58M128 140l-12 10 12 10"/></g><g stroke="#ff5d52" stroke-width="5" stroke-dasharray="8 6" fill="none" stroke-linecap="round"><path d="M226 150h40"/></g>${T(246, 184, '✗', '#ff5d52', 26)}${T(140, 184, '✓', '#3ddc84', 26)}${grain}`;
    if (i === 5) return `${crowdBack()}<g filter="url(#rShadow)"><rect x="226" y="116" width="150" height="44" rx="4" fill="#dcd1b5"/><rect x="226" y="108" width="150" height="10" fill="#8a7658"/></g>${T(301, 150, '服務台 INFO', '#4a3b22', 13).replace('stroke:rgba(0,0,0,.65)', 'stroke:rgba(255,255,255,0)')}
      ${SC.adult(300, 120, 1.0, { shirt: '#2f5d8f', cap: '#2f5d8f' })}${SC.kid(190, 192, 1.7, { pack: true })}
      <g filter="url(#rShadow)"><rect x="20" y="40" width="176" height="62" rx="10" fill="#fffdf4" stroke="#f2b33d" stroke-width="2.5"/></g>${T(108, 64, '我是誰・我在哪裡', '#7a4b00', 13).replace('stroke:rgba(0,0,0,.65)', 'stroke:rgba(255,255,255,0)')}${T(108, 88, '發生什麼事・需要幫忙', '#7a4b00', 13).replace('stroke:rgba(0,0,0,.65)', 'stroke:rgba(255,255,255,0)')}${grain}`;
    return `<rect width="400" height="220" fill="url(#rDusk)"/>${phone(128, 106, '110', '#2f6fb3')}${phone(272, 106, '119', '#d33a2f')}${T(128, 168, '警察', '#bcd9f6', 14)}${T(272, 168, '火災・救護', '#ffc9c3', 14)}${T(200, 204, '模擬練習，不會真的撥打', '#fff', 11)}${grain}`;
  };

  // ---- 居家安全檢查（家庭練習）：客廳 ----
  SC.room = () => `<rect width="400" height="220" fill="url(#rWall)"/><rect y="188" width="400" height="32" fill="url(#rFloor)"/><rect y="184" width="400" height="6" fill="#efe8d4"/>
    <polygon points="170,130 330,130 380,188 150,188" fill="#fff7cf" opacity=".07"/>
    <g filter="url(#rShadow)"><rect x="28" y="44" width="64" height="146" rx="2" fill="url(#rWood)"/><rect x="34" y="50" width="52" height="30" fill="#4a3320"/><rect x="34" y="86" width="52" height="30" fill="#4a3320"/><rect x="34" y="122" width="52" height="30" fill="#4a3320"/><rect x="34" y="158" width="52" height="26" fill="#4a3320"/>
      ${[[36, 54, '#c9483c'], [46, 56, '#3b78b8'], [56, 54, '#e0b13f'], [68, 56, '#4c9a63'], [38, 90, '#8b5aa8'], [52, 92, '#c9483c'], [66, 90, '#3b78b8'], [40, 126, '#e0b13f'], [56, 128, '#4c9a63']].map(([x, y, c]) => `<rect x="${x}" y="${y}" width="9" height="${y < 100 ? 24 : 22}" fill="${c}"/>`).join('')}</g>
    <g filter="url(#rShadow)"><rect x="34" y="18" width="52" height="26" fill="#c49a62"/><path d="M34 31h52" stroke="#8a6a40" stroke-width="2"/></g>
    <g filter="url(#rShadow)"><rect x="138" y="150" width="124" height="38" rx="6" fill="#4f6d8f"/><rect x="138" y="142" width="124" height="14" rx="6" fill="#6685a8"/><rect x="146" y="136" width="34" height="14" rx="5" fill="#e8e2d0"/></g>
    <g filter="url(#rShadow)"><rect x="168" y="52" width="64" height="50" fill="#6a4a2a"/><rect x="174" y="58" width="52" height="38" fill="#cfe6f0"/><path d="M178 90l14-18 12 12 10-8 12 14z" fill="#6f9a6a"/><circle cx="212" cy="68" r="5" fill="#f4d56a"/></g>
    <g filter="url(#rShadow)"><rect x="316" y="56" width="60" height="134" rx="2" fill="url(#rWood)"/><circle cx="366" cy="124" r="4" fill="#d8c27a"/></g>
    <g filter="url(#rShadow)"><rect x="300" y="156" width="24" height="32" fill="#b68a54"/><rect x="316" y="146" width="30" height="42" fill="#c49a62"/><rect x="304" y="140" width="18" height="18" fill="#a67c48"/></g>
    <path d="M296 110h-40" stroke="#8a8f95" stroke-width="5"/><rect x="262" y="96" width="14" height="28" rx="3" fill="#8a8f95"/><circle cx="276" cy="100" r="8" fill="#f2b33d"/><path d="M270 100h12" stroke="#7a4b00" stroke-width="3"/>
    <g filter="url(#rShadow)"><rect x="102" y="148" width="22" height="40" rx="7" fill="#c8362d"/><rect x="108" y="140" width="10" height="9" rx="2" fill="#2a2f33"/><path d="M118 142h12v6" stroke="#2a2f33" stroke-width="3" fill="none"/><rect x="104" y="162" width="18" height="12" fill="#fff" opacity=".85"/></g>
    <rect x="150" y="192" width="110" height="12" rx="3" fill="#8a4f4a" opacity=".85"/>
    ${grain}`;

  window.SC = SC;
})();
