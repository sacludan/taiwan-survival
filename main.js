/**
 * 【主引擎與 UI 控制核心 main.js】
 * 負責：全域狀態、每秒計時迴圈、90秒縮圈、探索搜刮（含資源枯竭）、地圖移動、6格裝備與背包、合成與圖鑑、拖曳系統
 */

// ==========================================
// 1. 統一物品查詢與稀有度註冊表 (ItemRegistry)
// ==========================================
const ItemRegistry = {
  ALIAS: {
    "cloth": "talisman",
    "thick_cloth": "peace_amulet",
    "wood": "wooden_stick",
    "iron_sheet": "scrap_iron",
    "thick_paper": "election_ballot",
    "plastic": "plastic_bag",
    "glass": "camera_module",
    "alcohol": "cooking_wine",
    "scooter_Send": "exhaust_pipe",
    " circuit_board": "wafer",
    "circuit_board": "wafer",
    "herb": "incense",
    "feather": "feather",
    "gov_vest": "legislative_vest"
  },

  RARITY_MAP: {
    // 1階 (⚪ 普通)
    "wooden_stick": 1, "plastic_stool": 1, "rusty_cleaver": 1, "protest_megaphone": 1,
    "melon_helmet": 1, "reading_glasses": 1, "yellow_vest": 1, "light_raincoat": 1,
    "cloth_gloves": 1, "white_slippers": 1, "netizen_cert": 1, "dirty_bracelet": 1,
    "talisman": 1, "scrap_iron": 1, "paper": 1, "plastic_bag": 1, "camera_module": 1,
    "cooking_wine": 1, "exhaust_pipe": 1, "wafer": 1, "incense": 1, "feather": 1,
    "water": 1, "rice": 1, "pork": 1, "betel_nut": 1, "bandage": 1,

    // 2階 (🟢 精良)
    "wolf_bat": 2, "spiked_stool": 2, "opening_machete": 2, "mod_megaphone": 2,
    "sticker_helmet": 2, "wind_goggles": 2, "clean_vest": 2, "reflective_vest": 2,
    "taoist_robe": 2, "insulated_gloves": 2, "pot_shield": 2, "nonslip_slippers": 2,
    "guard_medal": 2, "pretty_bracelet": 2, "peace_amulet": 2, "iron_plate": 2,
    "election_ballot": 2, "nano_wafer": 2, "dash_cam": 2, "mod_exhaust": 2,
    "century_ash": 2, "explosive_bomb": 2, "pork_bento": 2, "kaoliang": 2,
    "double_betel_nut": 2, "survival_pack": 2,

    // 3階 (🔵 稀有)
    "aluminum_bat": 3, "iron_stool": 3, "shark_sword": 3, "village_megaphone": 3,
    "wind_helmet": 3, "purple_cult_robe": 3, "legislative_vest": 3, "tsmc_vest": 3,
    "thick_iron_armor": 3, "engineer_wrist": 3, "protest_shield": 3, "enhanced_slippers": 3,
    "party_card": 3, "grandma_bracelet": 3, "blessed_amulet": 3, "taiwan_value": 3,
    "legislative_bento": 3, "energy_drink": 3,

    // 4階 (🟡 史詩)
    "taichung_bat": 4, "overlord_stool": 4, "ly_thunder_megaphone": 4,
    "full_helmet": 4, "eight_generals_helm": 4, "purple_down": 4, "yellow_robe": 4,
    "tsmc_suit": 4, "engineer_armor": 4, "riot_shield": 4, "studded_slippers": 4,
    "senior_party_card": 4, "mazu_amulet": 4,

    // 5階 (🔴 傳說)
    "mythic_stool": 5, "mazu_helmet": 5, "grandma_jacket": 5,
    "nano_arm": 5, "grandma_slippers": 5, "ultimate_party_card": 5
  },

  RARITY_STYLE: {
    1: { tier: 1, label: "普通", color: "⚪", border: "border-slate-600/80", bg: "bg-slate-900/90", text: "text-slate-200", badge: "bg-slate-800 text-slate-300 border-slate-600" },
    2: { tier: 2, label: "精良", color: "🟢", border: "border-emerald-500/80", bg: "bg-emerald-950/50", text: "text-emerald-300", badge: "bg-emerald-950 text-emerald-300 border-emerald-500/60" },
    3: { tier: 3, label: "稀有", color: "🔵", border: "border-sky-500/80", bg: "bg-sky-950/50", text: "text-sky-300", badge: "bg-sky-950 text-sky-300 border-sky-500/60" },
    4: { tier: 4, label: "史詩", color: "🟡", border: "border-amber-400/90", bg: "bg-amber-950/50", text: "text-amber-300", badge: "bg-amber-950 text-amber-300 border-amber-400/70" },
    5: { tier: 5, label: "傳說", color: "🔴", border: "border-rose-500", bg: "bg-rose-950/60", text: "text-rose-300", badge: "bg-rose-950 text-rose-300 border-rose-500/80" }
  },

  get(itemId) {
    if (!itemId) return null;
    const resolvedId = this.ALIAS[itemId] || itemId;
    if (typeof GAME_DATA !== 'undefined' && GAME_DATA.items && GAME_DATA.items[resolvedId]) {
      return GAME_DATA.items[resolvedId];
    }
    const pools = [window.ITEMS_WEAPON, window.ITEMS_ARMOR, window.ITEMS_MATERIAL, window.ITEMS_FOOD];
    for (const pool of pools) {
      if (pool && pool[resolvedId]) return pool[resolvedId];
    }
    return null;
  },

  getName(itemId) {
    const item = this.get(itemId);
    return item ? item.name : String(itemId || "未知物資");
  },

  getRarity(itemId) {
    const resolvedId = this.ALIAS[itemId] || itemId;
    const item = this.get(resolvedId);
    const tier = (item && item.rarity) ? item.rarity : (this.RARITY_MAP[resolvedId] || 1);
    return this.RARITY_STYLE[tier] || this.RARITY_STYLE[1];
  },

  getAllItems() {
    if (typeof GAME_DATA !== 'undefined' && GAME_DATA.items && Object.keys(GAME_DATA.items).length > 0) {
      return GAME_DATA.items;
    }
    return Object.assign({}, window.ITEMS_WEAPON || {}, window.ITEMS_ARMOR || {}, window.ITEMS_MATERIAL || {}, window.ITEMS_FOOD || {});
  }
};

function getSafeItem(itemId) {
  return ItemRegistry.get(itemId);
}

function getItemDisplayName(itemId) {
  return ItemRegistry.getName(itemId);
}

function getSafeZones() {
  if (state && Array.isArray(state.activeZones) && state.activeZones.length > 0) {
    return state.activeZones;
  }
  if (typeof GAME_DATA !== 'undefined' && Array.isArray(GAME_DATA.zones) && GAME_DATA.zones.length > 0) {
    return GAME_DATA.zones;
  }
  if (typeof MAPS_DATA !== 'undefined' && Array.isArray(MAPS_DATA.zones) && MAPS_DATA.zones.length > 0) {
    return MAPS_DATA.zones;
  }
  return [{ id: "ly", name: "立法院", icon: "🏛️", x: 50, y: 52, drops: [], initialDrops: [] }];
}

function getSafeCurrentZone(zoneId) {
  const zones = getSafeZones();
  return zones.find(z => z.id === zoneId) || zones[0] || { id: "ly", name: "立法院", icon: "🏛️", x: 50, y: 52, drops: [], initialDrops: [] };
}

function getSafeRecipes() {
  if (typeof GAME_DATA !== 'undefined' && Array.isArray(GAME_DATA.recipes) && GAME_DATA.recipes.length > 0) {
    return GAME_DATA.recipes;
  }
  if (typeof RECIPES_DATA !== 'undefined' && Array.isArray(RECIPES_DATA.recipes)) {
    return RECIPES_DATA.recipes;
  }
  return [];
}

// ==========================================
// 2. 開發模式與全域遊戲狀態 (State)
// ==========================================
const DEV_CONFIG = {
  mode: "normal",
  enableShrink: true,
  enableNPC: true
};

const state = {
  timeSec: 0,
  round: 1,
  roundTimeRemain: 90,
  closedZones: [],
  pendingCloseZones: [],
  activeZones: [],
  inCombat: false,
  isSearching: false,
  gameOver: false,
  trackedItemId: null,
  craftBookFilter: "all",
  dragSource: null,
  player: null,
  ai: null,
  ais: [],
  logs: []
};

let mainTimer = null;

