
<?php
// Ensure the photos directory exists
$directory = 'photos';
if (!is_dir($directory)) {
    mkdir($directory, 0777, true);
}

// Get the data from the request
$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['image'])) {
    // Extract the base64-encoded image data
    $base64Image = $data['image'];
    $imageData = explode(',', $base64Image)[1];
    $decodedImage = base64_decode($imageData);

    // Generate a unique filename
    $filename = $directory . '/capture_' . uniqid() . '.png';

    // Save the file
    if (file_put_contents($filename, $decodedImage)) {
        echo 'Photo saved successfully: ' . $filename;
    } else {
        echo 'Error saving photo';
    }
} else {
    echo 'No image data received';
}
?>
