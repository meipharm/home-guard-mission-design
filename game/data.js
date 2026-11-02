// 家園救援任務：平日整備與演習的固定資料（草案，防災與急救步驟待官方資料核對）

window.WORDS = {
  water: { zh: '水', syl: 'wa·ter' },
  food: { zh: '食物', syl: 'food' },
  flashlight: { zh: '手電筒', syl: 'flash·light' },
  battery: { zh: '電池', syl: 'bat·ter·y' },
  'power bank': { zh: '行動電源', syl: 'pow·er bank' },
  radio: { zh: '收音機', syl: 'ra·di·o' },
  whistle: { zh: '哨子', syl: 'whis·tle' },
  'first aid kit': { zh: '急救包', syl: 'first aid kit' },
  medicine: { zh: '藥品', syl: 'med·i·cine' },
  'ID card': { zh: '證件', syl: 'I·D card' },
  cash: { zh: '現金', syl: 'cash' },
  jacket: { zh: '外套', syl: 'jack·et' },
  'emergency blanket': { zh: '急救毯', syl: 'e·mer·gen·cy blan·ket' },
  mask: { zh: '口罩', syl: 'mask' },
  tourniquet: { zh: '止血帶', syl: 'tour·ni·quet' },
  marker: { zh: '麥克筆', syl: 'mark·er' },
  'fire extinguisher': { zh: '滅火器', syl: 'fire ex·tin·guish·er' },
  'go bag': { zh: '防災包', syl: 'go bag' },
  'meeting point': { zh: '集結點', syl: 'meet·ing point' },
  earthquake: { zh: '地震', syl: 'earth·quake' },
  drop: { zh: '趴下', syl: 'drop' },
  cover: { zh: '掩護', syl: 'cov·er' },
  'hold on': { zh: '穩住', syl: 'hold on' },
  stairs: { zh: '樓梯', syl: 'stairs' },
  siren: { zh: '警報', syl: 'si·ren' },
  shelter: { zh: '避難處所', syl: 'shel·ter' },
  bleeding: { zh: '流血', syl: 'bleed·ing' },
  tighten: { zh: '拉緊', syl: 'tight·en' },
  twist: { zh: '轉動', syl: 'twist' },
  lock: { zh: '固定', syl: 'lock' },
  help: { zh: '幫忙、求救', syl: 'help' },
};

