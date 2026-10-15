/**
 * 【模組：地圖資料庫 maps.js】
 * v53：
 * 1. 修正所有掉落物 ID 為標準名稱 (folding_chair, iron_nail, helmet, rice_sausage, milk_tea)
 * 2. 配置直式島嶼地圖座標 (x, y) 與專屬地標建築圖示 (icon)
 */
const MAPS_DATA = {
  zones: [
    // 🌊 北部海岸與山洞
    { id: "baishawan",       name: "白沙灣",           icon: "🏖️", x: 22, y: 7,  drops: ["folding_chair", "water_balloon", "umbrella"] },
    { id: "fugui_cape",      name: "富貴角燈塔",       icon: "🚨", x: 52, y: 5,  drops: ["battery", "laser_pointer", "iron_nail"] },
    { id: "beitou",          name: "北投地熱谷",       icon: "♨️", x: 80, y: 9,  drops: ["water_balloon", "battery", "bento"] },

    { id: "dadaocheng",      name: "大稻埕碼頭",       icon: "⚓", x: 18, y: 18, drops: ["iron_nail", "tape", "sausage"] },
    { id: "grand_hotel",     name: "圓山大飯店",       icon: "🏯", x: 50, y: 17, drops: ["sausage", "rice_sausage", "milk_tea"] },
    { id: "qingtian",        name: "陽明山擎天崗",     icon: "⛰️", x: 82, y: 20, drops: ["folding_chair", "umbrella", "water_balloon"] },

    // 🏙️ 內陸都會北段
    { id: "wugu_ind",        name: "五股工業區",       icon: "🏭", x: 17, y: 31, drops: ["iron_nail", "battery", "tape", "helmet"] },
    { id: "zhitong_tunnel",  name: "自強隧道",         icon: "🚇", x: 48, y: 29, drops: ["helmet", "iron_nail", "box_cutter"] },
    { id: "defense_dept",    name: "國防部",           icon: "🎖️", x: 80, y: 32, drops: ["laser_pointer", "battery", "helmet"] },

    // 🏛️ 中央盆地核心圈 (立法院置中)
    { id: "ximen",           name: "西門町",           icon: "🛍️", x: 16, y: 44, drops: ["milk_tea", "stinky_tofu", "box_cutter"] },
    { id: "ntu_hospital",    name: "臺大醫院",         icon: "🏥", x: 40, y: 41, drops: ["water_balloon", "tape", "battery"] },
    { id: "jinan_church",    name: "濟南教會",         icon: "⛪", x: 66, y: 41, drops: ["folding_chair", "bento", "umbrella"] },
    { id: "minsheng",        name: "民生社區",         icon: "🏘️", x: 84, y: 45, drops: ["folding_chair", "tape", "milk_tea"] },

    // ⚡ 正中心決賽點
    { id: "ly",              name: "立法院",           icon: "🏛️", x: 50, y: 52, isCenter: true, drops: ["folding_chair", "megaphone", "water_balloon", "bento"] },

    // 🏮 中南段城區
    { id: "longshan_temple", name: "艋舺龍山寺",       icon: "🏮", x: 18, y: 58, drops: ["sausage", "rice_sausage", "bento"] },
    { id: "taipei_gov",      name: "台北市政府",       icon: "🏢", x: 80, y: 57, drops: ["box_cutter", "tape", "bento", "megaphone"] },

    { id: "bopiliao",        name: "剝皮寮",           icon: "🧱", x: 20, y: 71, drops: ["folding_chair", "iron_nail", "tape"] },
    { id: "ck_high",         name: "建國中學",         icon: "🏫", x: 46, y: 67, drops: ["laser_pointer", "tape", "bento", "milk_tea"] },
    { id: "xinyi_fire",      name: "信義消防分隊",     icon: "🚒", x: 76, y: 69, drops: ["helmet", "water_balloon", "tape"] },

    // 🌲 南部森林與公墓
    { id: "daan_park",       name: "大安森林公園",     icon: "🌳", x: 24, y: 84, drops: ["folding_chair", "water_balloon", "sausage"] },
    { id: "liuzhangli",      name: "六張犁公墓",       icon: "🪦", x: 53, y: 82, drops: ["iron_nail", "umbrella", "battery"] },
    { id: "xiangshan",       name: "象山步道",         icon: "🌲", x: 80, y: 85, drops: ["umbrella", "water_balloon", "battery"] }
  ]
};

window.GAME_MAPS = MAPS_DATA.zones;
if (typeof GAME_DATA !== 'undefined') {
  GAME_DATA.zones = MAPS_DATA.zones;
}
