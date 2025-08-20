import { Graphics } from 'pixi.js';

import { getApp, getGameStatus } from '../game';
import useHitTestRectangle from '../composables/useHitTestRectangle'
import { toRealSpeed } from '../composables/useMath'

// 射擊
export default (parent) => {
  const app = getApp();
  const gameStatus = getGameStatus()

  const fire = () => {
    const { weaponLevel } = parent.status;
    const count = Math.min(weaponLevel, 5); // 最多5顆
    const spacing = parent.width * 0.2;
    const startX = parent.x - ((count - 1) * spacing) / 2;
    const y = parent.y - parent.height / 2;
    const size = app.screen.width * 0.003;
    const bulletSpeed = 12;

    const createBullet = (x) => {
      const bullet = new Graphics().circle(0, 0, size).fill(0xffffff);
      bullet.x = x;
      bullet.y = y;
      bullet.speed = bulletSpeed;
      app.stage.addChild(bullet);

      const animate = () => {
        const { isGameOver, isPause, enemies } = gameStatus;
        if (isPause) return;
        if (isGameOver) {
          app.ticker.remove(animate);
          bullet.destroy();
          return;
        }

        bullet.y -= toRealSpeed(bullet.speed);

        if (bullet.y < 0) {
          app.ticker.remove(animate);
          bullet.destroy();
          return;
        }

        for (let j = enemies.length - 1; j >= 0; j--) {
          const enemy = enemies[j];
          if (useHitTestRectangle(enemy.body, bullet)) {
            bullet.destroy();
            app.ticker.remove(animate);

            // parent.status.setPoint(enemy.point);
            // parent.status.setKillCount();
            // enemy.remove();
            enemy.setHp(1, parent);
            break;
          }
        }
      };

      app.ticker.add(animate);
    };

    for (let i = 0; i < count; i++) {
      const x = startX + i * spacing;
      createBullet(x);
    }
  };

  return {
    fire,
  };
}