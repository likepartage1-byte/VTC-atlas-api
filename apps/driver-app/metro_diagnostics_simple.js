const path = require('path');
const fs = require('fs');

console.log('===== PATH PATH PATH =====');
console.log('__dirname:', __dirname);
console.log('Process CWD:', process.cwd());

const projectRoot = __dirname;
const indexTsx = path.join(projectRoot, 'index.tsx');

console.log('\nResolved index.tsx path:', indexTsx);
console.log('index.tsx exists?', fs.existsSync(indexTsx));

// Check specifically for double spaces
if (indexTsx.includes('vtc  ')) {
    console.log('✅ Found DOUBLE spaces in resolved path.');
} else if (indexTsx.includes('vtc ')) {
    console.log('⚠️ ONLY SINGLE space found in resolved path (possible collapse).');
} else {
    console.log('❌ Path does not contain "vtc".');
}

// Check what Metro config sees
try {
    const {getDefaultConfig} = require('@react-native/metro-config');
    const config = getDefaultConfig(__dirname);
    console.log('\n===== Metro Config Internal =====');
    console.log('projectRoot in config:', config.projectRoot);
    console.log('index.tsx exists from config root?', fs.existsSync(path.join(config.projectRoot, 'index.tsx')));
} catch (e) {
    console.log('Could not load metro config:', e.message);
}
