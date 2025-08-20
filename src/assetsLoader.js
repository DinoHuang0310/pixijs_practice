import { Assets, Texture } from 'pixi.js';
let isLoaded = false;

// 儲存需要載入的文件
const loader = {
  alienTextures: undefined,
  planeFrames: [],
  explosionTextures: [],
  preload: async () => {
    if (isLoaded) return;
    console.log('doing preload')
    // 玩家
    await Assets.load('./texture/fighter.json');
    // Create an array of textures from the sprite sheet
    for (let i = 0; i < 30; i++) {
      const val = i < 10 ? `0${i}` : i;
      loader.planeFrames.push(Texture.from(`rollSequence00${val}.png`));
    }

    // 敵人
    loader.alienTextures = [
      await Assets.load(new URL('./assets/eggHead_none.png', import.meta.url).href),
      // await Assets.load(new URL('./assets/eggHead.png', import.meta.url).href),
      // await Assets.load(new URL('./assets/flowerTop.png', import.meta.url).href),
      // await Assets.load(new URL('./assets/skully.png', import.meta.url).href),
      // await Assets.load(new URL('./assets/helmlok.png', import.meta.url).href),
      // await Assets.load(new URL('./assets/depth_blur_moby.png', import.meta.url).href),
    ];

    // 獎勵敵人
    await Assets.load(new URL('./assets/bunny.png', import.meta.url).href)
    await Assets.load(new URL('./assets/ammo.png', import.meta.url).href)
    await Assets.load(new URL('./assets/speed.png', import.meta.url).href)

    // 爆炸
    await Assets.load('./texture/mc.json');
    for (let i = 0; i < 26; i++) {
      const texture = Texture.from(`Explosion_Sequence_A ${i + 1}.png`);
      loader.explosionTextures.push(texture);
    }

    // icon
    await Assets.load(new URL('./assets/skills/aoe01.jpg', import.meta.url).href)
    await Assets.load(new URL('./assets/skills/aoe02.jpg', import.meta.url).href)
    
    isLoaded = true;
  }
}

export default loader;