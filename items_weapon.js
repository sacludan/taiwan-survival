/**
 * 【資料模組：武器 items_weapon.js】
 */
const WEAPONS_DATA = {
  items: {
    folding_chair: { id: "folding_chair", name: "塑膠折凳", type: "weapon", atk: 8, score: 10 },
    megaphone:     { id: "megaphone", name: "抗議大聲公", type: "weapon", atk: 10, score: 12 },
    iron_nail:     { id: "iron_nail", name: "生鏽鐵釘", type: "material" },
    battery:       { id: "battery", name: "高壓電池", type: "material" },
    water_balloon: { id: "water_balloon", name: "質詢水球", type: "material" },

    // 進階武器
    king_chair:    { id: "king_chair", name: "⭐七種武器之首(折凳)", type: "weapon", atk: 28, score: 50 },
    thunder_horn:  { id: "thunder_horn", name: "⚡雷神咆哮擴音器", type: "weapon", atk: 32, score: 60 }
  }
};
