/**
 * 【模組：食物道具 items_food.js】
 * 支援所有歷史相容 key（bubble_tea, rice_sausage, bento 等），徹底杜絕英文
 */
window.ITEMS_FOOD = {
  // 大冰奶系列別名
  milk_tea: {
    id: "milk_tea",
    name: "全糖大冰奶",
    type: "food",
    hp: 20,
    sp: 40,
    desc: "台灣早餐店最強瀉藥聖品。喝下一口腸道蠕動速度提升300%，體力爆棚！"
  },
  boba_milk_tea: {
    id: "milk_tea",
    name: "全糖大冰奶",
    type: "food",
    hp: 20,
    sp: 40,
    desc: "台灣早餐店最強瀉藥聖品。喝下一口腸道蠕動速度提升300%，體力爆棚！"
  },
  bubble_tea: {
    id: "milk_tea",
    name: "全糖大冰奶",
    type: "food",
    hp: 20,
    sp: 40,
    desc: "台灣早餐店最強瀉藥聖品。喝下一口腸道蠕動速度提升300%，體力爆棚！"
  },

  // 糯米腸系列別名
  sticky_rice_sausage: {
    id: "sticky_rice_sausage",
    name: "糯米腸",
    type: "food",
    hp: 30,
    sp: 15,
    desc: "大腸包小腸的靈魂外皮，扎實飽足。"
  },
  rice_sausage: {
    id: "sticky_rice_sausage",
    name: "糯米腸",
    type: "food",
    hp: 30,
    sp: 15,
    desc: "大腸包小腸的靈魂外皮，扎實飽足。"
  },

  // 烤香腸
  sausage: {
    id: "sausage",
    name: "烤香腸",
    type: "food",
    hp: 25,
    sp: 15,
    desc: "夜市路邊攤打香腸必備，蒜頭配著吃戰力翻倍。"
  },

  // 脆皮臭豆腐
  stinky_tofu: {
    id: "stinky_tofu",
    name: "脆皮臭豆腐",
    type: "food",
    hp: 35,
    sp: 10,
    desc: "聞起來像垃圾桶，吃起來像天堂。搭配泡菜簡直是人間凶器。"
  },

  // 大腸包小腸
  tw_hotdog: {
    id: "tw_hotdog",
    name: "大腸包小腸",
    type: "food",
    hp: 60,
    sp: 30,
    desc: "炭烤香腸包入糯米腸，淋上甜辣醬與蒜片，台灣夜市霸主級美食！"
  },

  // 抗議便當系列別名
  bento: {
    id: "bento",
    name: "立院抗議便當",
    type: "food",
    hp: 35,
    sp: 20,
    desc: "抗議現場必領的雙主菜便當，吃飽了才有力氣繼續戰鬥！"
  },
  lunch_box: {
    id: "bento",
    name: "立院抗議便當",
    type: "food",
    hp: 35,
    sp: 20,
    desc: "抗議現場必領的雙主菜便當，吃飽了才有力氣繼續戰鬥！"
  }
};

if (typeof GAME_DATA !== 'undefined' && GAME_DATA.items) {
  Object.assign(GAME_DATA.items, window.ITEMS_FOOD);
}
