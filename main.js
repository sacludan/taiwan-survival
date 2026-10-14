/**
 * 【模組：核心管家 main.js】
 * 支援背包物品動態懸浮操作選單（裝備/使用/丟棄）與點擊空白處取消
 */
const DEV_CONFIG = {
  enableZoneClose: true,
  enableNPC: true
};

const EQUIP_SLOT_SVGS = {
  weapon: `<svg class="w-6 h-6 opacity-25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 17.5L3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/><path d="M19 21l2-2"/></svg>`,
  head:   `<svg class="w-6 h-6 opacity-25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 18v-4a8 8 0 1 1 16 0v4"/><path d="M2 18h20"/></svg>`,
  chest:  `<svg class="w-6 h-6 opacity-25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>`,
  arm:    `<svg class="w-6 h-6 opacity-25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>`,
  leg:    `<svg class="w-6 h-6 opacity-25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 3v11l-3 4v3h14v-3l-3-4V3H7z"/></svg>`,
  acc:    `<svg class="w-6 h-6 opacity-25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="14" r="6"/><path d="M9 5l3-2 3 2-3 3-3-3z"/></svg>`
};

const state = {
  timeSec: 0,
  nextCloseSec: 45,
  closedZones: [],
  inCombat: false,
  clashProgress: 0,
  gameOver: false,
  player: null,
  ai: null
};

function initGame(isSandbox = false) {
  DEV_CONFIG.enableZoneClose = !isSandbox;
  DEV_CONFIG.enableNPC = !isSandbox;

  state.timeSec = 0;
  state.nextCloseSec = 45;
  state.closedZones = [];
  state.inCombat = false;
  state.clashProgress = 0;
  state.gameOver = false;
  state.player = JSON.parse(JSON.stringify(GAME_DATA.initialPlayer));
  state.ai = JSON.parse(JSON.stringify(GAME_DATA.initialAI));

  if (!DEV_CONFIG.enableNPC) {
    state.ai.alive = false;
  }

  const logEl = document.getElementById("game-log");
  if (logEl) logEl.innerHTML = "";

  if (isSandbox) {
    addLog("【測試模式】點擊背包物品會彈出動態操作選單（裝備/使用/丟棄）！", "text-emerald-400 font-bold");
  } else {
    addLog("台灣生存戰正式開局！點擊上方【搜刮此區域】收集材料！", "text-amber-300 font-bold");
  }

  closeMapModal();
  closeItemActionModal();
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

    if (state.inCombat) {
      state.clashProgress += 4;
      const remainSec = Math.max(0, (2.5 - (state.clashProgress / 100) * 2.5)).toFixed(1);
      const clashBar = document.getElementById("clash-bar");
      const clashTimerText = document.getElementById("clash-timer-text");
      if (clashBar) clashBar.style.width = `${state.clashProgress}%`;
      if (clashTimerText) clashTimerText.textContent = `${remainSec}s`;

      if (state.clashProgress >= 100) {
        state.clashProgress = 0;
        executeClashRound();
      }
    }

    if (tickCount % 10 === 0) {
      state.timeSec++;
      if (state.player.skillCd > 0) state.player.skillCd--;

      const timerEl = document.getElementById("game-timer");
      if (timerEl) {
        timerEl.textContent = `${Math.floor(state.timeSec/60).toString().padStart(2,'0')}:${(state.timeSec%60).toString().padStart(2,'0')}`;
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

      if (DEV_CONFIG.enableNPC && state.timeSec % 3 === 0) {
        runAIBrain();
      }
    }
  }, 100);
}

function getTotalAtk(unit) { return unit.baseAtk + (unit.weapon ? unit.weapon.atk : 0); }
function getTotalDef(unit) { return unit.baseDef + (unit.armor ? unit.armor.def : 0); }

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
  if (unit.weapon) ownedIds.push(unit.weapon.id);
  if (unit.armor) ownedIds.push(unit.armor.id);
  return GAME_DATA.recipes.filter(r => r.materials.every(m => ownedIds.includes(m)));
}