// ==========================================
// 3. 角色建立與數值計算
// ==========================================
function createCharacterEntity(charId, isPlayer = false, spawnZoneId = "ly") {
  const roster = (typeof CHARACTERS_DATA !== 'undefined' && CHARACTERS_DATA.roster) ? CHARACTERS_DATA.roster : {};
  const tpl = roster[charId] || Object.values(roster)[0] || {
    id: charId,
    name: "生存者",
    hp: 120,
    sp: 100,
    atk: 12,
    def: 10,
    skill: { name: "爆發", sp: 20, cd: 15, desc: "造成傷害" },
    passive: { name: "求生", desc: "無" }
  };

  return {
    id: tpl.id,
    name: tpl.name,
    title: tpl.title || "",
    isPlayer: isPlayer,
    alive: true,
    zone: spawnZoneId,
    hp: tpl.hp,
    maxHp: tpl.hp,
    sp: tpl.sp,
    maxSp: tpl.sp,
    baseAtk: tpl.atk,
    baseDef: tpl.def,
    skill: { ...tpl.skill },
    passive: { ...tpl.passive },
    skillCdRemain: 0,

    // 狀態與被動計數器
    stunRemain: 0,
    stealthRemain: 0,
    reflectRemain: 0,
    milkDefBuffRemain: 0,
    weakenedRemain: 0,
    dodgeReady: (tpl.id === "jiangwanan"),
    dodgeCdRemain: 0,
    hitTakenCount: 0,
    gongdeStacks: 0,
    pigBrosUsed: false,
    streamTriggered: false,

    equip: {
      weapon: null,
      head: null,
      chest: null,
      arm: null,
      leg: null,
      acc: null
    },
    bag: []
  };
}

function getTotalAtk(entity) {
  if (!entity) return 0;
  let total = entity.baseAtk || 10;

  if (entity.equip) {
    Object.values(entity.equip).forEach(item => {
      if (item && item.atk) total += item.atk;
    });
  }

  if (entity.id === "laixiangde" && entity.gongdeStacks > 0) {
    total += entity.gongdeStacks;
  }

  if (entity.weakenedRemain > 0) {
    total = Math.max(1, Math.floor(total * 0.5));
  }

  return total;
}

function isChaoGeAuraAffecting(entity) {
  if (!entity || entity.id === "chaoge") return false;
  if (state.player && state.player.alive && state.player.id === "chaoge" && state.player.zone === entity.zone) {
    return true;
  }
  if (state.ais && state.ais.some(a => a && a.alive && a.id === "chaoge" && a.zone === entity.zone)) {
    return true;
  }
  return false;
}

function getTotalDef(entity) {
  if (!entity) return 0;
  let total = entity.baseDef || 5;

  if (entity.equip) {
    Object.values(entity.equip).forEach(item => {
      if (item && item.def) total += item.def;
    });
  }

  if (entity.milkDefBuffRemain > 0) {
    total += 5;
  }

  if (isChaoGeAuraAffecting(entity)) {
    total = Math.floor(total * 0.8);
  }

  return Math.max(0, total);
}

// ==========================================
// 4. 遊戲初始化 (initGame)
// ==========================================
function initGame(mode = "normal", selectedCharId = "zhugouliang", customBotIds = null) {
  if (mainTimer) clearInterval(mainTimer);

  DEV_CONFIG.mode = mode;
  DEV_CONFIG.enableShrink = (mode === "normal");
  DEV_CONFIG.enableNPC = (mode !== "sandbox");

  state.timeSec = 0;
  state.round = 1;
  state.roundTimeRemain = 90;
  state.closedZones = [];
  state.pendingCloseZones = [];
  state.inCombat = false;
  state.isSearching = false;
  state.gameOver = false;
  state.trackedItemId = null;
  state.logs = [];
  state.ai = null;

  // 深拷貝每區物資池作為當局有限消耗池 (drops)，並保留固定不重複種類清單 (initialDrops)
  const fullMaps = (typeof MAPS_DATA !== 'undefined' && Array.isArray(MAPS_DATA.zones)) ? MAPS_DATA.zones : [];
  const cloneZoneWithFinitePool = (z) => ({
    ...z,
    drops: [...(z.drops || [])],
    initialDrops: [...new Set(z.drops || [])]
  });

  if (mode === "char_test") {
    const lyZone = fullMaps.find(z => z.id === "ly") || { id: "ly", name: "立法院", icon: "🏛️", x: 50, y: 52, drops: [] };
    state.activeZones = [cloneZoneWithFinitePool(lyZone)];
  } else {
    state.activeZones = fullMaps.map(cloneZoneWithFinitePool);
  }

  const zones = getSafeZones();
  const startZone = zones.find(z => z.id === "ly") || zones[0];

  state.player = createCharacterEntity(selectedCharId, true, startZone.id);

  // 建立 AI 對手
  state.ais = [];
  const rosterKeys = (typeof CHARACTERS_DATA !== 'undefined' && CHARACTERS_DATA.roster)
    ? Object.keys(CHARACTERS_DATA.roster).filter(k => k !== selectedCharId)
    : [];

  if (mode === "normal") {
    rosterKeys.forEach(botId => {
      const randZone = zones[Math.floor(Math.random() * zones.length)];
      state.ais.push(createCharacterEntity(botId, false, randZone.id));
    });
  } else if (mode === "char_test") {
    const botList = Array.isArray(customBotIds) ? customBotIds : rosterKeys;
    botList.forEach(botId => {
      if (botId !== selectedCharId) {
        state.ais.push(createCharacterEntity(botId, false, "ly"));
      }
    });
  }

  if (DEV_CONFIG.enableShrink) {
    pickNextPendingZones(4);
  }

  const logEl = document.getElementById("game-log");
  if (logEl) logEl.innerHTML = "";

  if (mode === "sandbox") {
    addLog("🔧 【測試模式】全島 22 區與圖鑑已就緒（無縮圈、無電腦對手）。", "text-emerald-400 font-bold");
  } else if (mode === "char_test") {
    addLog(`🏛️ 【立法院角色測試】已放入 ${state.ais.length} 位電腦對手，點擊探索面板即可搜刮或遇敵！`, "text-indigo-300 font-bold");
  } else {
    addLog(`🔥 台灣生存戰開始！你選擇了【${state.player.name}】，全島共 ${state.ais.length + 1} 人參戰！`, "text-amber-300 font-bold");
  }

  updateUI();
  mainTimer = setInterval(gameTick, 1000);
}

// ==========================================
// 5. 縮圈與每秒計時器 (gameTick)
// ==========================================
function pickNextPendingZones(count = 4) {
  const zones = getSafeZones();
  const openZones = zones.filter(z => !state.closedZones.includes(z.id));
  if (openZones.length <= 1) {
    state.pendingCloseZones = [];
    return;
  }

  const actualCount = Math.min(count, openZones.length - 1);
  const shuffled = [...openZones].sort(() => Math.random() - 0.5);
  state.pendingCloseZones = shuffled.slice(0, actualCount).map(z => z.id);
}

function executeZoneShrink() {
  if (!DEV_CONFIG.enableShrink) return;

  if (state.pendingCloseZones.length > 0) {
    const closedNames = state.pendingCloseZones.map(id => getSafeCurrentZone(id).name);
    state.closedZones.push(...state.pendingCloseZones);
    state.pendingCloseZones = [];
    addLog(`🚫 第 ${state.round} 階段縮圈完成！【${closedNames.join("、")}】已列為禁區！`, "text-rose-400 font-black");
  }

  state.round++;
  state.roundTimeRemain = 90;
  pickNextPendingZones(4);
}

function tickEntityTimers(entity) {
  if (!entity || !entity.alive) return;

  if (entity.skillCdRemain > 0) entity.skillCdRemain--;
  if (entity.stunRemain > 0) entity.stunRemain--;
  if (entity.reflectRemain > 0) entity.reflectRemain--;
  if (entity.milkDefBuffRemain > 0) entity.milkDefBuffRemain--;
  if (entity.weakenedRemain > 0) entity.weakenedRemain--;

  // 王世間：12 秒隱蔽結束後才開始起算 35 秒 CD
  if (entity.stealthRemain > 0) {
    entity.stealthRemain--;
    if (entity.stealthRemain === 0) {
      entity.skillCdRemain = entity.skill?.cd || 35;
      if (entity.isPlayer) {
        addLog("🕵️ 【Over my dead body】隱蔽狀態結束，技能開始進入 35 秒冷卻。", "text-slate-400");
      }
    }
  }

  // 蔣晚安：每 20 秒必定閃避下一次受擊
  if (entity.id === "jiangwanan" && !entity.dodgeReady) {
    if (entity.dodgeCdRemain > 0) {
      entity.dodgeCdRemain--;
      if (entity.dodgeCdRemain === 0) {
        entity.dodgeReady = true;
        if (entity.isPlayer) {
          addLog("🛡️ 被動【問A答B】已就緒！下一次受到的攻擊必定閃避！", "text-sky-300 font-bold");
        }
      }
    }
  }
}

