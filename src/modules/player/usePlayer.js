import { AnimatedSprite, Graphics } from 'pixi.js';

import { getApp, getGameStatus } from '../../game';
import useAnimation from '../animations/useAnimation'
import assetsLoader from '../../assetsLoader'
import useKeyboard from '../../composables/useKeyboard'
import useContain from '../../composables/useContain'
import useBullet from '../useBullet'
import useHitTestRectangle from '../../composables/useHitTestRectangle'
import { getScaleByPercentage, toRealSpeed } from '../../composables/useMath'
import { getPlayerStatus, resetPlayerStatus, playerEmitter } from './status'

let plane = null;

const getPlayer = () => {
  if (!plane) console.warn('player not initialized. Did you forget to call createPlayer()?')
  return plane
}

const createPlayer = () => {
  const app = getApp();
  const gameStatus = getGameStatus()

  plane = new AnimatedSprite(assetsLoader.planeFrames);

  const status = getPlayerStatus()
  plane.status = status // 狀態檔已獨立, 暫時還是掛載在player實體上, 除非後續要開放player2

  plane.scale.set(getScaleByPercentage(plane, 0.08)); // 等比縮放, 不變形
  // console.log(plane.width, plane.height)

  plane.x = app.screen.width / 2;
  plane.y = app.screen.height * 0.85;
  plane.vx = 0;
  plane.vy = 0;
  plane.anchor.set(0.5);
  // plane.interactive = true; // 允許點擊
  plane.loop = true;

  let energyBar = new Graphics()
  app.stage.addChild(energyBar);

  const maxFrameRight = 8;
  const maxFrameLeft = 22;

  // Capture the keyboard arrow keys
  const keyboardEvents = {
    left: useKeyboard(65),
    up: useKeyboard(87),
    right: useKeyboard(68),
    down: useKeyboard(83),
    skill: useKeyboard(81),
    // shot: useKeyboard(32),
    speedUp: useKeyboard(16),
  }
  const computedMoveSpeed = () => {
    const { buff, debuff, moveSpeed } = status;
    const v = [...buff, ...debuff]
      .filter(i => i.type === 'speed')
      .reduce((sum, i) => sum + (i.value || 0), moveSpeed);
    return toRealSpeed(Math.max(v, 1))
  }
  const setVX = () => {
    if (gameStatus.isPause) return;

    const finalSpeed = computedMoveSpeed();
    const { active: leftActive } = left;
    const { active: rightActive } = right;
    let newVX = 0;
    if (leftActive) newVX -= finalSpeed;
    if (rightActive) newVX += finalSpeed;
    
    const { currentFrame } = plane;
    if (newVX === 0 && currentFrame !== 0) {
      plane.stop();
      plane.animationSpeed = currentFrame >= 22 ? status.rotateSpeed : status.rotateSpeed * -1;
      plane.gotoAndPlay(currentFrame);
    } else if (newVX > 0 && currentFrame < maxFrameRight) {
      plane.stop();
      plane.animationSpeed = status.rotateSpeed;
      plane.gotoAndPlay(currentFrame);
    } else if (newVX < 0 && currentFrame < maxFrameLeft) {
      plane.stop();
      plane.animationSpeed = status.rotateSpeed * -1;
      plane.gotoAndPlay(currentFrame);
    }
    plane.vx = newVX
  }
  const setVY = () => {
    if (gameStatus.isPause) return;

    const finalSpeed = computedMoveSpeed()
    const { active: upActive } = up
    const { active: downActive } = down
    let newVY = 0
    if (upActive) newVY -= finalSpeed
    if (downActive) newVY += finalSpeed
    plane.vy = newVY
  }

  playerEmitter.on('buffChanged', (buffList) => {
    setVX();
    setVY();
  });

  playerEmitter.on('debuffChanged', (buffList) => {
    console.log(status.debuff)
    setVX();
    setVY();
  });
  
  const {left, up, right, down, skill, shot, speedUp} = keyboardEvents
  left.press = function() {
    left.active = true;
    setVX()
  };
  left.release = function() {
    left.active = false;
    setVX()
  };

  up.press = function() {
    up.active = true;
    setVY()
  };
  up.release = function() {
    up.active = false;
    setVY()
  };

  right.press = function() {
    right.active = true;
    setVX()
  };
  right.release = function() {
    right.active = false;
    setVX()
  };

  down.press = function() {
    down.active = true;
    setVY()
  };
  down.release = function() {
    down.active = false;
    setVY()
  };

  skill.press = function() {
    if (!status.skills.length) {
      console.log('no skill')
      return;
    }

    const activeSkill = status.skills.find(i => i.id === status.activeSkillId)

    const { cost } = activeSkill
    if (status.energy < cost) return;
    
    const { lastExecute, cooldown, dashboard, execute } = activeSkill
    const now = gameStatus.gameTimer
    if (!lastExecute || now - lastExecute > cooldown) {
      status.setEnergy(cost * -1)
      activeSkill.lastExecute = now // 記錄施放時間
      dashboard.start() // 觸發dashboard冷卻動畫
      execute(plane);
    } else {
      // const difference = Math.abs(cooldown - (now - lastExecute))
      // console.warn(`技能冷卻中, 還差 ${Math.floor(difference) + 1}秒`)
    }
  };

  // 射擊
  // const { fire } = useBullet(plane);
  // shot.press = () => {
  //   const { energy, shootCost, setEnergy } = status
  //   if (gameStatus.isPause) return;
  //   if (energy < shootCost) return

  //   setEnergy(shootCost * -1)
  //   fire()
  // }
  
  // 控制播放方向和終止幀
  plane.onFrameChange = (frame) => {
    if (left.isDown && frame === maxFrameLeft) {
      plane.stop();
      return;
    }
    if (right.active && frame === maxFrameRight) {
      plane.stop();
      return;
    }
    if (left.isDown && right.active && frame === 0) {
      plane.stop();
      return;
    }
    if (!left.isDown && !right.active && frame === 0) {
      plane.stop();
      return;
    }
  };

  speedUp.press = () => {
    if (status.energy < 1) return;
    status.buff.push({ type: 'speed', value: 5, id: 'shiftSpeedup' })
    status.isTriggerSpeedup = true;
    setVX()
    setVY()
  }
  speedUp.release = () => {
    const target = status.buff.findIndex(i => i.id === 'shiftSpeedup')
    if (target !== -1) {
      status.buff.splice(target, 1)
      status.isTriggerSpeedup = false;
      setVX()
      setVY()
    }
  }

  // 自動射擊
  const { fire } = useBullet(plane);
  let customElapsed = 0;

  let speedupElapsed = 0;
  const animate = ({ deltaTime }) => {
    if (gameStatus.isPause) {
      plane.vx = 0;
      plane.vy = 0;
      plane.stop();
      return
    };

    plane.x += plane.vx;
    plane.y += plane.vy;
    useContain(plane, {
      x: plane.width / 2,
      y: plane.height / 2,
      width: app.screen.width + plane.width / 2,
      height: app.screen.height + plane.height / 2
    });
    // console.log("explorer位置" + plane.x + "," + plane.y)

    const { energy, fireInterval } = status;
    const deltaSec = deltaTime / 60;

    customElapsed += deltaSec;
    if (customElapsed >= fireInterval) {
      fire();
      customElapsed -= fireInterval; // 減去間隔，避免累積誤差
    }
  
    // console.log(deltaSec)
    if (status.isTriggerSpeedup) {
      const tickRate = 12; // 每秒扣幾次 energy
      speedupElapsed += deltaSec;

      if (speedupElapsed >= 1 / tickRate) {
        // 檢查當前 energy 是否足夠
        if (energy > 0) {
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
    const ratio = energy / 100;
    const maxWidth = 100
    const startX = plane.x - maxWidth / 2
    const startY = plane.y + plane.height / 2
    energyBar.clear()
    energyBar.rect(startX, startY, maxWidth, 5);
    energyBar.fill(0x000);
    energyBar.rect(startX, startY, maxWidth * ratio, 5);
    energyBar.fill(0x00ccff);

    const { enemies, endGame } = gameStatus
    for (let j = enemies.length - 1; j >= 0; j--) {
      const enemy = enemies[j];
      if (useHitTestRectangle(enemy.body, plane)) {
        app.ticker.remove(animate);
        status.rotateSpeed = 0;

        const { explosion } = useAnimation()
        const { x, y, width, height } = plane.getBounds()
        explosion({x: x + width / 2, y: y + height / 2})
        
        plane.visible = false;
        energyBar.visible = false;

        endGame()
        break;
      }
    }
  }

  app.stage.addChild(plane);

  // render
  app.ticker.add(animate);

  plane.remove = () => {
    // app.ticker.remove(animate);
    Object.values(keyboardEvents).forEach(k => {
      if (typeof k.unbind === 'function') {
        k.unbind()
      }
    });

    resetPlayerStatus()

    plane.destroy({ children: true, texture: false, baseTexture: false })
    plane = null

    energyBar.destroy()
    energyBar = null
  }
}

export {
  getPlayer,
  createPlayer,
};