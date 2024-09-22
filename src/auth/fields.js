const ABSTRACT = require("./abstract");
const COMMON = require("../common");
const CONST = require("./const");
const { objHas } = require("../common");

/**
 * Get data owner ObjectId
 * @param {Object}             data  Document Object
 * @return {import('mongoose').Schema.Types.ObjectId|undefined}     owner ObjectId or undefined if field is not found
 */
function getOwnerId(data, ownerFieldName = CONST.DOCUMENT_OWNER_FIELD_NAME) {
    if (typeof data !== "object") {
        return undefined;
    }
    if (
        data[ownerFieldName] &&
        COMMON.validateObjectId(data[ownerFieldName].toString())
    ) {
        return data[ownerFieldName];
    }
    return undefined;
}

/**
 * Check if data is belongs to user
 * @param {Object}   data      object
 * @param {import('mongoose').Schema.Types.ObjectId|string} user_id   possible owner
 * @return {boolean}           true - belongs, false - not belongs
 **/

function isOwner(
    data,
    user_id,
    ownerFieldName = CONST.DOCUMENT_OWNER_FIELD_NAME
) {
    const ownerId = getOwnerId(data, ownerFieldName);

    if (typeof ownerId !== "undefined") {
        return COMMON.compareObjectIds(ownerId, user_id);
    } else {
        return false;
    }
}

/**
 * Checks if safe field rule is some sort variant of wild card
 * @param {string|Array<string>}   safeFor safe field rule
 * @return {boolean}               if it's wildcard
 *
 */
function ruleIsWildcard(safeFor) {
    if (Array.isArray(safeFor)) {
        return safeFor.includes("*");
    } else {
        return safeFor === "*";
    }
}

/**
 * Check if field of target object is safe to access by actor with defined
 * roles in specific action
 * @param {Object}         field     description of field from schema
 * @param {string}         action    action to check against
 * @param {Array<string>}  roles     actor roles
 * @param {Array<string>}         special   special relations of actor and target (@owner, @system)
 * @return {boolean}                 true - safe
 **/
function fieldIsSafe(field, action, roles, special) {
    //if safe absent - then field is not accessible
    if (objHas(field, "safe") && objHas(field.safe, action)) {
        //anyone can
        if (ruleIsWildcard(field.safe[action])) {
            return true;
        }
        //if there're list of roles
        if (!Array.isArray(field.safe[action])) {
            return false;
        }
        if (
            //если роли пользователя в списке
            ABSTRACT.intersect_safe(roles, field.safe[action]).length || //или
            //он в спец группе (владелец@owner, система@system),т.е.
            //владеет данными или это системное действие
            ABSTRACT.intersect_safe(special, field.safe[action]).length
        ) {
            return true;
        }
    }
    return false;
}

/**
 * Creates array of special roles
 * @param {boolean} owner  if actor is owner of document
 * @param {boolean} system if actor is a system process
 * @return {Array<string>} list of special roles
 **/
function createSpecial(owner, system) {
    let special = [];
    if (owner === true) {
        special.push("@owner");
    }
    if (system === true) {
        special.push("@system");
    }
    return special;
}

/**
 * Scans schema checks every field access regulations for specific action of
 * actor with roles. Returns list of fields that could be accessed safely.
 * @param {Object}         schema    mongoose model schema with extended fields from not-*
 * @param {string}         action    action to check against
 * @param {Array<string>}  roles     actor roles
 * @param {boolean}        owner     actor is an owner of document
 * @param {boolean}        system    actor is a system procedure
 * @return {Array<string>}           list of accessible fields
 **/
function getSafeFieldsForRoleAction(schema, action, roles, owner, system) {
    let fields = [];
    let special = createSpecial(owner, system);
    for (let t in schema) {
        let field = schema[t];
        if (fieldIsSafe(field, action, roles, special)) {
            fields.push(t);
        }
    }
    return fields;
}

/**
 * Using schema and information about action and actor to extract only safe information
 * forming new object with data only from safe fields
 * @param {Object}         schema    mongoose model schema with extended fields from not-*
 * @param {string}         action    action to check against
 * @param {Object}         data      source of data to extract from
 * @param {Array<string>}  roles     actor roles
 * @param {import('mongoose').Schema.Types.ObjectId} actorId   actor objectId
 * @param {boolean}        system    true if actor is a system procedure
 * @return {Object}                  object containing only data from safe fields
 **/
function extractSafeFields(
    schema,
    action,
    data,
    roles,
    actorId,
    system = false,
    ownerFieldName = CONST.DOCUMENT_OWNER_FIELD_NAME
) {
    let fields = getSafeFieldsForRoleAction(
        schema,
        action,
        roles,
        isOwner(data, actorId, ownerFieldName),
        system
    );
    let result = {};
    fields.forEach((field) => {
        if (objHas(data, field)) {
            result[field] = data[field];
        }
    });
    return result;
}

module.exports = {
    getSafeFieldsForRoleAction,
    fieldIsSafe,
    extractSafeFields,
    isOwner,
    getOwnerId,
    ruleIsWildcard,
    createSpecial,
};
