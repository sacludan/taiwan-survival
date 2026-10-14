/**
 * 【模組：核心管家 main.js】
 * 完整無缺漏版
 */
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

// 點擊開始遊戲後由 lobby.js 呼叫
function initGame() {
  console.log("initGame 執行中...");
  
  state.timeSec = 0;
  state.nextCloseSec = 45;
  state.closedZones = [];
  state.inCombat = false;
  state.clashProgress = 0;
  state.gameOver = false;
  state.player = JSON.parse(JSON.stringify(GAME_DATA.initialPlayer));
  state.ai = JSON.parse(JSON.stringify(GAME_DATA.initialAI));

  const logEl = document.getElementById("game-log");
  if (logEl) logEl.innerHTML = "";

  addLog("🎮 台灣生存戰正式開局！點擊上方【搜刮此區域】收集材料！", "text-amber-300 font-bold");
  updateUI();
  startGameLoop();
}

// 遊戲主時鐘迴圈
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
        timerEl.textContent = `⏱️ ${Math.floor(state.timeSec/60).toString().padStart(2,'0')}:${(state.timeSec%60).toString().padStart(2,'0')}`;
      }

      const remainClose = state.nextCloseSec - state.timeSec;
      const warningEl = document.getElementById("zone-warning");
      if (warningEl && state.closedZones.length < 3) {
        if (remainClose > 0) {
          warningEl.textContent = `⚠️ ${remainClose}秒後封鎖下個區域`;
        } else {
          const open = GAME_DATA.zones.filter(z => !state.closedZones.includes(z.id));
          if (open.length > 1) {
            state.closedZones.push(open[0].id);
            state.nextCloseSec += 45;
            addLog(`🚨 【全島緊急廣播】${open[0].name} 已被列為戒嚴禁區！`, "text-rose-500 font-bold");
            
            if (state.player.zone === open[0].id) {
              state.player.hp = Math.max(1, state.player.hp - 25);
              addLog(`💥 你滯留在禁區內，遭到驅離受到 25 點傷害！`, "text-rose-500 font-bold");
            }
            updateUI();
          }
        }
      } else if (state.closedZones.length >= 3 && warningEl) {
        warningEl.textContent = `🔥 最終決戰區！強制死鬥！`;
      }

      if (state.timeSec % 3 === 0) {
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
    if (isPlayer) addLog(`✨ 合成神武並自動裝備：【${newItem.name}】！`, "text-amber-400 font-bold");
  } else if (newItem.type === "armor" && (!unit.armor || newItem.score > unit.armor.score)) {
    if (unit.armor && unit.bag.length < 6) unit.bag.push(unit.armor.id);
    unit.armor = newItem;
    if (isPlayer) addLog(`✨ 合成防具並自動穿戴：【${newItem.name}】！`, "text-sky-400 font-bold");
  } else {
    unit.bag.push(newItem.id);
    if (isPlayer) addLog(`✨ 成功合成：【${newItem.name}】！`, "text-emerald-400 font-bold");
  }
  updateUI();
}

function playerSearch() {
  if (state.gameOver || state.inCombat || !state.player) return;
  const p = state.player;
  if (p.sp < 5) {
    p.sp = Math.min(p.maxSp, p.sp + 20);
    addLog("😮‍💨 體力不足！原地喘口氣回復 20 體力。", "text-sky-300");
    updateUI();
    return;
  }
  p.sp -= 5;
  const currentZoneObj = GAME_DATA.zones.find(z => z.id === p.zone);
  if (state.ai.alive && state.ai.zone === p.zone && Math.random() < 0.45) {
    startCombat();
    return;
  }
  const dropId = currentZoneObj.drops[Math.floor(Math.random() * currentZoneObj.drops.length)];
  const item = GAME_DATA.items[dropId];

  if (item.type === "weapon" && !p.weapon) {
    p.weapon = item;
    addLog(`🔍 搜到並拿起【${item.name} (+${item.atk}攻)】！`, "text-amber-300");
  } else if (item.type === "armor" && !p.armor) {
    p.armor = item;
    addLog(`🔍 搜到並戴上【${item.name} (+${item.def}防)】！`, "text-sky-300");
  } else if (p.bag.length < 6) {
    p.bag.push(dropId);
    addLog(`🔍 搜刮到【${item.name}】！`, "text-emerald-300");
  } else {
    addLog(`⚠️ 背包已滿（6/6），請先使用或丟棄物品！`, "text-rose-400");
  }
  updateUI();
}