function gameTick() {
  if (state.gameOver || !state.player) return;

  state.timeSec++;

  // 每 3 秒自然回復 5 點體力
  if (state.timeSec % 3 === 0 && state.player.alive) {
    state.player.sp = Math.min(state.player.maxSp, state.player.sp + 5);
  }

  tickEntityTimers(state.player);
  state.ais.forEach(ai => tickEntityTimers(ai));

  // 縮圈倒數與禁區扣血
  if (DEV_CONFIG.enableShrink) {
    state.roundTimeRemain--;
    if (state.roundTimeRemain <= 0) {
      executeZoneShrink();
    }

    if (state.closedZones.includes(state.player.zone)) {
      state.player.hp = Math.max(0, state.player.hp - 12);
      addLog("⚡ 警告！你位於禁區內，遭到高壓電流轟擊 (-12 HP)！請立刻移動！", "text-rose-500 font-black");
      if (typeof triggerBloodScreenEffect === 'function') triggerBloodScreenEffect();
      if (state.player.hp <= 0) {
        triggerGameOver(false, "你滯留於禁區過久，遭到淘汰！");
        return;
      }
    }
  }

  // 驅動電腦 AI 行動
  if (DEV_CONFIG.enableNPC && state.timeSec % 3 === 0 && typeof runAIBrain === 'function') {
    runAIBrain();
  }

  updateUI();
}

// ==========================================
// 6. 探索與搜刮系統 (含資源枯竭機制)
// ==========================================
function triggerSearch() {
  if (state.gameOver || state.inCombat || state.isSearching || !state.player) return;

  const p = state.player;
  if (p.stunRemain > 0) {
    addLog("⛔ 你正處於定身狀態，無法搜刮！", "text-rose-400 font-bold");
    return;
  }

  if (p.sp < 15) {
    addLog("體力不足（需 15 體力），請稍候回復或食用補品！", "text-rose-400");
    return;
  }

  p.sp -= 15;
  state.isSearching = true;

  // 王世間隱蔽期間搜刮速度 1.5 倍 (3000ms -> 2000ms)
  const totalSearchMs = (p.id === "wangshijian" && p.stealthRemain > 0) ? 2000 : 3000;

  const promptText = document.getElementById("search-prompt-text");
  const progressBox = document.getElementById("search-progress-box");
  const progressBar = document.getElementById("search-progress-bar");

  if (promptText) {
    promptText.textContent = (totalSearchMs === 2000) ? "⚡ 從從容容 1.5x 極速搜刮中..." : "🔍 搜刮中...";
    promptText.classList.remove("hidden");
  }
  if (progressBox) progressBox.classList.remove("hidden");
  if (progressBar) progressBar.style.width = "0%";

  updateUI();

  let elapsed = 0;
  const searchInterval = setInterval(() => {
    if (state.gameOver || state.inCombat) {
      clearInterval(searchInterval);
      state.isSearching = false;
      if (progressBox) progressBox.classList.add("hidden");
      if (promptText) promptText.classList.add("hidden");
      return;
    }

    elapsed += 100;
    const percent = Math.min(100, (elapsed / totalSearchMs) * 100);
    if (progressBar) progressBar.style.width = `${percent}%`;

    if (elapsed >= totalSearchMs) {
      clearInterval(searchInterval);
      state.isSearching = false;
      if (progressBox) progressBox.classList.add("hidden");
      if (promptText) promptText.classList.add("hidden");
      executeSearchFinish();
    }
  }, 100);
}

function lootMultipleItemsForPlayer(count = 1) {
  const p = state.player;
  const currentZoneObj = getSafeCurrentZone(p.zone);
  const dropPool = (currentZoneObj && Array.isArray(currentZoneObj.drops)) ? currentZoneObj.drops : [];

  if (dropPool.length === 0) {
    addLog(`🔍 【${currentZoneObj.name}】的物資已被搜刮殆盡（剩餘 0 件），請移動至其他地區！`, "text-amber-400 font-bold");
    return;
  }

  for (let i = 0; i < count; i++) {
    if (dropPool.length === 0) {
      addLog(`🔍 【${currentZoneObj.name}】最後一件物資也已被拿光！`, "text-amber-400");
      break;
    }

    const randIdx = Math.floor(Math.random() * dropPool.length);
    const dropId = dropPool[randIdx];
    const item = getSafeItem(dropId);
    if (!item) continue;

    const slot = item.type;
    if (p.equip && ['weapon', 'head', 'chest', 'arm', 'leg', 'acc'].includes(slot) && p.equip[slot] === null) {
      p.equip[slot] = { ...item, id: dropId };
      dropPool.splice(randIdx, 1); // 確定裝備後從該地區物資池移除 1 件
      addLog(`搜刮獲得並自動裝備【${item.name}】！（此區剩 ${dropPool.length} 件）`, "text-amber-300 font-bold");
    } else if (p.bag && p.bag.length < 6) {
      p.bag.push(dropId);
      dropPool.splice(randIdx, 1); // 確定放入背包後從該地區物資池移除 1 件
      addLog(`搜刮獲得【${item.name}】！（此區剩 ${dropPool.length} 件）`, "text-emerald-300 font-bold");
    } else {
      addLog(`背包已滿（6/6），無法撿起【${item.name}】（物資已留在原地）！`, "text-rose-400");
    }
  }
}

function executeSearchFinish() {
  const p = state.player;

  // 若雙方皆未處於王世間隱蔽狀態，且該區有電腦對手，則有機率觸發遭遇戰
  if ((p.stealthRemain || 0) <= 0 && DEV_CONFIG.enableNPC) {
    const sameZoneAIs = state.ais.filter(a =>
      a && a.alive && a.zone === p.zone && (a.stealthRemain || 0) <= 0
    );

    if (sameZoneAIs.length > 0 && Math.random() < 0.65) {
      const targetAI = sameZoneAIs[Math.floor(Math.random() * sameZoneAIs.length)];
      if (typeof startCombat === 'function') {
        startCombat(targetAI);
        return;
      }
    }
  }

  lootMultipleItemsForPlayer(1);
  updateUI();
}

// ==========================================
// 7. 角色主動技能按鈕與韓國魚雷達警報
// ==========================================
function triggerPlayerSkillButton(e) {
  if (e) e.stopPropagation();
  if (state.gameOver || !state.player) return;

  if (state.inCombat) {
    if (typeof executeCombatAction === 'function') {
      executeCombatAction('skill');
    }
    return;
  }

  // 非戰鬥期間可施放的主動技：韓國魚(發大財)、王世間(隱蔽)、蔣晚安(生生喝鮮乳)
  const p = state.player;
  const skill = p.skill;
  if (!skill) return;

  const nonCombatAllowed = ["hanguoyu", "wangshijian", "jiangwanan"];
  if (!nonCombatAllowed.includes(p.id)) {
    addLog(`⚠️ 【${skill.name}】屬於戰鬥攻擊技能，需在遭遇對手時施放！`, "text-amber-400");
    return;
  }

  if (p.id === "wangshijian" && p.stealthRemain > 0) {
    addLog(`🕵️ 你已經處於隱蔽狀態中（剩餘 ${p.stealthRemain} 秒）！`, "text-amber-300");
    return;
  }

  if (p.skillCdRemain > 0) {
    addLog(`⏳ 技能【${skill.name}】冷卻中（剩餘 ${p.skillCdRemain} 秒）！`, "text-rose-400");
    return;
  }

  if (p.sp < skill.sp) {
    addLog(`體力不足（需 ${skill.sp} 體力），無法施放【${skill.name}】！`, "text-rose-400");
    return;
  }

  p.sp -= skill.sp;

  if (p.id === "hanguoyu") {
    p.skillCdRemain = skill.cd;
    addLog(`✨ 韓國魚發動【${skill.name}】！貨出去錢進來，一口氣搜刮 3 個物資！`, "text-amber-300 font-black");
    lootMultipleItemsForPlayer(3);
  } else if (p.id === "wangshijian") {
    p.stealthRemain = 12;
    addLog(`🕵️ 王世間發動【${skill.name}】！進入 12 秒雙向隱蔽且搜刮速度提升 1.5 倍！`, "text-purple-300 font-black");
  } else if (p.id === "jiangwanan") {
    p.skillCdRemain = skill.cd;
    p.hp = Math.min(p.maxHp, p.hp + 20);
    p.milkDefBuffRemain = 10;
    addLog(`🥛 蔣晚安發動【${skill.name}】！回復 20 HP 並獲得 10 秒防禦 +5！`, "text-emerald-300 font-black");
  }

  updateUI();
}

function checkHanguoyuRadar(movingEntity, targetZoneId) {
  if (!state.player || !state.player.alive) return;
  if (state.player.id !== "hanguoyu") return;
  if (movingEntity.isPlayer) return;

  if (targetZoneId === state.player.zone) {
    addLog(`🚨 【禿子跟著月亮走】雷達感應！有其他角色進入了你所在的【${getSafeCurrentZone(targetZoneId).name}】！`, "text-rose-400 font-black");
    const banner = document.getElementById("radar-warning-banner");
    if (banner) {
      banner.classList.remove("hidden");
      setTimeout(() => banner.classList.add("hidden"), 3500);
    }
  }
}

