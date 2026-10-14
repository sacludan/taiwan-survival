/**
 * 【模組：核心管家 main.js】
 * 支援彈出式戰術地圖與相鄰區域移動限制 (Adjacency Graph)
 */
const DEV_CONFIG = {
  enableZoneClose: true,
  enableNPC: true
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
    addLog("【測試模式】已關閉縮圈與 NPC，請點擊右下角「移動」測試相鄰路線邏輯！", "text-emerald-400 font-bold");
  } else {
    addLog("台灣生存戰正式開局！點擊上方【搜刮此區域】收集材料！", "text-amber-300 font-bold");
  }

  closeMapModal();
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

// 原地休息按鈕
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

// 打開與關閉戰術地圖彈窗
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

// 檢查兩個區域是否相鄰
function isAdjacent(fromZoneId, toZoneId) {
  const fromZone = GAME_DATA.zones.find(z => z.id === fromZoneId);
  if (!fromZone || !fromZone.neighbors) return true;
  return fromZone.neighbors.includes(toZoneId);
}

// 移動區域（包含相鄰路線檢查）
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

  // 關鍵邏輯：檢查是否相鄰
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

  // 移動成功後自動收起地圖彈窗
  closeMapModal();

  if (DEV_CONFIG.enableNPC && state.ai.alive && state.ai.zone === p.zone && Math.random() < 0.6) {
    startCombat();
  }
  updateUI();
}

function useBagItem(index) {
  if (state.gameOver || !state.player) return;
  const p = state.player;
  const itemId = p.bag[index];
  const item = GAME_DATA.items[itemId];

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

// 渲染純文字戰術地圖節點（顯示清晰的交通連接關係）
function renderTacticalMap() {
  const container = document.getElementById("map-nodes-container");
  if (!container || !state.player) return;

  const p = state.player;

  // 建立單一地區節點按鈕的輔助函式
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

  // 排出北（士林）-> 中樞（北車）-> 南（立法院 / 竹科）的純文字拓樸路線圖
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
  const badgeEl = document.getElementById("current-zone-badge");
  if (badgeEl && zObj) badgeEl.textContent = zObj.name;

  const hpBar = document.getElementById("hp-bar");
  if (hpBar) hpBar.style.width = `${(p.hp / p.maxHp) * 100}%`;
  const hpText = document.getElementById("hp-text");
  if (hpText) hpText.textContent = `${p.hp}/${p.maxHp}`;

  const spBar = document.getElementById("sp-bar");
  if (spBar) spBar.style.width = `${(p.sp / p.maxSp) * 100}%`;
  const spText = document.getElementById("sp-text");
  if (spText) spText.textContent = `${p.sp}/${p.maxSp}`;

  const guideEl = document.getElementById("guide-text");
  if (guideEl) guideEl.textContent = "提示：在立法院找折凳，去北車找鐵釘，合出七種武器之首！";

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

  // 如果地圖彈窗開著，同步更新地圖節點狀態
  const mapModal = document.getElementById("map-modal");
  if (mapModal && !mapModal.classList.contains("hidden")) {
    renderTacticalMap();
  }

  const eqW = document.getElementById("equip-weapon");
  if (eqW) eqW.textContent = p.weapon ? `${p.weapon.name} (+${p.weapon.atk})` : "赤手空拳 (+0)";
  const eqA = document.getElementById("equip-armor");
  if (eqA) eqA.textContent = p.armor ? `${p.armor.name} (+${p.armor.def})` : "布衣 (+0)";
  
  const bagCount = document.getElementById("bag-count");
  if (bagCount) bagCount.textContent = `${p.bag.length} / 6`;

  const invGrid = document.getElementById("inventory-grid");
  if (invGrid) {
    invGrid.innerHTML = Array.from({length: 6}, (_, i) => {
      if (p.bag[i]) {
        const it = GAME_DATA.items[p.bag[i]];
        const itemName = it ? it.name : p.bag[i];
        return `<button onclick="useBagItem(${i})" class="bg-slate-800 border border-slate-700 rounded p-1.5 text-left h-14"><div class="text-xs font-bold truncate">${itemName}</div></button>`;
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