function moveZone(targetZoneId) {
  if (state.gameOver || state.inCombat || !state.player) return;
  if (state.closedZones.includes(targetZoneId)) {
    addLog("🚫 該區域已列為禁區，無法進入！", "text-rose-500 font-bold");
    return;
  }
  const p = state.player;
  if (p.zone === targetZoneId) return;
  if (p.sp < 5) {
    p.sp = Math.min(p.maxSp, p.sp + 25);
    addLog("😮‍💨 體力見底，原地深呼吸回復 25 體力。", "text-sky-300");
    updateUI();
    return;
  }
  p.sp -= 5;
  p.zone = targetZoneId;
  const zName = GAME_DATA.zones.find(z => z.id === targetZoneId).name;
  addLog(`🚶 移動到了【${zName}】。`, "text-indigo-300");
  if (state.ai.alive && state.ai.zone === p.zone && Math.random() < 0.6) startCombat();
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
    addLog(`😋 吃掉了【${item.name}】！`, "text-emerald-400 font-bold");
  } else if (item.type === "weapon") {
    const old = p.weapon; p.weapon = item; p.bag.splice(index, 1);
    if (old) p.bag.push(old.id);
    addLog(`🗡️ 換上武器【${item.name}】！`, "text-amber-300");
  } else if (item.type === "armor") {
    const old = p.armor; p.armor = item; p.bag.splice(index, 1);
    if (old) p.bag.push(old.id);
    addLog(`🪖 穿上防具【${item.name}】！`, "text-sky-300");
  } else {
    p.bag.splice(index, 1);
    addLog(`🗑️ 丟棄了【${item.name}】。`, "text-slate-500");
  }
  updateUI();
}

function updateUI() {
  if (!state.player || !state.ai || typeof GAME_DATA === 'undefined') return;
  const p = state.player; const ai = state.ai;

  const statEl = document.getElementById("player-stats");
  if (statEl) statEl.textContent = `⚔️ 攻擊 ${getTotalAtk(p)} | 🛡️ 防禦 ${getTotalDef(p)}`;

  const zObj = GAME_DATA.zones.find(z => z.id === p.zone);
  const badgeEl = document.getElementById("current-zone-badge");
  if (badgeEl && zObj) badgeEl.textContent = `📍 ${zObj.name}`;

  const hpBar = document.getElementById("hp-bar");
  if (hpBar) hpBar.style.width = `${(p.hp / p.maxHp) * 100}%`;
  const hpText = document.getElementById("hp-text");
  if (hpText) hpText.textContent = `${p.hp}/${p.maxHp}`;

  const spBar = document.getElementById("sp-bar");
  if (spBar) spBar.style.width = `${(p.sp / p.maxSp) * 100}%`;
  const spText = document.getElementById("sp-text");
  if (spText) spText.textContent = `${p.sp}/${p.maxSp}`;

  const guideEl = document.getElementById("guide-text");
  if (guideEl) guideEl.textContent = "💡 提示：在立法院找折凳，去北車找鐵釘，合出七種武器之首！";

  const craftBox = document.getElementById("craft-alert-box");
  const availableRecipes = findAvailableRecipes(p);
  if (availableRecipes.length > 0 && craftBox) {
    craftBox.classList.remove("hidden");
    craftBox.innerHTML = availableRecipes.map(r => {
      const targetItem = GAME_DATA.items[r.result];
      return `<button onclick="craftItem(state.player, GAME_DATA.recipes.find(x=>x.result==='${r.result}'), true)" class="w-full py-2.5 px-3 mb-1.5 bg-emerald-500 text-slate-950 font-black rounded-xl shadow-lg flex justify-between items-center animate-pulse-fast"><span>✨ 一鍵合成：【${targetItem.name}】</span><span>${r.desc}</span></button>`;
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
    if (enemyStats) enemyStats.textContent = `⚔️ 攻擊 ${getTotalAtk(ai)} | 🛡️ 防禦 ${getTotalDef(ai)}`;
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

  const mapGrid = document.getElementById("map-grid");
  if (mapGrid && GAME_DATA.zones) {
    mapGrid.innerHTML = GAME_DATA.zones.map(z => {
      const isClosed = state.closedZones.includes(z.id);
      const isCurrent = p.zone === z.id;
      let btnStyle = "bg-slate-800 border-slate-700 text-slate-200";
      if (isCurrent) btnStyle = "bg-indigo-900 border-indigo-500 text-white";
      if (isClosed) btnStyle = "bg-rose-950 border-rose-800 text-rose-500 line-through opacity-60";
      return `<button onclick="moveZone('${z.id}')" class="p-2.5 rounded-lg border text-left ${btnStyle}"><div>${z.name}</div></button>`;
    }).join("");
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
  if (icon) icon.textContent = isWin ? "🏆" : "🚑";
  const title = document.getElementById("gameover-title");
  if (title) title.textContent = isWin ? "大吉大利！" : "出師未捷...";
  const desc = document.getElementById("gameover-desc");
  if (desc) desc.textContent = reason;
}
