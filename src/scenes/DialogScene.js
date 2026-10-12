import Phaser from 'phaser';

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
    this.box = this.add.rectangle(width / 2, height - 36, width - 16, 56, 0x000000, 0.85)
      .setStrokeStyle(1, 0xffffff);
    this.text = this.add.text(16, height - 60, '', {
      fontFamily: 'monospace', fontSize: '10px', color: '#ffffff', wordWrap: { width: width - 32 }
    });
    this.add.text(width - 20, height - 16, '▼', { fontFamily: 'monospace', fontSize: '10px', color: '#f0c040' });

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