function craftItem(unit, recipe, isPlayer = true) {
  recipe.materials.forEach(matId => {
    const bagIdx = unit.bag.indexOf(matId);
    if (bagIdx !== -1) unit.bag.splice(bagIdx, 1);
    else if (unit.weapon && unit.weapon.id === matId) unit.weapon = null;
    else if (unit.armor && unit.armor.id === matId) unit.armor = null;
  });

  const newItem = GAME_DATA.items[recipe.result];
  if (newItem.type === "weapon" && (!unit.weapon || newItem.score > unit.weapon.score)) {
    if (unit.weapon && unit.bag.length < 6) unit.bag.push(unit.weapon.id);
    unit.weapon = newItem;
    if (isPlayer) addLog(`合成神武並自動裝備：【${newItem.name}】！`, "text-amber-400 font-bold");
  } else if (newItem.type === "armor" && (!unit.armor || newItem.score > unit.armor.score)) {
    if (unit.armor && unit.bag.length < 6) unit.bag.push(unit.armor.id);
    unit.armor = newItem;
    if (isPlayer) addLog(`合成防具並自動穿戴：【${newItem.name}】！`, "text-sky-400 font-bold");
  } else {
    unit.bag.push(newItem.id);
    if (isPlayer) addLog(`成功合成：【${newItem.name}】！`, "text-emerald-400 font-bold");
  }
  updateUI();
}

function playerRest() {
  if (state.gameOver || state.inCombat || !state.player) return;
  const p = state.player;
  if (p.sp >= p.maxSp) {
    addLog("體力已經是滿的，不需要休息！", "text-slate-400");
    return;
  }
  p.sp = Math.min(p.maxSp, p.sp + 25);
  addLog("原地坐下休息，回復了 25 點體力。", "text-sky-300");
  updateUI();
}

function playerSearch() {
  if (state.gameOver || state.inCombat || !state.player) return;
  const p = state.player;
  if (p.sp < 5) {
    addLog("體力不足！請點擊右下角「休息」回復體力。", "text-rose-400");
    return;
  }
  p.sp -= 5;
  const currentZoneObj = GAME_DATA.zones.find(z => z.id === p.zone);
  
  if (DEV_CONFIG.enableNPC && state.ai.alive && state.ai.zone === p.zone && Math.random() < 0.45) {
    startCombat();
    return;
  }
  
  const dropId = currentZoneObj.drops[Math.floor(Math.random() * currentZoneObj.drops.length)];
  const item = GAME_DATA.items[dropId];

  if (item.type === "weapon" && !p.weapon) {
    p.weapon = item;
    addLog(`搜到並拿起【${item.name} (+${item.atk}攻)】！`, "text-amber-300");
  } else if (item.type === "armor" && !p.armor) {
    p.armor = item;
    addLog(`搜到並戴上【${item.name} (+${item.def}防)】！`, "text-sky-300");
  } else if (p.bag.length < 6) {
    p.bag.push(dropId);
    addLog(`搜刮到【${item.name}】！`, "text-emerald-300");
  } else {
    addLog(`背包已滿（6/6），請先使用或丟棄物品！`, "text-rose-400");
  }
  updateUI();
}

function openMapModal() {
  if (state.gameOver || state.inCombat) return;
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
  const fromZone = GAME_DATA.zones.find(z => z.id === fromZoneId);
  if (!fromZone || !fromZone.neighbors) return true;
  return fromZone.neighbors.includes(toZoneId);
}

function moveZone(targetZoneId) {
  if (state.gameOver || state.inCombat || !state.player) return;
  const p = state.player;

  if (p.zone === targetZoneId) {
    addLog("你已經在這個區域了。", "text-slate-400");
    return;
  }

  if (state.closedZones.includes(targetZoneId)) {
    addLog("該區域已列為禁區，無法進入！", "text-rose-500 font-bold");
    return;
  }

  if (!isAdjacent(p.zone, targetZoneId)) {
    const currentName = GAME_DATA.zones.find(z => z.id === p.zone).name;
    const targetName = GAME_DATA.zones.find(z => z.id === targetZoneId).name;
    addLog(`路線不通！【${currentName}】與【${targetName}】不相鄰，必須先經過「台北車站」！`, "text-rose-400 font-bold");
    return;
  }

  if (p.sp < 5) {
    addLog("體力不足（需 5 體力），無法移動！請先休息。", "text-rose-400");
    closeMapModal();
    return;
  }

  p.sp -= 5;
  p.zone = targetZoneId;
  const zName = GAME_DATA.zones.find(z => z.id === targetZoneId).name;
  addLog(`移動到了【${zName}】。`, "text-indigo-300");

  closeMapModal();

  if (DEV_CONFIG.enableNPC && state.ai.alive && state.ai.zone === p.zone && Math.random() < 0.6) {
    startCombat();
  }
  updateUI();
}

// ==========================================
// 【背包物品互動選單系統 (Item Action Modal)】
// ==========================================
let currentSelectedBagIndex = null;

