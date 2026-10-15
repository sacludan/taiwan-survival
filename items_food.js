/**
 * 【模組：食物道具 items_food.js】
 * 獨立區分：全糖大冰奶 vs 波霸珍珠奶茶，並補齊士林夜市所有對應 key
 */
window.ITEMS_FOOD = {
  // 1. 全糖大冰奶 (主打高體力)
  milk_tea: {
    id: "milk_tea",
    name: "全糖大冰奶",
    type: "food",
    hp: 20,
    sp: 40,
    desc: "台灣早餐店最強瀉藥聖品。喝下一口腸道蠕動速度提升300%，體力爆棚！"
  },
  boba_milk_tea: {
    id: "boba_milk_tea",
    name: "全糖大冰奶",
    type: "food",
    hp: 20,
    sp: 40,
    desc: "台灣早餐店最強瀉藥聖品。喝下一口腸道蠕動速度提升300%，體力爆棚！"
  },

  // 2. 波霸珍珠奶茶 (獨立道具：主打高回血)
  bubble_tea: {
    id: "bubble_tea",
    name: "波霸珍珠奶茶",
    type: "food",
    hp: 50,
    sp: 20,
    desc: "台灣之光手搖飲！滿滿Q彈黑糖波霸，嚼勁十足，一口下去身心靈瞬間滿血。"
  },

  // 3. 脆皮臭豆腐
  stinky_tofu: {
    id: "stinky_tofu",
    name: "脆皮臭豆腐",
    type: "food",
    hp: 35,
    sp: 10,
    desc: "聞起來像垃圾桶，吃起來像天堂。搭配泡菜簡直是人間凶器。"
  },

  // 4. 烤香腸
  sausage: {
    id: "sausage",
    name: "烤香腸",
    type: "food",
    hp: 25,
    sp: 15,
    desc: "夜市路邊攤打香腸必備，蒜頭配著吃戰力翻倍。"
  },

  // 5. 糯米腸 (相容 rice_sausage 與 sticky_rice_sausage 兩種 key)
  rice_sausage: {
    id: "rice_sausage",
    name: "糯米腸",
    type: "food",
    hp: 30,
    sp: 15,
    desc: "大腸包小腸的靈魂外皮，扎實飽足。"
  },
  sticky_rice_sausage: {
    id: "sticky_rice_sausage",
    name: "糯米腸",
    type: "food",
    hp: 30,
    sp: 15,
    desc: "大腸包小腸的靈魂外皮，扎實飽足。"
  }
};

// 確保 GAME_DATA 載入後自動合併
if (typeof GAME_DATA !== 'undefined' && GAME_DATA.items) {
  Object.assign(GAME_DATA.items, window.ITEMS_FOOD);
}
