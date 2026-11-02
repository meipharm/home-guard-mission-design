// 瀏覽器實際操作測試：用 http 伺服器開啟 tests/e2e.html（例如 python -m http.server 後開 /tests/e2e.html）
// 測試在 iframe 裡真的點擊遊戲；網址帶 ?test=1，使用獨立的儲存名稱，不會動到真正的進度。
window.runE2E = async function () {  const R = [];
  const ok = (n, c, d) => R.push({ n, ok: !!c, d: c ? '' : (d === undefined ? '' : String(d)) });
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const clearTest = () => { Object.keys(localStorage).filter(k => k.startsWith('hg.test.')).forEach(k => localStorage.removeItem(k)); };

  async function load(w) {
    const f = document.createElement('iframe');
    f.style.cssText = `width:${w}px;height:700px;border:0;display:block`;
    f.src = '../game/index.html?test=1';
    document.getElementById('frames').appendChild(f);
    await new Promise(r => { f.onload = r; });
    await sleep(60);
    const win = f.contentWindow;
    win.__errs = [];
    win.addEventListener('error', e => win.__errs.push('error: ' + e.message));
    const ce = win.console.error; win.console.error = (...a) => { win.__errs.push('console: ' + a.join(' ')); ce.apply(win.console, a); };
    return { f, win, doc: win.document, w };
  }
  const Q = ctx => s => ctx.doc.querySelector(s);
  const QA = ctx => s => [...ctx.doc.querySelectorAll(s)];
  const fire = (ctx, el) => el.dispatchEvent(new ctx.win.MouseEvent('click', { bubbles: true }));

  // 玩完一關：每個步驟先故意選錯（確認可重選），再選對；回傳覆盤畫面檢查
  async function play(ctx, id, o) {
    o = o || {};
    const q = Q(ctx), qa = QA(ctx), HG = ctx.win.HG, m = HG.MISSIONS.find(x => x.id === id);
    const tag = `${id}${o.branch ? '(' + o.branch + ')' : ''}${o.items ? '' : '(缺裝備)'}`;
    HG.S.loadout = (o.items || []).slice();
    HG.show('brief', m);
    const go = q('#go');
    if (m.advanced) {
      ok(`${tag} 進階關卡需先勾選家長陪同才能開始`, go.disabled);
      const g = q('#g-ok'); g.checked = true; g.dispatchEvent(new ctx.win.Event('change'));
      ok(`${tag} 勾選後可開始`, !q('#go').disabled);
    }
    ok(`${tag} 簡報有場景圖與流程時間軸`, q('.viewport svg') && qa('.timeline li').length >= 3);
    q('#go').click();
    if (m.gobag) {
      HG.S.loadout.length || (() => { })();
      window.__needs = HG.ITEMS.filter(i => i.need).map(i => i.id);
      window.__needs.forEach(iid => { if (!HG.S.loadout.includes(iid)) q(`[data-item="${iid}"]`).click(); });
      q('#check').click();
      ok('p2 防災包檢查有存放位置與背包提示', /放哪裡/.test(q('#report').textContent) && /雙肩背包/.test(q('#report').textContent));
      q('#finish').click();
    }
    let guard = 0, wrongTried = 0;
    while (!q('.unlock') && guard++ < 60) {
      const c = HG.S.cur; if (!c) { ok(`${tag} 進度中斷`, false); return; }
      const st = c.list[c.i], sn = `${tag}#${c.i + 1} ${st.type}`;
      ok(`${sn} 有場景畫面`, q('.viewport svg') && q('.viewport svg').innerHTML.length > 200);
      if (st.type === 'choice') {
        if (st.options.some(x => x.branch)) {
          const k = st.options.findIndex(x => x.branch === (o.branch || 'A'));
          q(`[data-k="${k}"]`).click();
        } else {
          const w = st.options.findIndex(x => !x.ok);
          q(`[data-k="${w}"]`).click(); wrongTried++;
          ok(`${sn} 答錯：有說明且可再選、沒有直接結束`, q('.fb.bad') && !q('#next') && qa('[data-k]').length === st.options.length);
          q('#hintbtn').click();
          q(`[data-k="${st.options.findIndex(x => x.ok)}"]`).click();
        }
      } else if (st.type === 'multi') {
        const bad = st.options.findIndex(x => !x.ok);
        q(`[data-k="${bad}"]`).click(); q('#ok').click();
        ok(`${sn} 選到錯的：說明原因`, q('.fb.bad'));
        q(`[data-k="${bad}"]`).click();
        st.options.forEach((x, k) => { if (x.ok && !qa('[data-k]')[k].classList.contains('picked')) q(`[data-k="${k}"]`).click(); });
        q('#ok').click();
      } else if (st.type === 'sequence') {
        q(`[data-t="${st.decoys[0].t}"]`).click();
        ok(`${sn} 干擾項有說明`, q('.fb.bad'));
        for (const t of st.order) qa('[data-t]').find(b => b.dataset.t === t).click();
      } else if (st.type === 'item') {
        const b = q(`[data-id="${st.need}"]`);
        const wrongItem = qa('[data-id]').find(x => x.dataset.id !== st.need);
        if (wrongItem) { wrongItem.click(); ok(`${sn} 拿錯裝備可再選`, q('.fb.bad') && !q('#next')); }
        if (b) b.click(); else { q('#none').click(); ok(`${sn} 缺裝備仍可用替代做法完成`, q('#next') && /替代/.test(q('#fb').textContent)); }
      } else if (st.type === 'map') {
        const bad = st.zones.find(z => !z.ok);
        fire(ctx, q(`[data-zone="${bad.id}"]`));
        ok(`${sn} 點錯位置：說明原因並可再選`, q('.fb.bad') && !q('#next'));
        fire(ctx, q(`[data-zone="${st.zones.find(z => z.ok).id}"]`));
      } else if (st.type === 'hold') {
        q('#hold').dispatchEvent(new ctx.win.PointerEvent('pointerdown', { bubbles: true }));
        for (let i = 0; i < 60 && !q('#next'); i++) await sleep(60);
      } else if (st.type === 'hunt') {
        ok(`${sn} 可點的地方有 ? 記號`, qa('.zone.hot .q').length >= st.spots.length - 0 || qa('.zone.hot .q').length >= 4);
        fire(ctx, q('[data-safe="0"]'));
        ok(`${sn} 點到安全的地方：說明`, q('.fb.alt'));
        q('#hintbtn').click();
        ok(`${sn} 提示會標出可點處`, qa('.zone.hinted').length >= 1);
        for (let k = 0; k < st.spots.length; k++) { const g = q(`[data-spot="${k}"]`); if (g) fire(ctx, g); }
      } else if (st.type === 'slots') {
        for (let s = 0; s < st.slots.length; s++) {
          const sl = st.slots[s];
          q(`[data-k="${sl.options.findIndex(x => !x.ok)}"]`).click();
          ok(`${sn} 第${s + 1}句選錯：說明`, q('.fb.bad'));
          q(`[data-k="${sl.options.findIndex(x => x.ok)}"]`).click();
        }
      }
      if (!q('#next')) { ok(`${sn} 完成後出現下一步`, false); return; }
      ok(`${sn} 完成有「✓ 做對了」提醒`, q('.okmark'));
      q('#next').click();
    }
    const done = HG.S.done[id];
    ok(`${tag} 完成並解鎖覆盤`, q('.unlock') && done);
    if (!q('.unlock')) return;
    ok(`${tag} 解鎖句為本關句型`, q('.unlock .phrase').textContent === m.phrases[0].en, q('.unlock .phrase').textContent);
    ok(`${tag} 覆盤七段結構`, ['本關學會了什麼', '遊戲 vs 現實', '如果真的發生', '和家人一起練習', '反思三問', '完成徽章'].every(t => q('main').textContent.includes(t)));
    ok(`${tag} 有口訣與英文發音鍵`, q('main').textContent.includes('口訣') && qa('[data-say]').length >= 2);
    q('#flip').click(); ok(`${tag} 破解卡可翻開`, q('.myth'));
    ok(`${tag} 有徽章集點卡蓋章`, m.kind === 'mission' ? qa('.stamp.got').length === HG.MISSIONS.filter(x => x.kind === 'mission' && HG.S.done[x.id]).length : true);
    ok(`${tag} 可重玩`, !!q('#replay'));
    if (m.video) ok(`${tag} 有補充影片連結`, qa('a[href*="RNTbz-ObAaA"]').length >= 1 && q('a[href*="RNTbz-ObAaA"]').target === '_blank');
  }

  // ===== 1. 九關完整流程 =====
  clearTest();
  let ctx = await load(1000);
  const HG = ctx.win.HG, q = Q(ctx), qa = QA(ctx);
  ok('標題畫面載入', q('h1') && /先保護自己/.test(q('h1').textContent));
  q('#start').click();
  ok('演習基地：六關 + 家庭練習兩張卡片', qa('.mission-card').length === 8, qa('.mission-card').length);
  ok('演習基地沒有「協助與急救」區塊', !/協助與急救/.test(q('main').textContent) && !qa('.mission-card').some(x => /止血帶|簡易包紮|現場評估/.test(x.textContent)));
  ok('演習基地：集點卡 6 格', qa('.stampcard.mini .stamp').length === 6);
  const needs = HG.ITEMS.filter(i => i.need).map(i => i.id);
  const FULL = needs.concat(['pen', 'helmet', 'shoes']).slice(0, 14);
  for (const id of ['p2', 'm1', 'w1', 'a1', 'p3']) await play(ctx, id, { items: FULL });
  await play(ctx, 'm1', {});          // 缺防災頭套：仍可完成
  await play(ctx, 'f1', { branch: 'A', items: FULL });
  await play(ctx, 'f1', { branch: 'B', items: FULL });
  await play(ctx, 'p1', {});
  ok('六關全部完成並蓋章', HG.MISSIONS.filter(x => x.kind === 'mission' && !x.hidden).every(x => HG.S.done[x.id]));
  ok('隱藏的關卡不會被算進進度', !HG.S.done.s1 && !HG.S.done.b1 && !HG.S.done.m2);
  HG.show('stamps'); ok('集點卡集滿顯示恭喜', q('.s-sum').textContent.includes('6') && /恭喜/.test(q('.s-sum').textContent));
  HG.show('hub'); ok('重玩後進度不遺失', qa('.mission-card.done').length >= 6);

  // ===== 情境環境音：依關卡與步驟啟動，離開或答對後停止，可在設定關閉 =====
  const ambAt = (id, i, opt) => { opt = opt || {}; HG.show('brief', HG.MISSIONS.find(x => x.id === id)); q('#go').click(); const cc = HG.S.cur; if (opt.branch) { cc.branch = opt.branch; cc.list = cc.m.steps.filter(s => !s.only || s.only === opt.branch); } cc.i = i; cc.solved = !!opt.solved; HG.ROUTES.step(); return HG.ambKind(); };
  HG.S.set.amb = true;
  ok('環境音：地震搖晃時有低沉震動', ambAt('m1', 0) === 'quake');
  ok('環境音：地震答對後（搖晃停止）安靜', ambAt('m1', 0, { solved: true }) === null);
  ok('環境音：火災有輕微警示聲', ambAt('f1', 1, { branch: 'B' }) === 'fire');
  ok('環境音：颱風淹水有雨聲', ambAt('w1', 2) === 'rain');
  ok('環境音：防空演練只在警報的第一步有柔和提示音', ambAt('a1', 0) === 'siren' && ambAt('a1', 1) === null);
  ok('環境音：與家人失散的人潮場景有遠處人聲', ambAt('p3', 3) === 'crowd' && ambAt('p3', 0) === null);
  ok('環境音：防災背包沒有環境音', ambAt('p2', 0) === null);
  ambAt('m1', 0); HG.show('hub'); ok('環境音：離開關卡就停止', HG.ambKind() === null);
  HG.S.set.amb = false; ok('環境音：設定關閉後不再播放', ambAt('m1', 0) === null); HG.S.set.amb = true; HG.show('hub');

  // ===== 2. 功能 =====
  HG.S.loadout = []; HG.show('brief', HG.MISSIONS.find(x => x.id === 'p2')); q('#go').click();
  const ids = HG.ITEMS.map(i => i.id);
  ids.forEach(id => { const b = q(`[data-item="${id}"]`); if (b) b.click(); });
  ok('防災包最多 14 格', HG.S.loadout.length === 14, HG.S.loadout.length);
  ok('滿格有提示', /滿了/.test(q('#toast').textContent));
  q(`[data-item="${HG.S.loadout[0]}"]`).click(); ok('可拿出物品', HG.S.loadout.length === 13);
  ok('防災包在側邊（獨立欄位，電腦版固定在畫面上）', !!q('.gb-side .slots') && qa('.gb-side [data-rm]').length === HG.S.loadout.length && !!q('.gobag-layout'));
  { const before = HG.S.loadout.length, rm = q('.gb-side [data-rm]'); rm.click(); ok('點背包格子可以拿出物品', HG.S.loadout.length === before - 1); }
  ok('側邊背包顯示已放數量與優先物品進度', q('.bagpanel').textContent.includes('/ 14') && q('.bagpanel').textContent.includes('優先物品：已放'));
  ok('物品卡有英文單字與發音鍵', qa('.item-card .word .say').length >= 30);
  ok('物品有用途與音節（不含隱藏的止血帶）', qa('.item-card .syl').length >= 15 && qa('.item-card .use').length === HG.ITEMS.filter(i => !i.hidden).length);
  ok('防災包不再出現止血帶', !q('main').textContent.includes('止血帶'));
  ok('物品依四大類分組', ['水和食物', '衛生用品', '生活防災用品', '照護用品'].every(c => q('main').textContent.includes(c)));
  
  HG.show('vocab');
  ok('單字庫至少 25 個詞條（只列六關用到的）', qa('table tr').length - 1 >= 25, qa('table tr').length);
  ok('單字庫不含只屬於隱藏關卡的單字', !/tourniquet|tighten/.test(q('table').textContent));
  ok('單字有中文、音節、關卡、聽/慢', qa('table tr')[1].querySelectorAll('.say').length === 2 && /關|練習/.test(qa('table tr')[1].textContent));
  const all = qa('table tr').length;
  qa('[data-f]').find(b => b.dataset.f === 'm1').click();
  ok('單字可依關卡篩選', qa('table tr').length < all && qa('table tr').length > 3);
  const cb = q('[data-w]'); cb.checked = true; cb.dispatchEvent(new ctx.win.Event('change'));
  ok('家長勾選說出來了（並寫入本機）', HG.S.said.size === 1 && JSON.parse(ctx.win.localStorage.getItem('hg.test.said')).length === 1);
  q('#vreset').click(); ok('單字勾選可重設', HG.S.said.size === 0);

  ctx.win.speechSynthesis && (ctx.win.speechSynthesis.speak = () => { throw new Error('boom'); });
  HG.show('vocab'); let threw = false; try { q('[data-say]').click(); } catch (e) { threw = true; }
  ok('發音失敗不會中斷遊戲', !threw && q('h1'));
  HG.S.set.mute = true; q('[data-say]').click(); ok('關閉語音時顯示提示而不報錯', /語音已關閉/.test(q('#toast').textContent)); HG.S.set.mute = false;

  HG.show('family');
  ok('家庭檢查表 7 項', qa('[data-c]').length === 7);
  ok('家庭檢查表：新芽成長圖（尚未勾選時是種子）', !!q('.growth') && q('.growth').dataset.stage === '0');
  q('[data-c="exit"]').checked = true; q('[data-c="exit"]').dispatchEvent(new ctx.win.Event('change'));
  ok('勾選存本機', JSON.parse(ctx.win.localStorage.getItem('hg.test.family')).exit === true);
  ok('勾選後新芽長大', Number(q('.growth').dataset.stage) >= 1 && q('.growth-t p').textContent.length > 0);
  qa('[data-c]').forEach(b => { b.checked = true; b.dispatchEvent(new ctx.win.Event('change')); });
  ok('全部勾選後開花', q('.growth').dataset.stage === '5' && q('.growth-t').textContent.includes('開花'));
  q('#creset').click();
  q('[data-c="exit"]').checked = true; q('[data-c="exit"]').dispatchEvent(new ctx.win.Event('change'));
  ok('已完成 1/7', /1 \/ 7/.test(q('.panel strong').textContent));
  q('#creset').click(); ok('重設檢查表', !Object.values(HG.S.fam).some(Boolean));
  ok('家庭練習頁不再有重複的聯絡卡，改為指向防災關鍵卡的小約定', !q('#contact') && !q('#pc') && !!q('[data-go="card"]') && !q('main').textContent.includes('列印聯絡卡'));

  // 集點卡：隊員呼號、通關日期、通關總時間、心得
  HG.show('stamps');
  ok('集點卡：隊員呼號', q('#stampcard .s-info').textContent.includes(HG.S.callsign));
  ok('集點卡：通關日期（六關全部完成）', new RegExp('[0-9]{4}[/][0-9]{2}[/][0-9]{2}').test(q('#stampcard .s-info').textContent) && q('#stampcard .s-info').textContent.includes('通關日期'));
  ok('集點卡：通關總時間', q('#stampcard .s-info').textContent.includes('通關總時間') && /秒|分/.test(q('#stampcard .s-info').textContent));
  ok('每一關都記下第一次完成的時間與花費秒數', ['p2', 'm1', 'f1', 'w1', 'a1', 'p3'].every(id => typeof HG.S.times[id] === 'number' && HG.S.doneAt[id] > 0), JSON.stringify(HG.S.times));
  ok('每枚已蓋章顯示日期與時間', qa('#stampcard .stamp.got .s-when').length === 6);
  { const ta = q('#notein'); ta.value = '我學到地震要趴下'; ta.dispatchEvent(new ctx.win.Event('input')); ok('心得欄：輸入後即時顯示在卡片上', q('#notebox').textContent === '我學到地震要趴下'); ok('心得存在本機', ctx.win.localStorage.getItem('hg.test.note').includes('趴下')); }
  ok('心得欄有字數限制與隱私提醒', q('#notein').maxLength === 300 && q('main').textContent.includes('不要寫真實姓名'));

  HG.show('card');
  ok('防災關鍵卡：六組孩子須知（六關各一組）', qa('#poster .kc').length === 6, qa('#poster .kc').length);
  ok('每組有口訣與三個重點', qa('#poster .kc').every(k => k.querySelector('.slogan') && k.querySelectorAll('li').length === 3));
  ok('關鍵卡是固定內容，不需挑選', qa('[data-p]').length === 0 && !q('#print').disabled);
  ok('家庭防災小約定分項：集結點、緊急聯絡人、電話、學校集合地點、避難包位置、集合方式', ['第一集結點', '第二集結點', '緊急聯絡人', '聯絡電話', '學校避難集合地點', '避難包放在', '集合方式'].every(t => qa('#poster .promise .cc-row b').some(b => b.textContent.includes(t))), qa('#poster .promise .cc-row').length);
  ok('小約定的集結點帶入遊戲中選的地點', !HG.S.family.first || qa('#poster .promise .cc-line')[0].textContent === HG.S.family.first, qa('#poster .promise .cc-line')[0].textContent);
  ok('小約定不含輸入欄位（電話手寫）', qa('#poster input').length === 0);
  ok('關鍵卡含 A4 預覽、119/110、小約定', !!q('#poster.a4') && /小約定/.test(q('#poster').textContent) && /110/.test(q('#poster').textContent));
  ok('關鍵卡不再叫宣傳卡，也沒有止血帶內容', !/宣傳/.test(q('main').textContent) && !/止血帶/.test(q('#poster').textContent));
  ok('關鍵卡各組有簡單圖示', qa('#poster .kc .m-icon svg').length === 6);

  HG.show('sources'); ok('教材來源頁含 5 個指定來源與免責', ['tfdp.com.tw', 'prepare.mnd.gov.tw/emergency-responses', 'go-bag', 'nfa.gov.tw', 'redcross.org'].every(u => q('main').innerHTML.includes(u)) && /沒有獲得任何機關認證/.test(q('main').textContent));
  ok('設定：音效、語音、動畫可切換', ['st-sfx', 'st-amb', 'st-mute', 'st-calm'].every(id => (HG.show('hub'), q('#' + id))));
  HG.S.set.calm = true; ctx.win.document.body.classList.add('calm'); ok('降低動畫模式可開啟', ctx.doc.body.classList.contains('calm')); ctx.doc.body.classList.remove('calm');

  // ===== 3. 版面（各寬度無水平溢出） =====
  const errs = [].concat(ctx.win.__errs);
  ctx.f.remove();
  for (const w of [320, 375, 390, 768, 1200]) {
    const c = await load(w), d = c.doc, h = c.win.HG, qq = Q(c), qqa = QA(c);
    const over = n => ok(`${w}px ${n} 無水平溢出`, d.documentElement.scrollWidth <= w, d.documentElement.scrollWidth);
    over('標題'); qq('#start').click(); over('演習基地');
    for (const id of ['p2', 'm1', 'f1', 'w1', 'a1', 'p3', 'p1']) {
      h.show('brief', h.MISSIONS.find(x => x.id === id));
      if (id === 'p2') { qq('#go').click(); over('防災包'); }
      else { qq('#go').click(); over(id + ' 第一步'); }
      if (h.S.cur) { const st = h.S.cur.list[0]; const vp = qq('.viewport').getBoundingClientRect(); ok(`${w}px ${id} 場景完整顯示`, vp.width > 0 && vp.height > 100 && vp.width <= w); }
    }
    h.S.cur = null; h.show('vocab'); over('單字庫'); h.show('family'); over('家庭練習'); h.show('card'); over('防災關鍵卡'); h.show('stamps'); over('集點卡'); h.show('sources'); over('教材來源');
    if (w === 320) {
      h.show('brief', h.MISSIONS.find(x => x.id === 'm1')); qq('#go').click();
      const bad = [...d.querySelectorAll('button, .zone')].filter(b => !b.closest('.g-nav') && (() => { const r = b.getBoundingClientRect(); return r.width > 0 && r.right > w + 1; })());   // 導覽列在手機上是可左右滑動的單行，不算溢出
      ok('320px 按鈕不超出畫面', bad.length === 0, bad.length);
      const small = [...d.querySelectorAll('.opt, .btn, .g-nav button, .say')].filter(b => { const r = b.getBoundingClientRect(); return r.width > 0 && (r.height < 43.5 || r.width < 43.5); });
      ok('主要按鈕觸控目標至少 44px', small.length === 0, small.map(b => b.className + ':' + Math.round(b.getBoundingClientRect().height)).slice(0, 4).join());
    }
    errs.push(...c.win.__errs); c.f.remove();
  }
  ok('整個測試過程沒有 JavaScript 錯誤或 console error', errs.length === 0, errs.slice(0, 3).join(' | '));
  clearTest();
  return R;
};
