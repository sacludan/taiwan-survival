/**
 * 【模組：電腦對手 AI 決策系統 ai.js】
 * v38：對等機率——AI 與玩家同區域搜刮時，同樣為 60% 機率找到玩家並突襲、40% 機率獲得物資
 */

function runAIBrain() {
  if (state.gameOver || !state.ai || !state.ai.alive || !state.player) return;

  const ai = state.ai;
  const p = state.player;

  // 1. 如果 AI 身處禁區，強制撤離到安全區域
  if (state.closedZones.includes(ai.zone)) {
    const openZones = GAME_DATA.zones.filter(z => !state.closedZones.includes(z.id));
    if (openZones.length > 0) {
      const target = openZones[Math.floor(Math.random() * openZones.length)];
      ai.zone = target.id;
      return;
    }
  }

  // 2. 💡 如果 AI 與玩家在同一個區域：60% 機率搜到玩家並突襲扁一拳！
  if (ai.zone === p.zone) {
    const findChance = Math.random();

    // 💡 60% 機率：AI 搜到了玩家，冷不防單向偷扁一拳！
    if (findChance < 0.60) {
      const aiAtk = getTotalAtk(ai);
      const pDef = getTotalDef(p);
      const dmg = Math.max(4, aiAtk - pDef + Math.floor(Math.random() * 5));

      p.hp = Math.max(0, p.hp - dmg);
      addLog(`💢 <span class="text-rose-400 font-bold">【遭到突襲！】</span> ${ai.name} 在暗處發現了你並發動偷襲，造成 <span class="text-rose-400 font-bold">${dmg}</span> 點傷害！`, "text-rose-300 font-bold");

      if (p.hp <= 0) {
        state.inCombat = false;
        addLog(`💀 【陣亡】你遭到 ${ai.name} 偷襲重創，不幸陣亡...`, "text-rose-500 font-black");
        updateUI();
        endGame(false, `你在【${GAME_DATA.zones.find(z=>z.id===p.zone).name}】遭到 ${ai.name} 偷襲淘汰。`);
        return;
      }

      updateUI();
      // 保持純被動，不彈出交鋒面板
      return;
    }
  }

  // 3. 40% 機率：AI 搜刮一般物資或在不同地圖遊蕩
  const currentZoneObj = GAME_DATA.zones.find(z => z.id === ai.zone);
  if (!currentZoneObj || !currentZoneObj.drops || currentZoneObj.drops.length === 0) return;

  const dropId = currentZoneObj.drops[Math.floor(Math.random() * currentZoneObj.drops.length)];
  const item = GAME_DATA.items[dropId];

  if (item) {
    const slot = item.type;
    if (ai.equip && ai.equip[slot] !== undefined) {
      const currentEquip = ai.equip[slot];
      if (!currentEquip || (item.score || 0) > (currentEquip.score || 0)) {
        ai.equip[slot] = item;
      }
    } 
    else if (item.type === "food" && ai.hp < ai.maxHp * 0.7) {
      ai.hp = Math.min(ai.maxHp, ai.hp + (item.hp || 0));
    }
  }

  // 4. 20% 機率 AI 決定換地圖遊蕩
  if (Math.random() < 0.2) {
    const openZones = GAME_DATA.zones.filter(z => !state.closedZones.includes(z.id) && z.id !== ai.zone);
    if (openZones.length > 0) {
      const target = openZones[Math.floor(Math.random() * openZones.length)];
      ai.zone = target.id;
    }
  }
}
