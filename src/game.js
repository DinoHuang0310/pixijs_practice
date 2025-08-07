import { Application, Text, TextStyle } from 'pixi.js';

import assetsLoader from './assetsLoader'
import usePlayer from './modules/player/usePlayer'
import useEnemy from './modules/enemy/useEnemy'
import useAnimation from './modules/animations/useAnimation'
// import useDashboard from './modules/dashboard/useDashboard'

// Create a new application
let app = null;
const gameStatus = {
  player: null,
  gameTimer: 0,
  enemies: [],
  gameLoop: null,
  isGameOver: false,
  gameOver: () => {
    app.ticker.remove(gameStatus.gameLoop);
    gameStatus.isGameOver = true;
    
    for (let j = gameStatus.enemies.length - 1; j >= 0; j--) {
      gameStatus.enemies[j].remove()
    }

    const { explosion } = useAnimation()
    const { x, y, width, height } = gameStatus.player.getBounds()
    explosion({x: x + width / 2, y: y + height / 2})
    app.stage.removeChild(gameStatus.player);
  },
}

export default () => {
  const initGame = async () => {
    if (app) return;
    
    await assetsLoader.preload()

    app = new Application();

    // Initialize the application
    await app.init({ background: '#2f2f2f', resizeTo: window });

    // Append the application canvas to the document body
    document.body.appendChild(app.canvas);

    gameStatus.player = usePlayer();
    app.stage.addChild(gameStatus.player);

    const { createEnemy } = useEnemy()
    const enemyInterval = 1
    // createEnemy()

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

    // dashboasd
    // useDashboard()

    // render
    let lastShownTime = 0;
    const gameLoop = ({ deltaTime }) => {
      const { FPS } = app.ticker
      if (FPS < 50) console.warn('FPS: ' + FPS.toFixed(1));
      // const now = performance.now();
      // const deltaSec = (now - lastTime) / 1000;
      // lastTime = now;

      // gameStatus.gameTimer += deltaSec;
      // console.log(gameStatus.gameTimer)

      const deltaSec = deltaTime / 60; // 以 60FPS 為基準，轉成秒
      gameStatus.gameTimer += deltaSec;

      const currentTime = Math.floor(gameStatus.gameTimer);
      if (currentTime !== lastShownTime) {
        if (currentTime % enemyInterval === 0) createEnemy();

        lastShownTime = currentTime;
        timerText.text = `Time: ${currentTime}`;
      }
    }
    gameStatus.gameLoop = gameLoop;
    app.ticker.add(gameLoop);
  }

  return {
    app,
    initGame,
    gameStatus,
  }
}