// ==========================================
// 8. 6格裝備欄、背包操作與拖曳系統
// ==========================================
const EQUIP_SLOT_META = [
  { key: "weapon", label: "武器", icon: `<svg class="w-4 h-4 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 17.5L3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/><path d="M19 21l2-2"/></svg>` },
  { key: "head",   label: "頭部", icon: `<svg class="w-4 h-4 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 14a8 8 0 0 1 16 0v3H4v-3z"/><path d="M2 17h20"/></svg>` },
  { key: "chest",  label: "衣服", icon: `<svg class="w-4 h-4 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>` },
  { key: "arm",    label: "手臂", icon: `<svg class="w-4 h-4 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>` },
  { key: "leg",    label: "腿部", icon: `<svg class="w-4 h-4 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3h12l-1 18h-4l-1-11-1 11H7L6 3z"/></svg>` },
  { key: "acc",    label: "飾品", icon: `<svg class="w-4 h-4 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="14" r="6"/><path d="M10 8l2-4 2 4"/></svg>` }
];

function renderEquipSixGrid(p) {
  const grid = document.getElementById("equip-six-grid");
  if (!grid || !p || !p.equip) return;

  grid.innerHTML = EQUIP_SLOT_META.map(slot => {
    const equipped = p.equip[slot.key];
    if (equipped) {
      const rarity = ItemRegistry.getRarity(equipped.id);
      const statStr = equipped.atk && equipped.def
        ? `+${equipped.atk}攻/+${equipped.def}防`
        : (equipped.atk ? `+${equipped.atk}攻` : `+${equipped.def || 0}防`);
      return `
        <div draggable="true"
             ondragstart="handleDragStartEquip(event, '${slot.key}')"
             onclick="openItemInfoModal('${equipped.id}', 'equip', '${slot.key}')"
             class="p-1 rounded-md border ${rarity.border} ${rarity.bg} flex flex-col justify-between cursor-pointer hover:brightness-110 transition select-none">
          <div class="text-[9px] font-black ${rarity.text} truncate leading-tight">${equipped.name}</div>
          <div class="text-[8px] font-mono text-amber-300/90 text-right leading-none">${statStr}</div>
        </div>
      `;
    } else {
      return `
        <div class="p-1 rounded-md border border-slate-800/90 bg-slate-900/50 flex flex-col items-center justify-center text-slate-600 select-none">
          ${slot.icon}
        </div>
      `;
    }
  }).join("");
}

function useOrEquipBagItem(bagIndex) {
  if (state.gameOver || !state.player) return;
  const p = state.player;
  const itemId = p.bag[bagIndex];
  const item = getSafeItem(itemId);
  if (!item) return;

  if (item.type === "food") {
    let healHp = item.hp || 0;
    let healSp = item.sp || 0;

    // 亞洲桶神被動：鼎王吃到飽 (食物回血量提升 20%)
    if (p.id === "tonggod" && healHp > 0) {
      healHp = Math.round(healHp * 1.2);
    }

    p.hp = Math.min(p.maxHp, p.hp + healHp);
    p.sp = Math.min(p.maxSp, p.sp + healSp);
    p.bag.splice(bagIndex, 1);

    const parts = [];
    if (healHp > 0) parts.push(`+${healHp} HP`);
    if (healSp > 0) parts.push(`+${healSp} 體力`);
    addLog(`🍱 食用了【${item.name}】（${parts.join("、")}）！`, "text-emerald-300 font-bold");
    closeItemInfoModal();
    updateUI();
    return;
  }

  const slot = item.type;
  if (p.equip && ['weapon', 'head', 'chest', 'arm', 'leg', 'acc'].includes(slot)) {
    const oldEquip = p.equip[slot];
    p.equip[slot] = { ...item, id: itemId };
    if (oldEquip) {
      p.bag[bagIndex] = oldEquip.id;
      addLog(`⚔️ 裝備了【${item.name}】，換下【${oldEquip.name}】。`, "text-amber-300");
    } else {
      p.bag.splice(bagIndex, 1);
      addLog(`⚔️ 裝備了【${item.name}】！`, "text-amber-300");
    }
    closeItemInfoModal();
    updateUI();
  }
}

function unequipSlotToBag(slotKey) {
  if (state.gameOver || !state.player) return;
  const p = state.player;
  const equipped = p.equip[slotKey];
  if (!equipped) return;

  if (p.bag.length >= 6) {
    addLog("背包已滿（6/6），無法卸下裝備！", "text-rose-400");
    return;
  }

  p.bag.push(equipped.id);
  p.equip[slotKey] = null;
  addLog(`已將【${equipped.name}】卸下放入背包。`, "text-slate-300");
  closeItemInfoModal();
  updateUI();
}

function dropItemFromSource(sourceType, indexOrSlot) {
  if (state.gameOver || !state.player) return;
  const p = state.player;
  const currentZoneObj = getSafeCurrentZone(p.zone);

  if (sourceType === "bag") {
    const removedId = p.bag.splice(indexOrSlot, 1)[0];
    if (removedId) {
      if (currentZoneObj && Array.isArray(currentZoneObj.drops)) {
        currentZoneObj.drops.push(removedId);
      }
      addLog(`🗑️ 丟棄了【${getItemDisplayName(removedId)}】（已留在此區域地面）。`, "text-slate-400");
    }
  } else if (sourceType === "equip") {
    const eq = p.equip[indexOrSlot];
    if (eq) {
      p.equip[indexOrSlot] = null;
      if (currentZoneObj && Array.isArray(currentZoneObj.drops)) {
        currentZoneObj.drops.push(eq.id);
      }
      addLog(`🗑️ 丟棄了裝備【${eq.name}】（已留在此區域地面）。`, "text-slate-400");
    }
  }
  closeItemInfoModal();
  updateUI();
}

function handleDragStartBag(e, bagIdx) {
  state.dragSource = { type: "bag", key: bagIdx };
  if (e.dataTransfer) e.dataTransfer.setData("text/plain", `bag:${bagIdx}`);
}

function handleDragStartEquip(e, slotKey) {
  state.dragSource = { type: "equip", key: slotKey };
  if (e.dataTransfer) e.dataTransfer.setData("text/plain", `equip:${slotKey}`);
}

function handleDragOverYellow(e) {
  e.preventDefault();
  const panel = document.getElementById("explore-panel");
  if (panel) panel.classList.add("drag-over-yellow");
}

function handleDragLeaveYellow(e) {
  const panel = document.getElementById("explore-panel");
  if (panel) panel.classList.remove("drag-over-yellow");
}

function handleDropToYellow(e) {
  e.preventDefault();
  const panel = document.getElementById("explore-panel");
  if (panel) panel.classList.remove("drag-over-yellow");

  if (!state.dragSource) return;
  dropItemFromSource(state.dragSource.type, state.dragSource.key);
  state.dragSource = null;
}

function handleDragOverRed(e) {
  e.preventDefault();
  const zone = document.getElementById("drop-zone-red");
  if (zone) zone.classList.add("drag-over-red");
}

function handleDragLeaveRed(e) {
  const zone = document.getElementById("drop-zone-red");
  if (zone) zone.classList.remove("drag-over-red");
}

function handleDropToRed(e) {
  e.preventDefault();
  const zone = document.getElementById("drop-zone-red");
  if (zone) zone.classList.remove("drag-over-red");

  if (!state.dragSource) return;
  if (state.dragSource.type === "bag") {
    useOrEquipBagItem(state.dragSource.key);
  }
  state.dragSource = null;
}

// ==========================================
// 9. 合成系統、全物資圖鑑與上下位合成樹
// ==========================================
function getEntityAllItemLocations(entity) {
  const list = [];
  if (!entity) return list;

  if (Array.isArray(entity.bag)) {
    entity.bag.forEach((id, idx) => {
      list.push({ id: ItemRegistry.ALIAS[id] || id, rawId: id, source: "bag", key: idx });
    });
  }
  if (entity.equip) {
    Object.entries(entity.equip).forEach(([slot, item]) => {
      if (item && item.id) {
        list.push({ id: ItemRegistry.ALIAS[item.id] || item.id, rawId: item.id, source: "equip", key: slot });
      }
    });
  }
  return list;
}

function findAvailableRecipes(entity) {
  const recipes = getSafeRecipes();
  if (!entity || recipes.length === 0) return [];

  const owned = getEntityAllItemLocations(entity);
  const available = [];

  recipes.forEach(r => {
    if (!r.materials || r.materials.length < 2) return;
    const m1 = ItemRegistry.ALIAS[r.materials[0]] || r.materials[0];
    const m2 = ItemRegistry.ALIAS[r.materials[1]] || r.materials[1];

    const idx1 = owned.findIndex(o => o.id === m1);
    if (idx1 === -1) return;

    const idx2 = owned.findIndex((o, i) => i !== idx1 && o.id === m2);
    if (idx2 === -1) return;

    available.push(r);
  });

  return available;
}

