import { Sprite } from 'pixi.js';

import assetsLoader from '../../assetsLoader'
import { getApp, getGameStatus } from '../../game';
import useAnimation from '../animations/useAnimation'
import useContain from '../../composables/useContain'
import {
  randomInt,
  getScaleByPercentage,
  toRealSpeed
} from '../../composables/useMath'

export default () => {
  const app = getApp()
  const gameStatus = getGameStatus()
  
  let index = 0;
  const { alienTextures } = assetsLoader

  const createEnemy = () => {
    const enemy = {
      body: new Sprite(alienTextures[index]),
      speed: 3,
      point: 1,
      remove: (withoutAnimate) => {
        app.ticker.remove(animate);
        
        if (!withoutAnimate) {
          const { explosion } = useAnimation()
          const { x, y, width, height } = enemy.body.getBounds()
          explosion({x: x + width / 2, y: y + height / 2})
        }
        
        enemy.body.destroy({ children: true, texture: false, baseTexture: false });
        
        // 從 enemies 陣列中移除該實體
        const { enemies } = gameStatus
        const target = enemies.indexOf(enemy);
        if (target !== -1) {
          enemies.splice(target, 1);
        }

        // 清除記憶體
        enemy.body = null
        enemy.remove = null
      },
    }

    enemy.body.x = randomInt(0, Math.floor(app.screen.width));
    enemy.body.y = enemy.body.height * -0.5;
    enemy.body.scale.set(getScaleByPercentage(enemy.body, 0.08)); // 等比定寬 8%
    enemy.body.anchor.set(0.5)
    
    app.stage.addChild(enemy.body);
    gameStatus.enemies.push(enemy)

    let moveSpeedX = randomInt(enemy.speed * -1, enemy.speed)
    const animate = () => {
      if (gameStatus.isPause) return;
      const { body } = enemy;
      body.x += toRealSpeed(moveSpeedX)
      body.y += toRealSpeed(enemy.speed)

      if (body.y - body.height > app.screen.height) {
        enemy.remove(true)
        return;
      }

      const overflow = useContain(body, {
        x: body.width / 2,
        y: body.height / 2,
        width: app.screen.width + body.width / 2,
        height: app.screen.height + body.height / 2
      }, false);

      if ((overflow === 'left' && moveSpeedX < 0) || (overflow === 'right' && moveSpeedX > 0)) {
        moveSpeedX = moveSpeedX * -1
      }
    }

    app.ticker.add(animate);

    index = (index + 1) % alienTextures.length
  }

  return {
    createEnemy,
  }
}