import { getGameStatus } from '../../game';
import useAnimation from '../animations/useAnimation'

const createBaseEnemy = ({ body, hp, point, speed, onDeath = null, onDestroy = null }) => {
  const gameStatus = getGameStatus()

  const enemy = {
    body,
    speed,
    point,
    hp,
    remove: () => {
      enemy.body.destroy({ children: true, texture: false, baseTexture: false });
      
      // 從 enemies 陣列中移除該實體
      const { enemies } = gameStatus
      const target = enemies.indexOf(enemy);
      if (target !== -1) {
        enemies.splice(target, 1);
      }

      if (onDestroy && typeof onDestroy === 'function') {
        onDestroy();
      }
      // 清除記憶體
      enemy.body = null
      enemy.remove = null
    },
    setHp: (val, player) => {
      enemy.hp -= val
      if (enemy.hp <= 0) {
        const { explosion } = useAnimation()
        const { x, y, width, height } = enemy.body.getBounds()
        explosion({x: x + width / 2, y: y + height / 2})

        enemy.remove()
        player.status.setPoint(enemy.point);
        player.status.setKillCount();

        if (onDeath && typeof onDeath === 'function') {
          onDeath();
        }
      } else {
        enemy.body.tint = 0xe3116c
        setTimeout(() => {
          // 可能在100毫秒內已經被消滅, 先檢查enemy是否還存在
          if (enemy.body) {
            enemy.body.tint = 0xffffff
          }
        }, 100);
      }
    },
  }

  return enemy
}

export default createBaseEnemy