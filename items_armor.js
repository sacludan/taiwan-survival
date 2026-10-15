/**
 * 【模組：防具道具 items_armor.js】
 * 確保所有安全帽與防具嚴格定義部位 type: "head", "chest", "arm", "leg", "acc"
 */
window.ITEMS_ARMOR = {
  // 瓜皮安全帽 (白色/基礎頭部防具)
  melon_helmet: {
    id: "melon_helmet",
    name: "瓜皮安全帽",
    type: "head",
    def: 6,
    score: 10,
    desc: "台灣機車族標配，雖然遇到大撞擊可能先飛走，但至少防檢舉。"
  },

  // 正港三寶全罩盔 (綠色/進階頭部防具)
  tri_treasure_helmet: {
    id: "tri_treasure_helmet",
    name: "正港三寶全罩盔",
    type: "head",
    def: 18,
    score: 25,
    desc: "加裝了防風鏡與行車記錄器支架，三寶出巡無人能擋。"
  },

  // 鐵皮護胸 (衣服)
  iron_sheet: {
    id: "iron_sheet",
    name: "加厚鐵皮衣",
    type: "chest",
    def: 12,
    score: 15,
    desc: "台灣頂加違建最愛的同款鐵皮，擋風遮雨防鈍擊。"
  },

  // 防暴盾牌 (手臂)
  riot_shield: {
    id: "riot_shield",
    name: "抗議透明盾",
    type: "arm",
    def: 15,
    score: 20,
    desc: "立院推擠專用透明壓克力防暴盾，堅固輕便。"
  },

  // 動力外骨骼 (衣服/高階)
  power_armor: {
    id: "power_armor",
    name: "竹科外骨骼機甲",
    type: "chest",
    def: 35,
    score: 50,
    desc: "台積工程師加班研發的終極防護外骨骼，刀槍不入。"
  }
};

if (typeof GAME_DATA !== 'undefined' && GAME_DATA.items) {
  Object.assign(GAME_DATA.items, window.ITEMS_ARMOR);
}
