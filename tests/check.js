// 資料與兒童防災安全規則檢查：node tests/check.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const win = {};
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'game', 'data.js'), 'utf8'), { window: win });
const { MISSIONS, ITEMS, WORDS, SLOTS, CATS, SOURCES, CHECKLIST, BAG_TIPS } = win;

let pass = 0, fail = 0;
const t = (name, cond, detail) => {
  if (cond) pass++; else { fail++; console.log('FAIL:', name, detail || ''); }
};
const M = id => MISSIONS.find(m => m.id === id);
const ALL = MISSIONS.filter(m => m.kind === 'mission').sort((a, b) => a.no - b.no);
const NINE = ALL.filter(m => !m.hidden);   // 目前顯示的六關
const HIDDEN = ALL.filter(m => m.hidden);  // 資料保留但不顯示（第 7、8、9 關）

// ---- 結構 ----
t('顯示六關', NINE.length === 6);
t('顯示的關卡序號 1 到 6', NINE.map(m => m.no).join() === '1,2,3,4,5,6');
t('隱藏的是現場評估、包紮、止血帶（資料保留）', HIDDEN.map(m => m.id).join() === 's1,b1,m2');
t('已移除「協助與急救」區塊所需的止血帶物品不再顯示', ITEMS.find(i => i.id === 'tourniquet').hidden === true);
['p1', 'p2', 'p3', 'm1', 'm2'].forEach(id => t('保留穩定 ID ' + id, !!M(id)));
t('ID 不重複', new Set(MISSIONS.map(m => m.id)).size === MISSIONS.length);
t('止血帶（隱藏中）仍為進階、家長陪同', M('m2').advanced === true);

const REQUIRED = ['id', 'name', 'badge', 'scene', 'icon', 'brief', 'flow', 'slogan', 'hint', 'safety', 'gear', 'parent', 'steps', 'keyPoints', 'myth', 'ifReal', 'practice', 'reflect', 'phrases', 'words'];
MISSIONS.forEach(m => {
  REQUIRED.forEach(k => t(`${m.id} 有 ${k}`, m[k] !== undefined && m[k] !== ''));
  t(`${m.id} 重點 3 項（含說明）`, m.keyPoints.length === 3 && m.keyPoints.every(k => k.t && k.d));
  t(`${m.id} 反思三問`, m.reflect.length === 3);
  t(`${m.id} 家長小卡四欄`, ['learn', 'ask', 'hint', 'real'].every(k => m.parent[k]));
  t(`${m.id} 破解卡`, m.myth.game && m.myth.real);
  t(`${m.id} 英文句型至少一句`, m.phrases.length >= 1 && m.phrases.every(p => p.en && p.zh));
  m.words.forEach(w => t(`${m.id} 單字 ${w} 在單字庫`, !!WORDS[w]));
  m.gear.forEach(g => {
    t(`${m.id} 裝備 ${g.id} 存在`, ITEMS.some(i => i.id === g.id));
    t(`${m.id} 裝備 ${g.id} 有替代做法`, !!g.alt && !!g.why);
  });
  t(`${m.id} 有步驟`, m.steps.length >= 2);
});
t('六關的解鎖句彼此不同', new Set(NINE.map(m => m.phrases[0].en)).size >= 5, NINE.map(m => m.phrases[0].en).join('|'));
const allPhrases = MISSIONS.flatMap(m => m.phrases.map(p => p.en));
['Stay calm.', 'I need help.', 'Stay away.', 'Follow the instructions.'].forEach(p => t('句型 ' + p + '（六關）', NINE.flatMap(m => m.phrases.map(x => x.en)).includes(p)));
['Are you okay?', 'I am here to help.', "Don't worry, I've got you."].forEach(p => t('句型 ' + p + '（隱藏關卡保留）', allPhrases.includes(p)));
const SLOGANS = { m1: '地震來了先趴下，掩護頭頸要穩住。', f1: '有路快逃生，濃煙擋路要關門求救。', w1: '積水不亂走，避開危險找大人。', a1: '聽到警報先掩蔽，遠離窗戶聽指示。', p3: '找不到家人不亂跑，找可靠的大人來幫忙。' };
Object.keys(SLOGANS).forEach(id => t('口訣 ' + id, M(id).slogan === SLOGANS[id]));

