import { Howl } from 'howler';

const sounds = {};

const loadSound = (name, src, volume = 1.0) => {
  return new Promise((resolve, reject) => {
    const sound = new Howl({
      src: [src],
      volume,
      onload: () => resolve(),
      onloaderror: (id, error) => reject(error),
    });
    sounds[name] = sound;
  });
};

const preload = async () => {
  await Promise.all([
    loadSound('shoot', './sound/mixkit-short-laser-gun-shot-1670.wav', 0.5),
    loadSound('thunder', './sound/mixkit-screechy-electified-item-3213.wav', 0.8),
    loadSound('sonicBoom', './sound/mixkit-arcade-game-explosion-2759.wav', 0.8),
    loadSound('getPoint', './sound/mixkit-player-jumping-in-a-video-game-2043.wav', 0.5),
    loadSound('gameover', './sound/mixkit-arcade-game-over-3068.wav', 0.8),
    loadSound('gamestart', './sound/mixkit-winning-a-coin-video-game-2069.wav', 0.8),
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
  preload,
};