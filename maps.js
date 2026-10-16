/**
 * 【模組：地圖資料庫 maps.js】
 * 替換為指定的 22 個地區（保留原版座標配置與空的 drops 陣列，不動其他細節）
 */
const MAPS_DATA = {
  zones: [
    // 🌊 北部區域
    { id: "tamsui",          name: "淡水老街",     icon: "🚢", x: 22, y: 7,  drops: [] },
    { id: "taipeistation",   name: "台北車站",     icon: "🚉", x: 52, y: 5,  drops: [] },
    { id: "beitou",          name: "北投溫泉",     icon: "♨️", x: 80, y: 9,  drops: [] },

    { id: "sanchong",        name: "三重埔",       icon: "🌉", x: 18, y: 18, drops: [] },
    { id: "guanghua",        name: "光華商場",     icon: "💻", x: 50, y: 17, drops: [] },
    { id: "yangmingshan",    name: "陽明山",       icon: "⛰️", x: 82, y: 20, drops: [] },

    // 🏙️ 內陸都會北段
    { id: "wugu_ind",        name: "五股工業區",   icon: "🛠️", x: 17, y: 31, drops: [] },
    { id: "shilin",          name: "士林夜市",     icon: "🍢", x: 48, y: 29, drops: [] },
    { id: "neihu",           name: "內湖科學園區", icon: "🖥️", x: 80, y: 32, drops: [] },

    // 🏛️ 中央盆地圈
    { id: "ximen",           name: "西門町",       icon: "🎬", x: 16, y: 44, drops: [] },
    { id: "ntu_hospital",    name: "台大醫院",     icon: "🏥", x: 40, y: 41, drops: [] },
    { id: "taipeiarena",     name: "台北大巨蛋",   icon: "🏟️", x: 66, y: 41, drops: [] },
    { id: "songshan",        name: "松山機場",     icon: "✈️", x: 84, y: 45, drops: [] },

    // 🏛️ 立法院
    { id: "ly",              name: "立法院",       icon: "🏛️", x: 50, y: 52, drops: [] },

    // 🏮 中南段城區
    { id: "longshan_temple", name: "龍山寺",       icon: "🏮", x: 18, y: 58, drops: [] },
    { id: "taipei101",       name: "台北 101",     icon: "🏢", x: 80, y: 57, drops: [] },

    { id: "market",          name: "果菜批發市場", icon: "🥬", x: 20, y: 71, drops: [] },
    { id: "ntu",             name: "台大校園",     icon: "🎓", x: 46, y: 67, drops: [] },
    { id: "xinyi",           name: "信義夜店區",   icon: "🥂", x: 76, y: 69, drops: [] },

    // 🌲 南部與外圍區域
    { id: "keelung",         name: "基隆廟口",     icon: "🐟", x: 24, y: 84, drops: [] },
    { id: "jiufen",          name: "九份老街",     icon: "🌧️", x: 53, y: 82, drops: [] },
    { id: "zoo",             name: "木柵動物園",   icon: "🦁", x: 80, y: 85, drops: [] }
  ]
};

window.GAME_MAPS = MAPS_DATA.zones;
if (typeof GAME_DATA !== 'undefined') {
  GAME_DATA.zones = MAPS_DATA.zones;
}
