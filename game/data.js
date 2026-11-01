// 家園救援任務：固定的裝備、單字與任務資料（草案，急救與防災步驟待官方資料核對）

window.WORDS = {
  tourniquet: { zh: '止血帶', syl: 'tour·ni·quet' },
  gauze: { zh: '紗布', syl: 'gauze' },
  gloves: { zh: '手套', syl: 'gloves' },
  bandage: { zh: '繃帶', syl: 'band·age' },
  flashlight: { zh: '手電筒', syl: 'flash·light' },
  battery: { zh: '電池', syl: 'bat·ter·y' },
  whistle: { zh: '哨子', syl: 'whis·tle' },
  water: { zh: '水', syl: 'wa·ter' },
  marker: { zh: '麥克筆', syl: 'mark·er' },
  'emergency blanket': { zh: '急救毯', syl: 'e·mer·gen·cy blan·ket' },
  earthquake: { zh: '地震', syl: 'earth·quake' },
  drop: { zh: '趴下', syl: 'drop' },
  cover: { zh: '掩護', syl: 'cov·er' },
  'hold on': { zh: '穩住', syl: 'hold on' },
  siren: { zh: '警報', syl: 'si·ren' },
  shelter: { zh: '避難處所', syl: 'shel·ter' },
  safe: { zh: '安全的', syl: 'safe' },
  help: { zh: '幫忙、求救', syl: 'help' },
  call: { zh: '打電話', syl: 'call' },
  press: { zh: '按壓', syl: 'press' },
  tighten: { zh: '拉緊', syl: 'tight·en' },
  twist: { zh: '轉動', syl: 'twist' },
  lock: { zh: '固定', syl: 'lock' },
  bleeding: { zh: '流血', syl: 'bleed·ing' },
  wound: { zh: '傷口', syl: 'wound' },
};

