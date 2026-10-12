import Phaser from 'phaser';
import { makeSprites } from '../gfx/sprites.js';
import { audio } from '../audio/AudioManager.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    // Внешние треки подхватываются, если файлы есть в assets/music.
    // Если файла нет, AudioManager использует встроенную мелодию.
    this.load.audio('town', 'assets/music/town.ogg');
    this.load.audio('battle', 'assets/music/battle.ogg');
    this.load.audio('ending_good', 'assets/music/ending_good.ogg');
    this.load.audio('ending_bad', 'assets/music/ending_bad.ogg');
    this.load.on('loaderror', (file) => {
      console.warn('Нет файла музыки, будет использована встроенная мелодия:', file.key);
    });
  }

  create() {
    makeSprites(this);
    audio.init(this);
    this.scene.start('Menu');
  }
}
