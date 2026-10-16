/**
 * 【總合配置檔 game_config.js】
 * v58：對齊清空後的道具與配方池
 */
const GAME_DATA = {
  zones: (typeof MAPS_DATA !== 'undefined' && MAPS_DATA.zones) ? MAPS_DATA.zones : [
    { id: "ly", name: "立法院", icon: "🏛️", x: 50, y: 52, drops: [] }
  ],
  recipes: (typeof RECIPES_DATA !== 'undefined' && RECIPES_DATA.recipes) ? RECIPES_DATA.recipes : [],
  items: Object.assign({},
    (typeof WEAPONS_DATA !== 'undefined' && WEAPONS_DATA.items) ? WEAPONS_DATA.items : {},
    (typeof ARMORS_DATA !== 'undefined' && ARMORS_DATA.items) ? ARMORS_DATA.items : {},
    (typeof MATERIALS_DATA !== 'undefined' && MATERIALS_DATA.items) ? MATERIALS_DATA.items : {},
    (typeof FOODS_DATA !== 'undefined' && FOODS_DATA.items) ? FOODS_DATA.items : {}
  )
};
