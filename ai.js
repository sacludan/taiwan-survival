/**
 * 【模組：AI 決策與大逃殺混戰模擬 ai.js】
 * 支援真實資源枯竭：AI 搜刮時會同步消耗所在區域的 drops 物資池
 */

function tryAutoCraftForAI(ai) {
  if (typeof findAvailableRecipes !== 'function' || typeof craftItem !== 'function') return;
  let loopGuard = 0;
  while (loopGuard < 5) {
    const avail = findAvailableRecipes(ai);
    if (!avail || avail.length === 0) break;
    craftItem(ai, avail[0], false);
    loopGuard++;
  }
}

function lootOneItemForAI(ai) {
  const zObj = getSafeCurrentZone(ai.zone);
  if (!zObj || !zObj.drops || zObj.drops.length === 0) return false;

  const randIdx = Math.floor(Math.random() * zObj.drops.length);
  const dropId = zObj.drops[randIdx];
  const item = getSafeItem(dropId);
  if (!item) return false;

  const slot = item.type;
  if (ai.equip && ai.equip[slot] !== undefined) {
    const currentEquip = ai.equip[slot];
    if (!currentEquip || (item.score || 0) > (currentEquip.score || 0)) {
      if (currentEquip && ai.bag.length < 6) ai.bag.push(currentEquip.id);
      ai.equip[slot] = { ...item, id: dropId };
      zObj.drops.splice(randIdx, 1);
    } else if (ai.bag.length < 6) {
      ai.bag.push(dropId);
      zObj.drops.splice(randIdx, 1);
    } else {
      return false;
    }
  } else if (ai.bag.length < 6) {
    ai.bag.push(dropId);
    zObj.drops.splice(randIdx, 1);
  } else {
    return false;
  }

  tryAutoCraftForAI(ai);
  return true;
}

function tryConsumeFoodForAI(ai) {
  if (!ai.bag || ai.bag.length === 0) return false;
  for (let i = 0; i < ai.bag.length; i++) {
    const item = getSafeItem(ai.bag[i]);
    if (item && item.type === "food" && (item.hp || 0) > 0) {
      ai.hp = Math.min(ai.maxHp, ai.hp + item.hp);
      if (item.sp) ai.sp = Math.min(ai.maxSp, ai.sp + item.sp);
      ai.bag.splice(i, 1);
      return true;
    }
  }
  return false;
}

function getSafeOpenZonesForAI(excludeZoneId = null) {
  const allZones = getSafeZones();
  const safeList = allZones.filter(z =>
    !state.closedZones.includes(z.id) &&
    !state.pendingCloseZones.includes(z.id) &&
    z.id !== excludeZoneId
  );
  if (safeList.length > 0) return safeList;

  const fallback = allZones.filter(z => !state.closedZones.includes(z.id) && z.id !== excludeZoneId);
  return fallback.length > 0 ? fallback : allZones;
}

function moveAIToSafeZone(ai) {
  if (DEV_CONFIG.mode === "char_test") return;
  const candidates = getSafeOpenZonesForAI(ai.zone);
  if (!candidates || candidates.length === 0) return;

  const withDrops = candidates.filter(z => z.drops && z.drops.length > 0);
  const pool = withDrops.length > 0 ? withDrops : candidates;
  const nextZone = pool[Math.floor(Math.random() * pool.length)];

  if (nextZone && nextZone.id !== ai.zone) {
    ai.zone = nextZone.id;
    if (typeof checkHanguoyuRadar === 'function') {
      checkHanguoyuRadar(ai, nextZone.id);
    }
  }
}

function simulateAIVsAICombat(attacker, defender) {
  if (!attacker || !defender || !attacker.alive || !defender.alive) return;

  if (defender.hp < defender.maxHp * 0.35 && Math.random() < 0.65) {
    moveAIToSafeZone(defender);
    return;
  }

  let dmg = Math.max(4, getTotalAtk(attacker) - getTotalDef(defender));
  if (attacker.skillCdRemain === 0 && attacker.sp >= (attacker.skill?.sp || 20) && Math.random() < 0.45) {
    attacker.sp -= (attacker.skill?.sp || 20);
    attacker.skillCdRemain = attacker.skill?.cd || 15;
    dmg = Math.round(dmg * 1.45);
  }

  defender.hp -= dmg;

  if (defender.hp <= 0) {
    defender.hp = 0;
    defender.alive = false;
    const zName = getSafeCurrentZone(attacker.zone).name;
    addLog(`💀 【全島廣播】${attacker.name} 在【${zName}】擊殺了 ${defender.name}！`, "text-rose-400 font-black");

    if (typeof checkAllAIsDeadWin === 'function') {
      checkAllAIsDeadWin();
    }
    return;
  }

  if (defender.hp < defender.maxHp * 0.35) {
    if (!tryConsumeFoodForAI(defender)) {
      moveAIToSafeZone(defender);
    }
  }
}

function runAIBrain() {
  if (!state.ais || state.ais.length === 0) return;

  state.ais.forEach(ai => {
    if (!ai || !ai.alive) return;

    if (state.inCombat && state.ai && state.ai.id === ai.id) return;
    if (ai.stunRemain > 0) return;

    if (state.closedZones.includes(ai.zone)) {
      ai.hp -= 30;
      if (ai.hp <= 0) {
        ai.hp = 0;
        ai.alive = false;
        const zName = getSafeCurrentZone(ai.zone).name;
        addLog(`⚡ 【全島廣播】${ai.name} 滯留於禁區【${zName}】遭高壓電網淘汰！`, "text-rose-500 font-black");
        if (typeof checkAllAIsDeadWin === 'function') checkAllAIsDeadWin();
        return;
      }
      moveAIToSafeZone(ai);
      return;
    }

    if (state.pendingCloseZones.includes(ai.zone) && state.roundTimeRemain <= 25) {
      moveAIToSafeZone(ai);
      return;
    }

    if (ai.hp < ai.maxHp * 0.45) {
      if (tryConsumeFoodForAI(ai)) return;
      if (ai.id === "wangshijian" && ai.skillCdRemain === 0 && ai.sp >= 20) {
        ai.sp -= 20;
        ai.stealthRemain = 12;
      }
    }

    const sameZoneAIs = state.ais.filter(other =>
      other && other.alive && other.id !== ai.id && other.zone === ai.zone && (other.stealthRemain || 0) <= 0
    );

    if (sameZoneAIs.length > 0 && (ai.stealthRemain || 0) <= 0 && Math.random() < 0.45) {
      const targetOther = sameZoneAIs[Math.floor(Math.random() * sameZoneAIs.length)];
      simulateAIVsAICombat(ai, targetOther);
      return;
    }

    if (Math.random() < 0.70) {
      const looted = lootOneItemForAI(ai);
      if (!looted) {
        moveAIToSafeZone(ai);
      }
    } else {
      moveAIToSafeZone(ai);
    }
  });
}