// ---- 英文單字 ----
const shownWords = new Set([...NINE, M('p1')].flatMap(m => m.words).concat(ITEMS.filter(i => !i.hidden && i.word).map(i => i.word)));
t('顯示的單字至少 25 個（六關與防災包物品）', shownWords.size >= 25, shownWords.size);
['earthquake', 'drop', 'cover', 'hold', 'fire', 'smoke', 'exit', 'stairs', 'flood', 'water', 'safe', 'shelter', 'warning', 'helmet', 'flashlight', 'whistle', 'backpack', 'first aid', 'help', 'call', 'family', 'meeting point', 'emergency'].forEach(w => t('單字 ' + w + ' 出現在六關', shownWords.has(w)));
['bandage', 'pressure'].forEach(w => t('單字 ' + w + ' 仍在資料中（隱藏關卡用）', !!WORDS[w]));
Object.entries(WORDS).forEach(([w, v]) => {
  t(`單字 ${w} 有中文與音節`, !!v.zh && !!v.syl);
  t(`單字 ${w} 音節拆分字母相符`, v.syl.replace(/[·\s]/g, '').toLowerCase() === w.replace(/\s/g, '').toLowerCase(), v.syl);
});

// ---- 防災包 ----
t('防災包 14 格', SLOTS === 14);
t('物品 ID 不重複', new Set(ITEMS.map(i => i.id)).size === ITEMS.length);
ITEMS.forEach(i => {
  t(`物品 ${i.id} 有圖示與用途`, !!i.icon && !!i.use && !!i.name);
  t(`物品 ${i.id} 分類有效`, CATS.includes(i.cat));
  if (i.word) t(`物品 ${i.id} 單字存在`, !!WORDS[i.word]);
});
t('有干擾物品，遊戲機與大型玩偶', ['console', 'plush'].every(id => ITEMS.find(i => i.id === id && i.decoy)));
t('能量點心不是錯誤物品', !ITEMS.find(i => i.id === 'snack').decoy);
t('必備物品放得進背包', ITEMS.filter(i => i.need).length <= SLOTS);
t('防災包提示含存放位置、鞋子、處方藥', JSON.stringify(BAG_TIPS).includes('玄關') && JSON.stringify(BAG_TIPS).includes('鞋') && JSON.stringify(BAG_TIPS).includes('處方藥'));

// ---- 步驟結構 ----
const TYPES = ['choice', 'multi', 'sequence', 'item', 'hold', 'map', 'hunt', 'slots'];
MISSIONS.forEach(m => m.steps.forEach((s, i) => {
  const n = `${m.id}#${i + 1} ${s.type}`;
  t(`${n} 類型有效`, TYPES.includes(s.type));
  t(`${n} 有隊長說明與提示語`, !!s.radio && !!s.prompt);
  if (s.only) t(`${n} 分支標記`, ['A', 'B'].includes(s.only));
  if (s.type === 'choice') {
    const branch = s.options.some(o => o.branch);
    t(`${n} 恰一個正確（或皆為分支）`, branch ? s.options.every(o => o.ok && o.branch) : s.options.filter(o => o.ok).length === 1);
    s.options.filter(o => !o.ok).forEach(o => t(`${n} 錯誤選項有說明`, !!o.fb && o.fb.length > 6, o.t));
    t(`${n} 正確選項有說明`, s.options.filter(o => o.ok).every(o => !!o.fb));
    t(`${n} 至少 2 個選項`, s.options.length >= 2);
  }
  if (s.type === 'multi') {
    t(`${n} 正確與錯誤選項`, s.options.filter(o => o.ok).length >= 2 && s.options.some(o => !o.ok));
    s.options.filter(o => !o.ok).forEach(o => t(`${n} 錯誤選項有說明`, !!o.fb, o.t));
  }
  if (s.type === 'sequence') { t(`${n} 順序≥3`, s.order.length >= 3); s.decoys.forEach(d => t(`${n} 干擾有說明`, !!d.fb)); }
  if (s.type === 'item') { t(`${n} 物品存在`, ITEMS.some(i => i.id === s.need)); t(`${n} 有替代做法`, !!s.alt); }
  if (s.type === 'hold') t(`${n} 動作單字`, !!WORDS[s.verb]);
  if (s.type === 'map') {
    t(`${n} 恰一個正確位置`, s.zones.filter(z => z.ok).length === 1);
    s.zones.forEach(z => t(`${n} 位置 ${z.id} 有說明`, !!z.fb));
  }
  if (s.type === 'hunt') t(`${n} 找危險 ≥4`, s.spots.length >= 4 && s.spots.every(p => p.t && p.fix));
  if (s.type === 'slots') s.slots.forEach(sl => t(`${n} ${sl.label} 恰一個正確`, sl.options.filter(o => o.ok).length === 1 && sl.options.filter(o => !o.ok).every(o => !!o.fb)));
}));
const f1 = M('f1');
t('火災有 A、B 兩個分支', f1.steps.some(s => s.only === 'A') && f1.steps.some(s => s.only === 'B'));

