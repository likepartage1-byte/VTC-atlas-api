const path = require('path');

// Test each middleware separately
console.log('=== Testing middleware creation ===\n');

// 1. Test communityMiddleware
console.log('[1] Testing @react-native-community/cli-server-api');
try {
  const middleware = require('@react-native-community/cli-server-api');
  console.log('  exports:', Object.keys(middleware));
  const result = middleware.createDevServerMiddleware({
    host: 'localhost',
    port: 8081,
    watchFolders: [process.cwd()]
  });
  console.log('  result type:', typeof result);
  console.log('  result keys:', Object.keys(result || {}));
  console.log('  middleware property:', typeof result?.middleware);
  console.log('  middleware value:', result?.middleware);
} catch (err) {
  console.log('  ERROR:', err.message);
}

// 2. Test indexPageMiddleware
console.log('\n[2] Testing indexPageMiddleware');
try {
  const middleware = require('@react-native-community/cli-server-api');
  console.log('  indexPageMiddleware type:', typeof middleware.indexPageMiddleware);
  console.log('  indexPageMiddleware:', middleware.indexPageMiddleware);
  console.log('  indexPageMiddleware.name:', middleware.indexPageMiddleware?.name);
} catch (err) {
  console.log('  ERROR:', err.message);
}

// 3. Test @react-native/dev-middleware
console.log('\n[3] Testing @react-native/dev-middleware');
try {
  const devMiddleware = require('@react-native/dev-middleware');
  console.log('  exports:', Object.keys(devMiddleware));
  const result = devMiddleware.createDevMiddleware({
    projectRoot: process.cwd(),
    serverBaseUrl: 'http://localhost:8081',
    logger: { info: () => {}, log: () => {}, warn: () => {}, error: () => {} }
  });
  console.log('  result type:', typeof result);
  console.log('  result keys:', Object.keys(result || {}));
  console.log('  middleware type:', typeof result?.middleware);
  console.log('  middleware value:', result?.middleware);
  if (result?.middleware) {
    console.log('  middleware.handle type:', typeof result.middleware.handle);
    console.log('  middleware.use type:', typeof result.middleware.use);
  }
} catch (err) {
  console.log('  ERROR:', err.message);
  console.log('  Stack:', err.stack);
}

// 4. Now assemble the array as community-cli-plugin does
console.log('\n[4] Assembling unstable_extraMiddleware array');
try {
  const communityApi = require('@react-native-community/cli-server-api');
  const devMiddleware = require('@react-native/dev-middleware');
  
  const communityResult = communityApi.createDevServerMiddleware({
    host: 'localhost',
    port: 8081,
    watchFolders: [process.cwd()]
  });
  
  const devResult = devMiddleware.createDevMiddleware({
    projectRoot: process.cwd(),
    serverBaseUrl: 'http://localhost:8081',
    logger: { info: () => {}, log: () => {}, warn: () => {}, error: () => {} }
  });
  
  const array = [
    communityResult?.middleware,
    communityApi.indexPageMiddleware,
    devResult?.middleware,
  ];
  
  console.log('  Array length:', array.length);
  array.forEach((item, i) => {
    console.log(`  [${i}] type: ${typeof item}, isUndefined: ${item === undefined}, value: ${item ? item.constructor.name : 'null/undefined'}`);
  });
  
  const undefinedCount = array.filter(x => x === undefined).length;
  console.log(`\n  ❌ UNDEFINED COUNT: ${undefinedCount}`);
  
  if (undefinedCount > 0) {
    console.log('  THIS IS THE ROOT CAUSE!');
    array.forEach((item, i) => {
      if (item === undefined) {
        console.log(`  Element [${i}] is undefined`);
      }
    });
  }
} catch (err) {
  console.log('  ERROR:', err.message);
  console.log('  Stack:', err.stack?.split('\n').slice(0, 5).join('\n'));
}
