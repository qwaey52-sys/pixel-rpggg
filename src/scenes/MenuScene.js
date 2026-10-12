import Phaser from 'phaser';
import { audio } from '../audio/AudioManager.js';
import { save } from '../save.js';
import { style } from '../ui.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#101020');

    this.add.text(width / 2, 60, 'PIXEL RPG', style(24, '#f0c040')).setOrigin(0.5);

    const hasSave = !!localStorage.getItem('pixel-rpg-save-v1');
    const items = [
      { label: hasSave ? 'Продолжить' : 'Начать', action: () => this.startGame(hasSave) },
      { label: 'Новая игра', action: () => this.startGame(false) }
    ];

    items.forEach((item, i) => {
      this.add.text(width / 2, 120 + i * 30, item.label, style(16))
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', item.action);
    });

    this.add.text(width / 2, height - 20, 'Тап по экрану, чтобы включить звук', style(8, '#888888'))
      .setOrigin(0.5);

    audio.play('town');
  }

  startGame(continueSave) {
    if (!continueSave) save.clear();
    this.scene.start('Overworld');
  }
}
