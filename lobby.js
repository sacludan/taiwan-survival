/**
 * 【模組：遊戲主大廳 lobby.js】
 */
const LobbyManager = {
  startGame() {
    console.log("大廳：開始遊戲按鈕被點擊");
    
    // 1. 隱藏大廳畫面
    const lobbyScreen = document.getElementById("lobby-screen");
    if (lobbyScreen) lobbyScreen.classList.add("hidden");

    // 2. 顯示遊戲戰鬥畫面
    const gameScreen = document.getElementById("game-screen");
    if (gameScreen) gameScreen.classList.remove("hidden");

    // 3. 呼叫 main.js 的遊戲初始化與計時器啟動
    if (typeof initGame === "function") {
      initGame();
    } else {
      console.error("找不到 initGame 函式！");
    }
  }
};
