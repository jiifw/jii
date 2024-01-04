const merge = require('deepmerge');

// shared configs
const rootConfig = require('../../jest.config.js');

module.export = merge(rootConfig, {
  collectCoverageFrom: ['src/**/*.ts'],
});
