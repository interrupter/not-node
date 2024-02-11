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
 * @property   {string}                         [method]            HTTP method name GET,PUT,POST,DELETE
 * @property   {string}                         [actionSignature]   one of create,read,update,delete,any
 * @property   {string}                         [postFix]           uri rule
 * @property   {Array<notRouteRule>}            rules               access rules
 * @property   {boolean}                        [ws]                use WS routers for this actions
 * @property   {Array<string & Array<string>>}  [fields]            array of fields names or fields set aliases, used in form generators, validators
 * @property   {Array<string>}                  [return]            rule to filter results, used to exclude from response sensetive data
 * @property   {boolean}                        [isArray]           obsolete
 * @property   {Array<string>}                  [data]              list consisting of sources (pager,sorter,search,record) for request generation on client side
 * @property   {string}                         [title]             used in form generators
 */

/**
 * @typedef    {Object}             notRouteData
 * @property   {string}             actionName          name of action
 * @property   {string}             modelName           first letter should not be not capital
 * @property   {notRouteRule}       rule                current rule
 * @property   {notActionData}      actionData          action details
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

/**
 * @typedef {object}    notFieldSafety
 * @property    {Array<string>} create
 * @property    {Array<string>} update
 * @property    {Array<string>} read
 */

/**
 * @typedef     {Number|String|Array|Object|Date|import('mongoose').Types.ObjectId|import('mongoose').Schema.Types.Mixed}    notFieldModelType
 */

/**
 * @typedef     {object}    notFieldModel
 * @property    {notFieldModelType}    type
 * @property    {any}       default             default value
 * @property    {boolean}   [sortable]          if field is sortable
 * @property    {boolean}   [required]          if required to be defined
 * @property    {notFieldSafety}    [safe]      safety requirements
 * @property    {string}    [ref]               mongoose model name, if type is ObjectId
 * @property    {string}    [refPath]           path to field with name of mongoose model this field value of ObjectId type reference to
 */

/**
 * @typedef     {object}    notFieldUI
 * @property    {string}    component       name of component to render
 * @property    {string}    [label]           field label text or locale string
 * @property    {string}    [placeholder]     field placeholder text or locale string
 * @property    {boolean}   [readonly]          if component readonly or not
 */

/**
 * @typedef     {object} notField
 * @property    {notFieldUI}        [ui]
 * @property    {notFieldModel}     [model]
 */

/**
 * @typedef {string}    uuid
 */

/**
 * @typedef {object}    ListAndCountResult
 * @property {Array<notAppDocument>}    list    list of extended mongoose documents
 * @property {number} skip                      count of skiped from start of set
 * @property {number} count                     total count of documents in this set
 * @property {number} page                      number of returned page
 * @property {number} pages                     total count of pages in this set
 */

/**
 * @typedef     {object}    notAppModelMethods
 * @property    {function(object):object} sanitizeInput
 * @property    {function(uuid, [Array<string>], [object]):Promise<notAppDocument>} getOne
 * @property    {function(number, [Array<string>], [object]):Promise<notAppDocument>} getOneByID
 * @property    {function(uuid, [object]):Promise<notAppDocument>} getOneRaw
 * @property    {function(string, object):Promise<notAppDocument|Array<notAppDocument>|undefined>} makeQuery
 * @property    {function(number, number, object, object|Array):Promise<Array<notAppDocument>>} list
 * @property    {function(string, Array<String>, object, Array<String>):Promise<Array<notAppDocument>>} listByField
 * @property    {function([object]):Promise<Array<notAppDocument>>} listAll
 * @property    {function(object|array):Promise<Array<notAppDocument>>} listAllAndPopulate
 * @property    {function(object):Promise<number>} countWithFilter
 * @property    {function(number, number, object, object | Array, Array<String>):Promise<Array<notAppDocument>>} listAndPopulate
 * @property    {function(number, number, object, object|array, object|array, object):Promise<ListAndCountResult>} listAndCount
 * @property    {function(object):Promise<notAppDocument>} add
 * @property    {function(object, object, boolean):Promise<notAppDocument|undefined>} update
 * @property    {function(object):Promise<undefined>} removeOne
 * @property    {function(object):Promise<undefined>} removeMany
 */

/**
 * @typedef     {import('mongoose').Model & notAppModelMethods}    notAppModel
 **/

/**
 * @typedef     {object}    notAppDocumentMethods
 * @property    {function():number} getID
 * @property    {function([object]):Promise<notAppDocument|undefined>} close
 * @property    {function():Promise<notAppDocument>} saveNewVersion
 **/

/**
 * @typedef     {import('mongoose').Document & notAppDocumentMethods}    notAppDocument
 **/

module.exports = {};
