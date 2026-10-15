/**
 * 【模組：戰鬥系統 combat.js】
 * v36：經典黑色倖存者「單次交鋒機制」
 * 遭遇敵人 -> 選擇【攻擊】/【技能】/【撤退】 -> 結算單回合攻防 -> 結束交鋒返回探索介面
 */

let skillCooldownTimer = 0; // 技能獨立冷卻計時器
let skillInterval = null;

function startCombat() {
  if (state.gameOver) return;
  state.inCombat = true;

  addLog(`💥 <span class="text-rose-400 font-bold">遭遇對手【${state.ai.name}】！</span> 選擇你的交鋒行動！`, "text-amber-300 font-bold");
  updateCombatUI();
  updateUI();
}

// 技能獨立 CD 計時器
function initSkillCooldownTimer() {
  if (skillInterval) clearInterval(skillInterval);
  skillInterval = setInterval(() => {
    if (skillCooldownTimer > 0) {
      skillCooldownTimer = +(skillCooldownTimer - 0.1).toFixed(1);
      if (skillCooldownTimer <= 0) skillCooldownTimer = 0;
      updateCombatSkillButton();
    }
  }, 100);
}
initSkillCooldownTimer();

function updateCombatSkillButton() {
  const btnSkill = document.getElementById("btn-combat-skill");
  if (!btnSkill || !state.player || !state.player.skill) return;

  const sk = state.player.skill;
  if (skillCooldownTimer > 0) {
    btnSkill.disabled = true;
    btnSkill.classList.add("opacity-40");
    btnSkill.innerHTML = `<span>${sk.icon || '✨'} ${sk.name}</span><span class="text-[9px] block">${Math.ceil(skillCooldownTimer)}s</span>`;
  } else {
    btnSkill.disabled = false;
    btnSkill.classList.remove("opacity-40");
    btnSkill.innerHTML = `<span>${sk.icon || '✨'} ${sk.name}</span><span class="text-[9px] text-emerald-300 block">就緒</span>`;
  }
}

function updateCombatUI() {
  if (!state.inCombat || !state.ai) return;
  const ai = state.ai;

  const enemyName = document.getElementById("enemy-name");
  const enemyStats = document.getElementById("enemy-stats");
  const enemyHpText = document.getElementById("enemy-hp-text");
  const enemyHpBar = document.getElementById("enemy-hp-bar");

  if (enemyName) enemyName.textContent = ai.name;
  if (enemyStats) enemyStats.textContent = `攻擊 ${getTotalAtk(ai)} | 防禦 ${getTotalDef(ai)}`;
  if (enemyHpText) enemyHpText.textContent = `HP: ${ai.hp}/${ai.maxHp}`;
  if (enemyHpBar) enemyHpBar.style.width = `${(ai.hp / ai.maxHp) * 100}%`;

  updateCombatSkillButton();
}

// 💡 執行單次交鋒行動：做完一次攻防後，立即結束交鋒並返回搜刮模式
function executeCombatAction(actionType) {
  if (!state.inCombat || state.gameOver || !state.player || !state.ai) return;

  const p = state.player;
  const ai = state.ai;

  // 1. 撤退行動
  if (actionType === 'flee') {
    state.inCombat = false;
    addLog(`🏃 你敏捷地退後一步，暫時拉開了與 ${ai.name} 的距離，重新回到搜刮狀態。`, "text-slate-400 font-bold");
    updateUI();
    return;
  }

  // 2. 技能行動
  if (actionType === 'skill') {
    if (skillCooldownTimer > 0) {
      addLog(`技能【${p.skill.name}】還在冷卻中（剩餘 ${Math.ceil(skillCooldownTimer)} 秒）！`, "text-slate-400");
      return;
    }

    if (p.skill.costSp && p.sp < p.skill.costSp) {
      addLog(`體力不足（需 ${p.skill.costSp} 體力），無法發動技能！`, "text-rose-400");
      return;
    }

    if (p.skill.costSp) p.sp -= p.skill.costSp;
    const result = p.skill.cast(p, ai);
    addLog(`💥 ${result.log}`, "text-purple-300 font-bold");
    skillCooldownTimer = p.skill.cd || 10.0;
  }

  // 3. 一般攻擊行動
  if (actionType === 'attack') {
    const pAtk = getTotalAtk(p);
    const aiDef = getTotalDef(ai);
    const pDmg = Math.max(4, pAtk - aiDef + Math.floor(Math.random() * 5));
    ai.hp = Math.max(0, ai.hp - pDmg);
    addLog(`⚔️ 你揮出武器重擊 ${ai.name}，造成 <span class="text-amber-400 font-bold">${pDmg}</span> 點傷害！`, "text-amber-300");
  }

  // 檢查是否直接擊殺敵人
  if (ai.hp <= 0) {
    state.inCombat = false;
    ai.alive = false;
    addLog(`🏆 【擊殺】你成功淘汰了 ${ai.name}！`, "text-emerald-400 font-black");
    updateUI();
    endGame(true, `你在驚險的交鋒中擊敗了 ${ai.name}，成為制霸全島的最後倖存者！`);
    return;
  }

  // 敵人反擊一次
  const aiAtk = getTotalAtk(ai);
  const pDef = getTotalDef(p);
  const aiDmg = Math.max(3, aiAtk - pDef + Math.floor(Math.random() * 4));
  p.hp = Math.max(0, p.hp - aiDmg);
  addLog(`💢 ${ai.name} 迅捷反擊，對你造成 <span class="text-rose-400 font-bold">${aiDmg}</span> 點傷害！`, "text-rose-300");

  if (p.hp <= 0) {
    state.inCombat = false;
    addLog(`💀 【陣亡】你遭到 ${ai.name} 擊倒淘汰...`, "text-rose-500 font-black");
    updateUI();
    endGame(false, `你在與 ${ai.name} 的交鋒中不幸身亡。`);
    return;
  }

  // 💡 交鋒結束：雙方互相交手一回合後，面板收回，回歸搜刮狀態
  state.inCombat = false;
  addLog(`💨 交鋒結束！雙方退回暗處，若要繼續追擊請再次搜刮！`, "text-slate-400");
  updateUI();
}
