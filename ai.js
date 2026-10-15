/**
 * 【模組：電腦對手 AI 決策系統 ai.js】
 * v52：適配 22 區大地圖尋路與遊蕩
 */

function runAIBrain() {
  if (state.gameOver || !state.ai || !state.ai.alive || !state.player) return;

  const ai = state.ai;
  const p = state.player;
  const allZones = getSafeZones();

  // 1. 如果身處禁區，強制撤出
  if (state.closedZones.includes(ai.zone)) {
    const openZones = allZones.filter(z => !state.closedZones.includes(z.id));
    if (openZones.length > 0) {
      const target = openZones[Math.floor(Math.random() * openZones.length)];
      ai.zone = target.id;
      return;
    }
  }

  // 2. 同區域遭遇突襲
  if (ai.zone === p.zone) {
    if (Math.random() < 0.60) {
      const aiAtk = getTotalAtk(ai);
      const pDef = getTotalDef(p);
      const dmg = Math.max(4, aiAtk - pDef + Math.floor(Math.random() * 5));

      p.hp = Math.max(0, p.hp - dmg);

      triggerPlayerBloodHitEffect();
      triggerCombatShake("drop-zone-red");
      const playerHpContainer = document.getElementById("player-hp-container");
      spawnFloatingDamage(playerHpContainer, `-${dmg}`, false);

      addLog(`💢 <span class="text-rose-400 font-bold">【遭到突襲！】</span> ${ai.name} 在暗處發現了你並發動偷襲，造成 <span class="text-rose-400 font-bold">${dmg}</span> 點傷害！`, "text-rose-300 font-bold");

      if (p.hp <= 0) {
        state.inCombat = false;
        addLog(`💀 【陣亡】你遭到 ${ai.name} 偷襲重創，不幸陣亡...`, "text-rose-500 font-black");
        updateUI();
        endGame(false, `你在【${getSafeCurrentZone(p.zone).name}】遭到 ${ai.name} 偷襲淘汰。`);
        return;
      }

      updateUI();
      return;
    }
  }

  // 3. 搜刮成長
  const currentZoneObj = getSafeCurrentZone(ai.zone);
  if (currentZoneObj && currentZoneObj.drops && currentZoneObj.drops.length > 0) {
    const dropId = currentZoneObj.drops[Math.floor(Math.random() * currentZoneObj.drops.length)];
    const item = getSafeItem(dropId);

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
  }

  // 4. 25% 機率換地圖遊蕩
  if (Math.random() < 0.25) {
    const openZones = allZones.filter(z => !state.closedZones.includes(z.id) && z.id !== ai.zone);
    if (openZones.length > 0) {
      const target = openZones[Math.floor(Math.random() * openZones.length)];
      ai.zone = target.id;
    }
  }
}
