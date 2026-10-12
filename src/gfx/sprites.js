// Пиксельные спрайты рисуются кодом. Их можно заменить на свои PNG
// с теми же ключами: player, npc, tiles, enemy, heart.

const PALETTE = {
  '.': null,
  'k': 0x0b0b12,
  'w': 0xf2efe6,
  'r': 0xd9534f,
  'g': 0x5cb85c,
  'b': 0x4a86c5,
  'y': 0xf0c040,
  'p': 0xb07ad9,
  'd': 0x5a4636,
  'l': 0x8bc34a,
  'n': 0xe8b48a
};

function drawPixelArt(scene, key, rows, scale = 1) {
  const h = rows.length;
  const w = rows[0].length;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      const color = PALETTE[ch];
      if (color === null || color === undefined) return;
      g.fillStyle(color, 1);
      g.fillRect(x * scale, y * scale, scale, scale);
    });
  });
  g.generateTexture(key, w * scale, h * scale);
  g.destroy();
}

const PLAYER = [
  '....kkkk....',
  '...kddddk...',
  '..kdnnnndk..',
  '..knknnknk..',
  '..knnnnnnk..',
  '...knnnnk...',
  '..kbbbbbbk..',
  '.kbbbbbbbbk.',
  '.kbbbbbbbbk.',
  '..kbbbbbbk..',
  '..kkkkkkkk..',
  '..kdk..kdk..',
  '..kdk..kdk..',
  '..kkk..kkk..'
];

const NPC = [
  '....kkkk....',
  '...kwwwwk...',
  '..kwnnnnwk..',
  '..knknnknk..',
  '..knnnnnnk..',
  '...knnnnk...',
  '..kppppppk..',
  '.kpppppppppk',
  '.kpppppppppk',
  '..kpppppppk.',
  '..kkkkkkkk..',
  '..kdk..kdk..',
  '..kdk..kdk..',
  '..kkk..kkk..'
];

const ENEMY = [
  '.kkkkkkkkkk.',
  'kgggggggggk.',
  'kgkgggggkgk.',
  'kgggggggggk.',
  'kggkggkggk.',
  'kgggggggggk.',
  '.kgggggggk..',
  '..kkkkkkk...'
];

const TILE_GRASS = [
  'llllllllllll',
  'lglllglllllg',
  'llllllllgllg',
  'lllglllllllll',
  'llllllglllll',
  'lglllllllgll',
  'llllllllllll',
  'lllllglllllg',
  'llgllllllllg',
  'llllllllllll',
  'llllllglllll',
  'lglllllllllg'
];

const TILE_PATH = [
  'dddddddddddd',
  'ddyddddddddd',
  'dddddddddddd',
  'dddddddddydd',
  'dddddddddddd',
  'dddddddddddd',
  'dddyddddddddd',
  'dddddddddddd',
  'dddddddddddd',
  'ddddddydddddd'.slice(0, 12),
  'dddddddddddd',
  'dddddddddddd'
];

const TILE_WALL = [
  'kkkkkkkkkkkk',
  'kwwwkwwwkwwk',
  'kwwwkwwwkwwk',
  'kkkkkkkkkkkk',
  'kwkwwwkwwwkw',
  'kwkwwwkwwwkw',
  'kkkkkkkkkkkk',
  'kwwwkwwwkwwk',
  'kwwwkwwwkwwk',
  'kkkkkkkkkkkk',
  'kwkwwwkwwwkw',
  'kwkwwwkwwwkw'
];

const HEART = [
  '.rr.rr.',
  'rrrrrrr',
  'rrrrrrr',
  '.rrrrr.',
  '..rrr..',
  '...r...'
];

export function makeSprites(scene) {
  drawPixelArt(scene, 'player', PLAYER);
  drawPixelArt(scene, 'npc', NPC);
  drawPixelArt(scene, 'enemy', ENEMY);
  drawPixelArt(scene, 'tile_grass', TILE_GRASS);
  drawPixelArt(scene, 'tile_path', TILE_PATH.map(r => r.padEnd(12, 'd').slice(0, 12)));
  drawPixelArt(scene, 'tile_wall', TILE_WALL);
  drawPixelArt(scene, 'heart', HEART);
}
