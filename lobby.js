/**
 * 【模組：遊戲主大廳 lobby.js】
 */
const LobbyManager = {
  startGame() {
    console.log("開始遊戲按鈕被點擊");
    
    // 1. 隱藏大廳
    const lobbyEl = document.getElementById("lobby-screen");
    if (lobbyEl) lobbyEl.classList.add("hidden");

    // 2. 顯示遊戲畫面
    const gameEl = document.getElementById("game-screen");
    if (gameEl) gameEl.classList.remove("hidden");

    // 3. 觸發主遊戲初始化
    if (typeof initGame === "function") {
      initGame();
    } else {
      console.error("找不到 initGame 函式，請確認 main.js 是否正確載入！");
      alert("初始化失敗，請檢查主程式邏輯！");
    }
  }
};