function craftItem(entity, recipe, isPlayer = true) {
  if (!entity || !recipe) return false;
  const owned = getEntityAllItemLocations(entity);
  const m1 = ItemRegistry.ALIAS[recipe.materials[0]] || recipe.materials[0];
  const m2 = ItemRegistry.ALIAS[recipe.materials[1]] || recipe.materials[1];

  const loc1Idx = owned.findIndex(o => o.id === m1);
  if (loc1Idx === -1) return false;
  const loc2Idx = owned.findIndex((o, i) => i !== loc1Idx && o.id === m2);
  if (loc2Idx === -1) return false;

  const targets = [owned[loc1Idx], owned[loc2Idx]];

  // 先從裝備或背包移除材料（背包索引由大到小刪避免位移）
  const bagIndices = targets.filter(t => t.source === "bag").map(t => t.key).sort((a, b) => b - a);
  bagIndices.forEach(idx => entity.bag.splice(idx, 1));

  targets.filter(t => t.source === "equip").forEach(t => {
    entity.equip[t.key] = null;
  });

  const resultId = ItemRegistry.ALIAS[recipe.result] || recipe.result;
  const resultItem = getSafeItem(resultId);
  if (!resultItem) return false;

  const slot = resultItem.type;
  if (entity.equip && ['weapon', 'head', 'chest', 'arm', 'leg', 'acc'].includes(slot)) {
    const curEq = entity.equip[slot];
    if (!curEq || (resultItem.score || 0) >= (curEq.score || 0)) {
      if (curEq && entity.bag.length < 6) entity.bag.push(curEq.id);
      entity.equip[slot] = { ...resultItem, id: resultId };
    } else if (entity.bag.length < 6) {
      entity.bag.push(resultId);
    }
  } else {
    entity.bag.push(resultId);
  }

  if (isPlayer) {
    addLog(`🔨 合成成功！獲得【${resultItem.name}】！`, "text-amber-300 font-black");
    if (state.trackedItemId === resultId) {
      state.trackedItemId = null;
    }
    updateUI();
  }
  return true;
}

function triggerQuickCraft(resultId) {
  if (!state.player) return;
  const avail = findAvailableRecipes(state.player);
  const recipe = avail.find(r => (ItemRegistry.ALIAS[r.result] || r.result) === (ItemRegistry.ALIAS[resultId] || resultId));
  if (recipe) {
    craftItem(state.player, recipe, true);
  }
}

function findZonesDroppingItem(itemId) {
  const target = ItemRegistry.ALIAS[itemId] || itemId;
  return getSafeZones().filter(z => {
    const baseList = z.initialDrops || z.drops || [];
    return baseList.some(d => (ItemRegistry.ALIAS[d] || d) === target);
  });
}

function getItemDropLocationName(itemId) {
  const resolved = ItemRegistry.ALIAS[itemId] || itemId;
  const zones = findZonesDroppingItem(resolved);
  if (zones.length > 0) {
    // 完整列出所有產地，不再用 slice(0, 2) 截斷
    return zones.map(z => z.name).join(" / ");
  }
  const recipes = getSafeRecipes();
  const rec = recipes.find(r => (ItemRegistry.ALIAS[r.result] || r.result) === resolved);
  if (rec) {
    return `合成 (${rec.materials.map(m => getItemDisplayName(m)).join("+")})`;
  }
  return "特殊途徑";
}

function formatItemStatBadge(item) {
  if (!item) return "一般物資";
  if (item.type === "food") {
    const parts = [];
    if (item.hp) parts.push(`+${item.hp} HP`);
    if (item.sp) parts.push(`+${item.sp} SP`);
    return parts.join(" / ") || "食物補品";
  }
  const parts = [];
  if (item.atk) parts.push(`+${item.atk} 攻`);
  if (item.def) parts.push(`+${item.def} 防`);
  return parts.length > 0 ? parts.join(" / ") : "合成材料";
}

function openItemInfoModal(itemId, sourceType = null, indexOrSlot = null) {
  const item = getSafeItem(itemId);
  if (!item) return;

  const modal = document.getElementById("item-info-modal");
  const catEl = document.getElementById("info-item-category");
  const nameEl = document.getElementById("info-item-name");
  const statEl = document.getElementById("info-item-stat");
  const descEl = document.getElementById("info-item-desc");
  const btnContainer = document.getElementById("info-buttons-container");

  if (!modal || !btnContainer) return;

  const rarity = ItemRegistry.getRarity(item.id);
  const typeLabels = { weapon: "⚔️ 武器", head: "🪖 頭部防具", chest: "👕 衣服防具", arm: "🧤 手臂防具", leg: "👖 腿部防具", acc: "💍 飾品", food: "🍱 美食補品", material: "🔩 合成材料" };

  if (catEl) catEl.textContent = `${rarity.color} ${rarity.label} • ${typeLabels[item.type] || "物資"}`;
  if (nameEl) {
    nameEl.className = `text-base font-black mt-0.5 ${rarity.text}`;
    nameEl.textContent = item.name;
  }
  if (statEl) statEl.textContent = formatItemStatBadge(item);
  if (descEl) descEl.textContent = item.desc || "台灣街頭常見的生存物資。";

  const recipes = getSafeRecipes();
  const craftFromRecipe = recipes.find(r => (ItemRegistry.ALIAS[r.result] || r.result) === item.id);
  const upgradesToList = recipes.filter(r => r.materials && r.materials.some(m => (ItemRegistry.ALIAS[m] || m) === item.id));
  const dropZones = findZonesDroppingItem(item.id);

  let treeHTML = `<div class="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-2 text-xs">`;

  // 取得方式：產地或下位材料
  if (craftFromRecipe) {
    const [m1, m2] = craftFromRecipe.materials;
    treeHTML += `
      <div>
        <div class="text-[10px] text-amber-400 font-bold mb-1">🔨 合成所需下位材料（點擊可跳轉）：</div>
        <div class="grid grid-cols-2 gap-1.5">
          <button onclick="openItemInfoModal('${m1}')" class="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-left truncate">
            <div class="font-bold text-slate-200 truncate">${getItemDisplayName(m1)}</div>
            <div class="text-[9px] text-amber-300/80 truncate">📍 ${getItemDropLocationName(m1)}</div>
          </button>
          <button onclick="openItemInfoModal('${m2}')" class="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-left truncate">
            <div class="font-bold text-slate-200 truncate">${getItemDisplayName(m2)}</div>
            <div class="text-[9px] text-amber-300/80 truncate">📍 ${getItemDropLocationName(m2)}</div>
          </button>
        </div>
      </div>
    `;
  } else if (dropZones.length > 0) {
    treeHTML += `
      <div>
        <div class="text-[10px] text-emerald-400 font-bold mb-1">📍 全島搜刮產地：</div>
        <div class="flex flex-wrap gap-1">
          ${dropZones.map(z => `<span class="px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-[10px] text-amber-300">${z.icon \vert{}\vert{} ''}${z.name}</span>`).join("")}
        </div>
      </div>
    `;
  }

  // 上位升級路線
  if (upgradesToList.length > 0) {
    treeHTML += `
      <div class="pt-1 border-t border-slate-800/80">
        <div class="text-[10px] text-sky-400 font-bold mb-1">⬆️ 可升級合成之上位裝備：</div>
        <div class="space-y-1 max-h-24 overflow-y-auto custom-scrollbar">
          ${upgradesToList.map(r => {
            const resItem = getSafeItem(r.result);
            const otherMat = r.materials.find(m => (ItemRegistry.ALIAS[m] || m) !== item.id) || r.materials[0];
            return `
              <button onclick="openItemInfoModal('${r.result}')" class="w-full p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg flex justify-between items-center text-left">
                <span class="font-bold text-amber-300 truncate">${resItem ? resItem.name : r.result}</span>
                <span class="text-[10px] text-slate-400 font-mono">+ ${getItemDisplayName(otherMat)}</span>
              </button>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }

  treeHTML += `</div>`;

  // 操作按鈕列
  let actionBtns = "";
  if (sourceType === "bag" && indexOrSlot !== null) {
    if (item.type === "food") {
      actionBtns += `
        <button onclick="useOrEquipBagItem(${indexOrSlot})" class="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs shadow transition">
          🍱 立即食用 (${formatItemStatBadge(item)})
        </button>
      `;
    } else if (['weapon', 'head', 'chest', 'arm', 'leg', 'acc'].includes(item.type)) {
      actionBtns += `
        <button onclick="useOrEquipBagItem(${indexOrSlot})" class="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow transition">
          ⚔️ 裝備至身上
        </button>
      `;
    }
    actionBtns += `
      <button onclick="dropItemFromSource('bag', ${indexOrSlot})" class="w-full py-1.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-700/60 text-rose-300 font-bold rounded-xl text-xs transition">
        🗑️ 丟棄此物資
      </button>
    `;
  } else if (sourceType === "equip" && indexOrSlot !== null) {
    actionBtns += `
      <div class="grid grid-cols-2 gap-2">
        <button onclick="unequipSlotToBag('${indexOrSlot}')" class="py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-bold rounded-xl text-xs transition">
          📥 卸下至背包
        </button>
        <button onclick="dropItemFromSource('equip', '${indexOrSlot}')" class="py-2 bg-rose-950/80 hover:bg-rose-900 border border-rose-700/60 text-rose-300 font-bold rounded-xl text-xs transition">
          🗑️ 直接丟棄
        </button>
      </div>
    `;
  }

  const isTracking = (state.trackedItemId === item.id);
  const trackBtn = isTracking
    ? `<button onclick="clearTrackedItem(event)" class="w-full py-2 bg-rose-700 hover:bg-rose-600 text-white font-black rounded-xl text-xs transition">✕ 取消追蹤此目標</button>`
    : `<button onclick="setTrackedItem('${item.id}')" class="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-xs shadow transition">🎯 鎖定追蹤此物資（地圖標記產地）</button>`;

  btnContainer.innerHTML = treeHTML + actionBtns + trackBtn;
  modal.classList.remove("hidden");
}

