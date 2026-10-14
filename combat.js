/**
 * 【模組：半即時戰鬥系統 combat.js】
 */
function startCombat() {
  state.inCombat = true;
  state.clashProgress = 0;
  const zName = GAME_DATA.zones.find(z => z.id === state.player.zone).name;
  addLog(`⚠️ 在【${zName}】撞見了「${state.ai.name}」！進入半即時決鬥！`, "text-rose-400 font-bold");
  updateUI();
}

function executeClashRound() {
  if (!state.inCombat || state.gameOver) return;
  const p = state.player;
  const ai = state.ai;

  const pDmg = Math.max(4, getTotalAtk(p) - Math.floor(getTotalDef(ai) * 0.6));
  ai.hp = Math.max(0, ai.hp - pDmg);
  addLog(`⚔️ 你揮舞【${p.weapon ? p.weapon.name : "拳頭"}】痛擊對手，造成 ${pDmg} 點傷害！`, "text-amber-300");

  if (ai.hp <= 0) {
    ai.alive = false;
    state.inCombat = false;
    endGame(true, `你在正面對決中擊敗了「${ai.name}」，成功稱霸台灣生存戰！`);
    return;
  }

  if (ai.stunned > 0) {
    ai.stunned--;
    addLog(`💫 ${ai.name}被你的咆哮震懾住，抓頭發呆無法攻擊！`, "text-purple-300 font-bold");
  } else {
    const aiDmg = Math.max(4, getTotalAtk(ai) - Math.floor(getTotalDef(p) * 0.6));
    p.hp = Math.max(0, p.hp - aiDmg);
    addLog(`💥 ${ai.name}反擊，你受到 ${aiDmg} 點傷害！`, "text-rose-400");
  }

  if (p.hp <= 0) {
    endGame(false, `你在決鬥中體力不支倒下，被${ai.name}強制送去搭捷運了...`);
    return;
  }

  updateUI();
}

function useCombatSkill() {
  if (!state.inCombat || state.gameOver) return;
  const p = state.player;
  if (p.skillCd > 0) {
    addLog(`⏳ 技能冷卻中（還需 ${p.skillCd} 秒）！`, "text-slate-400");
    return;
  }
  p.skillCd = 12;
  state.ai.stunned = 1;
  const skillDmg = 15;
  state.ai.hp = Math.max(0, state.ai.hp - skillDmg);
  addLog(`📢 你開啟大聲公咆哮：「太離譜了！！！」造成 ${skillDmg} 傷害並震懾對手！`, "text-purple-400 font-bold");

  if (state.ai.hp <= 0) {
    state.ai.alive = false;
    state.inCombat = false;
    endGame(true, `你一聲咆哮直接把${state.ai.name}震飛，成功吃雞！`);
  }
  updateUI();
}

function quickHeal() {
  const p = state.player;
  const foodIdx = p.bag.findIndex(id => GAME_DATA.items[id].type === "food");
  if (foodIdx === -1) {
    addLog("❌ 背包裡已經沒有任何台灣小吃可以補血了！", "text-rose-400");
    return;
  }
  useBagItem(foodIdx);
}

function fleeCombat() {
  if (!state.inCombat) return;
  const p = state.player;
  const openZones = GAME_DATA.zones.filter(z => z.id !== p.zone && !state.closedZones.includes(z.id));
  if (openZones.length === 0) {
    addLog("🚫 只剩最後決戰區，無處可逃，決一死戰吧！", "text-rose-500 font-bold");
    return;
  }
  p.sp = Math.max(0, p.sp - 15);
  const escapeZone = openZones[Math.floor(Math.random() * openZones.length)];
  p.zone = escapeZone.id;
  state.inCombat = false;
  addLog(`🏃 你使出尿遁脫離戰場，逃往了【${escapeZone.name}】！`, "text-sky-300 font-bold");
  updateUI();
}
