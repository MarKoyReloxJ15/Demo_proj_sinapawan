<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Smile Detection</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 50px;
    }

    #video-container {
      position: relative;
      display: inline-block;
    }

    #video {
      border: 2px solid #000;
    }

    #smile-status {
      margin-top: 20px;
      font-size: 24px;
      font-weight: bold;
      color: green;
    }
  </style>
</head>
<body>
  <h1>Smile Detection</h1>
  <div id="video-container">
    <video id="video" width="720" height="560" autoplay muted></video>
    <canvas id="canvas" style="display: none;"></canvas>
  </div>
  <p id="smile-status">Detecting smile...</p>

  <!-- Load the local version of face-api.js -->
  <script src="face-api.min.js"></script>
  <script>
    // Wait for the models to be loaded before running the detection
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
        .catch(err => console.error('Error accessing webcam: ', err));
    }

    // Function to detect smile
    async function detectSmile() {
      const video = document.getElementById('video');
      const smileStatus = document.getElementById('smile-status');
      const canvas = document.getElementById('canvas');
      const ctx = canvas.getContext('2d');

      const options = new faceapi.TinyFaceDetectorOptions();

      setInterval(async () => {
        const detection = await faceapi.detectSingleFace(video, options)
          .withFaceLandmarks()
          .withFaceExpressions();

        if (detection) {
          const { expressions } = detection;
          const smileValue = expressions.happy; // Detect happiness expression
          if (smileValue > 0.5) {
            smileStatus.textContent = `Smiling 😊 (${Math.round(smileValue * 100)}%)`;
            console.log("smiling");
            await pauseAndCapture(video);
          } else {
            smileStatus.textContent = "Not smiling 😐";
            console.log(" Not smiling");
          }
        } else {
          smileStatus.textContent = "No face detected!";
        }
      }, 300);
    }

    // Function to pause for 5 seconds and capture a photo
    async function pauseAndCapture(video) {
      const canvas = document.getElementById('canvas');
      const ctx = canvas.getContext('2d');

      // Set canvas dimensions to match video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Capture the frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');

      // Send the photo to the server
      await savePhoto(dataUrl);

      // Show the captured image on the video for 5 seconds
      const img = new Image();
      img.src = dataUrl;

      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height); // Draw the captured image
      };

      // Pause for 5 seconds (during which the captured image is shown)
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    // Function to send the photo data to the PHP script
    async function savePhoto(dataUrl) {
      const response = await fetch('save_photo.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: dataUrl })
      });

      if (!response.ok) {
        console.error('Error saving photo:', response.statusText);
      }
    }
  </script>
</body>
</html>
