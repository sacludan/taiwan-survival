/**
 * 【模組：電腦 AI 決策樹大腦 ai.js】
 */
function runAIBrain() {
  const ai = state.ai;
  if (!ai.alive || state.gameOver) return;

  if (ai.hp < ai.maxHp * 0.55) {
    const foodIdx = ai.bag.findIndex(id => GAME_DATA.items[id].type === "food");
    if (foodIdx !== -1) {
      const food = GAME_DATA.items[ai.bag[foodIdx]];
      ai.hp = Math.min(ai.maxHp, ai.hp + food.hp);
      ai.bag.splice(foodIdx, 1);
      addLog(`🤖 ${ai.name}抓準空檔吃下【${food.name}】，回復了 ${food.hp} 點生命！`, "text-emerald-300");
      updateUI();
      return;
    }
  }

  if (state.inCombat && ai.hp < 35 && Math.random() < 0.4) {
    const safeZones = GAME_DATA.zones.filter(z => z.id !== ai.zone && !state.closedZones.includes(z.id));
    if (safeZones.length > 0) {
      ai.zone = safeZones[Math.floor(Math.random() * safeZones.length)].id;
      state.inCombat = false;
      addLog(`🐝 ${ai.name}大喊：「這不符合 SOP，先撤！」一溜煙逃跑了！`, "text-amber-300 font-bold");
      updateUI();
      return;
    }
  }

  if (state.inCombat) return;

  if (state.closedZones.includes(ai.zone)) {
    const safeZones = GAME_DATA.zones.filter(z => !state.closedZones.includes(z.id));
    if (safeZones.length > 0) ai.zone = safeZones[0].id;
  }

  const craftables = findAvailableRecipes(ai);
  if (craftables.length > 0) {
    craftItem(ai, craftables[0], false);
    addLog(`📡 情報：${ai.name}成功合成出了【${GAME_DATA.items[craftables[0].result].name}】！`, "text-amber-400");
    return;
  }

  const currentZ = GAME_DATA.zones.find(z => z.id === ai.zone);
  const dropId = currentZ.drops[Math.floor(Math.random() * currentZ.drops.length)];
  const item = GAME_DATA.items[dropId];

  if (item.type === "weapon" && (!ai.weapon || item.score > ai.weapon.score)) {
    ai.weapon = item;
  } else if (item.type === "armor" && (!ai.armor || item.score > ai.armor.score)) {
    ai.armor = item;
  } else if (ai.bag.length < 6) {
    ai.bag.push(dropId);
  }

  if (Math.random() < 0.4) {
    const openZones = GAME_DATA.zones.filter(z => !state.closedZones.includes(z.id));
    const targetZone = openZones[Math.floor(Math.random() * openZones.length)];
    ai.zone = targetZone.id;
    if (ai.zone === state.player.zone && Math.random() < 0.5) {
      startCombat();
    }
  }
}
