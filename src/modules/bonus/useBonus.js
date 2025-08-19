import { getApp, getGameStatus } from '../../game'
import { getPlayer } from '../player/usePlayer'
import useSkills from '../player/skills';
import useHitTestRectangle from '../../composables/useHitTestRectangle';
import useScene from '../../scene'
import { randomInt, getScaleByPercentage, toRealSpeed } from '../../composables/useMath'

export default () => {
  const app = getApp()
  const gameStatus = getGameStatus()

  const allSkill = useSkills()

  const createBonus = () => {
    const target = allSkill[randomInt(0, allSkill.length - 1)]
    const bonus = {
      body: target.icon(),
      speed: 5,
      remove: () => {
        app.ticker.remove(animate);
        bonus.body.destroy({ children: true, texture: false, baseTexture: false });

        // 清除記憶體
        bonus.body = null
        bonus.remove = null
      },
    }

    bonus.body.x = randomInt(0, Math.floor(app.screen.width));
    bonus.body.y = bonus.body.height * -0.5;
    bonus.body.scale.set(getScaleByPercentage(bonus.body, 0.07))
    bonus.body.anchor.set(0.5)
    app.stage.addChild(bonus.body);

    const animate = () => {
      const { isGameOver, isPause } = gameStatus
      if (isPause) return;
      if (isGameOver) {
        bonus.remove()
        return;
      }
      
      const player = getPlayer()
      const { body } = bonus;
      body.y += toRealSpeed(bonus.speed)

      if (useHitTestRectangle(bonus.body, player)) {
        // useScene.checkoutSkill(target)
        player.status.setSkills(target)
        bonus.remove()
        return
      }
      
      if (body.y - body.height > app.screen.height) {
        bonus.remove()
      }
    }

    app.ticker.add(animate);
  }

  return {
    createBonus,
  }
}