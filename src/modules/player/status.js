import useBonus from '../bonus/useBonus'
import { initSkillCooldown } from '../dashboard';
import EventEmitter from '../../composables/useEventEmitter'

const playerEmitter  = new EventEmitter()

const status = {
  moveSpeed: 5,
  isTriggerSpeedup: false,
  rotateSpeed: 1,
  point: 0,
  killCount: 0,
  activeSkillId: null,
  skills: [],
  buff: [],
  debuff: [],
  fireInterval: 0.4,
  weaponLevel: 1,
  energy: 100,
  setEnergy: (val) => {
    const { energy } = status
    if (energy + val < 0) return
    status.energy = Math.min(energy + val, 100)
  },
  setSkills: (targetSkill) => {
    const addSkill = {
      ...targetSkill,
      lastExecute: null,
    }
    addSkill.dashboard = initSkillCooldown(addSkill) // 安裝技能dashboard
    status.skills.push(addSkill);

    status.activeSkillId = targetSkill.id
  },
  setPoint: (point) => {
    status.point += point
    if (status.point === 1) {
      const { createBonus } = useBonus()
      createBonus()
    }
  },
  setKillCount: () => {
    status.killCount ++
  },
  setWeaponLevel: () => {
    status.weaponLevel ++
  },
  addBuff: (type, val) => {
    if (type !== 'buff' && type !== 'debuff') return;
    status[type].push(val)
    playerEmitter.emit(`${type}Changed`, [...status[type]]);
  },
  removeBuff: (type, val) => {
    if (type !== 'buff' && type !== 'debuff') return;
    status[type] = status[type].filter(i => i !== val)
    playerEmitter.emit(`${type}Changed`, [...status[type]]);
  },
}

const getPlayerStatus = () => status

const resetPlayerStatus = () => {
  while (status.skills.length > 0) {
    const skill = status.skills.pop();
    skill.dashboard.remove();
  }
  status.moveSpeed = 5;
  status.isTriggerSpeedup = false;
  status.rotateSpeed = 1;
  status.point = 0;
  status.killCount = 0;
  status.activeSkillId = null;
  status.buff = [];
  status.debuff = [];
  status.energy = 100;
  status.fireInterval = 0.4;
  status.weaponLevel = 1;
}

export {
  getPlayerStatus,
  resetPlayerStatus,
  playerEmitter,
};