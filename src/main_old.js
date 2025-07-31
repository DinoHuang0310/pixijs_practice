import './style.css'

import { AnimatedSprite, Application, Assets, Texture } from 'pixi.js';

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: '#2f2f2f', resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  // Load the animation sprite sheet
  await Assets.load('https://pixijs.com/assets/spritesheet/fighter.json');

  // Create an array of textures from the sprite sheet
  const frames = [];

  for (let i = 0; i < 30; i++) {
    const val = i < 10 ? `0${i}` : i;

    // Magically works since the spritesheet was loaded with the pixi loader
    frames.push(Texture.from(`rollSequence00${val}.png`));
  }

  // Create an AnimatedSprite (brings back memories from the days of Flash, right ?)
  const anim = new AnimatedSprite(frames);

  const targetWidth = app.screen.width * 0.08;
  anim.scale.set(targetWidth / anim.width); // 等比縮放，不變形
  console.log(anim.width, anim.height)

  /*
   * An AnimatedSprite inherits all the properties of a PIXI sprite
   * so you can change its position, its anchor, mask it, etc
   */
  anim.x = app.screen.width / 2;
  anim.y = app.screen.height * 0.85;
  anim.anchor.set(0.5);
  // anim.interactive = true; // 允許點擊
  // anim.animationSpeed = 0.5;
  anim.loop = true;

  app.stage.addChild(anim);

  let currentKey = null; // 避免重複觸發
  const maxFrameRight = 8;
  const maxFrameLeft = 22;

  // 控制播放方向和終止幀
  anim.onFrameChange = (frame) => {
    if (currentKey === 'ArrowRight' && frame === maxFrameRight) {
      // console.log(frame)
      anim.stop();
    }
    if (currentKey === 'ArrowLeft' && frame === maxFrameLeft) {
      // console.log(frame)
      anim.stop();
    }
    if (currentKey === null && frame === 0) {
      // console.log(frame)
      anim.stop();
    }
  };

  window.addEventListener('keydown', (e) => {
    // if (currentKey) return; // 如果已按住，不重複觸發
    if (e.key === currentKey) return;

    if (e.key === 'ArrowRight') {
      currentKey = 'ArrowRight';
      anim.animationSpeed = 1;
      anim.gotoAndPlay(anim.currentFrame);
    }

    if (e.key === 'ArrowLeft') {
      currentKey = 'ArrowLeft';
      anim.animationSpeed = -1;
      anim.gotoAndPlay(anim.currentFrame);
    }
  });

  window.addEventListener('keyup', (e) => {
    // if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
    //   currentKey = null;
    //   anim.animationSpeed = -0.5; // 回放時使用反向速度
    //   anim.gotoAndPlay(anim.currentFrame);
    // }
    currentKey = null;
    if (e.key === 'ArrowLeft') {
      anim.animationSpeed = 1
    }
    if (e.key === 'ArrowRight') {
      anim.animationSpeed = -1
    }
    anim.gotoAndPlay(anim.currentFrame);
  });

  const MOVE_SPEED = 10
  let cons = true
  app.ticker.add((delta) => {
    if (cons) {
      cons = false
      console.log(delta)
    }
    if (currentKey === 'ArrowRight') anim.x += MOVE_SPEED;
    if (currentKey === 'ArrowLeft') anim.x -= MOVE_SPEED;
  });

  // let direction = '';
  // let lastKey = '';
  // anim.onFrameChange = (currentFrame) => {
  //   let targetFrame;
  //   if (direction === '') {
  //     targetFrame = 0;
  //   } else if (direction === 'left') {
  //     targetFrame = 22;
  //   } else if (direction === 'right') {
  //     targetFrame = 8;
  //   }
  //   if (currentFrame === targetFrame) {
  //     anim.stop();
  //   }
  // };

  // window.addEventListener('keydown', (e) => {
  //   if (e.key === 'a' && lastKey !== 'a') {
  //     console.log('<<<');

  //     lastKey = 'a'
  //     direction = 'left'
  //     anim.animationSpeed = -0.5
  //     anim.gotoAndPlay(anim.currentFrame);
  //   }
  //   if (e.key === 'd' && lastKey !== 'd') {
  //     console.log('>>>');

  //     lastKey = 'd'
  //     direction = 'right'
  //     anim.animationSpeed = 0.5
  //     anim.gotoAndPlay(anim.currentFrame);
  //   }

  //   if (e.key === ' ') {
  //     console.log('按下空白鍵');
  //     // 觸發跳躍或攻擊等動作
  //   }
  // });

  // window.addEventListener('keyup', (e) => {
  //   // console.log(`放開鍵盤：${e.key}`);
  //   lastKey = ''
  //   if (e.key === 'a') {
  //     direction = ''
  //     anim.animationSpeed = 0.5
  //     anim.gotoAndPlay(anim.currentFrame);
  //   }

  //   if (e.key === 'd') {
  //     direction = ''
  //     anim.animationSpeed = -0.5
  //     anim.gotoAndPlay(anim.currentFrame);
  //   }
  // });

})();
