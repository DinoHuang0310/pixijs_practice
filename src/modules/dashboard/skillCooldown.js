import { Text, TextStyle, FillGradient, Container, Graphics, Point } from 'pixi.js';

import { getApp, getGameStatus } from '../../game'

const skillCooldown = (skill) => {
  const app = getApp()
  const gameStatus = getGameStatus()

  const size = 100;
  const arcRadius = 15;
  const { cooldown } = skill

  const skillContainer = new Container();

  // icon本體
  const skillIcon = skill.icon();
  skillIcon.width = size;
  skillIcon.height = size;

  const iconMask = new Graphics();
  iconMask.roundRect(0, 0, size, size, arcRadius).fill({ color: 0x0 });
  skillIcon.mask = iconMask

  // 上方面板
  const cooldownBg = new Graphics();
  cooldownBg.roundRect(0, 0, size, size, arcRadius);
  cooldownBg.fill({ color: 'black', alpha: 0.7 })
  cooldownBg.width = size;
  cooldownBg.height = size;
  // 冷卻遮罩
  const mask = new Graphics();
  mask.position.set(size / 2, size / 2);
  cooldownBg.mask = mask;

  // 文字
  const timerText = new Text({
    text: `Q`,
    style: new TextStyle({
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
    }),
  });
  timerText.x = size - (timerText.width / 2);
  timerText.y = timerText.height / 2;
  timerText.anchor.set(0.5)

  skillContainer.addChild(skillIcon);
  skillContainer.addChild(iconMask);
  skillContainer.addChild(cooldownBg);
  skillContainer.addChild(mask);
  skillContainer.addChild(timerText);

  skillContainer.position = new Point(10, app.screen.height - 110);
  app.stage.addChild(skillContainer);

  function remove() {
    app.ticker.remove(animate);
    skillContainer.destroy({ children: true })
  }

  let phase = 0;
  const animate = () => {
    const { lastExecute } = skill
    const now = gameStatus.gameTimer
    const elapsed = now - lastExecute; // 經過秒數
    const difference = Math.abs(cooldown - (now - lastExecute))

    // 印出剩餘時間
    timerText.text = Math.floor(difference) + 1

    // 每秒前進 2π，因此每幀前進量是：
    phase = (elapsed / cooldown) * Math.PI * 2;

    // 計算目標點
    const x = Math.cos(phase - Math.PI / 2) * size;
    const y = Math.sin(phase - Math.PI / 2) * size;

    const segments = [
      [-size / 2, -size / 2, size / 2, -size / 2], // top segment
      [size / 2, -size / 2, size / 2, size / 2], // right
      [-size / 2, size / 2, size / 2, size / 2], // bottom
      [-size / 2, -size / 2, -size / 2, size / 2], // left
    ];

    // 求相交的線段
    let intersection = null;
    let winding = 0;

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const hit = intersect(0, 0, x, y, segment[0], segment[1], segment[2], segment[3]);

      if (hit) {
        intersection = hit;
        if (i === 0) winding = hit.x > 0 ? 0 : 4;
        else winding = i;
        break;
      }
    }

    const corners = [
      size / 2,
      -size / 2, // Top right
      size / 2,
      size / 2, // Bottom right
      -size / 2,
      size / 2, // Bottom left
      -size / 2,
      -size / 2, // Top left,
      0,
      -size / 2, // End point
    ];

    // Redraw mask
    mask
      .clear()
      .moveTo(0, -size / 2)
      .lineTo(0, 0)
      .lineTo(intersection.x, intersection.y);
    
    // console.log(intersection.x, intersection.y)

    // fill the corners
    for (let i = winding; i < corners.length / 2; i++) {
      mask.lineTo(corners[i * 2], corners[i * 2 + 1]);
    }

    mask.fill({ color: 0xff0000 });

    if (elapsed >= cooldown) {
      // 停止動畫
      app.ticker.remove(animate);
      mask.clear()
      timerText.text = 'Q'
      phase = 0
      console.log("冷卻完成！");
    }
  
  };

  function intersect(x1, y1, x2, y2, x3, y3, x4, y4) {
    // Check if none of the lines are of length 0
    if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
      return false;
    }

    const denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);

    // Lines are parallel
    if (denominator === 0) {
      return false;
    }

    const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
    const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;

    // is the intersection along the segments
    if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
      return false;
    }

    // Return a object with the x and y coordinates of the intersection
    const x = x1 + ua * (x2 - x1);
    const y = y1 + ua * (y2 - y1);

    return { x, y };
  }

  return {
    start: () => app.ticker.add(animate),
    remove,
  }
}

export default skillCooldown;