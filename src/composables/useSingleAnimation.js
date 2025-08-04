import { AnimatedSprite } from 'pixi.js';

import game from '../game'
import assetsLoader from '../assetsLoader'

export default () => {
  const { app } = game()
  
  const explosion = ({
    x, y, scale = 0.8, anchor = 0.5
  }) => {
    if (!x || !y) {
      console.warn('參數x, y 必傳')
      return;
    }
    const { explosionTextures } = assetsLoader
    const explosion = new AnimatedSprite(explosionTextures)
    explosion.x = x;
    explosion.y = y;
    explosion.loop = false;
    explosion.scale.set(scale)
    explosion.anchor.set(anchor);
    explosion.gotoAndPlay(0);
    
    explosion.onComplete = () => {
      app.stage.removeChild(explosion);
    }
    app.stage.addChild(explosion);
  }

  return {
    explosion,
  }
}