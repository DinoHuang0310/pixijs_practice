import { Graphics } from 'pixi.js';

import game from '../game';
import useHitTestRectangle from './useHitTestRectangle'

// 射擊
export default (parent) => {
  const { app, gameStatus } = game();

  // const ammos = [];
  const createAmmo = (x, y) => {
    const bullet = new Graphics().circle(0, 0, 4).fill(0xffffff);
    bullet.x = x;
    bullet.y = y;
    bullet.speed = 10
    
    app.stage.addChild(bullet);
    // ammos.push(bullet);

    const animate = () => {
      // for (let i = ammos.length - 1; i >= 0; i--) {
        // const bullet = ammos[i];
        bullet.y -= bullet.speed;

        if (bullet.y < 0) {
          app.stage.removeChild(bullet);
          // ammos.splice(i, 1);
          app.ticker.remove(animate);
          return
        }
      // }

      const enemies = gameStatus.enemies
      for (let j = enemies.length - 1; j >= 0; j--) {
        const enemy = enemies[j];
        
        if (useHitTestRectangle(enemy.body, bullet)) {
          app.stage.removeChild(bullet);
          app.ticker.remove(animate);
          enemy.remove()
          break;
        }
      }
    }

    app.ticker.add(animate)
  }

  const fire = () => {
    // console.log(parent.status)
    createAmmo(parent.x, parent.y - parent.height / 2)
  }

  const stopFire = () => {

  }

  return {
    fire,
    stopFire,
  };
}