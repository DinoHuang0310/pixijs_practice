import useBonus from '../bonus/useBonus'
import { initSkillCooldown } from '../dashboard';

const status = {
  moveSpeed: 5,
  isTriggerSpeedup: false,
  rotateSpeed: 1,
  point: 0,
  activeSkillId: null,
  skills: [],
  buff: [],
  debuff: [],
  shootCost: 5,
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
}

const getPlayerStatus = () => status

export {
  getPlayerStatus,
};