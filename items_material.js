/**
 * 【資料模組：純工業與日常材料 items_material.js】
 * v53：確保所有地圖掉落材料皆有完整中文定義
 */
const MATERIALS_DATA = {
  items: {
    iron_nail: {
      id: "iron_nail",
      name: "生鏽鐵釘",
      type: "material",
      desc: "踩到會得破傷風。可以用來釘在折凳上改造出兇殘武器。"
    },
    battery: {
      id: "battery",
      name: "高壓電池",
      type: "material",
      desc: "蓄電量驚人的工業電池，感覺充滿了慣老闆的憤怒電流。"
    },
    tape: {
      id: "tape",
      name: "大力膠帶",
      type: "material",
      desc: "工程師與生存狂的信仰，萬物皆可黏，黏死不講理。"
    },
    wafer: {
      id: "wafer",
      name: "台積電晶圓",
      type: "material",
      desc: "護國神山產出的先進製程晶圓，帶在身上走路都非常有底氣。"
    },
    water_balloon: {
      id: "water_balloon",
      name: "質詢水球",
      type: "material",
      desc: "立法院質詢必備道具，裝滿了憤怒的口水。"
    },
    laser_pointer: {
      id: "laser_pointer",
      name: "高功率雷射筆",
      type: "material",
      desc: "簡報與演唱會常見的高亮綠光雷射筆，可用於精密瞄準。"
    }
  }
};
window.ITEMS_MATERIAL = MATERIALS_DATA.items;
