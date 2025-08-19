import { Graphics } from 'pixi.js';

import { getApp, getGameStatus } from '../game';
import useHitTestRectangle from '../composables/useHitTestRectangle'
import { toRealSpeed } from '../composables/useMath'

// 射擊
export default (parent) => {
  const app = getApp();
  const gameStatus = getGameStatus()

  const fire = () => {
    const x = parent.x
    const y = parent.y - parent.height / 2
    
    const bullet = new Graphics().circle(0, 0, 4).fill(0xffffff);
    bullet.x = x;
    bullet.y = y;
    bullet.speed = 10
    
    app.stage.addChild(bullet);

    const animate = () => {
      const { isGameOver, isPause, enemies } = gameStatus;
      if (isPause) return;
      if (isGameOver) {
        app.ticker.remove(animate);
        bullet.destroy({ children: true, texture: false, baseTexture: false })
        return
      }

      bullet.y -= toRealSpeed(bullet.speed);
      
      // 超出畫面
      if (bullet.y < 0) {
        app.ticker.remove(animate);
        bullet.destroy({ children: true, texture: false, baseTexture: false })
        return
      }

      for (let j = enemies.length - 1; j >= 0; j--) {
        const enemy = enemies[j];
        
        if (useHitTestRectangle(enemy.body, bullet)) {
          // app.stage.removeChild(bullet);
          bullet.destroy({ children: true, texture: false, baseTexture: false })
          app.ticker.remove(animate);
          
          parent.status.setPoint(enemy.point) // 計分
          parent.status.setKillCount()

          enemy.remove() // 移除敵人
          break;
        }
      }
    }

    app.ticker.add(animate)
  }

  return {
    fire,
  };
}