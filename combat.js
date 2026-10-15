/**
 * 【模組：戰鬥交鋒系統 combat.js】
 * v48：加入攻擊面板震動 (Screen Shake)、飄動跳字傷害、被反擊時觸發 FPS 爆血特效
 */

function startCombat() {
  if (state.gameOver || !state.player || !state.ai) return;
  state.inCombat = true;
  addLog(`💥 <span class="text-amber-400 font-bold">【遭遇目標！】</span> 你發現了 ${state.ai.name}，正面遭遇！`, "text-amber-300 font-bold");
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
  void el.offsetWidth; // 強制重繪
  el.classList.add("animate-shake");
  setTimeout(() => el.classList.remove("animate-shake"), 300);
}

function executeCombatAction(action) {
  if (state.gameOver || !state.inCombat || !state.player || !state.ai) return;

  const p = state.player;
  const ai = state.ai;

  const enemyBox = document.getElementById("combat-panel");
  const enemyHpContainer = document.getElementById("enemy-hp-container");
  const playerHpContainer = document.getElementById("player-hp-container");

  // 1. 玩家選擇【撤退】
  if (action === "flee") {
    if (Math.random() < 0.65) {
      state.inCombat = false;
      addLog(`🏃 你身手矯健，成功從 ${ai.name} 面前拔腿撤退！`, "text-sky-300 font-bold");
      updateUI();
      return;
    } else {
      addLog(`❌ 撤退失敗！被 ${ai.name} 攔截！`, "text-rose-400 font-bold");
    }
  }

  // 2. 玩家選擇【攻擊】
  if (action === "attack") {
    const pAtk = getTotalAtk(p);
    const aiDef = getTotalDef(ai);
    const isCrit = Math.random() < 0.2;
    const baseDmg = Math.max(5, pAtk - aiDef + Math.floor(Math.random() * 6));
    const finalDmg = isCrit ? Math.floor(baseDmg * 1.6) : baseDmg;

    ai.hp = Math.max(0, ai.hp - finalDmg);
    triggerCombatShake("combat-panel");
    spawnFloatingDamage(enemyHpContainer, `-${finalDmg}`, isCrit);

    if (isCrit) {
      addLog(`🔥 【爆擊！】你一記重拳命中 ${ai.name}，爆裂造成 <span class="text-amber-300 font-black">${finalDmg}</span> 點傷害！`, "text-amber-400 font-bold");
    } else {
      addLog(`你出拳擊中 ${ai.name}，造成 <span class="text-amber-300 font-bold">${finalDmg}</span> 點傷害！`, "text-amber-200");
    }
  }

  // 3. 玩家選擇【技能】
  if (action === "skill") {
    if (p.sp < p.skill.costSp) {
      addLog(`體力不足（需要 ${p.skill.costSp} 體力），無法施展絕招！`, "text-rose-400 font-bold");
      return;
    }

    p.sp -= p.skill.costSp;
    const res = p.skill.cast(p, ai);
    triggerCombatShake("combat-panel");
    spawnFloatingDamage(enemyHpContainer, `-${res.dmg}`, true);
    addLog(`✨ ${res.log}`, "text-purple-300 font-bold");
  }

  // 檢查對手是否被擊倒
  if (ai.hp <= 0) {
    ai.alive = false;
    state.inCombat = false;
    addLog(`🏆 【淘汰對手】你成功擊倒了 ${ai.name}！制霸台灣戰場！`, "text-amber-400 font-black text-sm");
    updateUI();
    endGame(true, `你成功擊潰了 ${ai.name}，贏得了台灣生存戰的最終榮耀！`);
    return;
  }

  // 4. 對手反擊回合
  const aiAtk = getTotalAtk(ai);
  const pDef = getTotalDef(p);
  const aiDmg = Math.max(4, aiAtk - pDef + Math.floor(Math.random() * 5));

  p.hp = Math.max(0, p.hp - aiDmg);
  
  // 💡 觸發 FPS 爆血外圈與玩家受傷震動
  triggerPlayerBloodHitEffect();
  triggerCombatShake("drop-zone-red");
  spawnFloatingDamage(playerHpContainer, `-${aiDmg}`, false);

  addLog(`💢 ${ai.name} 迅捷反擊，對你造成 <span class="text-rose-400 font-bold">${aiDmg}</span> 點傷害！`, "text-rose-300");

  if (p.hp <= 0) {
    state.inCombat = false;
    addLog(`💀 【陣亡】你在與 ${ai.name} 的交鋒中傷重倒地...`, "text-rose-500 font-black");
    updateUI();
    endGame(false, `你在與 ${ai.name} 的交鋒中不幸陣亡。`);
    return;
  }

  updateUI();
}
