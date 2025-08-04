import { Sprite } from 'pixi.js';

import assetsLoader from '../assetsLoader'
import game from '../game';
import useSingleAnimation from '../composables/useSingleAnimation'
import useContain from '../composables/useContain'
import useMath from '../composables/useMath'
const { randomInt } = useMath

export default () => {
  const { app, gameStatus } = game();
  
  let index = 0;
  const { alienTextures } = assetsLoader

  const createEnemy = () => {
    const enemy = {
      body: new Sprite(alienTextures[index]),
      speed: 3,
      point: 1,
      remove: () => {
        app.ticker.remove(animate);

        const { isGameOver, enemies } = gameStatus
        if (!isGameOver) {
          const { explosion } = useSingleAnimation()
          const { x, y, width, height } = enemy.body.getBounds()
          explosion({x: x + width / 2, y: y + height / 2})
          app.stage.removeChild(enemy.body);
        } else {
          console.log('remove')
        }
        
        // 從 enemies 陣列中移除該實體
        const target = enemies.indexOf(enemy);
        if (target !== -1) {
          enemies.splice(target, 1);
        }
      },
    }

    enemy.body.x = randomInt(0, Math.floor(app.screen.width));
    enemy.body.y = enemy.body.height * -0.5;
    enemy.body.scale.set(0.8)
    enemy.body.anchor.set(0.5)
    app.stage.addChild(enemy.body);
    gameStatus.enemies.push(enemy)

    let moveSpeedX = randomInt(enemy.speed * -1, enemy.speed)
    const animate = () => {
      enemy.body.x += moveSpeedX
      enemy.body.y += enemy.speed

      const overflow = useContain(enemy.body, {
        x: enemy.body.width / 2,
        y: enemy.body.height * 2,
        width: app.screen.width + enemy.body.width / 2,
        height: app.screen.height + enemy.body.height * 2
      }, false);

      if (overflow === 'bottom') {
        enemy.remove()
      }
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