// 裝備：icon 為 24x24 線條圖；decoy 為干擾物品（選了不扣分，覆盤時再討論）
window.ITEMS = [
  { id: 'tourniquet', name: '止血帶', word: 'tourniquet', use: '手或腳大量出血、壓不住時使用。',
    icon: '<rect x="3" y="9" width="18" height="6" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/>' },
  { id: 'gauze', name: '紗布', word: 'gauze', use: '直接壓住傷口止血，或覆蓋傷口。',
    icon: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 10h16M4 14h16M10 4v16M14 4v16"/>' },
  { id: 'gloves', name: '手套', word: 'gloves', use: '保護自己，不直接碰到別人的血。',
    icon: '<path d="M7 21v-7l-2-3 1-1 3 3V5a1 1 0 0 1 2 0v6V4a1 1 0 0 1 2 0v7V5a1 1 0 0 1 2 0v7V7a1 1 0 0 1 2 0v9a5 5 0 0 1-5 5z"/>' },
  { id: 'bandage', name: '繃帶', word: 'bandage', use: '把紗布固定在傷口上。',
    icon: '<circle cx="9" cy="12" r="6"/><circle cx="9" cy="12" r="2"/><path d="M9 6h11v6"/>' },
  { id: 'flashlight', name: '手電筒', word: 'flashlight', use: '停電或晚上時照明。',
    icon: '<path d="M3 9h10l4-3v12l-4-3H3z"/><path d="M19 9l2-1M19 15l2 1M19 12h2"/>' },
  { id: 'battery', name: '電池', word: 'battery', use: '手電筒和收音機的備用電力。',
    icon: '<rect x="3" y="7" width="16" height="10" rx="1"/><rect x="19" y="10" width="2" height="4"/><path d="M7 12h4M9 10v4"/>' },
  { id: 'whistle', name: '哨子', word: 'whistle', use: '受困時吹哨求救，比大喊省力、傳得遠。',
    icon: '<circle cx="9" cy="14" r="5"/><path d="M12 10h9v4h-5"/>' },
  { id: 'water', name: '飲用水', word: 'water', use: '停水或避難時喝的水。',
    icon: '<path d="M10 3h4v3l2 3v12H8V9l2-3z"/><path d="M8 13h8"/>' },
  { id: 'marker', name: '麥克筆', word: 'marker', use: '記下綁止血帶的時間。',
    icon: '<path d="M4 20l3-1 11-11-2-2L5 17z"/><path d="M14 6l4 4"/>' },
  { id: 'blanket', name: '急救毯', word: 'emergency blanket', use: '保暖，避免受傷的人失溫。',
    icon: '<path d="M4 6h16v12H4z"/><path d="M4 6l16 12M20 6L4 18"/>' },
  { id: 'console', name: '遊戲機', word: null, decoy: true, use: '好玩，但停電時沒辦法充電。',
    icon: '<rect x="2" y="7" width="20" height="10" rx="4"/><path d="M7 10v4M5 12h4"/><circle cx="16" cy="11" r="1"/><circle cx="18" cy="13" r="1"/>' },
  { id: 'snack', name: '零食', word: null, decoy: true, use: '好吃，但不是救命用品。',
    icon: '<path d="M6 3h12l-2 4v14H8V7z"/><path d="M10 12h4"/>' },
];

window.SLOTS = 6;

/*
 步驟類型：
 choice   單選；options[].ok 為正確，fb 為回饋
 multi    複選後確認；全部正確才過
 sequence 依序點選；order 為正確順序，decoys 為干擾
 item     從背包拿出裝備；need 為裝備 id，alt 為沒帶時的替代做法
 hold     按住按鈕持續動作；label 為按鈕文字
 target   點選止血帶位置（腿部圖）
*/
window.MISSIONS = [
  {
    id: 'm1', code: 'OP-01', name: '基地整備', badge: '整備官', scene: 'pack', words: ['water', 'flashlight', 'battery', 'whistle'],
    brief: '颱風要來了，可能會停電、停水。隊長請你檢查家裡的避難包，確保全家準備好。',
    parent: { learn: '居家韌性：平常準備避難包、約好集合點。', ask: '「如果現在停電，你知道手電筒放在哪裡嗎？」', hint: '先想想停電、沒有水的時候，最需要什麼。', real: '今晚一起打開家裡的避難包檢查，並約好家人走散時的集合點。' },
    steps: [
      { type: 'multi', radio: '隊員，先把避難包裝好。哪些東西應該放進去？', prompt: '選出應該放進避難包的東西（可以選很多個）',
        options: [
          { t: '飲用水', ok: true }, { t: '手電筒', ok: true }, { t: '備用電池', ok: true }, { t: '哨子', ok: true }, { t: '急救用品', ok: true },
          { t: '遊戲機', fb: '停電時沒辦法充電，也不能救命。' }, { t: '一大疊漫畫', fb: '很重又佔空間，避難包要留給救命的東西。' },
        ] },
      { type: 'item', need: 'flashlight', radio: '停電了！四周一片黑。', prompt: '從背包拿出可以照明的裝備',
        alt: '沒帶手電筒，先用手機的手電筒，但要省著用，手機還要拿來打電話。' },
      { type: 'choice', radio: '如果家人在混亂中走散了，該怎麼辦？', prompt: '選出最好的做法',
        options: [
          { t: '到全家事先約好的集合點', ok: true, fb: '對！事先約好地點，大家就知道去哪裡找彼此。' },
          { t: '自己到處跑去找', fb: '到處跑容易錯過，也可能遇到危險。' },
          { t: '躲起來不出聲', fb: '這樣別人找不到你。要去約好的集合點。' },
        ] },
      { type: 'item', need: 'whistle', radio: '假設你被困在房間裡，要讓救援人員知道你在這裡。', prompt: '從背包拿出求救用的裝備',
        alt: '沒帶哨子，可以用硬物敲打水管或牆壁，規律地敲，比一直大喊省力。' },
    ],
    keyPoints: ['避難包要放水、手電筒、電池、哨子、急救用品', '全家要約好走散時的集合點', '受困時吹哨子求救，比大喊省力'],
    myth: { game: '背包裡的東西隨時都有', real: '平常就要準備避難包，事情發生時才拿得到' },
  },
  {
    id: 'm2', code: 'OP-02', name: '地震應變', badge: '穩如磐石', scene: 'quake', words: ['earthquake', 'drop', 'cover', 'hold on'],
    brief: '你在客廳寫功課，地面突然劇烈搖晃，櫃子上的東西開始掉下來！',
    parent: { learn: '地震時「趴下、掩護、穩住」，搖完先穿鞋、注意瓦斯。', ask: '「我們家哪一張桌子最堅固，可以躲在下面？」', hint: '想想看，地震時最容易受傷的原因是什麼？（東西掉下來砸到）', real: '一起在家裡找出可以躲的堅固桌子，並把高處的重物移到低處。' },
    steps: [
      { type: 'sequence', radio: '地震！照正確順序保護自己！', prompt: '依照順序點選三個動作',
        order: ['趴下 Drop', '掩護 Cover：躲到堅固桌子下，保護頭和脖子', '穩住 Hold on：抓住桌腳，跟著桌子移動'],
        decoys: [{ t: '馬上衝出門外', fb: '搖晃時跑動最容易跌倒或被掉落物砸到。' }, { t: '跑到窗邊看外面', fb: '窗戶玻璃可能破裂，要遠離窗戶。' }] },
      { type: 'choice', radio: '如果身邊沒有桌子呢？', prompt: '選出最好的做法',
        options: [
          { t: '趴低，用手臂護住頭和脖子，遠離窗戶和會倒的櫃子', ok: true, fb: '對！保護頭頸是最重要的。' },
          { t: '搭電梯下樓', fb: '地震時電梯可能停住，把人困在裡面，不要搭。' },
          { t: '站在大櫃子旁邊扶著', fb: '櫃子可能倒下來壓到人。' },
        ] },
      { type: 'choice', radio: '搖晃停了。地上有掉落的東西和碎玻璃。', prompt: '第一件事做什麼？',
        options: [
          { t: '先穿上鞋子，再小心走動', ok: true, fb: '對！地上可能有碎玻璃，光腳很容易受傷。' },
          { t: '光腳衝出去', fb: '碎玻璃會割傷腳，先穿鞋。' },
        ] },
      { type: 'choice', radio: '你聞到一股瓦斯味。', prompt: '該怎麼做？',
        options: [
          { t: '不開燈、不點火，告訴大人，打開門窗後離開', ok: true, fb: '對！開關電燈可能產生火花，引起爆炸。' },
          { t: '打開電燈看清楚哪裡漏氣', fb: '開關可能產生火花，聞到瓦斯味不要碰電器開關。' },
        ] },
    ],
    keyPoints: ['地震時：趴下、掩護、穩住', '搖晃停止後先穿鞋，小心碎玻璃', '聞到瓦斯味不開燈、不點火，開窗離開'],
    myth: { game: '看到危險可以衝過去', real: '搖晃時亂跑最容易被東西砸到，要原地保護頭頸' },
  },
  {
    id: 'm3', code: 'OP-03', name: '防空警報', badge: '避難嚮導', scene: 'siren', words: ['siren', 'shelter'],
    brief: '一陣長長的警報聲響起，廣播說這是防空警報。',
    parent: { learn: '防空警報時就近進入避難處所，遠離窗戶，等官方解除。', ask: '「你知道我們家附近最近的避難處所在哪裡嗎？」', hint: '想想看，哪裡有厚厚的牆和天花板保護？', real: '一起查詢家裡和學校附近的避難處所（例如地下室、地下停車場），實際走一次。' },
    steps: [
      { type: 'choice', radio: '警報響了！', prompt: '第一個行動是什麼？',
        options: [
          { t: '跟著大人，到最近的避難處所（例如地下室）', ok: true, fb: '對！地下空間有厚重的結構保護。' },
          { t: '跑到頂樓看發生什麼事', fb: '頂樓最沒有遮蔽，非常危險。' },
          { t: '繼續做自己的事', fb: '聽到警報要立刻行動。' },
        ] },
      { type: 'choice', radio: '來不及到地下室，你還在家裡。', prompt: '在室內要怎麼保護自己？',
        options: [
          { t: '遠離窗戶，到屋子最裡面的空間，趴低保護頭部', ok: true, fb: '對！離窗戶越遠越安全。' },
          { t: '站在窗邊觀察外面', fb: '窗戶玻璃可能被震破，要遠離。' },
        ] },
      { type: 'choice', radio: '外面安靜下來了。', prompt: '什麼時候可以離開避難處所？',
        options: [
          { t: '聽廣播或官方通知，宣布解除後才離開', ok: true, fb: '對！安靜不代表安全，要等官方通知。' },
          { t: '聲音停了就可以出去', fb: '安靜不代表安全，要等官方解除通知。' },
        ] },
      { type: 'multi', radio: '平常就可以先準備。', prompt: '選出平常可以先做的事（可以選很多個）',
        options: [
          { t: '查好家附近的避難處所', ok: true }, { t: '準備好避難包', ok: true }, { t: '和家人練習一次怎麼走', ok: true },
          { t: '什麼都不用準備', fb: '平常準備好，發生時才不會慌。' },
        ] },
    ],
    keyPoints: ['警報響起，到最近的避難處所', '在室內要遠離窗戶、保護頭部', '等官方宣布解除才離開'],
    myth: { game: '地圖上會標出安全區', real: '要平常就查好家附近的避難處所，實際走一次' },
  },
  {
    id: 'm4', code: 'OP-04', name: '現場評估', badge: '安全偵察員', scene: 'kitchen', words: ['safe', 'help', 'call'],
    brief: '家人在廚房打破玻璃杯，手被割傷，地上都是碎玻璃。',
    parent: { learn: '先確認自己安全，再呼叫大人、撥 119 並說清楚。', ask: '「為什麼要先看地上有沒有玻璃，才能過去幫忙？」', hint: '如果救人的人也受傷了，會發生什麼事？', real: '一起練習說出家裡的完整地址，貼在電話旁邊。' },
    steps: [
      { type: 'choice', radio: '你聽到玻璃破掉的聲音，跑到廚房門口。', prompt: '第一步做什麼？',
        options: [
          { t: '先停下來看環境：地上有碎玻璃，穿上拖鞋再靠近', ok: true, fb: '對！先確認自己安全，才能幫助別人。' },
          { t: '光腳衝過去幫忙', fb: '你也會被割傷，就沒有人能幫忙了。先看環境。' },
        ] },
      { type: 'choice', radio: '傷口很深，血流得很多。', prompt: '接下來呢？',
        options: [
          { t: '大聲叫其他大人來，並撥打 119', ok: true, fb: '對！嚴重受傷要立刻求救。' },
          { t: '先上網查怎麼辦', fb: '查資料會浪費時間，先求救。' },
        ] },
      { type: 'multi', radio: '119 接通了。', prompt: '選出要告訴 119 的資訊（可以選很多個）',
        options: [
          { t: '完整地址', ok: true }, { t: '發生什麼事', ok: true }, { t: '受傷的人現在的狀況', ok: true }, { t: '你的電話號碼', ok: true },
          { t: '你最喜歡的遊戲', fb: '這不是救援需要的資訊。' },
        ] },
      { type: 'choice', radio: '你說完了。', prompt: '什麼時候掛電話？',
        options: [
          { t: '等對方說可以掛了再掛', ok: true, fb: '對！對方可能還要問問題，或教你怎麼做。' },
          { t: '說完就馬上掛', fb: '對方可能還有問題要問，等對方說可以再掛。' },
        ] },
    ],
    keyPoints: ['先確認自己安全，再靠近幫忙', '大聲叫大人，並撥打 119', '說清楚地址和發生什麼事，等對方先掛'],
    myth: { game: '倒下可以被救起、可以重來', real: '不能重來；救人的人也受傷就沒人能救，先確認安全' },
  },
  {
    id: 'm5', code: 'OP-05', name: '簡易包紮', badge: '包紮能手', scene: 'hand', words: ['gloves', 'gauze', 'press', 'bandage'], bleed: true,
    brief: '家人的手掌被割傷，一直流血。大人在旁邊，請你協助止血。',
    parent: { learn: '戴手套保護自己、直接加壓、紗布濕了再加一層、繃帶不要太緊。', ask: '「為什麼紗布濕了不要拿掉？」', hint: '血慢慢會凝固，拿掉紗布會發生什麼事？', real: '一起打開家裡的急救箱，認識紗布、繃帶、手套放在哪裡。' },
    steps: [
      { type: 'item', need: 'gloves', radio: '先保護自己！', prompt: '從背包拿出保護雙手的裝備',
        alt: '沒帶手套，可以把乾淨的塑膠袋套在手上，不要直接碰到血。' },
      { type: 'item', need: 'gauze', radio: '找東西壓住傷口。', prompt: '從背包拿出可以壓住傷口的裝備',
        alt: '沒帶紗布，用乾淨的布或毛巾代替。' },
      { type: 'hold', radio: '用力壓住傷口，不要放開！', prompt: '按住按鈕，持續加壓直到出血變少', label: '按住：持續加壓', verb: 'press' },
      { type: 'choice', radio: '紗布被血浸濕了。', prompt: '該怎麼做？',
        options: [
          { t: '不要拿掉，在上面再加一層，繼續壓', ok: true, fb: '對！拿掉會把剛形成的血塊扯掉，又開始流血。' },
          { t: '拿掉換一塊新的', fb: '拿掉會把剛形成的血塊扯掉。要在上面再加一層。' },
        ] },
      { type: 'item', need: 'bandage', radio: '出血變少了，把紗布固定好。', prompt: '從背包拿出固定紗布的裝備',
        alt: '沒帶繃帶，用乾淨的布條綁住，或請大人用膠帶固定。' },
      { type: 'choice', radio: '包好了。', prompt: '包完要檢查什麼？',
        options: [
          { t: '看手指的顏色和溫度；發白、發紫或發麻代表太緊', ok: true, fb: '對！太緊會讓血流不過去。' },
          { t: '越緊越好，不用檢查', fb: '太緊會讓血流不過去，要看手指顏色。' },
        ] },
    ],
    keyPoints: ['先戴手套保護自己', '直接加壓；紗布濕了再加一層，不要拿掉', '繃帶不要太緊，看手指的顏色'],
    myth: { game: '奈米機器自動修復傷口', real: '傷口要加壓、包紮，嚴重時要送醫' },
  },
  {
    id: 'm6', code: 'OP-06', name: '止血帶行動', badge: '止血專家', scene: 'leg', words: ['tourniquet', 'tighten', 'twist', 'lock', 'bleeding'], bleed: true,
    brief: '家人的大腿被重物劃傷，血一直湧出來，用力壓也壓不住。大人已經撥了 119。',
    note: '真實情況中，止血帶需要很大的力氣，通常由大人操作，你的任務是協助大人。這關練習的是步驟。',
    parent: { learn: '壓不住才用止血帶；綁在傷口上方、避開關節；轉到不流血、固定、寫時間、不自己鬆開。', ask: '「為什麼不能綁在膝蓋上？」', hint: '關節的地方有骨頭擋住，綁得緊嗎？', real: '如果家裡有止血帶，請大人示範一次；建議全家參加實體急救課程。' },
    steps: [
      { type: 'choice', radio: '先判斷狀況。', prompt: '什麼時候要用止血帶？',
        options: [
          { t: '手或腳大量出血，用力加壓也止不住', ok: true, fb: '對！止血帶是壓不住時才用的。' },
          { t: '膝蓋擦傷流一點血', fb: '小傷口直接加壓、包紮就可以。' },
          { t: '肚子受傷流血', fb: '止血帶只能用在手和腳。' },
        ] },
      { type: 'item', need: 'tourniquet', radio: '壓不住了，需要止血帶！', prompt: '從背包拿出止血帶',
        alt: '沒帶止血帶：繼續用雙手全力壓住傷口，大聲告訴大人需要止血帶。這次隊友送來了一條，我們繼續練習。' },
      { type: 'target', radio: '要綁在哪裡？', prompt: '點選腿上綁止血帶的位置' },
      { type: 'hold', radio: '拉緊帶子，轉動絞棒！', prompt: '按住按鈕轉動絞棒，直到不再流血', label: '按住：轉動絞棒', verb: 'twist',
        after: '會很痛，這是正常的。可以對他說：「我知道很痛，這樣才能止血。」' },
      { type: 'choice', radio: '不流血了！', prompt: '接下來呢？',
        options: [
          { t: '把絞棒卡進固定夾，讓它不會鬆開', ok: true, fb: '對！固定好才不會鬆掉。' },
          { t: '放手讓它自己停著', fb: '絞棒會轉回去，止血帶就鬆了。要卡進固定夾。' },
        ] },
      { type: 'item', need: 'marker', radio: '記下綁上止血帶的時間！', prompt: '從背包拿出可以寫時間的裝備', time: true,
        alt: '沒帶麥克筆，用手機記下時間，並告訴大人和救護人員。' },
      { type: 'choice', radio: '他說很痛，想把止血帶鬆開。', prompt: '可以鬆開嗎？',
        options: [
          { t: '不行，不要自己鬆開，等救護人員來處理', ok: true, fb: '對！鬆開會再次大量出血。' },
          { t: '鬆開一下讓他休息', fb: '鬆開會再次大量出血，要等救護人員。' },
        ] },
    ],
    keyPoints: ['壓不住才用止血帶', '綁在傷口上方、避開關節', '轉到不流血、固定、寫下時間、不自己鬆開'],
    myth: { game: '打一針急救針就回血', real: '沒有急救針，只能壓住傷口、用止血帶，然後等救護車' },
  },
];

window.REFLECT = ['這次你做對了什麼？', '哪一步要再想想？', '如果在真實的家裡發生，你會怎麼做？'];
