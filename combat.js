/**
 * 【模組：戰鬥系統 combat.js】
 * 實現技能獨立 10 秒冷卻 + 動作連招機制：
 * 1. 普攻/食物後 3 秒不能做常規動作，但可立即插招放技能
 * 2. 技能本身 10 秒獨立冷卻，放完後需等待 3 秒才能做其他動作
 */

let actionCooldownTimer = 0; // 常規動作硬直 (攻擊、食物、逃跑)
let skillCooldownTimer = 0;  // 技能專屬獨立 CD (10 秒)
let combatInterval = null;

function startCombat() {
  if (state.gameOver || state.inCombat) return;
  state.inCombat = true;
  actionCooldownTimer = 0;
  skillCooldownTimer = 0;
  
  if (state.ai) {
    state.ai.hp = state.ai.maxHp;
  }

  addLog(`遭遇了對手【${state.ai.name}】！進入戰術指令戰！`, "text-rose-400 font-bold");
  startCombatTimer();
  updateCombatUIState();
  updateUI();
}

// 戰鬥倒數計時核心 (每 100ms 刷新)
function startCombatTimer() {
  if (combatInterval) clearInterval(combatInterval);
  combatInterval = setInterval(() => {
    if (!state.inCombat || state.gameOver) {
      clearInterval(combatInterval);
      return;
    }

    let changed = false;

    if (actionCooldownTimer > 0) {
      actionCooldownTimer = +(actionCooldownTimer - 0.1).toFixed(1);
      if (actionCooldownTimer < 0) actionCooldownTimer = 0;
      changed = true;
    }

    if (skillCooldownTimer > 0) {
      skillCooldownTimer = +(skillCooldownTimer - 0.1).toFixed(1);
      if (skillCooldownTimer < 0) skillCooldownTimer = 0;
      changed = true;
    }

    if (changed) {
      updateCombatUIState();
    }
  }, 100);
}

