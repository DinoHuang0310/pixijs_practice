import { Howl } from 'howler';

const sounds = {};

const loadSound = (name, src, volume = 1.0) => {
  return new Promise((resolve, reject) => {
    const sound = new Howl({
      src: [new URL(src, import.meta.url).href],
      volume,
      onload: () => resolve(),
      onloaderror: (id, error) => reject(error),
    });
    sounds[name] = sound;
  });
};

const useSound = async () => {
  // 在這裡列出你要預載的所有音效
  await Promise.all([
    loadSound('shoot', '../assets/sound/mixkit-short-laser-gun-shot-1670.wav', 0.5),
    loadSound('thunder', '../assets/sound/mixkit-screechy-electified-item-3213.wav', 0.8),
    loadSound('sonicBoom', '../assets/sound/mixkit-arcade-game-explosion-2759.wav', 0.8),
    loadSound('getPoint', '../assets/sound/mixkit-player-jumping-in-a-video-game-2043.wav', 0.5),
  ]);
};

const playSound = (name) => {
  if (sounds[name]) {
    sounds[name].play();
  } else {
    console.warn(`Sound "${name}" not loaded`);
  }
};

export default {
  play: playSound,
  preload: useSound, // 將 preload function 暴露出來
};