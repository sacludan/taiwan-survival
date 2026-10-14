/**
 * 【總合配置檔 game_config.js】
 * 將地圖、角色、武器、防具、材料、小吃、合成公式全部自動合併成統一的 GAME_DATA
 */
const GAME_DATA = {
  zones: MAPS_DATA.zones,
  initialPlayer: CHARACTERS_DATA.initialPlayer,
  initialAI: CHARACTERS_DATA.initialAI,
  recipes: RECIPES_DATA.recipes,
  items: {
    ...WEAPONS_DATA.items,
    ...ARMORS_DATA.items,
    ...MATERIALS_DATA.items,
    ...FOODS_DATA.items
  }
};
