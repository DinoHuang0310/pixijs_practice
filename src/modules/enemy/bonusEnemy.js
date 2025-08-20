import { Sprite } from 'pixi.js';

import { getApp, getGameStatus } from '../../game';
// import useAnimation from '../animations/useAnimation'
import createBaseEnemy from './createBaseEnemy'
import useContain from '../../composables/useContain'
import useScene from '../../scene'
import {
  randomInt,
  getScaleByPercentage,
  toRealSpeed
} from '../../composables/useMath'

const bonusEnemy = () => {
  const app = getApp()
  const gameStatus = getGameStatus()

  const enemy = createBaseEnemy({
    body: Sprite.from(new URL('../../assets/bunny.png', import.meta.url).href),
    speed: 6,
    point: 1,
    hp: 1,
    onDestroy: () => app.ticker.remove(animate),
    onDeath: () => useScene.selectBuff()
  })

  enemy.body.x = randomInt(0, Math.floor(app.screen.width));
  enemy.body.y = enemy.body.height * -0.5;
  enemy.body.scale.set(getScaleByPercentage(enemy.body, 0.03)); // 等比定寬 8%
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

  return enemy
}

export default bonusEnemy