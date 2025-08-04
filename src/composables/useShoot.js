import { Graphics } from 'pixi.js';

import game from '../game';
import useHitTestRectangle from './useHitTestRectangle'

// 射擊
export default (parent) => {
  const { app, gameStatus } = game();

  const createAmmo = (x, y) => {
    const bullet = new Graphics().circle(0, 0, 4).fill(0xffffff);
    bullet.x = x;
    bullet.y = y;
    bullet.speed = 10
    
    app.stage.addChild(bullet);

    const animate = () => {
      bullet.y -= bullet.speed;
      
      // 超出畫面
      if (bullet.y < 0) {
        app.stage.removeChild(bullet);
        app.ticker.remove(animate);
        return
      }

      const enemies = gameStatus.enemies
      for (let j = enemies.length - 1; j >= 0; j--) {
        const enemy = enemies[j];
        
        if (useHitTestRectangle(enemy.body, bullet)) {
          app.stage.removeChild(bullet);
          app.ticker.remove(animate);
          
          parent.status.pointPlus(enemy.point) // 計分
          enemy.remove() // 移除敵人
          break;
        }
      }
    }

    app.ticker.add(animate)
  }

  const fire = () => {
    createAmmo(parent.x, parent.y - parent.height / 2)
  }

  const stopFire = () => {

  }

  return {
    fire,
    stopFire,
  };
}