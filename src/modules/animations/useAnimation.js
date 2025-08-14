import { AnimatedSprite, Graphics } from 'pixi.js';

import { getApp } from '../../game'
import assetsLoader from '../../assetsLoader'

export default () => {
  const app = getApp()
  
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
        // app.stage.removeChild(flash);
        flash.destroy();
        app.ticker.remove(animate);
      }
    };

    app.ticker.add(animate);
  }

  // 火狩
  const fireRound = (parent) => {
    const fireCircle = new Graphics()

    app.stage.addChild(fireCircle);

    let elapsed = 0;
    const duration = 1000; // 動畫持續 N/ms
    const animate = () => {
      const center = parent.getGlobalPosition()
      const { x, y } = center

      elapsed += app.ticker.deltaMS;
      const progress = Math.min(elapsed / duration, duration / 1000);
      const radius = progress * 500; // 最多放大到半徑 500
      const alpha = 1 - progress;   // alpha 從 1 漸漸變成 0

      fireCircle.clear();
      fireCircle.position.set(x, y)
      fireCircle.circle(0, 0, radius)
        .fill({ color: 0xffffff, alpha: 0 })
        .stroke({ width: 2, color: 0xff0000, alpha });

      if (progress >= duration / 1000) {
        app.ticker.remove(animate);
        fireCircle.destroy(); // 動畫結束，移除圖形
      }
    }
    app.ticker.add(animate);
    return fireCircle;
  }

  return {
    explosion,
    thunderStrike,
    fireRound,
  }
}