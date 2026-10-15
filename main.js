/**
 * 【模組：核心管家 main.js】
 * v58：
 * 1. 已清空舊道具與配方，保留完整裝備欄與圖鑑框架
 * 2. 支援首頁玩家選角 + 正常模式 8 位不重複 AI
 * 3. 支援角色測試模式（唯一地圖：立法院 + 自選電腦對手）
 * 4. 完整實裝 9 位角色主被動讀秒、超哥同地區破防 -20%、王世間 12 秒結束算 CD、韓國魚雷達警告
 */

const ItemRegistry = {
  RARITY: {
    1: { name: "白色普通", shortName: "普通", border: "border-slate-500", text: "text-slate-200", iconColor: "text-slate-300", badge: "bg-slate-700 text-slate-200", glow: "" },
    2: { name: "綠色精良", shortName: "精良", border: "border-emerald-500", text: "text-emerald-400", iconColor: "text-emerald-400", badge: "bg-emerald-950 border border-emerald-500 text-emerald-300", glow: "shadow-sm shadow-emerald-900/40" },
    3: { name: "藍色稀有", shortName: "稀有", border: "border-sky-500", text: "text-sky-400", iconColor: "text-sky-400", badge: "bg-sky-950 border border-sky-500 text-sky-300", glow: "shadow-sm shadow-sky-900/40" },
    4: { name: "黃色史詩", shortName: "史詩", border: "border-amber-400", text: "text-amber-300", iconColor: "text-amber-300", badge: "bg-amber-950 border border-amber-400 text-amber-300", glow: "shadow-sm shadow-amber-900/40" },
    5: { name: "紅色傳說", shortName: "傳說", border: "border-rose-500", text: "text-rose-400", iconColor: "text-rose-400", badge: "bg-rose-950 border border-rose-500 text-rose-300", glow: "shadow-sm shadow-rose-900/50" }
  },

  ALIAS: {},
  RARITY_MAP: {},

  get(id) {
    if (!id) return null;
    const resolvedId = this.ALIAS[id] || id;

    const pools = [
      typeof GAME_DATA !== 'undefined' ? GAME_DATA.items : null,
      typeof WEAPONS_DATA !== 'undefined' ? WEAPONS_DATA.items : null,
      typeof ARMORS_DATA !== 'undefined' ? ARMORS_DATA.items : null,
      typeof MATERIALS_DATA !== 'undefined' ? MATERIALS_DATA.items : null,
      typeof FOODS_DATA !== 'undefined' ? FOODS_DATA.items : null,
      window.ITEMS_WEAPON,
      window.ITEMS_ARMOR,
      window.ITEMS_MATERIAL,
      window.ITEMS_FOOD
    ];

    for (const p of pools) {
      if (p && p[resolvedId]) return p[resolvedId];
      if (p && p[id]) return p[id];
    }

    return null;
  },

  getAllUniqueItems() {
    const map = new Map();
    const pools = [
      typeof WEAPONS_DATA !== 'undefined' ? WEAPONS_DATA.items : null,
      typeof ARMORS_DATA !== 'undefined' ? ARMORS_DATA.items : null,
      typeof MATERIALS_DATA !== 'undefined' ? MATERIALS_DATA.items : null,
      typeof FOODS_DATA !== 'undefined' ? FOODS_DATA.items : null,
      window.ITEMS_WEAPON,
      window.ITEMS_ARMOR,
      window.ITEMS_MATERIAL,
      window.ITEMS_FOOD,
      typeof GAME_DATA !== 'undefined' ? GAME_DATA.items : null
    ];

    pools.forEach(pool => {
      if (!pool) return;
      Object.keys(pool).forEach(key => {
        const canonicalId = this.ALIAS[key] || key;
        const itemObj = pool[canonicalId] || pool[key];
        if (itemObj && !map.has(canonicalId)) {
          map.set(canonicalId, { ...itemObj, id: canonicalId });
        }
      });
    });

    return Array.from(map.values());
  },

  getRarity(id) {
    const resolvedId = this.ALIAS[id] || id;
    const level = this.RARITY_MAP[resolvedId] || 1;
    return { level, ...this.RARITY[level] };
  }
};

const DEV_CONFIG = {
  enableZoneClose: true,
  enableNPC: true,
  isTestMode: false
};

const EQUIP_SLOT_SVGS = {
  weapon: `<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 17.5L3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/><path d="M19 21l2-2"/></svg>`,
  head:   `<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 18v-4a8 8 0 1 1 16 0v4"/><path d="M2 18h20"/></svg>`,
  chest:  `<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9,2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>`,
  arm:    `<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>`,
  leg:    `<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 3v11l-3 4v3h14v-3l-3-4V3H7z"/></svg>`,
  acc:    `<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="14" r="6"/><path d="M9 5l3-2 3 2-3 3-3-3z"/></svg>`
};

const BS_ZONE_ROUNDS = [
  { round: 1, duration: 90, warnCount: 4, isPermanent: false, name: "第 1 輪 (白天)" },
  { round: 2, duration: 90, warnCount: 4, isPermanent: false, name: "第 2 輪 (白天)" },
  { round: 3, duration: 90, warnCount: 8, isPermanent: false, name: "第 3 輪 (白天)" },
  { round: 4, duration: 90, warnCount: 8, isPermanent: false, name: "第 4 輪 (入夜)" },
  { round: 5, duration: 90, warnCount: 8, isPermanent: false, name: "第 5 輪 (入夜)" },
  { round: 6, duration: 90, warnCount: 6, isPermanent: true,  name: "第 6 輪 (第 2 天・永久封閉)" },
  { round: 7, duration: 90, warnCount: 4, isPermanent: true,  name: "第 7 輪 (第 2 天・準決賽)" },
  { round: 8, duration: 90, warnCount: 2, isPermanent: true,  name: "第 8 輪 (決賽圈)" },
  { round: 9, duration: 90, warnCount: 0, isPermanent: true,  name: "最終決賽 (終極死鬥)" }
];

const state = {
  timeSec: 0,
  currentRoundIdx: 0,
  roundTimeRemain: 90,
  pendingCloseZones: [],
  closedZones: [],
  activeZones: [],
  inCombat: false,
  gameOver: false,
  isSearching: false,
  player: null,
  ai: null,      // 當前交鋒的目標 AI
  ais: [],       // 場上所有電腦 AI 陣列
  trackedItemId: null
};

function createRuntimeUnit(template, startZoneId) {
  const unit = JSON.parse(JSON.stringify(template));
  unit.zone = startZoneId || "ly";
  unit.alive = true;
  unit.skillCdRemain = 0;
  unit.stunRemain = 0;
  unit.pigReviveUsed = false;
  unit.hitTakenCount = 0;
  unit.meritCount = 0;
  unit.weakRemain = 0;
  unit.guanDefBuffRemain = 0;
  unit.guanPassiveCd = 0;
  unit.reflectRemain = 0;
  unit.stealthRemain = 0;
  unit.milkDefBuffRemain = 0;
  unit.dodgeReady = (unit.id === "jiangwanan");
  unit.dodgeCdRemain = 0;
  return unit;
}

