import { Sprite } from 'pixi.js';

import { getApp, getGameStatus } from '../../game';
import { getPlayer } from '../player/usePlayer'
import createBaseEnemy from './createBaseEnemy'
import useContain from '../../composables/useContain'
import {
  randomInt,
  getScaleByPercentage,
  toRealSpeed
} from '../../composables/useMath'

const slowTrapEnemy = () => {
  const app = getApp()
  const player = getPlayer()
  const gameStatus = getGameStatus()

  // 出場時給player掛上緩速
  const speedDown = { type: 'speed', value: -3 }
  player.status.addBuff('debuff', speedDown)
  
  // 血量加權
  const hpGain = Math.floor(gameStatus.gameTimer / 15)

  const enemy = createBaseEnemy({
    body: Sprite.from(new URL('../../assets/flowerTop.png', import.meta.url).href),
    speed: 2,
    point: 3,
    hp: 5 + hpGain,
    onDestroy: () => {
      app.ticker.remove(animate)
      if (!gameStatus.isGameOver) {
        player.status.removeBuff('debuff', speedDown)
      }
    },
  })

  enemy.body.scale.set(getScaleByPercentage(enemy.body, 0.08)); // 等比定寬 8%
  enemy.body.x = randomInt(0, Math.floor(app.screen.width));
  enemy.body.y = enemy.body.height * -0.5;
  enemy.body.anchor.set(0.5)
  
  app.stage.addChild(enemy.body);
  gameStatus.enemies.push(enemy)

  let moveSpeedX = randomInt(enemy.speed * -1, enemy.speed)

  let timer = 0
  let flashInterval = 500
  const animate = () => {
    if (gameStatus.isPause) return;
    const { deltaMS } = app.ticker
    if (timer >= flashInterval) {
      enemy.body.tint = 0x008000
      setTimeout(() => {
        // 可能在100毫秒內已經被消滅, 先檢查enemy是否還存在
        if (enemy.body) {
          enemy.body.tint = 0xffffff
        }
      }, 100);

      timer -= flashInterval
    } else {
      timer += deltaMS
    }
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

  return enemy
}

export default slowTrapEnemy