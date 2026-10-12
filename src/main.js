import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { DialogScene } from './scenes/DialogScene.js';
import { OverworldScene } from './scenes/OverworldScene.js';
import { RhythmBattleScene } from './scenes/RhythmBattleScene.js';
import { EndingScene } from './scenes/EndingScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#000000',
  pixelArt: true,
  antialias: false,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 320,
    height: 240
  },
  physics: {
    default: 'arcade',
    arcade: { debug: false }
  },
  scene: [BootScene, MenuScene, OverworldScene, DialogScene, RhythmBattleScene, EndingScene]
};

new Phaser.Game(config);
