/**
 * 【模組：電腦對手 AI 決策系統 ai.js】
 * v58：支援 8 位不重複電腦 AI 同時運作、王世間隱蔽判定、韓國魚雷達警報與技能連動
 */

function runAIBrain() {
  if (state.gameOver || !state.player || !Array.isArray(state.ais)) return;

  const p = state.player;
  const allZones = getSafeZones();
  const aliveAIs = state.ais.filter(a => a && a.alive);
  if (aliveAIs.length === 0) return;

  aliveAIs.forEach(ai => {
    // 若被豬勾亮【歌廳秀】定身中，跳過行動
    if (ai.stunRemain > 0) return;

    // 1. 如果身處禁區，強制撤出
    if (state.closedZones.includes(ai.zone)) {
      const openZones = allZones.filter(z => !state.closedZones.includes(z.id));
      if (openZones.length > 0) {
        const target = openZones[Math.floor(Math.random() * openZones.length)];
        moveAIUnitToZone(ai, target.id);
        return;
      }
    }

    // 2. 同區域遭遇突襲（需雙方皆未處於王世間 Over my dead body 隱蔽狀態，且玩家不在交鋒面板中）
    if (
      ai.zone === p.zone &&
      !state.inCombat &&
      (p.stealthRemain || 0) <= 0 &&
      (ai.stealthRemain || 0) <= 0
    ) {
      if (Math.random() < 0.28) {
        executeAIAmbushOnPlayer(ai, p);
        return;
      }
    }

    // 3. 搜刮成長（若地圖有配置掉落物）
    const currentZoneObj = getSafeCurrentZone(ai.zone);
    if (currentZoneObj && currentZoneObj.drops && currentZoneObj.drops.length > 0) {
      const dropId = currentZoneObj.drops[Math.floor(Math.random() * currentZoneObj.drops.length)];
      const item = getSafeItem(dropId);

      if (item && item.id) {
        const slot = item.type;
        if (ai.equip && ai.equip[slot] !== undefined) {
          const currentEquip = ai.equip[slot];
          if (!currentEquip || (item.score || 0) > (currentEquip.score || 0)) {
            ai.equip[slot] = item;
          }
        } else if (item.type === "food" && ai.hp < ai.maxHp * 0.7) {
          let healHp = item.hp || 0;
          if (ai.id === "yazhoutongshen") healHp = Math.round(healHp * 1.2);
          ai.hp = Math.min(ai.maxHp, ai.hp + healHp);
        }
      }
    }

    // 4. 25% 機率換地圖遊蕩（立法院單一地圖測試模式時 openZones 只會有 1 個，不會移動）
    if (Math.random() < 0.25) {
      const openZones = allZones.filter(z => !state.closedZones.includes(z.id) && z.id !== ai.zone);
      if (openZones.length > 0) {
        const target = openZones[Math.floor(Math.random() * openZones.length)];
        moveAIUnitToZone(ai, target.id);
      }
    }
  });
}

function moveAIUnitToZone(ai, targetZoneId) {
  const prevZone = ai.zone;
  ai.zone = targetZoneId;
  if (prevZone !== targetZoneId && typeof checkHanguoyuRadar === "function") {
    checkHanguoyuRadar(ai, targetZoneId);
  }
}

function executeAIAmbushOnPlayer(ai, p) {
  // 1. 檢查玩家是否為蔣晚安且【問A答B】閃避就緒
  if (p.id === "jiangwanan" && p.dodgeReady) {
    p.dodgeReady = false;
    p.dodgeCdRemain = 20;
    addLog(`💨 <span class="text-sky-400 font-bold">【問A答B】</span> ${ai.name} 試圖偷襲你，但被你完美閃躲（傷害 0，進入 20 秒冷卻）！`, "text-sky-300 font-bold");
    updateUI();
    return;
  }

  const aiAtk = getTotalAtk(ai);
  const pDef = getTotalDef(p);
  const dmg = Math.max(4, aiAtk - pDef + Math.floor(Math.random() * 5));

  p.hp = Math.max(0, p.hp - dmg);

  triggerPlayerBloodHitEffect();
  if (typeof triggerCombatShake === "function") triggerCombatShake("drop-zone-red");
  const playerHpContainer = document.getElementById("player-hp-container");
  spawnFloatingDamage(playerHpContainer, `-${dmg}`, false);

  addLog(`💢 <span class="text-rose-400 font-bold">【遭到突襲！】</span> ${ai.name} 在暗處發動偷襲，對你造成 <span class="text-rose-400 font-bold">${dmg}</span> 點傷害！`, "text-rose-300 font-bold");

  // 2. 檢查玩家是否開啟亞洲桶神【乾你老師奈德麗】反傷
  if (p.reflectRemain > 0) {
    ai.hp = Math.max(0, ai.hp - dmg);
    addLog(`🔄 <span class="text-amber-300 font-bold">【乾你老師奈德麗】</span> 反彈了 <span class="text-amber-300 font-bold">${dmg}</span> 點傷害給 ${ai.name}！`, "text-amber-300");
    if (ai.hp <= 0) {
      handleUnitDefeat(ai, p);
    }
  }

  // 3. 檢查玩家是否為科文哲【我不會屈服的】（每被攻擊 3 次恢復 12 HP）
  if (p.id === "kewenzhe" && p.hp > 0) {
    p.hitTakenCount = (p.hitTakenCount || 0) + 1;
    if (p.hitTakenCount >= 3) {
      p.hitTakenCount = 0;
      p.hp = Math.min(p.maxHp, p.hp + 12);
      addLog(`💪 <span class="text-emerald-400 font-bold">【我不會屈服的】</span> 累計受擊 3 次，恢復 12 點生命值！`, "text-emerald-300 font-bold");
    }
  }

  // 4. 檢查玩家是否為陳阿館【幫我開直播】
  if (p.id === "chenaguan" && p.hp > 0 && p.hp <= p.maxHp * 0.35 && (p.guanPassiveCd || 0) <= 0) {
    p.guanPassiveCd = 40;
    p.guanDefBuffRemain = 8;
    p.hp = Math.min(p.maxHp, p.hp + 25);
    p.sp = Math.min(p.maxSp, p.sp + 25);
    addLog(`📹 <span class="text-amber-300 font-bold">【幫我開直播】</span> 觸發！立即恢復 25 HP/SP 並獲得 8 秒防禦 +6！`, "text-amber-300 font-bold");
  }

  // 5. 檢查玩家是否陣亡（含豬勾亮免死判定）
  if (p.hp <= 0) {
    handleUnitDefeat(p, ai);
  }

  updateUI();
}
