/**
 * 【模組：戰鬥系統 combat.js】
 * 修復戰鬥中的快速吃補（quickHeal）：確保精準抓取背包食物並正確回復血量與體力
 */

function startCombat() {
  if (state.gameOver || state.inCombat) return;
  state.inCombat = true;
  state.clashProgress = 0;
  
  if (state.ai) {
    state.ai.hp = state.ai.maxHp;
  }

  addLog(`遭遇了對手【${state.ai.name}】！雙方進入半即時死鬥！`, "text-rose-400 font-bold");
  updateUI();
}

function executeClashRound() {
  if (!state.inCombat || state.gameOver || !state.player || !state.ai) return;

  const p = state.player;
  const ai = state.ai;

  const pAtk = getTotalAtk(p);
  const aiDef = getTotalDef(ai);
  const pDmg = Math.max(3, pAtk - aiDef + Math.floor(Math.random() * 5));
  ai.hp = Math.max(0, ai.hp - pDmg);

  addLog(`你對 ${ai.name} 發動攻擊，造成 <span class="text-amber-400">${pDmg}</span> 點傷害！`, "text-amber-300");

  if (ai.hp <= 0) {
    state.inCombat = false;
    ai.alive = false;
    addLog(`【大捷】你成功擊敗了 ${ai.name}！`, "text-emerald-400 font-black");
    updateUI();
    endGame(true, `你在激烈的決戰中擊敗了 ${ai.name}，成為最後的生存者！`);
    return;
  }

  const aiAtk = getTotalAtk(ai);
  const pDef = getTotalDef(p);
  const aiDmg = Math.max(2, aiAtk - pDef + Math.floor(Math.random() * 4));
  p.hp = Math.max(0, p.hp - aiDmg);

  addLog(`${ai.name} 反擊，對你造成 <span class="text-rose-400">${aiDmg}</span> 點傷害！`, "text-rose-300");

  if (p.hp <= 0) {
    state.inCombat = false;
    addLog(`【陣亡】你遭到 ${ai.name} 淘汰...`, "text-rose-500 font-black");
    updateUI();
    endGame(false, `你在與 ${ai.name} 的交鋒中不幸陣亡，生存戰失敗。`);
    return;
  }

  updateUI();
}

function useCombatSkill() {
  if (!state.inCombat || state.gameOver || !state.player) return;
  const p = state.player;

  if (p.skillCd > 0) {
    addLog(`技能冷卻中（剩餘 ${p.skillCd} 秒），無法施放！`, "text-slate-400");
    return;
  }

  p.skillCd = 8;
  const ai = state.ai;
  const skillDmg = 25 + Math.floor(Math.random() * 10);
  ai.hp = Math.max(0, ai.hp - skillDmg);

  addLog(`大喊：「太離譜了！」施展特技！對 ${ai.name} 造成 <span class="text-purple-400 font-bold">${skillDmg}</span> 點爆擊傷害！`, "text-purple-300 font-bold");

  if (ai.hp <= 0) {
    state.inCombat = false;
    ai.alive = false;
    addLog(`【大捷】你以特技擊敗了 ${ai.name}！`, "text-emerald-400 font-black");
    updateUI();
    endGame(true, `你用絕招擊敗了 ${ai.name}，成功制霸台灣！`);
    return;
  }

  updateUI();
}

// 💡 修復戰鬥中的快速吃補：精準對應 items 資料庫並正確扣除背包與加血/回體
function quickHeal() {
  if (!state.inCombat || state.gameOver || !state.player) return;
  const p = state.player;

  let foundIndex = -1;
  let foodItem = null;

  for (let i = 0; i < p.bag.length; i++) {
    const itemId = p.bag[i];
    const it = GAME_DATA.items[itemId];
    if (it && it.type === "food") {
      foundIndex = i;
      foodItem = it;
      break;
    }
  }

  if (foundIndex === -1 || !foodItem) {
    addLog("背包裡沒有任何可以食用的食物補給！", "text-rose-400");
    return;
  }

  const healHp = foodItem.hp || 0;
  const healSp = foodItem.sp || 0;

  p.hp = Math.min(p.maxHp, p.hp + healHp);
  p.sp = Math.min(p.maxSp, p.sp + healSp);
  p.bag.splice(foundIndex, 1);

  addLog(`戰鬥中緊急嗑藥！吃掉了【${foodItem.name}】，回復了 ${healHp} 血量與 ${healSp} 體力！`, "text-emerald-400 font-bold");
  updateUI();
}

function fleeCombat() {
  if (!state.inCombat || state.gameOver || !state.player) return;
  const p = state.player;

  if (p.sp < 15) {
    addLog("體力不足（需 15 體力），無法突圍逃跑！", "text-rose-400");
    return;
  }

  p.sp -= 15;
  state.inCombat = false;
  state.clashProgress = 0;

  const otherZones = GAME_DATA.zones.filter(z => z.id !== p.zone);
  const targetZone = otherZones[Math.floor(Math.random() * otherZones.length)];
  p.zone = targetZone.id;

  addLog(`你施展身法強行脫離戰場，逃到了【${targetZone.name}】（消耗 15 體力）！`, "text-indigo-300 font-bold");
  updateUI();
}
