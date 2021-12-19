const clone = require('rfdc')();
const notPath = require('not-path');

const {notError} = require('not-error');

const {
  objHas,
} = require('../common');

const DEFAULT_TYPE = 'ui';
const DEFAULT_FROM = ':FIELDS';
const DEFAULT_TO = ':thisSchema';

module.exports.initFileSchemaFromFields = ({app, mod, type = DEFAULT_TYPE, from = DEFAULT_FROM, to = DEFAULT_TO})=>{
  const FIELDS = notPath.get(from, mod);
  if(FIELDS && Array.isArray(FIELDS)){
    const schema = module.exports.createSchemaFromFields(app, FIELDS, type);
    notPath.set(to, mod, schema);
  }
};

/**
fields = [
  'title', //for standart only name
  ['titleNonStandart', {component: 'UITextforBlind'}] //arrays of [name, mutation]
  ['someID', {}, 'ID'],  //copy of standart ID field under name as someID
]
**/
module.exports.createSchemaFromFields = (app, fields, type = 'ui') => {
  let schema = {};
  fields.forEach((field) => {
    let [schemaFieldName, schemaFieldValue] = module.exports.initSchemaField(app, field, false, type);
    schema[schemaFieldName] = schemaFieldValue;
  });
  return schema;
};


module.exports.initSchemaField = (app, field, resultOnly = true, type = 'ui') => {
  let {
    srcName,
    destName,
    mutation
  } = parseFieldDescription(field);
  let proto = findFieldPrototype(app, srcName, type);
  if(!proto){
    throw new notError(
      'not-core:field_prototype_is_not_found',
      {
        field, resultOnly, type
      }
    );
  }
  let schemaFieldValue = Object.assign({}, clone(proto), mutation);
  if (resultOnly) {
    return schemaFieldValue;
  } else {
    return [destName, schemaFieldValue];
  }
};

const parseFieldDescription = (field) => {
  let srcName,
    destName,
    mutation = {};
  if (Array.isArray(field)) {
    destName = srcName = field[0];
    mutation = field[1];
    if (field.length === 3) {
      srcName = field[2];
    }
  } else {
    destName = srcName = field;
  }
  return {
    srcName,
    destName,
    mutation
  };
};

const findFieldPrototype = (app, name, type) => {
  const fieldPrototype = app.getField(name);
  if(fieldPrototype && objHas(fieldPrototype, type)){
    return fieldPrototype[type];
  }else{
    return null;
  }
};

module.exports.initManifestFields = (app, schema, rawMutationsList = []) => {
  let
    //shallow copy of array
    mutationsList = [...rawMutationsList],
    list = [];
  if (schema && Object.keys(schema).length > 0) {
    let rawKeys = Object.keys(schema);
    rawKeys.forEach((key) => {
      let mutation = getMutationForField(key, mutationsList);
      if (mutation) {
        list.push(mutation);
        mutationsList.splice(mutationsList.indexOf(mutation), 1);
      } else {
        list.push(key);
      }
    });
    list.push(...mutationsList);
    return module.exports.createSchemaFromFields(app, list, 'ui');
  }else{
    return {};
  }
};

/**
* Returns mutation tuple for a field or false
* @param {string} name  field name
* @param {Array} list  fields description lists
* @return {boolean|item}
*/
function getMutationForField(name, list) {
  for(let item of list){
    if (Array.isArray(item) && item[0] === name) {
      return item;
    }
  }
  return false;
}
module.exports.getMutationForField = getMutationForField;