function clickBagItem(index) {
  if (state.gameOver || !state.player) return;
  const p = state.player;
  const itemId = p.bag[index];
  if (!itemId) return;

  const item = GAME_DATA.items[itemId];
  const itemName = item ? item.name : itemId;

  currentSelectedBagIndex = index;

  const modal = document.getElementById("item-action-modal");
  const nameEl = document.getElementById("action-item-name");
  const btnContainer = document.getElementById("action-buttons-container");

  if (nameEl) nameEl.textContent = itemName;

  // 根據物品類型動態生成按鈕選項
  let buttonsHTML = "";
  if (item && (item.type === "weapon" || item.type === "armor")) {
    buttonsHTML = `
      <button onclick="executeBagAction('equip')" class="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-sm shadow transition">裝備</button>
      <button onclick="executeBagAction('drop')" class="w-full py-3 bg-slate-800 hover:bg-slate-700 text-rose-400 font-bold rounded-xl text-sm transition">丟棄</button>
    `;
  } else if (item && item.type === "food") {
    buttonsHTML = `
      <button onclick="executeBagAction('use')" class="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-sm shadow transition">使用 (食用)</button>
      <button onclick="executeBagAction('drop')" class="w-full py-3 bg-slate-800 hover:bg-slate-700 text-rose-400 font-bold rounded-xl text-sm transition">丟棄</button>
    `;
  } else {
    // 材料或其他類型
    buttonsHTML = `
      <button onclick="executeBagAction('drop')" class="w-full py-3 bg-slate-800 hover:bg-slate-700 text-rose-400 font-bold rounded-xl text-sm transition">丟棄</button>
    `;
  }

  if (btnContainer) btnContainer.innerHTML = buttonsHTML;
  if (modal) modal.classList.remove("hidden");
}

function closeItemActionModal(event) {
  const modal = document.getElementById("item-action-modal");
  if (modal) modal.classList.add("hidden");
  currentSelectedBagIndex = null;
}

function executeBagAction(actionType) {
  if (currentSelectedBagIndex === null || !state.player) return;
  const p = state.player;
  const index = currentSelectedBagIndex;
  const itemId = p.bag[index];
  const item = GAME_DATA.items[itemId];

  closeItemActionModal();

  if (actionType === 'use' || actionType === 'equip') {
    // 直接複用原本的 useBagItem 邏輯（食物會回復，裝備會與身上的互換）
    useBagItem(index);
  } else if (actionType === 'drop') {
    p.bag.splice(index, 1);
    addLog(`丟棄了【${item ? item.name : itemId}】。`, "text-slate-500");
    updateUI();
  }
}

// 支援原本的 useBagItem 呼叫
function useBagItem(index) {
  if (state.gameOver || !state.player) return;
  const p = state.player;
  const itemId = p.bag[index];
  const item = GAME_DATA.items[itemId];

  if (!item) return;

  if (item.type === "food") {
    p.hp = Math.min(p.maxHp, p.hp + (item.hp || 0));
    p.sp = Math.min(p.maxSp, p.sp + (item.sp || 0));
    p.bag.splice(index, 1);
    addLog(`吃掉了【${item.name}】！`, "text-emerald-400 font-bold");
  } else if (item.type === "weapon") {
    const old = p.weapon; p.weapon = item; p.bag.splice(index, 1);
    if (old) p.bag.push(old.id);
    addLog(`換上武器【${item.name}】！`, "text-amber-300");
  } else if (item.type === "armor") {
    const old = p.armor; p.armor = item; p.bag.splice(index, 1);
    if (old) p.bag.push(old.id);
    addLog(`穿上防具【${item.name}】！`, "text-sky-300");
  } else {
    p.bag.splice(index, 1);
    addLog(`丟棄了【${item.name}】。`, "text-slate-500");
  }
  updateUI();
}

// ==========================================

