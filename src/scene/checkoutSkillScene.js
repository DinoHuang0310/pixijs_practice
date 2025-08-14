import { Container, Graphics } from 'pixi.js';
import { getApp, getGameStatus } from '../game'

const checkoutSkillScene = (skill) => {
  const app = getApp()
  const gameStatus = getGameStatus()

  const { isPause, togglePause } = gameStatus
  if (!isPause) togglePause();
  
  const container = new Container();
  const bg = new Graphics()
    .rect(0, 0, app.screen.width, app.screen.height)
    .fill({ color: 'black', alpha: 0.7 });
  
  const scale = 0.08;
  const targetWidth = app.screen.width * scale;
  const icon = skill.icon()
  icon.scale.set(targetWidth / icon.width);
  icon.x = app.screen.width / 2
  icon.y = app.screen.height / 2
  icon.anchor.set(0.5)

  container.addChild(bg)
  container.addChild(icon)
  app.stage.addChild(container);

}

export default checkoutSkillScene