import Phaser from 'phaser';
import { audio } from '../audio/AudioManager.js';
import { save } from '../save.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#101020');

    this.add.text(width / 2, 40, 'PIXEL RPG', {
      fontFamily: 'monospace', fontSize: '28px', color: '#f0c040'
    }).setOrigin(0.5);

    const hasSave = !!localStorage.getItem('pixel-rpg-save-v1');
    const items = [
      { label: hasSave ? 'Продолжить' : 'Начать', action: () => this.startGame(hasSave) },
      { label: 'Новая игра', action: () => this.startGame(false) }
    ];

    items.forEach((item, i) => {
      const t = this.add.text(width / 2, 90 + i * 28, item.label, {
        fontFamily: 'monospace', fontSize: '18px', color: '#ffffff'
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      t.on('pointerdown', item.action);
    });

    this.add.text(width / 2, height - 14, 'Тап по экрану, чтобы начать звук', {
      fontFamily: 'monospace', fontSize: '10px', color: '#888888'
    }).setOrigin(0.5);

    audio.play('town');
  }

  startGame(continueSave) {
    if (!continueSave) save.clear();
    this.scene.start('Overworld');
  }
}
