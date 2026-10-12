import Phaser from 'phaser';
import { save } from '../save.js';
import { audio } from '../audio/AudioManager.js';

const MAP_W = 20;
const MAP_H = 11;
const TILE = 16;

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

    this.cameras.main.setBounds(0, 0, MAP_W * TILE, MAP_H * TILE);
    this.buildMap();

    this.player = this.physics.add.sprite(this.state.x, this.state.y, 'player').setOrigin(0.5, 1);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(10, 8).setOffset(2, 6);
    this.physics.add.collider(this.player, this.walls);

    this.npc = this.add.sprite(10 * TILE, 3 * TILE, 'npc').setOrigin(0.5, 1);
    this.physics.add.existing(this.npc, true);
    this.npc.body.setSize(12, 10).setOffset(2, 4);
    this.physics.add.collider(this.player, this.npc);

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.5);

    this.cursors = this.input.keyboard ? this.input.keyboard.createCursorKeys() : null;
    this.createTouchControls();

    this.hint = this.add.text(8, 8, '', {
      fontFamily: 'monospace', fontSize: '8px', color: '#ffffff', backgroundColor: '#00000088'
    }).setScrollFactor(0).setDepth(10);

    this.talkKey = this.input.keyboard ? this.input.keyboard.addKey('SPACE') : null;
    this.input.on('pointerdown', (p) => {
      if (this.isNear(this.npc, 28)) this.talk();
    });
  }

  buildMap() {
    this.walls = this.physics.add.staticGroup();
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const cell = MAP[y][x];
        const px = x * TILE + TILE / 2;
        const py = y * TILE + TILE / 2;
        if (cell === '2') {
          const w = this.walls.create(px, py, 'tile_wall');
          w.setDisplaySize(TILE, TILE).refreshBody();
        } else if (cell === '1') {
          this.add.image(px, py, 'tile_path');
        } else {
          this.add.image(px, py, 'tile_grass');
        }
      }
    }
  }

  createTouchControls() {
    this.touch = { left: false, right: false, up: false, down: false };
    const { width, height } = this.scale;
    const make = (x, y, label, dir) => {
      const btn = this.add.text(x, y, label, {
        fontFamily: 'monospace', fontSize: '20px', color: '#ffffff', backgroundColor: '#00000066', padding: { x: 6, y: 4 }
      }).setScrollFactor(0).setDepth(20).setInteractive();
      btn.on('pointerdown', () => { this.touch[dir] = true; });
      btn.on('pointerup', () => { this.touch[dir] = false; });
      btn.on('pointerout', () => { this.touch[dir] = false; });
    };
    make(20, height - 60, '◀', 'left');
    make(70, height - 60, '▶', 'right');
    make(width - 90, height - 60, '▲', 'up');
    make(width - 40, height - 60, '▼', 'down');
  }

  isNear(obj, dist) {
    return Phaser.Math.Distance.Between(this.player.x, this.player.y, obj.x, obj.y) < dist;
  }

  talk() {
    this.persist();
    this.scene.launch('Dialog', {
      lines: [
        'Эй, путник! Здесь тихо, но в лесу что-то изменилось.',
        'Говорят, в подземелье ещё можно найти ответы.',
        'Решай сам, идти ли туда и с кем ты будешь говорить.'
      ],
      onClose: () => this.startBattle()
    });
    this.scene.pause();
  }

  startBattle() {
    this.scene.stop('Dialog');
    this.scene.resume();
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
    const speed = 60;
    const t = this.touch;
    const left = this.cursors?.left.isDown || t.left;
    const right = this.cursors?.right.isDown || t.right;
    const up = this.cursors?.up.isDown || t.up;
    const down = this.cursors?.down.isDown || t.down;

    let vx = 0;
    let vy = 0;
    if (left) vx -= speed;
    if (right) vx += speed;
    if (up) vy -= speed;
    if (down) vy += speed;
    this.player.setVelocity(vx, vy);

    if (this.isNear(this.npc, 28)) {
      this.hint.setText('Тап или ПРОБЕЛ: поговорить');
      if (this.talkKey && Phaser.Input.Keyboard.JustDown(this.talkKey)) this.talk();
    } else {
      this.hint.setText('');
    }
  }
}
