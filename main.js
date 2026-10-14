/**
 * 【模組：核心管家 main.js】
 */
const state = {
  timeSec: 0,
  nextCloseSec: 45,
  closedZones: [],
  inCombat: false,
  clashProgress: 0,
  gameOver: false,
  player: JSON.parse(JSON.stringify(GAME_DATA.initialPlayer)),
  ai: JSON.parse(JSON.stringify(GAME_DATA.initialAI))
};

function getTotalAtk(unit) { return unit.baseAtk + (unit.weapon ? unit.weapon.atk : 0); }
function getTotalDef(unit) { return unit.baseDef + (unit.armor ? unit.armor.def : 0); }

function addLog(msg, color = "text-slate-300") {
  const logEl = document.getElementById("game-log");
  const timeStr = Math.floor(state.timeSec / 60).toString().padStart(2, '0') + ":" + (state.timeSec % 60).toString().padStart(2, '0');
  const div = document.createElement("div");
  div.className = `${color} leading-relaxed`;
  div.innerHTML = `<span class="text-slate-600">[${timeStr}]</span> ${msg}`;
  logEl.prepend(div);
}

function findAvailableRecipes(unit) {
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
  if (state.gameOver || state.inCombat) return;
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
  if (state.gameOver || state.inCombat) return;
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
  if (state.gameOver) return;
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
  const p = state.player; const ai = state.ai;
  document.getElementById("player-stats").textContent = `⚔️ 攻擊 ${getTotalAtk(p)} | 🛡️ 防禦 ${getTotalDef(p)}`;
  const zObj = GAME_DATA.zones.find(z => z.id === p.zone);
  document.getElementById("current-zone-badge").textContent = `📍 ${zObj.name}`;
  document.getElementById("hp-bar").style.width = `${(p.hp / p.maxHp) * 100}%`;
  document.getElementById("hp-text").textContent = `${p.hp}/${p.maxHp}`;
  document.getElementById("sp-bar").style.width = `${(p.sp / p.maxSp) * 100}%`;
  document.getElementById("sp-text").textContent = `${p.sp}/${p.maxSp}`;

  const guideEl = document.getElementById("guide-text");
  guideEl.textContent = "💡 提示：在立法院找折凳，去北車找鐵釘，合出七種武器之首！";

  const craftBox = document.getElementById("craft-alert-box");
  const availableRecipes = findAvailableRecipes(p);
  if (availableRecipes.length > 0) {
    craftBox.classList.remove("hidden");
    craftBox.innerHTML = availableRecipes.map(r => {
      const targetItem = GAME_DATA.items[r.result];
      return `<button onclick="craftItem(state.player, GAME_DATA.recipes.find(x=>x.result==='${r.result}'), true)" class="w-full py-2.5 px-3 mb-1.5 bg-emerald-500 text-slate-950 font-black rounded-xl shadow-lg flex justify-between items-center animate-pulse-fast"><span>✨ 一鍵合成：【${targetItem.name}】</span><span>${r.desc}</span></button>`;
    }).join("");
  } else { craftBox.classList.add("hidden"); }

  if (state.inCombat) {
    document.getElementById("explore-panel").classList.add("hidden");
    document.getElementById("combat-panel").classList.remove("hidden");
    document.getElementById("enemy-stats").textContent = `⚔️ 攻擊 ${getTotalAtk(ai)} | 🛡️ 防禦 ${getTotalDef(ai)}`;
    document.getElementById("enemy-hp-text").textContent = `HP: ${ai.hp}/${ai.maxHp}`;
    document.getElementById("enemy-hp-bar").style.width = `${(ai.hp / ai.maxHp) * 100}%`;
  } else {
    document.getElementById("explore-panel").classList.remove("hidden");
    document.getElementById("combat-panel").classList.add("hidden");
    document.getElementById("zone-title").textContent = zObj.name;
    document.getElementById("zone-drops").textContent = `可搜刮：${zObj.drops.map(id => GAME_DATA.items[id].name).join("、")}`;
  }

  document.getElementById("map-grid").innerHTML = GAME_DATA.zones.map(z => {
    const isClosed = state.closedZones.includes(z.id);
    const isCurrent = p.zone === z.id;
    let btnStyle = "bg-slate-800 border-slate-700 text-slate-200";
    if (isCurrent) btnStyle = "bg-indigo-900 border-indigo-500 text-white";
    if (isClosed) btnStyle = "bg-rose-950 border-rose-800 text-rose-500 line-through opacity-60";
    return `<button onclick="moveZone('${z.id}')" class="p-2.5 rounded-lg border text-left ${btnStyle}"><div>${z.name}</div></button>`;
  }).join("");

  document.getElementById("equip-weapon").textContent = p.weapon ? `${p.weapon.name} (+${p.weapon.atk})` : "赤手空拳 (+0)";
  document.getElementById("equip-armor").textContent = p.armor ? `${p.armor.name} (+${p.armor.def})` : "布衣 (+0)";
  document.getElementById("bag-count").textContent = `${p.bag.length} / 6`;

  document.getElementById("inventory-grid").innerHTML = Array.from({length: 6}, (_, i) => {
    if (p.bag[i]) {
      const it = GAME_DATA.items[p.bag[i]];
      return `<button onclick="useBagItem(${i})" class="bg-slate-800 border border-slate-700 rounded p-1.5 text-left h-14"><div class="text-xs font-bold truncate">${it.name}</div></button>`;
    }
    return `<div class="bg-slate-900 border border-slate-800 rounded p-1.5 text-center text-slate-600 h-14 flex items-center justify-center text-xs">空</div>`;
  }).join("");
}

function endGame(isWin, reason) {
  state.gameOver = true;
  document.getElementById("gameover-modal").classList.remove("hidden");
  document.getElementById("gameover-icon").textContent = isWin ? "🏆" : "🚑";
  document.getElementById("gameover-title").textContent = isWin ? "大吉大利！" : "出師未捷...";
  document.getElementById("gameover-desc").textContent = reason;
}

let tickCount = 0;
setInterval(() => {
  if (state.gameOver) return;
  tickCount++;
  if (state.inCombat) {
    state.clashProgress += 4;
    document.getElementById("clash-bar").style.width = `${state.clashProgress}%`;
    if (state.clashProgress >= 100) { state.clashProgress = 0; executeClashRound(); }
  }
  if (tickCount % 10 === 0) {
    state.timeSec++;
    if (state.player.skillCd > 0) state.player.skillCd--;
    document.getElementById("game-timer").textContent = `⏱️ ${Math.floor(state.timeSec/60).toString().padStart(2,'0')}:${(state.timeSec%60).toString().padStart(2,'0')}`;
    if (state.timeSec >= state.nextCloseSec && state.closedZones.length < 3) {
      const open = GAME_DATA.zones.filter(z => !state.closedZones.includes(z.id));
      if (open.length > 1) {
        state.closedZones.push(open[0].id);
        state.nextCloseSec += 45;
        addLog(`🚨 警報：${open[0].name} 已被列為戒嚴禁區！`, "text-rose-500 font-bold");
        updateUI();
      }
    }
    if (state.timeSec % 3 === 0) runAIBrain();
  }
}, 100);

window.onload = () => {
  addLog("🎮 台灣生存戰模組化啟動！", "text-amber-300 font-bold");
  updateUI();
};
