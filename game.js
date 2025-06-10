const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');

const COLS = 10;
const ROWS = 20;
const BLOCK = 24;
canvas.width = COLS * BLOCK;
canvas.height = ROWS * BLOCK;
ctx.scale(BLOCK, BLOCK);

const COLORS = [
  null,
  '#FF0D72',
  '#0DC2FF',
  '#0DFF72',
  '#F538FF',
  '#FF8E0D',
  '#FFE138',
  '#3877FF'
];

const SHAPES = [
  [],
  [
    [0,1,0],
    [1,1,1],
    [0,0,0]
  ],
  [
    [2,2,2,2]
  ],
  [
    [0,3,3],
    [3,3,0],
    [0,0,0]
  ],
  [
    [4,4,0],
    [0,4,4],
    [0,0,0]
  ],
  [
    [5,0,0],
    [5,5,5],
    [0,0,0]
  ],
  [
    [0,0,6],
    [6,6,6],
    [0,0,0]
  ],
  [
    [7,7],
    [7,7]
  ]
];

function createMatrix(w, h) {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

function collide(board, player) {
  const m = player.matrix;
  const o = player.pos;
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (m[y][x] !== 0 &&
          (board[y + o.y] && board[y + o.y][x + o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

function merge(board, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        board[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}

function rotate(matrix, dir) {
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }
  if (dir > 0) {
    matrix.forEach(row => row.reverse());
  } else {
    matrix.reverse();
  }
}

function createPiece(type) {
  const t = 'TJLOSZI';
  const index = t.indexOf(type) + 1;
  return SHAPES[index];
}

function playerReset() {
  const pieces = 'TJLOSZI';
  player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
  player.pos.y = 0;
  player.pos.x = ((COLS / 2) | 0) - ((player.matrix[0].length / 2) | 0);
  if (collide(board, player)) {
    board.forEach(row => row.fill(0));
    player.score = 0;
    updateScore();
  }
}

function playerDrop() {
  player.pos.y++;
  if (collide(board, player)) {
    player.pos.y--;
    merge(board, player);
    sweep();
    playerReset();
  }
  dropCounter = 0;
}

function playerMove(dir) {
  player.pos.x += dir;
  if (collide(board, player)) {
    player.pos.x -= dir;
  }
}

function playerRotate(dir) {
  const pos = player.pos.x;
  let offset = 1;
  rotate(player.matrix, dir);
  while (collide(board, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      rotate(player.matrix, -dir);
      player.pos.x = pos;
      return;
    }
  }
}

function sweep() {
  outer: for (let y = board.length -1; y >= 0; --y) {
    for (let x = 0; x < board[y].length; ++x) {
      if (board[y][x] === 0) {
        continue outer;
      }
    }
    const row = board.splice(y, 1)[0].fill(0);
    board.unshift(row);
    ++y;
    player.score += 10;
  }
  updateScore();
}

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

function update(time = 0) {
  const delta = time - lastTime;
  lastTime = time;

  dropCounter += delta;
  if (dropCounter > dropInterval) {
    playerDrop();
  }

  draw();
  requestAnimationFrame(update);
}

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        ctx.fillStyle = COLORS[value];
        ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, COLS, ROWS);

  drawMatrix(board, {x:0, y:0});
  drawMatrix(player.matrix, player.pos);
}

function updateScore() {
  document.getElementById('score-value').innerText = player.score;
}

const board = createMatrix(COLS, ROWS);

const player = {
  pos: {x: 0, y: 0},
  matrix: null,
  score: 0
};

document.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') {
    playerMove(-1);
  } else if (event.key === 'ArrowRight') {
    playerMove(1);
  } else if (event.key === 'ArrowDown') {
    playerDrop();
  } else if (event.key === 'ArrowUp') {
    playerRotate(1);
  } else if (event.key === ' ') {
    while (!collide(board, player)) {
      player.pos.y++;
    }
    player.pos.y--;
    playerDrop();
  }
});

playerReset();
updateScore();
update();
