const bird = document.getElementById('bird');
const scoreElement = document.getElementById('score');
const messageElement = document.getElementById('message');
const gameContainer = document.querySelector('.game-container');

let birdTop = 250;
let gravity = 2;
let isGameOver = false;
let score = 0;
let pipeInterval;
let gameLoopInterval;

// Bird movement
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (isGameOver) {
            resetGame();
        } else if (!pipeInterval) {
            startGame();
        } else {
            jump();
        }
    }
});

// Function to make the bird jump
function jump() {
    if (!isGameOver) {
        birdTop -= 60;
        bird.style.top = birdTop + 'px';
    }
}

// Start game function
function startGame() {
    messageElement.style.display = 'none';
    isGameOver = false;
    score = 0;
    birdTop = 250;
    bird.style.top = birdTop + 'px';
    scoreElement.textContent = score;

    // Start creating pipes and the game loop
    pipeInterval = setInterval(createPipes, 2000);
    gameLoop();
}

// Create pipes
function createPipes() {
    const pipeTopHeight = Math.floor(Math.random() * 200) + 50;
    const pipeBottomHeight = 600 - pipeTopHeight - 150;

    // Create top pipe
    const pipeTop = document.createElement('div');
    pipeTop.classList.add('pipe', 'pipe-top');
    pipeTop.style.height = pipeTopHeight + 'px';
    pipeTop.style.left = '400px';
    gameContainer.appendChild(pipeTop);

    // Create bottom pipe
    const pipeBottom = document.createElement('div');
    pipeBottom.classList.add('pipe', 'pipe-bottom');
    pipeBottom.style.height = pipeBottomHeight + 'px';
    pipeBottom.style.left = '400px';
    gameContainer.appendChild(pipeBottom);

    // Move pipes
    let pipeMoveInterval = setInterval(() => {
        pipeTop.style.left = pipeTop.offsetLeft - 5 + 'px';
        pipeBottom.style.left = pipeBottom.offsetLeft - 5 + 'px';

        // Check for collision
        if (checkCollision(pipeTop) || checkCollision(pipeBottom)) {
            gameOver();
        }

        // Remove pipes when off-screen
        if (pipeTop.offsetLeft < -60) {
            pipeTop.remove();
            pipeBottom.remove();
            clearInterval(pipeMoveInterval);
            if (!isGameOver) {
                score++;
                scoreElement.textContent = score;
            }
        }
    }, 20);
}

// Check for collision
function checkCollision(pipe) {
    const birdRect = bird.getBoundingClientRect();
    const pipeRect = pipe.getBoundingClientRect();

    return !(
        birdRect.bottom < pipeRect.top ||
        birdRect.top > pipeRect.bottom ||
        birdRect.right < pipeRect.left ||
        birdRect.left > pipeRect.right
    );
}

// Game loop
function gameLoop() {
    if (isGameOver) return;

    birdTop += gravity;
    bird.style.top = birdTop + 'px';

    // Check for bird hitting boundaries
    if (birdTop > 570 || birdTop < 0) {
        gameOver();
    }

    gameLoopInterval = requestAnimationFrame(gameLoop);
}

// Game over function
function gameOver() {
    isGameOver = true;
    clearInterval(pipeInterval);
    pipeInterval = null;
    cancelAnimationFrame(gameLoopInterval);
    document.querySelectorAll('.pipe').forEach(pipe => pipe.remove());

    messageElement.textContent = 'Game Over! Press Space to Restart';
    messageElement.style.display = 'block';
}

// Reset game function
function resetGame() {
    isGameOver = false;
    clearInterval(pipeInterval);
    cancelAnimationFrame(gameLoopInterval);
    birdTop = 250;
    bird.style.top = birdTop + 'px';
    score = 0;
    scoreElement.textContent = score;
    document.querySelectorAll('.pipe').forEach(pipe => pipe.remove());

    // Restart the game
    startGame();
}
