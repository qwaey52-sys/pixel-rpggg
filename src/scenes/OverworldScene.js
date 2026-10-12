import Phaser from 'phaser';
import { save } from '../save.js';
import { audio } from '../audio/AudioManager.js';
import { style } from '../ui.js';

const TILE = 24;
const MAP_W = 20;
const MAP_H = 11;
const TALK_DIST = 40;

// 0 — трава, 1 — тропа, 2 — стена
const MAP = [
  '22222222222222222222',
  '20000000000000000002',
  '20000000000000000002',
  '20000111110000000002',
  '20000100001000000002',
  '20000100001000000002',
  '20000100001000000002',
  '20000100001000000002',
  '20000111111000000002',
  '20000000000000000002',
  '22222222222222222222'
];

export class OverworldScene extends Phaser.Scene {
  constructor() {
    super('Overworld');
  }

  create() {
    this.state = save.load();
    audio.play('town');

    this.cameras.main.setBackgroundColor('#000000');
    this.cameras.main.setBounds(0, 0, MAP_W * TILE, MAP_H * TILE);

    this.buildMap();

    this.player = this.physics.add.sprite(this.state.x, this.state.y, 'player').setOrigin(0.5, 1);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(16, 8).setOffset(4, 20);
    this.physics.add.collider(this.player, this.walls);

    this.npc = this.add.sprite(12 * TILE + TILE / 2, 5 * TILE, 'npc').setOrigin(0.5, 1);

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    this.cursors = this.input.keyboard?.createCursorKeys();
    this.talkKey = this.input.keyboard?.addKey('SPACE');
    this.input.addPointer(2);

    this.createControls();

    this.hint = this.add.text(6, 6, '', style(8, '#ffffff'))
      .setScrollFactor(0)
      .setDepth(10);
  }

  buildMap() {
    this.walls = this.physics.add.staticGroup();
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const cell = MAP[y][x];
        const px = x * TILE + TILE / 2;
        const py = y * TILE + TILE / 2;
        if (cell === '2') {
          this.walls.create(px, py, 'tile_wall');
        } else {
          this.add.image(px, py, cell === '1' ? 'tile_path' : 'tile_grass');
        }
      }
    }
  }

  createControls() {
    const { height } = this.scale;
    this.touch = { left: false, right: false, up: false, down: false };

    this.dpad(28, 200, 'left');
    this.dpad(72, 200, 'right');
    this.dpad(292, 168, 'up');
    this.dpad(292, 208, 'down');

    const talkBtn = this.add.rectangle(250, 200, 36, 32, 0x000000, 0.35)
      .setStrokeStyle(1, 0xffffff)
      .setScrollFactor(0)
      .setDepth(20)
      .setInteractive();
    this.add.text(250, 200, 'A', style(16)).setOrigin(0.5).setScrollFactor(0).setDepth(21);
    talkBtn.on('pointerdown', () => this.tryTalk());
  }

  dpad(cx, cy, dir) {
    const r = this.add.rectangle(cx, cy, 36, 32, 0x000000, 0.35)
      .setStrokeStyle(1, 0xffffff)
      .setScrollFactor(0)
      .setDepth(20)
      .setInteractive();

    const g = this.add.graphics().setScrollFactor(0).setDepth(21);
    g.fillStyle(0xffffff, 0.9);
    const shapes = {
      left: [cx + 5, cy - 8, cx + 5, cy + 8, cx - 7, cy],
      right: [cx - 5, cy - 8, cx - 5, cy + 8, cx + 7, cy],
      up: [cx - 8, cy + 5, cx + 8, cy + 5, cx, cy - 7],
      down: [cx - 8, cy - 5, cx + 8, cy - 5, cx, cy + 7]
    };
    g.fillTriangle(...shapes[dir]);

    const release = () => { this.touch[dir] = false; };
    r.on('pointerdown', () => { this.touch[dir] = true; });
    r.on('pointerup', release);
    r.on('pointerout', release);
    r.on('pointerupoutside', release);
  }

  isNear() {
    return Phaser.Math.Distance.Between(this.player.x, this.player.y, this.npc.x, this.npc.y) < TALK_DIST;
  }

  tryTalk() {
    if (this.isNear()) this.talk();
  }

  talk() {
    this.persist();
    this.scene.launch('Dialog', {
      lines: [
        'Эй, путник! В лесу что-то изменилось.',
        'Говорят, в подземелье есть ответы.',
        'Решай сам, идти ли туда.'
      ],
      onClose: () => this.startBattle()
    });
    this.scene.pause();
  }

  startBattle() {
    this.scene.stop('Dialog');
    this.scene.start('RhythmBattle', {
      onWin: () => this.setEnding('good'),
      onLose: () => this.setEnding('bad')
    });
  }

  setEnding(type) {
    this.state.ending = type;
    save.write(this.state);
    this.scene.start('Ending', { type });
  }

  persist() {
    this.state.x = Math.round(this.player.x);
    this.state.y = Math.round(this.player.y);
    save.write(this.state);
  }

  update() {
    const speed = 70;
    const t = this.touch;
    const c = this.cursors;

    const left = c?.left.isDown || t.left;
    const right = c?.right.isDown || t.right;
    const up = c?.up.isDown || t.up;
    const down = c?.down.isDown || t.down;

    let vx = 0;
    let vy = 0;
    if (left) vx -= speed;
    if (right) vx += speed;
    if (up) vy -= speed;
    if (down) vy += speed;
    this.player.setVelocity(vx, vy);

    const near = this.isNear();
    this.hint.setText(near ? 'ПРОБЕЛ или A: поговорить' : '');
    if (near && this.talkKey && Phaser.Input.Keyboard.JustDown(this.talkKey)) this.talk();
  }
}
