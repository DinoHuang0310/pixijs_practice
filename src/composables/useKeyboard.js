// 指定鍵盤事件綁定
export default (keyCode) => {
  const key = {
    code: keyCode,
    isDown: false,
    isUp: true,
    press: undefined,
    release: undefined,
    unbind: () => {
      window.removeEventListener("keydown", key.downHandler);
      window.removeEventListener("keyup", key.upHandler);
      // Reset handlers
      key.downHandler = null;
      key.upHandler = null;
    }
  };

  // The `downHandler`
  key.downHandler = function(event) {
    if (event.keyCode === key.code) {
      if (key.isUp && key.press) key.press();
      key.isDown = true;
      key.isUp = false;
      // console.log("explorer位置" + anim.x + "," + anim.y)
    }
    event.preventDefault();
  };

  // The `upHandler`
  key.upHandler = function(event) {
    if (event.keyCode === key.code) {
      if (key.isDown && key.release) key.release();
      key.isDown = false;
      key.isUp = true;
    }
    event.preventDefault();
  };

  // Attach event listeners
  window.addEventListener("keydown", key.downHandler);
  window.addEventListener("keyup", key.upHandler);
  return key;
}