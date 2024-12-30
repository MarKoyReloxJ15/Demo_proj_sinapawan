// Variables for game elements
const bird = document.getElementById('bird');
const scoreElement = document.getElementById('score');
const messageElement = document.getElementById('message');
const gameContainer = document.querySelector('.game-container');
const startButton = document.getElementById('start-button');

let birdTop = 250;
let gravity = 2;
let isGameOver = false;
let score = 0;
let pipeInterval;
let gameLoopInterval;

// Load the face-api models
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models/weights'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models/weights'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models/weights')
]).then(startVideo);

// Start the video stream from the webcam
function startVideo() {
    navigator.mediaDevices.getUserMedia({ video: {} })
        .then(stream => {
            const video = document.getElementById('video');
            video.srcObject = stream;
            video.onplay = detectSmile;
        })
        .catch(err => console.error('Error accessing webcam:', err));
}

// Detect smile and control bird movement
async function detectSmile() {
    const video = document.getElementById('video');
    const smileStatus = document.getElementById('smile-status');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    const options = new faceapi.TinyFaceDetectorOptions();
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    setInterval(async () => {
        const detection = await faceapi.detectSingleFace(video, options)
            .withFaceLandmarks()
            .withFaceExpressions();

        if (detection) {
            const { expressions } = detection;
            const smileValue = expressions.happy;

            if (smileValue > 0.5) {
                smileStatus.textContent = `Smiling 😊 (${Math.round(smileValue * 100)}%)`;
                jump();
            } else {
                smileStatus.textContent = "Not smiling 😐";
                applyGravity();
            }
        } else {
            smileStatus.textContent = "No face detected!";
            applyGravity();
        }
    }, 200);
}

// Bird jump function
function jump() {
    if (!isGameOver) {
        birdTop -= 60;
        bird.style.top = birdTop + 'px';
    }
}

// Apply gravity when not smiling
function applyGravity() {
    birdTop += gravity;
    bird.style.top = birdTop + 'px';
}

// Capture photo when reaching score 50
function capturePhoto() {
    const video = document.getElementById('video');
    const canvas = document.createElement('canvas');
    const fullscreenDiv = document.createElement('div');
    const fullscreenImage = document.createElement('img');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Capture photo
    const dataURL = canvas.toDataURL('image/png');
    fullscreenImage.src = dataURL;

    // Display the captured photo fullscreen
    fullscreenDiv.style.position = 'fixed';
    fullscreenDiv.style.top = '0';
    fullscreenDiv.style.left = '0';
    fullscreenDiv.style.width = '100%';
    fullscreenDiv.style.height = '100%';
    fullscreenDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    fullscreenDiv.style.display = 'flex';
    fullscreenDiv.style.justifyContent = 'center';
    fullscreenDiv.style.alignItems = 'center';
    fullscreenDiv.style.zIndex = '1000';
    fullscreenDiv.appendChild(fullscreenImage);
    document.body.appendChild(fullscreenDiv);

    // Send the captured photo to the server to save it
    savePhotoToServer(dataURL);

    // Hide photo after 3 seconds
    setTimeout(() => {
        document.body.removeChild(fullscreenDiv);
    }, 500);
}

// Function to send captured photo to the server via AJAX
function savePhotoToServer(dataURL) {
    // Prepare data to send to the server
    const formData = new FormData();
    formData.append('image', dataURL);

    // Send an AJAX request to save the image
    fetch('save_photo.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(result => {
        console.log('Photo saved:', result);
    })
    .catch(error => {
        console.error('Error saving photo:', error);
    });
}


// Start the game
function startGame() {
    startButton.classList.add('hidden'); // Hide the start button
    messageElement.style.display = 'none';
    isGameOver = false;
    score = 0;
    birdTop = 250;
    bird.style.top = birdTop + 'px';
    scoreElement.textContent = `Score: ${score}`;

    pipeInterval = setInterval(createPipes, 2500);
    gameLoop();
}

// Create pipes only at the bottom
function createPipes() {
    const pipeHeight = Math.floor(Math.random() * 150) + 150;
    const pipeBottom = document.createElement('div');
    pipeBottom.classList.add('pipe', 'pipe-bottom');
    pipeBottom.style.height = pipeHeight + 'px';
    pipeBottom.style.left = '400px';
    gameContainer.appendChild(pipeBottom);

    let pipeMoveInterval = setInterval(() => {
        pipeBottom.style.left = pipeBottom.offsetLeft - 5 + 'px';

        if (checkCollision(pipeBottom)) {
            gameOver();
        }

        // Remove pipes when off-screen
        if (pipeBottom.offsetLeft < -60) {
            pipeBottom.remove();
            clearInterval(pipeMoveInterval);
            if (!isGameOver) {
                score++;
                scoreElement.textContent = `Score: ${score}`;

                // Capture photo if score reaches 50
                if (score === 5) {
                    capturePhoto();
                }
            }
        }
    }, 20);
}

// Check for collision between bird and pipes
function checkCollision(pipe) {
    const birdRect = bird.getBoundingClientRect();
    const pipeRect = pipe.getBoundingClientRect();

    return !(
        birdRect.bottom < pipeRect.top ||
        birdRect.right < pipeRect.left ||
        birdRect.left > pipeRect.right
    );
}

// Game loop with gravity
function gameLoop() {
    if (isGameOver) return;

    birdTop += gravity;
    bird.style.top = birdTop + 'px';

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

// Reset the game
function resetGame() {
    isGameOver = false;
    clearInterval(pipeInterval);
    cancelAnimationFrame(gameLoopInterval);
    birdTop = 250;
    bird.style.top = birdTop + 'px';
    score = 0;
    scoreElement.textContent = `Score: ${score}`;
    document.querySelectorAll('.pipe').forEach(pipe => pipe.remove());
    startGame();
}

// Start game on button click
startButton.addEventListener('click', startGame);

// Restart game on spacebar press
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && isGameOver) {
        resetGame();
    }
});
