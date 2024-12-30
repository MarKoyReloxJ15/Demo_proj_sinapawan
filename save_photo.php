<?php
// Check if image data is received
if (isset($_POST['image'])) {
    $imageData = $_POST['image'];

    // Extract the base64-encoded part from the data URL
    $imageParts = explode(',', $imageData);
    $base64Image = $imageParts[1];

    // Decode the base64 image
    $decodedImage = base64_decode($base64Image);

    // Create a unique filename
    $filename = 'photo_' . time() . '.png';
    $filePath = 'photos/' . $filename;

    // Save the image to the /photos folder
    if (file_put_contents($filePath, $decodedImage)) {
        echo 'Photo saved successfully as ' . $filename;
    } else {
        echo 'Failed to save photo';
    }
} else {
    echo 'No image data received';
}
?>