// 韓國魚被動【禿子跟著月亮走】：當韓國魚先在該地圖，後續有人進入時跳出警告
function checkHanguoyuRadar(enteringUnit, targetZoneId) {
  const p = state.player;
  if (!p || !p.alive || p.id !== "hanguoyu") return;
  if (enteringUnit === p) return;

  if (p.zone === targetZoneId) {
    const zName = getSafeCurrentZone(targetZoneId).name;
    addLog(`🚨 <span class="text-rose-400 font-black">【禿子跟著月亮走】</span> 警告！【${enteringUnit.name}】踏入了你所在的【${zName}】！`, "text-rose-400 font-bold");

    const banner = document.getElementById("radar-warning-banner");
    if (banner) {
      banner.textContent = `🚨 禿子雷達警報：【${enteringUnit.name}】進入了${zName}！`;
      banner.classList.remove("hidden");
      setTimeout(() => banner.classList.add("hidden"), 3500);
    }
  }
}

function triggerPlayerBloodHitEffect() {
  const overlay = document.getElementById("fps-blood-hit-overlay");
  if (!overlay) return;
  overlay.classList.add("hit-active");
  setTimeout(() => overlay.classList.remove("hit-active"), 220);
}

function spawnFloatingDamage(containerEl, text, isCrit = false) {
  if (!containerEl) return;
  const tag = document.createElement("div");
  tag.className = `floating-dmg-tag ${isCrit ? 'text-amber-300 text-lg font-black' : 'text-rose-400 text-sm font-bold'}`;
  tag.textContent = text;
  tag.style.left = `${Math.floor(Math.random() * 40) + 30}%`;
  tag.style.top = `-10px`;
  containerEl.appendChild(tag);
  setTimeout(() => tag.remove(), 750);
}

function getSafeZones() {
  if (Array.isArray(state.activeZones) && state.activeZones.length > 0) {
    return state.activeZones;
  }
  if (typeof MAPS_DATA !== 'undefined' && Array.isArray(MAPS_DATA.zones)) {
    return MAPS_DATA.zones;
  }
  return [{ id: "ly", name: "立法院", icon: "🏛️", x: 50, y: 52, drops: [] }];
}

function getSafeCurrentZone(zoneId) {
  const zones = getSafeZones();
  const found = zones.find(z => z.id === zoneId);
  return found || zones[0] || { id: "ly", name: "立法院", icon: "🏛️", drops: [] };
}

function getSafeRecipes() {
  if (typeof RECIPES_DATA !== 'undefined' && Array.isArray(RECIPES_DATA.recipes)) {
    return RECIPES_DATA.recipes;
  }
  return [];
}

function getSafeItem(itemId) {
  return ItemRegistry.get(itemId);
}

function getItemDisplayName(itemId) {
  const it = ItemRegistry.get(itemId);
  return it ? it.name : (itemId || "空");
}

function getItemDropLocationName(itemId) {
  const zones = getSafeZones();
  const resolvedId = ItemRegistry.ALIAS[itemId] || itemId;

  const matchingZones = zones.filter(z => z.drops && (
    z.drops.includes(itemId) || z.drops.includes(resolvedId)
  ));

  if (matchingZones.length > 0) {
    return matchingZones.slice(0, 3).map(z => z.name).join(" / ");
  }
  return "待配置";
}

function getMissingTrackedMaterials() {
  if (!state.trackedItemId || !state.player) return [];
  const recipes = getSafeRecipes();
  const resolvedTarget = ItemRegistry.ALIAS[state.trackedItemId] || state.trackedItemId;
  const recipe = recipes.find(r => (ItemRegistry.ALIAS[r.result] || r.result) === resolvedTarget);

  const ownedIds = [...(state.player.bag || [])].map(id => ItemRegistry.ALIAS[id] || id);
  if (state.player.equip) {
    Object.values(state.player.equip).forEach(it => {
      if (it) ownedIds.push(ItemRegistry.ALIAS[it.id] || it.id);
    });
  }

  if (recipe) {
    return recipe.materials.filter(mId => !ownedIds.includes(ItemRegistry.ALIAS[mId] || mId));
  } else {
    return ownedIds.includes(resolvedTarget) ? [] : [resolvedTarget];
  }
}

// 檢查同地區是否有其他存活的【超哥】觸發「超派～」減防 20%
function isChaoGeAuraAffecting(unit) {
  if (!unit || !state.player) return false;
  const allUnits = [state.player, ...(state.ais || [])];
  return allUnits.some(other =>
    other && other.alive && other !== unit && other.id === "chaoge" && other.zone === unit.zone
  );
}

function getTotalAtk(unit) {
  if (!unit) return 0;
  let total = unit.baseAtk || 0;
  if (unit.equip) {
    Object.values(unit.equip).forEach(item => {
      if (item && item.atk) total += item.atk;
    });
  }
  // 賴祥德【做功德】：每點功德 +1 攻擊，上限 10
  if (unit.id === "laixiangde" && unit.meritCount > 0) {
    total += Math.min(10, unit.meritCount);
  }
  // 陳阿館【三槍】副作用：10 秒內攻擊力減半
  if (unit.weakRemain > 0) {
    total = Math.floor(total * 0.5);
  }
  return Math.max(1, total);
}

function getTotalDef(unit) {
  if (!unit) return 0;
  let total = unit.baseDef || 0;
  if (unit.equip) {
    Object.values(unit.equip).forEach(item => {
      if (item && item.def) total += item.def;
    });
  }
  // 陳阿館【幫我開直播】+6 防禦
  if (unit.guanDefBuffRemain > 0) total += 6;
  // 蔣晚安【生生喝鮮乳】+5 防禦
  if (unit.milkDefBuffRemain > 0) total += 5;
  // 超哥【超派～】同地區其他角色防禦降低 20%
  if (isChaoGeAuraAffecting(unit)) {
    total = Math.floor(total * 0.8);
  }
  return Math.max(0, total);
}

function pickRandomWarningZones(count) {
  const allZones = getSafeZones();
  const openZones = allZones.filter(z => !state.closedZones.includes(z.id));
  
  if (openZones.length <= 1) return [];
  const actualCount = Math.min(count, openZones.length - 1);
  const shuffled = [...openZones].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, actualCount).map(z => z.id);
}

