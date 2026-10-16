/**
 * 【模組：地圖資料庫 maps.js】
 * v59：對齊妳指定的台北在地 22 區，並填入豐富的物資與數量配置
 */
const MAPS_DATA = {
  zones: [
    { 
      id: "ly", 
      name: "立法院", 
      icon: "🏛️", 
      x: 50, y: 52, 
      drops: ["protest_megaphone", "protest_megaphone", "protest_megaphone", "protest_megaphone", "plastic_stool", "plastic_stool", "plastic_stool", "plastic_stool", "plastic_stool", "netizen_cert", "netizen_cert", "paper", "paper", "paper", "paper", "paper", "paper", "pen", "pen", "pen", "pen", "pen", "red_pen", "red_pen", "red_pen", "money", "money", "money", "money", "newspaper", "newspaper", "newspaper", "newspaper", "newspaper", "shirt", "shirt", "shirt", "shirt", "yellow_vest", "yellow_vest", "yellow_vest", "water", "water", "water", "water"] 
    },
    { 
      id: "taipei101", 
      name: "台北101", 
      icon: "🏢", 
      x: 80, y: 57, 
      drops: ["money", "money", "money", "money", "money", "money", "wallpaper_stock", "wallpaper_stock", "wallpaper_stock", "wallpaper_stock", "wallpaper_stock", "deed", "deed", "jade_seal", "jade_seal", "whiskey", "whiskey", "whiskey", "whiskey", "shirt", "shirt", "shirt", "shirt", "reading_glasses", "reading_glasses", "reading_glasses", "fake_gold_chain", "fake_gold_chain", "fake_gold_chain", "pen", "pen", "pen", "pen", "red_pen", "red_pen", "red_pen", "water", "water", "water"] 
    },
    { 
      id: "guanghua", 
      name: "光華商場", 
      icon: "💻", 
      x: 48, y: 29, 
      drops: ["nano_wafer", "nano_wafer", "nano_wafer", "nano_wafer", "battery", "battery", "battery", "battery", "battery", "battery", "battery", "camera_module", "camera_module", "camera_module", "camera_module", "camera_module", "netizen_cert", "netizen_cert", "netizen_cert", "tape", "tape", "tape", "tape", "tape", "box_cutter", "box_cutter", "box_cutter", "box_cutter", "plastic_bag", "plastic_bag", "plastic_bag", "plastic_bag", "plastic_bag", "convenience_umbrella", "convenience_umbrella", "convenience_umbrella", "book", "book", "book", "sports_shorts", "sports_shorts", "sports_shorts"] 
    },
    { 
      id: "longshan_temple", 
      name: "龍山寺", 
      icon: "🏮", 
      x: 18, y: 58, 
      drops: ["amulet", "amulet", "amulet", "amulet", "amulet", "amulet", "incense", "incense", "incense", "incense", "incense", "incense", "joss_paper", "joss_paper", "joss_paper", "joss_paper", "joss_paper", "joss_paper", "robe", "robe", "robe", "robe", "robe", "red_thread", "red_thread", "red_thread", "red_thread", "cult_flyer", "cult_flyer", "cult_flyer", "ancestral_recipe", "wooden_stick", "wooden_stick", "wooden_stick", "wooden_stick", "straw_sandals", "straw_sandals", "straw_sandals", "straw_sandals", "grandpa_boxers", "grandpa_boxers", "grandpa_boxers", "reading_glasses", "reading_glasses", "reading_glasses"] 
    },
    { 
      id: "shilin", 
      name: "士林夜市", 
      icon: "🍢", 
      x: 16, y: 44, 
      drops: ["plastic_stool", "plastic_stool", "plastic_stool", "plastic_stool", "plastic_stool", "iron_pot", "iron_pot", "iron_pot", "iron_pot", "rusty_cleaver", "rusty_cleaver", "rusty_cleaver", "rusty_cleaver", "pork", "pork", "pork", "pork", "pork", "tofu", "tofu", "tofu", "tofu", "tofu", "egg", "egg", "egg", "egg", "egg", "garlic", "garlic", "garlic", "garlic", "garlic", "soy_sauce", "soy_sauce", "soy_sauce", "soy_sauce", "plastic_bag", "plastic_bag", "plastic_bag", "plastic_bag", "plastic_bag", "plastic_bag", "dirty_bracelet", "dirty_bracelet", "dirty_bracelet", "white_slippers", "white_slippers", "white_slippers", "white_slippers"] 
    },
    { 
      id: "ximen", 
      name: "西門町", 
      icon: "🎬", 
      x: 20, y: 71, 
      drops: ["cult_flyer", "cult_flyer", "cult_flyer", "cult_flyer", "cult_flyer", "dirty_bracelet", "dirty_bracelet", "dirty_bracelet", "dirty_bracelet", "dirty_bracelet", "fake_gold_chain", "fake_gold_chain", "fake_gold_chain", "fake_gold_chain", "sports_shorts", "sports_shorts", "sports_shorts", "sports_shorts", "sports_shorts", "convenience_umbrella", "convenience_umbrella", "convenience_umbrella", "convenience_umbrella", "lighter", "lighter", "lighter", "lighter", "lighter", "condom", "condom", "condom", "condom", "black_tea", "black_tea", "black_tea", "black_tea", "black_tea", "fresh_milk", "fresh_milk", "fresh_milk", "fresh_milk", "tape", "tape", "tape", "tape"] 
    },
    { 
      id: "ntu", 
      name: "台大校園", 
      icon: "🎓", 
      x: 46, y: 67, 
      drops: ["book", "book", "book", "book", "book", "book", "book", "paper", "paper", "paper", "paper", "paper", "paper", "pen", "pen", "pen", "pen", "pen", "pen", "red_pen", "red_pen", "red_pen", "red_pen", "love_pointer", "love_pointer", "love_pointer", "love_pointer", "shirt", "shirt", "shirt", "shirt", "shirt", "wooden_stick", "wooden_stick", "wooden_stick", "sports_shorts", "sports_shorts", "sports_shorts", "sports_shorts", "box_cutter", "box_cutter", "box_cutter", "box_cutter", "expired_milk", "expired_milk", "expired_milk", "water", "water", "water", "water"] 
    },
    { 
      id: "ntu_hospital", 
      name: "台大醫院", 
      icon: "🏥", 
      x: 40, y: 41, 
      drops: ["bandage", "bandage", "bandage", "bandage", "bandage", "bandage", "bandage", "bandage", "condom", "condom", "condom", "condom", "water", "water", "water", "water", "water", "expired_milk", "expired_milk", "expired_milk", "reading_glasses", "reading_glasses", "reading_glasses", "reading_glasses", "rubber_gloves", "rubber_gloves", "rubber_gloves", "rubber_gloves", "rubber_gloves", "robe", "robe", "robe", "robe", "white_slippers", "white_slippers", "white_slippers", "white_slippers", "paper", "paper", "paper", "paper", "pen", "pen", "pen"] 
    },
    { 
      id: "beitou", 
      name: "北投溫泉", 
      icon: "♨️", 
      x: 80, y: 9, 
      drops: ["dirty_towel", "dirty_towel", "dirty_towel", "dirty_towel", "dirty_towel", "dirty_towel", "water", "water", "water", "water", "water", "water", "water", "grandpa_boxers", "grandpa_boxers", "grandpa_boxers", "grandpa_boxers", "grandpa_boxers", "white_slippers", "white_slippers", "white_slippers", "white_slippers", "white_slippers", "egg", "egg", "egg", "egg", "egg", "whiskey", "whiskey", "whiskey", "cooking_wine", "cooking_wine", "cooking_wine", "cooking_wine", "sun_jacket", "sun_jacket", "sun_jacket", "sun_hat", "sun_hat", "sun_hat"] 
    },
    { 
      id: "yangmingshan", 
      name: "陽明山", 
      icon: "⛰️", 
      x: 82, y: 20, 
      drops: ["feather", "feather", "feather", "feather", "feather", "feather", "straw_hat", "straw_hat", "straw_hat", "straw_hat", "straw_hat", "straw_sandals", "straw_sandals", "straw_sandals", "straw_sandals", "straw_sandals", "rain_boots", "rain_boots", "rain_boots", "rain_boots", "wooden_stick", "wooden_stick", "wooden_stick", "wooden_stick", "wooden_stick", "sun_jacket", "sun_jacket", "sun_jacket", "sun_jacket", "sun_hat", "sun_hat", "sun_hat", "sun_hat", "cloth_gloves", "cloth_gloves", "cloth_gloves", "cloth_gloves", "water", "water", "water", "water", "water", "pork", "pork", "pork"] 
    },
    { 
      id: "tamsui", 
      name: "淡水老街", 
      icon: "🚢", 
      x: 22, y: 7, 
      drops: ["grandpa_boxers", "grandpa_boxers", "grandpa_boxers", "grandpa_boxers", "sun_hat", "sun_hat", "sun_hat", "sun_hat", "light_raincoat", "light_raincoat", "light_raincoat", "light_raincoat", "light_raincoat", "iron_pot", "iron_pot", "iron_pot", "egg", "egg", "egg", "egg", "tofu", "tofu", "tofu", "tofu", "soy_sauce", "soy_sauce", "soy_sauce", "soy_sauce", "red_thread", "red_thread", "red_thread", "fake_gold_chain", "fake_gold_chain", "fake_gold_chain", "straw_sandals", "straw_sandals", "straw_sandals"] 
    },
    { 
      id: "zoo", 
      name: "木柵動物園", 
      icon: "🦁", 
      x: 80, y: 85, 
      drops: ["feather", "feather", "feather", "feather", "feather", "feather", "sun_hat", "sun_hat", "sun_hat", "sun_hat", "sun_hat", "sun_jacket", "sun_jacket", "sun_jacket", "sun_jacket", "sun_jacket", "light_raincoat", "light_raincoat", "light_raincoat", "light_raincoat", "light_raincoat", "rain_boots", "rain_boots", "rain_boots", "rain_boots", "cloth_gloves", "cloth_gloves", "cloth_gloves", "cloth_gloves", "plastic_bag", "plastic_bag", "plastic_bag", "plastic_bag", "plastic_bag", "black_tea", "black_tea", "black_tea", "black_tea", "fresh_milk", "fresh_milk", "fresh_milk", "fresh_milk"] 
    },
    { 
      id: "taipeiarena", 
      name: "台北大巨蛋", 
      icon: "🏟️", 
      x: 66, y: 41, 
      drops: ["wooden_stick", "wooden_stick", "wooden_stick", "wooden_stick", "wooden_stick", "wooden_stick", "melon_helmet", "melon_helmet", "melon_helmet", "melon_helmet", "sports_shorts", "sports_shorts", "sports_shorts", "sports_shorts", "sports_shorts", "dirty_towel", "dirty_towel", "dirty_towel", "dirty_towel", "dirty_towel", "protest_megaphone", "protest_megaphone", "protest_megaphone", "polydar", "polydar", "polydar", "polydar", "battery", "battery", "battery", "battery", "tape", "tape", "tape", "tape", "water", "water", "water", "water", "water"] 
    },
    { 
      id: "songshan", 
      name: "松山機場", 
      icon: "✈️", 
      x: 84, y: 45, 
      drops: ["camera_module", "camera_module", "camera_module", "camera_module", "battery", "battery", "battery", "battery", "battery", "whiskey", "whiskey", "whiskey", "whiskey", "whiskey", "sun_jacket", "sun_jacket", "sun_jacket", "sun_jacket", "reading_glasses", "reading_glasses", "reading_glasses", "newspaper", "newspaper", "newspaper", "newspaper", "newspaper", "money", "money", "money", "money", "convenience_umbrella", "convenience_umbrella", "convenience_umbrella", "convenience_umbrella", "bandage", "bandage", "bandage"] 
    },
    { 
      id: "taipeistation", 
      name: "台北車站", 
      icon: "🚉", 
      x: 52, y: 5, 
      drops: ["newspaper", "newspaper", "newspaper", "newspaper", "newspaper", "newspaper", "newspaper", "paper", "paper", "paper", "paper", "paper", "convenience_umbrella", "convenience_umbrella", "convenience_umbrella", "convenience_umbrella", "convenience_umbrella", "yellow_vest", "yellow_vest", "yellow_vest", "yellow_vest", "yellow_vest", "dunga", "dunga", "dunga", "dunga", "dunga", "white_slippers", "white_slippers", "white_slippers", "white_slippers", "white_slippers", "rice", "rice", "rice", "rice", "rice", "pork", "pork", "pork", "pork", "egg", "egg", "egg", "egg", "water", "water", "water", "water", "water"] 
    },
    { 
      id: "xinyi", 
      name: "信義夜店區", 
      icon: "🥂", 
      x: 76, y: 69, 
      drops: ["whiskey", "whiskey", "whiskey", "whiskey", "whiskey", "whiskey", "condom", "condom", "condom", "condom", "condom", "condom", "money", "money", "money", "money", "money", "fake_gold_chain", "fake_gold_chain", "fake_gold_chain", "fake_gold_chain", "fake_gold_chain", "dirty_bracelet", "dirty_bracelet", "dirty_bracelet", "dirty_bracelet", "lighter", "lighter", "lighter", "lighter", "lighter", "lighter", "betel_nut", "betel_nut", "betel_nut", "betel_nut", "fresh_milk", "fresh_milk", "fresh_milk", "black_tea", "black_tea", "black_tea", "black_tea"] 
    },
    { 
      id: "sanchong", 
      name: "三重埔", 
      icon: "🌉", 
      x: 17, y: 31, 
      drops: ["exhaust_pipe", "exhaust_pipe", "exhaust_pipe", "exhaust_pipe", "exhaust_pipe", "exhaust_pipe", "melon_helmet", "melon_helmet", "melon_helmet", "melon_helmet", "melon_helmet", "melon_helmet", "betel_nut", "betel_nut", "betel_nut", "betel_nut", "betel_nut", "betel_nut", "quicklime", "quicklime", "quicklime", "quicklime", "quicklime", "dunga", "dunga", "dunga", "dunga", "dunga", "white_slippers", "white_slippers", "white_slippers", "white_slippers", "white_slippers", "rusty_nail", "rusty_nail", "rusty_nail", "rusty_nail", "rusty_nail", "scrap_iron", "scrap_iron", "scrap_iron", "scrap_iron", "wooden_stick", "wooden_stick", "wooden_stick", "wooden_stick", "lighter", "lighter", "lighter", "lighter", "lighter"] 
    },
    { 
      id: "wugu_ind", 
      name: "五股工業區", 
      icon: "🛠️", 
      x: 24, y: 84, 
      drops: ["rusty_nail", "rusty_nail", "rusty_nail", "rusty_nail", "rusty_nail", "rusty_nail", "rusty_nail", "scrap_iron", "scrap_iron", "scrap_iron", "scrap_iron", "scrap_iron", "scrap_iron", "scrap_iron", "cloth_gloves", "cloth_gloves", "cloth_gloves", "cloth_gloves", "cloth_gloves", "cloth_gloves", "cloth_gloves", "polydar", "polydar", "polydar", "polydar", "polydar", "polydar", "tape", "tape", "tape", "tape", "tape", "tape", "box_cutter", "box_cutter", "box_cutter", "box_cutter", "box_cutter", "exhaust_pipe", "exhaust_pipe", "exhaust_pipe", "exhaust_pipe", "rain_boots", "rain_boots", "rain_boots", "rain_boots", "iron_pot", "iron_pot", "iron_pot"] 
    },
    { 
      id: "keelung", 
      name: "基隆廟口", 
      icon: "🐟", 
      x: 53, y: 82, 
      drops: ["rusty_cleaver", "rusty_cleaver", "rusty_cleaver", "rusty_cleaver", "rusty_cleaver", "iron_pot", "iron_pot", "iron_pot", "iron_pot", "pork", "pork", "pork", "pork", "pork", "rice", "rice", "rice", "rice", "rice", "garlic", "garlic", "garlic", "garlic", "garlic", "soy_sauce", "soy_sauce", "soy_sauce", "soy_sauce", "soy_sauce", "cooking_wine", "cooking_wine", "cooking_wine", "cooking_wine", "cooking_wine", "rubber_gloves", "rubber_gloves", "rubber_gloves", "rubber_gloves", "rain_boots", "rain_boots", "rain_boots", "rain_boots", "incense", "incense", "incense", "incense"] 
    },
    { 
      id: "jiufen", 
      name: "九份老街", 
      icon: "🌧️", 
      x: 53, y: 82, 
      drops: ["light_raincoat", "light_raincoat", "light_raincoat", "light_raincoat", "light_raincoat", "light_raincoat", "straw_hat", "straw_hat", "straw_hat", "straw_hat", "straw_hat", "robe", "robe", "robe", "robe", "ancestral_recipe", "ancestral_recipe", "black_tea", "black_tea", "black_tea", "black_tea", "black_tea", "amulet", "amulet", "amulet", "amulet", "joss_paper", "joss_paper", "joss_paper", "joss_paper", "incense", "incense", "incense", "incense", "straw_sandals", "straw_sandals", "straw_sandals", "straw_sandals"] 
    },
    { 
      id: "neihu", 
      name: "內湖科學園區", 
      icon: "🖥️", 
      x: 80, y: 32, 
      drops: ["nano_wafer", "nano_wafer", "nano_wafer", "nano_wafer", "nano_wafer", "nano_wafer", "battery", "battery", "battery", "battery", "battery", "battery", "camera_module", "camera_module", "camera_module", "camera_module", "camera_module", "wallpaper_stock", "wallpaper_stock", "wallpaper_stock", "wallpaper_stock", "wallpaper_stock", "netizen_cert", "netizen_cert", "netizen_cert", "shirt", "shirt", "shirt", "shirt", "reading_glasses", "reading_glasses", "reading_glasses", "red_pen", "red_pen", "red_pen", "red_pen", "expired_milk", "expired_milk", "expired_milk"] 
    },
    { 
      id: "market", 
      name: "果菜批發市場", 
      icon: "🥬", 
      x: 20, y: 58, 
      drops: ["rice", "rice", "rice", "rice", "rice", "rice", "rice", "pork", "pork", "pork", "pork", "pork", "pork", "tofu", "tofu", "tofu", "tofu", "tofu", "tofu", "egg", "egg", "egg", "egg", "egg", "egg", "garlic", "garlic", "garlic", "garlic", "garlic", "garlic", "betel_nut", "betel_nut", "betel_nut", "betel_nut", "betel_nut", "quicklime", "quicklime", "quicklime", "quicklime", "quicklime", "polydar", "polydar", "polydar", "polydar", "polydar", "yellow_vest", "yellow_vest", "yellow_vest", "yellow_vest", "plastic_bag", "plastic_bag", "plastic_bag", "plastic_bag", "plastic_bag", "plastic_bag", "deed"] 
    }
  ]
};

window.GAME_MAPS = MAPS_DATA.zones;
if (typeof GAME_DATA !== 'undefined') {
  GAME_DATA.zones = MAPS_DATA.zones;
}
