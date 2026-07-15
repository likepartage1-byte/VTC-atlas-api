const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function(id) {
  const mod = originalRequire.apply(this, arguments);
  
  if (id === 'metro') {
    const originalRunServer = mod.runServer;
    mod.runServer = async function(config, options) {
      console.log('=== METRO_RUNSERVER_CALLED ===');
      console.log('extraMiddleware count:', options.unstable_extraMiddleware?.length ?? 0);
      
      if (options.unstable_extraMiddleware) {
        console.log('--- Middleware Array Contents ---');
        options.unstable_extraMiddleware.forEach((handler, idx) => {
          const typeInfo = typeof handler;
          const isUndefined = handler === undefined;
          const isNull = handler === null;
          const constructorName = handler ? handler.constructor.name : 'N/A';
          const hasHandle = handler && handler.handle !== undefined;
          
          console.log(`[${idx}]:`);
          console.log(`  type: ${typeInfo}`);
          console.log(`  isUndefined: ${isUndefined}`);
          console.log(`  isNull: ${isNull}`);
          console.log(`  constructor: ${constructorName}`);
          console.log(`  has .handle: ${hasHandle}`);
          if (typeInfo === 'function') {
            console.log(`  is function: true, name=${handler.name}`);
          }
        });
        console.log('--- End Contents ---');
      }
      
      try {
        return await originalRunServer.call(this, config, options);
      } catch (err) {
        console.log('METRO_ERROR:', err.message);
        console.log('STACK:', err.stack);
        throw err;
      }
    };
  }
  
  return mod;
};

process.argv = ['node', 'react-native', 'start', '--port', '8081'];
const path = require('path');
try {
  require(path.resolve('../../node_modules/react-native/cli.js'));
} catch (err) {
  console.log('INIT_ERROR:', err.message);
}
