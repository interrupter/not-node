const {generatePaths} = require('../common');

module.exports = {
  name: 'not-node',
  paths: generatePaths(['fields', 'locales'], __dirname)
};
