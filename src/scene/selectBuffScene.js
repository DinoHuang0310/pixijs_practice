import { Container, Graphics, Sprite } from 'pixi.js';
import { getApp, getGameStatus } from '../game'
import { getScaleByPercentage } from '../composables/useMath'
import useKeyboard from '../composables/useKeyboard';
import { getPlayer } from '../modules/player/usePlayer'

const selectBuffScene = () => {
  const app = getApp()
  const gameStatus = getGameStatus()
  const { isPause, togglePause } = gameStatus
  if (!isPause) togglePause();

  const { height } = app.screen
  
  let container = new Container();
  const bg = new Graphics()
    .rect(0, 0, app.screen.width, height)
    .fill({ color: 'black', alpha: 0.7 });
  
  const icon = Sprite.from(new URL('../assets/ammo.png', import.meta.url).href)
  icon.scale.set(getScaleByPercentage(icon, 0.08));
  icon.x = (app.screen.width / 2) - icon.width - 10
  icon.y = height / 2
  icon.anchor.set(0.5)

  const icon2 = Sprite.from(new URL('../assets/speed.png', import.meta.url).href)
  icon2.scale.set(getScaleByPercentage(icon2, 0.08));
  icon2.x = (app.screen.width / 2) + icon2.width + 10
  icon2.y = height / 2
  icon2.anchor.set(0.5)

  let active = 0
  const selector = new Graphics()
  updateSelector()

  container.addChild(bg)
  container.addChild(icon)
  container.addChild(icon2)
  container.addChild(selector)
  app.stage.addChild(container);

  const left = useKeyboard(65)
  left.press = function() {
    active = 0
    updateSelector();
  };
  const right = useKeyboard(68)
  right.press = function() {
    active = 1
    updateSelector();
  };
  const confirm = useKeyboard(32)
  confirm.press = function() {
    const { status } = getPlayer()
    container.destroy({ children: true })
    container = null

    left.unbind()
    right.unbind()
    confirm.unbind()
    // todo set buff
    if (active === 1) {
      status.moveSpeed +=3
    } else {
      status.setWeaponLevel()
    }

    togglePause()
  };

  function updateSelector() {
    selector.clear();
    const targetIcon = active === 0 ? icon : icon2;
    selector.rect(targetIcon.x, targetIcon.y, targetIcon.height, targetIcon.height);
    selector.stroke({ width: 3, color: 0xffffff });

    const selectorBounds = selector.getLocalBounds();
    selector.pivot.set(selectorBounds.width / 2, selectorBounds.height / 2);
  }
}

export default selectBuffScene