import Phaser from 'phaser';
import { audio } from '../audio/AudioManager.js';
import { save } from '../save.js';

const ENDINGS = {
  good: {
    title: 'Рассвет',
    text: 'Тени отступили. Лес снова дышит, а ты знаешь, что этот путь ещё не закончен.',
    music: 'ending_good'
  },
  bad: {
    title: 'Тишина',
    text: 'Ты падаешь, и лес смыкается над тобой. Иногда проигрыш тоже что-то объясняет.',
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

    this.add.text(width / 2, height / 2 - 40, e.title, {
      fontFamily: 'monospace', fontSize: '26px', color: '#f0c040'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2, e.text, {
      fontFamily: 'monospace', fontSize: '10px', color: '#ffffff',
      align: 'center', wordWrap: { width: width - 60 }
    }).setOrigin(0.5);

    this.add.text(width / 2, height - 24, 'Тап, чтобы вернуться в меню', {
      fontFamily: 'monospace', fontSize: '10px', color: '#888888'
    }).setOrigin(0.5);

    audio.play(e.music);
    this.input.once('pointerdown', () => {
      save.clear();
      this.scene.start('Menu');
    });
  }
}
