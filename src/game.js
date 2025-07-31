import { Application, Text, TextStyle } from 'pixi.js';

import usePlane from './player/usePlane'
import useEnemy from './enemy/useEnemy'
import useKeyboard from './composables/useKeyboard'

// Create a new application
let app = null;
const gameStatus = {
  gameTimer: 0,
  enemies: [],
}

export default () => {
  const test = (player) => {
    const deleteTest = useKeyboard(46)
    deleteTest.press = () => {
      app.stage.removeChild(player);
      player.remove()
    }
  }

  const initGame = async () => {
    if (app) return;

    let lastTime = performance.now();
    app = new Application();

    // Initialize the application
    await app.init({ background: '#2f2f2f', resizeTo: window });

    // Append the application canvas to the document body
    document.body.appendChild(app.canvas);

    const player = await usePlane();
    app.stage.addChild(player);

    const { createEnemy } = await useEnemy()
    // createEnemy()
    // const setEnemy = () => {
    //   createEnemy()
    //   setTimeout(setEnemy, 1000);
    // }
    // setEnemy()

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
    app.ticker.add(() => {
      const now = performance.now();
      const deltaSec = (now - lastTime) / 1000;
      lastTime = now;

      gameStatus.gameTimer += deltaSec;
      // console.log(gameStatus.gameTimer)

      const currentTime = Math.floor(gameStatus.gameTimer);
      if (currentTime !== lastShownTime) {
        createEnemy()
        lastShownTime = currentTime;
        timerText.text = `Time: ${currentTime}`;
      }
    });

    // test(player)
  }

  return {
    app,
    initGame,
    gameStatus,
  }
}