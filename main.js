/**
 * 【模組：核心管家 main.js】
 * v52：
 * 1. 22 區直式戰術卡片地圖（方案 A：分區佈局、點擊直接移動免彈窗）
 * 2. ⚠️ 縮圈倒數預告警告與 ⭐ 追蹤缺料發光標記
 * 3. 五階品級色全套連動（白、綠、藍、黃、紅）
 */

const ItemRegistry = {
  RARITY: {
    1: { name: "普通", border: "border-slate-500", text: "text-slate-200", iconColor: "text-slate-300", badge: "bg-slate-700 text-slate-300", glow: "" },
    2: { name: "精良", border: "border-emerald-500", text: "text-emerald-400", iconColor: "text-emerald-400", badge: "bg-emerald-950 border border-emerald-500 text-emerald-300", glow: "shadow-sm shadow-emerald-900/40" },
    3: { name: "稀有", border: "border-sky-500", text: "text-sky-400", iconColor: "text-sky-400", badge: "bg-sky-950 border border-sky-500 text-sky-300", glow: "shadow-sm shadow-sky-900/40" },
    4: { name: "史詩", border: "border-amber-400", text: "text-amber-300", iconColor: "text-amber-300", badge: "bg-amber-950 border border-amber-400 text-amber-300", glow: "shadow-sm shadow-amber-900/40" },
    5: { name: "傳說", border: "border-rose-500", text: "text-rose-400", iconColor: "text-rose-400", badge: "bg-rose-950 border border-rose-500 text-rose-300", glow: "shadow-sm shadow-rose-900/50" }
  },

  ALIAS: {
    bubble_tea: "milk_tea",
    boba_milk_tea: "milk_tea",
    rice_sausage: "sticky_rice_sausage",
    lunch_box: "bento"
  },

  RARITY_MAP: {
    // ⚪ 白 (1階：基礎材料 / 基礎裝備 / 基礎食物)
    plastic_chair: 1,
    tape: 1,
    battery: 1,
    water_balloon: 1,
    box_cutter: 1,
    umbrella: 1,
    laser_pointer: 1,
    melon_helmet: 1,
    sausage: 1,
    sticky_rice_sausage: 1,
    bento: 1,

    // 🟢 綠 (2階：一次合成裝備 / 稀有物資)
    reinforced_chair: 2,
    megaphone: 2,
    tri_treasure_helmet: 2,
    iron_sheet: 2,
    milk_tea: 2,
    stinky_tofu: 2,

    // 🔵 藍 (3階：二次合成裝備 / 稀有極限料理)
    tw_hotdog: 3,
    electro_megaphone: 3,
    riot_shield: 3,

    // 🟡 黃 (4階：三次合成主力神裝)
    thunder_roar_megaphone: 4,
    power_armor: 4,

    // 🔴 紅 (5階：四次終極破陣神器)
    god_slayer_chair: 5
  },

  get(id) {
    if (!id) return null;
    const resolvedId = this.ALIAS[id] || id;

    if (typeof GAME_DATA !== 'undefined' && GAME_DATA.items && GAME_DATA.items[resolvedId]) {
      return GAME_DATA.items[resolvedId];
    }

    const pools = [
      typeof ITEMS_ARMOR !== 'undefined' ? ITEMS_ARMOR : null,
      typeof window.ITEMS_ARMOR !== 'undefined' ? window.ITEMS_ARMOR : null,
      typeof ITEMS_WEAPON !== 'undefined' ? ITEMS_WEAPON : null,
      typeof ITEMS_FOOD !== 'undefined' ? ITEMS_FOOD : null,
      typeof ITEMS_MATERIAL !== 'undefined' ? ITEMS_MATERIAL : null
    ];

    for (const p of pools) {
      if (p && p[resolvedId]) return p[resolvedId];
    }

    const fallbacks = {
      melon_helmet: { id: "melon_helmet", name: "瓜皮安全帽", type: "head", def: 6, score: 10, desc: "台灣機車族標配，雖然遇到大撞擊可能先飛走，但至少防檢舉。" },
      tri_treasure_helmet: { id: "tri_treasure_helmet", name: "正港三寶全罩盔", type: "head", def: 18, score: 25, desc: "加裝了防風鏡與行車記錄器支架，三寶出巡無人能擋。" },
      iron_sheet: { id: "iron_sheet", name: "加厚鐵皮衣", type: "chest", def: 12, score: 15, desc: "台灣頂加違建最愛的同款鐵皮，擋風遮雨防鈍擊。" },
      riot_shield: { id: "riot_shield", name: "抗議透明盾", type: "arm", def: 15, score: 20, desc: "立院推擠專用透明壓克力防暴盾，堅固輕便。" },
      milk_tea: { id: "milk_tea", name: "全糖大冰奶", type: "food", hp: 20, sp: 40, desc: "台灣早餐店最強瀉藥聖品。喝下一口腸道蠕動速度提升300%，體力爆棚！" },
      sticky_rice_sausage: { id: "sticky_rice_sausage", name: "糯米腸", type: "food", hp: 30, sp: 15, desc: "大腸包小腸的靈魂外皮，扎實飽足。" },
      sausage: { id: "sausage", name: "烤香腸", type: "food", hp: 25, sp: 15, desc: "夜市路邊攤打香腸必備，蒜頭配著吃戰力翻倍。" },
      stinky_tofu: { id: "stinky_tofu", name: "脆皮臭豆腐", type: "food", hp: 35, sp: 10, desc: "聞起來像垃圾桶，吃起來像天堂。搭配泡菜簡直是人間凶器。" },
      tw_hotdog: { id: "tw_hotdog", name: "大腸包小腸", type: "food", hp: 60, sp: 30, desc: "炭烤香腸包入糯米腸，淋上甜辣醬與蒜片，台灣夜市霸主級美食！" },
      bento: { id: "bento", name: "立院抗議便當", type: "food", hp: 35, sp: 20, desc: "抗議現場必領的雙主菜便當，吃飽了才有力氣繼續戰鬥！" }
    };

    if (fallbacks[resolvedId]) return fallbacks[resolvedId];

    return { id: resolvedId, name: resolvedId, type: "material", desc: "這是一件神祕的台灣生存物資。" };
  },

  getRarity(id) {
    const resolvedId = this.ALIAS[id] || id;
    const level = this.RARITY_MAP[resolvedId] || 1;
    return { level, ...this.RARITY[level] };
  }
};

