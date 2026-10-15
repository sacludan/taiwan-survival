/**
 * 【模組：食物道具 items_food.js】
 * 補齊全糖大冰奶、大腸包小腸、抗議便當等所有台味美食資料
 */
window.ITEMS_FOOD = {
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
  stinky_tofu: {
    id: "stinky_tofu",
    name: "脆皮臭豆腐",
    type: "food",
    hp: 35,
    sp: 10,
    desc: "聞起來像垃圾桶，吃起來像天堂。搭配泡菜簡直是人間凶器。"
  },
  sausage: {
    id: "sausage",
    name: "烤香腸",
    type: "food",
    hp: 25,
    sp: 15,
    desc: "夜市路邊攤打香腸必備，蒜頭配著吃戰力翻倍。"
  },
  sticky_rice_sausage: {
    id: "sticky_rice_sausage",
    name: "糯米腸",
    type: "food",
    hp: 30,
    sp: 15,
    desc: "大腸包小腸的靈魂外皮，扎實飽足。"
  },
  tw_hotdog: {
    id: "tw_hotdog",
    name: "大腸包小腸",
    type: "food",
    hp: 60,
    sp: 30,
    desc: "炭烤香腸包入糯米腸，淋上甜辣醬與蒜片，台灣夜市霸主級美食！"
  },
  bento: {
    id: "bento",
    name: "立院抗議便當",
    type: "food",
    hp: 35,
    sp: 20,
    desc: "抗議現場必領的雙主菜便當，吃飽了才有力氣繼續戰鬥！"
  },
  lunch_box: {
    id: "lunch_box",
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
