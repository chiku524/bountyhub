// Simple test script to verify profile picture upload
const fs = require('fs');
const path = require('path');

// Create a simple test image (1x1 pixel PNG)
const testImageData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');

// Write test image to file
const testImagePath = path.join(__dirname, 'test-image.png');
fs.writeFileSync(testImagePath, testImageData);

console.log('Test image created at:', testImagePath);
console.log('You can now test the profile picture upload with this image.');
console.log('The image is a 1x1 pixel PNG file that should work for testing.'); 