// 執行戰鬥動作
function executeCombatAction(actionType) {
  if (!state.inCombat || state.gameOver || !state.player || !state.ai) return;

  const p = state.player;
  const ai = state.ai;

  // 1. 技能判定：不受 actionCooldownTimer 限制，只看技能獨立 10 秒 CD
  if (actionType === 'skill') {
    if (skillCooldownTimer > 0) {
      addLog(`技能專屬冷卻中（剩餘 ${Math.ceil(skillCooldownTimer)} 秒）！`, "text-slate-400");
      return;
    }

    const skillDmg = 35 + Math.floor(Math.random() * 15);
    ai.hp = Math.max(0, ai.hp - skillDmg);
    addLog(`💥 大喊：「太離譜了！」施展角色專屬絕技！對 ${ai.name} 造成 <span class="text-purple-400 font-bold">${skillDmg}</span> 點爆擊！`, "text-purple-300 font-bold");

    // 啟動技能獨立 10 秒冷卻 + 放完技能後 3 秒才能做其他動作
    skillCooldownTimer = 10.0;
    actionCooldownTimer = 3.0;
  } 
  // 2. 常規動作（攻擊、食物、逃跑）：受 3 秒動作硬直限制
  else {
    if (actionCooldownTimer > 0) {
      addLog(`動作硬直中（還需 ${actionCooldownTimer} 秒），請稍候！`, "text-slate-400");
      return;
    }

    if (actionType === 'attack') {
      const pAtk = getTotalAtk(p);
      const aiDef = getTotalDef(ai);
      const pDmg = Math.max(3, pAtk - aiDef + Math.floor(Math.random() * 5));
      ai.hp = Math.max(0, ai.hp - pDmg);
      addLog(`⚔️ 你對 ${ai.name} 發動攻擊，造成 <span class="text-amber-400">${pDmg}</span> 點傷害！<span class="text-emerald-400 text-[10px]">(可立刻接技能!)</span>`, "text-amber-300");

      // 攻擊後 3 秒內不能再普攻/吃補，但可以立刻接技能！
      actionCooldownTimer = 3.0;
    } 
    else if (actionType === 'food') {
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
        addLog("背包裡沒有任何食物可以食用！", "text-rose-400");
        return;
      } else {
        const foodId = p.bag[bestFoodIdx];
        const foodItem = GAME_DATA.items[foodId];
        const healHp = foodItem.hp || 0;
        const healSp = foodItem.sp || 0;

        p.hp = Math.min(p.maxHp, p.hp + healHp);
        p.sp = Math.min(p.maxSp, p.sp + healSp);
        p.bag.splice(bestFoodIdx, 1);
        addLog(`🍖 緊急嗑藥！吃掉了背包中最高補量的【${foodItem.name}】，回復 ${healHp} HP / ${healSp} SP！`, "text-emerald-400 font-bold");
        
        // 吃補後 3 秒內不能再普攻/吃補，但可以立刻接技能！
        actionCooldownTimer = 3.0;
      }
    } 
    else if (actionType === 'flee') {
      if (p.sp < 15) {
        addLog("體力不足（需 15 體力），無法突圍逃跑！", "text-rose-400");
        return;
      }
      p.sp -= 15;
      state.inCombat = false;
      if (combatInterval) clearInterval(combatInterval);
      const otherZones = GAME_DATA.zones.filter(z => z.id !== p.zone);
      const targetZone = otherZones[Math.floor(Math.random() * otherZones.length)];
      p.zone = targetZone.id;
      addLog(`🏃 你施展身法成功逃離戰場，逃往【${targetZone.name}】（消耗 15 體力）！`, "text-indigo-300 font-bold");
      updateUI();
      return;
    }
  }

  // 檢查 AI 是否被打敗
  if (ai.hp <= 0) {
    state.inCombat = false;
    ai.alive = false;
    if (combatInterval) clearInterval(combatInterval);
    addLog(`【大捷】你成功擊敗了 ${ai.name}！`, "text-emerald-400 font-black");
    updateUI();
    endGame(true, `你在激烈的對決中擊敗了 ${ai.name}，成為最終的生存者！`);
    return;
  }

  // AI 進行反擊
  const aiAtk = getTotalAtk(ai);
  const pDef = getTotalDef(p);
  const aiDmg = Math.max(2, aiAtk - pDef + Math.floor(Math.random() * 4));
  p.hp = Math.max(0, p.hp - aiDmg);
  addLog(`${ai.name} 反擊，對你造成 <span class="text-rose-400">${aiDmg}</span> 點傷害！`, "text-rose-300");

  if (p.hp <= 0) {
    state.inCombat = false;
    if (combatInterval) clearInterval(combatInterval);
    addLog(`【陣亡】你遭到 ${ai.name} 淘汰...`, "text-rose-500 font-black");
    updateUI();
    endGame(false, `你在與 ${ai.name} 的交鋒中不幸陣亡，生存戰失敗。`);
    return;
  }

  updateCombatUIState();
  updateUI();
}

// 即時更新戰鬥按鈕與提示狀態
function updateCombatUIState() {
  const cdText = document.getElementById("combat-cooldown-text");
  const btnAtk = document.getElementById("btn-combat-atk");
  const btnSkill = document.getElementById("btn-combat-skill");
  const btnFood = document.getElementById("btn-combat-food");
  const btnFlee = document.getElementById("btn-combat-flee");

  if (!cdText) return;

  // 1. 技能按鈕獨立更新
  if (btnSkill) {
    if (skillCooldownTimer > 0) {
      btnSkill.disabled = true;
      btnSkill.classList.add("opacity-40");
      btnSkill.innerHTML = `✨ 技能 <span class="text-[9px] block">${Math.ceil(skillCooldownTimer)}s</span>`;
    } else {
      btnSkill.disabled = false;
      btnSkill.classList.remove("opacity-40");
      btnSkill.innerHTML = `✨ 技能 <span class="text-[9px] text-emerald-300 block">就緒</span>`;
    }
  }

  // 2. 常規動作按鈕更新 (攻擊、食物、逃跑)
  const isActionLocked = actionCooldownTimer > 0;
  [btnAtk, btnFood, btnFlee].forEach(btn => {
    if (!btn) return;
    btn.disabled = isActionLocked;
    if (isActionLocked) btn.classList.add("opacity-40");
    else btn.classList.remove("opacity-40");
  });

  // 3. 狀態提示條文字
  if (isActionLocked) {
    cdText.textContent = `動作硬直 ${actionCooldownTimer}s`;
    cdText.className = "text-xs text-amber-400 font-mono font-bold block animate-pulse";
  } else {
    cdText.textContent = `指令就緒`;
    cdText.className = "text-xs text-emerald-400 font-mono font-bold block";
  }
}
