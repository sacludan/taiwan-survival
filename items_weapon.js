/**
 * 【資料模組：武器 items_weapon.js】
 * v53：統一所有武器 ID，補齊美工刀、雷射筆、雨傘
 */
const WEAPONS_DATA = {
  items: {
    // ⚪ 白色 (1階：基礎可撿取武器)
    folding_chair: {
      id: "folding_chair",
      name: "塑膠折凳",
      type: "weapon",
      atk: 8,
      score: 10,
      desc: "相傳是七種武器之首，藏在民居之中、可隨身攜帶。拿來打架時絕對不能承認你是特務。"
    },
    megaphone: {
      id: "megaphone",
      name: "抗議大聲公",
      type: "weapon",
      atk: 10,
      score: 12,
      desc: "聲音開到最大聲連立法院外面的抗議民眾都聽得見。噪音攻擊也是一種物理傷害。"
    },
    box_cutter: {
      id: "box_cutter",
      name: "大支美工刀",
      type: "weapon",
      atk: 9,
      score: 11,
      desc: "辦公與拆快遞神器，推出去那瞬間咔咔作響，威懾力十足。"
    },
    umbrella: {
      id: "umbrella",
      name: "超商摺疊傘",
      type: "weapon",
      atk: 7,
      score: 9,
      desc: "台北人包包裡永遠有第三把傘，除了擋雨還能當西洋劍突刺。"
    },

    // 🟢 綠色 / 🔵 藍色 (進階合成武器)
    king_chair: {
      id: "king_chair",
      name: "⭐七種武器之首(折凳)",
      type: "weapon",
      atk: 28,
      score: 50,
      desc: "經過生鏽鐵釘強化改造的終極折凳，神佛難擋，一凳在手天下我有。"
    },
    thunder_horn: {
      id: "thunder_horn",
      name: "⚡雷神咆哮擴音器",
      type: "weapon",
      atk: 32,
      score: 60,
      desc: "結合高壓電池的大聲公，喊一聲直接讓方圓百里耳朵流血失智。"
    }
  }
};
window.ITEMS_WEAPON = WEAPONS_DATA.items;
