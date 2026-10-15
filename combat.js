/**
 * 【模組：戰鬥系統 combat.js】
 * 實現手動回合制戰鬥：攻擊、專屬技能、自動選擇最高血量食物、逃跑，且每個動作後需 3 秒冷卻
 */

let combatCooldownTimer = 0; // 戰鬥行動冷卻計時 (3秒)
let combatLock = false;

function startCombat() {
  if (state.gameOver || state.inCombat) return;
  state.inCombat = true;
  combatLock = false;
  combatCooldownTimer = 0;
  
  if (state.ai) {
    state.ai.hp = state.ai.maxHp;
  }

  addLog(`遭遇了對手【${state.ai.name}】！進入手動回合制戰鬥！`, "text-rose-400 font-bold");
  updateCombatUIState();
  updateUI();
}

// 執行戰鬥指令 ('attack' | 'skill' | 'food' | 'flee')
function executeCombatAction(actionType) {
  if (!state.inCombat || state.gameOver || combatLock || !state.player || !state.ai) return;

  const p = state.player;
  const ai = state.ai;

  // 1. 玩家執行動作
  if (actionType === 'attack') {
    const pAtk = getTotalAtk(p);
    const aiDef = getTotalDef(ai);
    const pDmg = Math.max(3, pAtk - aiDef + Math.floor(Math.random() * 5));
    ai.hp = Math.max(0, ai.hp - pDmg);
    addLog(`你對 ${ai.name} 發動攻擊，造成 <span class="text-amber-400">${pDmg}</span> 點傷害！`, "text-amber-300");
  } 
  else if (actionType === 'skill') {
    const skillDmg = 35 + Math.floor(Math.random() * 15);
    ai.hp = Math.max(0, ai.hp - skillDmg);
    addLog(`大喊：「太離譜了！」施展角色專屬特技！對 ${ai.name} 造成 <span class="text-purple-400 font-bold">${skillDmg}</span> 點爆擊傷害！`, "text-purple-300 font-bold");
  } 
  else if (actionType === 'food') {
    // 自動尋找背包中回血量最高的食物
    let bestFoodIdx = -1;
    let maxHeal = -1;

    for (let i = 0; i < p.bag.length; i++) {
      const it = GAME_DATA.items[p.bag[i]];
      if (it && it.type === "food") {
        const healVal = it.hp || 0;
        if (healVal > maxHeal) {
          maxHeal = healVal;
          bestFoodIdx = i;
        }
      }
    }

    if (bestFoodIdx === -1) {
      addLog("背包裡沒有任何食物可以食用！浪費了一個回合！", "text-rose-400");
    } else {
      const foodId = p.bag[bestFoodIdx];
      const foodItem = GAME_DATA.items[foodId];
      const healHp = foodItem.hp || 0;
      const healSp = foodItem.sp || 0;

      p.hp = Math.min(p.maxHp, p.hp + healHp);
      p.sp = Math.min(p.maxSp, p.sp + healSp);
      p.bag.splice(bestFoodIdx, 1);
      addLog(`緊急嗑藥！吃掉了背包中最高級的【${foodItem.name}】，回復了 ${healHp} 血量與 ${healSp} 體力！`, "text-emerald-400 font-bold");
    }
  } 
  else if (actionType === 'flee') {
    if (p.sp < 15) {
      addLog("體力不足（需 15 體力），無法逃跑！", "text-rose-400");
      updateUI();
      return;
    }
    p.sp -= 15;
    state.inCombat = false;
    const otherZones = GAME_DATA.zones.filter(z => z.id !== p.zone);
    const targetZone = otherZones[Math.floor(Math.random() * otherZones.length)];
    p.zone = targetZone.id;
    addLog(`你施展身法成功逃離戰場，逃往【${targetZone.name}】（消耗 15 體力）！`, "text-indigo-300 font-bold");
    updateUI();
    return;
  }

  // 檢查 AI 是否被打敗
  if (ai.hp <= 0) {
    state.inCombat = false;
    ai.alive = false;
    addLog(`【大捷】你成功擊敗了 ${ai.name}！`, "text-emerald-400 font-black");
    updateUI();
    endGame(true, `你在激烈的對決中擊敗了 ${ai.name}，成為最終的生存者！`);
    return;
  }

  // 2. AI 反擊
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

  // 3. 動作執行後啟動 3 秒冷卻鎖定
  startCombatCooldown();
}

function startCombatCooldown() {
  combatLock = true;
  combatCooldownTimer = 3.0;
  updateCombatUIState();

  const cdInterval = setInterval(() => {
    combatCooldownTimer = +(combatCooldownTimer - 0.1).toFixed(1);
    updateCombatUIState();

    if (combatCooldownTimer <= 0) {
      clearInterval(cdInterval);
      combatLock = false;
      updateCombatUIState();
    }
  }, 100);
}

function updateCombatUIState() {
  const cdText = document.getElementById("combat-cooldown-text");
  const btnAtk = document.getElementById("btn-combat-atk");
  const btnSkill = document.getElementById("btn-combat-skill");
  const btnFood = document.getElementById("btn-combat-food");
  const btnFlee = document.getElementById("btn-combat-flee");

  if (!cdText) return;

  if (combatLock) {
    cdText.textContent = `冷卻中 ${combatCooldownTimer}s`;
    cdText.className = "text-xs text-rose-400 font-mono font-bold block animate-pulse";
    if (btnAtk) btnAtk.disabled = true; btnAtk?.classList.add("opacity-50");
    if (btnSkill) btnSkill.disabled = true; btnSkill?.classList.add("opacity-50");
    if (btnFood) btnFood.disabled = true; btnFood?.classList.add("opacity-50");
    if (btnFlee) btnFlee.disabled = true; btnFlee?.classList.add("opacity-50");
  } else {
    cdText.textContent = `準備就緒`;
    cdText.className = "text-xs text-emerald-400 font-mono font-bold block";
    if (btnAtk) btnAtk.disabled = false; btnAtk?.classList.remove("opacity-50");
    if (btnSkill) btnSkill.disabled = false; btnSkill?.classList.remove("opacity-50");
    if (btnFood) btnFood.disabled = false; btnFood?.classList.remove("opacity-50");
    if (btnFlee) btnFlee.disabled = false; btnFlee?.classList.remove("opacity-50");
  }
}
