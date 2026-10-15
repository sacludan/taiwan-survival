/**
 * 【模組：核心管家 main.js】
 * v36：經典黑倖探索循環——搜刮有 40% 機率撞見同區域敵人觸發單次交鋒，否則拾取物資
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
  ai: null
};

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
  state.closedZones = [];
  state.inCombat = false;
  state.gameOver = false;
  state.isSearching = false;

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
    addLog("【測試模式】黑倖式探索：搜刮可能翻出物資或遭遇對手！", "text-emerald-400 font-bold");
  } else {
    addLog("台灣生存戰正式開局！點擊區域搜刮！", "text-amber-300 font-bold");
  }

  closeMapModal();
  closeItemInfoModal();
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

      // NPC 在背景遊蕩
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

  const newItem = GAME_DATA.items[recipe.result];
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

// 💡 3 秒搜刮邏輯
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

// 💡 經典黑倖搜刮結算：機率遭遇對手 vs 獲得物資
function executeSearchFinish() {
  const p = state.player;
  const currentZoneObj = GAME_DATA.zones.find(z => z.id === p.zone);

  // 如果 NPC 在同一個地圖，且存活，有 45% 的機率觸發遭遇戰！
  if (DEV_CONFIG.enableNPC && state.ai.alive && state.ai.zone === p.zone && Math.random() < 0.45) {
    startCombat();
    return;
  }

  // 否則為獲得物資
  const dropId = currentZoneObj.drops[Math.floor(Math.random() * currentZoneObj.drops.length)];
  const item = GAME_DATA.items[dropId];
  const slot = item.type;

  if (p.equip && p.equip[slot] === null) {
    p.equip[slot] = item;
    addLog(`搜刮獲得並裝備【${item.name}】！`, "text-amber-300 font-bold");
  } else if (p.bag.length < 6) {
    p.bag.push(dropId);
    addLog(`搜刮獲得【${item.name}】！`, "text-emerald-300");
  } else {
    addLog(`背包已滿（6/6），錯過了【${item.name}】！`, "text-rose-400");
  }
  updateUI();
}

function openMapModal() {
  if (state.gameOver || state.inCombat || state.isSearching) {
    if (state.isSearching) addLog("搜刮中，無法移動！", "text-rose-400");
    return;
  }
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

  // 移動到新地圖不會立刻開打，必須透過「搜刮」來尋找目標
  updateUI();
}

// ==========================================
// 【觸控拖曳系統 (0 延遲)】
// ==========================================
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
    const item = GAME_DATA.items[state.player.bag[touchState.bagIndex]];
    const ghost = document.createElement("div");
    ghost.id = "touch-drag-ghost";
    ghost.className = "fixed pointer-events-none z-[9999] px-3 py-1.5 bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-2xl border-2 border-white scale-110 opacity-90 transition-transform";
    ghost.textContent = item ? item.name : "物品";
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
  const item = GAME_DATA.items[p.bag[bagIdx]];
  const itemName = item ? item.name : p.bag[bagIdx];

  p.bag.splice(bagIdx, 1);
  addLog(`丟棄了【${itemName}】。`, "text-slate-500");
  updateUI();
}

function applyItemDropToRed(bagIdx) {
  if (bagIdx === null || !state.player) return;
  const p = state.player;
  const itemId = p.bag[bagIdx];
  const item = GAME_DATA.items[itemId];
  if (!item) return;

  if (item.type === "food") {
    const healHp = item.hp || 0;
    const healSp = item.sp || 0;
    p.hp = Math.min(p.maxHp, p.hp + healHp);
    p.sp = Math.min(p.maxSp, p.sp + healSp);
    p.bag.splice(bagIdx, 1);
    addLog(`吃掉了【${item.name}】！回復 ${healHp} HP / ${healSp} SP。`, "text-emerald-400 font-bold");
  } 
  else if (p.equip && p.equip[item.type] !== undefined) {
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

// ==========================================
// 【詳細資訊檢視彈窗系統】
// ==========================================
let activeInspectTarget = { type: null, indexOrKey: null };

function inspectBagItem(index) {
  if (state.gameOver || state.isSearching) return;
  const p = state.player;
  const itemId = p.bag[index];
  if (!itemId) return;

  const item = GAME_DATA.items[itemId];
  if (!item) return;

  activeInspectTarget = { type: 'bag', indexOrKey: index };
  showItemInfoModal(item, '隨身背包物品', true);
}

function inspectEquipSlot(slotKey) {
  if (state.gameOver || state.isSearching) return;
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

  if (catEl) catEl.textContent = categoryText;
  if (nameEl) nameEl.textContent = item.name;

  let statStr = "";
  if (item.atk) statStr = `攻擊力 +${item.atk}`;
  else if (item.def) statStr = `防禦力 +${item.def}`;
  else if (item.type === "food") statStr = `回復 +${item.hp || 0} HP / +${item.sp || 0} SP`;
  else statStr = `材料物資`;
  if (statEl) statEl.textContent = statStr;

  if (descEl) descEl.textContent = item.desc || "這是一件神祕的台灣生存物資。";

  let buttonsHTML = "";
  if (isFromBag) {
    if (['weapon', 'head', 'chest', 'arm', 'leg', 'acc'].includes(item.type)) {
      buttonsHTML = `<button onclick="modalActionEquip()" class="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow transition">裝備 (自動替換)</button>`;
    } else if (item.type === "food") {
      buttonsHTML = `<button onclick="modalActionUse()" class="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow transition">使用 (食用)</button>`;
    }
    buttonsHTML += `<button onclick="modalActionDrop()" class="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-rose-400 font-bold rounded-xl text-xs transition">丟棄物資</button>`;
  } else {
    buttonsHTML = `<button onclick="modalActionUnequip()" class="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs shadow transition">解除裝備 (收回背包)</button>`;
  }

  if (btnContainer) btnContainer.innerHTML = buttonsHTML;
  if (modal) modal.classList.remove("hidden");
}

function closeItemInfoModal(event) {
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
    { key: "weapon", label: "武器", item: p.equip?.weapon, svg: EQUIP_SLOT_SVGS.weapon, activeColor: "border-amber-500/80 bg-amber-950/40" },
    { key: "head",   label: "頭部", item: p.equip?.head,   svg: EQUIP_SLOT_SVGS.head,   activeColor: "border-sky-500/80 bg-sky-950/40" },
    { key: "chest",  label: "衣服", item: p.equip?.chest,  svg: EQUIP_SLOT_SVGS.chest,  activeColor: "border-emerald-500/80 bg-emerald-950/40" },
    { key: "arm",    label: "手臂", item: p.equip?.arm,    svg: EQUIP_SLOT_SVGS.arm,    activeColor: "border-purple-500/80 bg-purple-950/40" },
    { key: "leg",    label: "腿部", item: p.equip?.leg,    svg: EQUIP_SLOT_SVGS.leg,    activeColor: "border-indigo-500/80 bg-indigo-950/40" },
    { key: "acc",    label: "飾品", item: p.equip?.acc,    svg: EQUIP_SLOT_SVGS.acc,    activeColor: "border-rose-500/80 bg-rose-950/40" }
  ];

  gridEl.innerHTML = slots.map(s => {
    if (s.item) {
      return `
        <div onclick="inspectEquipSlot('${s.key}')" class="h-9 rounded border ${s.activeColor} flex items-center justify-center relative cursor-pointer active:scale-95 transition shadow" title="點擊檢視 ${s.item.name}">
          ${s.svg}
          <span class="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
        </div>
      `;
    }
    return `
      <div onclick="inspectEquipSlot('${s.key}')" class="h-9 rounded border border-slate-800 bg-slate-900/90 flex items-center justify-center relative opacity-60 cursor-pointer" title="${s.label} (空)">
        ${s.svg}
      </div>
    `;
  }).join("");
}

function renderTacticalMap() {
  const container = document.getElementById("map-nodes-container");
  if (!container || !state.player) return;

  const p = state.player;

  const buildNodeHTML = (zoneId) => {
    const z = GAME_DATA.zones.find(x => x.id === zoneId);
    if (!z) return "";
    const isCurrent = (p.zone === z.id);
    const isClosed = state.closedZones.includes(z.id);
    const canMove = !isClosed && !isCurrent;

    let boxStyle = "bg-slate-900 border-slate-800 text-slate-500";
    let statusTag = "自由直達";

    if (isCurrent) {
      boxStyle = "bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-950";
      statusTag = "目前位置";
    } else if (isClosed) {
      boxStyle = "bg-rose-950 border-rose-800 text-rose-500 line-through opacity-60";
      statusTag = "禁區封鎖";
    } else if (canMove) {
      boxStyle = "bg-emerald-950/90 hover:bg-emerald-900 border-emerald-500 text-emerald-200 cursor-pointer shadow-md";
      statusTag = "可前往 (-5體)";
    }

    return `
      <button onclick="moveZone('${z.id}')" class="w-44 py-2.5 px-4 rounded-xl border-2 text-center transition active:scale-95 ${boxStyle}">
        <div class="text-base font-black tracking-wider">${z.name}</div>
        <div class="text-[10px] mt-0.5 opacity-80">${statusTag}</div>
      </button>
    `;
  };

  container.innerHTML = `
    ${buildNodeHTML("shilin")}
    <div class="h-4 w-0.5 bg-slate-600"></div>
    ${buildNodeHTML("taipei_main")}
    <div class="w-48 h-4 flex justify-around">
      <div class="h-full w-0.5 bg-slate-600"></div>
      <div class="h-full w-0.5 bg-slate-600"></div>
    </div>
    <div class="flex gap-4">
      ${buildNodeHTML("ly")}
      ${buildNodeHTML("hsinchu")}
    </div>
  `;
}

function updateUI() {
  if (!state.player || !state.ai || typeof GAME_DATA === 'undefined') return;
  const p = state.player; const ai = state.ai;

  const statEl = document.getElementById("player-stats");
  if (statEl) statEl.textContent = `攻擊 ${getTotalAtk(p)} | 防禦 ${getTotalDef(p)}`;

  const zObj = GAME_DATA.zones.find(z => z.id === p.zone);

  const hpBar = document.getElementById("hp-bar");
  if (hpBar) hpBar.style.width = `${(p.hp / p.maxHp) * 100}%`;
  const hpText = document.getElementById("hp-text");
  if (hpText) hpText.textContent = `${p.hp}/${p.maxHp}`;

  const spBar = document.getElementById("sp-bar");
  if (spBar) spBar.style.width = `${(p.sp / p.maxSp) * 100}%`;
  const spText = document.getElementById("sp-text");
  if (spText) spText.textContent = `${p.sp}/${p.maxSp}`;

  renderEquipSixGrid(p);

  const craftBox = document.getElementById("craft-alert-box");
  const availableRecipes = findAvailableRecipes(p);
  if (availableRecipes.length > 0 && craftBox) {
    craftBox.classList.remove("hidden");
    craftBox.innerHTML = availableRecipes.map(r => {
      const targetItem = GAME_DATA.items[r.result];
      return `<button onclick="craftItem(state.player, GAME_DATA.recipes.find(x=>x.result==='${r.result}'), true)" class="w-full py-2 px-3 mb-1 bg-emerald-500 text-slate-950 font-black rounded-xl shadow-lg flex justify-between items-center animate-pulse-fast"><span>一鍵合成：【${targetItem.name}】</span><span>${r.desc}</span></button>`;
    }).join("");
  } else if (craftBox) { 
    craftBox.classList.add("hidden"); 
  }

  // 💡 遭遇狀態：切換顯示探索面板 vs 交鋒面板
  const expPanel = document.getElementById("explore-panel");
  const comPanel = document.getElementById("combat-panel");

  if (state.inCombat) {
    if (expPanel) expPanel.classList.add("hidden");
    if (comPanel) comPanel.classList.remove("hidden");
    updateCombatUI();
  } else {
    if (expPanel) expPanel.classList.remove("hidden");
    if (comPanel) comPanel.classList.add("hidden");

    const zoneTitle = document.getElementById("zone-title");
    if (zoneTitle && zObj) zoneTitle.textContent = zObj.name;

    const zoneDrops = document.getElementById("zone-drops");
    if (zoneDrops && zObj) {
      zoneDrops.textContent = `可搜刮：${zObj.drops.map(id => GAME_DATA.items[id] ? GAME_DATA.items[id].name : id).join("、")}`;
    }
  }

  const mapModal = document.getElementById("map-modal");
  if (mapModal && !mapModal.classList.contains("hidden")) {
    renderTacticalMap();
  }

  const bagCount = document.getElementById("bag-count");
  if (bagCount) bagCount.textContent = `${p.bag.length} / 6`;

  const invGrid = document.getElementById("inventory-grid");
  if (invGrid) {
    invGrid.innerHTML = Array.from({length: 6}, (_, i) => {
      if (p.bag[i]) {
        const it = GAME_DATA.items[p.bag[i]];
        const itemName = it ? it.name : p.bag[i];
        return `
          <div ontouchstart="handleItemTouchStart(event, ${i})"
               ontouchmove="handleItemTouchMove(event)"
               ontouchend="handleItemTouchEnd(event)"
               class="bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 rounded p-1.5 text-left h-12 transition flex flex-col justify-center cursor-pointer select-none">
            <div class="text-xs font-bold truncate text-slate-100">${itemName}</div>
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
