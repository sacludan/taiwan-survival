/**
 * 【模組：電腦對手 AI 決策系統 ai.js】
 * v58：真人大逃殺 AI 系統
 * 1. 殘血求生本能：HP 低於 35% 時優先開保命技（鮮乳/隱蔽）並逃往其他安全地區
 * 2. 多元搜刮判定：同地區有多人時，AI 會在「搜刮物資」與「遭遇任一同區目標（其他 NPC 或玩家）」之間公平判定，不再只盯著玩家打
 * 3. NPC 互扁與技能交互：NPC 之間會互相開大招、觸發被動（閃避/反傷/受擊回血/開直播/免死瞬移）並淘汰彼此
 */

function runAIBrain() {
  if (state.gameOver || !state.player || !Array.isArray(state.ais)) return;

  const p = state.player;
  const allZones = getSafeZones();
  const aliveAIs = state.ais.filter(a => a && a.alive);
  if (aliveAIs.length === 0) return;

  // 隨機打亂行動順序，讓每位 AI 公平決策
  const order = [...aliveAIs].sort(() => Math.random() - 0.5);

  for (const ai of order) {
    if (!ai.alive || state.gameOver) continue;

    // 若被豬勾亮【歌廳秀】定身中，無法執行任何操作（包含無法逃跑！）
    if (ai.stunRemain > 0) continue;

    // 1. 若身處禁區或即將封閉區，優先撤離至安全區
    if (state.closedZones.includes(ai.zone) || (state.roundTimeRemain <= 20 && state.pendingCloseZones.includes(ai.zone))) {
      const safeZones = allZones.filter(z => !state.closedZones.includes(z.id) && !state.pendingCloseZones.includes(z.id));
      const fallbackZones = allZones.filter(z => !state.closedZones.includes(z.id));
      const pool = safeZones.length > 0 ? safeZones : fallbackZones;
      if (pool.length > 0) {
        const dest = pool[Math.floor(Math.random() * pool.length)];
        moveAIUnitToZone(ai, dest.id);
        continue;
      }
    }

    // 2. 【殘血求生本能】：血量低於 35% 時，優先嘗試保命技能並逃離有人的危險地區
    if (ai.hp <= ai.maxHp * 0.35) {
      // 蔣晚安 AI 自動喝鮮乳補血加防
      if (ai.id === "jiangwanan" && ai.skillCdRemain <= 0 && ai.sp >= ai.skill.costSp) {
        ai.sp -= ai.skill.costSp;
        ai.skillCdRemain = ai.skill.cd;
        ai.hp = Math.min(ai.maxHp, ai.hp + 20);
        ai.milkDefBuffRemain = 10;
        if (ai.zone === p.zone) {
          addLog(`🥛 ${ai.name} 殘血發動【生生喝鮮乳】恢復 20 HP 並提升防禦！`, "text-emerald-300");
        }
      }
      // 王世間 AI 自動開啟 12 秒隱蔽保命
      if (ai.id === "wangshijian" && ai.stealthRemain <= 0 && ai.skillCdRemain <= 0 && ai.sp >= ai.skill.costSp) {
        ai.sp -= ai.skill.costSp;
        ai.stealthRemain = 12;
        if (ai.zone === p.zone) {
          addLog(`👻 ${ai.name} 殘血高喊【Over my dead body】進入 12 秒隱蔽狀態！`, "text-sky-300");
        }
      }

      // 嘗試逃往其他安全地區（75% 機率成功烙跑）
      const escapeZones = allZones.filter(z => !state.closedZones.includes(z.id) && z.id !== ai.zone);
      if (escapeZones.length > 0 && Math.random() < 0.75) {
        const wasWithPlayer = (ai.zone === p.zone);
        const dest = escapeZones[Math.floor(Math.random() * escapeZones.length)];
        moveAIUnitToZone(ai, dest.id);
        if (wasWithPlayer) {
          addLog(`🏃 【重傷逃逸】${ai.name} 見勢不妙，慌忙逃離了本區！`, "text-sky-300");
        }
        continue;
      }
    }

    // 3. 非戰鬥型主動技自發施放（韓國魚發大財、蔣晚安喝鮮乳、王世間隱蔽搜刮）
    if (ai.skillCdRemain <= 0 && ai.sp >= ai.skill.costSp) {
      if (ai.id === "hanguoyu" && Math.random() < 0.35) {
        ai.sp -= ai.skill.costSp;
        ai.skillCdRemain = ai.skill.cd;
        aiLootItems(ai, 3);
      } else if (ai.id === "jiangwanan" && ai.hp <= ai.maxHp * 0.75 && Math.random() < 0.45) {
        ai.sp -= ai.skill.costSp;
        ai.skillCdRemain = ai.skill.cd;
        ai.hp = Math.min(ai.maxHp, ai.hp + 20);
        ai.milkDefBuffRemain = 10;
      } else if (ai.id === "wangshijian" && ai.stealthRemain <= 0 && Math.random() < 0.30) {
        ai.sp -= ai.skill.costSp;
        ai.stealthRemain = 12;
      }
    }

    // 4. 【地區搜刮與多元遭遇判定】（可能搜到物資、可能搜到其他 NPC、也可能搜到玩家）
    // 若 AI 自身處於王世間隱蔽期間，不會搜到任何人，專心搜刮
    if ((ai.stealthRemain || 0) <= 0) {
      // 找出同地區所有未隱蔽的存活單位（包含其他 NPC 與玩家）
      const sameZoneTargets = [];

      state.ais.forEach(otherAI => {
        if (otherAI && otherAI.alive && otherAI !== ai && otherAI.zone === ai.zone && (otherAI.stealthRemain || 0) <= 0) {
          sameZoneTargets.push(otherAI);
        }
      });

      if (p.alive && p.zone === ai.zone && !state.inCombat && (p.stealthRemain || 0) <= 0) {
        sameZoneTargets.push(p);
      }

      // 若同地區有目標，55% 機率觸發遭遇交戰，45% 機率搜刮物資/游走
      if (sameZoneTargets.length > 0 && Math.random() < 0.55) {
        const target = sameZoneTargets[Math.floor(Math.random() * sameZoneTargets.length)];
        executeAICombatTurn(ai, target);
        continue;
      }
    }

    // 5. 搜刮該區物資
    aiLootItems(ai, 1);

    // 6. 25% 機率移動換區遊蕩
    if (Math.random() < 0.25) {
      const openZones = allZones.filter(z => !state.closedZones.includes(z.id) && z.id !== ai.zone);
      if (openZones.length > 0) {
        const targetZone = openZones[Math.floor(Math.random() * openZones.length)];
        moveAIUnitToZone(ai, targetZone.id);
      }
    }
  }
}

