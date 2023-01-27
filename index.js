/**
 * @module not-node
 */

module.exports.Env = require("./src/env.js");
/** Error module
 * @type {not-node/Error}
 */
module.exports.Error = require("./src/error.js");
/** Authentication module */
module.exports.Auth = require("./src/auth");
/** Manifest infrastructure */
module.exports.Manifest = require("./src/manifest/manifest");
/** Request result properties filtering */
module.exports.notManifestRouteResultFilter = require("./src/manifest/result.filter");
/** Web Application */
module.exports.notApp = require("./src/app");
/** Application User Identity */
module.exports.notAppIdentity = require("./src/identity");
/** Application User Identity */
module.exports.Identity = require("./src/identity/identity");
/** General Application */
module.exports.notDomain = require("./src/domain");
/** Mongoose Documents versioning */
module.exports.Versioning = require("./src/model/versioning");
/** Mongoose Model autoincrement field */
module.exports.Increment = require("./src/model/increment");
/** Mongoose Model prototype */
module.exports.Proto = require("./src/model/proto");
/** Mongoose Model additional features enricher */
module.exports.Enrich = require("./src/model/enrich");
/** Mongoose Documents routine operation*/
module.exports.Routine = require("./src/model/routine");
/** Common functions */
module.exports.Common = require("./src/common");
/** Fields library manager */
module.exports.Fields = require("./src/fields");
module.exports.Forms = require("./src/form");
/** Form validation template **/
module.exports.Form = require("./src/form").Form;
/** Form validation template fabric **/
module.exports.FormFabric = require("./src/form").FormFabric;
/** Application initialization procedures */
module.exports.Init = require("./src/init").Init;
/** Application object */
module.exports.Application = null;
/** Application bootstrap helpers */
module.exports.Bootstrap = require("./src/bootstrap");
/** Application generic helpers */
module.exports.Generic = require("./src/generic/index.js");

/** Application stylers */
//for page's meta information
module.exports.notMetasStyler = require("./src/metas.js");
//for http headers files, web pages, XHR etc
module.exports.notHeadersStyler = require("./src/headers.js");
