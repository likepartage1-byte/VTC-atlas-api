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
  watchFolders: [root],
  resolver: {
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(root, 'node_modules'),
    ],
  },
};

const defaultConfig = getDefaultConfig(__dirname);

// Safety check for middleware
if (!defaultConfig.server) defaultConfig.server = {};

module.exports = mergeConfig(defaultConfig, config);
