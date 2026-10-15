/**
 * 【模組：核心管家 main.js】
 * v45：根除英文代碼顯示，徹底分離大冰奶與珍珠奶茶，修正糯米腸別名
 */
const DEV_CONFIG = {
  enableZoneClose: true,
  enableNPC: true
};

const EQUIP_SLOT_SVGS = {
  weapon: `<svg class="w-6 h-6 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 17.5L3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/><path d="M19 21l2-2"/></svg>`,
  head:   `<svg class="w-6 h-6 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 18v-4a8 8 0 1 1 16 0v4"/><path d="M2 18h20"/></svg>`,
  chest:  `<svg class="w-6 h-6 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>`,
  arm:    `<svg class="w-6 h-6 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>`,
  leg:    `<svg class="w-6 h-6 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 3v11l-3 4v3h14v-3l-3-4V3H7z"/></svg>`,
  acc:    `<svg class="w-6 h-6 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="14" r="6"/><path d="M9 5l3-2 3 2-3 3-3-3z"/></svg>`
};

const state = {
  timeSec: 0,
  nextCloseSec: 45,
  closedZones: [],
  inCombat: false,
  gameOver: false,
  isSearching: false,
  player: null,
  ai: null,
  trackedItemId: null
};

// 確保所有分散檔案的物品均匯入 GAME_DATA
function ensureGameDataIntegrity() {
  if (typeof GAME_DATA === 'undefined') window.GAME_DATA = { items: {}, recipes: [], zones: [] };
  if (!GAME_DATA.items) GAME_DATA.items = {};

  if (window.ITEMS_WEAPON) Object.assign(GAME_DATA.items, window.ITEMS_WEAPON);
  if (window.ITEMS_ARMOR) Object.assign(GAME_DATA.items, window.ITEMS_ARMOR);
  if (window.ITEMS_MATERIAL) Object.assign(GAME_DATA.items, window.ITEMS_MATERIAL);
  if (window.ITEMS_FOOD) Object.assign(GAME_DATA.items, window.ITEMS_FOOD);
  if (window.GAME_RECIPES && (!GAME_DATA.recipes || GAME_DATA.recipes.length === 0)) {
    GAME_DATA.recipes = window.GAME_RECIPES;
  }
}

// 萬能物品安全讀取 (含雙向英文代碼解析)
function getSafeItem(itemId) {
  ensureGameDataIntegrity();
  if (!itemId) return null;
  if (GAME_DATA.items[itemId]) return GAME_DATA.items[itemId];

  // 獨立食物對應防呆
  if (itemId === "bubble_tea") {
    return {
      id: "bubble_tea",
      name: "波霸珍珠奶茶",
      type: "food",
      hp: 50,
      sp: 20,
      desc: "台灣之光手搖飲！滿滿Q彈黑糖波霸，嚼勁十足，一口下去身心靈瞬間滿血。"
    };
  }

  if (itemId === "milk_tea" || itemId === "boba_milk_tea") {
    return {
      id: "milk_tea",
      name: "全糖大冰奶",
      type: "food",
      hp: 20,
      sp: 40,
      desc: "台灣早餐店最強瀉藥聖品。喝下一口腸道蠕動速度提升300%，體力爆棚！"
    };
  }

  if (itemId === "rice_sausage" || itemId === "sticky_rice_sausage") {
    return {
      id: "rice_sausage",
      name: "糯米腸",
      type: "food",
      hp: 30,
      sp: 15,
      desc: "大腸包小腸的靈魂外皮，扎實飽足。"
    };
  }

  return { id: itemId, name: getItemDisplayName(itemId), type: "material", desc: "這是一件神祕的台灣生存物資。" };
}

function getItemDisplayName(itemId) {
  if (!itemId) return "空";
  ensureGameDataIntegrity();
  if (GAME_DATA.items && GAME_DATA.items[itemId]) {
    return GAME_DATA.items[itemId].name;
  }
  if (itemId === "bubble_tea") return "波霸珍珠奶茶";
  if (itemId === "milk_tea" || itemId === "boba_milk_tea") return "全糖大冰奶";
  if (itemId === "rice_sausage" || itemId === "sticky_rice_sausage") return "糯米腸";
  if (itemId === "sausage") return "烤香腸";
  if (itemId === "stinky_tofu") return "脆皮臭豆腐";
  return itemId;
}