function initGame(isSandbox = false, selectedPlayerId = "zhugouliang", customTestBotIds = []) {
  DEV_CONFIG.isTestMode = isSandbox;
  DEV_CONFIG.enableZoneClose = !isSandbox;

  state.timeSec = 0;
  state.currentRoundIdx = 0;
  state.roundTimeRemain = BS_ZONE_ROUNDS[0].duration;
  state.closedZones = [];
  state.inCombat = false;
  state.gameOver = false;
  state.isSearching = false;
  state.trackedItemId = null;

  const fullMaps = (typeof MAPS_DATA !== 'undefined' && Array.isArray(MAPS_DATA.zones)) ? MAPS_DATA.zones : [];
  if (isSandbox) {
    // 測試模式：唯一地圖僅限【立法院】
    const lyZone = fullMaps.find(z => z.id === "ly") || { id: "ly", name: "立法院", icon: "🏛️", x: 50, y: 52, drops: [] };
    state.activeZones = [lyZone];
  } else {
    state.activeZones = [...fullMaps];
  }

  if (DEV_CONFIG.enableZoneClose) {
    state.pendingCloseZones = pickRandomWarningZones(BS_ZONE_ROUNDS[0].warnCount);
  } else {
    state.pendingCloseZones = [];
  }

  // 1. 建立玩家角色
  const pTemplate = GAME_CHARACTERS[selectedPlayerId] || Object.values(GAME_CHARACTERS)[0];
  state.player = createRuntimeUnit(pTemplate, "ly");

  // 2. 建立電腦 AI 陣列（正常模式：剩下的 8 個角色不重複；測試模式：依玩家勾選放入立法院）
  state.ais = [];
  if (isSandbox) {
    customTestBotIds.forEach(botId => {
      if (botId !== state.player.id && GAME_CHARACTERS[botId]) {
        state.ais.push(createRuntimeUnit(GAME_CHARACTERS[botId], "ly"));
      }
    });
    DEV_CONFIG.enableNPC = state.ais.length > 0;
  } else {
    const remainingIds = Object.keys(GAME_CHARACTERS).filter(id => id !== state.player.id);
    remainingIds.forEach((botId, idx) => {
      const spawnZone = state.activeZones[idx % state.activeZones.length]?.id || "ly";
      state.ais.push(createRuntimeUnit(GAME_CHARACTERS[botId], spawnZone));
    });
    DEV_CONFIG.enableNPC = true;
  }

  state.ai = state.ais[0] || null;

  const logEl = document.getElementById("game-log");
  if (logEl) logEl.innerHTML = "";

  if (isSandbox) {
    const botNames = state.ais.map(a => a.name).join("、") || "無電腦 (0人)";
    addLog(`🏛️ 【立法院測試模式】你選擇了【${state.player.name}】！場上電腦：${botNames}`, "text-emerald-400 font-bold");
  } else {
    addLog(`🔥 台灣生存戰開局！你選擇了【${state.player.name}】，其餘 8 位角色已散佈全島！`, "text-amber-300 font-bold");
    const warnNames = state.pendingCloseZones.map(id => getSafeCurrentZone(id).name).join("、");
    if (warnNames) {
      addLog(`⚠️ 【第 1 輪預告】${warnNames} 將在 1 分 30 秒後成為暫時禁區！`, "text-amber-400");
    }
  }

  closeMapModal();
  closeItemInfoModal();
  closeCraftBookModal();
  updateUI();
  startGameLoop();
}

function advanceZoneRound() {
  const currentCfg = BS_ZONE_ROUNDS[state.currentRoundIdx];

  if (!currentCfg.isPermanent) {
    const reopenedList = [...state.closedZones];
    state.closedZones = [...state.pendingCloseZones];

    if (reopenedList.length > 0) {
      const reNames = reopenedList.map(id => getSafeCurrentZone(id).name).join("、");
      addLog(`🔓 【區域輪替】${reNames} 已重新解禁開放！`, "text-emerald-400 font-bold");
    }
    const newClosedNames = state.closedZones.map(id => getSafeCurrentZone(id).name).join("、");
    addLog(`🚫 【暫時禁區】${newClosedNames} 已實施管制！`, "text-rose-500 font-bold");

  } else {
    state.pendingCloseZones.forEach(id => {
      if (!state.closedZones.includes(id)) {
        state.closedZones.push(id);
      }
    });

    if (state.currentRoundIdx === 5) {
      addLog(`☠️ 【進入第 2 天】管制升級！所有禁區即刻起「永久封閉」，不再解鎖！`, "text-rose-500 font-black");
    } else {
      addLog(`🚫 【永久禁區追加】全島已累計封閉 ${state.closedZones.length} 個區域！`, "text-rose-500 font-bold");
    }
  }

  if (state.closedZones.includes(state.player.zone)) {
    state.player.hp = Math.max(1, state.player.hp - 35);
    triggerPlayerBloodHitEffect();
    addLog(`⚡ 你滯留在禁區內遭受高壓電網驅離，受到 35 點傷害！請盡速撤離！`, "text-rose-500 font-black");
  }

  state.currentRoundIdx = Math.min(state.currentRoundIdx + 1, BS_ZONE_ROUNDS.length - 1);
  const nextCfg = BS_ZONE_ROUNDS[state.currentRoundIdx];
  state.roundTimeRemain = nextCfg.duration;

  if (nextCfg.warnCount > 0) {
    state.pendingCloseZones = pickRandomWarningZones(nextCfg.warnCount);
    const nextWarnNames = state.pendingCloseZones.map(id => getSafeCurrentZone(id).name).join("、");
    addLog(`⚠️ 【${nextCfg.name} 預警】${nextWarnNames} 列入下輪封鎖名單！`, "text-amber-400 font-bold");
  } else {
    state.pendingCloseZones = [];
    addLog(`🔥 【最終死鬥】全島僅存最後安全區，決一死戰！`, "text-rose-400 font-black");
  }
}

function tickUnitTimers1s(unit) {
  if (!unit || !unit.alive) return;

  if (unit.stunRemain > 0) unit.stunRemain--;
  if (unit.weakRemain > 0) unit.weakRemain--;
  if (unit.guanDefBuffRemain > 0) unit.guanDefBuffRemain--;
  if (unit.guanPassiveCd > 0) unit.guanPassiveCd--;
  if (unit.reflectRemain > 0) unit.reflectRemain--;
  if (unit.milkDefBuffRemain > 0) unit.milkDefBuffRemain--;

  // 王世間【Over my dead body】：12 秒結束後才開始算冷卻
  if (unit.stealthRemain > 0) {
    unit.stealthRemain--;
    if (unit.stealthRemain === 0) {
      unit.skillCdRemain = unit.skill.cd;
      if (unit === state.player) {
        addLog(`👻 【Over my dead body】12 秒隱蔽結束！正式開始計算 ${unit.skill.cd} 秒冷卻。`, "text-sky-400");
      }
    }
  } else if (unit.skillCdRemain > 0) {
    unit.skillCdRemain--;
  }

  // 蔣晚安【問A答B】閃避冷卻
  if (unit.id === "jiangwanan" && !unit.dodgeReady && unit.dodgeCdRemain > 0) {
    unit.dodgeCdRemain--;
    if (unit.dodgeCdRemain === 0) {
      unit.dodgeReady = true;
      if (unit === state.player) {
        addLog(`💨 被動【問A答B】充能完畢！下次受到攻擊將自動閃躲。`, "text-sky-400");
      }
    }
  }
}

