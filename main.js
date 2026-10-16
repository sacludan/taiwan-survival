/**
 * 【模組：核心管家 main.js】
 * 終極修復版：完美修復追蹤盒渲染、縮圈計時器、地圖星號導航與所有原生功能
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
    const poolItem = this.get(resolvedId);
    const level = (poolItem && poolItem.rarity) ? poolItem.rarity : (this.RARITY_MAP[resolvedId] || 1);
    return { level, ...this.RARITY[level] };
  }
};

const DEV_CONFIG = {
  mode: "normal",
  enableZoneClose: true,
  enableNPC: true
};

const EQUIP_SLOT_SVGS = {
  weapon: `<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 17.5L3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/><path d="M19 21l2-2"/></svg>`,
  head:   `<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 18v-4a8 8 0 1 1 16 0v4"/><path d="M2 18h20"/></svg>`,
  chest:  `<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>`,
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
  ai: null,
  ais: [],
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

function getSafeZones() {
  if (Array.isArray(state.activeZones) && state.activeZones.length > 0) return state.activeZones;
  if (typeof MAPS_DATA !== 'undefined' && Array.isArray(MAPS_DATA.zones)) return MAPS_DATA.zones;
  if (typeof window.GAME_MAPS !== 'undefined' && Array.isArray(window.GAME_MAPS)) return window.GAME_MAPS;
  return [];
}

function getSafeCurrentZone(zoneId) {
  const zones = getSafeZones();
  const found = zones.find(z => z.id === zoneId);
  return found || zones[0] || { id: "ly", name: "立法院", icon: "🏛️", drops: [] };
}

function getSafeRecipes() {
  if (typeof RECIPES_DATA !== 'undefined' && Array.isArray(RECIPES_DATA.recipes)) return RECIPES_DATA.recipes;
  if (typeof GAME_DATA !== 'undefined' && GAME_DATA && GAME_DATA.recipes) return GAME_DATA.recipes;
  return [];
}

function getSafeItem(itemId) { return ItemRegistry.get(itemId); }
function getItemDisplayName(itemId) { const it = ItemRegistry.get(itemId); return it ? it.name : (itemId || "空"); }

function getItemDropLocationName(itemId) {
  const zones = getSafeZones();
  const resolvedId = ItemRegistry.ALIAS[itemId] || itemId;
  const matchingZones = zones.filter(z => z.drops && (z.drops.includes(itemId) || z.drops.includes(resolvedId)));
  if (matchingZones.length > 0) return matchingZones.slice(0, 3).map(z => z.name).join(" / ");
  return "合成獲得";
}

function getMissingTrackedMaterials() {
  if (!state.trackedItemId || !state.player) return [];
  const recipes = getSafeRecipes();
  const resolvedTarget = ItemRegistry.ALIAS[state.trackedItemId] || state.trackedItemId;
  const recipe = recipes.find(r => (ItemRegistry.ALIAS[r.result] || r.result) === resolvedTarget);

  const ownedIds = [...(state.player.bag || [])].map(id => ItemRegistry.ALIAS[id] || id);
  if (state.player.equip) {
    Object.values(state.player.equip).forEach(it => { if (it) ownedIds.push(ItemRegistry.ALIAS[it.id] || it.id); });
  }

  if (recipe) {
    return recipe.materials.filter(mId => !ownedIds.includes(ItemRegistry.ALIAS[mId] || mId));
  } else {
    return ownedIds.includes(resolvedTarget) ? [] : [resolvedTarget];
  }
}

function pickRandomWarningZones(count) {
  const allZones = getSafeZones();
  const openZones = allZones.filter(z => !state.closedZones.includes(z.id));
  if (openZones.length <= 1) return [];
  const actualCount = Math.min(count, openZones.length - 1);
  const shuffled = [...openZones].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, actualCount).map(z => z.id);
}

function initGame(mode = "normal", selectedPlayerId = "zhugouliang", customTestBotIds = []) {
  if (mode === true) mode = "sandbox";
  if (mode === false) mode = "normal";

  DEV_CONFIG.mode = mode;
  DEV_CONFIG.enableZoneClose = (mode === "normal");

  state.timeSec = 0;
  state.currentRoundIdx = 0;
  state.roundTimeRemain = BS_ZONE_ROUNDS[0].duration;
  state.closedZones = [];
  state.inCombat = false;
  state.gameOver = false;
  state.isSearching = false;
  state.trackedItemId = null;

  const fullMaps = (typeof MAPS_DATA !== 'undefined' && Array.isArray(MAPS_DATA.zones)) ? MAPS_DATA.zones : [];
  if (mode === "char_test") {
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

  const pTemplate = GAME_CHARACTERS[selectedPlayerId] || Object.values(GAME_CHARACTERS)[0];
  state.player = createRuntimeUnit(pTemplate, "ly");

  state.ais = [];
  if (mode === "sandbox") {
    DEV_CONFIG.enableNPC = false;
  } else if (mode === "char_test") {
    customTestBotIds.forEach(botId => {
      if (botId !== state.player.id && GAME_CHARACTERS[botId]) state.ais.push(createRuntimeUnit(GAME_CHARACTERS[botId], "ly"));
    });
    DEV_CONFIG.enableNPC = state.ais.length > 0;
  } else {
    const remainingIds = Object.keys(GAME_CHARACTERS).filter(id => id !== state.player.id);
    const shuffledZones = [...state.activeZones].sort(() => Math.random() - 0.5);
    remainingIds.forEach((botId, idx) => {
      const spawnZone = shuffledZones[idx % shuffledZones.length]?.id || "ly";
      state.ais.push(createRuntimeUnit(GAME_CHARACTERS[botId], spawnZone));
    });
    DEV_CONFIG.enableNPC = true;
  }

  state.ai = state.ais[0] || null;

  const logEl = document.getElementById("game-log");
  if (logEl) logEl.innerHTML = "";

  if (mode === "sandbox") {
    addLog("【測試模式】全島 22 區與圖鑑已就緒（無縮圈 / 無NPC）！", "text-emerald-400 font-bold");
  } else {
    addLog(`台灣生存戰開局！出戰角色：【${state.player.name}】`, "text-amber-300 font-bold");
    const warnNames = state.pendingCloseZones.map(id => getSafeCurrentZone(id).name).join("、");
    if (warnNames) addLog(`⚠️ 【第 1 輪預告】${warnNames} 將在 1 分 30 秒後成為暫時禁區！`, "text-amber-400");
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
      if (!state.closedZones.includes(id)) state.closedZones.push(id);
    });
    if (state.currentRoundIdx === 5) {
      addLog(`☠️ 【進入第 2 天】管制升級！所有禁區即刻起永久封閉！`, "text-rose-500 font-black");
    } else {
      addLog(`🚫 【永久禁區追加】全島已累計封閉 ${state.closedZones.length} 個區域！`, "text-rose-500 font-bold");
    }
  }

  if (state.closedZones.includes(state.player.zone)) {
    state.player.hp = Math.max(1, state.player.hp - 35);
    addLog(`⚡ 你滯留在禁區內遭受高壓電網驅離，受到 35 點傷害！`, "text-rose-500 font-black");
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

let gameInterval = null;
function startGameLoop() {
  if (gameInterval) clearInterval(gameInterval);
  let tickCount = 0;
  
  gameInterval = setInterval(() => {
    if (state.gameOver || !state.player) return;
    tickCount++;

    if (tickCount % 10 === 0) {
      state.timeSec++;

      if (state.timeSec % 3 === 0) {
        if (state.player.sp < state.player.maxSp) state.player.sp = Math.min(state.player.maxSp, state.player.sp + 5);
      }

      if (DEV_CONFIG.enableZoneClose) {
        state.roundTimeRemain--;
        if (state.roundTimeRemain === 20) {
          const warnNames = state.pendingCloseZones.map(id => getSafeCurrentZone(id).name).join("、");
          addLog(`⏰ 【倒數 20 秒】禁區即將封鎖：${warnNames}`, "text-amber-300 font-black");
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
  
  let html = `
    <div class="flex justify-between items-center border-b border-slate-700/50 pb-1 mb-1">
      <span class="text-[9px] font-black tracking-wider text-amber-400 uppercase">🎯 目標追蹤</span>
      <div class="flex items-center gap-1">
        <span class="text-[11px] font-bold ${rarity.text} truncate max-w-[95px]">${targetItem.name}</span>
        <button onclick="clearTrackedItem(event)" class="text-slate-400 hover:text-rose-400 text-xs px-1 font-mono transition">✕</button>
      </div>
    </div>
    <div class="space-y-0.5 text-[10px] font-mono text-slate-300">
  `;

  const ownedIds = [...(state.player.bag || [])].map(id => ItemRegistry.ALIAS[id] || id);
  if (state.player.equip) {
    Object.values(state.player.equip).forEach(it => { if (it) ownedIds.push(ItemRegistry.ALIAS[it.id] || it.id); });
  }

  const recipes = getSafeRecipes();
  const recipe = recipes.find(r => (ItemRegistry.ALIAS[r.result] || r.result) === targetItem.id);

  if (recipe) {
    recipe.materials.forEach(mId => {
      const resolvedMat = ItemRegistry.ALIAS[mId] || mId;
      const isOwned = ownedIds.includes(resolvedMat);
      const mName = getItemDisplayName(resolvedMat);
      const loc = getItemDropLocationName(resolvedMat);
      const mRarity = ItemRegistry.getRarity(resolvedMat);

      if (isOwned) {
        html += `<div class="flex justify-between items-center text-emerald-400"><span class="truncate max-w-[110px] font-bold">✔ ${mName}</span><span class="text-[9px] text-emerald-500 font-mono">已擁有</span></div>`;
      } else {
        html += `<div class="flex justify-between items-center text-rose-300"><span class="truncate max-w-[95px] ${mRarity.text}">✖ ${mName}</span><span class="text-[9px] text-amber-300/90 font-mono truncate max-w-[85px] font-bold">⭐${loc}</span></div>`;
      }
    });
  } else {
    const loc = getItemDropLocationName(targetItem.id);
    const count = ownedIds.filter(id => id === targetItem.id).length;
    html += `<div class="space-y-0.5 pt-0.5"><div class="flex justify-between text-slate-300"><span>產地:</span><span class="text-amber-400 font-bold truncate max-w-[120px]">⭐${loc}</span></div><div class="flex justify-between text-slate-300"><span>擁有:</span><span class="${count > 0 ? 'text-emerald-400 font-bold' : 'text-rose-400'}">${count > 0 ? `✔ ${count} 個` : '✖ 0 個'}</span></div></div>`;
  }

  html += `</div>`;
  trackerBox.innerHTML = html;
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
    const hasNeededMaterial = !isClosed && missingMats.some(mId => z.drops && (z.drops.includes(mId) || z.drops.includes(ItemRegistry.ALIAS[mId] || mId)));

    let pillClass = "bg-slate-950/95 border border-amber-700/60 text-slate-100 shadow-md";
    let iconFilter = "drop-shadow-[0_3px_4px_rgba(0,0,0,0.9)]";
    let pinTop = "";
    let starBadge = "";

    if (isCurrent) {
      pillClass = "bg-sky-950 border-2 border-sky-400 text-white shadow-[0_0_12px_rgba(56,189,248,0.7)]";
      pinTop = `<div class="-mb-1 z-20 animate-bounce flex flex-col items-center"><div class="w-5 h-5 rounded-full bg-sky-500 border-2 border-white text-white text-[10px] font-black flex items-center justify-center shadow-lg">1</div><div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-white"></div></div>`;
    } else if (isClosed) {
      pillClass = "bg-slate-950/90 border border-rose-900/80 text-slate-600 line-through";
      iconFilter = "grayscale opacity-35";
    } else if (hasNeededMaterial) {
      pillClass = "bg-amber-950/95 border-2 border-amber-300 text-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.75)] animate-pulse";
      starBadge = `<span class="absolute -top-2 -right-2 text-xs z-20 animate-bounce">⭐</span>`;
    }

    return `
      <div onclick="moveZone('${z.id}')" style="left: ${z.x}%; top: ${z.y}%;" class="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer select-none transition-transform active:scale-90 z-10 hover:scale-105">
        ${pinTop}
        <div class="relative">
          ${starBadge}
          <div class="text-xl leading-none mb-0.5 ${iconFilter}">${z.icon || '🏢'}</div>
        </div>
        <div class="px-1.5 py-0.5 rounded-md flex items-center whitespace-nowrap ${pillClass}">
          <span class="text-[10px] font-black tracking-tight">${z.name}</span>
        </div>
      </div>
    `;
  }).join("");

  container.innerHTML = `
    <div class="relative w-full h-full rounded-2xl overflow-hidden border border-slate-700/80 shadow-inner" style="background: radial-gradient(circle at 50% 50%, #0f172a 0%, #020617 100%);">
      <div class="relative w-full h-full">${nodesHTML}</div>
    </div>
  `;
}

function updateUI() {
  if (!state.player) return;
  const p = state.player;

  const pNameEl = document.getElementById("player-name");
  if (pNameEl) pNameEl.textContent = p.name;

  const statEl = document.getElementById("player-stats");
  if (statEl) statEl.textContent = `攻擊 ${getTotalAtk(p)} | 防禦 ${getTotalDef(p)}`;

  const hpBar = document.getElementById("hp-bar");
  if (hpBar) hpBar.style.width = `${(p.hp / p.maxHp) * 100}%`;
  const hpText = document.getElementById("hp-text");
  if (hpText) hpText.textContent = `${p.hp}/${p.maxHp}`;

  const spBar = document.getElementById("sp-bar");
  if (spBar) spBar.style.width = `${(p.sp / p.maxSp) * 100}%`;
  const spText = document.getElementById("sp-text");
  if (spText) spText.textContent = `${p.sp}/${p.maxSp}`;

  // 🎯【修復 1】強制更新畫面上的縮圈計時器顯示
  const timerBadge = document.getElementById("zone-timer-badge");
  if (timerBadge && DEV_CONFIG.enableZoneClose) {
    const m = Math.floor(state.roundTimeRemain / 60);
    const s = state.roundTimeRemain % 60;
    const timeStr = `${m}:${s.toString().padStart(2, '0')}`;
    timerBadge.textContent = `🔥 R${state.currentRoundIdx + 1} 縮圈: ${timeStr}`;
  }

  // 🎯【修復 2】強制呼叫追蹤盒渲染，讓左上角與地圖星號同步顯示
  renderTargetTracker();
  renderEquipSixGrid(p);

  const zObj = getSafeCurrentZone(p.zone);
  const zoneTitle = document.getElementById("zone-title");
  if (zoneTitle && zObj) zoneTitle.textContent = `${zObj.icon || ''} ${zObj.name}`;

  const zoneDrops = document.getElementById("zone-drops");
  if (zoneDrops && zObj) {
    const uniqueDropIds = [...new Set(zObj.drops || [])];
    const dropNames = uniqueDropIds.map(id => getItemDisplayName(id));
    zoneDrops.textContent = dropNames.length > 0 ? `可搜刮：${dropNames.join("、")}` : `可搜刮：暫無配置物資`;
  }

  const invGrid = document.getElementById("inventory-grid");
  if (invGrid) {
    invGrid.innerHTML = Array.from({length: 6}, (_, i) => {
      if (p.bag && p.bag[i]) {
        const item = getSafeItem(p.bag[i]);
        if (item) {
          const rarity = ItemRegistry.getRarity(item.id);
          return `
            <div draggable="true" ondragstart="handleDragStart(event, ${i})" onclick="inspectBagItem(${i})" class="bg-slate-800 hover:bg-slate-700 active:scale-95 border-2 ${rarity.border} rounded p-1.5 text-left h-12 transition flex flex-col justify-center cursor-pointer select-none ${rarity.glow}">
              <div class="text-xs font-bold truncate ${rarity.text}">${item.name}</div>
            </div>
          `;
        }
      }
      return `<div class="bg-slate-900 border border-slate-800 rounded p-1 text-center text-slate-600 h-12 flex items-center justify-center text-xs">空</div>`;
    }).join("");
  }
}

// 輔助戰鬥與屬性計算
function getTotalAtk(unit) {
  if (!unit) return 0;
  let total = unit.baseAtk || 0;
  if (unit.equip) Object.values(unit.equip).forEach(item => { if (item && item.atk) total += item.atk; });
  return Math.max(1, total);
}

function getTotalDef(unit) {
  if (!unit) return 0;
  let total = unit.baseDef || 0;
  if (unit.equip) Object.values(unit.equip).forEach(item => { if (item && item.def) total += item.def; });
  return Math.max(0, total);
}
