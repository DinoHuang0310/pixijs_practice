import { Sprite, Graphics } from 'pixi.js';

import useAnimation from '../animations/useAnimation'
import { getApp, getGameStatus } from '../../game'
import useHitTestRectangle from '../../composables/useHitTestRectangle'
import useSound from '../../composables/useSound'

export default () => {
  const app = getApp()
  const gameStatus = getGameStatus()
  const { thunderStrike } = useAnimation()

  return [
    {
      id: 'aoe01',
      name: '廣域雷擊',
      description: '召喚雷電閃擊全場，擊毀所有敵人',
      icon: () => Sprite.from(new URL('../../assets/skills/aoe01.jpg', import.meta.url).href),
      cost: 30,
      cooldown: 20,
      execute: (parent) => {
        thunderStrike()
        useSound.play('thunder')
        const enemies = gameStatus.enemies
        for (let j = enemies.length - 1; j >= 0; j--) {
          enemies[j].setHp(1, parent);
        }
      },
    },
    {
      id: 'aoe02',
      name: '音爆',
      description: '釋放音爆，破壞周圍敵人',
      icon: () => Sprite.from(new URL('../../assets/skills/aoe02.jpg', import.meta.url).href),
      cost: 10,
      cooldown: 3,
      execute: async (parent) => {
        useSound.play('sonicBoom')
        const sonicBoom = new Graphics()
        app.stage.addChild(sonicBoom);
    
        let elapsed = 0;
        const duration = 300; // 動畫持續 N/ms
        const size = app.screen.width * 0.2; // 半徑範圍
        const hitEnemies = new Set();

        const animate = () => {
          const { enemies, isGameOver, isPause } = gameStatus
          if (isPause) return;
          if (isGameOver) {
            app.ticker.remove(animate);
            return
          }
          const { x, y } = parent
    
          elapsed += app.ticker.deltaMS;
          const progress = Math.min(elapsed / duration, 1);
          const radius = progress * size;
          const alpha = 1 - progress; // alpha 從 1 漸漸變成 0
    
          sonicBoom.clear();
          sonicBoom.position.set(x, y)
          
          sonicBoom.circle(0, 0, radius)
            .fill({ color: 0xffffff, alpha: 0 })
            .stroke({ width: 10, color: 0xffffff, alpha: alpha * 0.5 });

          sonicBoom.circle(0, 0, radius)
            .fill({ color: 0xffffff, alpha: 0 })
            .stroke({ width: 2, color: 0xffffff, alpha });
          
          for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            if (!hitEnemies.has(enemy) && useHitTestRectangle(enemy.body, sonicBoom)) {
              hitEnemies.add(enemy);
              enemies[j].setHp(1, parent);
            }
          }
    
          if (progress >= 1) {
            app.ticker.remove(animate);
            sonicBoom.destroy(); // 動畫結束，移除圖形
          }
        }
        app.ticker.add(animate);
      },
    },
  ]
}