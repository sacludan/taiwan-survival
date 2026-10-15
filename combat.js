/**
 * 【模組：戰鬥交鋒系統 combat.js】
 * v50：
 * 1. 徹底拔除反擊機制：主動搜到對手 = 單向打擊，玩家出拳絕對不扣血！
 * 2. 單次交鋒結算：打完一拳或放完技能立即關閉交鋒面板，退回探索搜刮
 */

let combatActionBusy = false;

function startCombat() {
  if (state.gameOver || !state.player || !state.ai) return;
  state.inCombat = true;
  combatActionBusy = false;
  addLog(`💥 <span class="text-amber-400 font-bold">【搜刮遭遇！】</span> 你發現了 ${state.ai.name}，可主動發動一次打擊！`, "text-amber-300 font-bold");
  updateUI();
}

function updateCombatUI() {
  if (!state.ai) return;
  const ai = state.ai;

  const enemyNameEl = document.getElementById("enemy-name");
  if (enemyNameEl) enemyNameEl.textContent = ai.name;

  const enemyStatsEl = document.getElementById("enemy-stats");
  if (enemyStatsEl) enemyStatsEl.textContent = `攻擊 ${getTotalAtk(ai)} | 防禦 ${getTotalDef(ai)}`;

  const enemyHpBar = document.getElementById("enemy-hp-bar");
  if (enemyHpBar) enemyHpBar.style.width = `${Math.max(0, (ai.hp / ai.maxHp) * 100)}%`;

  const enemyHpText = document.getElementById("enemy-hp-text");
  if (enemyHpText) enemyHpText.textContent = `HP: ${Math.max(0, ai.hp)}/${ai.maxHp}`;
}

function triggerCombatShake(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.classList.remove("animate-shake");
  void el.offsetWidth;
  el.classList.add("animate-shake");
  setTimeout(() => el.classList.remove("animate-shake"), 300);
}

function executeCombatAction(action) {
  if (state.gameOver || !state.inCombat || !state.player || !state.ai || combatActionBusy) return;

  combatActionBusy = true;
  const p = state.player;
  const ai = state.ai;

  const enemyHpContainer = document.getElementById("enemy-hp-container");

  // 1. 選擇【撤退】
  if (action === "flee") {
    addLog(`🏃 你選擇不驚動對手，悄悄退回搜刮！`, "text-sky-300");
    finishCombatTurn();
    return;
  }

  // 2. 選擇【攻擊】（單向打擊，零反擊）
  if (action === "attack") {
    const pAtk = getTotalAtk(p);
    const aiDef = getTotalDef(ai);
    const isCrit = Math.random() < 0.25;
    const baseDmg = Math.max(6, pAtk - aiDef + Math.floor(Math.random() * 5));
    const finalDmg = isCrit ? Math.floor(baseDmg * 1.6) : baseDmg;

    ai.hp = Math.max(0, ai.hp - finalDmg);
    triggerCombatShake("combat-panel");
    spawnFloatingDamage(enemyHpContainer, `-${finalDmg}`, isCrit);

    if (isCrit) {
      addLog(`🔥 【爆擊重創！】你搶先出手痛擊 ${ai.name}，造成 <span class="text-amber-300 font-black">${finalDmg}</span> 點傷害！`, "text-amber-400 font-bold");
    } else {
      addLog(`你出拳擊中 ${ai.name}，造成 <span class="text-amber-300 font-bold">${finalDmg}</span> 點傷害！`, "text-amber-200");
    }
  }

  // 3. 選擇【技能】（單向技能爆發，零反擊）
  if (action === "skill") {
    if (p.sp < p.skill.costSp) {
      addLog(`體力不足（需要 ${p.skill.costSp} 體力），無法施展絕招！`, "text-rose-400 font-bold");
      combatActionBusy = false;
      return;
    }

    p.sp -= p.skill.costSp;
    const res = p.skill.cast(p, ai);
    triggerCombatShake("combat-panel");
    spawnFloatingDamage(enemyHpContainer, `-${res.dmg}`, true);
    addLog(`✨ ${res.log}`, "text-purple-300 font-bold");
  }

  // 擊倒判定
  if (ai.hp <= 0) {
    ai.alive = false;
    state.inCombat = false;
    combatActionBusy = false;
    addLog(`🏆 【淘汰對手】你成功擊倒了 ${ai.name}！制霸台灣戰場！`, "text-amber-400 font-black text-sm");
    updateUI();
    endGame(true, `你成功擊潰了 ${ai.name}，贏得了台灣生存戰的最終榮耀！`);
    return;
  }

  // 💡 單向攻擊完畢，完全無反擊！短暫展示跳字後立刻退回搜刮主畫面
  setTimeout(() => {
    finishCombatTurn();
  }, 500);
}

function finishCombatTurn() {
  state.inCombat = false;
  combatActionBusy = false;
  updateUI();
}