function closeItemInfoModal(e) {
  const modal = document.getElementById("item-info-modal");
  if (modal) modal.classList.add("hidden");
}

function openCraftBookModal() {
  const modal = document.getElementById("craft-book-modal");
  if (modal) {
    modal.classList.remove("hidden");
    filterCraftBook(state.craftBookFilter || "all");
  }
}

function closeCraftBookModal() {
  const modal = document.getElementById("craft-book-modal");
  if (modal) modal.classList.add("hidden");
}

function filterCraftBook(tierFilter) {
  state.craftBookFilter = tierFilter;
  const tabs = ['all', 1, 2, 3, 4, 5];
  tabs.forEach(t => {
    const btn = document.getElementById(`craft-tab-${t}`);
    if (btn) {
      if (String(t) === String(tierFilter)) {
        btn.className = "py-1.5 rounded-lg bg-indigo-600 text-white font-black shadow";
      } else {
        btn.className = "py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700";
      }
    }
  });

  const listEl = document.getElementById("craft-recipes-list");
  if (!listEl) return;

  const allItems = Object.values(ItemRegistry.getAllItems());
  const recipes = getSafeRecipes();

  const filtered = allItems.filter(item => {
    if (!item || !item.id) return false;
    const r = ItemRegistry.getRarity(item.id);
    return tierFilter === 'all' ? true : (r.tier === Number(tierFilter));
  }).sort((a, b) => {
    const rA = ItemRegistry.getRarity(a.id).tier;
    const rB = ItemRegistry.getRarity(b.id).tier;
    if (rB !== rA) return rB - rA;
    return (b.score || 0) - (a.score || 0);
  });

  if (filtered.length === 0) {
    listEl.innerHTML = `<div class="text-center text-slate-500 py-8 text-xs">此分類暫無物資</div>`;
    return;
  }

  listEl.innerHTML = filtered.map(item => {
    const r = ItemRegistry.getRarity(item.id);
    const rec = recipes.find(rc => (ItemRegistry.ALIAS[rc.result] || rc.result) === item.id);
    const subInfo = rec
      ? `🔨 配方：${rec.materials.map(m => getItemDisplayName(m)).join(" + ")}`
      : `📍 產地：${getItemDropLocationName(item.id)}`;

    return `
      <div onclick="openItemInfoModal('${item.id}')" class="p-2.5 rounded-xl border ${r.border} ${r.bg} flex justify-between items-center gap-2 cursor-pointer hover:brightness-110 transition">
        <div class="min-w-0 flex-1 text-left">
          <div class="flex items-center gap-1.5">
            <span class="text-[10px] px-1.5 py-0.5 rounded border font-mono ${r.badge}">${r.color}${r.label}</span>
            <span class="text-xs font-black ${r.text} truncate">${item.name}</span>
            <span class="text-[10px] font-mono text-amber-300 font-bold">${formatItemStatBadge(item)}</span>
          </div>
          <div class="text-[10px] text-slate-400 mt-1 truncate">${subInfo}</div>
        </div>
        <button onclick="event.stopPropagation(); setTrackedItem('${item.id}')" class="flex-shrink-0 px-2.5 py-1.5 bg-indigo-600/90 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-black shadow">
          🎯 追蹤
        </button>
      </div>
    `;
  }).join("");
}

// ==========================================
// 10. 目標追蹤盒與 22 區台灣島戰術地圖
// ==========================================
function setTrackedItem(itemId) {
  const item = getSafeItem(itemId);
  if (!item) return;

  state.trackedItemId = item.id;
  addLog(`🎯 已鎖定追蹤：【${item.name}】！`, "text-amber-300 font-bold");
  closeCraftBookModal();
  closeItemInfoModal();
  updateUI();
}

function clearTrackedItem(e) {
  if (e) e.stopPropagation();
  state.trackedItemId = null;
  addLog("已取消追蹤目標。", "text-slate-400");
  closeItemInfoModal();
  updateUI();
}

function getMissingTrackedMaterials() {
  if (!state.trackedItemId || !state.player) return [];
  const recipes = getSafeRecipes();
  const resolvedTarget = ItemRegistry.ALIAS[state.trackedItemId] || state.trackedItemId;
  const recipe = recipes.find(r => (ItemRegistry.ALIAS[r.result] || r.result) === resolvedTarget);

  const ownedIds = getEntityAllItemLocations(state.player).map(o => o.id);

  if (recipe) {
    return recipe.materials
      .map(m => ItemRegistry.ALIAS[m] || m)
      .filter(mId => !ownedIds.includes(mId));
  } else {
    return ownedIds.includes(resolvedTarget) ? [] : [resolvedTarget];
  }
}

/**
 * 修正後：消除中間大空白（緊湊排列）＋ 完整顯示所有可取得地點（不截斷）
 */
function renderTargetTracker() {
  const trackerBox = document.getElementById("target-tracker-box");
  if (!trackerBox) return;

  if (!state.trackedItemId || !state.player) {
    trackerBox.classList.add("hidden");
    trackerBox.innerHTML = "";
    return;
  }

  const targetItem = getSafeItem(state.trackedItemId);
  if (!targetItem) {
    trackerBox.classList.add("hidden");
    trackerBox.innerHTML = "";
    return;
  }

  const rarity = ItemRegistry.getRarity(targetItem.id);
  trackerBox.classList.remove("hidden");
  // 自動撐開寬度以容納完整地點名稱，不留多餘空白
  trackerBox.className = "w-full max-w-[310px] bg-slate-950/85 hover:bg-slate-950/95 backdrop-blur-xs border border-amber-500/60 rounded-xl p-2 shadow-xl transition text-left cursor-pointer";

  const ownedIds = getEntityAllItemLocations(state.player).map(o => o.id);
  const recipes = getSafeRecipes();
  const recipe = recipes.find(r => (ItemRegistry.ALIAS[r.result] || r.result) === targetItem.id);

  let rowsHTML = "";
  if (recipe) {
    rowsHTML = recipe.materials.map(mId => {
      const resolvedMat = ItemRegistry.ALIAS[mId] || mId;
      const isOwned = ownedIds.includes(resolvedMat);
      const mName = getItemDisplayName(resolvedMat);
      const loc = getItemDropLocationName(resolvedMat);
      const mRarity = ItemRegistry.getRarity(resolvedMat);

      if (isOwned) {
        return `
          <div class="flex items-center gap-1.5 text-emerald-400 leading-snug">
            <span class="font-bold flex-shrink-0">✔ ${mName}</span>
            <span class="text-[9px] text-emerald-500 font-mono">（已擁有）</span>
          </div>
        `;
      } else {
        return `
          <div class="flex items-start gap-1.5 text-rose-300 leading-snug">
            <span class="${mRarity.text} font-bold flex-shrink-0">✖ ${mName}</span>
            <span class="text-[9px] text-amber-300 font-mono font-bold break-words">⭐${loc}</span>
          </div>
        `;
      }
    }).join("");
  } else {
    const loc = getItemDropLocationName(targetItem.id);
    const count = ownedIds.filter(id => id === targetItem.id).length;
    rowsHTML = `
      <div class="space-y-0.5 pt-0.5 leading-snug">
        <div class="flex items-start gap-1.5 text-slate-300">
          <span class="flex-shrink-0 text-slate-400">產地:</span>
          <span class="text-amber-400 font-bold break-words">⭐${loc}</span>
        </div>
        <div class="flex items-center gap-1.5 text-slate-300">
          <span class="flex-shrink-0 text-slate-400">擁有:</span>
          <span class="${count > 0 ? 'text-emerald-400 font-bold' : 'text-rose-400'}">${count > 0 ? `✔ ${count} 個` : '✖ 0 個'}</span>
        </div>
      </div>
    `;
  }

  trackerBox.innerHTML = `
    <div class="flex justify-between items-center border-b border-slate-700/50 pb-1 mb-1 gap-2">
      <div class="flex items-center gap-1.5 min-w-0">
        <span class="text-[9px] font-black tracking-wider text-amber-400 uppercase flex-shrink-0">🎯 目標追蹤</span>
        <span class="text-[11px] font-bold ${rarity.text} truncate">${targetItem.name}</span>
      </div>
      <button onclick="clearTrackedItem(event)" class="text-slate-400 hover:text-rose-400 text-xs px-1 font-mono transition flex-shrink-0" title="取消追蹤">✕</button>
    </div>
    <div class="space-y-1 text-[10px] font-mono text-slate-300">${rowsHTML}</div>
  `;
}