function getItemDropLocationName(itemId) {
  ensureGameDataIntegrity();
  if (!GAME_DATA.zones) return "士林夜市";
  const found = GAME_DATA.zones.find(z => z.drops && (
    z.drops.includes(itemId) ||
    (itemId === 'bubble_tea' && z.drops.includes('bubble_tea')) ||
    (itemId === 'milk_tea' && (z.drops.includes('milk_tea') || z.drops.includes('boba_milk_tea'))) ||
    (itemId === 'rice_sausage' && (z.drops.includes('rice_sausage') || z.drops.includes('sticky_rice_sausage')))
  ));
  return found ? found.name : "合成獲得";
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
  ensureGameDataIntegrity();
  DEV_CONFIG.enableZoneClose = !isSandbox;
  DEV_CONFIG.enableNPC = !isSandbox;

  state.timeSec = 0;
  state.nextCloseSec = 45;
  state.closedZones = [];
  state.inCombat = false;
  state.gameOver = false;
  state.isSearching = false;
  state.trackedItemId = null;

  state.player = JSON.parse(JSON.stringify(GAME_CHARACTERS.roar_brother));
  state.player.skill.cast = GAME_CHARACTERS.roar_brother.skill.cast;

  state.ai = JSON.parse(JSON.stringify(GAME_CHARACTERS.buzz_uncle));
  state.ai.skill.cast = GAME_CHARACTERS.buzz_uncle.skill.cast;

  if (!DEV_CONFIG.enableNPC) {
    state.ai.alive = false;
  }

  const logEl = document.getElementById("game-log");
  if (logEl) logEl.innerHTML = "";

  if (isSandbox) {
    addLog("【測試模式】任何道具皆可追蹤，已徹底修復英文代碼！", "text-emerald-400 font-bold");
  } else {
    addLog("台灣生存戰正式開局！所有物品皆可點擊追蹤產地與合成！", "text-amber-300 font-bold");
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

      const warningEl = document.getElementById("zone-warning");
      if (DEV_CONFIG.enableZoneClose) {
        const remainClose = state.nextCloseSec - state.timeSec;
        if (warningEl && state.closedZones.length < 3) {
          warningEl.className = "text-rose-400 font-semibold animate-pulse";
          if (remainClose > 0) {
            warningEl.textContent = `${remainClose}秒後封鎖下個區域`;
          } else {
            const open = GAME_DATA.zones.filter(z => !state.closedZones.includes(z.id));
            if (open.length > 1) {
              state.closedZones.push(open[0].id);
              state.nextCloseSec += 45;
              addLog(`【全島緊急廣播】${open[0].name} 已被列為戒嚴禁區！`, "text-rose-500 font-bold");
              
              if (state.player.zone === open[0].id) {
                state.player.hp = Math.max(1, state.player.hp - 25);
                addLog(`你滯留在禁區內，遭到驅離受到 25 點傷害！`, "text-rose-500 font-bold");
              }
              updateUI();
            }
          }
        } else if (state.closedZones.length >= 3 && warningEl) {
          warningEl.textContent = `最終決戰區！強制死鬥！`;
        }
      } else {
        if (warningEl) {
          warningEl.textContent = `測試模式：無縮圈限制`;
          warningEl.className = "text-emerald-400 font-semibold";
        }
      }

      if (DEV_CONFIG.enableNPC && state.timeSec % 4 === 0) {
        runAIBrain();
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
  ensureGameDataIntegrity();
  if (!GAME_DATA || !GAME_DATA.recipes) return [];
  const ownedIds = [...unit.bag];
  if (unit.equip) {
    Object.values(unit.equip).forEach(it => {
      if (it) ownedIds.push(it.id);
    });
  }
  return GAME_DATA.recipes.filter(r => r.materials.every(m => ownedIds.includes(m)));
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
  ensureGameDataIntegrity();
  const p = state.player;
  const currentZoneObj = GAME_DATA.zones.find(z => z.id === p.zone);

  if (DEV_CONFIG.enableNPC && state.ai.alive && state.ai.zone === p.zone && Math.random() < 0.60) {
    startCombat();
    return;
  }

  if (!currentZoneObj || !currentZoneObj.drops || currentZoneObj.drops.length === 0) {
    addLog("此處沒有發現任何物資。", "text-slate-400");
    updateUI();
    return;
  }

  const dropId = currentZoneObj.drops[Math.floor(Math.random() * currentZoneObj.drops.length)];
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

function isAdjacent(fromZoneId, toZoneId) {
  return true;
}

function moveZone(targetZoneId) {
  if (state.gameOver || state.inCombat || state.isSearching || !state.player) return;
  const p = state.player;

  if (p.zone === targetZoneId) {
    addLog("你已經在這個區域了。", "text-slate-400");
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
  const zName = GAME_DATA.zones.find(z => z.id === targetZoneId).name;
  addLog(`自由移動到了【${zName}】。`, "text-indigo-300");

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

function renderTargetTracker() {
  const trackerBox = document.getElementById("target-tracker-box");
  const nameEl = document.getElementById("tracker-target-name");
  const listEl = document.getElementById("tracker-materials-list");
  if (!trackerBox || !nameEl || !listEl) return;

  if (!state.trackedItemId) {
    trackerBox.classList.add("hidden");
    return;
  }

  const targetItem = getSafeItem(state.trackedItemId);
  if (!targetItem) {
    trackerBox.classList.add("hidden");
    return;
  }

  trackerBox.classList.remove("hidden");
  nameEl.textContent = targetItem.name;

  const ownedIds = [...(state.player.bag || [])];
  if (state.player.equip) {
    Object.values(state.player.equip).forEach(it => {
      if (it) ownedIds.push(it.id);
    });
  }

  const recipe = GAME_DATA.recipes ? GAME_DATA.recipes.find(r => r.result === targetItem.id) : null;

  if (recipe) {
    listEl.innerHTML = recipe.materials.map(mId => {
      const isOwned = ownedIds.includes(mId);
      const mName = getItemDisplayName(mId);
      const loc = getItemDropLocationName(mId);

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
            <span class="truncate max-w-[110px]">✖ ${mName}</span>
            <span class="text-[9px] text-amber-300/90 font-mono truncate max-w-[65px]">${loc}</span>
          </div>
        `;
      }
    }).join("");
  } else {
    const loc = getItemDropLocationName(targetItem.id);
    const count = ownedIds.filter(id => id === targetItem.id).length;

    listEl.innerHTML = `
      <div class="space-y-0.5 pt-0.5">
        <div class="flex justify-between text-slate-300">
          <span>產地來源:</span>
          <span class="text-amber-400 font-bold">${loc}</span>
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
  ensureGameDataIntegrity();
  if (!GAME_DATA || !GAME_DATA.recipes) return { downstream: null, upstream: [] };

  const downstream = GAME_DATA.recipes.find(r => r.result === itemId) || null;
  const upstream = GAME_DATA.recipes.filter(r => r.materials.includes(itemId)).map(r => ({
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

// ==========================================
// 【合成圖鑑