const DEV_CONFIG = {
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

const state = {
  timeSec: 0,
  nextCloseSec: 45,
  pendingCloseZones: [], // 💡 即將封鎖的預警區域（掛 ⚠️ 標誌）
  closedZones: [],        // 💡 已封鎖的禁區（掛 🚫 標誌）
  inCombat: false,
  gameOver: false,
  isSearching: false,
  player: null,
  ai: null,
  trackedItemId: null
};

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
  if (typeof window.GAME_MAPS !== 'undefined' && Array.isArray(window.GAME_MAPS)) {
    return window.GAME_MAPS;
  }
  if (typeof GAME_DATA !== 'undefined' && GAME_DATA.zones && GAME_DATA.zones.length > 0) {
    return GAME_DATA.zones;
  }
  return [];
}

function getSafeCurrentZone(zoneId) {
  const zones = getSafeZones();
  const found = zones.find(z => z.id === zoneId);
  return found || zones[0] || { id: "ly", name: "立法院", drops: [] };
}

function getSafeRecipes() {
  if (typeof GAME_DATA !== 'undefined' && GAME_DATA && GAME_DATA.recipes && GAME_DATA.recipes.length > 0) {
    return GAME_DATA.recipes;
  }
  if (typeof GAME_RECIPES !== 'undefined' && Array.isArray(GAME_RECIPES)) {
    return GAME_RECIPES;
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
  const targetItem = ItemRegistry.get(itemId);
  const targetId = targetItem ? targetItem.id : itemId;

  const found = zones.find(z => z.drops && (
    z.drops.includes(itemId) ||
    z.drops.includes(targetId) ||
    (targetId === 'milk_tea' && (z.drops.includes('bubble_tea') || z.drops.includes('boba_milk_tea') || z.drops.includes('milk_tea'))) ||
    (targetId === 'sticky_rice_sausage' && (z.drops.includes('rice_sausage') || z.drops.includes('sticky_rice_sausage'))) ||
    (targetId === 'bento' && (z.drops.includes('bento') || z.drops.includes('lunch_box')))
  ));

  return found ? found.name : "合成獲得";
}

function getMissingTrackedMaterials() {
  if (!state.trackedItemId || !state.player) return [];
  const recipes = getSafeRecipes();
  const recipe = recipes.find(r => r.result === state.trackedItemId);
  if (!recipe) return [];

  const ownedIds = [...(state.player.bag || [])];
  if (state.player.equip) {
    Object.values(state.player.equip).forEach(it => {
      if (it) ownedIds.push(it.id);
    });
  }

  return recipe.materials.filter(mId => !ownedIds.includes(mId));
}

function getTotalAtk(unit) {
  if (!unit) return 0;
  let total = unit.baseAtk || 0;
  if (unit.equip) {
    Object.values(unit.equip).forEach(item => {
      if (item && item.atk) total += item.atk;
    });
  }
  return total;
}

function getTotalDef(unit) {
  if (!unit) return 0;
  let total = unit.baseDef || 0;
  if (unit.equip) {
    Object.values(unit.equip).forEach(item => {
      if (item && item.def) total += item.def;
    });
  }
  return total;
}

function initGame(isSandbox = false) {
  DEV_CONFIG.enableZoneClose = !isSandbox;
  DEV_CONFIG.enableNPC = !isSandbox;

  state.timeSec = 0;
  state.nextCloseSec = 45;
  state.pendingCloseZones = [];
  state.closedZones = [];
  state.inCombat = false;
  state.gameOver = false;
  state.isSearching = false;
  state.trackedItemId = null;

  if (typeof GAME_CHARACTERS !== 'undefined' && GAME_CHARACTERS.roar_brother) {
    state.player = JSON.parse(JSON.stringify(GAME_CHARACTERS.roar_brother));
    state.player.skill.cast = GAME_CHARACTERS.roar_brother.skill.cast;
  } else {
    state.player = {
      name: "戰神咆哮哥", baseAtk: 15, baseDef: 5, maxHp: 120, hp: 120, maxSp: 100, sp: 100,
      zone: "ly", bag: ["milk_tea"],
      equip: { weapon: null, head: null, chest: null, arm: null, leg: null, acc: null },
      skill: { name: "太離譜了！", icon: "📢", cd: 10, costSp: 15, cast: () => ({ dmg: 40, log: "咆哮爆擊！" }) }
    };
  }

  if (typeof GAME_CHARACTERS !== 'undefined' && GAME_CHARACTERS.buzz_uncle) {
    state.ai = JSON.parse(JSON.stringify(GAME_CHARACTERS.buzz_uncle));
    state.ai.skill.cast = GAME_CHARACTERS.buzz_uncle.skill.cast;
  } else {
    state.ai = {
      name: "嗡嗡阿伯", baseAtk: 14, baseDef: 8, maxHp: 130, hp: 130, maxSp: 100, sp: 100,
      zone: "ck_high", alive: true, bag: ["sausage"],
      equip: { weapon: null, head: null, chest: null, arm: null, leg: null, acc: null },
      skill: { name: "嗡嗡嗡", icon: "🐝", cd: 8, costSp: 10, cast: () => ({ dmg: 30, log: "連環打擊！" }) }
    };
  }

  if (!DEV_CONFIG.enableNPC) {
    state.ai.alive = false;
  }

  const logEl = document.getElementById("game-log");
  if (logEl) logEl.innerHTML = "";

  if (isSandbox) {
    addLog("【測試模式】22 大台北實名地標全面載入完成！", "text-emerald-400 font-bold");
  } else {
    addLog("台灣生存戰正式開局！全島 22 區戰術地圖展開！", "text-amber-300 font-bold");
  }

  closeMapModal();
  closeItemInfoModal();
  closeCraftBookModal();
  updateUI();
  startGameLoop();
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
        if (state.player.sp < state.player.maxSp) {
          state.player.sp = Math.min(state.player.maxSp, state.player.sp + 5);
          updateUI();
        }
      }

      // 💡 縮圈機制：提早 15 秒掛 ⚠️ 警告，時間到轉為 🚫 禁區
      const allZones = getSafeZones();
      if (DEV_CONFIG.enableZoneClose) {
        const remainClose = state.nextCloseSec - state.timeSec;

        // 倒數 15 秒內，選定 1~2 個區域掛上 ⚠️ 預警
        if (remainClose <= 15 && remainClose > 0 && state.pendingCloseZones.length === 0) {
          const openCandidates = allZones.filter(z => z.id !== 'ly' && !state.closedZones.includes(z.id));
          if (openCandidates.length > 1) {
            const pick = openCandidates[Math.floor(Math.random() * openCandidates.length)];
            state.pendingCloseZones = [pick.id];
            addLog(`⚠️ 【廣播警報】${pick.name} 即將列入管制禁區，請儘速撤離！`, "text-amber-400 font-bold");
            updateUI();
          }
        }

        // 時間到：正式封鎖
        if (remainClose <= 0) {
          if (state.pendingCloseZones.length > 0) {
            state.pendingCloseZones.forEach(id => {
              if (!state.closedZones.includes(id)) {
                state.closedZones.push(id);
                const zName = getSafeCurrentZone(id).name;
                addLog(`🚫 【禁區封鎖】${zName} 已正式封鎖！留在區內將遭受驅離傷害！`, "text-rose-500 font-bold");
              }
            });
            state.pendingCloseZones = [];
          }
          state.nextCloseSec += 45;

          // 若玩家留在禁區扣血
          if (state.closedZones.includes(state.player.zone)) {
            state.player.hp = Math.max(1, state.player.hp - 25);
            triggerPlayerBloodHitEffect();
            addLog(`你滯留在禁區內遭受驅離，受到 25 點傷害！`, "text-rose-500 font-bold");
          }
          updateUI();
        }
      }

      if (DEV_CONFIG.enableNPC && state.timeSec % 4 === 0) {
        if (typeof runAIBrain === 'function') runAIBrain();
      }
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
  const ownedIds = [...unit.bag];
  if (unit.equip) {
    Object.values(unit.equip).forEach(it => {
      if (it) ownedIds.push(it.id);
    });
  }
  return recipes.filter(r => r.materials.every(m => ownedIds.includes(m)));
}

