/**
* @module not-node
*/

/** Error module
 * @type {not-node/Error}
 */
module.exports.Error = require('./src/error.js');
/** Authentication module */
module.exports.Auth = require('./src/auth');
/** Manifest infrastructure */
module.exports.Manifest = require('./src/manifest/manifest.js');
/** Web Application */
module.exports.notApp = require('./src/app.js');
/** General Application */
module.exports.notDomain = require('./src/domain.js');
/** Mongoose Documents versioning */
module.exports.Versioning = require('./src/model/versioning.js');
/** Mongoose Model autoincrement field */
module.exports.Increment = require('./src/model/increment.js');
/** Mongoose Model prototype */
module.exports.Proto = require('./src/model/proto.js');
/** Mongoose Model additional features enricher */
module.exports.Enrich = require('./src/model/enrich.js');
/** Mongoose Documents routine operation*/
module.exports.Routine = require('./src/model/routine.js');
/** Common functions */
module.exports.Common = require('./src/common.js');
/** Fields library manager */
module.exports.Fields = require('./src/fields.js');
/** Application initialization procedures */
module.exports.Init = require('./src/init').Init;
/** Application object */
module.exports.Application = null;
