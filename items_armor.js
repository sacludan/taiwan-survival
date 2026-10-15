/**
 * 【模組：防具道具 items_armor.js】
 * v53：統一 helmet 與 sanbao_helmet ID，確保合成與穿戴 100% 順暢
 */
const ARMORS_DATA = {
  items: {
    // ⚪ 白色 (1階：基礎防具)
    helmet: {
      id: "helmet",
      name: "瓜皮安全帽",
      type: "head",
      def: 6,
      score: 10,
      desc: "台灣機車族標配，雖然遇到大撞擊可能先飛走，但至少防檢舉。"
    },

    // 🟢 綠色 (2階：一次合成防具)
    sanbao_helmet: {
      id: "sanbao_helmet",
      name: "正港三寶全罩盔",
      type: "head",
      def: 20,
      score: 25,
      desc: "加裝了防風鏡與行車記錄器支架，三寶出巡無人能擋。"
    },
    iron_sheet: {
      id: "iron_sheet",
      name: "加厚鐵皮衣",
      type: "chest",
      def: 12,
      score: 15,
      desc: "台灣頂加違建最愛的同款鐵皮，擋風遮雨防鈍擊。"
    },

    // 🔵 藍色 (3階：稀有防具)
    riot_shield: {
      id: "riot_shield",
      name: "抗議透明盾",
      type: "arm",
      def: 15,
      score: 20,
      desc: "立院推擠專用透明壓克力防暴盾，堅固輕便。"
    },

    // 🟡 黃色 (4階：高階防具)
    power_armor: {
      id: "power_armor",
      name: "竹科外骨骼機甲",
      type: "chest",
      def: 35,
      score: 50,
      desc: "台積工程師加班研發的終極防護外骨骼，刀槍不入。"
    }
  }
};
window.ITEMS_ARMOR = ARMORS_DATA.items;
