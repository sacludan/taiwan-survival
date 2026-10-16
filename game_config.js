/**
 * 【總合配置檔 game_config.js】
 */
const GAME_DATA = {
  get zones() {
    return (typeof MAPS_DATA !== 'undefined' && MAPS_DATA.zones) ? MAPS_DATA.zones : [];
  },
  get recipes() {
    return (typeof RECIPES_DATA !== 'undefined' && RECIPES_DATA.recipes) ? RECIPES_DATA.recipes : [];
  },
  get items() {
    return Object.assign({},
      (typeof WEAPONS_DATA !== 'undefined' && WEAPONS_DATA.items) ? WEAPONS_DATA.items : {},
      (typeof ARMORS_DATA !== 'undefined' && ARMORS_DATA.items) ? ARMORS_DATA.items : {},
      (typeof MATERIALS_DATA !== 'undefined' && MATERIALS_DATA.items) ? MATERIALS_DATA.items : {},
      (typeof FOODS_DATA !== 'undefined' && FOODS_DATA.items) ? FOODS_DATA.items : {},
      (window.ITEMS_WEAPON || {}),
      (window.ITEMS_ARMOR || {}),
      (window.ITEMS_MATERIAL || {}),
      (window.ITEMS_FOOD || {})
    );
  }
};