function craftItem(unit, recipe, isPlayer = true) {
  recipe.materials.forEach(matId => {
    const bagIdx = unit.bag.indexOf(matId);
    if (bagIdx !== -1) {
      unit.bag.splice(bagIdx, 1);
    } else if (unit.equip) {
      Object.keys(unit.equip).forEach(slot => {
        if (unit.equip[slot] && unit.equip[slot].id === matId) {
          unit.equip[slot] = null;
        }
      });
    }
  });

  const newItem = getSafeItem(recipe.result);
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

  if (promptText) {
    promptText.textContent = "🔍 搜刮中...";
    promptText.classList.remove("hidden");
  }
  if (progressBox) progressBox.classList.remove("hidden");
  if (progressBar) progressBar.style.width = "0%";

  let elapsed = 0;
  const searchInterval = setInterval(() => {
    elapsed += 100;
    const percent = (elapsed / 3000) * 100;
    if (progressBar) progressBar.style.width = `${percent}%`;

    if (elapsed >= 3000) {
      clearInterval(searchInterval);
      state.isSearching = false;

      if (progressBox) progressBox.classList.add("hidden");
      if (promptText) promptText.classList.add("hidden");

      executeSearchFinish();
    }
  }, 100);
}

function executeSearchFinish() {
  const p = state.player;
  const currentZoneObj = getSafeCurrentZone(p.zone);

  if (DEV_CONFIG.enableNPC && state.ai.alive && state.ai.zone === p.zone && Math.random() < 0.60) {
    if (typeof startCombat === 'function') {
      startCombat();
      return;
    }
  }

  const dropPool = (currentZoneObj.drops && currentZoneObj.drops.length > 0) 
    ? currentZoneObj.drops 
    : ["plastic_chair", "water_balloon"];

  const dropId = dropPool[Math.floor(Math.random() * dropPool.length)];
  const item = getSafeItem(dropId);
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

// 💡 點擊直接移動：不跳確認視窗，立即生效並關閉地圖
function moveZone(targetZoneId) {
  if (state.gameOver || state.inCombat || state.isSearching || !state.player) return;
  const p = state.player;

  if (p.zone === targetZoneId) {
    addLog("你已經在這個區域了。", "text-slate-400");
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
  addLog(`自由移動到了【${targetZone.name}】。`, "text-indigo-300");

  closeMapModal();
  updateUI();
}

function setTrackedItem(itemId) {
  const item = getSafeItem(itemId);
  if (!item) return;

  state.trackedItemId = item.id;
  addLog(`🎯 已鎖定追蹤：【${item.name}】！地圖已標示材料產地！`, "text-amber-300 font-bold");
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
        <span class="text-[11px] font-bold ${rarity.text} truncate max-w-[85px]">${targetItem.name}</span>
        <button onclick="clearTrackedItem(event)" class="text-slate-400 hover:text-rose-400 text-xs px-1 font-mono transition" title="取消追蹤">✕</button>
      </div>
    </div>
    <div id="tracker-materials-list-inner" class="space-y-0.5 text-[10px] font-mono text-slate-300"></div>
  `;

  const listInner = document.getElementById("tracker-materials-list-inner");

  const ownedIds = [...(state.player.bag || [])];
  if (state.player.equip) {
    Object.values(state.player.equip).forEach(it => {
      if (it) ownedIds.push(it.id);
    });
  }

  const recipes = getSafeRecipes();
  const recipe = recipes.find(r => r.result === targetItem.id);

  if (recipe) {
    listInner.innerHTML = recipe.materials.map(mId => {
      const isOwned = ownedIds.includes(mId);
      const mName = getItemDisplayName(mId);
      const loc = getItemDropLocationName(mId);
      const mRarity = ItemRegistry.getRarity(mId);

      if (isOwned) {
        return `
          <div class="flex justify-between items-center text-emerald-400">
            <span class="truncate max-w-[130px] font-bold">✔ ${mName}</span>
            <span class="text-[9px] text-emerald-500 font-mono">已擁有</span>
          </div>
        `;
      } else {
        return `
          <div class="flex justify-between items-center text-rose-300">
            <span class="truncate max-w-[110px] ${mRarity.text}">✖ ${mName}</span>
            <span class="text-[9px] text-amber-300/90 font-mono truncate max-w-[65px] font-bold">⭐${loc}</span>
          </div>
        `;
      }
    }).join("");
  } else {
    const loc = getItemDropLocationName(targetItem.id);
    const count = ownedIds.filter(id => id === targetItem.id || (targetItem.id === 'milk_tea' && (id === 'boba_milk_tea' || id === 'bubble_tea'))).length;

    listInner.innerHTML = `
      <div class="space-y-0.5 pt-0.5">
        <div class="flex justify-between text-slate-300">
          <span>產地來源:</span>
          <span class="text-amber-400 font-bold">⭐${loc}</span>
        </div>
        <div class="flex justify-between text-slate-300">
          <span>目前擁有:</span>
          <span class="${count > 0 ? 'text-emerald-400 font-bold' : 'text-rose-400'}">${count > 0 ? `✔ ${count} 個` : '✖ 0 個'}</span>
        </div>
      </div>
    `;
  }
}

function getItemRecipeTree(itemId) {
  const recipes = getSafeRecipes();
  const downstream = recipes.find(r => r.result === itemId) || null;
  const upstream = recipes.filter(r => r.materials.includes(itemId)).map(r => ({
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
  ['all', 'weapon', 'armor', 'food'].forEach(t => {
    const btn = document.getElementById(`craft-tab-${t}`);
    if (btn) {
      btn.className = (t === tab)
        ? "flex-1 py-1.5 rounded-lg bg-indigo-600 text-white font-bold transition"
        : "flex-1 py-1.5 rounded-lg bg-slate-800 text-slate-400 font-bold transition";
    }
  });

  renderCraftBookList();
}

function renderCraftBookList() {
  const listEl = document.getElementById("craft-recipes-list");
  if (!listEl) return;

  let recipes = getSafeRecipes();

  if (currentCraftTab !== 'all') {
    recipes = recipes.filter(r => {
      const resItem = getSafeItem(r.result);
      if (!resItem) return false;
      if (currentCraftTab === 'weapon') return resItem.type === 'weapon';
      if (currentCraftTab === 'armor') return ['head', 'chest', 'arm', 'leg', 'acc'].includes(resItem.type);
      if (currentCraftTab === 'food') return resItem.type === 'food';
      return true;
    });
  }

  if (recipes.length === 0) {
    listEl.innerHTML = `<div class="text-center text-slate-500 py-6 text-xs">暫無相關合成公式</div>`;
    return;
  }

  listEl.innerHTML = recipes.map(r => {
    const resItem = getSafeItem(r.result) || { id: r.result, name: r.result, atk: 0, def: 0 };
    const rarity = ItemRegistry.getRarity(resItem.id);
    
    const matBadges = r.materials.map(mId => {
      const mName = getItemDisplayName(mId);
      const mRarity = ItemRegistry.getRarity(mId);
      return `<button onclick="event.stopPropagation(); inspectItemById('${mId}')" class="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 active:scale-95 ${mRarity.text} rounded border ${mRarity.border} text-[10px] underline">${mName}</button>`;
    }).join(`<span class="text-slate-500 font-bold">+</span>`);

    let statTag = "";
    if (resItem.atk) statTag = `<span class="text-amber-400 font-bold font-mono">+${resItem.atk} 攻</span>`;
    else if (resItem.def) statTag = `<span class="text-sky-400 font-bold font-mono">+${resItem.def} 防</span>`;
    else if (resItem.hp) statTag = `<span class="text-emerald-400 font-bold font-mono">+${resItem.hp} HP</span>`;

    const isTrackingThis = state.trackedItemId === r.result;

    return `
      <div onclick="inspectItemById('${r.result}')" class="bg-slate-900 hover:bg-slate-800/80 cursor-pointer border ${isTrackingThis ? 'border-amber-400 shadow-md shadow-amber-950/40' : rarity.border} rounded-xl p-3 flex justify-between items-center transition">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-sm font-black ${rarity.text}">${resItem.name}</span>
            <span class="text-[9px] px-1 py-0.2 rounded font-bold ${rarity.badge}">${rarity.name}</span>
            ${statTag}
            ${isTrackingThis ? '<span class="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/60 px-1 py-0.2 rounded font-bold animate-pulse">追蹤中</span>' : ''}
          </div>
          <div class="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1.5 flex-wrap">
            <span class="text-slate-500 font-mono text-[10px]">配方:</span>
            ${matBadges}
          </div>
        </div>
        <button onclick="event.stopPropagation(); ${isTrackingThis ? "clearTrackedItem()" : `setTrackedItem('${r.result}')`}" class="px-2.5 py-1.5 ml-2 ${isTrackingThis ? 'bg-rose-950 border border-rose-500 text-rose-300 hover:bg-rose-900' : 'bg-slate-800 text-amber-400 hover:bg-slate-700'} active:scale-95 border border-slate-700 rounded-lg text-[10px] font-bold transition flex-shrink-0">
          ${isTrackingThis ? '✕ 取消' : '🎯 追蹤'}
        </button>
      </div>
    `;
  }).join("");
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
    touchState.isDragging = true;
    const item = getSafeItem(state.player.bag[touchState.bagIndex]);
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
    const healHp = item.hp || 0;
    const healSp = item.sp || 0;
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
  const catEl = document.getElementById("info-item-category");
  const nameEl = document.getElementById("info-item-name");
  const statEl = document.getElementById("info-item-stat");
  const descEl = document.getElementById("info-item-desc");
  const btnContainer = document.getElementById("info-buttons-container");

  const rarity = ItemRegistry.getRarity(item.id);

  if (catEl) catEl.textContent = `${categoryText} • [${rarity.name}品質]`;
  if (nameEl) {
    nameEl.textContent = item.name;
    nameEl.className = `text-base font-black ${rarity.text} mt-0.5`;
  }

  let statStr = "";
  if (item.type === "food") {
    statStr = `回復 +${item.hp || 0} HP / +${item.sp || 0} SP`;
  } else if (item.atk) {
    statStr = `攻擊力 +${item.atk}`;
  } else if (item.def) {
    statStr = `防禦力 +${item.def}`;
  } else {
    statStr = `基礎材料 (產地: ${getItemDropLocationName(item.id)})`;
  }
  if (statEl) statEl.textContent = statStr;

  if (descEl) descEl.textContent = item.desc || "這是一件神祕的台灣生存物資。";

  const { downstream, upstream } = getItemRecipeTree(item.id);
  const isTrackingCurrent = state.trackedItemId === item.id;

  let treeHTML = `<div class="space-y-2 border-t border-slate-800 pt-2 text-xs">`;

  // 追蹤狀態切換
  treeHTML += `
    <div class="flex justify-between items-center bg-slate-950 p-2 rounded-lg border border-slate-800">
      <span class="text-[11px] text-slate-300 font-bold">追蹤狀態</span>
      <button onclick="${isTrackingCurrent ? "clearTrackedItem()" : `setTrackedItem('${item.id}')`}" class="px-3 py-1 ${isTrackingCurrent ? 'bg-rose-950 border border-rose-500 text-rose-300 hover:bg-rose-900' : 'bg-indigo-950 border border-indigo-500 text-indigo-300 hover:bg-indigo-900'} active:scale-95 rounded-lg text-xs font-bold transition">
        ${isTrackingCurrent ? '✕ 取消追蹤' : '🎯 設為追蹤目標'}
      </button>
    </div>
  `;

  if (downstream) {
    const matBadges = downstream.materials.map(mId => {
      const mName = getItemDisplayName(mId);
      const mRarity = ItemRegistry.getRarity(mId);
      return `<button onclick="inspectItemById('${mId}')" class="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 ${mRarity.text} rounded border ${mRarity.border} text-[10px] underline">${mName}</button>`;
    }).join(`<span class="text-slate-500 font-bold">+</span>`);

    treeHTML += `
      <div class="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
        <div class="text-[10px] font-bold text-slate-400 mb-1">🔻【合成來源 (下位素材)】</div>
        <div class="flex items-center gap-1.5 flex-wrap">
          ${matBadges}
        </div>
      </div>
    `;
  }

  if (upstream.length > 0) {
    const upstreamBadges = upstream.map(u => {
      const upName = u.resultItem ? u.resultItem.name : u.resultId;
      const isUpTracking = state.trackedItemId === u.resultId;
      const upRarity = ItemRegistry.getRarity(u.resultId);
      return `
        <div class="flex justify-between items-center py-1 border-b border-slate-800/60 last:border-0">
          <button onclick="inspectItemById('${u.resultId}')" class="${upRarity.text} hover:opacity-80 font-bold underline text-[11px] text-left truncate max-w-[170px]">
            🔺 ${upName}
          </button>
          <button onclick="${isUpTracking ? "clearTrackedItem()" : `setTrackedItem('${u.resultId}')`}" class="px-2 py-0.5 ${isUpTracking ? 'bg-rose-950 text-rose-300 border-rose-600' : 'bg-slate-800 text-amber-400 hover:bg-slate-700'} active:scale-95 text-[10px] rounded border border-slate-700 font-bold transition">
            ${isUpTracking ? '✕ 取消' : '🎯 追蹤'}
          </button>
        </div>
      `;
    }).join("");

    treeHTML += `
      <div class="bg-slate-950/80 p-2 rounded-lg border border-slate-800 max-h-24 overflow-y-auto custom-scrollbar">
        <div class="text-[10px] font-bold text-indigo-400 mb-1">🔺【可合成的高階物品 (上位衍生)】</div>
        ${upstreamBadges}
      </div>
    `;
  }

  treeHTML += `</div>`;

  let buttonsHTML = "";
  if (isFromBag) {
    if (['weapon', 'head', 'chest', 'arm', 'leg', 'acc'].includes(item.type)) {
      buttonsHTML = `<button onclick="modalActionEquip()" class="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow transition">裝備 (自動替換)</button>`;
    } else if (item.type === "food") {
      buttonsHTML = `<button onclick="modalActionUse()" class="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow transition">使用 (食用)</button>`;
    }
    buttonsHTML += `<button onclick="modalActionDrop()" class="w-full py-2 bg-slate-800 hover:bg-slate-700 text-rose-400 font-bold rounded-xl text-xs transition">丟棄物資</button>`;
  } else if (activeInspectTarget.type === 'equip') {
    buttonsHTML = `<button onclick="modalActionUnequip()" class="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs shadow transition">解除裝備 (收回背包)</button>`;
  }

  if (btnContainer) {
    btnContainer.innerHTML = treeHTML + `<div class="space-y-1.5 pt-1">${buttonsHTML}</div>`;
  }

  if (modal) modal.classList.remove("hidden");
}

function closeItemInfoModal() {
  const modal = document.getElementById("item-info-modal");
  if (modal) modal.classList.add("hidden");
  activeInspectTarget = { type: null, indexOrKey: null };
}

function modalActionUse() {
  if (activeInspectTarget.type !== 'bag') return;
  applyItemDropToRed(activeInspectTarget.indexOrKey);
  closeItemInfoModal();
}

function modalActionEquip() {
  if (activeInspectTarget.type !== 'bag') return;
  applyItemDropToRed(activeInspectTarget.indexOrKey);
  closeItemInfoModal();
}

function modalActionDrop() {
  if (activeInspectTarget.type !== 'bag') return;
  applyItemDropToYellow(activeInspectTarget.indexOrKey);
  closeItemInfoModal();
}

function modalActionUnequip() {
  if (activeInspectTarget.type !== 'equip') return;
  const p = state.player;
  const slotKey = activeInspectTarget.indexOrKey;

  if (p.bag.length >= 6) {
    addLog(`背包已滿（6/6），無法卸下裝備！`, "text-rose-400");
    return;
  }

  if (p.equip && p.equip[slotKey]) {
    const unequipped = p.equip[slotKey];
    p.bag.push(unequipped.id);
    p.equip[slotKey] = null;
    addLog(`卸下了【${unequipped.name}】，已收回背包。`, "text-slate-400");
  }

  closeItemInfoModal();
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
      return `
        <div onclick="inspectEquipSlot('${s.key}')" class="h-9 rounded border-2 ${rarity.border} bg-slate-900/95 flex items-center justify-center relative cursor-pointer active:scale-95 transition ${rarity.glow}" title="點擊檢視 ${s.item.name}">
          <div class="${rarity.iconColor}">
            ${s.svg}
          </div>
          <span class="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
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

// ==========================================
// 💡 【全新 22 區直式戰術卡片地圖（方案 A）】
// ==========================================
function renderTacticalMap() {
  const container = document.getElementById("map-nodes-container");
  if (!container || !state.player) return;

  const p = state.player;
  const zones = getSafeZones();
  const missingMats = getMissingTrackedMaterials();

  const hintEl = document.getElementById("map-target-hint");
  if (hintEl) {
    if (missingMats.length > 0) {
      const targetItem = getSafeItem(state.trackedItemId);
      hintEl.textContent = `🎯 正在追蹤【${targetItem.name}】所需材料，黃框 ⭐ 即為掉落地！`;
    } else {
      hintEl.textContent = "點擊地標直接前往 (-5 體力)";
    }
  }

  // 渲染單個地標按鈕的工廠函數
  const createMapBtn = (zoneId, isCenter = false) => {
    const z = zones.find(x => x.id === zoneId);
    if (!z) return "";
    const isCurrent = (p.zone === z.id);
    const isClosed = state.closedZones.includes(z.id);
    const isPendingClose = !isClosed && state.pendingCloseZones.includes(z.id);
    const canMove = !isClosed && !isCurrent;

    // 是否包含追蹤缺料
    const hasNeededMaterial = !isClosed && missingMats.some(mId => {
      const targetId = ItemRegistry.ALIAS[mId] || mId;
      return z.drops && (z.drops.includes(mId) || z.drops.includes(targetId));
    });

    let boxStyle = "bg-slate-900 border-slate-800 text-slate-400";
    let statusBadge = "";

    if (isCurrent) {
      boxStyle = "bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-950 font-black";
      statusBadge = `<span class="text-[9px] bg-indigo-950 px-1 py-0.5 rounded text-indigo-200">目前</span>`;
    } else if (isClosed) {
      boxStyle = "bg-rose-950/80 border-rose-900 text-rose-500/70 line-through opacity-50 cursor-not-allowed";
      statusBadge = `<span class="text-[9px] text-rose-500">🚫 禁區</span>`;
    } else if (isPendingClose) {
      boxStyle = "bg-rose-950/90 border-2 border-rose-500 text-rose-200 animate-pulse cursor-pointer shadow-lg shadow-rose-950";
      statusBadge = `<span class="text-[9px] bg-rose-600 text-white px-1 py-0.2 rounded font-black">⚠️ 預警</span>`;
    } else if (hasNeededMaterial) {
      boxStyle = "bg-amber-950/90 border-2 border-amber-400 text-amber-200 cursor-pointer shadow-lg shadow-amber-950/70 animate-pulse";
      statusBadge = `<span class="text-[9px] text-amber-400 font-bold">⭐ 缺料</span>`;
    } else if (canMove) {
      boxStyle = "bg-slate-900/90 hover:bg-slate-800 border-slate-700/80 hover:border-slate-500 text-slate-200 cursor-pointer shadow-sm";
      statusBadge = `<span class="text-[9px] text-slate-500 font-mono">-5體</span>`;
    }

    const centerScale = isCenter ? "col-span-3 py-2 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-indigo-500/80 text-white shadow-xl" : "py-1.5";

    return `
      <button onclick="moveZone('${z.id}')" class="relative rounded-xl border text-center transition active:scale-95 flex flex-col items-center justify-center px-1 ${boxStyle} ${centerScale}">
        <span class="text-xs font-black truncate max-w-[95px] tracking-wide">${z.name}</span>
        <div class="mt-0.5">${statusBadge}</div>
      </button>
    `;
  };

  // 💡 直式 22 區戰術分區佈局（北區、西區、中央核心、東區、南區）
  container.innerHTML = `
    <!-- 1. 北部海岸線 (5區) -->
    <div class="w-full">
      <div class="text-[9px] text-sky-400 font-bold uppercase tracking-widest mb-1">🌊 北部海岸 • 港口水域</div>
      <div class="grid grid-cols-3 gap-1.5">
        ${createMapBtn("baishawan")}
        ${createMapBtn("fugui_cape")}
        ${createMapBtn("dadaocheng")}
      </div>
      <div class="grid grid-cols-2 gap-1.5 mt-1.5">
        ${createMapBtn("beitou")}
        ${createMapBtn("zhitong_tunnel")}
      </div>
    </div>

    <!-- 2. 中央核心特區 (立法院置中放大) -->
    <div class="w-full my-1">
      <div class="text-[9px] text-amber-400 font-bold uppercase tracking-widest mb-1">⚡ 核心特區 • 決賽死鬥點</div>
      <div class="grid grid-cols-3 gap-1.5">
        ${createMapBtn("ly", true)}
      </div>
    </div>

    <!-- 3. 西區與文教 (4區) -->
    <div class="w-full">
      <div class="text-[9px] text-indigo-400 font-bold uppercase tracking-widest mb-1">🏛️ 西區老街 • 醫療文教</div>
      <div class="grid grid-cols-2 gap-1.5">
        ${createMapBtn("bopiliao")}
        ${createMapBtn("longshan_temple")}
        ${createMapBtn("ximen")}
        ${createMapBtn("ntu_hospital")}
      </div>
      <div class="grid grid-cols-1 gap-1.5 mt-1.5">
        ${createMapBtn("ck_high")}
      </div>
    </div>

    <!-- 4. 東區政經都會 (7區) -->
    <div class="w-full">
      <div class="text-[9px] text-emerald-400 font-bold uppercase tracking-widest mb-1">🏙️ 東區都會 • 行政防衛</div>
      <div class="grid grid-cols-3 gap-1.5">
        ${createMapBtn("taipei_gov")}
        ${createMapBtn("xinyi_fire")}
        ${createMapBtn("minsheng")}
      </div>
      <div class="grid grid-cols-2 gap-1.5 mt-1.5">
        ${createMapBtn("grand_hotel")}
        ${createMapBtn("defense_dept")}
      </div>
      <div class="grid grid-cols-2 gap-1.5 mt-1.5">
        ${createMapBtn("jinan_church")}
        ${createMapBtn("daan_park")}
      </div>
    </div>

    <!-- 5. 南部山區林地 (4區) -->
    <div class="w-full">
      <div class="text-[9px] text-rose-400 font-bold uppercase tracking-widest mb-1">🌲 南部近郊 • 山林公墓</div>
      <div class="grid grid-cols-2 gap-1.5">
        ${createMapBtn("qingtian")}
        ${createMapBtn("xiangshan")}
        ${createMapBtn("wugu_ind")}
        ${createMapBtn("liuzhangli")}
      </div>
    </div>
  `;
}

function updateUI() {
  if (!state.player) return;
  const p = state.player;
  const ai = state.ai;

  const statEl = document.getElementById("player-stats");
  if (statEl) statEl.textContent = `攻擊 ${getTotalAtk(p)} | 防禦 ${getTotalDef(p)}`;

  const zObj = getSafeCurrentZone(p.zone);

  const hpBar = document.getElementById("hp-bar");
  if (hpBar) hpBar.style.width = `${(p.hp / p.maxHp) * 100}%`;
  const hpText = document.getElementById("hp-text");
  if (hpText) hpText.textContent = `${p.hp}/${p.maxHp}`;

  const spBar = document.getElementById("sp-bar");
  if (spBar) spBar.style.width = `${(p.sp / p.maxSp) * 100}%`;
  const spText = document.getElementById("sp-text");
  if (spText) spText.textContent = `${p.sp}/${p.maxSp}`;

  renderEquipSixGrid(p);
  renderTargetTracker();

  const mapPing = document.getElementById("map-btn-ping");
  if (mapPing) {
    const missing = getMissingTrackedMaterials();
    if (missing.length > 0) mapPing.classList.remove("hidden");
    else mapPing.classList.add("hidden");
  }

  const craftBox = document.getElementById("craft-alert-box");
  const availableRecipes = findAvailableRecipes(p);
  if (availableRecipes.length > 0 && craftBox) {
    craftBox.classList.remove("hidden");
    craftBox.innerHTML = availableRecipes.map(r => {
      const targetItem = getSafeItem(r.result);
      const rarity = ItemRegistry.getRarity(targetItem.id);
      return `<button onclick="craftItem(state.player, GAME_DATA.recipes.find(x=>x.result==='${r.result}'), true)" class="w-full py-2 px-3 mb-1 bg-emerald-500 text-slate-950 font-black rounded-xl shadow-lg flex justify-between items-center animate-pulse-fast"><span>一鍵合成：【${targetItem.name}】(${rarity.name})</span><span>${r.desc}</span></button>`;
    }).join("");
  } else if (craftBox) { 
    craftBox.classList.add("hidden"); 
  }

  const expPanel = document.getElementById("explore-panel");
  const comPanel = document.getElementById("combat-panel");

  if (state.inCombat && ai) {
    if (expPanel) expPanel.classList.add("hidden");
    if (comPanel) comPanel.classList.remove("hidden");
    if (typeof updateCombatUI === 'function') updateCombatUI();
  } else {
    if (expPanel) expPanel.classList.remove("hidden");
    if (comPanel) comPanel.classList.add("hidden");

    const zoneTitle = document.getElementById("zone-title");
    if (zoneTitle && zObj) zoneTitle.textContent = zObj.name;

    const zoneDrops = document.getElementById("zone-drops");
    if (zoneDrops && zObj) {
      const dropNames = (zObj.drops || []).map(id => getItemDisplayName(id));
      zoneDrops.textContent = `可搜刮：${dropNames.join("、")}`;
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
