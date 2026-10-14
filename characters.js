/**
 * 【資料模組：角色數據 characters.js】
 */
const CHARACTERS_DATA = {
  initialPlayer: {
    name: "🗣️ 戰神咆哮哥",
    hp: 120, maxHp: 120,
    sp: 100, maxSp: 100,
    baseAtk: 15, baseDef: 5,
    zone: "ly",
    weapon: null,
    armor: null,
    bag: ["bubble_tea"],
    skillCd: 0
  },

  initialAI: {
    name: "🐝 嗡嗡阿伯",
    hp: 130, maxHp: 130,
    baseAtk: 14, baseDef: 6,
    zone: "hsinchu",
    weapon: null,
    armor: null,
    bag: ["bento"],
    stunned: 0,
    alive: true,
    wishlist: ["helmet", "tape", "folding_chair", "iron_nail"]
  }
};
