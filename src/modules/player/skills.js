import { Sprite } from 'pixi.js';

import useAnimation from '../animations/useAnimation'
import game from '../../game'

export default () => {
  const { gameStatus } = game();
  const { thunderStrike } = useAnimation()

  return [
    {
      id: 'aoe01',
      name: '廣域雷擊',
      description: '召喚雷電閃擊全場，擊毀所有敵人',
      icon: Sprite.from(new URL('../../assets/skills/aoe01.jpg', import.meta.url).href),
      cooldown: 20,
      execute: () => {
        thunderStrike()
        const enemies = gameStatus.enemies
        for (let j = enemies.length - 1; j >= 0; j--) {
          enemies[j].remove(true);
        }
      },
    },
    
  ]
}