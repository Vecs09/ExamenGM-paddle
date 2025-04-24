let paddle, ball;
let bricks = [];
let cols = 8;
let score = 0;
let lives = 3;
let level = 1;
let ballLaunched = false;
let gameOver = false;
let showStartMessage = true;

function setup() {
  createCanvas(700, 600);
  paddle = new Paddle();
  ball = new Ball();
  createBricks(level);
}

function draw() {
  background(0);

  paddle.show();
  paddle.move();

  ball.show();
  ball.update();
  ball.checkEdges();
  ball.hitPaddle(paddle);
  ball.hitBricks();

  showBricks();

  fill(255);
  textSize(16);
  text("Puntaje: " + score, 45, 20);
  text("❤️: " + lives, width - 100, 20);
  text("Nivel: " + level, width / 2 - 30, 20);

  if (showStartMessage && !ballLaunched && !gameOver) {
    textSize(24);
    textAlign(CENTER);
    text("Pulsa 'P' para jugar", width / 2, height / 2);
  }

  if (lives <= 0 && !ballLaunched) {
    gameOver = true;
    textSize(40);
    textAlign(CENTER);
    text("Perdiste :,v", width / 2, height / 2);
    textSize(20);
    text("Pulsa 'R' para reiniciar", width / 2, height / 2 + 40);
  }

  let remainingBreakable = bricks.filter(b => !b.unbreakable);
  if (remainingBreakable.length === 0 && !gameOver) {
    level++;
    if (level > 3) {
      noLoop();
      textSize(40);
      textAlign(CENTER);
      text("¡Ganaste el juego!", width / 2, height / 2);
    } else {
      nextLevel();
    }
  }
}

function keyPressed() {
  if (keyCode === LEFT_ARROW) paddle.setDir(-1);
  if (keyCode === RIGHT_ARROW) paddle.setDir(1);

  if (key === 'p' || key === 'P') {
    if (!ballLaunched && !gameOver) {
      ballLaunched = true;
      ball.launch();
      showStartMessage = false;
    }
  }

  if ((key === 'r' || key === 'R') && gameOver) {
    resetGame();
  }
}

function keyReleased() {
  if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) paddle.setDir(0);
}

function resetGame() {
  score = 0;
  lives = 3;
  level = 1;
  ballLaunched = false;
  gameOver = false;
  showStartMessage = true;
  paddle.reset();
  ball.reset();
  createBricks(level);
  loop();
}

function createBricks(lvl) {
  bricks = [];
  let w = 75;
  let h = 20;
  let specialAdded = 0;
  let unbreakableAdded = 0;

  let totalRows = lvl === 1 ? 4 : lvl === 2 ? 5 : 6;
  let maxSpecial = lvl === 2 ? 3 : lvl === 3 ? 4 : 0;
  let maxUnbreakable = lvl === 3 ? 3 : 0;

  for (let i = 0; i < totalRows; i++) {
    for (let j = 0; j < cols; j++) {
      let x = j * (w + 5) + 35;
      let y = i * (h + 5) + 50;
      let hits = 1;
      let unbreakable = false;

      if (lvl >= 2 && specialAdded < maxSpecial && random() < 0.2) {
        hits = 3;
        specialAdded++;
      } else if (lvl === 3 && unbreakableAdded < maxUnbreakable && random() < 0.15) {
        unbreakable = true;
        unbreakableAdded++;
      }

      let brickColor;
      if (unbreakable) brickColor = color(150);
      else if (hits > 1) brickColor = color(255, 100, 100);
      else if (lvl === 1) brickColor = color(0, 200, 255);
      else if (lvl === 2) brickColor = color(255, 165, 0);
      else brickColor = color(200, 0, 200);

      bricks.push(new Brick(x, y, hits, unbreakable, brickColor));
    }
  }
}

function showBricks() {
  for (let brick of bricks) {
    brick.show();
  }
}

function nextLevel() {
  ball.reset();
  paddle.reset();
  ballLaunched = false;
  showStartMessage = true;
  ball.increaseSpeed();
  createBricks(level);
}

class Paddle {
  constructor() {
    this.baseW = 120;
    this.w = this.baseW;
    this.h = 20;
    this.x = width / 2 - this.w / 2;
    this.y = height - 40;
    this.xdir = 0;
    this.speed = 7;
    this.minW = 60;
  }

  show() {
    fill(255);
    rect(this.x, this.y, this.w, this.h);
  }

  setDir(dir) {
    this.xdir = dir;
  }

  move() {
    this.x += this.xdir * this.speed;
    this.x = constrain(this.x, 0, width - this.w);
  }

  reset() {
    this.w = this.baseW;
    this.x = width / 2 - this.w / 2;
  }

  shrink() {
    this.w = max(this.minW, this.w - 20);
  }
}

class Ball {
  constructor() {
    this.r = 12;
    this.reset();
    this.speed = 5;
  }

  reset() {
    this.x = width / 2;
    this.y = height - 60;
    this.vx = 0;
    this.vy = 0;
  }

  launch() {
    this.vx = random([-this.speed, this.speed]);
    this.vy = -this.speed;
  }

  show() {
    fill(255, 0, 0);
    ellipse(this.x, this.y, this.r * 2);
  }

  update() {
    if (!ballLaunched) return;
    this.x += this.vx;
    this.y += this.vy;

    if (this.y > height) {
      lives--;
      paddle.shrink();
      this.reset();
      ballLaunched = false;
    }
  }

  checkEdges() {
    if (this.x < this.r || this.x > width - this.r) this.vx *= -1;
    if (this.y < this.r) this.vy *= -1;
  }

  hitPaddle(paddle) {
    if (
      this.x > paddle.x &&
      this.x < paddle.x + paddle.w &&
      this.y + this.r > paddle.y &&
      this.y - this.r < paddle.y + paddle.h
    ) {
      this.vy *= -1;
      this.y = paddle.y - this.r;
    }
  }

  hitBricks() {
    for (let i = bricks.length - 1; i >= 0; i--) {
      if (bricks[i].isHit(this)) {
        if (!bricks[i].unbreakable) {
          bricks[i].hits--;
          if (bricks[i].hits <= 0) {
            bricks.splice(i, 1);
          }
          score++;
        }
        this.vy *= -1;
        break;
      }
    }
  }

  increaseSpeed() {
    this.speed += 1;
  }
}

class Brick {
  constructor(x, y, hits = 1, unbreakable = false, c = color(0, 200, 255)) {
    this.x = x;
    this.y = y;
    this.w = 75;
    this.h = 20;
    this.hits = hits;
    this.unbreakable = unbreakable;
    this.c = c;
  }

  show() {
    fill(this.c);
    rect(this.x, this.y, this.w, this.h);
  }

  isHit(ball) {
    return (
      ball.x > this.x &&
      ball.x < this.x + this.w &&
      ball.y - ball.r < this.y + this.h &&
      ball.y + ball.r > this.y
    );
  }
}
