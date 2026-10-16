/**
 * 【模組：防具道具 items_armor.js】
 * 去除名稱數字，嚴格對應 1~5 階稀有度與配色
 */
const ARMORS_DATA = {
  items: {
    // 1 階白裝
    melon_helmet: { name: "瓜皮安全帽", type: "head", def: 2, score: 20, rarity: 1, desc: "戴了等於沒戴的陽春安全帽。" },
    reading_glasses: { name: "老花眼鏡", type: "head", def: 1, score: 15, rarity: 1, desc: "看書看政見必備。" },
    dirty_towel: { name: "髒毛巾", type: "head", def: 1, score: 15, rarity: 1, desc: "擦汗用的汗酸毛巾。" },
    sun_hat: { name: "遮陽帽", type: "head", def: 1, score: 15, rarity: 1, desc: "防曬遮陽好幫手。" },
    bamboo_hat: { name: "斗笠", type: "head", def: 2, score: 22, rarity: 1, desc: "農夫耕田經典配備。" },

    sun_jacket: { name: "防曬外套", type: "chest", def: 2, score: 20, rarity: 1, desc: "機車通勤族防紫外線聖物。" },
    robe: { name: "長袍", type: "chest", def: 3, score: 25, rarity: 1, desc: "道士或長者穿的傳統長袍。" },
    yellow_vest: { name: "發黃背心", type: "chest", def: 1, score: 15, rarity: 1, desc: "年代久遠、洗不白的老舊背心。" },
    shirt: { name: "襯衫", type: "chest", def: 2, score: 20, rarity: 1, desc: "上班族標準制服。" },
    light_raincoat: { name: "輕便雨衣", type: "chest", def: 1, score: 18, rarity: 1, desc: "超商買的十元透明雨衣。" },
    dunga: { name: "吊嘎", type: "chest", def: 2, score: 20, rarity: 1, desc: "阿伯在家納涼的最愛。" },

    cloth_gloves: { name: "粗布手套", type: "arm", def: 2, score: 20, rarity: 1, desc: "工地做工用的棉紗手套。" },
    iron_pot: { name: "鐵鍋", type: "arm", def: 3, score: 30, rarity: 1, desc: "拿來當作克難盾牌的炒菜鍋。" },
    rubber_gloves: { name: "洗碗橡膠手套", type: "arm", def: 2, score: 22, rarity: 1, desc: "洗碗洗廁所的防水橡膠手套。" },

    white_slippers: { name: "藍白拖", type: "leg", def: 2, score: 20, rarity: 1, desc: "台灣國民神鞋，耐磨耐操。" },
    sports_shorts: { name: "運動短褲", type: "leg", def: 2, score: 20, rarity: 1, desc: "透氣輕便的學校體育短褲。" },
    grandpa_boxers: { name: "阿公四角褲", type: "leg", def: 1, score: 15, rarity: 1, desc: "通風舒適的傳統四角褲。" },
    rain_boots: { name: "雨鞋", type: "leg", def: 3, score: 28, rarity: 1, desc: "下雨天踩泥巴專用。" },
    straw_sandals: { name: "草鞋", type: "leg", def: 1, score: 15, rarity: 1, desc: "古早味的編織草鞋。" },

    // 2 階綠裝
    sticker_helmet: { name: "貼紙安全帽", type: "head", def: 4, score: 50, rarity: 2, desc: "貼滿流行貼紙的半罩安全帽。" },
    wind_goggles: { name: "防風護目鏡", type: "head", def: 3, score: 45, rarity: 2, desc: "騎車擋風沙用。" },
    victory_headband: { name: "必勝頭巾", type: "head", def: 3, score: 40, rarity: 2, desc: "寫著必勝的熱血頭巾。" },
    pilgrim_hat: { name: "進香團鴨舌帽", type: "head", def: 3, score: 42, rarity: 2, desc: "媽祖進香團發的紀念帽。" },
    worker_helmet: { name: "工地安全帽", type: "head", def: 5, score: 60, rarity: 2, desc: "黃色工程安全帽。" },

    down_vest: { name: "羽絨背心", type: "chest", def: 4, score: 55, rarity: 2, desc: "保暖背心。" },
    taoist_robe: { name: "道士服", type: "chest", def: 5, score: 65, rarity: 2, desc: "畫有八卦圖的道袍。" },
    clean_vest: { name: "乾淨背心", type: "chest", def: 3, score: 40, rarity: 2, desc: "剛洗好的白色背心。" },
    normal_uniform: { name: "普通制服", type: "chest", def: 4, score: 50, rarity: 2, desc: "標準學生制服。" },
    puncture_vest: { name: "防刺背心", type: "chest", def: 6, score: 70, rarity: 2, desc: "保全防身用背心。" },
    reflective_vest: { name: "反光背心", type: "chest", def: 3, score: 45, rarity: 2, desc: "夜晚施工安全反光衣。" },

    insulated_gloves: { name: "絕緣工地手套", type: "arm", def: 4, score: 45, rarity: 2, desc: "防觸電手套。" },
    pot_shield: { name: "鍋蓋圓盾", type: "arm", def: 5, score: 55, rarity: 2, desc: "用鍋蓋改裝的小圓盾。" },
    wind_gloves: { name: "機車防風手套", type: "arm", def: 4, score: 48, rarity: 2, desc: "冬天騎車防凍手套。" },
    slip_wristband: { name: "止滑護腕", type: "arm", def: 3, score: 35, rarity: 2, desc: "運動護腕。" },

    nonslip_slippers: { name: "止滑藍白拖", type: "leg", def: 4, score: 45, rarity: 2, desc: "強化防滑的藍白拖。" },
    torn_jeans: { name: "刷破牛仔褲", type: "leg", def: 4, score: 48, rarity: 2, desc: "流行刷破風牛仔褲。" },
    sport_pants: { name: "運動長褲", type: "leg", def: 4, score: 46, rarity: 2, desc: "棉質長褲。" },
    market_rainboots: { name: "市場防水雨鞋", type: "leg", def: 5, score: 55, rarity: 2, desc: "菜市場賣的高筒雨鞋。" },
    old_sneakers: { name: "破舊運動鞋", type: "leg", def: 3, score: 38, rarity: 2, desc: "穿很久的舊球鞋。" },
    scald_pants: { name: "改管防燙褲", type: "leg", def: 5, score: 58, rarity: 2, desc: "防止被機車排氣管燙傷的褲子。" },

    // 3 階藍裝
    wind_helmet: { name: "防風西瓜皮", type: "head", def: 7, score: 90, rarity: 3, desc: "包覆性較好的安全帽。" },
    scholar_hat: { name: "狀元及第帽", type: "head", def: 6, score: 85, rarity: 3, desc: "祈求考試順利的帽子。" },
    temple_cap: { name: "宮廟主委帽", type: "head", def: 7, score: 92, rarity: 3, desc: "地方有力人士的帽子。" },
    steel_helmet: { name: "工地主任反光鋼盔", type: "head", def: 9, score: 110, rarity: 3, desc: "堅固耐用的鋼盔。" },

    purple_cult_robe: { name: "紫衣神教服", type: "chest", def: 8, score: 100, rarity: 3, desc: "充滿神祕宗教力量的紫衣。" },
    legislative_vest: { name: "立委背心", type: "chest", def: 8, score: 105, rarity: 3, desc: "印有候選人號次的競選背心。" },
    ck_uniform: { name: "建中制服", type: "chest", def: 8, score: 110, rarity: 3, desc: "北台灣第一學府榮譽制服。" },
    thick_iron_armor: { name: "加厚鐵皮衣", type: "chest", def: 11, score: 130, rarity: 3, desc: "防禦力極高的鐵皮護甲。" },
    tsmc_vest: { name: "台積工程師背心", type: "chest", def: 10, score: 125, rarity: 3, desc: "護國神山員工專屬背心。" },

    engineer_wrist: { name: "工程師防靜電護腕", type: "arm", def: 7, score: 85, rarity: 3, desc: "防止靜電干擾的專業護腕。" },
    protest_shield: { name: "抗議透明盾", type: "arm", def: 8, score: 95, rarity: 3, desc: "抗議現場常見的壓克力盾牌。" },
    sleeve_covers: { name: "採茶防曬袖套", type: "arm", def: 6, score: 75, rarity: 3, desc: "茶農防曬必備袖套。" },
    tattoo_sleeve: { name: "廟口刺青包手護臂", type: "arm", def: 8, score: 100, rarity: 3, desc: "印有猛龍過江圖騰的護臂。" },

    enhanced_slippers: { name: "強化藍白拖", type: "leg", def: 7, score: 90, rarity: 3, desc: "釘了鐵釘的升級版藍白拖。" },
    election_jeans: { name: "競選牛仔褲", type: "leg", def: 8, score: 100, rarity: 3, desc: "掃街拜票耐磨牛仔褲。" },
    cargo_pants: { name: "多口袋工作褲", type: "leg", def: 8, score: 102, rarity: 3, desc: "裝滿工具的工作褲。" },
    puncture_boots: { name: "工地防穿刺雨鞋", type: "leg", def: 9, score: 115, rarity: 3, desc: "底部有鋼板防穿刺的雨鞋。" },
    clean_slippers: { name: "竹科無塵室內拖", type: "leg", def: 7, score: 88, rarity: 3, desc: "無塵室專用室內拖鞋。" },
    skinny_pants: { name: "8+9緊身破褲", type: "leg", def: 8, score: 105, rarity: 3, desc: "改車少年最愛的緊身破褲。" },

    // 4 階黃裝
    full_helmet: { name: "正港三寶全罩盔", type: "head", def: 13, score: 160, rarity: 4, desc: "防護力全開的重型安全帽。" },
    phd_hat: { name: "一點五個博士帽", type: "head", def: 12, score: 150, rarity: 4, desc: "學術地位的象徵。" },
    temple_crown: { name: "鎮瀾宮主委金冠", type: "head", def: 14, score: 175, rarity: 4, desc: "金光閃閃的主委皇冠。" },

    purple_down: { name: "紫色羽絨服", type: "chest", def: 15, score: 190, rarity: 4, desc: "保暖與氣場兼具的羽絨外套。" },
    yellow_robe: { name: "總統御用黃袍", type: "chest", def: 16, score: 200, rarity: 4, desc: "至尊無上的象徵。" },
    phd_robe: { name: "博士袍", type: "chest", def: 15, score: 195, rarity: 4, desc: "學位加持的正式長袍。" },
    tsmc_suit: { name: "台積電無塵衣", type: "chest", def: 18, score: 220, rarity: 4, desc: "奈米級防塵的高科技防護衣。" },

    engineer_armor: { name: "竹科外骨骼護臂", type: "arm", def: 13, score: 160, rarity: 4, desc: "機械動力加持的外骨骼護臂。" },
    riot_shield: { name: "立院鎮暴裝甲盾", type: "arm", def: 14, score: 175, rarity: 4, desc: "國會攻防戰的厚重防盾。" },
    ice_sleeves: { name: "阿嬤的防曬冰絲袖套", type: "arm", def: 12, score: 150, rarity: 4, desc: "涼爽防曬的神級袖套。" },

    studded_slippers: { name: "戰神鉚釘藍白拖", type: "leg", def: 13, score: 160, rarity: 4, desc: "釘滿金屬鉚釘的戰鬥藍白拖。" },
    village_pants: { name: "里長伯西裝褲", type: "leg", def: 14, score: 170, rarity: 4, desc: "里長開會專用西裝褲。" },
    science_pants: { name: "竹科工程師卡其褲", type: "leg", def: 14, score: 172, rarity: 4, desc: "工程師標配卡其褲。" },
    exhaust_boots: { name: "暴走族改管防燙靴", type: "leg", def: 15, score: 185, rarity: 4, desc: "飆車族專用防燙靴。" },
    jade_boots: { name: "玉山攻頂黃金雨鞋", type: "leg", def: 15, score: 188, rarity: 4, desc: "登山攻頂防水神鞋。" },

    // 5 階紅裝
    grandma_jacket: { name: "絕強阿嬤外套", type: "chest", def: 25, score: 300, rarity: 5, desc: "「你冷不冷，阿嬤覺得你冷！」防禦力突破天際的傳說外套。" },
    mazu_helmet: { name: "媽祖欽點戰神金盔", type: "head", def: 22, score: 280, rarity: 5, desc: "媽祖娘娘親自加持的神級頭盔。" },
    nano_arm: { name: "護國神山奈米機械臂", type: "arm", def: 21, score: 270, rarity: 5, desc: "結合護國神山科技的奈米動力機械臂。" },
    grandma_slippers: { name: "阿嬤的追魂藍白拖", type: "leg", def: 22, score: 280, rarity: 5, desc: "方圓百里內彈無虛發的傳說拖鞋。" }
  }
};
window.ITEMS_ARMOR = ARMORS_DATA.items;