let gameInterval = null;
function startGameLoop() {
  if (gameInterval) clearInterval(gameInterval);
  let tickCount = 0;
  
  gameInterval = setInterval(() => {
    if (state.gameOver || !state.player) return;
    tickCount++;

    if (tickCount % 10 === 0) {
      state.timeSec++;

      // 每秒更新玩家與所有 AI 的技能/Buff 讀秒
      tickUnitTimers1s(state.player);
      state.ais.forEach(ai => tickUnitTimers1s(ai));

      // 每 3 秒自動回復 5 點體力
      if (state.timeSec % 3 === 0) {
        if (state.player.sp < state.player.maxSp) {
          state.player.sp = Math.min(state.player.maxSp, state.player.sp + 5);
        }
      }

      if (DEV_CONFIG.enableZoneClose) {
        state.roundTimeRemain--;

        if (state.roundTimeRemain === 20) {
          const warnNames = state.pendingCloseZones.map(id => getSafeCurrentZone(id).name).join("、");
          addLog(`⏰ 【倒數 20 秒】禁區即將封鎖！請位於 ${warnNames} 的生還者立刻撤離！`, "text-amber-300 font-black");
        }

        if (state.roundTimeRemain <= 0) {
          advanceZoneRound();
        }
      }

      if (DEV_CONFIG.enableNPC && state.timeSec % 4 === 0) {
        if (typeof runAIBrain === 'function') runAIBrain();
      }

      updateUI();
    }
  }, 100);
}

function addLog(msg, color = "text-slate-300") {
  const logEl = document.getElementById("game-log");
  if (!logEl) return;
  const timeStr = Math.floor(state.timeSec / 60).toString().padStart(2, '0') + ":" + (state.timeSec % 60).toString().padStart(2, '0');
  const div = document.createElement("div");
  div.className = `${color} leading-relaxed`;
  div.innerHTML = `<span class="text-slate-600">[${timeStr}]</span> ${msg}`;
  logEl.prepend(div);
}

function findAvailableRecipes(unit) {
  const recipes = getSafeRecipes();
  if (recipes.length === 0) return [];
  const ownedIds = [...unit.bag].map(id => ItemRegistry.ALIAS[id] || id);
  if (unit.equip) {
    Object.values(unit.equip).forEach(it => {
      if (it) ownedIds.push(ItemRegistry.ALIAS[it.id] || it.id);
    });
  }
  return recipes.filter(r => r.materials.every(m => ownedIds.includes(ItemRegistry.ALIAS[m] || m)));
}

function craftItem(unit, recipe, isPlayer = true) {
  if (!recipe) return;
  recipe.materials.forEach(matId => {
    const targetMat = ItemRegistry.ALIAS[matId] || matId;
    const bagIdx = unit.bag.findIndex(bId => (ItemRegistry.ALIAS[bId] || bId) === targetMat);
    if (bagIdx !== -1) {
      unit.bag.splice(bagIdx, 1);
    } else if (unit.equip) {
      Object.keys(unit.equip).forEach(slot => {
        if (unit.equip[slot] && (ItemRegistry.ALIAS[unit.equip[slot].id] || unit.equip[slot].id) === targetMat) {
          unit.equip[slot] = null;
        }
      });
    }
  });

  const newItem = getSafeItem(recipe.result);
  if (!newItem) return;
  const slot = newItem.type;

  if (unit.equip && unit.equip[slot] !== undefined) {
    const currentEquip = unit.equip[slot];
    if (!currentEquip || (newItem.score || 0) > (currentEquip.score || 0)) {
      if (currentEquip) unit.bag.push(currentEquip.id);
      unit.equip[slot] = newItem;
      if (isPlayer) addLog(`成功合成並自動穿戴：【${newItem.name}】！`, "text-amber-400 font-bold");
    } else {
      unit.bag.push(newItem.id);
      if (isPlayer) addLog(`成功合成：【${newItem.name}】（已放背包）！`, "text-emerald-400 font-bold");
    }
  } else {
    unit.bag.push(newItem.id);
    if (isPlayer) addLog(`成功合成：【${newItem.name}】！`, "text-emerald-400 font-bold");
  }
  updateUI();
}

