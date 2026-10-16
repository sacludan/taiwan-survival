/**
 * 【模組：核心管家 main.js】
 * 完整終極版：確保 22 區地圖完整渲染與正確的搜刮物品背包寫入邏輯
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
      window.ITEMS_WEAPON, window.ITEMS_ARMOR, window.ITEMS_MATERIAL, window.ITEMS_FOOD
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
      window.ITEMS_WEAPON, window.ITEMS_ARMOR, window.ITEMS_MATERIAL, window.ITEMS_FOOD,
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

const DEV_CONFIG = { mode: "normal", enableZoneClose: true, enableNPC: true };

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
  { round: 6, duration: 90, warnCount: 6, isPermanent: true,  name: "第 6 輪 (永久封閉)" },
  { round: 7, duration: 90, warnCount: 4, isPermanent: true,  name: "第 7 輪 (準決賽)" },
  { round: 8, duration: 90, warnCount: 2, isPermanent: true,  name: "第 8 輪 (決賽圈)" },
  { round: 9, duration: 90, warnCount: 0, isPermanent: true,  name: "最終決賽" }
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
  unit.bag = [];
  unit.equip = { weapon: null, head: null, chest: null, arm: null, leg: null, acc: null };
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
  return zones.find(z => z.id === zoneId) || zones[0] || { id: "ly", name: "立法院", icon: "🏛️", drops: [] };
}

function getSafeRecipes() {
  return (typeof RECES_DATA !== 'undefined' && RECIPES_DATA.recipes) ? RECIPES_DATA.recipes : (typeof GAME_DATA !== 'undefined' ? GAME_DATA.recipes : []);
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
  const matchingZones = zones.filter(z => z.drops && (z.drops.includes(itemId) || z.drops.includes(resolvedId)));
  if (matchingZones.length > 0) {
    return matchingZones.slice(0, 3).map(z => z.name).join(" / ");
  }
  return "合成獲得";
}

function getTotalAtk(unit) {
  if (!unit) return 0;
  let total = unit.baseAtk || 0;
  if (unit.equip) {
    Object.values(unit.equip).forEach(item => { if (item && item.atk) total += item.atk; });
  }
  return Math.max(1, total);
}

function getTotalDef(unit) {
  if (!unit) return 0;
  let total = unit.baseDef || 0;
  if (unit.equip) {
    Object.values(unit.equip).forEach(item => { if (item && item.def) total += item.def; });
  }
  return Math.max(0, total);
}

function initGame(mode = "normal", selectedPlayerId = "zhugouliang") {
  state.timeSec = 0;
  state.currentRoundIdx = 0;
  state.roundTimeRemain = 90;
  state.closedZones = [];
  state.inCombat = false;
  state.gameOver = false;
  state.isSearching = false;

  const fullMaps = getSafeZones();
  state.activeZones = [...fullMaps];

  const pTemplate = (typeof GAME_CHARACTERS !== 'undefined' && GAME_CHARACTERS[selectedPlayerId]) ? GAME_CHARACTERS[selectedPlayerId] : Object.values(GAME_CHARACTERS)[0];
  state.player = createRuntimeUnit(pTemplate, "ly");

  state.ais = [];
  if (mode !== "sandbox" && typeof GAME_CHARACTERS !== 'undefined') {
    const remainingIds = Object.keys(GAME_CHARACTERS).filter(id => id !== state.player.id);
    remainingIds.forEach((botId) => {
      state.ais.push(createRuntimeUnit(GAME_CHARACTERS[botId], "ly"));
    });
  }

  const logEl = document.getElementById("game-log");
  if (logEl) logEl.innerHTML = "";
  addLog(`台灣生存戰開局！出戰角色：【${state.player.name}】`, "text-amber-300 font-bold");

  updateUI();
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

function triggerSearch() {
  if (state.gameOver || state.inCombat || state.isSearching || !state.player) return;
  const p = state.player;

  if (p.sp < 15) {
    addLog("體力不足（小於 15），無法搜刮！", "text-rose-400");
    return;
  }

  p.sp -= 15;
  state.isSearching = true;
  updateUI();

  const promptText = document.getElementById("search-prompt-text");
  const progressBox = document.getElementById("search-progress-box");
  const progressBar = document.getElementById("search-progress-bar");

  if (promptText) { promptText.textContent = "🔍 搜刮中..."; promptText.classList.remove("hidden"); }
  if (progressBox) progressBox.classList.remove("hidden");
  if (progressBar) progressBar.style.width = "0%";

  let elapsed = 0;
  const searchInterval = setInterval(() => {
    elapsed += 100;
    const percent = Math.min(100, (elapsed / 2000) * 100);
    if (progressBar) progressBar.style.width = `${percent}%`;

    if (elapsed >= 2000) {
      clearInterval(searchInterval);
      state.isSearching = false;
      if (progressBox) progressBox.classList.add("hidden");
      if (promptText) promptText.classList.add("hidden");

      lootMultipleItemsForPlayer(1);
      updateUI();
    }
  }, 100);
}

function lootMultipleItemsForPlayer(count = 1) {
  const p = state.player;
  const currentZoneObj = getSafeCurrentZone(p.zone);
  const dropPool = (currentZoneObj.drops && currentZoneObj.drops.length > 0) ? currentZoneObj.drops : [];

  if (dropPool.length === 0) {
    addLog(`🔍 搜刮了周遭，沒有發現任何物資。`, "text-slate-400");
    return;
  }

  for (let i = 0; i < count; i++) {
    const dropId = dropPool[Math.floor(Math.random() * dropPool.length)];
    const item = getSafeItem(dropId);

    if (!item) {
      console.warn("找不到對應的物品資料:", dropId);
      continue;
    }

    const slot = item.type;
    if (p.equip && ['weapon', 'head', 'chest', 'arm', 'leg', 'acc'].includes(slot) && p.equip[slot] === null) {
      p.equip[slot] = { ...item, id: dropId };
      addLog(`搜刮獲得並自動裝備【${item.name}】！`, "text-amber-300 font-bold");
    } else if (p.bag && p.bag.length < 6) {
      p.bag.push(dropId);
      addLog(`搜刮獲得【${item.name}】！`, "text-emerald-300 font-bold");
    } else {
      addLog(`背包已滿（6/6），錯過了【${item.name}】！`, "text-rose-400");
    }
  }
}

function openMapModal() {
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
  if (state.gameOver || !state.player) return;
  const p = state.player;
  if (p.zone === targetZoneId) { closeMapModal(); return; }

  p.zone = targetZoneId;
  const targetZone = getSafeCurrentZone(targetZoneId);
  addLog(`移動到了【${targetZone.name}】。`, "text-indigo-300");
  closeMapModal();
  updateUI();
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
      return `<div class="h-9 rounded border-2 ${rarity.border} bg-slate-900/95 flex items-center justify-center relative cursor-pointer"><div class="${rarity.iconColor}">${s.svg}</div></div>`;
    }
    return `<div class="h-9 rounded border border-slate-800 bg-slate-900/90 flex items-center justify-center relative opacity-40 text-slate-500">${s.svg}</div>`;
  }).join("");
}

function renderTacticalMap() {
  const container = document.getElementById("map-nodes-container");
  if (!container || !state.player) return;
  const p = state.player;
  const zones = getSafeZones();

  const nodesHTML = zones.map(z => {
    const isCurrent = (p.zone === z.id);
    let pillClass = "bg-slate-950/95 border border-amber-700/60 text-slate-100 shadow-md";
    if (isCurrent) {
      pillClass = "bg-sky-950 border-2 border-sky-400 text-white shadow-[0_0_12px_rgba(56,189,248,0.7)]";
    }
    return `
      <div onclick="moveZone('${z.id}')" style="left: ${z.x}%; top: ${z.y}%;" class="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer select-none z-10">
        <div class="text-xl leading-none mb-0.5">${z.icon || '🏢'}</div>
        <div class="px-1.5 py-0.5 rounded-md flex items-center whitespace-nowrap ${pillClass}">
          <span class="text-[10px] font-black tracking-tight">${z.name}</span>
        </div>
      </div>
    `;
  }).join("");

  container.innerHTML = `<div class="relative w-full h-full rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950">${nodesHTML}</div>`;
}

function updateUI() {
  if (!state.player) return;
  const p = state.player;

  document.getElementById("player-name").textContent = p.name;
  document.getElementById("player-stats").textContent = `攻擊 ${getTotalAtk(p)} | 防禦 ${getTotalDef(p)}`;

  document.getElementById("hp-bar").style.width = `${(p.hp / p.maxHp) * 100}%`;
  document.getElementById("hp-text").textContent = `${p.hp}/${p.maxHp}`;
  document.getElementById("sp-bar").style.width = `${(p.sp / p.maxSp) * 100}%`;
  document.getElementById("sp-text").textContent = `${p.sp}/${p.maxSp}`;

  renderEquipSixGrid(p);

  const zObj = getSafeCurrentZone(p.zone);
  document.getElementById("zone-title").textContent = `${zObj.icon || ''} ${zObj.name}`;
  
  const zoneDrops = document.getElementById("zone-drops");
  if (zoneDrops && zObj) {
    const dropNames = (zObj.drops || []).map(id => getItemDisplayName(id));
    zoneDrops.textContent = dropNames.length > 0 ? `可搜刮：${dropNames.join("、")}` : `可搜刮：暫無配置物資`;
  }

  const invGrid = document.getElementById("inventory-grid");
  if (invGrid) {
    invGrid.innerHTML = Array.from({length: 6}, (_, i) => {
      if (p.bag && p.bag[i]) {
        const item = getSafeItem(p.bag[i]);
        if (item) {
          const rarity = ItemRegistry.getRarity(item.id);
          return `<div class="bg-slate-800 border-2 ${rarity.border} rounded p-1.5 text-left h-12 flex flex-col justify-center"><div class="text-xs font-bold truncate ${rarity.text}">${item.name}</div></div>`;
        }
      }
      return `<div class="bg-slate-900 border border-slate-800 rounded p-1 text-center text-slate-600 h-12 flex items-center justify-center text-xs">空</div>`;
    }).join("");
  }
}
