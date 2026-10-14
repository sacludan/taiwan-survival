/**
 * 【模組：遊戲主大廳 lobby.js】
 */
const LobbyManager = {
  // isSandbox 為 true 時進入無人無縮圈測試模式，為 false 時進入正常對戰
  startGame(isSandbox = false) {
    console.log("大廳啟動遊戲，是否為測試模式：", isSandbox);
    
    // 1. 隱藏大廳畫面
    const lobbyScreen = document.getElementById("lobby-screen");
    if (lobbyScreen) lobbyScreen.classList.add("hidden");

    // 2. 顯示遊戲戰鬥畫面
    const gameScreen = document.getElementById("game-screen");
    if (gameScreen) gameScreen.classList.remove("hidden");

    // 3. 呼叫 main.js 的遊戲初始化，並把模式參數傳過去
    if (typeof initGame === "function") {
      initGame(isSandbox);
    } else {
      console.error("找不到 initGame 函式！");
    }
  }
};
