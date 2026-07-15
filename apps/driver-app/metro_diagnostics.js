const {loadConfig} = require('@react-native-community/cli-plugin-metro');
const path = require('path');

async function debugMetro() {
  console.log('===== Metro Diagnostics =====');
  console.log('Process CWD:', process.cwd());
  console.log('__dirname:', __dirname);
  
  try {
    const config = await loadConfig({
      projectRoot: process.cwd(),
    });
    
    console.log('\n===== Resolved Metro Config =====');
    console.log('projectRoot:', config.projectRoot);
    console.log('watchFolders:', config.watchFolders);
    
    const indexTsxPath = path.resolve(config.projectRoot, 'index.tsx');
    console.log('\n===== Entry File Check =====');
    console.log('Resolved Path to index.tsx:', indexTsxPath);
    
    const fs = require('fs');
    console.log('Does index.tsx exist at this path?', fs.existsSync(indexTsxPath));
    
    // Check if spaces are collapsed in the resolved path
    if (indexTsxPath.includes('vtc ') && !indexTsxPath.includes('vtc  ')) {
      console.log('\n⚠️ ALERT: Spaces have been collapsed (Double space -> Single space)');
    } else {
      console.log('\n✅ Double spaces preserved in path.');
    }

  } catch (error) {
    console.error('Error loading config:', error);
  }
}

debugMetro();
