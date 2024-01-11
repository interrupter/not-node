/**
 * @typedef     {object}    notAppResponse
 * @property    {string}            status      ok or error
 * @property    {string}            message
 * @property    {Array<string>|Object<string, Array<string>>}     [errors]
 * @property    {object}            [result]
 * @property    {string}            [redirect]
 */

/**
 * @typedef {object} Query
 * @property {number} skip
 * @property {number} size
 * @property {object} sorter
 * @property {object} [filter]
 * @property {string} [search]
 */

/**
 * @typedef    {Object}    PreparedData
 * @property    {notAppIdentityData}    [identity]  user identity information
 * @property   {Object}    [data]
 * @property   {string}     [action]
 * @property   {Query}     [query]
 * @property   {number}    [targetID]       target item ID
 * @property   {Object}    [activeUser]     current user info
 * @property   {import('mongoose').Types.ObjectId}   [activeUserId]       current user document objectId
 * @property   {import('mongoose').Types.ObjectId}   [targetId]       target item objectId
 * @property   {string}    [ip]             current user ip
 * @property   {boolean}   [root]           current user is root
 * @property   {boolean}   [shouldOwn]      if user should be owner of targ
 *
 */

/**
 * @typedef    {object}    notRouteRule
 * @property   {string}    [actionName]
 * @property   {string}    [actionPrefix]
 * @property   {string}    [actionSignature]
 * @property   {boolean}   [root]
 * @property   {boolean}   [admin]
 * @property   {string|Array<string>}    [role]
 * @property   {boolean}   [safe]
 * @property   {boolean}   [auth]
 * @property   {boolean}   [user]
 * @property   {Array<string | Array<string>>}  [fields]
 * @property   {Array<string>}                  [return]
 */

/**
 * @typedef    {object}                         notActionData
 * @property   {string}                         [method]
 * @property   {string}                         [actionSignature]
 * @property   {string}                         [postFix]
 * @property   {Array<notRouteRule>}               rules
 * @property   {boolean}                        [ws]
 * @property   {Array<string & Array<string>>}  [fields]
 * @property   {Array<string>}                  [return]
 * @property   {boolean}                        [isArray]
 * @property   {Array<string>}                  [data]
 * @property   {string}                         [title]
 */

/**
 * @typedef    {Object}       notRouteData
 * @property   {string}       actionName
 * @property   {string}       modelName
 * @property   {notRouteRule}    rule
 * @property   {notActionData}   actionData
 */

/**
 * @typedef    {object}                            notUserDocumentProperties
 * @property   {import('mongoose').Types.ObjectId} _id
 * @property   {function}                          isRoot
 * @property   {function}                          isAdmin
 */

/**
 * @typedef {import('mongoose').Document & notUserDocumentProperties} notUserDocument
 */

/**
 * @typedef    {object}          notNodeExpressRequestProperties
 * @property   {notRouteData}    notRouteData
 * @property   {notUserDocument} user
 */

/**
 * @typedef     {import('express').Request & notNodeExpressRequestProperties}    notNodeExpressRequest
 */

/**
 *
 * @typedef     {object}        notAppIdentityData
 * @property    {boolean}       root        //system configuration administrator
 * @property    {boolean}       admin       //system content administrator
 * @property    {boolean}       auth        //authenticated user
 * @property    {Array<string>} role        //list of roles, exactly one should be primary role
 * @property    {string}        primaryRole //primary role
 * @property    {string}        uid         //user identificator
 * @property    {string}        sid         //user session identificator
 * @property    {string}        ip          //request source ip
 * @property    {string}        provider    //provider class name
 */

/**
 * @typedef     {string|function}    notAppFormPropertyProcessingPipeInstruction
 */

/**
 * @typedef     {Array<notAppFormPropertyProcessingPipeInstruction>}    notAppFormPropertyProcessingPipe
 */

/**
 * @typedef     {Object.<string, notAppFormPropertyProcessingPipe>}    notAppFormProcessingPipe
 */

/**
 * @typedef     {object}    notAppFormEnvExtractor
 * @property    {string}    name
 * @property    {any}       value
 */

/**
 * @typedef     {object}    notAppFormRateLimiterOptions
 * @property    {object}    [options]
 * @property    {string}    [options.keyPrefix]
 * @property    {number}    [options.points]
 * @property    {number}    [options.duration]
 * @property    {object}    [exception]
 * @property    {function}  [idGetter]
 * @property    {string}    [client]
 */
module.exports = {};