function triggerSearch() {
  if (state.gameOver || state.inCombat || state.isSearching || !state.player) return;
  const p = state.player;

  if (p.stunRemain > 0) {
    addLog(`⛔ 你正被【歌廳秀】定身中（剩餘 ${p.stunRemain} 秒），無法搜刮！`, "text-rose-400 font-bold");
    return;
  }

  if (p.sp < 15) {
    addLog("體力不足（小於 15），無法搜刮！", "text-rose-400");
    return;
  }

  p.sp -= 15;
  state.isSearching = true;
  updateUI();

  // 王世間【從從容容】：主動技期間搜刮速度變 1.5 倍（3000ms -> 2000ms）
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

  let elapsed = 0;
  const searchInterval = setInterval(() => {
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

// 供韓國魚【發大財！】與一般搜刮共用的摸物資函式
function lootMultipleItemsForPlayer(count = 1) {
  const p = state.player;
  const currentZoneObj = getSafeCurrentZone(p.zone);
  const dropPool = (currentZoneObj.drops && currentZoneObj.drops.length > 0) ? currentZoneObj.drops : [];

  if (dropPool.length === 0) {
    addLog(`🔍 搜刮完成（目前全島道具、材料與食物已清空，待後續重新設計）。`, "text-slate-400");
    return;
  }

  for (let i = 0; i < count; i++) {
    const dropId = dropPool[Math.floor(Math.random() * dropPool.length)];
    const item = getSafeItem(dropId);
    if (!item) continue;

    const slot = item.type;
    if (p.equip && p.equip[slot] === null) {
      p.equip[slot] = item;
      addLog(`搜刮獲得並裝備【${item.name}】！`, "text-amber-300 font-bold");
    } else if (p.bag.length < 6) {
      p.bag.push(item.id);
      addLog(`搜刮獲得【${item.name}】！`, "text-emerald-300");
    } else {
      addLog(`背包已滿（6/6），錯過了【${item.name}】！`, "text-rose-400");
    }
  }
}

function executeSearchFinish() {
  const p = state.player;

  // 若玩家非處於王世間【Over my dead body】期間，可搜到同區域未隱蔽的存活 AI
  if ((p.stealthRemain || 0) <= 0 && DEV_CONFIG.enableNPC) {
    const sameZoneAIs = state.ais.filter(a =>
      a && a.alive && a.zone === p.zone && (a.stealthRemain || 0) <= 0
    );

    if (sameZoneAIs.length > 0 && Math.random() < 0.70) {
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
    addLog(`⛔ 你正處於定身狀態，無法移動！`, "text-rose-400 font-bold");
    closeMapModal();
    return;
  }

  if (p.zone === targetZoneId) {
    closeMapModal();
    return;
  }

  if (state.closedZones.includes(targetZoneId)) {
    addLog("該區域已列為禁區，無法進入！", "text-rose-500 font-bold");
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
  addLog(`移動到了【${targetZone.name}】。`, "text-indigo-300");

  if (isChaoGeAuraAffecting(p)) {
    addLog(`⚠️ 【超哥】正在此地區！受被動「超派～」影響，你的防禦力降低 20%！`, "text-rose-400 font-bold");
  }

  closeMapModal();
  updateUI();
}

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

function renderTargetTracker() {
  const trackerBox = document.getElementById("target-tracker-box");
  if (!trackerBox) return;

  if (!state.trackedItemId) {
    trackerBox.classList.add("hidden");
    return;
  }

  const targetItem = getSafeItem(state.trackedItemId);
  if (!targetItem) {
    trackerBox.classList.add("hidden");
    return;
  }

  const rarity = ItemRegistry.getRarity(targetItem.id);
  trackerBox.classList.remove("hidden");
  
  trackerBox.innerHTML = `
    <div class="flex justify-between items-center border-b border-slate-700/50 pb-1 mb-1">
      <span class="text-[9px] font-black tracking-wider text-amber-400 uppercase flex items-center gap-1">
        <span>🎯 目標追蹤</span>
      </span>
      <div class="flex items-center gap-1">
        <span class="text-[11px] font-bold ${rarity.text} truncate max-w-[95px]">${targetItem.name}</span>
        <button onclick="clearTrackedItem(event)" class="text-slate-400 hover:text-rose-400 text-xs px-1 font-mono transition" title="取消追蹤">✕</button>
      </div>
    </div>
    <div id="tracker-materials-list-inner" class="space-y-0.5 text-[10px] font-mono text-slate-300"></div>
  `;
}

function getItemRecipeTree(itemId) {
  const resolvedId = ItemRegistry.ALIAS[itemId] || itemId;
  const recipes = getSafeRecipes();
  const downstream = recipes.find(r => (ItemRegistry.ALIAS[r.result] || r.result) === resolvedId) || null;
  const upstream = recipes.filter(r => r.materials.some(m => (ItemRegistry.ALIAS[m] || m) === resolvedId)).map(r => ({
    resultId: r.result,
    resultItem: getSafeItem(r.result),
    recipe: r
  }));

  return { downstream, upstream };
}

function inspectItemById(itemId) {
  const item = getSafeItem(itemId);
  if (!item) return;
  activeInspectTarget = { type: 'tree_nav', indexOrKey: item.id };
  showItemInfoModal(item, '物品詳細情報', false);
}

let currentCraftTab = 'all';

function openCraftBookModal() {
  const modal = document.getElementById("craft-book-modal");
  if (modal) {
    modal.classList.remove("hidden");
    filterCraftBook('all');
  }
}

function closeCraftBookModal() {
  const modal = document.getElementById("craft-book-modal");
  if (modal) modal.classList.add("hidden");
}

function filterCraftBook(tab) {
  currentCraftTab = tab;
  const tabs = ['all', 1, 2, 3, 4, 5];
  const inactiveColors = {
    all: "text-slate-300",
    1: "text-slate-300",
    2: "text-emerald-400",
    3: "text-sky-400",
    4: "text-amber-300",
    5: "text-rose-400"
  };

  tabs.forEach(t => {
    const btn = document.getElementById(`craft-tab-${t}`);
    if (btn) {
      btn.className = (t === tab)
        ? "py-1.5 rounded-lg bg-indigo-600 text-white font-black transition shadow"
        : `py-1.5 rounded-lg bg-slate-800 ${inactiveColors[t]} font-bold transition hover:bg-slate-700`;
    }
  });

  renderCraftBookList();
}

function renderCraftBookList() {
  const listEl = document.getElementById("craft-recipes-list");
  if (!listEl) return;

  let allItems = ItemRegistry.getAllUniqueItems();

  if (currentCraftTab !== 'all') {
    allItems = allItems.filter(it => ItemRegistry.getRarity(it.id).level === Number(currentCraftTab));
  }

  if (allItems.length === 0) {
    listEl.innerHTML = `<div class="text-center text-slate-500 py-8 text-xs">目前舊道具、材料與食物已全部清空，等待重新設計</div>`;
    return;
  }
}

// 觸控拖曳系統
let touchState = {
  active: false,
  isDragging: false,
  bagIndex: null,
  startX: 0,
  startY: 0,
  ghostEl: null
};

function handleItemTouchStart(e, index) {
  if (state.gameOver || state.isSearching) return;
  const touch = e.touches[0];
  touchState.active = true;
  touchState.isDragging = false;
  touchState.bagIndex = index;
  touchState.startX = touch.clientX;
  touchState.startY = touch.clientY;
}

function handleItemTouchMove(e) {
  if (!touchState.active) return;
  const touch = e.touches[0];
  const deltaX = Math.abs(touch.clientX - touchState.startX);
  const deltaY = Math.abs(touch.clientY - touchState.startY);

  if (!touchState.isDragging && (deltaX > 6 || deltaY > 6)) {
    const item = getSafeItem(state.player.bag[touchState.bagIndex]);
    if (!item) return;
    touchState.isDragging = true;
    const rarity = ItemRegistry.getRarity(item.id);

    const ghost = document.createElement("div");
    ghost.id = "touch-drag-ghost";
    ghost.className = `fixed pointer-events-none z-[9999] px-3 py-1.5 bg-slate-900 ${rarity.text} border-2 ${rarity.border} font-black text-xs rounded-xl shadow-2xl scale-110 opacity-90 transition-transform`;
    ghost.textContent = item.name;
    document.body.appendChild(ghost);
    touchState.ghostEl = ghost;
  }

  if (touchState.isDragging && touchState.ghostEl) {
    e.preventDefault();
    touchState.ghostEl.style.left = `${touch.clientX - 40}px`;
    touchState.ghostEl.style.top = `${touch.clientY - 45}px`;

    const hoveredEl = document.elementFromPoint(touch.clientX, touch.clientY);
    const yellowZone = document.getElementById("explore-panel");
    const redZone = document.getElementById("drop-zone-red");

    if (yellowZone && yellowZone.contains(hoveredEl)) yellowZone.classList.add("drag-over-yellow");
    else if (yellowZone) yellowZone.classList.remove("drag-over-yellow");

    if (redZone && redZone.contains(hoveredEl)) redZone.classList.add("drag-over-red");
    else if (redZone) redZone.classList.remove("drag-over-red");
  }
}

function handleItemTouchEnd(e) {
  if (!touchState.active) return;

  const yellowZone = document.getElementById("explore-panel");
  const redZone = document.getElementById("drop-zone-red");
  if (yellowZone) yellowZone.classList.remove("drag-over-yellow");
  if (redZone) redZone.classList.remove("drag-over-red");

  if (touchState.ghostEl) {
    touchState.ghostEl.remove();
    touchState.ghostEl = null;
  }

  if (touchState.isDragging) {
    const touch = e.changedTouches[0];
    const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);

    if (yellowZone && yellowZone.contains(dropTarget)) {
      applyItemDropToYellow(touchState.bagIndex);
    } else if (redZone && redZone.contains(dropTarget)) {
      applyItemDropToRed(touchState.bagIndex);
    }
  } else {
    inspectBagItem(touchState.bagIndex);
  }

  touchState.active = false;
  touchState.isDragging = false;
  touchState.bagIndex = null;
}

function applyItemDropToYellow(bagIdx) {
  if (bagIdx === null || !state.player) return;
  const p = state.player;
  const itemName = getItemDisplayName(p.bag[bagIdx]);

  p.bag.splice(bagIdx, 1);
  addLog(`丟棄了【${itemName}】。`, "text-slate-500");
  updateUI();
}

function applyItemDropToRed(bagIdx) {
  if (bagIdx === null || !state.player) return;
  const p = state.player;
  const itemId = p.bag[bagIdx];
  const item = getSafeItem(itemId);
  if (!item) return;

  if (item.type === "food") {
    let healHp = item.hp || 0;
    const healSp = item.sp || 0;
    // 亞洲桶神被動【鼎王吃到飽】：食物補血效果 +20%
    if (p.id === "yazhoutongshen") {
      healHp = Math.round(healHp * 1.2);
    }
    p.hp = Math.min(p.maxHp, p.hp + healHp);
    p.sp = Math.min(p.maxSp, p.sp + healSp);
    p.bag.splice(bagIdx, 1);
    addLog(`吃掉了【${item.name}】！回復 ${healHp} HP / ${healSp} SP。`, "text-emerald-400 font-bold");
  } 
  else if (p.equip && ['weapon', 'head', 'chest', 'arm', 'leg', 'acc'].includes(item.type)) {
    const slot = item.type;
    const oldItem = p.equip[slot];
    p.equip[slot] = item;
    if (oldItem) {
      p.bag[bagIdx] = oldItem.id;
      addLog(`換上【${item.name}】，原裝備【${oldItem.name}】已退回背包！`, "text-amber-300 font-bold");
    } else {
      p.bag.splice(bagIdx, 1);
      addLog(`穿上【${item.name}】！`, "text-amber-300 font-bold");
    }
  } 
  else {
    addLog(`此物品為材料，無法直接裝備！`, "text-rose-400");
  }

  updateUI();
}

let activeInspectTarget = { type: null, indexOrKey: null };

function inspectBagItem(index) {
  if (state.gameOver || state.isSearching || !state.player) return;
  const p = state.player;
  const rawId = p.bag[index];
  if (!rawId) return;

  const item = getSafeItem(rawId);
  if (!item) return;

  activeInspectTarget = { type: 'bag', indexOrKey: index };
  showItemInfoModal(item, '隨身背包物品', true);
}

function inspectEquipSlot(slotKey) {
  if (state.gameOver || state.isSearching || !state.player) return;
  const p = state.player;
  const item = p.equip ? p.equip[slotKey] : null;

  const slotLabels = {
    weapon: "武器部位",
    head: "頭部防具",
    chest: "胸部衣服",
    arm: "手臂手套",
    leg: "腿部鞋子",
    acc: "配件飾品"
  };

  if (!item) {
    addLog(`【${slotLabels[slotKey] || slotKey}】目前尚未裝備任何物資。`, "text-slate-500");
    return;
  }

  activeInspectTarget = { type: 'equip', indexOrKey: slotKey };
  showItemInfoModal(item, slotLabels[slotKey] || "裝備欄位", false);
}

function showItemInfoModal(item, categoryText, isFromBag) {
  const modal = document.getElementById("item-info-modal");
  if (!modal || !item) return;
  modal.classList.remove("hidden");
}

function closeItemInfoModal() {
  const modal = document.getElementById("item-info-modal");
  if (modal) modal.classList.add("hidden");
  activeInspectTarget = { type: null, indexOrKey: null };
}

function renderEquipSixGrid(p) {
  const gridEl = document.getElementById("equip-six-grid");
  if (!gridEl) return;

  const slots = [
    { key: "weapon", label: "武器", item: p.equip?.weapon, svg: EQUIP_SLOT_SVGS.weapon },
    { key: "head",   label: "頭部", item: p.equip?.head,   svg: EQUIP_SLOT_SVGS.head },
    { key: "chest",  label: "衣服", item: p.equip?.chest,  svg: EQUIP_SLOT_SVGS.chest },
    { key: "arm",    label: "手臂", item: p.equip?.arm,    svg: EQUIP_SLOT_SVGS.arm },
    { key: "leg",    label: "腿部", item: p.equip?.leg,    svg: EQUIP_SLOT_SVGS.leg },
    { key: "acc",    label: "飾品", item: p.equip?.acc,    svg: EQUIP_SLOT_SVGS.acc }
  ];

  gridEl.innerHTML = slots.map(s => {
    if (s.item) {
      const rarity = ItemRegistry.getRarity(s.item.id);
      return `
        <div onclick="inspectEquipSlot('${s.key}')" class="h-9 rounded border-2 ${rarity.border} bg-slate-900/95 flex items-center justify-center relative cursor-pointer active:scale-95 transition ${rarity.glow}" title="點擊檢視 ${s.item.name}">
          <div class="${rarity.iconColor}">
            ${s.svg}
          </div>
        </div>
      `;
    }
    return `
      <div onclick="inspectEquipSlot('${s.key}')" class="h-9 rounded border border-slate-800 bg-slate-900/90 flex items-center justify-center relative opacity-40 cursor-pointer text-slate-500" title="${s.label} (空)">
        ${s.svg}
      </div>
    `;
  }).join("");
}

function renderTacticalMap() {
  const container = document.getElementById("map-nodes-container");
  if (!container || !state.player) return;

  const p = state.player;
  const zones = getSafeZones();
  const missingMats = getMissingTrackedMaterials();

  const hintEl = document.getElementById("map-target-hint");
  if (hintEl) {
    if (DEV_CONFIG.isTestMode) {
      hintEl.textContent = "🏛️ 角色測試模式：僅開放唯一地圖【立法院】";
    } else if (missingMats.length > 0) {
      const targetItem = getSafeItem(state.trackedItemId);
      hintEl.textContent = `🎯 追蹤【${targetItem ? targetItem.name : ''}】中`;
    } else {
      hintEl.textContent = "點擊島嶼地標直接前往 (-5 體力)";
    }
  }

  const nodesHTML = zones.map(z => {
    const isCurrent = (p.zone === z.id);
    const isClosed = state.closedZones.includes(z.id);
    const isPendingClose = !isClosed && state.pendingCloseZones.includes(z.id);
    const aiCountHere = state.ais.filter(a => a && a.alive && a.zone === z.id).length;

    let pillClass = "bg-slate-950/95 border border-amber-700/60 text-slate-100 shadow-md";
    let iconFilter = "drop-shadow-[0_3px_4px_rgba(0,0,0,0.9)]";
    let badgeLeft = "";
    let pinTop = "";

    if (isCurrent && isPendingClose) {
      pillClass = "bg-amber-950 border-2 border-amber-400 text-amber-200 animate-pulse shadow-[0_0_14px_rgba(245,158,11,0.9)]";
      badgeLeft = `<span class="bg-amber-500 text-slate-950 text-[9px] font-black px-1 rounded-xs mr-0.5">⚠️</span>`;
    } else if (isCurrent) {
      pillClass = "bg-sky-950 border-2 border-sky-400 text-white shadow-[0_0_12px_rgba(56,189,248,0.7)]";
      pinTop = `
        <div class="-mb-1 z-20 animate-bounce flex flex-col items-center">
          <div class="w-5 h-5 rounded-full bg-sky-500 border-2 border-white text-white text-[10px] font-black flex items-center justify-center shadow-lg">你</div>
          <div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-white"></div>
        </div>
      `;
    } else if (isClosed) {
      pillClass = "bg-slate-950/90 border border-rose-900/80 text-slate-600 line-through";
      iconFilter = "grayscale opacity-35";
      badgeLeft = `<span class="text-[9px] mr-0.5">🚫</span>`;
    } else if (isPendingClose) {
      pillClass = "bg-amber-950 border-2 border-amber-500 text-amber-200 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.6)]";
      badgeLeft = `<span class="bg-amber-500 text-slate-950 text-[9px] font-black px-1 rounded-xs mr-0.5">⚠️</span>`;
    }

    const aiBadge = (DEV_CONFIG.isTestMode && aiCountHere > 0)
      ? `<span class="ml-1 text-[9px] text-amber-400 font-mono">(${aiCountHere}AI)</span>`
      : "";

    return `
      <div onclick="moveZone('${z.id}')" 
           style="left: ${z.x}%; top: ${z.y}%;" 
           class="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer select-none transition-transform active:scale-90 z-10 hover:scale-105">
        ${pinTop}
        <div class="text-xl leading-none mb-0.5 ${iconFilter}">${z.icon || '🏢'}</div>
        <div class="px-1.5 py-0.5 rounded-md flex items-center whitespace-nowrap ${pillClass}">
          ${badgeLeft}
          <span class="text-[10px] font-black tracking-tight">${z.name}</span>
          ${aiBadge}
        </div>
      </div>
    `;
  }).join("");

  container.innerHTML = `
    <div class="relative w-full h-full rounded-2xl overflow-hidden border border-slate-700/80 shadow-inner"
         style="background: radial-gradient(circle at 50% 50%, #0f172a 0%, #020617 100%);">
      <div class="relative w-full h-full">
        ${nodesHTML}
      </div>
    </div>
  `;
}

function getPlayerStatusBadgesHTML(p) {
  const badges = [];
  if (p.stunRemain > 0) badges.push(`<span class="px-1.5 py-0.2 bg-rose-950 border border-rose-500 text-rose-300 rounded text-[9px] font-bold">🎤定身 ${p.stunRemain}s</span>`);
  if (p.weakRemain > 0) badges.push(`<span class="px-1.5 py-0.2 bg-rose-950 border border-rose-500 text-rose-300 rounded text-[9px] font-bold">📉攻減半 ${p.weakRemain}s</span>`);
  if (p.reflectRemain > 0) badges.push(`<span class="px-1.5 py-0.2 bg-amber-950 border border-amber-400 text-amber-300 rounded text-[9px] font-bold">🔄反傷 ${p.reflectRemain}s</span>`);
  if (p.stealthRemain > 0) badges.push(`<span class="px-1.5 py-0.2 bg-sky-950 border border-sky-400 text-sky-300 rounded text-[9px] font-bold">👻隱蔽1.5x ${p.stealthRemain}s</span>`);
  if (p.guanDefBuffRemain > 0) badges.push(`<span class="px-1.5 py-0.2 bg-emerald-950 border border-emerald-500 text-emerald-300 rounded text-[9px] font-bold">📹防+6 (${p.guanDefBuffRemain}s)</span>`);
  if (p.milkDefBuffRemain > 0) badges.push(`<span class="px-1.5 py-0.2 bg-emerald-950 border border-emerald-500 text-emerald-300 rounded text-[9px] font-bold">🥛防+5 (${p.milkDefBuffRemain}s)</span>`);
  if (p.id === "laixiangde") badges.push(`<span class="px-1.5 py-0.2 bg-amber-950 border border-amber-500 text-amber-300 rounded text-[9px] font-bold">🙏功德 +${p.meritCount}/10</span>`);
  if (p.id === "kewenzhe") badges.push(`<span class="px-1.5 py-0.2 bg-emerald-950 border border-emerald-500 text-emerald-300 rounded text-[9px] font-bold">💪受擊 ${p.hitTakenCount}/3</span>`);
  if (p.id === "jiangwanan") badges.push(`<span class="px-1.5 py-0.2 ${p.dodgeReady ? 'bg-sky-950 border-sky-400 text-sky-300' : 'bg-slate-800 border-slate-600 text-slate-400'} border rounded text-[9px] font-bold">💨問A答B:${p.dodgeReady ? '就緒' : p.dodgeCdRemain + 's'}</span>`);
  if (isChaoGeAuraAffecting(p)) badges.push(`<span class="px-1.5 py-0.2 bg-rose-950 border border-rose-500 text-rose-300 rounded text-[9px] font-bold">⚠️超派破防-20%</span>`);
  return badges.join(" ");
}

function updateUI() {
  if (!state.player) return;
  const p = state.player;
  const ai = state.ai;

  const pNameEl = document.getElementById("player-name");
  if (pNameEl) pNameEl.textContent = p.name;

  const statEl = document.getElementById("player-stats");
  if (statEl) {
    statEl.innerHTML = `攻擊 ${getTotalAtk(p)} | 防禦 ${getTotalDef(p)} <span class="text-slate-400 font-normal">• 被動:${p.passive ? p.passive.name : ''}</span>`;
  }

  const badgeBox = document.getElementById("player-status-badges");
  if (badgeBox) badgeBox.innerHTML = getPlayerStatusBadgesHTML(p);

  // 更新角色面板上的主動技按鈕與戰鬥面板上的技能按鈕
  const quickSkillBtn = document.getElementById("btn-quick-skill");
  const combatSkillBtn = document.getElementById("btn-combat-skill");
  if (p.skill) {
    let btnLabel = `${p.skill.icon} ${p.skill.name}`;
    if (p.id === "wangshijian" && p.stealthRemain > 0) {
      btnLabel = `👻 隱蔽中(${p.stealthRemain}s)`;
    } else if (p.skillCdRemain > 0) {
      btnLabel = `⏳ CD ${p.skillCdRemain}s`;
    }
    if (quickSkillBtn) quickSkillBtn.textContent = btnLabel;
    if (combatSkillBtn) combatSkillBtn.innerHTML = `<span>${btnLabel}</span>`;
  }

  const zObj = getSafeCurrentZone(p.zone);

  const hpBar = document.getElementById("hp-bar");
  if (hpBar) hpBar.style.width = `${(p.hp / p.maxHp) * 100}%`;
  const hpText = document.getElementById("hp-text");
  if (hpText) hpText.textContent = `${p.hp}/${p.maxHp}`;

  const spBar = document.getElementById("sp-bar");
  if (spBar) spBar.style.width = `${(p.sp / p.maxSp) * 100}%`;
  const spText = document.getElementById("sp-text");
  if (spText) spText.textContent = `${p.sp}/${p.maxSp}`;

  const timerBadge = document.getElementById("zone-timer-badge");
  const aliveAICount = state.ais.filter(a => a && a.alive).length;
  if (timerBadge) {
    if (!DEV_CONFIG.enableZoneClose) {
      timerBadge.textContent = `🏛️ 立法院測試 (存活AI: ${aliveAICount})`;
      timerBadge.className = "text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-950/90 border border-emerald-600/60 text-emerald-300";
    } else {
      const curCfg = BS_ZONE_ROUNDS[state.currentRoundIdx];
      const remain = Math.max(0, state.roundTimeRemain);
      const minStr = Math.floor(remain / 60).toString();
      const secStr = (remain % 60).toString().padStart(2, '0');

      if (remain <= 20) {
        timerBadge.textContent = `⚠️ R${curCfg.round} 警報: ${minStr}:${secStr} (剩${aliveAICount}AI)`;
        timerBadge.className = "text-[10px] font-mono font-black px-2 py-0.5 rounded-md bg-rose-600 border border-rose-300 text-white animate-pulse shadow";
      } else {
        timerBadge.textContent = `🔥 R${curCfg.round} 縮圈: ${minStr}:${secStr} (剩${aliveAICount}AI)`;
        timerBadge.className = "text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-900/90 border border-slate-700 text-amber-400";
      }
    }
  }

  const expPanel = document.getElementById("explore-panel");
  const alertPill = document.getElementById("current-zone-alert-pill");
  const isPlayerInPending = state.pendingCloseZones.includes(p.zone);
  const isPlayerInClosed = state.closedZones.includes(p.zone);

  if (expPanel) {
    expPanel.classList.remove("zone-pending-warning", "zone-closed-danger");
    if (isPlayerInClosed) {
      expPanel.classList.add("zone-closed-danger");
    } else if (isPlayerInPending) {
      expPanel.classList.add("zone-pending-warning");
    }
  }

  if (alertPill) {
    if (isPlayerInClosed) {
      alertPill.textContent = "🚫 禁區高壓電！立即撤離";
      alertPill.className = "text-[10px] font-black px-1.5 py-0.5 rounded bg-rose-600 text-white animate-bounce";
    } else if (isPlayerInPending) {
      alertPill.textContent = "⚠️ 本區即將封閉！";
      alertPill.className = "text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 animate-pulse";
    } else {
      alertPill.className = "hidden";
    }
  }

  renderEquipSixGrid(p);
  renderTargetTracker();

  const craftBox = document.getElementById("craft-alert-box");
  const availableRecipes = findAvailableRecipes(p);
  if (availableRecipes.length > 0 && craftBox) {
    craftBox.classList.remove("hidden");
  } else if (craftBox) { 
    craftBox.classList.add("hidden"); 
  }

  const comPanel = document.getElementById("combat-panel");

  if (state.inCombat && ai) {
    if (expPanel) expPanel.classList.add("hidden");
    if (comPanel) comPanel.classList.remove("hidden");
    if (typeof updateCombatUI === 'function') updateCombatUI();
  } else {
    if (expPanel) expPanel.classList.remove("hidden");
    if (comPanel) comPanel.classList.add("hidden");

    const zoneTitle = document.getElementById("zone-title");
    if (zoneTitle && zObj) zoneTitle.textContent = `${zObj.icon || ''} ${zObj.name}`;

    const zoneDrops = document.getElementById("zone-drops");
    if (zoneDrops && zObj) {
      const sameZoneAIs = state.ais.filter(a => a && a.alive && a.zone === p.zone);
      const aiNames = sameZoneAIs.map(a => a.name).join("、");
      zoneDrops.textContent = sameZoneAIs.length > 0
        ? `同區角色 (${sameZoneAIs.length})：${aiNames}`
        : `同區角色：目前無人（物資待重新設計）`;
    }
  }

  const mapModal = document.getElementById("map-modal");
  if (mapModal && !mapModal.classList.contains("hidden")) {
    renderTacticalMap();
  }

  const invGrid = document.getElementById("inventory-grid");
  if (invGrid) {
    invGrid.innerHTML = Array.from({length: 6}, (_, i) => {
      if (p.bag && p.bag[i]) {
        const item = getSafeItem(p.bag[i]);
        if (item) {
          const rarity = ItemRegistry.getRarity(item.id);
          return `
            <div ontouchstart="handleItemTouchStart(event, ${i})"
                 ontouchmove="handleItemTouchMove(event)"
                 ontouchend="handleItemTouchEnd(event)"
                 class="bg-slate-800 hover:bg-slate-700 active:scale-95 border-2 ${rarity.border} rounded p-1.5 text-left h-12 transition flex flex-col justify-center cursor-pointer select-none ${rarity.glow}">
              <div class="text-xs font-bold truncate ${rarity.text}">${item.name}</div>
            </div>
          `;
        }
      }
      return `<div class="bg-slate-900 border border-slate-800 rounded p-1 text-center text-slate-600 h-12 flex items-center justify-center text-xs">空</div>`;
    }).join("");
  }
}

function endGame(isWin, reason) {
  state.gameOver = true;
  const modal = document.getElementById("gameover-modal");
  if (modal) modal.classList.remove("hidden");
  const icon = document.getElementById("gameover-icon");
  if (icon) icon.textContent = isWin ? "WIN" : "LOSE";
  const title = document.getElementById("gameover-title");
  if (title) title.textContent = isWin ? "大吉大利！" : "出師未捷...";
  const desc = document.getElementById("gameover-desc");
  if (desc) desc.textContent = reason;
}
