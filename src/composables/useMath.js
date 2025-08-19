// 運算相關
import { getApp } from '../game'

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getScaleByPercentage(model, scale) {
  const app = getApp()
  const wrapperWidth = app ? app.screen.width : window.innerWidth
  const targetWidth = wrapperWidth * scale;
  return targetWidth / model.width
}

export function toRealSpeed(val) {
  const app = getApp()
  const deltaSec = app.ticker.deltaTime / 60
  return val * (app.screen.height * 0.06) * deltaSec
}
 