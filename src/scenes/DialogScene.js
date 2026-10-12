import Phaser from 'phaser';
import { style } from '../ui.js';

export class DialogScene extends Phaser.Scene {
  constructor() {
    super('Dialog');
  }

  init(data) {
    this.lines = data.lines || [];
    this.onClose = data.onClose;
    this.index = 0;
  }

  create() {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height - 40, width - 16, 76, 0x000000, 0.9)
      .setStrokeStyle(2, 0xffffff)
      .setScrollFactor(0);

    this.text = this.add.text(20, height - 72, '', style(16, '#ffffff', {
      wordWrap: { width: width - 40 },
      lineSpacing: 4
    }));

    this.add.text(width - 20, height - 22, '>', style(8, '#f0c040'));

    this.showLine();
    this.input.on('pointerdown', () => this.next());
    this.input.keyboard?.on('keydown-SPACE', () => this.next());
    this.input.keyboard?.on('keydown-ENTER', () => this.next());
  }

  showLine() {
    this.text.setText(this.lines[this.index] || '');
  }

  next() {
    this.index++;
    if (this.index >= this.lines.length) {
      if (this.onClose) this.onClose();
      return;
    }
    this.showLine();
  }
}
