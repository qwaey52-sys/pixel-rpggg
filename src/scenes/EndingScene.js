import Phaser from 'phaser';
import { audio } from '../audio/AudioManager.js';
import { save } from '../save.js';
import { style } from '../ui.js';

const ENDINGS = {
  good: {
    title: 'РАССВЕТ',
    text: 'Тени отступили. Лес снова дышит, а путь ещё не закончен.',
    music: 'ending_good'
  },
  bad: {
    title: 'ТИШИНА',
    text: 'Лес смыкается над тобой. Иногда проигрыш тоже что-то объясняет.',
    music: 'ending_bad'
  }
};

export class EndingScene extends Phaser.Scene {
  constructor() {
    super('Ending');
  }

  init(data) {
    this.type = data.type === 'good' ? 'good' : 'bad';
  }

  create() {
    const { width, height } = this.scale;
    const e = ENDINGS[this.type];
    this.cameras.main.setBackgroundColor('#000000');

    this.add.text(width / 2, 70, e.title, style(24, '#f0c040')).setOrigin(0.5);
    this.add.text(width / 2, 120, e.text, style(12, '#ffffff', {
      align: 'center',
      wordWrap: { width: width - 60 },
      lineSpacing: 4
    })).setOrigin(0.5, 0);

    this.add.text(width / 2, height - 24, 'Тап, чтобы вернуться в меню', style(8, '#888888'))
      .setOrigin(0.5);

    audio.play(e.music);
    this.input.once('pointerdown', () => {
      save.clear();
      this.scene.start('Menu');
    });
  }
}
