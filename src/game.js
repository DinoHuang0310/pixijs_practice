import { Application, Text, TextStyle } from 'pixi.js';

import assetsLoader from './assetsLoader'
import { createPlayer, getPlayer } from './modules/player/usePlayer'
import useEnemy from './modules/enemy/useEnemy'
import useAnimation from './modules/animations/useAnimation'
import useKeyboard from './composables/useKeyboard'

// Create a new application
let app = null;
const gameStatus = {
  gameTimer: 0,
  enemies: [],
  gameLoop: null,
  isGameOver: false,
  isPause: false,
  togglePause: () => {
    gameStatus.isPause = !gameStatus.isPause;
  },
  endGame: () => {
    app.ticker.remove(gameStatus.gameLoop);
    gameStatus.isGameOver = true;
    
    for (let j = gameStatus.enemies.length - 1; j >= 0; j--) {
      gameStatus.enemies[j].remove()
    }

    const { explosion } = useAnimation()
    const player = getPlayer()
    const { x, y, width, height } = player.getBounds()
    explosion({x: x + width / 2, y: y + height / 2})
    player.remove()
    // app.stage.removeChild(player);
  },
}

async function initGame() {
  if (app) return;
  
  await assetsLoader.preload()

  app = new Application();

  // 取得視窗尺寸
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  // 判斷短邊，然後根據 16:9 計算大小
  let stageWidth, stageHeight;

  if (windowWidth / windowHeight < 16 / 9) {
    // 螢幕偏高，使用寬度當基準
    stageWidth = windowWidth;
    stageHeight = (windowWidth * 9) / 16;
  } else {
    // 螢幕偏寬，使用高度當基準
    stageHeight = windowHeight;
    stageWidth = (windowHeight * 16) / 9;
  }

  // 初始化 PIXI 應用
  await app.init({
    background: '#2f2f2f',
    width: stageWidth,
    height: stageHeight,
  });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  // 建立玩家
  createPlayer()

  const { createEnemy } = useEnemy()
  const enemyInterval = 1
  createEnemy()

  // 顯示用文字
  const style = new TextStyle({
    fontSize: 24,
    fill: 0xffffff,
  });
  const timerText = new Text({
    text: `Time: ${gameStatus.gameTimer}`,
    style,
  });
  timerText.x = 10;
  timerText.y = 10;
  app.stage.addChild(timerText);

  // render
  let lastShownTime = 0;
  const gameLoop = ({ deltaTime }) => {
    if (gameStatus.isPause) return;
    
    const { FPS } = app.ticker
    if (FPS < 50) console.warn('FPS: ' + FPS.toFixed(1));

    const deltaSec = deltaTime / 60; // 以 60FPS 為基準，轉成秒
    gameStatus.gameTimer += deltaSec;

    const currentTime = Math.floor(gameStatus.gameTimer);
    if (currentTime !== lastShownTime) {
      if (currentTime % enemyInterval === 0) createEnemy();

      lastShownTime = currentTime;
      timerText.text = `Time: ${currentTime}`;
      const player = getPlayer()
      player.status.setEnergy(5)
    }
  }
  gameStatus.gameLoop = gameLoop;
  app.ticker.add(gameLoop);

  const toggleGame = useKeyboard(9)
  toggleGame.press = gameStatus.togglePause
}

function getApp() {
  if (!app) throw new Error('App not initialized. Did you forget to call initGame()?');
  return app;
}

function getGameStatus() {
  return gameStatus;
}

export {
  initGame,
  getApp,
  getGameStatus,
};