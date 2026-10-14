/**
 * 【總合配置檔 game_config.js】
 * 確保安全無虞地將所有獨立資料模組組合為全域 GAME_DATA
 */
const GAME_DATA = {
  zones: (typeof MAPS_DATA !== 'undefined' && MAPS_DATA.zones) ? MAPS_DATA.zones : [],
  initialPlayer: (typeof CHARACTERS_DATA !== 'undefined' && CHARACTERS_DATA.initialPlayer) ? CHARACTERS_DATA.initialPlayer : {},
  initialAI: (typeof CHARACTERS_DATA !== 'undefined' && CHARACTERS_DATA.initialAI) ? CHARACTERS_DATA.initialAI : {},
  recipes: (typeof RECIPES_DATA !== 'undefined' && RECIPES_DATA.recipes) ? RECIPES_DATA.recipes : [],
  items: {
    ...((typeof WEAPONS_DATA !== 'undefined' && WEAPONS_DATA.items) ? WEAPONS_DATA.items : {}),
    ...((typeof ARMORS_DATA !== 'undefined' && ARMORS_DATA.items) ? ARMORS_DATA.items : {}),
    ...((typeof MATERIALS_DATA !== 'undefined' && MATERIALS_DATA.items) ? MATERIALS_DATA.items : {}),
    ...((typeof FOODS_DATA !== 'undefined' && FOODS_DATA.items) ? FOODS_DATA.items : {})
  }
};