function aiLootItems(ai, count = 1) {
  const currentZoneObj = getSafeCurrentZone(ai.zone);
  if (!currentZoneObj || !currentZoneObj.drops || currentZoneObj.drops.length === 0) return;

  for (let i = 0; i < count; i++) {
    const dropId = currentZoneObj.drops[Math.floor(Math.random() * currentZoneObj.drops.length)];
    const item = getSafeItem(dropId);
    if (!item || !item.id) continue;

    const slot = item.type;
    if (ai.equip && ai.equip[slot] !== undefined) {
      const currentEquip = ai.equip[slot];
      if (!currentEquip || (item.score || 0) > (currentEquip.score || 0)) {
        ai.equip[slot] = item;
      }
    } else if (item.type === "food" && ai.hp < ai.maxHp * 0.75) {
      let healHp = item.hp || 0;
      if (ai.id === "yazhoutongshen") healHp = Math.round(healHp * 1.2);
      ai.hp = Math.min(ai.maxHp, ai.hp + healHp);
    }
  }
}

function moveAIUnitToZone(ai, targetZoneId) {
  const prevZone = ai.zone;
  ai.zone = targetZoneId;
  if (prevZone !== targetZoneId && typeof checkHanguoyuRadar === "function") {
    checkHanguoyuRadar(ai, targetZoneId);
  }
}

/**
 * 【核心：AI 對目標（其他 NPC 或 玩家）發動攻擊或專屬主動技】
 */
