import { Container, Graphics, Text, TextStyle, FillGradient } from 'pixi.js';
import { getApp, getGameStatus, gameStart } from '../game'

const gameoverScene = (playerStatus) => {
  const app = getApp()
  const { point, killCount } = playerStatus
  const gameStatus = getGameStatus()
  const { gameTimer } = gameStatus;
  
  let sceneWrapper = new Container();

  const style = new TextStyle({
    fontFamily: 'Arial',
    fontSize: 36,
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

  const scoreboard = new Text({
    text: `🏆Total points: ${point}\n⏱️Total time: ${Math.floor(gameTimer)} sec\n💀Total kills: ${killCount}`,
    style,
  });
  scoreboard.x = centerX
  scoreboard.y = centerY
  scoreboard.anchor.set(0.5)

  const btnStyle = style.clone();
  btnStyle.fontSize = 48;
  const button = new Text({
    text: '- RESTART -',
    style: btnStyle,
  });
  button.x = centerX
  button.y = centerY + scoreboard.height
  button.anchor.set(0.5)
  button.eventMode = 'static'
  button.cursor = 'pointer'

  const hoverStyle = btnStyle.clone();
  hoverStyle.fill = 'yellow';
  button.on('pointerover', () => {
    button.style = hoverStyle;
  });
  button.on('pointerout', () => {
    button.style = btnStyle;
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
  sceneWrapper.addChild(scoreboard)
  sceneWrapper.addChild(button)

  app.stage.addChild(sceneWrapper);
}

export default gameoverScene