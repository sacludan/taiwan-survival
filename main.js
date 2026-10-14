/**
 * 【模組：核心管家 main.js】
 * 負責遊戲狀態管理、搜刮、一鍵合成、縮圈計時、UI 畫面渲染與大廳連動初始化
 */
const state = {
  timeSec: 0,
  nextCloseSec: 45,
  closedZones: [],
  inCombat: false,
  clashProgress: 0,
  gameOver: false,
  player: null,
  ai: null
};

// 由 lobby.js 呼叫：當玩家在大廳點擊「開始遊戲」時觸發
function initGame() {
  // 每次開新局時，重新深拷貝重置玩家與電腦狀態
  state.timeSec = 0;
  state.nextCloseSec = 45;
  state.closedZones = [];
  state.inCombat = false;
  state.clashProgress = 0;
  state.gameOver = false;
  state.player = JSON.parse(JSON.stringify(GAME_DATA.initialPlayer));
  state.ai = JSON.parse(JSON.stringify(GAME_DATA.initialAI));

  // 清空畫面上可能殘留的舊記錄
  document.getElementById("game-log").innerHTML = "";

  addLog("🎮 台灣生存戰正式開局！點擊上方【搜刮此區域】收集材料！", "text-amber-300 font-bold");
  updateUI();
  startGameLoop();
}

// 遊戲主時鐘迴圈
let gameInterval = null;
function startGameLoop() {
  if (gameInterval) clearInterval(gameInterval);
  let tickCount = 0;
  
  gameInterval = setInterval(() => {
    if (state.gameOver) return;
    tickCount++;

    // 半即時戰鬥 2.5 秒自動交鋒進度條
    if (state.inCombat) {
      state.clashProgress += 4;
      const remainSec = Math.max(0, (2.5 - (state.clashProgress / 100) * 2.5)).toFixed(1);
      const clashBar = document.getElementById("clash-bar");
      const clashTimerText = document.getElementById("clash-timer-text");
      if (clashBar) clashBar.style.width = `${state.clashProgress}%`;
      if (clashTimerText) clashTimerText.textContent = `${remainSec}s`;

      if (state.clashProgress >= 100) {
        state.clashProgress = 0;
        executeClashRound();
      }
    }

    // 每 1 秒觸發一次世界時間
    if (tickCount % 10 === 0) {
      state.timeSec++;
      if (state.player.skillCd > 0) state.player.skillCd--;

      const timerEl = document.getElementById("game-timer");
      if (timerEl) {
        timerEl.textContent = `⏱️ ${Math.floor(state.timeSec/60).toString().padStart(2,'0')}:${(state.timeSec%60).toString().padStart(2,'0')}`;
      }

      // 縮圈計時
      const remainClose = state.nextCloseSec - state.timeSec;
      const warningEl = document.getElementById("zone-warning");
      if (warningEl && state.closedZones.length < 3) {
        if (remainClose > 0) {
          warningEl.textContent = `⚠️ ${remainClose}秒後封鎖下個區域`;
        } else {
          const open = GAME_DATA.zones.filter(z => !state.closedZones.includes(z.id));
          if (open.length > 1) {
            state.closedZones.push(open[0].id);
            state.nextCloseSec += 45;
            addLog(`🚨 【全島緊急廣播】${open[0].name} 已被列為戒嚴禁區！`, "text-rose-500 font-bold");
            
            if (state.player.zone === open[0].id) {
              state.player.hp = Math.max(1, state.player.hp - 25);
              addLog(`💥 你滯留在禁區內，遭到驅離受到 25 點傷害！`, "text-rose-500 font-bold");
            }
            updateUI();
          }
        }
      } else if (state.closedZones.length >= 3 && warningEl) {
        warningEl.textContent = `🔥 最終決戰區！強制死鬥！`;
      }

      // 每 3 秒讓電腦 AI 動一次大腦
      if (state.timeSec % 3 === 0) {
        runAIBrain();
      }
    }
  }, 100);
}

function getTotalAtk(unit) { return unit.baseAtk + (unit.weapon ? unit.weapon.atk : 0); }
function getTotalDef(unit) { return unit.baseDef + (unit.armor ? unit.armor.def : 0); }

function addLog(msg, color = "text-slate-300") {
  const logEl = document.getElementById("game-log");
  if (!logEl) return;
  const timeStr = Math.floor(state.timeSec / 60).toString().padStart(2, '0') + ":" + (state.timeSec % 60).toString().padStart(2, '0');
  const div = document.createElement("div");
  div.className = `${color} leading-relaxed`;
  div.innerHTML = `<span class="text-slate-600">[${timeStr}]</span>${msg}`;
  logEl.prepend(div);
}

function findAvailableRecipes(unit) {
  const ownedIds = [...unit.bag];
  if (unit.weapon) ownedIds.push(unit.weapon.id);
  if (unit.armor) ownedIds.push(unit.armor.id);
  return GAME_DATA.recipes.filter(r => r.materials.every(m => ownedIds.includes(m)));
}

function craftItem(unit, recipe, isPlayer = true) {
  recipe.materials.forEach(matId => {
    const bagIdx = unit.bag.indexOf(matId);
    if (bagIdx !== -1) unit.bag.splice(bagIdx, 1);
    else if (unit.weapon && unit.weapon.id === matId) unit.weapon = null;
    else if (unit.armor && unit.armor.id === matId) unit.armor = null;
  });

  const newItem = GAME_DATA.items[recipe.result];
  if (newItem.type === "weapon" && (!unit.weapon || newItem.score > unit.weapon.score)) {
    if (unit.weapon && unit.bag.length < 6) unit.bag.push(unit.weapon.id);
    unit.weapon = newItem;
    if (isPlayer) addLog(`✨ 合成神武並自動裝備：【${newItem.name}】！`, "text-amber-400 font-bold");
  } else if (newItem.type === "armor" && (!unit.armor || newItem.score > unit.armor.score)) {
    if (unit.armor && unit.bag.length < 6) unit.bag.push(unit.armor.id);
    unit.armor = newItem;
    if (isPlayer) addLog(`✨ 合成防具並自動穿戴：【${newItem.name}】！`, "text-sky-400 font-bold");
  } else {
    unit.bag.push(newItem.id);
    if (isPlayer) addLog(`✨ 成功合成：
