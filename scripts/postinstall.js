const fs = require('fs');
const path = require('path');

console.log('Running postinstall script to patch node-pandas case-sensitivity bug...');

const targetFiles = [
  path.join(__dirname, '..', 'node_modules', 'node-pandas', 'src', 'utils', 'getTransformedDataList.js'),
  path.join(__dirname, '..', 'node_modules', 'node-pandas', 'src', 'utils', 'utils.js')
];

targetFiles.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    // Replace case-sensitive requires that fail on Linux
    content = content.replace(/require\(['"]\.\.\/utils\/dataType['"]\)/g, "require('../utils/datatype')");
    content = content.replace(/require\(['"]\.\/dataType['"]\)/g, "require('./datatype')");
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Patched: ${file}`);
  } else {
    console.warn(`File not found, skipping patch: ${file}`);
  }
});

console.log('Postinstall patch complete.');
