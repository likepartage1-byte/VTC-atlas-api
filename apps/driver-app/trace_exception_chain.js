// Complete trace of how undefined reaches connect.use()

const path = require('path');

console.log('=== COMPLETE EXCEPTION PROPAGATION CHAIN ===\n');

// Step 1: Check what middleware.js exports
console.log('[STEP 1] @react-native/community-cli-plugin middleware module');
const middlewareModule = require(path.resolve('../../node_modules/@react-native/community-cli-plugin/dist/commands/start/middleware.js'));
console.log('  Exports:', Object.keys(middlewareModule));
console.log('  indexPageMiddleware type:', typeof middlewareModule.indexPageMiddleware);
console.log('  indexPageMiddleware value:', middlewareModule.indexPageMiddleware);

// Step 2: Check what cli-server-api has
console.log('\n[STEP 2] @react-native-community/cli-server-api');
const cliServerApi = require('@react-native-community/cli-server-api');
console.log('  Exports:', Object.keys(cliServerApi));
console.log('  indexPageMiddleware exists:', 'indexPageMiddleware' in cliServerApi);
console.log('  indexPageMiddleware value:', cliServerApi.indexPageMiddleware);

// Step 3: Show what middleware.js tries to do
console.log('\n[STEP 3] What middleware.js code does (simulated):');
const simulated = {
  communityMiddlewareFallback: {
    indexPageMiddleware: () => console.log('fallback')
  }
};
console.log('  Before assignment:');
console.log('    indexPageMiddleware type:', typeof simulated.communityMiddlewareFallback.indexPageMiddleware);
console.log('    indexPageMiddleware value:', simulated.communityMiddlewareFallback.indexPageMiddleware);

console.log('  Executing: communityMiddlewareFallback.indexPageMiddleware = community.indexPageMiddleware');
simulated.communityMiddlewareFallback.indexPageMiddleware = cliServerApi.indexPageMiddleware;

console.log('  After assignment:');
console.log('    indexPageMiddleware type:', typeof simulated.communityMiddlewareFallback.indexPageMiddleware);
console.log('    indexPageMiddleware value:', simulated.communityMiddlewareFallback.indexPageMiddleware);

// Step 4: Show what runServer.js receives
console.log('\n[STEP 4] What runServer.js receives:');
const communityMiddleware = { middleware: () => {} };
const indexPageMiddleware = middlewareModule.indexPageMiddleware;
const devMiddleware = { middleware: () => {} };

const unstable_extraMiddleware = [
  communityMiddleware.middleware,
  indexPageMiddleware,
  devMiddleware.middleware,
];

console.log('  unstable_extraMiddleware array:');
unstable_extraMiddleware.forEach((item, i) => {
  console.log(`    [${i}] type: ${typeof item}, value: ${item === undefined ? 'UNDEFINED' : item.constructor.name}`);
});

// Step 5: Show what connect.use() receives
console.log('\n[STEP 5] What connect.use() receives in the loop:');
const connect = require('connect');
const serverApp = connect();

console.log('  Loop: for (const handler of unstable_extraMiddleware ?? [])');
console.log('    serverApp.use(handler)');

unstable_extraMiddleware.forEach((handler, i) => {
  console.log(`\n  Iteration ${i}:`);
  console.log(`    handler = ${typeof handler === 'undefined' ? 'undefined' : handler.constructor.name}`);
  console.log(`    Calling serverApp.use(${typeof handler === 'undefined' ? 'undefined' : 'function'})`);
  
  if (typeof handler === 'undefined') {
    console.log('    ❌ connect/index.js will try to access undefined.handle');
    console.log('    💥 ERROR: Cannot read properties of undefined (reading \'handle\')');
  }
});

console.log('\n=== ROOT CAUSE SUMMARY ===');
console.log('1. cli-server-api does NOT export indexPageMiddleware');
console.log('2. middleware.js assigns undefined to communityMiddlewareFallback.indexPageMiddleware');
console.log('3. exports.indexPageMiddleware becomes undefined');
console.log('4. runServer.js adds undefined to unstable_extraMiddleware[1]');
console.log('5. Metro iterates: serverApp.use(undefined)');
console.log('6. connect/index.js tries: typeof undefined.handle === \'function\'');
console.log('7. CRASH: Cannot read properties of undefined (reading \'handle\')');
