// 設定移動邊界
export default (sprite, container, keepInBounds = true) => {
  
  let collision = undefined;

  //Left
  if (sprite.x < container.x) {
    if (keepInBounds) sprite.x = container.x;
    collision = "left";
    // console.log("touch left")
  }

  //Top
  if (sprite.y < container.y) {
    if (keepInBounds) sprite.y = container.y;
    collision = "top";
    // console.log("touch top")
  }

  //Right
  if (sprite.x + sprite.width > container.width) {
    if (keepInBounds) sprite.x = container.width - sprite.width;
    collision = "right";
    // console.log("touch right")
  }

  //Bottom
  if (sprite.y + sprite.height > container.height) {
    if (keepInBounds) sprite.y = container.height - sprite.height;
    collision = "bottom";
    // console.log("touch bottom")
  }

  //Return the `collision` value
  return collision;
}