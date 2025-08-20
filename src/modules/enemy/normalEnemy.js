import { Sprite } from 'pixi.js';

import assetsLoader from '../../assetsLoader'
import { getApp, getGameStatus } from '../../game';
// import useAnimation from '../animations/useAnimation'
import createBaseEnemy from './createBaseEnemy'
import useContain from '../../composables/useContain'
import {
  randomInt,
  getScaleByPercentage,
  toRealSpeed
} from '../../composables/useMath'

let index = 0;

const normalEnemy = () => {
  const app = getApp()
  const gameStatus = getGameStatus()
  const { alienTextures } = assetsLoader

  // 速度加權
  const speedGain = Math.floor(gameStatus.gameTimer / 15) * 2
  const hpGain = Math.floor(gameStatus.gameTimer / 15)

  const enemy = createBaseEnemy({
    body: new Sprite(alienTextures[index]),
    speed: 3 + speedGain,
    point: 1 + hpGain,
    hp: 1 + hpGain,
    onDestroy: () => app.ticker.remove(animate),
  })

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

  return enemy
}

export default normalEnemy