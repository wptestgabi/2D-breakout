const canvas = document.getElementById("canvas");
const scoreDisplay = document.querySelector(".high-score");
const resetBtn = document.querySelector(".reset");
const buttons = document.querySelector(".button-container");

const ctx = canvas.getContext("2d");
canvas.height = 500;
canvas.width = 500;

let rightPressed = false;
let leftPressed = false;
let speed = 6;
let score = 0;
let gameLevelUp = true;

let highScore = parseInt(localStorage.getItem("highScore"));
if (isNaN(highScore)) {
  highScore = 0;
}
scoreDisplay.innerHTML = `High Score: ${highScore}`;

// Event listeners
buttons.addEventListener("click", (e) => {
  difficulty(e.target.classList.value);
});
document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);
resetBtn.addEventListener("click", resetHandler);

//Event Handlers
function resetHandler() {
  localStorage.setItem("highScore", "0");
  score = 0;
  scoreDisplay.innerHTML = "High Score: 0";
  generateBricks();
}

function keyDownHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = true;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = true;
  }
}

function keyUpHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = false;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = false;
  }
}

function difficulty(value) {
  switch (value) {
    case "Easy":
      paddle.width = 200;
      break;
    case "Medium":
      paddle.width = 76;
      break;
    case "Hard":
      paddle.width = 30;
      break;
  }
  resetHandler();
}

function drawScore() {
  ctx.font = "20px Arial";
  ctx.fillStyle = "#800203fff";
  ctx.fillText("Score: " + score, 8, 20);
}

function movePaddle() {
  if (rightPressed) {
    paddle.x += 7;
    // prevent paddle out of screen
    if (paddle.x + paddle.width >= canvas.width) {
      paddle.x = canvas.width - paddle.width;
    }
  } else if (leftPressed) {
    paddle.x -= 7;
    if (paddle.x < 0) {
      paddle.x = 0;
    }
  }
}

// creating a ball
let ball = {
  x: canvas.height / 2,
  y: canvas.height - 50,
  directionX: speed,
  directionY: -speed + 1,
  radius: 7,
  draw: function () {
    ctx.beginPath();
    ctx.fillStyle = "#00203fff";
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
  },
};

// creating a paddle
let paddle = {
  height: 10,
  width: 200,
  x: canvas.width / 2 - 76 / 2,
  draw: function () {
    ctx.beginPath();
    ctx.rect(this.x, canvas.height - this.height, this.width, this.height);
    ctx.fillStyle = "#00203fff";
    ctx.fill();
    ctx.closePath();
  },
};

//brick logic
let brickRowCount = 3;
let brickColumnCount = 5;
let brickWidth = 70;
let brickHeight = 20;
let brickPadding = 20;
let brickOffsetTop = 30;
let brickOffsetLeft = 35;

let bricks = [];

function generateBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
      bricks[c][r] = { x: 0, y: 0, status: Math.floor(Math.random() * 2) + 1 };
    }
  }
}

function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status === 1 || bricks[c][r].status === 2) {
        // display bricks on the canvas
        let brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        let brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fillStyle = bricks[c][r].status === 1 ? "#00203fff" : "red";
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      let brick = bricks[c][r];
      // destroy bricks logic
      if (
        ball.x >= brick.x &&
        ball.x <= brick.x + brickWidth &&
        ball.y >= brick.y &&
        ball.y <= brick.y + brickHeight
      ) {
        if (brick.status === 1) {
          ball.directionY *= -1;
          brick.status = 0;
          score++;
        } else if (brick.status === 2) {
          ball.directionY *= -1;
          brick.status = 1;
        }
      }
    }
  }
}

function levelUp() {
  if (score % 15 === 0 && score != 0) {
    if (ball.y > canvas.height / 2) {
      generateBricks();
    }
    if (gameLevelUp) {
      // increase ball speed after a new level
      if (ball.directionY > 0) {
        ball.directionY += 1;
        gameLevelUp = false;
      } else if (ball.directionY < 0) {
        ball.directionY -= 1;
        gameLevelUp = false;
      }
    }
    if (score % 15 != 0) {
      gameLevelUp = true;
    }
  }
}

function play() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ball.draw();
  paddle.draw();
  drawBricks();
  movePaddle();
  collisionDetection();
  levelUp();
  drawScore();

  // moving the ball
  ball.x += ball.directionX;
  ball.y += ball.directionY;

  // ball bounce the wall directionX
  if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
    ball.directionX *= -1;
  }
  // ball bounce the wall directionY
  if (ball.y + ball.radius > canvas.width || ball.y - ball.radius < 0) {
    ball.directionY *= -1;
  }

  // Reset score
  if (ball.y + ball.radius > canvas.height) {
    if (score > parseInt(localStorage.getItem("highScore"))) {
      localStorage.setItem("highScore", score.toString());
      scoreDisplay.innerHTML = `High Score: ${score}`;
    }

    score = 0;
    generateBricks();
    ball.directionX = speed;
    ball.directionY = -speed + 1;
  }

  // ball bounce of paddle
  if (
    ball.x >= paddle.x &&
    ball.x <= paddle.x + paddle.width &&
    ball.y + ball.radius >= canvas.height - paddle.height
  ) {
    ball.directionY *= -1;
  }

  requestAnimationFrame(play);
}

generateBricks();
play();
