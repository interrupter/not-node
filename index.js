/**
* @module not-node
*/

module.exports.Env = require('./src/env.js');
/** Error module
 * @type {not-node/Error}
 */
module.exports.Error = require('./src/error.js');
/** Authentication module */
module.exports.Auth = require('./src/auth');
/** Manifest infrastructure */
module.exports.Manifest = require('./src/manifest/manifest');
/** Web Application */
module.exports.notApp = require('./src/app');
/** General Application */
module.exports.notDomain = require('./src/domain');
/** Mongoose Documents versioning */
module.exports.Versioning = require('./src/model/versioning');
/** Mongoose Model autoincrement field */
module.exports.Increment = require('./src/model/increment');
/** Mongoose Model prototype */
module.exports.Proto = require('./src/model/proto');
/** Mongoose Model additional features enricher */
module.exports.Enrich = require('./src/model/enrich');
/** Mongoose Documents routine operation*/
module.exports.Routine = require('./src/model/routine');
/** Common functions */
module.exports.Common = require('./src/common');
/** Fields library manager */
module.exports.Fields = require('./src/fields');
/** Application initialization procedures */
module.exports.Init = require('./src/init').Init;
/** Application object */
module.exports.Application = null;