// ---- 兒童防災安全規則 ----
const opts = id => M(id).steps.flatMap(s => (s.options || []).map(o => ({ ...o, step: s })));
const zones = id => M(id).steps.flatMap(s => (s.zones || []).map(z => ({ ...z, step: s })));
const mustWrong = (id, re, label) => {
  const found = opts(id).filter(o => re.test(o.t));
  t(`${label}：選項存在`, found.length > 0, String(re));
  found.forEach(o => t(`${label}：「${o.t.slice(0, 18)}」不可判定為正確`, !o.ok));
};
const mustOk = (id, re, label) => t(label, opts(id).some(o => re.test(o.t) && o.ok), String(re));

// 地震
t('地震：只有堅固桌子是正確位置', zones('m1').filter(z => z.ok).map(z => z.id).join() === 'desk');
mustWrong('m1', /^(馬上衝出教室|跑到窗邊看外面|趁現在去拿書包|去關電燈或關瓦斯|站起來衝出去|趕快自己衝出去|先回座位把書包|搭電梯比較快|站在大櫃子旁邊)/, '地震危險行為');
mustOk('m1', /^走樓梯，不搭電梯/, '地震：走樓梯、不搭電梯');
mustOk('m1', /蹲下或趴低，用手臂保護頭頸/, '地震：沒有桌子時保護頭頸');
t('地震：不鼓勵生命三角', !opts('m1').some(o => o.ok && /三角/.test(o.t)));
// 火災
mustWrong('f1', /^(憋氣|躲進浴室|去搭電梯|很快，回去拿一下|回頭看看|從窗戶往下跳|打開門看看|先找濕毛巾)/, '火災危險行為');
zones('f1').filter(z => z.id === 'lift' || z.id === 'room').forEach(z => t('火災：電梯與回教室不是正確位置', !z.ok));
mustOk('f1', /^不穿越濃煙，退回有門的房間，把門關上/, '火災：濃煙擋路關門');
mustOk('f1', /^通報 119/, '火災：通報 119');
mustOk('f1', /^不回去，先逃出去/, '火災：不回頭拿東西');
// 颱風淹水
['road', 'under', 'river', 'wire'].forEach(id => t('淹水：' + id + ' 不是安全位置', !zones('w1').find(z => z.id === id).ok));
t('淹水：只有高處安全室內正確', zones('w1').filter(z => z.ok).map(z => z.id).join() === 'safe');
mustWrong('w1', /^(趕快涉水|從地下道抄近路|用樹枝把它挑開|走過去看看|到河邊看浪|和同學出去騎車|留下來，我想看看)/, '淹水危險行為');
mustOk('w1', /^留在安全的地方，聯絡家人/, '淹水：留在安全處聯絡家人');
// 防空
mustWrong('a1', /^(搭電梯下去比較快|站在窗邊|跑到頂樓或陽台|躲在窗戶旁邊|站著看天空|躲在大樓玻璃帷幕旁|聲音停了就可以馬上出去|這只是遊戲音效|大叫、四處亂跑)/, '防空危險行為');
mustOk('a1', /離窗戶最遠的房間/, '防空：室內離窗戶遠');
mustOk('a1', /就地趴下/, '防空：戶外空曠就地趴下');
mustOk('a1', /防空避難」標示/, '防空：戶外有建築找標示處所');
mustOk('a1', /解除警報聲/, '防空：等解除聲');
t('防空：兩種不同場景（有地下室與無法前往）', M('a1').steps.some(s => /有地下室/.test(s.radio)) && M('a1').steps.some(s => /沒有地下室/.test(s.radio)));
t('防空：標示模擬演練', /模擬演練/.test(M('a1').brief) && /沒有音效|沒有爆炸/.test(M('a1').safety));
// 失散
mustWrong('p3', /^(自己跑到陌生的地方|他看起來很好心|跟他一起去找|先坐在路邊哭)/, '失散危險行為');
mustOk('p3', /^不跟他走/, '失散：不跟陌生人走');
mustOk('p3', /^留在安全的地方，找老師、警察/, '失散：找可靠的大人');
t('失散：求救對話含我是誰、在哪、發生什麼事、需要什麼幫忙', ['我是誰', '我在哪裡', '發生什麼事', '需要什麼幫忙'].every(l => M('p3').steps.some(s => s.slots && s.slots.some(sl => sl.label === l))));
t('失散：認識 119 與 110', /110/.test(JSON.stringify(M('p3'))) && /119/.test(JSON.stringify(M('p3'))));
t('失散：模擬不會真的撥打', /不會真的/.test(JSON.stringify(M('p3'))));
// 現場評估
mustWrong('s1', /^(立刻衝過去|拿手機拍照|自己把他拖出來|假裝沒看到|用木棍把它撥|衝進危險的地方|拔掉受傷的人身上)/, '現場評估危險行為');
mustOk('s1', /^停在安全的地方，不靠近危險物/, '現場評估：先確認安全');
// 包紮：擦傷不用止血帶
const b1first = M('b1').steps[0];
t('包紮：擦傷情境', /擦破皮/.test(b1first.radio));
t('包紮：擦傷不能選止血帶', b1first.options.filter(o => /止血帶/.test(o.t)).every(o => !o.ok));
mustWrong('b1', /^(直接用止血帶|自己馬上綁止血帶|先上網查|一直沖水，不壓|放著不管|拿掉換一塊新的|越緊越好)/, '包紮危險或不當處理');
mustOk('b1', /^先叫大人，並用乾淨的布直接壓住傷口/, '包紮：直接加壓');
mustOk('b1', /^立刻大聲叫大人、請人撥 119/, '包紮：嚴重出血求救');
// 止血帶
t('止血帶：只有 A 位置正確（傷口上方，非關節、非傷口上）', zones('m2').filter(z => z.ok).map(z => z.id).join() === 'A');
t('止血帶：標示 5 到 8 公分與高又緊', /5 到 8 公分/.test(JSON.stringify(M('m2'))) && /高又緊/.test(JSON.stringify(M('m2'))));
mustWrong('m2', /^(馬上綁止血帶|膝蓋擦傷流一點血|脖子或肚子受傷|是的，我已經是救護員了|放手讓它自己停著|鬆開一下讓他休息|先上網查|原地停下來)/, '止血帶危險或不當判斷');
t('止血帶：先求救再加壓再止血帶（步驟順序）', (() => { const ts = M('m2').steps.map(s => s.prompt + s.radio); const idx = re => ts.findIndex(x => re.test(x)); return idx(/確認|安全/) < idx(/撥|求救|大人/) && idx(/大量出血|求救|撥/) < idx(/直接壓|加壓/) && idx(/加壓/) < idx(/止血帶，需要|拿出止血帶/); })());
t('止血帶：提醒不可在真人身上練習', /不要在真人身上練習|不可在真人身上練習/.test(JSON.stringify(M('m2'))));
t('止血帶：提醒不等於正式能力', /不取代實體|實體急救課程/.test(JSON.stringify(M('m2'))));
t('止血帶：頸頭胸腹不可用', /頸部、頭部、胸腹部不可以用止血帶/.test(JSON.stringify(M('m2'))));
// 防災關鍵卡內容（六關的重點）不得有相反的安全指示
const FORBID = /可以搭電梯|搭電梯逃生|躲進浴室|涉水回家|跟(著)?陌生人走|綁在膝蓋|馬上綁止血帶|衝向樓梯|回去拿書包/;
MISSIONS.forEach(m => m.keyPoints.forEach(k => t(`重點不含相反指示（${m.id}）`, !FORBID.test(k.t + k.d), k.t)));

// ---- 其他功能資料 ----
t('家庭檢查表 7 項', CHECKLIST.length === 7 && new Set(CHECKLIST.map(c => c.id)).size === 7);
['tfdp.com.tw', 'prepare.mnd.gov.tw/emergency-responses', 'prepare.mnd.gov.tw/emergency-supplies/go-bag', 'nfa.gov.tw', 'redcross.org'].forEach(u => t('教材來源 ' + u, SOURCES.some(s => s.url.includes(u))));
t('每個來源說明用在哪裡', SOURCES.every(s => s.used && s.name));
t('止血帶關卡（隱藏中）保留補充教學影片連結', M('m2').video && M('m2').video.url === 'https://www.youtube.com/watch?v=RNTbz-ObAaA' && !!M('m2').video.org);
t('補充影片仍列在教材來源', SOURCES.some(s => s.url.includes('RNTbz-ObAaA')));
t('只有止血帶關卡放影片（其他關不放未核對的外部內容）', MISSIONS.filter(m => m.video).map(m => m.id).join() === 'm2');

console.log(`\n結果：${pass} 項通過，${fail} 項失敗`);
process.exit(fail ? 1 : 0);
