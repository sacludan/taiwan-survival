/**
 * 【模組：地圖資料庫 maps.js】
 * v58：保留 22 區座標與圖示，清空舊版 drops 物資等待重新設計
 */
const MAPS_DATA = {
  zones: [
    // 🌊 北部海岸與山洞
    { id: "baishawan",       name: "白沙灣",           icon: "🏖️", x: 22, y: 7,  drops: [] },
    { id: "fugui_cape",      name: "富貴角燈塔",       icon: "🚨", x: 52, y: 5,  drops: [] },
    { id: "beitou",          name: "北投地熱谷",       icon: "♨️", x: 80, y: 9,  drops: [] },

    { id: "dadaocheng",      name: "大稻埕碼頭",       icon: "⚓", x: 18, y: 18, drops: [] },
    { id: "grand_hotel",     name: "圓山大飯店",       icon: "🏯", x: 50, y: 17, drops: [] },
    { id: "qingtian",        name: "陽明山擎天崗",     icon: "⛰️", x: 82, y: 20, drops: [] },

    // 🏙️ 內陸都會北段
    { id: "wugu_ind",        name: "五股工業區",       icon: "🏭", x: 17, y: 31, drops: [] },
    { id: "zhitong_tunnel",  name: "自強隧道",         icon: "🚇", x: 48, y: 29, drops: [] },
    { id: "defense_dept",    name: "國防部",           icon: "🎖️", x: 80, y: 32, drops: [] },

    // 🏛️ 中央盆地圈
    { id: "ximen",           name: "西門町",           icon: "🛍️", x: 16, y: 44, drops: [] },
    { id: "ntu_hospital",    name: "臺大醫院",         icon: "🏥", x: 40, y: 41, drops: [] },
    { id: "jinan_church",    name: "濟南教會",         icon: "⛪", x: 66, y: 41, drops: [] },
    { id: "minsheng",        name: "民生社區",         icon: "🏘️", x: 84, y: 45, drops: [] },

    // 🏛️ 立法院
    { id: "ly",              name: "立法院",           icon: "🏛️", x: 50, y: 52, drops: [] },

    // 🏮 中南段城區
    { id: "longshan_temple", name: "艋舺龍山寺",       icon: "🏮", x: 18, y: 58, drops: [] },
    { id: "taipei_gov",      name: "台北市政府",       icon: "🏢", x: 80, y: 57, drops: [] },

    { id: "bopiliao",        name: "剝皮寮",           icon: "🧱", x: 20, y: 71, drops: [] },
    { id: "ck_high",         name: "建國中學",         icon: "🏫", x: 46, y: 67, drops: [] },
    { id: "xinyi_fire",      name: "信義消防分隊",     icon: "🚒", x: 76, y: 69, drops: [] },

    // 🌲 南部森林與公墓
    { id: "daan_park",       name: "大安森林公園",     icon: "🌳", x: 24, y: 84, drops: [] },
    { id: "liuzhangli",      name: "六張犁公墓",       icon: "🪦", x: 53, y: 82, drops: [] },
    { id: "xiangshan",       name: "象山步道",         icon: "🌲", x: 80, y: 85, drops: [] }
  ]
};

window.GAME_MAPS = MAPS_DATA.zones;
if (typeof GAME_DATA !== 'undefined') {
  GAME_DATA.zones = MAPS_DATA.zones;
}
