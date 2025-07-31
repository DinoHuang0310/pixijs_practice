import { Sprite, Assets } from 'pixi.js';

import game from '../game';
import useMath from '../composables/useMath'
const { randomInt } = useMath

export default async () => {
  const { app, gameStatus } = game();
  
  let index = 0;
  const alienTextures = [
    await Assets.load(new URL('../assets/eggHead.png', import.meta.url).href),
    await Assets.load(new URL('../assets/flowerTop.png', import.meta.url).href),
    await Assets.load(new URL('../assets/skully.png', import.meta.url).href),
    await Assets.load(new URL('../assets/helmlok.png', import.meta.url).href),
  ];

  const createEnemy = () => {
    const enemy = {
      body: new Sprite(alienTextures[index % alienTextures.length]),
      speed: 3,
      remove: () => {
        console.log('remove')
        app.ticker.remove(animate);
        app.stage.removeChild(enemy.body);
        // gameStatus.enemies.splice()
        // 從 enemies 陣列中移除該實體
        const index = gameStatus.enemies.indexOf(enemy);
        if (index !== -1) {
          gameStatus.enemies.splice(index, 1);
        }
      }
    }

    enemy.body.x = randomInt(0, Math.floor(app.screen.width));
    enemy.body.y = enemy.body.height * -0.5;
    enemy.body.scale.set(0.8)
    app.stage.addChild(enemy.body);
    gameStatus.enemies.push(enemy)

    const randomX = randomInt(enemy.speed * -1, enemy.speed)
    const animate = () => {
      enemy.body.x += randomX
      enemy.body.y += enemy.speed
    }

    app.ticker.add(animate);
    index++
  }

  return {
    createEnemy,
  }
}