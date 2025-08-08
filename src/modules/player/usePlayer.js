import { AnimatedSprite, Graphics } from 'pixi.js';

import game from '../../game';
import assetsLoader from '../../assetsLoader'
import useKeyboard from '../../composables/useKeyboard'
import useContain from '../../composables/useContain'
import useShoot from '../../composables/useShoot'
import useHitTestRectangle from '../../composables/useHitTestRectangle'
import useSkill from './skills'
import useDashboard from '../dashboard/useDashboard';

export default () => {
  const { app, gameStatus } = game();
  const allSkill = useSkill()
  const { initSkillCooldown } = useDashboard()
  
  const status = {
    moveSpeed: 8,
    isTriggerSpeedup: false,
    rotateSpeed: 1,
    point: 0,
    lastSkillTime: null,
    activeSkillId: null,
    skills: [],
    buff: [],
    debuff: [],
    energy: 100,
    setEnergy: (val) => {
      const { energy } = status
      if (energy + val < 0) return
      status.energy = Math.min(energy + val, 100)
    },
    pointPlus: (point) => {
      status.point += point
      if (status.point === 1) {
        const targetSkill = allSkill[0]

        // 註冊技能冷卻icon
        const skillDashboard = initSkillCooldown(targetSkill);
        // 擴充原本的execute方法, 加上額外行為
        status.skills.push({
          ...targetSkill,
          execute: () => {
            const { energyCost } = targetSkill
            if (status.energy < energyCost) return;

            status.setEnergy(energyCost * -1)
            status.lastSkillTime = gameStatus.gameTimer; // 記錄施放時間
            skillDashboard.start() // 觸發dashboard動畫

            // 執行原本技能的效果
            targetSkill.execute();
          },
        });

        status.activeSkillId = targetSkill.id
      }
    },
  }

  const { planeFrames: frames } = assetsLoader

  let plane = new AnimatedSprite(frames);
  plane.status = status

  const planeScale = 0.08;
  const targetWidth = app.screen.width * planeScale;
  plane.scale.set(targetWidth / plane.width); // 等比縮放, 不變形
  // console.log(plane.width, plane.height)

  plane.x = app.screen.width / 2;
  plane.y = app.screen.height * 0.85;
  plane.vx = 0;
  plane.vy = 0;
  plane.anchor.set(0.5);
  // plane.interactive = true; // 允許點擊
  plane.loop = true;

  const energyBar = new Graphics()
  app.stage.addChild(energyBar);

  // Capture the keyboard arrow keys
  const keyboardEvents = {
    left: useKeyboard(65),
    up: useKeyboard(87),
    right: useKeyboard(68),
    down: useKeyboard(83),
    skill: useKeyboard(81),
    shot: useKeyboard(32),
    speedUp: useKeyboard(16),
  }
  const computedMoveSpeed = () => {
    const { buff, debuff, moveSpeed } = status;

    const totalModifier = [...buff, ...debuff]
      .filter(i => i.type === 'speed')
      .reduce((sum, i) => sum + (i.value || 0), 0);
    return moveSpeed + totalModifier;
  }
  const {left, up, right, down, skill, shot, speedUp} = keyboardEvents
  left.press = function() {
    plane.vx = computedMoveSpeed() * -1;
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

  up.press = function() {
    plane.vy = computedMoveSpeed() * -1;
    plane.vx = 0;
  };
  up.release = function() {
    if (!down.isDown && plane.vx === 0) {
      plane.vy = 0;
    }
  };

  right.press = function() {
    plane.vx = computedMoveSpeed();
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

  down.press = function() {
    plane.vy = computedMoveSpeed();
    plane.vx = 0;
  };
  down.release = function() {
    if (!up.isDown && plane.vx === 0) {
      plane.vy = 0;
    }
  };

  skill.press = function() {
    const { status } = plane
    if (!status.skills.length) {
      console.log('no skill')
      return;
    }

    const activeSkill = status.skills.find(i => i.id === status.activeSkillId)
    const now = gameStatus.gameTimer
    if (!status.lastSkillTime || now - status.lastSkillTime > activeSkill.cooldown) {
      activeSkill.execute();
    } else {
      const difference = Math.abs(activeSkill.cooldown - (now - status.lastSkillTime))
      console.warn(`技能冷卻中, 還差 ${Math.floor(difference) + 1}秒`)
    }
  };

  // 射擊
  const { fire } = useShoot(plane);
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

  const updateSpeed = () => {
    if (currentKey === right.code) plane.vx = computedMoveSpeed();
    if (currentKey === left.code) plane.vx = -computedMoveSpeed();
    if (currentKey === up.code) plane.vy = -computedMoveSpeed();
    if (currentKey === down.code) plane.vy = computedMoveSpeed();
  };
  speedUp.press = () => {
    if (status.energy < 1) return;
    status.buff.push({ type: 'speed', value: 5, id: 'shiftSpeedup' })
    status.isTriggerSpeedup = true;
    updateSpeed()
  }
  speedUp.release = () => {
    // console.log('speedUp release')
    const target = status.buff.findIndex(i => i.id === 'shiftSpeedup')
    if (target !== -1) {
      status.buff.splice(target, 1)
      status.isTriggerSpeedup = false;
      updateSpeed()
    }
  }

  // const { fire } = useShoot(plane);
  // const autoFire = () => {
  //   if (plane) {
  //     fire()
  //     setTimeout(autoFire, 300);
  //   }
  // }
  // autoFire()

  let speedupElapsed = 0;
  const animate = ({ deltaTime }) => {
    plane.x += plane.vx;
    plane.y += plane.vy;
    useContain(plane, {
      x: plane.width / 2,
      y: plane.height / 2,
      width: app.screen.width + plane.width / 2,
      height: app.screen.height + plane.height / 2
    });
    // console.log("explorer位置" + plane.x + "," + plane.y)

    if (status.isTriggerSpeedup) {
      const tickRate = 12; // 每秒扣幾次 energy
      const deltaSec = deltaTime / 60;
      speedupElapsed += deltaSec;

      if (speedupElapsed >= 1 / tickRate) {
        // 檢查當前 energy 是否足夠
        if (status.energy > 0) {
          status.setEnergy(-1);
          speedupElapsed -= 1 / tickRate;
        } else {
          speedUp.release()
        }
      }
    } else {
      speedupElapsed = 0; // 停止時重置累積時間
    }

    // 能量條
    const { energy } = status;
    const ratio = energy / 100;
    const maxWidth = 100
    const startX = plane.x - maxWidth / 2
    const startY = plane.y + plane.height / 2
    energyBar.clear()
    energyBar.rect(startX, startY, maxWidth, 5);
    energyBar.fill(0x000);
    energyBar.rect(startX, startY, maxWidth * ratio, 5);
    energyBar.fill(0x00ccff);

    const { enemies, gameOver } = gameStatus
    for (let j = enemies.length - 1; j >= 0; j--) {
      const enemy = enemies[j];
      if (useHitTestRectangle(enemy.body, plane)) {
        app.ticker.remove(animate);
        status.rotateSpeed = 0;
        gameOver()
        
        break;
      }
    }
  }

  app.stage.addChild(plane);

  // render
  app.ticker.add(animate);

  plane.remove = () => {
    app.ticker.remove(animate);
    Object.values(keyboardEvents).forEach(k => {
      if (typeof k.unbind === 'function') {
        k.unbind()
      }
    });
    plane.destroy()
    plane = null
  }
  return plane;
}