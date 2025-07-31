import { AnimatedSprite, Assets, Texture } from 'pixi.js';

import game from '../game';
import useKeyboard from '../composables/useKeyboard'
import useContain from '../composables/useContain'
import useShoot from '../composables/useShoot'

export default async () => {
  const status = {
    level: 1,
    moveSpeed: 8,
    rotateSpeed: 1,
    skill: {
      active: null,
      skills: [],
    },
    buff: [],
    debuff: [],
  }

  const { app } = game();

  // Load the animation sprite sheet
  // const url = new URL('./fighter.json', import.meta.url).href
  await Assets.load('./fighter.json');

  // Create an array of textures from the sprite sheet
  const frames = [];
  for (let i = 0; i < 30; i++) {
    const val = i < 10 ? `0${i}` : i;

    // Magically works since the spritesheet was loaded with the pixi loader
    frames.push(Texture.from(`rollSequence00${val}.png`));
  }

  // Create an AnimatedSprite (brings back memories from the days of Flash, right ?)
  let plane = new AnimatedSprite(frames);

  const planeScale = 0.08;
  const targetWidth = app.screen.width * planeScale;
  plane.scale.set(targetWidth / plane.width); // 等比縮放，不變形
  // console.log(plane.width, plane.height)

  plane.x = app.screen.width / 2;
  plane.y = app.screen.height * 0.85;
  plane.vx = 0;
  plane.vy = 0;
  plane.anchor.set(0.5);
  // plane.interactive = true; // 允許點擊
  plane.loop = true;

  // Capture the keyboard arrow keys
  const left = useKeyboard(65);
  left.press = function() {
    plane.vx = status.moveSpeed * -1;
    plane.vy = 0;

    currentKey = this.code;
    plane.animationSpeed = status.rotateSpeed * -1;
    plane.gotoAndPlay(plane.currentFrame);
  };
  left.release = function() {
    if (!right.isDown) {
      if (plane.vy === 0) plane.vx = 0;
      
      currentKey = null;
      plane.animationSpeed = plane.currentFrame >= 22 ? status.rotateSpeed : status.rotateSpeed * -1;
      plane.gotoAndPlay(plane.currentFrame);
    }
  };

  const up = useKeyboard(87);
  up.press = function() {
    plane.vy = status.moveSpeed * -1;
    plane.vx = 0;
  };
  up.release = function() {
    if (!down.isDown && plane.vx === 0) {
      plane.vy = 0;
    }
  };

  const right = useKeyboard(68);
  right.press = function() {
    plane.vx = status.moveSpeed;
    plane.vy = 0;

    currentKey = this.code;
    plane.animationSpeed = status.rotateSpeed;
    plane.gotoAndPlay(plane.currentFrame);
  };
  right.release = function() {
    if (!left.isDown) {
      if (plane.vy === 0) plane.vx = 0;

      currentKey = null
      plane.animationSpeed = plane.currentFrame >= 22 ? status.rotateSpeed : status.rotateSpeed * -1;
      plane.gotoAndPlay(plane.currentFrame);
    }
  };

  const down = useKeyboard(83);
  down.press = function() {
    plane.vy = status.moveSpeed;
    plane.vx = 0;
  };
  down.release = function() {
    if (!up.isDown && plane.vx === 0) {
      plane.vy = 0;
    }
  };

  // 射擊
  const { fire, stopFire } = useShoot(plane);
  const shot = useKeyboard(32);
  shot.press = fire
  // shot.release = function() {
  //   console.log('stop')
  // };

  let currentKey = null; // 避免重複觸發
  const maxFrameRight = 8;
  const maxFrameLeft = 22;
  // 控制播放方向和終止幀
  plane.onFrameChange = (frame) => {
    if (currentKey === right.code && frame === maxFrameRight) {
      plane.stop();
    }
    if (currentKey === left.code && frame === maxFrameLeft) {
      plane.stop();
    }
    if (currentKey === null && frame === 0) {
      plane.stop();
    }
  };

  // const { fire } = useShoot(plane);
  // const autoFire = () => {
  //   if (plane) {
  //     fire()
  //     setTimeout(autoFire, 300);
  //   }
  // }
  // autoFire()

  const animate = () => {
    plane.x += plane.vx;
    plane.y += plane.vy;
    useContain(plane, {
      x: plane.width / 2,
      y: plane.height / 2,
      width: app.screen.width + plane.width / 2,
      height: app.screen.height + plane.height / 2
    });
    // console.log("explorer位置" + plane.x + "," + plane.y)
  }

  // render
  app.ticker.add(animate);

  plane.status = status
  plane.remove = () => {
    app.ticker.remove(animate);
    // plane.destroy()
    plane = null
  }
  return plane;
}