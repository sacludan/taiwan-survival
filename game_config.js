/**
 * 【總合配置檔 game_config.js】
 */
const GAME_DATA = {
  zones: (typeof MAPS_DATA !== 'undefined' && MAPS_DATA.zones) ? MAPS_DATA.zones : [
    { id: "ly", name: "🏛️ 立法院", drops: ["folding_chair", "megaphone", "water_balloon", "tape"] },
    { id: "shilin", name: "🍢 士林夜市", drops: ["sausage", "rice_sausage", "bubble_tea", "stinky_tofu"] },
    { id: "hsinchu", name: "🏭 竹科科技廠", drops: ["iron_nail", "battery", "wafer", "helmet"] },
    { id: "taipei_main", name: "🚉 台北車站", drops: ["iron_nail", "helmet", "tape", "bento"] }
  ],
  initialPlayer: (typeof CHARACTERS_DATA !== 'undefined' && CHARACTERS_DATA.initialPlayer) ? CHARACTERS_DATA.initialPlayer : {
    name: "🗣️ 戰神咆哮哥", hp: 120, maxHp: 120, sp: 100, maxSp: 100, baseAtk: 15, baseDef: 5, zone: "ly", weapon: null, armor: null, bag: ["bubble_tea"], skillCd: 0
  },
  initialAI: (typeof CHARACTERS_DATA !== 'undefined' && CHARACTERS_DATA.initialAI) ? CHARACTERS_DATA.initialAI : {
    name: "🐝 嗡嗡阿伯", hp: 130, maxHp: 130, baseAtk: 14, baseDef: 6, zone: "hsinchu", weapon: null, armor: null, bag: ["bento"], stunned: 0, alive: true, wishlist: ["helmet", "tape", "folding_chair", "iron_nail"]
  },
  recipes: (typeof RECIPES_DATA !== 'undefined' && RECIPES_DATA.recipes) ? RECIPES_DATA.recipes : [
    { result: "king_chair", materials: ["folding_chair", "iron_nail"], desc: "折凳 + 生鏽鐵釘 = 攻擊+28" },
    { result: "thunder_horn", materials: ["megaphone", "battery"], desc: "大聲公 + 高壓電池 = 攻擊+32" },
    { result: "sanbao_helmet", materials: ["helmet", "tape"], desc: "安全帽 + 大力膠帶 = 防禦+20" },
    { result: "tw_hotdog", materials: ["sausage", "rice_sausage"], desc: "烤香腸 + 糯米腸 = 回血75" }
  ],
  items: Object.assign({},
    (typeof WEAPONS_DATA !== 'undefined' && WEAPONS_DATA.items) ? WEAPONS_DATA.items : {},
    (typeof ARMORS_DATA !== 'undefined' && ARMORS_DATA.items) ? ARMORS_DATA.items : {},
    (typeof MATERIALS_DATA !== 'undefined' && MATERIALS_DATA.items) ? MATERIALS_DATA.items : {},
    (typeof FOODS_DATA !== 'undefined' && FOODS_DATA.items) ? FOODS_DATA.items : {}
  )
};