function executeAICombatTurn(attacker, defender) {
  if (!attacker.alive || !defender.alive) return;

  const isPlayerInvolved = (defender === state.player);
  const isSameZoneAsPlayer = (attacker.zone === state.player.zone);

  // 若目標是亞洲桶神 AI，在被打瞬間若技能就緒，有 40% 機率預開【乾你老師奈德麗】3 秒反傷
  if (
    defender !== state.player &&
    defender.id === "yazhoutongshen" &&
    defender.reflectRemain <= 0 &&
    defender.skillCdRemain <= 0 &&
    defender.sp >= defender.skill.costSp &&
    Math.random() < 0.40
  ) {
    defender.sp -= defender.skill.costSp;
    defender.skillCdRemain = defender.skill.cd;
    defender.reflectRemain = 3;
    if (isSameZoneAsPlayer) {
      addLog(`🛡️ 【${defender.name}】預判攻擊，開啟了【乾你老師奈德麗】反傷護盾！`, "text-amber-300");
    }
  }

  // 判斷攻擊方 AI 是否可施放戰鬥型主動技（45% 機率施放）
  const canCastSkill = (
    attacker.skill &&
    attacker.skillCdRemain <= 0 &&
    attacker.sp >= attacker.skill.costSp &&
    ["zhugouliang", "kewenzhe", "laixiangde", "chenaguan", "chaoge"].includes(attacker.id)
  );

  if (canCastSkill && Math.random() < 0.45) {
    attacker.sp -= attacker.skill.costSp;
    attacker.skillCdRemain = attacker.skill.cd;
    executeAISkillOnTarget(attacker, defender, isPlayerInvolved, isSameZoneAsPlayer);
  } else {
    // 普通攻擊
    const atk = getTotalAtk(attacker);
    const def = getTotalDef(defender);
    const dmg = Math.max(4, atk - def + Math.floor(Math.random() * 5));
    applyAIDamage(attacker, defender, dmg, "突襲攻擊", isPlayerInvolved, isSameZoneAsPlayer);
  }

  // 交鋒後，若被攻擊的是 NPC 且陷入殘血（< 35% HP）且未被定身，立即觸發求生逃跑反應！
  if (
    defender !== state.player &&
    defender.alive &&
    defender.hp <= defender.maxHp * 0.35 &&
    (defender.stunRemain || 0) <= 0
  ) {
    const escapeZones = getSafeZones().filter(z => !state.closedZones.includes(z.id) && z.id !== defender.zone);
    if (escapeZones.length > 0 && Math.random() < 0.70) {
      const dest = escapeZones[Math.floor(Math.random() * escapeZones.length)];
      moveAIUnitToZone(defender, dest.id);
      if (isSameZoneAsPlayer) {
        addLog(`🏃 【不敵撤退】${defender.name} 遭到 ${attacker.name} 重創，急忙逃往其他地區！`, "text-sky-300");
      }
    }
  }

  updateUI();
}

