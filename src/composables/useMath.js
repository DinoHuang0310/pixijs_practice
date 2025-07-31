// 運算相關
const methods = {
  randomInt: (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

export default methods