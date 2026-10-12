import Phaser from 'phaser';
import { audio } from '../audio/AudioManager.js';
import { save } from '../save.js';
import { style } from '../ui.js';

// Ноты падают по четырём дорожкам. Нажми дорожку, когда нота у золотой черты.
// Точное попадание бьёт сильнее, промах бьёт по тебе.

const LANES = 4;
const LANE_KEYS = ['LEFT', 'DOWN', 'UP', 'RIGHT'];
const LANE_GAP = 36;
const TOP = 100;
const HIT_Y = 180;
const HIT_WINDOW = 12;
const NOTE_SPEED = 80;
const SPAWN_EVERY = 600;

export class RhythmBattleScene extends Phaser.Scene {
  constructor() {
    super('RhythmBattle');
  }

  init(data) {
    this.onWin = data.onWin;
    this.onLose = data.onLose;
  }

  create() {
    const { width, height } = this.scale;
    const cx = width / 2;
    this.cameras.main.setBackgroundColor('#140a1e');
    this.state = save.load();

    this.enemyHp = 30;
    this.enemyMaxHp = 30;
    this.playerHp = this.state.hp;
    this.elapsed = 0;
    this.nextSpawn = 0;
    this.notes = [];
    this.finished = false;

    this.laneX = (i) => cx - ((LANES - 1) * LANE_GAP) / 2 + i * LANE_GAP;

    this.add.text(cx, 8, 'СТРАЖ ТЕНЕЙ', style(16, '#f0c040')).setOrigin(0.5, 0);
    this.enemySprite = this.add.sprite(cx, 44, 'enemy');
    this.hpText = this.add.text(cx, 64, '', style(8)).setOrigin(0.5, 0);
    this.judgeText = this.add.text(cx, 80, '', style(8)).setOrigin(0.5, 0);

    for (let i = 0; i < LANES; i++) {
      this.add.rectangle(this.laneX(i), (TOP + 200) / 2, 30, 100, 0x2a2040, 0.7);
      this.add.rectangle(this.laneX(i), HIT_Y, 32, 6, 0xf0c040, 0.9);
    }

    this.keys = LANE_KEYS.map(k => this.input.keyboard?.addKey(k));
    this.input.addPointer(2);
    this.buildTouch(height);

    audio.play('battle');
    this.updateHud();
  }

  buildTouch(height) {
    for (let i = 0; i < LANES; i++) {
      const b = this.add.rectangle(this.laneX(i), height - 18, 30, 26, 0x000000, 0.4)
        .setStrokeStyle(1, 0xffffff)
        .setInteractive();
      b.on('pointerdown', () => this.press(i));
    }
  }

  spawnNote() {
    const lane = Phaser.Math.Between(0, LANES - 1);
    const rect = this.add.rectangle(this.laneX(lane), TOP, 26, 8, 0xd9534f);
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
      this.enemyHp = Math.max(0, this.enemyHp - (perfect ? 4 : 2));
      this.judge(perfect ? 'ИДЕАЛЬНО' : 'ПОПАЛ', perfect ? '#f0c040' : '#ffffff');
      this.flashEnemy();
    } else {
      this.playerHp -= 2;
      this.judge('МИМО', '#d9534f');
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
    this.hpText.setText(`ТЫ ${Math.max(0, this.playerHp)}/${this.state.maxHp}   ВРАГ ${this.enemyHp}/${this.enemyMaxHp}`);
  }

  update(time, delta) {
    if (this.finished) return;
    this.elapsed += delta;

    if (this.elapsed >= this.nextSpawn) {
      this.spawnNote();
      this.nextSpawn = this.elapsed + SPAWN_EVERY;
    }

    for (const n of this.notes) {
      if (n.hit) continue;
      n.rect.y += NOTE_SPEED * delta / 1000;
      if (n.rect.y > HIT_Y + HIT_WINDOW) {
        n.hit = true;
        n.rect.destroy();
        this.playerHp -= 2;
        this.judge('ПРОПУСК', '#d9534f');
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
    this.judge(won ? 'ПОБЕДА!' : 'ПОРАЖЕНИЕ', won ? '#f0c040' : '#d9534f');
    this.time.delayedCall(1200, () => {
      if (won && this.onWin) this.onWin();
      else if (!won && this.onLose) this.onLose();
    });
  }
}