function openMapModal() {
  if (state.gameOver || state.inCombat || state.isSearching) return;
  const modal = document.getElementById("map-modal");
  if (modal) {
    modal.classList.remove("hidden");
    renderTacticalMap();
  }
}

function closeMapModal() {
  const modal = document.getElementById("map-modal");
  if (modal) modal.classList.add("hidden");
}

function moveZone(targetZoneId) {
  if (state.gameOver || state.inCombat || state.isSearching || !state.player) return;
  const p = state.player;

  if (p.stunRemain > 0) {
    addLog("⛔ 你正處於定身狀態，無法移動！", "text-rose-400 font-bold");
    closeMapModal();
    return;
  }

  if (p.zone === targetZoneId) {
    closeMapModal();
    return;
  }

  if (state.closedZones.includes(targetZoneId)) {
    addLog("🚫 該區域已列為禁區，無法進入！", "text-rose-500 font-bold");
    return;
  }

  if (p.sp < 5) {
    addLog("體力不足（需 5 體力），無法移動！", "text-rose-400");
    closeMapModal();
    return;
  }

  p.sp -= 5;
  p.zone = targetZoneId;
  const targetZone = getSafeCurrentZone(targetZoneId);
  addLog(`🏃 移動到了【${targetZone.name}】。`, "text-indigo-300");

  if (isChaoGeAuraAffecting(p)) {
    addLog("⚠️ 感受到一股「超派～」氣場，在此地區你的防禦力降低了 20%！", "text-rose-400 font-bold");
  }

  closeMapModal();
  updateUI();
}

function renderTacticalMap() {
  const container = document.getElementById("map-nodes-container");
  if (!container || !state.player) return;

  const p = state.player;
  const zones = getSafeZones();
  const missingMats = getMissingTrackedMaterials();

  const nodesHTML = zones.map(z => {
    const isCurrent = (p.zone === z.id);
    const isClosed = state.closedZones.includes(z.id);
    const isPendingClose = !isClosed && state.pendingCloseZones.includes(z.id);
    const baseDrops = z.initialDrops || z.drops || [];
    const hasNeededMaterial = !isClosed && missingMats.some(mId =>
      baseDrops.some(d => (ItemRegistry.ALIAS[d] || d) === mId)
    );

    let pillClass = "bg-slate-950/95 border border-amber-700/60 text-slate-100 shadow-md";
    let iconFilter = "drop-shadow-[0_3px_4px_rgba(0,0,0,0.9)]";
    let pinTop = "";
    let badgeRight = "";

    if (isCurrent) {
      pillClass = "bg-sky-950 border-2 border-sky-400 text-white shadow-[0_0_12px_rgba(56,189,248,0.8)]";
      pinTop = `
        <div class="-mb-1 z-20 animate-bounce flex flex-col items-center">
          <div class="w-4 h-4 rounded-full bg-sky-500 border border-white text-white text-[9px] font-black flex items-center justify-center shadow">1</div>
        </div>
      `;
    } else if (isClosed) {
      pillClass = "bg-slate-950/80 border border-rose-900/80 text-slate-600 line-through";
      iconFilter = "grayscale opacity-35";
      badgeRight = `<span class="ml-0.5 text-[8px]">🚫</span>`;
    } else if (isPendingClose) {
      pillClass = "bg-amber-950/95 border border-amber-500 text-amber-200 animate-pulse";
      badgeRight = `<span class="ml-0.5 text-[8px]">⚠️</span>`;
    }

    if (hasNeededMaterial && !isClosed) {
      pillClass = "bg-amber-950 border-2 border-amber-300 text-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.85)]";
      badgeRight = `<span class="ml-0.5 text-[9px]">⭐</span>` + badgeRight;
    }

    return `
      <div onclick="moveZone('${z.id}')"
           style="left: ${z.x}%; top: ${z.y}%;"
           class="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer select-none transition-transform active:scale-90 z-10 hover:scale-105">
        ${pinTop}
        <div class="text-lg leading-none mb-0.5 ${iconFilter}">${z.icon || '🏢'}</div>
        <div class="px-1.5 py-0.5 rounded-md flex items-center whitespace-nowrap ${pillClass}">
          <span class="text-[9px] font-black tracking-tight">${z.name}</span>
          ${badgeRight}
        </div>
      </div>
    `;
  }).join("");

  container.innerHTML = `
    <div class="relative w-full h-full rounded-2xl overflow-hidden border border-slate-800 shadow-inner"
         style="background: radial-gradient(circle at 50% 45%, #0c2a4d 0%, #041022 75%, #020617 100%);">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" class="absolute inset-0 w-full h-full pointer-events-none opacity-85">
        <path d="M48,2 C65,3 86,10 90,26 C94,42 91,62 85,80 C79,92 60,96 42,95 C22,94 11,83 10,66 C8,47 10,27 16,14 C23,5 36,2 48,2 Z"
              fill="#14332b" stroke="#2dd4bf" stroke-width="0.6" stroke-opacity="0.45" />
      </svg>
      <div class="relative w-full h-full">${nodesHTML}</div>
    </div>
  `;
}

// ==========================================
// 11. 主畫面 UI 總渲染與訊息紀錄
// ==========================================
function addLog(msg, colorClass = "text-slate-300") {
  const timeStr = new Date(state.timeSec * 1000).toISOString().substr(14, 5);
  state.logs.unshift({ time: timeStr, msg, colorClass });
  if (state.logs.length > 40) state.logs.pop();

  const logEl = document.getElementById("game-log");
  if (logEl) {
    logEl.innerHTML = state.logs.map(l =>
      `<div class="${l.colorClass} leading-snug"><span class="text-slate-600">[${l.time}]</span> ${l.msg}</div>`
    ).join("");
  }
}

function triggerGameOver(isWin, reasonText) {
  state.gameOver = true;
  if (mainTimer) clearInterval(mainTimer);

  const modal = document.getElementById("gameover-modal");
  const iconEl = document.getElementById("gameover-icon");
  const titleEl = document.getElementById("gameover-title");
  const descEl = document.getElementById("gameover-desc");

  if (iconEl) {
    iconEl.textContent = isWin ? "🏆" : "💀";
    iconEl.className = isWin ? "text-5xl mb-3 font-black text-amber-400" : "text-5xl mb-3 font-black text-rose-500";
  }
  if (titleEl) titleEl.textContent = isWin ? "大吉大利，稱霸台灣！" : "勝敗乃兵家常事！";
  if (descEl) descEl.textContent = reasonText || "";
  if (modal) modal.classList.remove("hidden");
}

