/**
 * 【資料模組：武器 items_weapon.js】
 */
const WEAPONS_DATA = {
  items: {
    folding_chair: { id: "folding_chair", name: "塑膠折凳", type: "weapon", atk: 8, score: 10, desc: "相傳是七種武器之首，藏在民居之中、可隨身攜帶。拿來打架時絕對不能承認你是特務。" },
    megaphone:     { id: "megaphone", name: "抗議大聲公", type: "weapon", atk: 10, score: 12, desc: "聲音開到最大聲連立法院外面的抗議民眾都聽得見。噪音攻擊也是一種物理傷害。" },
    iron_nail:     { id: "iron_nail", name: "生鏽鐵釘", type: "material", desc: "踩到會得破傷風。可以用來釘死某些不聽話的東西。" },
    battery:       { id: "battery", name: "高壓電池", type: "material", desc: "摸起來刺刺的，感覺充滿了慣老闆的憤怒電流。" },
    water_balloon: { id: "water_balloon", name: "質詢水球", type: "material", desc: "立法院質詢必備道具，砸中對手會造成精神汙辱與濕身效果。" },

    // 進階武器
    king_chair:    { id: "king_chair", name: "⭐七種武器之首(折凳)", type: "weapon", atk: 28, score: 50, desc: "經過鐵釘強化改造的終極折凳，神佛難擋，一凳在手天下我有。" },
    thunder_horn:  { id: "thunder_horn", name: "⚡雷神咆哮擴音器", type: "weapon", atk: 32, score: 60, desc: "結合高壓電池的大聲公，喊一聲直接讓方圓百里耳朵流血失智。" }
  }
};