// 防災包物品：need 為必備，opt 為建議加帶，decoy 為干擾物品（選了不扣分，檢查時再討論）
window.ITEMS = [
  { id: 'water', name: '飲用水', word: 'water', need: true, use: '停水或避難時喝，至少準備 3 天份。', icon: '<path d="M10 3h4v3l2 3v12H8V9l2-3z"/><path d="M8 13h8"/>' },
  { id: 'food', name: '乾糧', word: 'food', need: true, use: '不用煮、不易壞的食物，例如餅乾、罐頭。', icon: '<rect x="6" y="5" width="12" height="15" rx="2"/><path d="M6 9h12M6 16h12"/>' },
  { id: 'flashlight', name: '手電筒', word: 'flashlight', need: true, use: '停電或晚上照明，比蠟燭安全。', icon: '<path d="M3 9h10l4-3v12l-4-3H3z"/><path d="M19 9l2-1M19 15l2 1M19 12h2"/>' },
  { id: 'battery', name: '備用電池', word: 'battery', need: true, use: '手電筒和收音機的電力。', icon: '<rect x="3" y="7" width="16" height="10" rx="1"/><rect x="19" y="10" width="2" height="4"/><path d="M7 12h4M9 10v4"/>' },
  { id: 'radio', name: '收音機', word: 'radio', need: true, use: '停電、網路斷線時，收聽官方消息。', icon: '<rect x="3" y="9" width="18" height="11" rx="2"/><path d="M7 9l10-5"/><circle cx="15" cy="14.5" r="2.5"/><path d="M6 13h4M6 16h4"/>' },
  { id: 'whistle', name: '哨子', word: 'whistle', need: true, use: '受困時吹哨求救，比大喊省力、傳得遠。', icon: '<circle cx="9" cy="14" r="5"/><path d="M12 10h9v4h-5"/>' },
  { id: 'firstaid', name: '急救包', word: 'first aid kit', need: true, use: '紗布、繃帶、手套、消毒用品，處理傷口。', icon: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5h6v2M12 10v7M8.5 13.5h7"/>' },
  { id: 'medicine', name: '個人藥品', word: 'medicine', need: true, use: '家人每天要吃的藥，至少帶幾天份。', icon: '<rect x="3" y="9" width="18" height="7" rx="3.5" transform="rotate(-30 12 12.5)"/><path d="M10.5 8.5l3 7"/>' },
  { id: 'idcopy', name: '證件影本', word: 'ID card', need: true, use: '身分證、健保卡影本，證明身分、就醫用。', icon: '<rect x="3" y="6" width="18" height="13" rx="2"/><circle cx="8.5" cy="12" r="2"/><path d="M13 10h5M13 14h4"/>' },
  { id: 'jacket', name: '保暖衣物', word: 'jacket', need: true, use: '外套、雨衣，避免淋雨或失溫。', icon: '<path d="M8 3l4 3 4-3 5 4-3 3v11H6V10L3 7z"/><path d="M12 6v15"/>' },
  { id: 'tourniquet', name: '止血帶', word: 'tourniquet', opt: true, use: '手或腳大量出血、壓不住時使用。', icon: '<rect x="3" y="9" width="18" height="6" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/>' },
  { id: 'marker', name: '麥克筆', word: 'marker', opt: true, use: '記下綁止血帶的時間、留字條。', icon: '<path d="M4 20l3-1 11-11-2-2L5 17z"/><path d="M14 6l4 4"/>' },
  { id: 'powerbank', name: '行動電源', word: 'power bank', opt: true, use: '幫手機充電，才能聯絡家人。', icon: '<rect x="6" y="3" width="12" height="18" rx="2"/><path d="M13 7l-3 5h4l-3 5"/>' },
  { id: 'cash', name: '現金', word: 'cash', opt: true, use: '停電時無法刷卡，準備一些零錢和小鈔。', icon: '<rect x="2" y="7" width="20" height="11" rx="1"/><circle cx="12" cy="12.5" r="2.5"/>' },
  { id: 'blanket', name: '急救毯', word: 'emergency blanket', opt: true, use: '很輕，可以保暖、避免失溫。', icon: '<path d="M4 6h16v12H4z"/><path d="M4 6l16 12M20 6L4 18"/>' },
  { id: 'mask', name: '口罩', word: 'mask', opt: true, use: '避免吸入灰塵、煙霧。', icon: '<path d="M4 9c3-2 13-2 16 0v4c0 3-4 5-8 5s-8-2-8-5z"/><path d="M4 10H2M20 10h2M8 12h8"/>' },
  { id: 'console', name: '遊戲機', decoy: true, use: '好玩，但停電時沒辦法充電，也不能救命。', icon: '<rect x="2" y="7" width="20" height="10" rx="4"/><path d="M7 10v4M5 12h4"/><circle cx="16" cy="11" r="1"/><circle cx="18" cy="13" r="1"/>' },
  { id: 'snack', name: '洋芋片', decoy: true, use: '好吃但佔空間，乾糧比較耐放、比較有飽足感。', icon: '<path d="M6 3h12l-2 4v14H8V7z"/><path d="M10 12h4"/>' },
  { id: 'comics', name: '一大疊漫畫', decoy: true, use: '很重又佔空間，防災包要留給救命的東西。', icon: '<path d="M4 4h7v16H4zM13 4h7v16h-7z"/>' },
];

window.SLOTS = 12;

/*
 站點：kind 為 prep（平日整備）或 drill（演習）；gobag 站使用專屬的整備畫面。
 步驟類型：
 choice   單選；options[].ok 為正確，fb 為回饋
 multi    複選後確認；全部正確才過
 sequence 依序點選；order 為正確順序，decoys 為干擾
 item     從防災包拿出物品；need 為物品 id，alt 為沒帶時的替代做法
 hold     按住按鈕持續動作
 hunt     在畫面上找出所有需要注意的地方
 map      在畫面上點選位置；zones 的 ok 為正確
*/
window.MISSIONS = [
  {
    id: 'p1', kind: 'prep', code: 'PREP-01', name: '居家安全檢查', badge: '安全偵察員', scene: 'room', words: ['fire extinguisher'],
    icon: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><circle cx="12" cy="14" r="3"/><path d="M14.2 16.2L17 19"/>',
    brief: '災難發生前，家就是你的基地。先巡一遍家裡，找出地震時可能傷人、或擋住逃生的地方。',
    flow: ['巡視家裡', '找出危險的地方', '想好怎麼改善', '確認開關與滅火器位置'],
    parent: { learn: '居家防災：固定高櫃、重物放低、床邊安全、保持逃生路線暢通、知道瓦斯開關與滅火器位置。', ask: '「如果現在地震，房間裡哪個東西最可能倒下來？」', hint: '看看高的、重的、玻璃做的東西放在哪裡。', real: '帶孩子實際巡一次家裡，一起把一個高櫃固定好，並找出瓦斯總開關和滅火器。' },
    steps: [
      { type: 'hunt', radio: '隊員，開始巡視基地。地震時哪些地方會有危險？', prompt: '在畫面上找出 6 個需要注意的地方',
        spots: [
          { x: 28, y: 45, w: 64, h: 145, t: '高書櫃沒有固定', fix: '用 L 型鐵件把高櫃固定在牆上，地震時才不會倒下。' },
          { x: 34, y: 18, w: 52, h: 26, t: '重物放在櫃子頂端', fix: '重的東西放低處，避免地震時掉下來砸到人。' },
          { x: 168, y: 52, w: 64, h: 50, t: '床頭上方掛玻璃相框', fix: '床頭上方不掛重物或玻璃，睡覺時才安全。' },
          { x: 300, y: 150, w: 54, h: 44, t: '門口堆滿雜物', fix: '門口和走道是逃生路線，要保持暢通。' },
          { x: 258, y: 92, w: 36, h: 36, t: '瓦斯總開關', fix: '全家都要知道瓦斯總開關的位置；聞到瓦斯味時，由大人關閉。' },
          { x: 100, y: 142, w: 28, h: 50, t: '滅火器', fix: '知道滅火器放在哪裡，定期看壓力錶指針在綠色區。' },
        ],
        safe: [{ x: 150, y: 194, w: 110, h: 16, fb: '地毯沒問題，還可以防滑。' }] },
      { type: 'multi', radio: '巡視完畢。平常就可以先做哪些準備？', prompt: '選出平日就能做的居家防災（可以選很多個）',
        options: [
          { t: '把高櫃固定在牆上', ok: true }, { t: '重物放在低處', ok: true }, { t: '保持門口和走道暢通', ok: true },
          { t: '準備好防災包', ok: true }, { t: '和家人約好集結點', ok: true },
          { t: '等地震來了再處理', fb: '地震只有幾秒鐘，來不及處理，要平常就先準備。' },
        ] },
    ],
    keyPoints: ['高櫃要固定，重物放低處', '床頭上方不掛玻璃或重物', '門口走道保持暢通，知道瓦斯開關和滅火器在哪裡'],
    myth: { game: '基地被打壞了，重開一局就好', real: '家只有一個，要平常就把危險的地方改善好' },
  },
  {
    id: 'p2', kind: 'prep', gobag: true, code: 'PREP-02', name: '防災包整備', badge: '整備官', words: ['go bag'],
    icon: '<path d="M8 6V4h8v2"/><rect x="4" y="6" width="16" height="15" rx="3"/><path d="M8 13h8M12 10v6"/>',
    brief: '大災難發生時，可能要馬上離開家。防災包要平常就準備好，放在門口附近，拿了就能走。',
    flow: ['挑選物品', '放進背包（12 格）', '檢查必備物品', '放在門口附近'],
    parent: { learn: '防災包的必備物品，以及為什麼需要它們；平時放在容易拿的地方，定期檢查期限。', ask: '「如果只能帶一個背包離開家，你會放什麼？為什麼？」', hint: '想想停電、停水、受傷、和家人失聯時各需要什麼。', real: '一起檢查家裡的防災包：水和食物有沒有過期、電池有沒有電、藥品夠不夠。' },
    keyPoints: ['防災包要有水、乾糧、手電筒、電池、收音機、哨子', '急救包、個人藥品、證件影本、保暖衣物也要帶', '防災包放在門口附近，定期檢查期限'],
    myth: { game: '背包裡的東西隨時都有、用不完', real: '東西要平常就準備好，也要定期換掉過期的' },
  },
  {
    id: 'p3', kind: 'prep', code: 'PREP-03', name: '家庭集結點', badge: '集結指揮官', scene: 'town', words: ['meeting point'],
    icon: '<path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    brief: '大災難時，家人可能在不同地方，電話也可能打不通。平常就要約好在哪裡會合。',
    flow: ['選第一集結點（家附近）', '選第二集結點（較遠）', '約好聯絡方式', '走散時到集結點等'],
    parent: { learn: '家庭集結點：近的第一集結點、遠的第二集結點、外地聯絡人、走散時留在集結點等待。', ask: '「如果地震時你在學校、我在公司，我們要在哪裡見面？」', hint: '集結點要空曠、不會有東西掉下來，而且全家都知道怎麼走。', real: '週末全家實際走一次到集結點的路線，並約好一位外地親友當聯絡人。' },
    steps: [
      { type: 'map', radio: '先選第一集結點：離家近、全家都能走到的地方。', prompt: '在地圖上點選最適合的第一集結點',
        zones: [
          { id: 'park', label: '社區公園', x: 236, y: 18, w: 116, h: 70, ok: true, fb: '對！空曠、離家近，上方沒有東西會掉下來。' },
          { id: 'arcade', label: '騎樓下', x: 118, y: 134, w: 92, h: 32, fb: '騎樓上方可能有招牌、磁磚掉落，地震後很危險。' },
          { id: 'gas', label: '加油站', x: 236, y: 140, w: 62, h: 42, fb: '加油站可能有起火風險，不適合集合。' },
          { id: 'school', label: '學校操場', x: 318, y: 146, w: 76, h: 66, fb: '學校比較遠，適合當「第二」集結點。' },
        ] },
      { type: 'map', radio: '如果家附近都不能去（例如道路封閉），要有較遠的第二集結點。', prompt: '在地圖上點選第二集結點',
        zones: [
          { id: 'park', label: '社區公園', x: 236, y: 18, w: 116, h: 70, fb: '公園是第一集結點；第二集結點要選較遠、但大家都熟悉的地方。' },
          { id: 'arcade', label: '騎樓下', x: 118, y: 134, w: 92, h: 32, fb: '騎樓上方可能有東西掉落，不適合集合。' },
          { id: 'gas', label: '加油站', x: 236, y: 140, w: 62, h: 42, fb: '加油站可能有起火風險，不適合集合。' },
          { id: 'school', label: '學校操場', x: 318, y: 146, w: 76, h: 66, ok: true, fb: '對！操場空曠，而且全家都認得路。' },
        ] },
      { type: 'choice', radio: '災難時電話常常打不通。', prompt: '怎麼和家人聯絡比較好？',
        options: [
          { t: '約好一位外地親友當聯絡人；電話打不通就傳簡訊，或用 1991 報平安專線留言', ok: true, fb: '對！災區電話容易塞住，簡訊和留言比較容易傳出去。' },
          { t: '一直重打電話，直到接通為止', fb: '一直打會讓線路更塞，也很耗手機電量。' },
        ] },
      { type: 'choice', radio: '你到了集結點，家人還沒到。', prompt: '該怎麼做？',
        options: [
          { t: '留在集結點等，不要自己離開去找', ok: true, fb: '對！大家都往集結點走，留在原地最容易會合。' },
          { t: '自己走回家找家人', fb: '路上可能有危險，也容易錯過。要留在集結點等。' },
        ] },
    ],
    keyPoints: ['第一集結點：家附近的空曠處', '第二集結點：較遠、全家都認得的地方', '電話打不通傳簡訊或用 1991 留言；到了集結點就留下來等'],
    myth: { game: '隊友的位置會顯示在地圖上', real: '現實中找不到家人，要靠平常約好的集結點' },
  },
  {
    id: 'm1', kind: 'drill', code: 'DRILL-01', name: '地震防護因應', badge: '穩如磐石', scene: 'quake', words: ['earthquake', 'drop', 'cover', 'hold on', 'stairs'],
    icon: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M12 9l-2 4 3 2-2 4"/>',
    brief: '演習情境：你在客廳寫功課，突然發生大地震，地面劇烈搖晃，櫃子上的東西開始掉下來！',
    flow: ['趴下、掩護、穩住', '搖完先穿鞋', '注意瓦斯', '帶防災包走樓梯', '到集結點會合'],
    parent: { learn: '地震時「趴下、掩護、穩住」；搖完後穿鞋、注意瓦斯、帶防災包走樓梯、到集結點。', ask: '「我們家哪一張桌子最堅固，可以躲在下面？」', hint: '想想看，地震時最容易受傷的原因是什麼？（東西掉下來砸到）', real: '在家實際演練一次：喊「地震！」後全家趴下、躲桌下，接著帶防災包走到集結點。' },
    steps: [
      { type: 'sequence', radio: '地震！照正確順序保護自己！', prompt: '依照順序點選三個動作',
        order: ['趴下 Drop', '掩護 Cover：躲到堅固桌子下，保護頭和脖子', '穩住 Hold on：抓住桌腳，跟著桌子移動'],
        decoys: [{ t: '馬上衝出門外', fb: '搖晃時跑動最容易跌倒或被掉落物砸到。' }, { t: '跑到窗邊看外面', fb: '窗戶玻璃可能破裂，要遠離窗戶。' }] },
      { type: 'choice', radio: '如果身邊沒有桌子呢？', prompt: '選出最好的做法',
        options: [
          { t: '趴低，用手臂護住頭和脖子，遠離窗戶和會倒的櫃子', ok: true, fb: '對！保護頭頸是最重要的。' },
          { t: '站在大櫃子旁邊扶著', fb: '櫃子可能倒下來壓到人。' },
        ] },
      { type: 'choice', radio: '搖晃停了。地上有掉落的東西和碎玻璃。', prompt: '第一件事做什麼？',
        options: [
          { t: '先穿上鞋子，再小心走動', ok: true, fb: '對！地上可能有碎玻璃，光腳很容易受傷。' },
          { t: '光腳衝出去', fb: '碎玻璃會割傷腳，先穿鞋。' },
        ] },
      { type: 'choice', radio: '你聞到一股瓦斯味。', prompt: '該怎麼做？',
        options: [
          { t: '不開燈、不點火，告訴大人關瓦斯，打開門窗', ok: true, fb: '對！開關電燈可能產生火花。' },
          { t: '打開電燈看清楚哪裡漏氣', fb: '開關可能產生火花，聞到瓦斯味不要碰電器開關。' },
        ] },
      { type: 'choice', radio: '大人決定要離開家。', prompt: '怎麼離開？',
        options: [
          { t: '拿起門口的防災包，走樓梯離開', ok: true, fb: '對！平常放在門口的防災包，現在派上用場。' },
          { t: '搭電梯比較快', fb: '地震後電梯可能故障，把人困在裡面，要走樓梯。' },
          { t: '先回房間拿玩具', fb: '餘震可能隨時發生，帶防災包就走，不回頭拿東西。' },
        ] },
      { type: 'choice', radio: '到了外面，你和家人在人群中走散了。', prompt: '該去哪裡？',
        options: [
          { t: '到全家約好的集結點，留在那裡等', ok: true, fb: '對！這就是平常約好集結點的原因。' },
          { t: '站在騎樓下等', fb: '餘震時騎樓上方可能有東西掉落。' },
          { t: '自己到處找', fb: '到處走容易錯過，也可能遇到危險。' },
        ] },
    ],
    keyPoints: ['地震時：趴下、掩護、穩住', '搖完先穿鞋；聞到瓦斯味不開燈、不點火', '帶防災包走樓梯，到集結點會合'],
    myth: { game: '看到危險可以衝過去', real: '搖晃時亂跑最容易被東西砸到，要原地保護頭頸' },
  },
  {
    id: 'm2', kind: 'drill', code: 'DRILL-02', name: '戰時受傷止血', badge: '止血專家', scene: 'raid', words: ['siren', 'shelter', 'bleeding', 'tourniquet', 'tighten', 'twist', 'lock'], bleed: true,
    icon: '<path d="M8 2v20M16 2v20"/><rect x="5" y="9" width="14" height="4" rx="1"/><path d="M12 5v12"/>',
    brief: '演習情境：防空警報響起，你和家人前往避難處所途中，家人的大腿被掉落的碎片劃傷，血一直湧出來，用力壓也壓不住。戰時救護車可能無法馬上趕到。',
    note: '真實情況中，止血帶需要很大的力氣，通常由大人操作，你的任務是協助大人。這個演習練習的是步驟。',
    flow: ['先到安全的地方', '判斷：壓不住才用', '綁在傷口上方', '轉絞棒到不流血', '固定、寫時間', '不鬆開，通報救護'],
    parent: { learn: '戰時受傷：先移到安全處；壓不住才用止血帶；綁在傷口上方、避開關節；轉到不流血、固定、寫時間、不自己鬆開。', ask: '「為什麼止血帶不能綁在膝蓋上？」', hint: '關節的地方有骨頭擋住，綁得緊嗎？', real: '確認家裡防災包有沒有止血帶；請大人用訓練用止血帶示範一次，並建議全家參加實體急救課程。' },
    steps: [
      { type: 'choice', radio: '家人受傷了，但周圍還有東西在掉落。', prompt: '第一件事做什麼？', scene: 'raid',
        options: [
          { t: '先和家人移到有遮蔽的安全地方（例如避難處所）再處理', ok: true, fb: '對！先確保安全，救人的人也受傷就沒人能救了。' },
          { t: '原地停下來處理傷口', fb: '周圍還有危險，要先移到安全的地方。' },
        ] },
      { type: 'choice', radio: '到了避難處所，傷口還在大量出血。', prompt: '什麼時候要用止血帶？', scene: 'leg',
        options: [
          { t: '手或腳大量出血，用力加壓也止不住', ok: true, fb: '對！止血帶是壓不住時才用的。' },
          { t: '膝蓋擦傷流一點血', fb: '小傷口直接加壓、包紮就可以。' },
          { t: '肚子受傷流血', fb: '止血帶只能用在手和腳。' },
        ] },
      { type: 'item', need: 'tourniquet', radio: '壓不住了，需要止血帶！', prompt: '從防災包拿出止血帶', scene: 'leg',
        alt: '防災包裡沒有止血帶：繼續用雙手全力壓住傷口，並請大人向避難處所的人求助。這次有人遞來一條，我們繼續練習。' },
      { type: 'map', map: 'leg', radio: '要綁在哪裡？', prompt: '點選腿上綁止血帶的位置',
        zones: [
          { id: 'A', label: 'A', x: 110, y: 50, w: 50, h: 100, ok: true, fb: '對！傷口上方約 5 到 8 公分，避開關節。不確定位置時，就綁「高且緊」：盡量靠近身體那一側。' },
          { id: 'B', label: 'B', x: 170, y: 50, w: 40, h: 100, fb: '直接綁在傷口上壓不住血流，要綁在傷口「上方」。' },
          { id: 'C', label: 'C', x: 220, y: 50, w: 45, h: 100, fb: '血是從靠近身體（心臟）那一側流過來的，綁在傷口下方擋不住。' },
          { id: 'D', label: 'D', x: 280, y: 50, w: 42, h: 100, fb: '膝蓋是關節，有骨頭擋住綁不緊，要避開關節。' },
        ] },
      { type: 'hold', radio: '拉緊帶子，轉動絞棒！', prompt: '按住按鈕轉動絞棒，直到不再流血', label: '按住：轉動絞棒', verb: 'twist', scene: 'leg',
        after: '會很痛，這是正常的。可以對他說：「我知道很痛，這樣才能止血。」' },
      { type: 'choice', radio: '不流血了！', prompt: '接下來呢？', scene: 'leg',
        options: [
          { t: '把絞棒卡進固定夾，讓它不會鬆開', ok: true, fb: '對！固定好才不會鬆掉。' },
          { t: '放手讓它自己停著', fb: '絞棒會轉回去，止血帶就鬆了。' },
        ] },
      { type: 'item', need: 'marker', radio: '記下綁上止血帶的時間！', prompt: '從防災包拿出可以寫時間的物品', time: true, scene: 'leg',
        alt: '沒帶麥克筆，用手機記下時間，並告訴大人和救護人員。' },
      { type: 'choice', radio: '他說很痛，想把止血帶鬆開。', prompt: '可以鬆開嗎？', scene: 'leg',
        options: [
          { t: '不行，不要自己鬆開；請大人通報救護人員，並告訴他們綁上的時間', ok: true, fb: '對！鬆開會再次大量出血，要交給救護人員處理。' },
          { t: '鬆開一下讓他休息', fb: '鬆開會再次大量出血，要等救護人員。' },
        ] },
    ],
    keyPoints: ['先移到安全的地方再處理傷口', '壓不住才用止血帶，綁在傷口上方、避開關節', '轉到不流血、固定、寫時間、不自己鬆開'],
    myth: { game: '打一針急救針就回血', real: '沒有急救針，只能壓住傷口、用止血帶，然後等救護人員' },
  },
];

window.REFLECT = ['這次你做對了什麼？', '哪一步要再想想？', '如果在真實的家裡發生，你會怎麼做？'];
