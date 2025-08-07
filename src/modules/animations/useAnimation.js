import { AnimatedSprite, Graphics } from 'pixi.js';

import game from '../../game'
import assetsLoader from '../../assetsLoader'

export default () => {
  const { app } = game()
  
  // 爆炸
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
      // app.stage.removeChild(explosion);
      explosion.destroy({
        children: true,
        texture: false,
        baseTexture: false
      });
    }
    app.stage.addChild(explosion);
  }

  // 雷擊
  const thunderStrike = () => {
    const flash = new Graphics()
      .rect(0, 0, app.screen.width, app.screen.height)
      .fill(0xffffff);

    flash.alpha = 0;
    app.stage.addChild(flash);

    let flashCount = 0;
    let flashTimer = 200;
    const flashInterval = 200; // 每次閃爍間隔（毫秒）
    const flashDuration = 100; // 每次閃爍持續時間（毫秒）

    const animate = () => {
      flashTimer += app.ticker.deltaMS;

      if (flashCount < 2) {
        if (flashTimer >= flashInterval) {
          flash.alpha = 0.7;
        }
        if (flashTimer >= flashInterval + flashDuration) {
          flash.alpha = 0;
          flashTimer = 0;
          flashCount++;
        }
      } else {
        // 結束動畫，移除
        app.stage.removeChild(flash);
        flash.destroy();
        app.ticker.remove(animate);
      }
    };

    app.ticker.add(animate);
  }

  return {
    explosion,
    thunderStrike,
  }
}