import { Container, Graphics, Text, TextStyle, FillGradient } from 'pixi.js';
import { getApp, gameStart } from '../game'

const startScene = () => {
  const app = getApp()

  let sceneWrapper = new Container();

  const style = new TextStyle({
    fontFamily: 'Arial',
    fontSize: 48,
    fontStyle: 'italic',
    fontWeight: 'bold',
    fill: new FillGradient({
      type: 'linear',
      colorStops: [
        { offset: 0, color: 'white' },
        { offset: 0.8, color: 'white' },
        { offset: 1, color: 'yellow' },
      ],
    }),
    stroke: { color: '#4a1850', width: 5, join: 'round' },
    dropShadow: {
      color: '#000000',
      blur: 4,
      angle: Math.PI / 6,
      distance: 6,
    },
    wordWrap: true,
    wordWrapWidth: 440,
  })

  const centerX = app.screen.width / 2
  const centerY = app.screen.height / 2

  const button = new Text({
    text: '- START -',
    style,
  });
  button.x = centerX
  button.y = centerY
  button.anchor.set(0.5)
  button.eventMode = 'static'
  button.cursor = 'pointer'

  const hoverStyle = style.clone();
  hoverStyle.fill = 'yellow';
  button.on('pointerover', () => {
    button.style = hoverStyle;
  });
  button.on('pointerout', () => {
    button.style = style;
  });
  button.on('pointerdown', () => {
    sceneWrapper.destroy({ children: true })
    sceneWrapper = null;
    gameStart()
  });

  const bg = new Graphics()
    .rect(0, 0, app.screen.width, app.screen.height)
    .fill({ color: 'black', alpha: 0.7 });

  sceneWrapper.addChild(bg)
  sceneWrapper.addChild(button)

  app.stage.addChild(sceneWrapper);

}

export default startScene