function updateUI() {
  if (!state.player) return;
  const p = state.player;
  const zObj = getSafeCurrentZone(p.zone);

  // 1. 頂部區域標題、縮圈計時與不重複物資清單
  const zoneTitle = document.getElementById("zone-title");
  if (zoneTitle && zObj) {
    zoneTitle.textContent = `${zObj.icon || '📍'} ${zObj.name}`;
  }

  const timerBadge = document.getElementById("zone-timer-badge");
  if (timerBadge) {
    if (!DEV_CONFIG.enableShrink) {
      timerBadge.textContent = DEV_CONFIG.mode === "char_test" ? "🏛️ 角色測試 (立法院)" : "🔧 測試模式 (無縮圈)";
      timerBadge.className = "text-[10px] font-mono font-black px-2 py-0.5 rounded-md bg-emerald-950/90 border border-emerald-600/60 text-emerald-300";
    } else {
      const m = Math.floor(state.roundTimeRemain / 60);
      const s = String(state.roundTimeRemain % 60).padStart(2, "0");
      const aliveCount = 1 + state.ais.filter(a => a && a.alive).length;
      timerBadge.textContent = `🔥 R${state.round} 縮圈 ${m}:${s} • 存活 ${aliveCount}人`;
      timerBadge.className = "text-[10px] font-mono font-black px-2 py-0.5 rounded-md bg-slate-900/90 border border-slate-700 text-amber-400";
    }
  }

  const explorePanel = document.getElementById("explore-panel");
  const alertPill = document.getElementById("current-zone-alert-pill");
  if (explorePanel && alertPill) {
    explorePanel.classList.remove("zone-pending-warning", "zone-closed-danger");
    if (state.closedZones.includes(p.zone)) {
      explorePanel.classList.add("zone-closed-danger");
      alertPill.textContent = "🚫 禁區扣血中";
      alertPill.className = "text-[10px] font-black px-1.5 py-0.5 rounded bg-rose-600 text-white animate-pulse";
    } else if (state.pendingCloseZones.includes(p.zone)) {
      explorePanel.classList.add("zone-pending-warning");
      alertPill.textContent = "⚠️ 即將關閉";
      alertPill.className = "text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 animate-pulse";
    } else {
      alertPill.className = "hidden";
    }
  }

  // 🟢 修正：使用 initialDrops + Set 確保每個掉落物名稱只顯示一次，並標示剩餘總量
  const zoneDrops = document.getElementById("zone-drops");
  if (zoneDrops && zObj) {
    const fixedDropIds = zObj.initialDrops || [...new Set(zObj.drops || [])];
    const dropNames = fixedDropIds.map(id => ItemRegistry.getName(id));
    const remainCount = (zObj.drops || []).length;
    zoneDrops.textContent = dropNames.length > 0
      ? `可搜刮 (剩 ${remainCount} 件)：${dropNames.join("、")}`
      : `可搜刮：暫無配置物資`;
  }

  // 2. 合成提示橫幅
  const craftAlert = document.getElementById("craft-alert-box");
  if (craftAlert) {
    const availRecipes = findAvailableRecipes(p);
    if (availRecipes.length > 0) {
      const topRec = availRecipes[0];
      const resItem = getSafeItem(topRec.result);
      craftAlert.className = "bg-amber-500/20 border-2 border-amber-400 rounded-xl p-2 flex justify-between items-center animate-pulse-fast";
      craftAlert.innerHTML = `
        <div class="text-xs font-black text-amber-300 truncate">
          🔨 可合成：【${resItem ? resItem.name : topRec.result}】
        </div>
        <button onclick="triggerQuickCraft('${topRec.result}')" class="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-lg text-xs shadow">
          立即合成
        </button>
      `;
    } else {
      craftAlert.className = "hidden";
      craftAlert.innerHTML = "";
    }
  }

  // 3. 角色狀態與主動技能按鈕
  const pNameEl = document.getElementById("player-name");
  if (pNameEl) pNameEl.textContent = p.name;

  const statEl = document.getElementById("player-stats");
  if (statEl) statEl.textContent = `攻擊 ${getTotalAtk(p)} | 防禦 ${getTotalDef(p)}`;

  const quickSkillBtn = document.getElementById("btn-quick-skill");
  if (quickSkillBtn && p.skill) {
    if (p.stealthRemain > 0) {
      quickSkillBtn.textContent = `🕵️ 隱蔽中(${p.stealthRemain}s)`;
      quickSkillBtn.className = "px-2 py-0.5 bg-purple-900 border border-purple-400 text-purple-200 font-black rounded text-[10px]";
    } else if (p.skillCdRemain > 0) {
      quickSkillBtn.textContent = `⏳ ${p.skill.name}(${p.skillCdRemain}s)`;
      quickSkillBtn.className = "px-2 py-0.5 bg-slate-800 text-slate-400 font-bold rounded text-[10px]";
    } else {
      quickSkillBtn.textContent = `✨ ${p.skill.name}`;
      quickSkillBtn.className = "px-2 py-0.5 bg-purple-700 hover:bg-purple-600 active:scale-95 text-white font-black rounded text-[10px] shadow transition";
    }
  }

  // 狀態徽章
  const badgesEl = document.getElementById("player-status-badges");
  if (badgesEl) {
    const bList = [];
    if (p.id === "laixiangde" && p.gongdeStacks > 0) {
      bList.push(`<span class="px-1.5 py-0.5 bg-amber-950 border border-amber-500/60 text-amber-300 rounded text-[9px] font-bold">🙏 功德 +${p.gongdeStacks}</span>`);
    }
    if (p.id === "jiangwanan") {
      bList.push(p.dodgeReady
        ? `<span class="px-1.5 py-0.5 bg-sky-950 border border-sky-400 text-sky-300 rounded text-[9px] font-bold">🛡️ 閃避就緒</span>`
        : `<span class="px-1.5 py-0.5 bg-slate-900 border border-slate-700 text-slate-400 rounded text-[9px]">閃避(${p.dodgeCdRemain}s)</span>`);
    }
    if (p.stealthRemain > 0) {
      bList.push(`<span class="px-1.5 py-0.5 bg-purple-950 border border-purple-400 text-purple-300 rounded text-[9px] font-bold">🕵️ 隱蔽 ${p.stealthRemain}s</span>`);
    }
    if (p.reflectRemain > 0) {
      bList.push(`<span class="px-1.5 py-0.5 bg-rose-950 border border-rose-400 text-rose-300 rounded text-[9px] font-bold">🪞 反彈 ${p.reflectRemain}s</span>`);
    }
    if (p.milkDefBuffRemain > 0) {
      bList.push(`<span class="px-1.5 py-0.5 bg-emerald-950 border border-emerald-400 text-emerald-300 rounded text-[9px] font-bold">🥛 防禦+5 (${p.milkDefBuffRemain}s)</span>`);
    }
    if (p.weakenedRemain > 0) {
      bList.push(`<span class="px-1.5 py-0.5 bg-rose-950 border border-rose-600 text-rose-300 rounded text-[9px] font-bold">💤 虛弱 ${p.weakenedRemain}s</span>`);
    }
    if (isChaoGeAuraAffecting(p)) {
      bList.push(`<span class="px-1.5 py-0.5 bg-rose-950 border border-rose-500 text-rose-300 rounded text-[9px] font-bold">👊 超派破防 -20%</span>`);
    }
    badgesEl.innerHTML = bList.join("");
  }

  // HP / SP 進度條
  const hpBar = document.getElementById("hp-bar");
  if (hpBar) hpBar.style.width = `${Math.max(0, Math.min(100, (p.hp / p.maxHp) * 100))}%`;
  const hpText = document.getElementById("hp-text");
  if (hpText) hpText.textContent = `${p.hp}/${p.maxHp}`;

  const spBar = document.getElementById("sp-bar");
  if (spBar) spBar.style.width = `${Math.max(0, Math.min(100, (p.sp / p.maxSp) * 100))}%`;
  const spText = document.getElementById("sp-text");
  if (spText) spText.textContent = `${p.sp}/${p.maxSp}`;

  // 4. 渲染 6 格裝備與目標追蹤器
  renderEquipSixGrid(p);
  renderTargetTracker();

  // 5. 渲染 6 格隨身背包
  const invGrid = document.getElementById("inventory-grid");
  if (invGrid) {
    const slots = [];
    for (let i = 0; i < 6; i++) {
      const itemId = p.bag[i];
      if (itemId) {
        const item = getSafeItem(itemId);
        const rarity = ItemRegistry.getRarity(itemId);
        const badge = formatItemStatBadge(item);
        slots.push(`
          <div draggable="true"
               ondragstart="handleDragStartBag(event, ${i})"
               onclick="openItemInfoModal('${itemId}', 'bag', ${i})"
               class="h-[46px] px-2 py-1 rounded-lg border ${rarity.border} ${rarity.bg} flex flex-col justify-between cursor-pointer hover:brightness-110 transition select-none">
            <div class="text-xs font-black ${rarity.text} truncate">${item ? item.name : itemId}</div>
            <div class="text-[9px] font-mono text-amber-300/90 text-right">${badge}</div>
          </div>
        `);
      } else {
        slots.push(`
          <div class="h-[46px] rounded-lg border border-slate-800/80 bg-slate-900/40 flex items-center justify-center text-[11px] text-slate-600 font-mono select-none">
            空
          </div>
        `);
      }
    }
    invGrid.innerHTML = slots.join("");
  }

  // 6. 若在戰鬥中，同步更新敵方血量與技能鈕狀態
  if (state.inCombat && state.ai) {
    const enemy = state.ai;
    const eName = document.getElementById("enemy-name");
    if (eName) eName.textContent = `${enemy.name} ${enemy.title ? `(${enemy.title})` : ''}`;
    const eStats = document.getElementById("enemy-stats");
    if (eStats) eStats.textContent = `攻擊 ${getTotalAtk(enemy)} | 防禦 ${getTotalDef(enemy)}`;
    const eHpText = document.getElementById("enemy-hp-text");
    if (eHpText) eHpText.textContent = `HP: ${enemy.hp}/${enemy.maxHp}`;
    const eHpBar = document.getElementById("enemy-hp-bar");
    if (eHpBar) eHpBar.style.width = `${Math.max(0, Math.min(100, (enemy.hp / enemy.maxHp) * 100))}%`;

    const combatSkillBtn = document.getElementById("btn-combat-skill");
    if (combatSkillBtn && p.skill) {
      if (p.skillCdRemain > 0) {
        combatSkillBtn.innerHTML = `<span>⏳ ${p.skill.name} (${p.skillCdRemain}s)</span>`;
      } else {
        combatSkillBtn.innerHTML = `<span>✨ ${p.skill.name} (-${p.skill.sp}SP)</span>`;
      }
    }
  }
}