function executeAISkillOnTarget(attacker, defender, isPlayerInvolved, isSameZoneAsPlayer) {
  const atk = getTotalAtk(attacker);
  const def = getTotalDef(defender);
  const baseDmg = Math.max(5, atk - Math.floor(def * 0.6));

  switch (attacker.id) {
    case "zhugouliang": {
      defender.stunRemain = 5;
      if (isPlayerInvolved) {
        addLog(`🎤 <span class="text-rose-400 font-bold">【遭到歌廳秀定身！】</span> ${attacker.name} 對你發動【歌廳秀】，強制你在原地定身 5 秒！`, "text-rose-300 font-bold");
      } else if (isSameZoneAsPlayer) {
        addLog(`🎤 【旁觀激戰】${attacker.name} 發動【歌廳秀】將 ${defender.name} 定在原地 5 秒！`, "text-purple-300");
      }
      break;
    }

    case "kewenzhe": {
      const missingRatio = 1 - (attacker.hp / attacker.maxHp);
      const mult = +(1.5 + 0.5 * missingRatio).toFixed(2);
      const dmg = Math.round(baseDmg * mult);
      applyAIDamage(attacker, defender, dmg, `飛輪衝撞(${mult}x)`, isPlayerInvolved, isSameZoneAsPlayer);
      break;
    }

    case "laixiangde": {
      if (attacker.meritCount < 10) {
        attacker.meritCount = (attacker.meritCount || 0) + 1;
      }
      applyAIDamage(attacker, defender, baseDmg, `打掉雜質(功德+${attacker.meritCount})`, isPlayerInvolved, isSameZoneAsPlayer);

      // 將目標打離此地圖（不進禁區或預警區）
      if (defender.alive) {
        const safeZones = getSafeZones().filter(z =>
          z.id !== defender.zone &&
          !state.closedZones.includes(z.id) &&
          !state.pendingCloseZones.includes(z.id)
        );
        if (safeZones.length > 0) {
          const dest = safeZones[Math.floor(Math.random() * safeZones.length)];
          defender.zone = dest.id;
          if (isPlayerInvolved) {
            addLog(`💨 <span class="text-sky-300 font-bold">【打掉雜質】</span> 你被 ${attacker.name} 強制打飛到了【${dest.name}】！`, "text-sky-300 font-bold");
          } else if (isSameZoneAsPlayer) {
            addLog(`💨 【旁觀激戰】${attacker.name} 用【打掉雜質】把 ${defender.name} 轟飛出了本區！`, "text-sky-300");
          }
          if (defender !== state.player && typeof checkHanguoyuRadar === "function") {
            checkHanguoyuRadar(defender, dest.id);
          }
        }
      }
      break;
    }

    case "chenaguan": {
      for (let i = 1; i <= 3; i++) {
        if (defender.alive) {
          applyAIDamage(attacker, defender, baseDmg, `三槍(第${i}發)`, isPlayerInvolved, isSameZoneAsPlayer);
        }
      }
      attacker.weakRemain = 10;
      break;
    }

    case "chaoge": {
      const dmg = Math.round(baseDmg * 1.5);
      applyAIDamage(attacker, defender, dmg, "超派鐵拳(1.5x)", isPlayerInvolved, isSameZoneAsPlayer);
      break;
    }
  }
}

function applyAIDamage(attacker, defender, rawDmg, skillLabel, isPlayerInvolved, isSameZoneAsPlayer) {
  if (!attacker.alive || !defender.alive) return;

  // 1. 檢查守方是否為蔣晚安且【問A答B】閃避就緒
  if (defender.id === "jiangwanan" && defender.dodgeReady) {
    defender.dodgeReady = false;
    defender.dodgeCdRemain = 20;
    if (isPlayerInvolved) {
      addLog(`💨 <span class="text-sky-400 font-bold">【問A答B】</span> ${attacker.name} 對你發動「${skillLabel}」，被你自動閃躲（傷害 0）！`, "text-sky-300 font-bold");
    } else if (isSameZoneAsPlayer) {
      addLog(`💨 【旁觀激戰】${defender.name} 發動【問A答B】閃躲了 ${attacker.name} 的「${skillLabel}」！`, "text-sky-300");
    }
    return;
  }

  const dmg = Math.max(4, Math.round(rawDmg));
  defender.hp = Math.max(0, defender.hp - dmg);

  if (isPlayerInvolved) {
    triggerPlayerBloodHitEffect();
    if (typeof triggerCombatShake === "function") triggerCombatShake("drop-zone-red");
    const playerHpContainer = document.getElementById("player-hp-container");
    spawnFloatingDamage(playerHpContainer, `-${dmg}`, false);
    addLog(`💢 <span class="text-rose-400 font-bold">【遭到突襲！】</span> ${attacker.name} 對你使出「${skillLabel}」，造成 <span class="text-rose-400 font-bold">${dmg}</span> 點傷害！`, "text-rose-300 font-bold");
  } else if (isSameZoneAsPlayer) {
    addLog(`⚔️ 【同區混戰】${attacker.name} 對 ${defender.name} 使出「${skillLabel}」，造成 ${dmg} 點傷害！`, "text-slate-300");
  }

  // 2. 檢查守方是否開啟亞洲桶神【乾你老師奈德麗】反傷
  if (defender.reflectRemain > 0) {
    attacker.hp = Math.max(0, attacker.hp - dmg);
    if (isPlayerInvolved || isSameZoneAsPlayer) {
      addLog(`🔄 <span class="text-amber-300 font-bold">【乾你老師奈德麗】</span> ${defender.name} 將 ${dmg} 點傷害 100% 反彈給 ${attacker.name}！`, "text-amber-300 font-bold");
    }
    if (attacker.hp <= 0) {
      resolveCombatElimination(attacker, defender);
    }
  }

  // 3. 檢查守方是否為科文哲【我不會屈服的】（每被攻擊 3 次恢復 12 HP）
  if (defender.id === "kewenzhe" && defender.hp > 0) {
    defender.hitTakenCount = (defender.hitTakenCount || 0) + 1;
    if (defender.hitTakenCount >= 3) {
      defender.hitTakenCount = 0;
      defender.hp = Math.min(defender.maxHp, defender.hp + 12);
      if (isPlayerInvolved || isSameZoneAsPlayer) {
        addLog(`💪 <span class="text-emerald-400 font-bold">【我不會屈服的】</span> ${defender.name} 累計挨打 3 次，恢復 12 點生命值！`, "text-emerald-300");
      }
    }
  }

  // 4. 檢查守方是否為陳阿館【幫我開直播】
  if (defender.id === "chenaguan" && defender.hp > 0 && defender.hp <= defender.maxHp * 0.35 && (defender.guanPassiveCd || 0) <= 0) {
    defender.guanPassiveCd = 40;
    defender.guanDefBuffRemain = 8;
    defender.hp = Math.min(defender.maxHp, defender.hp + 25);
    defender.sp = Math.min(defender.maxSp, defender.sp + 25);
    if (isPlayerInvolved || isSameZoneAsPlayer) {
      addLog(`📹 <span class="text-amber-300 font-bold">【幫我開直播】</span> ${defender.name} 觸發被動，立即恢復 25 HP/SP 並獲得 8 秒防禦 +6！`, "text-amber-300");
    }
  }

  // 5. 檢查守方是否陣亡（含豬勾亮【豬大哥沒死】判定與全島淘汰廣播）
  if (defender.hp <= 0) {
    resolveCombatElimination(defender, attacker);
  }
}

