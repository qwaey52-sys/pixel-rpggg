import Phaser from 'phaser';
import { audio } from '../audio/AudioManager.js';
import { save } from '../save.js';

// Механика: ноты падают по четырём дорожкам.
// Нажимай соответствующую стрелку (или кнопку на экране), когда нота
// попадает в зону удара. Точное попадание бьёт сильнее, промах бьёт по тебе.

const LANES = 4;
const LANE_KEYS = ['LEFT', 'DOWN', 'UP', 'RIGHT'];
const HIT_Y = 150;
const HIT_WINDOW = 12;
const NOTE_SPEED = 90;

export class RhythmBattleScene extends Phaser.Scene {
  constructor() {
    super('RhythmBattle');
  }

  init(data) {
    this.onWin = data.onWin;
    this.onLose = data.onLose;
  }

  create() {
    const { width } = this.scale;
    this.cameras.main.setBackgroundColor('#140a1e');
    this.state = save.load();

    this.enemyHp = 30;
    this.enemyMaxHp = 30;
    this.playerHp = this.state.hp;
    this.elapsed = 0;
    this.nextSpawn = 0;
    this.notes = [];
    this.finished = false;

    this.laneX = (i) => width / 2 - 60 + i * 40;
    this.add.text(width / 2, 14, 'СТРАЖ ТЕНЕЙ', { fontFamily: 'monospace', fontSize: '12px', color: '#f0c040' }).setOrigin(0.5);
    this.enemySprite = this.add.sprite(width / 2, 50, 'enemy').setScale(3);

    this.hpText = this.add.text(12, 26, '', { fontFamily: 'monospace', fontSize: '9px', color: '#ffffff' });

    this.hitZone = [];
    for (let i = 0; i < LANES; i++) {
      this.add.rectangle(this.laneX(i), 100, 32, 110, 0x2a2040, 0.6);
      this.hitZone.push(this.add.rectangle(this.laneX(i), HIT_Y, 34, 10, 0xf0c040, 0.8));
    }

    this.keys = LANE_KEYS.map(k => this.input.keyboard?.addKey(k));
    this.buildTouch();

    this.judgeText = this.add.text(width / 2, 120, '', { fontFamily: 'monospace', fontSize: '10px', color: '#ffffff' }).setOrigin(0.5);

    audio.play('battle');
    this.updateHud();
  }

  buildTouch() {
    const { width, height } = this.scale;
    this.touchPressed = [false, false, false, false];
    for (let i = 0; i < LANES; i++) {
      const b = this.add.rectangle(this.laneX(i), height - 16, 30, 22, 0x000000, 0.4)
        .setStrokeStyle(1, 0xffffff).setInteractive();
      b.on('pointerdown', () => this.press(i));
    }
  }

  spawnNote() {
    const lane = Phaser.Math.Between(0, LANES - 1);
    const y = -10;
    const rect = this.add.rectangle(this.laneX(lane), y, 22, 8, 0xd9534f);
    this.notes.push({ lane, rect, hit: false });
  }

  press(lane) {
    if (this.finished) return;
    let best = null;
    let bestDist = Infinity;
    for (const n of this.notes) {
      if (n.lane !== lane || n.hit) continue;
      const d = Math.abs(n.rect.y - HIT_Y);
      if (d < bestDist) {
        bestDist = d;
        best = n;
      }
    }
    if (best && bestDist <= HIT_WINDOW) {
      const perfect = bestDist <= HIT_WINDOW / 3;
      best.hit = true;
      best.rect.destroy();
      const dmg = perfect ? 4 : 2;
      this.enemyHp = Math.max(0, this.enemyHp - dmg);
      this.judge(perfect ? 'ИДЕАЛЬНО' : 'попал', perfect ? '#f0c040' : '#ffffff');
      this.flashEnemy();
    } else {
      this.playerHp -= 2;
      this.judge('мимо', '#d9534f');
    }
    this.updateHud();
  }

  judge(text, color) {
    this.judgeText.setText(text).setColor(color);
  }

  flashEnemy() {
    this.enemySprite.setTint(0xffffff);
    this.time.delayedCall(60, () => this.enemySprite.clearTint());
  }

  updateHud() {
    this.hpText.setText(`Ты: ${Math.max(0, this.playerHp)}/${this.state.maxHp}   Враг: ${this.enemyHp}/${this.enemyMaxHp}`);
  }

  update(time, delta) {
    if (this.finished) return;
    this.elapsed += delta;

    if (this.elapsed >= this.nextSpawn) {
      this.spawnNote();
      this.nextSpawn = this.elapsed + 600;
    }

    for (const n of this.notes) {
      if (n.hit) continue;
      n.rect.y += NOTE_SPEED * delta / 1000;
      if (n.rect.y > HIT_Y + HIT_WINDOW) {
        n.hit = true;
        n.rect.destroy();
        this.playerHp -= 2;
        this.judge('пропуск', '#d9534f');
        this.updateHud();
      }
    }
    this.notes = this.notes.filter(n => !n.hit);

    this.keys.forEach((k, i) => {
      if (k && Phaser.Input.Keyboard.JustDown(k)) this.press(i);
    });

    if (this.enemyHp <= 0) this.finish(true);
    else if (this.playerHp <= 0) this.finish(false);
  }

  finish(won) {
    this.finished = true;
    this.state.hp = Math.max(0, this.playerHp);
    save.write(this.state);
    this.judge(won ? 'Победа!' : 'Поражение', won ? '#f0c040' : '#d9534f');
    this.time.delayedCall(1200, () => {
      if (won && this.onWin) this.onWin();
      else if (!won && this.onLose) this.onLose();
    });
  }
}
