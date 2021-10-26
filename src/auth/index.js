/** @module Auth */

const CONST = require('./const');
const ABSTRACT = require('./abstract');
const FIELDS = require('./fields');
const ROLES = require('./roles');
const RULES = require('./rules');
const ROUTES = require('./routes');
const SESSION = require('./session');

module.exports = {
  ...CONST,
  ...ABSTRACT,
  ...SESSION,
  ...ROLES,
  ...RULES,
  ...ROUTES,
  ...FIELDS
};
