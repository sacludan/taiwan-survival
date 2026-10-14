/**
 * 【資料模組：地圖區域與相鄰路線 maps.js】
 * 結構：士林夜市 <-> 台北車站 <-> 立法院 / 竹科科技廠
 */
const MAPS_DATA = {
  zones: [
    { 
      id: "shilin", 
      name: "士林夜市", 
      neighbors: ["taipei_main"], // 只能去北車
      drops: ["sausage", "rice_sausage", "bubble_tea", "stinky_tofu"] 
    },
    { 
      id: "taipei_main", 
      name: "台北車站", 
      neighbors: ["shilin", "ly", "hsinchu"], // 交通樞紐：連接士林、立法院、竹科
      drops: ["iron_nail", "helmet", "tape", "bento"] 
    },
    { 
      id: "ly", 
      name: "立法院", 
      neighbors: ["taipei_main"], // 只能去北車
      drops: ["folding_chair", "megaphone", "water_balloon", "tape"] 
    },
    { 
      id: "hsinchu", 
      name: "竹科科技廠", 
      neighbors: ["taipei_main"], // 只能去北車
      drops: ["iron_nail", "battery", "wafer", "helmet"] 
    }
  ]
};
