const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

// Identify the root of the monorepo
const root = path.resolve(__dirname, '../..');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metrobundler').ConfigT}
 */
const config = {
  server: {
    enhanceMiddleware: (middleware) => {
      return (req, res, next) => {
        if (req.url === '/status') {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/plain');
          res.end('packager-status:running');
          return;
        }
        return middleware(req, res, next);
      };
    },
  },
  watchFolders: [root],
  resolver: {
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(root, 'node_modules'),
      path.resolve(root, 'node_modules/.pnpm/node_modules'),
    ],
    // Map @babel/runtime so all pnpm packages can resolve regenerator
    extraNodeModules: {
      '@babel/runtime': path.resolve(__dirname, 'node_modules/@babel/runtime'),
      'regenerator-runtime': path.resolve(root, 'node_modules/regenerator-runtime'),
    },
    // Prevent Metro from watching other apps' node_modules
    blockList: [
      /.*\/apps\/passenger-app\/.*/,
      /.*\/apps\/backend-api\/.*/,
    ],
  },
};

const defaultConfig = getDefaultConfig(__dirname);

// Safety check for middleware
if (!defaultConfig.server) defaultConfig.server = {};

module.exports = mergeConfig(defaultConfig, config);
