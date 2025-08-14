import './style.css'
import { initGame } from './game'

;(async function() {
  await initGame()
})()

// window.addEventListener("keydown", function(e) {
//   console.log(e.keyCode)
// });