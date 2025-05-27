const fs = require('fs-extra');
const path = require('path');

try {
  // Ensure build directory exists
  fs.ensureDirSync(path.join(__dirname, '../build'));

  // Copy manifest.json
  fs.copySync(
    path.join(__dirname, '../public/manifest.json'),
    path.join(__dirname, '../build/manifest.json'),
    { overwrite: true }
  );

  // Ensure icons directory exists
  fs.ensureDirSync(path.join(__dirname, '../build/icons'));

  // Copy icons directory
  fs.copySync(
    path.join(__dirname, '../public/icons'),
    path.join(__dirname, '../build/icons'),
    { overwrite: true }
  );

  console.log('Extension files copied successfully!');
} catch (error) {
  console.error('Error copying extension files:', error);
  process.exit(1);
} 