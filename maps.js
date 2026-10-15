/**
 * 【模組：地圖資料庫 maps.js】
 * v52：完整 22 個台北實名指標地標（中央核心立法院 + 21 個戰術區域）
 */
window.GAME_MAPS = [
  // 0. 核心特區（中央決賽點）
  { id: "ly", name: "立法院", region: "central", drops: ["plastic_chair", "megaphone", "water_balloon", "tape", "bento"] },

  // 北部 / 海岸水域線
  { id: "baishawan", name: "白沙灣", region: "north", drops: ["plastic_chair", "water_balloon", "tape"] },
  { id: "fugui_cape", name: "富貴角燈塔", region: "north", drops: ["battery", "laser_pointer", "tape"] },
  { id: "dadaocheng", name: "大稻埕碼頭", region: "north", drops: ["battery", "tape", "box_cutter"] },
  { id: "beitou", name: "北投地熱谷", region: "north", drops: ["water_balloon", "tape", "battery"] },
  { id: "zhitong_tunnel", name: "自強隧道", region: "north", drops: ["melon_helmet", "battery", "box_cutter"] },

  // 西區 / 傳統老街文教線
  { id: "bopiliao", name: "剝皮寮", region: "west", drops: ["plastic_chair", "tape", "bento"] },
  { id: "longshan_temple", name: "艋舺龍山寺", region: "west", drops: ["water_balloon", "tape", "sausage"] },
  { id: "ximen", name: "西門町", region: "west", drops: ["milk_tea", "tape", "box_cutter"] },
  { id: "ntu_hospital", name: "臺大醫院", region: "west", drops: ["water_balloon", "tape", "battery"] },
  { id: "ck_high", name: "建國中學", region: "west", drops: ["laser_pointer", "tape", "bento"] },

  // 東區 / 都會政經休閒線
  { id: "taipei_gov", name: "台北市政府", region: "east", drops: ["box_cutter", "tape", "bento"] },
  { id: "xinyi_fire", name: "信義消防分隊", region: "east", drops: ["melon_helmet", "water_balloon", "tape"] },
  { id: "minsheng", name: "民生社區", region: "east", drops: ["plastic_chair", "tape", "milk_tea"] },
  { id: "grand_hotel", name: "圓山大飯店", region: "east", drops: ["sausage", "sticky_rice_sausage", "milk_tea"] },
  { id: "defense_dept", name: "國防部", region: "east", drops: ["laser_pointer", "battery", "melon_helmet"] },
  { id: "jinan_church", name: "濟南基督長老教會", region: "east", drops: ["water_balloon", "plastic_chair", "bento"] },
  { id: "daan_park", name: "大安森林公園", region: "east", drops: ["plastic_chair", "water_balloon", "sausage"] },

  // 南部 / 山區步道公墓線
  { id: "qingtian", name: "陽明山擎天崗", region: "south", drops: ["plastic_chair", "water_balloon", "umbrella"] },
  { id: "xiangshan", name: "象山步道", region: "south", drops: ["umbrella", "water_balloon", "battery"] },
  { id: "wugu_ind", name: "五股工業區", region: "south", drops: ["battery", "tape", "box_cutter"] },
  { id: "liuzhangli", name: "六張犁公墓", region: "south", drops: ["umbrella", "tape", "battery"] }
];

// 相容全域資料
if (typeof GAME_DATA !== 'undefined') {
  GAME_DATA.zones = window.GAME_MAPS;
}
