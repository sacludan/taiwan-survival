/**
 * 【模組：遊戲主大廳 lobby.js】
 * 負責處理標題畫面、點擊開始遊戲、角色選擇與大廳互動邏輯
 */
const LobbyManager = {
  init() {
    console.log("大廳模組載入成功");
    this.renderLobbyUI();
  },

  renderLobbyUI() {
    // 可以在這裡動態生成大廳的按鈕或狀態
  },

  // 玩家點擊「開始遊戲」按鈕觸發
  startGame() {
    // 1. 隱藏大廳畫面
    document.getElementById("lobby-screen").classList.add("hidden");
    // 2. 顯示遊戲戰鬥畫面
    document.getElementById("game-screen").classList.remove("hidden");

    // 3. 呼叫 main.js 的遊戲初始化
    if (typeof initGame === "function") {
      initGame();
    }
  }
};

// 頁面載入時初始化大廳
window.addEventListener("DOMContentLoaded", () => {
  LobbyManager.init();
});
