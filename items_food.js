/**
 * 【模組：食物道具 items_food.js】
 * 去除名稱數字，對應 1~3 階稀有度與配色
 */
const FOODS_DATA = {
  items: {
    // 1 階白裝
    bandage: { name: "繃帶", type: "food", hp: 20, sp: 0, score: 20, rarity: 1, desc: "簡易包紮傷口的醫療繃帶。" },
    water: { name: "水", type: "food", hp: 5, sp: 15, score: 15, rarity: 1, desc: "解渴的瓶裝礦泉水。" },
    black_tea: { name: "紅茶", type: "food", hp: 0, sp: 20, score: 18, rarity: 1, desc: "古早味冰紅茶。" },
    fresh_milk: { name: "鮮奶", type: "food", hp: 15, sp: 15, score: 25, rarity: 1, desc: "香濃純鮮奶。" },
    expired_milk: { name: "過期鮮奶", type: "food", hp: -10, sp: 0, score: 5, rarity: 1, desc: "喝了會烙跑的過期牛奶。" },
    pork: { name: "生豬肉", type: "food", hp: 10, sp: 0, score: 20, rarity: 1, desc: "傳統市場買的新鮮溫體豬肉。" },
    rice: { name: "白米", type: "food", hp: 10, sp: 10, score: 20, rarity: 1, desc: "優質蓬萊米。" },
    tofu: { name: "豆腐", type: "food", hp: 10, sp: 5, score: 18, rarity: 1, desc: "軟嫩白豆腐。" },
    egg: { name: "雞蛋", type: "food", hp: 10, sp: 5, score: 18, rarity: 1, desc: "營養豐富的新鮮雞蛋。" },

    // 2 階綠裝
    survival_pack: { name: "黑熊防災包", type: "food", hp: 45, sp: 20, score: 50, rarity: 2, desc: "居家防身與應急的防災求生包。" },
    milk_tea: { name: "珍珠奶茶", type: "food", hp: 15, sp: 45, score: 55, rarity: 2, desc: "台灣之光，珍奶萬歲。" },
    laxative: { name: "瀉藥", type: "food", hp: -25, sp: -10, score: 10, rarity: 2, desc: "通腸利便的強效瀉藥。" },
    royal_whiskey: { name: "皇家威士忌", type: "food", hp: 20, sp: 30, score: 50, rarity: 2, desc: "進口高級威士忌。" },
    kaoliang: { name: "高粱酒", type: "food", hp: 25, sp: 25, score: 52, rarity: 2, desc: "烈性金門高粱。" },
    grilled_sausage: { name: "碳烤香腸", type: "food", hp: 35, sp: 15, score: 45, rarity: 2, desc: "夜市炭香撲鼻的大香腸。" },
    sticky_rice: { name: "糯米腸", type: "food", hp: 30, sp: 15, score: 42, rarity: 2, desc: "Q彈糯米腸。" },
    stinky_tofu: { name: "脆皮臭豆腐", type: "food", hp: 35, sp: 20, score: 46, rarity: 2, desc: "外酥內嫩配泡菜。" },
    pork_bento: { name: "排骨便當", type: "food", hp: 40, sp: 25, score: 50, rarity: 2, desc: "國民美食炸排骨飯。" },
    braised_egg: { name: "滷蛋", type: "food", hp: 20, sp: 10, score: 28, rarity: 2, desc: "滷得透徹的香 Q 滷蛋。" },
    bitamin_wine: { name: "維士比加米酒", type: "food", hp: 35, sp: 35, score: 50, rarity: 2, desc: "工地的神仙快樂水。" },

    // 3 階藍裝
    taiwan_value: { name: "台灣價值", type: "food", hp: 80, sp: 50, score: 100, rarity: 3, desc: "充滿信仰與力量的終極補品。" },
    energy_drink: { name: "工地精神時光飲(保力達加莎莎亞)", type: "food", hp: 70, sp: 70, score: 120, rarity: 3, desc: "喝了直接原地復活、戰力滿點。" },
    kavalan: { name: "頂級噶瑪蘭威士忌", type: "food", hp: 65, sp: 60, score: 110, rarity: 3, desc: "世界金牌肯定的頂級威士忌。" },
    sausage_in_sausage: { name: "夜市大腸包小腸", type: "food", hp: 70, sp: 50, score: 105, rarity: 3, desc: "經典夜市組合，一口接一口。" },
    stinky_hotpot: { name: "深坑臭豆腐鍋", type: "food", hp: 75, sp: 55, score: 115, rarity: 3, desc: "香氣四溢的深坑招牌臭豆腐。" },
    legislative_bento: { name: "立院雙主菜便當", type: "food", hp: 70, sp: 60, score: 112, rarity: 3, desc: "有雞腿又有排骨的豪華國會便當。" },
    milktea_laxative: { name: "早餐店通腸大冰奶", type: "food", hp: 40, sp: 90, score: 100, rarity: 3, desc: "早餐店的通腸神器，喝完直奔廁所。" }
  }
};
window.ITEMS_FOOD = FOODS_DATA.items;