function renderEquipSixGrid(p) {
  const gridEl = document.getElementById("equip-six-grid");
  if (!gridEl) return;

  const slots = [
    { key: "weapon", label: "武器", item: p.weapon, svg: EQUIP_SLOT_SVGS.weapon, color: "border-amber-500/70 bg-amber-950/30 text-amber-300" },
    { key: "head",   label: "頭部", item: p.armor,  svg: EQUIP_SLOT_SVGS.head,   color: "border-sky-500/70 bg-sky-950/30 text-sky-300" },
    { key: "chest",  label: "衣服", item: p.chest,  svg: EQUIP_SLOT_SVGS.chest,  color: "border-emerald-500/70 bg-emerald-950/30 text-emerald-300" },
    { key: "arm",    label: "手臂", item: p.arm,    svg: EQUIP_SLOT_SVGS.arm,    color: "border-purple-500/70 bg-purple-950/30 text-purple-300" },
    { key: "leg",    label: "腿部", item: p.leg,    svg: EQUIP_SLOT_SVGS.leg,    color: "border-indigo-500/70 bg-indigo-950/30 text-indigo-300" },
    { key: "acc",    label: "飾品", item: p.acc,    svg: EQUIP_SLOT_SVGS.acc,    color: "border-rose-500/70 bg-rose-950/30 text-rose-300" }
  ];

  gridEl.innerHTML = slots.map(s => {
    if (s.item) {
      const statStr = s.item.atk ? `+${s.item.atk}攻` : `+${s.item.def}防`;
      return `
        <div class="h-10 rounded border ${s.color} p-1 flex flex-col justify-center items-center text-center relative overflow-hidden">
          <div class="text-[10px] font-black leading-tight truncate w-full">${s.item.name}</div>
          <div class="text-[9px] font-mono opacity-80">${statStr}</div>
        </div>
      `;
    }
    return `
      <div class="h-10 rounded border border-slate-800 bg-slate-900/90 flex items-center justify-center relative" title="${s.label}欄位">
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
    const canMove = isAdjacent(p.zone, z.id) && !isClosed && !isCurrent;

    let boxStyle = "bg-slate-900 border-slate-800 text-slate-500";
    let statusTag = "需轉乘";

    if (isCurrent) {
      boxStyle = "bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-950";
      statusTag = "目前位置";
    } else if (isClosed) {
      boxStyle = "bg-rose-950 border-rose-800 text-rose-500 line-through opacity-60";
      statusTag = "禁區封鎖";
    } else if (canMove) {
      boxStyle = "bg-emerald-950/90 hover:bg-emerald-900 border-emerald-500 text-emerald-200 cursor-pointer shadow-md";
      statusTag = "可移動 (-5體)";
    }

    return `
      <button onclick="moveZone('${z.id}')" class="w-44 py-3 px-4 rounded-xl border-2 text-center transition active:scale-95 ${boxStyle}">
        <div class="text-base font-black tracking-wider">${z.name}</div>
        <div class="text-[10px] mt-0.5 opacity-80">${statusTag}</div>
      </button>
    `;
  };

  container.innerHTML = `
    ${buildNodeHTML("shilin")}
    <div class="h-5 w-0.5 bg-slate-600"></div>
    ${buildNodeHTML("taipei_main")}
    <div class="w-48 h-5 flex justify-around">
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

  const aiAliveEl = document.getElementById("ai-alive");
  if (aiAliveEl) {
    aiAliveEl.textContent = DEV_CONFIG.enableNPC ? (ai.alive ? "嗡嗡阿伯：存活" : "嗡嗡阿伯：淘汰") : "NPC：已休眠";
    aiAliveEl.className = DEV_CONFIG.enableNPC ? "bg-slate-800 px-2 py-0.5 rounded text-emerald-400" : "bg-slate-800 px-2 py-0.5 rounded text-slate-500";
  }

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
      return `<button onclick="craftItem(state.player, GAME_DATA.recipes.find(x=>x.result==='${r.result}'), true)" class="w-full py-2.5 px-3 mb-1.5 bg-emerald-500 text-slate-950 font-black rounded-xl shadow-lg flex justify-between items-center animate-pulse-fast"><span>一鍵合成：【${targetItem.name}】</span><span>${r.desc}</span></button>`;
    }).join("");
  } else if (craftBox) { 
    craftBox.classList.add("hidden"); 
  }

  if (state.inCombat) {
    const expPanel = document.getElementById("explore-panel");
    const comPanel = document.getElementById("combat-panel");
    if (expPanel) expPanel.classList.add("hidden");
    if (comPanel) comPanel.classList.remove("hidden");

    const enemyStats = document.getElementById("enemy-stats");
    if (enemyStats) enemyStats.textContent = `攻擊 ${getTotalAtk(ai)} | 防禦 ${getTotalDef(ai)}`;
    const enemyHpText = document.getElementById("enemy-hp-text");
    if (enemyHpText) enemyHpText.textContent = `HP: ${ai.hp}/${ai.maxHp}`;
    const enemyHpBar = document.getElementById("enemy-hp-bar");
    if (enemyHpBar) enemyHpBar.style.width = `${(ai.hp / ai.maxHp) * 100}%`;
  } else {
    const expPanel = document.getElementById("explore-panel");
    const comPanel = document.getElementById("combat-panel");
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
        return `<button onclick="clickBagItem(${i})" class="bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 rounded p-1.5 text-left h-14 transition flex flex-col justify-center"><div class="text-xs font-bold truncate text-slate-100">${itemName}</div><div class="text-[9px] text-slate-400 mt-0.5">點擊操作</div></button>`;
      }
      return `<div class="bg-slate-900 border border-slate-800 rounded p-1.5 text-center text-slate-600 h-14 flex items-center justify-center text-xs">空</div>`;
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
