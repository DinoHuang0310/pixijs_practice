import game from '../game'
const { app } = game()

const useScene = {
  
  changeScene: (scene) => {
    app.stage.addChild(scene);
  },

}

export default useScene