const clone = require("rfdc")();
const notPath = require("not-path");
const { error } = require("not-log")(module, "init//fields");

const { objHas } = require("../common");

const DEFAULT_TYPE = "ui";
const DEFAULT_FROM = ":FIELDS";
const DEFAULT_TO = ":thisSchema";
const DEFAULT_SPLITER = "//";

module.exports.initFileSchemaFromFields = ({
    app,
    mod,
    type = DEFAULT_TYPE,
    from = DEFAULT_FROM,
    to = DEFAULT_TO,
    moduleName = "",
}) => {
    const FIELDS = notPath.get(from, mod, {});
    if (FIELDS && Array.isArray(FIELDS)) {
        const schema = module.exports.createSchemaFromFields(
            app,
            normalizeFieldsDescriptionsList(FIELDS),
            type,
            moduleName
        );
        notPath.set(to, mod, schema);
    }
};

/**
fields = [{
    srcName:string,
    destName:string,
    mutation:object,
}]
**/
module.exports.createSchemaFromFields = (
    app,
    fields,
    type = "ui",
    moduleName
) => {
    let schema = {};
    fields.forEach((fieldDescription) => {
        let [schemaFieldName, schemaFieldValue] =
            module.exports.initSchemaField(
                app,
                fieldDescription,
                false,
                type,
                moduleName
            );
        schema[schemaFieldName] = schemaFieldValue;
    });
    return schema;
};

module.exports.initSchemaField = (
    app,
    fieldDescription,
    resultOnly = true,
    type = "ui",
    moduleName
) => {
    //log(field);
    let { srcName, destName, mutation } = fieldDescription;
    let proto = findFieldPrototype(app, srcName, type);
    if (!proto) {
        error(
            `${type} field ${moduleName}//${destName} prototype ${srcName}  is not found`
        );
    }
    let schemaFieldValue = Object.assign({}, clone(proto), mutation);
    if (resultOnly) {
        return schemaFieldValue;
    } else {
        return [destName, schemaFieldValue];
    }
};

/**
 * field form
 * 'destFieldNameSameAsSourceFieldName' - form 1
 * ['destFieldName', {full: true, field: 'content'}] - form 2
 * ['destFieldName', 'srcFieldName'] //field alias, form 3
 * ['destFieldName', {mutation: 'content'}, 'srcFieldName']// - form 4
 * 'module-name//field-name' - form 5, equal to ['field-name', 'module-name//field-name']
 **/
const parseFieldDescription = (field) => {
    let srcName,
        destName,
        mutation = {};
    if (Array.isArray(field)) {
        destName = srcName = field[0];
        if (field.length === 2) {
            if (typeof field[1] === "string") {
                srcName = field[1]; //form 3
            } else {
                mutation = field[1]; //form 2
            }
        } else if (field.length === 3) {
            //form 4
            mutation = field[1];
            srcName = field[2];
        }
    } else {
        if (field.includes(DEFAULT_SPLITER)) {
            //form 5
            destName = field.split(DEFAULT_SPLITER)[1];
            srcName = field;
        } else {
            destName = srcName = field; //form 1
        }
    }
    return {
        srcName,
        destName,
        mutation,
    };
};

const findFieldPrototype = (app, name, type) => {
    const fieldPrototype = app.getField(name);
    if (fieldPrototype && objHas(fieldPrototype, type)) {
        return fieldPrototype[type];
    } else {
        return null;
    }
};

const filterOutPrivateFieldsFromNormalizedFieldDescription = (
    privateFields
) => {
    return ({ destName }) => {
        return !privateFields.includes(destName);
    };
};

const normalizeFieldsDescriptionsList = (list) => {
    return list.map(parseFieldDescription);
};
module.exports.normalizeFieldsDescriptionsList =
    normalizeFieldsDescriptionsList;
/**
 * Creates fields UI representation schema from list of fields in DB model
 * and library of fields
 * @param {object} app     notApplication instance
 * @param {object} rawFieldsList  model db schema
 * @param {Array<string|Array>} rawMutationsList     fields mutations, for little tuning
 * @param {Array<string>} privateFields     fields to omit from result
 * @param {string} moduleName     for detailed reports on issues, in which module and what field is faulty
 * @returns {object}       resulting UI rendering schema for fields
 **/

module.exports.initManifestFields = (
    app, //notApplication
    rawFieldsList, //raw fields list of model
    rawMutationsList = [], //fields mutations
    privateFields = [], //fields to omit
    moduleName //module name for reporting
) => {
    const //shallow copy of array
        normalizedMutationsList = [
            ...normalizeFieldsDescriptionsList(rawMutationsList),
        ],
        resultFields = [];

    if (
        rawFieldsList &&
        Array.isArray(rawFieldsList) &&
        rawFieldsList.length > 0
    ) {
        const normalizedFieldsList =
            normalizeFieldsDescriptionsList(rawFieldsList);
        normalizedFieldsList
            .filter(
                filterOutPrivateFieldsFromNormalizedFieldDescription(
                    privateFields
                )
            )
            .forEach((fieldDescription) => {
                const { srcName, destName } = fieldDescription;
                const fieldMutationDescription = getMutationForField(
                    destName,
                    normalizedMutationsList
                );
                if (fieldMutationDescription) {
                    resultFields.push({
                        srcName,
                        destName,
                        mutation: fieldMutationDescription.mutation,
                    });
                    normalizedMutationsList.splice(
                        normalizedMutationsList.indexOf(
                            fieldMutationDescription
                        ),
                        1
                    );
                } else {
                    resultFields.push({
                        srcName,
                        destName,
                        mutation: {},
                    });
                }
            });
        resultFields.push(...normalizedMutationsList);
    } else {
        resultFields.push(...normalizedMutationsList);
    }
    return module.exports.createSchemaFromFields(
        app,
        resultFields,
        "ui",
        moduleName
    );
};

/**
 * Returns mutation tuple for a field or false
 * @param {string} destName  field name
 * @param {Array} normalizedFieldsList  fields description lists
 * @return {Object}
 */
function getMutationForField(destName, normalizedFieldsList) {
    for (let mutationFieldDescription of normalizedFieldsList) {
        const { destName: mutationDest } = mutationFieldDescription;
        if (mutationDest === destName) {
            return mutationFieldDescription;
        }
    }
    return null;
}
module.exports.getMutationForField = getMutationForField;

function mutateFieldSide(field, mutation, side) {
    if (Object.hasOwn(mutation, side)) {
        if (Object.hasOwn(field, side)) {
            field[side] = { ...field[side], ...mutation[side] };
        } else {
            field[side] = mutation[side];
        }
    }
}

module.exports.mutateFieldSide = mutateFieldSide;

function mutateField(sourceField, sourceMutation) {
    const sides = ["ui", "model"];
    let field = clone(sourceField);
    let mutation = clone(sourceMutation);
    if (mutation) {
        sides.forEach((side) => mutateFieldSide(field, mutation, side));
    }
    return field;
}

module.exports.mutateField = mutateField;
