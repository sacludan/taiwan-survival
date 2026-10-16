/**
 * 【模組：地圖資料庫 maps.js】
 * 台北生存島 22 區黃金比例視覺排版版
 */
const MAPS_DATA = {
  zones: [
    // ── 【北部區域：淡水、北投、陽明山、車站】 ──
    { id: "tamsui", name: "淡水老街", icon: "🚢", x: 20, y: 12, drops: ["grandpa_boxers", "sun_hat", "light_raincoat", "iron_pot", "egg", "tofu", "soy_sauce", "red_thread", "fake_gold_chain", "straw_sandals"] },
    { id: "taipeistation", name: "台北車站", icon: "🚉", x: 48, y: 10, drops: ["newspaper", "paper", "convenience_umbrella", "yellow_vest", "dunga", "white_slippers", "rice", "pork", "egg", "water"] },
    { id: "beitou", name: "北投溫泉", icon: "♨️", x: 78, y: 12, drops: ["dirty_towel", "water", "grandpa_boxers", "white_slippers", "egg", "whiskey", "cooking_wine", "sun_jacket", "sun_hat"] },
    { id: "yangmingshan", name: "陽明山", icon: "⛰️", x: 80, y: 25, drops: ["feather", "straw_hat", "straw_sandals", "rain_boots", "wooden_stick", "sun_jacket", "sun_hat", "cloth_gloves", "water", "pork"] },

    // ── 【中北部區域：三重、光華、內科、松山】 ──
    { id: "sanchong", name: "三重埔", icon: "🌉", x: 20, y: 28, drops: ["exhaust_pipe", "melon_helmet", "betel_nut", "quicklime", "dunga", "white_slippers", "rusty_nail", "scrap_iron", "wooden_stick", "lighter"] },
    { id: "guanghua", name: "光華商場", icon: "💻", x: 48, y: 28, drops: ["nano_wafer", "battery", "camera_module", "netizen_cert", "tape", "box_cutter", "plastic_bag", "convenience_umbrella", "book", "sports_shorts"] },
    { id: "neihu", name: "內湖科學園區", icon: "🖥️", x: 80, y: 36, drops: ["nano_wafer", "battery", "camera_module", "wallpaper_stock", "netizen_cert", "shirt", "reading_glasses", "red_pen", "expired_milk"] },
    { id: "songshan", name: "松山機場", icon: "✈️", x: 82, y: 48, drops: ["camera_module", "battery", "whiskey", "sun_jacket", "reading_glasses", "newspaper", "money", "convenience_umbrella", "bandage"] },

    // ── 【中西部與中央樞紐：士林、台大醫院、大巨蛋、立法院】 ──
    { id: "shilin", name: "士林夜市", icon: "🍢", x: 18, y: 42, drops: ["plastic_stool", "iron_pot", "rusty_cleaver", "pork", "tofu", "egg", "garlic", "soy_sauce", "plastic_bag", "dirty_bracelet", "white_slippers"] },
    { id: "ntu_hospital", name: "台大醫院", icon: "🏥", x: 38, y: 42, drops: ["bandage", "condom", "water", "expired_milk", "reading_glasses", "rubber_gloves", "robe", "white_slippers", "paper", "pen"] },
    { id: "taipeiarena", name: "台北大巨蛋", icon: "🏟️", x: 62, y: 42, drops: ["wooden_stick", "melon_helmet", "sports_shorts", "dirty_towel", "protest_megaphone", "polydar", "battery", "tape", "water"] },
    { id: "ly", name: "立法院", icon: "🏛️", x: 50, y: 52, drops: ["protest_megaphone", "plastic_stool", "netizen_cert", "paper", "pen", "red_pen", "money", "newspaper", "shirt", "yellow_vest", "water"] },

    // ── 【中南部區域：果菜市場、台北101】 ──
    { id: "market", name: "果菜批發市場", icon: "🥬", x: 20, y: 56, drops: ["rice", "pork", "tofu", "egg", "garlic", "betel_nut", "quicklime", "polydar", "yellow_vest", "plastic_bag", "deed"] },
    { id: "taipei101", name: "台北101", icon: "🏢", x: 80, y: 58, drops: ["money", "wallpaper_stock", "deed", "jade_seal", "whiskey", "shirt", "reading_glasses", "fake_gold_chain", "pen", "red_pen", "water"] },

    // ── 【南部學區與商圈：龍山寺、台大、信義】 ──
    { id: "longshan_temple", name: "龍山寺", icon: "🏮", x: 18, y: 68, drops: ["amulet", "incense", "joss_paper", "robe", "red_thread", "cult_flyer", "ancestral_recipe", "wooden_stick", "straw_sandals", "grandpa_boxers", "reading_glasses"] },
    { id: "ntu", name: "台大校園", icon: "🎓", x: 45, y: 68, drops: ["book", "paper", "pen", "red_pen", "love_pointer", "shirt", "wooden_stick", "sports_shorts", "box_cutter", "expired_milk", "water"] },
    { id: "xinyi", name: "信義夜店區", icon: "🥂", x: 78, y: 70, drops: ["whiskey", "condom", "money", "fake_gold_chain", "dirty_bracelet", "lighter", "betel_nut", "fresh_milk", "black_tea"] },

    // ── 【最南部環狀線：西門、五股、基隆、九份、木柵】 ──
    { id: "ximen", name: "西門町", icon: "🎬", x: 18, y: 80, drops: ["cult_flyer", "dirty_bracelet", "fake_gold_chain", "sports_shorts", "convenience_umbrella", "lighter", "condom", "black_tea", "fresh_milk", "tape"] },
    { id: "wugu_ind", name: "五股工業區", icon: "🛠️", x: 35, y: 80, drops: ["rusty_nail", "scrap_iron", "cloth_gloves", "polydar", "tape", "box_cutter", "exhaust_pipe", "rain_boots", "iron_pot"] },
    { id: "keelung", name: "基隆廟口", icon: "🐟", x: 52, y: 80, drops: ["rusty_cleaver", "iron_pot", "pork", "rice", "garlic", "soy_sauce", "cooking_wine", "rubber_gloves", "rain_boots", "incense"] },
    { id: "jiufen", name: "九份老街", icon: "🌧️", x: 68, y: 80, drops: ["light_raincoat", "straw_hat", "robe", "ancestral_recipe", "black_tea", "amulet", "joss_paper", "incense", "straw_sandals"] },
    { id: "zoo", name: "木柵動物園", icon: "🦁", x: 84, y: 80, drops: ["feather", "sun_hat", "sun_jacket", "light_raincoat", "rain_boots", "cloth_gloves", "plastic_bag", "black_tea", "fresh_milk"] }
  ]
};

window.GAME_MAPS = MAPS_DATA.zones;
if (typeof GAME_DATA !== 'undefined') {
  GAME_DATA.zones = MAPS_DATA.zones;
}
