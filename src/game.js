import { Application, Text, TextStyle } from 'pixi.js';

import assetsLoader from './assetsLoader'
import { createPlayer, getPlayer } from './modules/player/usePlayer'
import {
  createNormalEnemy,
  createBonusEnemy,
  createSlowTrapEnemy
} from './modules/enemy'
// import useAnimation from './modules/animations/useAnimation'
import useSound from './composables/useSound'
import useKeyboard from './composables/useKeyboard'
import useScene from './scene';

// Create a new application
let app = null;
const gameStatus = {
  gameTimer: 0,
  fps: 0,
  enemies: [],
  gameLoop: null,
  isGameOver: false,
  isPause: false,
  togglePause: () => {
    gameStatus.isPause = !gameStatus.isPause;
  },
  endGame: () => {
    app.ticker.remove(gameStatus.gameLoop);
    gameStatus.gameLoop = null;
    gameStatus.isGameOver = true;
    useSound.play('gameover')

    const player = getPlayer()
    useScene.gameover(player.status)

    player.remove();
  },
}

let timerText = null;
let fpsText = null;

async function initGame() {
  if (app) return;
  
  await assetsLoader.preload()

  await useSound.preload()

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

  const toggleGame = useKeyboard(9)
  toggleGame.press = gameStatus.togglePause

  useScene.start()
  // gameStart()
}

const resetGameStatus = () => {
  gameStatus.gameTimer = 0;

  if (timerText) {
    timerText.destroy()
    timerText = null;
  }

  for (let j = gameStatus.enemies.length - 1; j >= 0; j--) {
    gameStatus.enemies[j].remove()
  }
  gameStatus.isGameOver = false;
  gameStatus.isPause = false;
}

const gameStart = () => {
  useSound.play('gamestart')
  resetGameStatus()

  // 建立玩家
  createPlayer()

  const enemyInterval = 1
  createNormalEnemy()
  const bonusInterval = 10
  createBonusEnemy()
  const slowInterval = 8
  // createSlowTrapEnemy()

  // 顯示用文字
  const style = new TextStyle({
    fontSize: 24,
    fill: 0xffffff,
  });
  timerText = new Text({
    text: `Time: ${gameStatus.gameTimer}`,
    style,
  });
  timerText.x = 10;
  timerText.y = 10;
  app.stage.addChild(timerText);

  fpsText = new Text({
    text: `fps: ${app.ticker.FPS.toFixed()}`,
    style,
  });
  fpsText.x = 10;
  fpsText.y = timerText.height + 20;
  app.stage.addChild(fpsText);

  // render
  let lastShownTime = 0;
  const gameLoop = ({ deltaTime }) => {
    if (gameStatus.isPause) return;
    
    const { FPS } = app.ticker
    if (FPS < 50) console.warn('FPS: ' + FPS.toFixed());
    if (gameStatus.fps !== FPS) {
      fpsText.text = `fps: ${app.ticker.FPS.toFixed()}`
    }

    const deltaSec = deltaTime / 60; // 以 60FPS 為基準，轉成秒
    gameStatus.gameTimer += deltaSec;

    const currentTime = Math.floor(gameStatus.gameTimer);
    if (currentTime !== lastShownTime) {
      if (currentTime % enemyInterval === 0) createNormalEnemy();
      if (currentTime % bonusInterval === 0) createBonusEnemy();
      if (currentTime % slowInterval === 0) createSlowTrapEnemy();

      lastShownTime = currentTime;
      timerText.text = `Time: ${currentTime}`;
      const player = getPlayer()
      player.status.setEnergy(5)
    }
  }
  gameStatus.gameLoop = gameLoop;
  app.ticker.add(gameLoop);
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
  gameStart,
  getApp,
  getGameStatus,
};