function resolveCombatElimination(victim, killer) {
  // 豬勾亮被動【豬大哥沒死】：恢復 20% 血量並瞬移到其他安全區
  if (victim.id === "zhugouliang" && !victim.pigReviveUsed) {
    victim.pigReviveUsed = true;
    victim.hp = Math.max(1, Math.round(victim.maxHp * 0.2));

    const openZones = getSafeZones().filter(z => !state.closedZones.includes(z.id) && z.id !== victim.zone);
    const dest = openZones.length > 0 ? openZones[Math.floor(Math.random() * openZones.length)] : getSafeCurrentZone(victim.zone);
    victim.zone = dest.id;

    addLog(`✨ <span class="text-amber-300 font-black">【豬大哥沒死】</span> ${victim.name} 在 ${killer.name} 的致命一擊下恢復 20% 血量並瞬移逃生！`, "text-amber-300 font-bold");
    if (victim !== state.player && typeof checkHanguoyuRadar === "function") {
      checkHanguoyuRadar(victim, dest.id);
    }
    return;
  }

  // 若陣亡的是玩家，交由 handleUnitDefeat 處理遊戲結束
  if (victim === state.player) {
    if (typeof handleUnitDefeat === "function") {
      handleUnitDefeat(victim, killer);
    }
    return;
  }

  // 若陣亡的是 NPC（被另一個 NPC 擊殺，或被玩家反傷彈死）
  victim.hp = 0;
  victim.alive = false;
  const zName = getSafeCurrentZone(victim.zone).name;
  const remainAIs = state.ais.filter(a => a && a.alive);

  addLog(`📢 <span class="text-amber-400 font-black">【戰場淘汰廣播】</span> 【${killer.name}】在【${zName}】擊敗淘汰了【${victim.name}】！（剩餘對手：${remainAIs.length} 人）`, "text-amber-300 font-bold");

  if (remainAIs.length === 0 && !state.gameOver) {
    updateUI();
    endGame(true, `場上最後一名對手【${victim.name}】已遭淘汰，你成為台灣生存戰的最終贏家！`);
  }
}
