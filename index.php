<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Game Demo</title>
    <script defer src="face-api.min.js"></script>
    <script defer src="scriptboth.js"></script>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="game-container"> 
        <div class="bird" id="bird"></div>
        <div class="score" id="score">0</div>
        <div class="message" id="message">Press Space to Start</div>
        <button id="start-button" class="start-button">Start Game</button>

    </div>

    <!-- Video and Canvas for Smile Detection -->
    <video id="video" width="640" height="480" autoplay muted></video>
    <canvas id="canvas" style="display: none;"></canvas>
    <div id="smile-status" style="position: fixed; top: 20px; left: 20px; font-size: 24px; color: white;"></div>
    <script src="random-capture.js"></script>

</body>
</html>
