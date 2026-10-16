/**
 * 【資料模組：純工業與日常材料 items_material.js】
 * 去除名稱數字，對應 1~2 階稀有度與配色
 */
const MATERIALS_DATA = {
  items: {
    // 1 階白裝
    paper: { name: "紙", type: "material", score: 10, rarity: 1, desc: "普通的白紙。" },
    pen: { name: "筆", type: "material", score: 10, rarity: 1, desc: "藍黑色原子筆。" },
    red_pen: { name: "紅筆", type: "material", score: 10, rarity: 1, desc: "改考卷或批公文用的紅筆。" },
    money: { name: "金錢", type: "material", score: 15, rarity: 1, desc: "新台幣現金。" },
    book: { name: "書", type: "material", score: 12, rarity: 1, desc: "厚重的教科書。" },
    newspaper: { name: "報紙", type: "material", score: 8, rarity: 1, desc: "當日頭條新聞報紙。" },
    wallpaper_stock: { name: "壁紙股票", type: "material", score: 10, rarity: 1, desc: "跌到變壁紙的廢紙股票。" },
    deed: { name: "地契", type: "material", score: 25, rarity: 1, desc: "祖傳土地所有權狀。" },
    jade_seal: { name: "玉山印章", type: "material", score: 20, rarity: 1, desc: "刻有玉山字樣的官印。" },
    netizen_cert: { name: "網軍資格證", type: "material", score: 15, rarity: 1, desc: "取得鍵盤戰士資格的憑證。" },
    cult_flyer: { name: "邪教宣傳單", type: "material", score: 8, rarity: 1, desc: "神祕組織的宣傳傳單。" },
    amulet: { name: "符咒", type: "material", score: 12, rarity: 1, desc: "道長畫的黃紙符咒。" },
    incense: { name: "香", type: "material", score: 8, rarity: 1, desc: "拜拜用的線香。" },
    joss_paper: { name: "金紙", type: "material", score: 8, rarity: 1, desc: "燒給神明或祖先的金紙。" },

    nano_wafer: { name: "晶圓", type: "material", score: 20, rarity: 1, desc: "護國神山的 12 吋矽晶圓。" },
    battery: { name: "電池", type: "material", score: 12, rarity: 1, desc: "3號鹼性電池。" },
    camera_module: { name: "鏡頭模組", type: "material", score: 18, rarity: 1, desc: "高畫素手機鏡頭模組。" },
    rusty_nail: { name: "生鏽鐵釘", type: "material", score: 10, rarity: 1, desc: "生鏽的粗鐵釘。" },
    scrap_iron: { name: "廢鐵片", type: "material", score: 12, rarity: 1, desc: "回收場撿到的廢棄鐵片。" },
    exhaust_pipe: { name: "機車排氣管", type: "material", score: 15, rarity: 1, desc: "改車拆下來的排氣管。" },
    tape: { name: "膠帶", type: "material", score: 10, rarity: 1, desc: "萬能的布紋膠帶。" },
    plastic_bag: { name: "塑膠袋", type: "material", score: 5, rarity: 1, desc: "便利商店紅白色塑膠袋。" },
    lighter: { name: "打火機", type: "material", score: 12, rarity: 1, desc: "便利商店買的電子打火機。" },
    red_thread: { name: "紅線", type: "material", score: 10, rarity: 1, desc: "月老廟求來的姻緣紅線。" },
    feather: { name: "羽毛", type: "material", score: 8, rarity: 1, desc: "鳥類的羽毛。" },
    condom: { name: "保險套", type: "material", score: 15, rarity: 1, desc: "安全第一的保險套。" },

    betel_nut: { name: "檳榔", type: "material", score: 12, rarity: 1, desc: "提神醒腦的紅唇檳榔。" },
    quicklime: { name: "石灰", type: "material", score: 10, rarity: 1, desc: "包檳榔用的工業石灰。" },
    whiskey: { name: "威士忌", type: "material", score: 18, rarity: 1, desc: "平價威士忌。" },
    polydar: { name: "保力達B", type: "material", score: 15, rarity: 1, desc: "勞工朋友的提神藥酒。" },
    cooking_wine: { name: "料理米酒", type: "material", score: 12, rarity: 1, desc: "廚房煮菜用的公賣局米酒。" },
    ancestral_recipe: { name: "祖傳配方", type: "material", score: 30, rarity: 1, desc: "神祕失傳的阿嬤祖傳料理配方。" },
    garlic: { name: "蒜頭", type: "material", score: 8, rarity: 1, desc: "香氣撲鼻的新鮮蒜頭。" },
    soy_sauce: { name: "醬油", type: "material", score: 10, rarity: 1, desc: "香醇黃豆醬油。" },

    // 2 階綠裝
    election_ballot: { name: "選票", type: "material", score: 25, rarity: 2, desc: "神聖的一票。" },
    membership_form: { name: "入黨申請單", type: "material", score: 22, rarity: 2, desc: "填了就能加入組織的表格。" },
    academic_paper: { name: "學術論文", type: "material", score: 28, rarity: 2, desc: "經過同行審查的學術論文。" },
    advanced_book: { name: "高級書本", type: "material", score: 25, rarity: 2, desc: "專業領域的參考書。" },
    land_deed: { name: "土地權狀", type: "material", score: 45, rarity: 2, desc: "證明擁有土地產權的公文。" },
    nano_wafer_item: { name: "奈米晶圓", type: "material", score: 40, rarity: 2, desc: "高階製程奈米晶圓。" },
    iron_plate: { name: "鐵板", type: "material", score: 35, rarity: 2, desc: "加厚防護鐵板。" },
    dash_cam: { name: "行車紀錄器", type: "material", score: 38, rarity: 2, desc: "拍下事故真相的行車紀錄器。" },
    mod_exhaust: { name: "暴改排氣管", type: "material", score: 36, rarity: 2, desc: "音浪太強的改裝排氣管。" },
    century_ash: { name: "百年香灰", type: "material", score: 32, rarity: 2, desc: "香爐裡沈澱百年的靈驗香灰。" },
    explosive_bomb: { name: "土製高爆彈", type: "material", score: 45, rarity: 2, desc: "危險的自製爆裂物。" }
  }
};
window.ITEMS_MATERIAL = MATERIALS_DATA.items;
