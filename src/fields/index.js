const fs = require('fs');
const path = require('path');
const {objHas, tryFile} = require('../common');

const DEFAULT_FIELD_REGISTRATION_RULES = {
  overwrite: false,
  compose: true
};

const FIELDS = {};


module.exports.importFromDir = (srcDir, {overwrite = false, compose = true} = DEFAULT_FIELD_REGISTRATION_RULES)=>{
  fs.readdirSync(srcDir).forEach((file) => {
    let fromPath = path.join(srcDir, file);
    if (!tryFile(fromPath)) { return; }
    const parts = path.parse(fromPath);
    registerField(parts.name, require(fromPath), {overwrite, compose});
  });
};

const registerField = module.exports.registerField = (name, value, {overwrite = false, compose = true} = DEFAULT_FIELD_REGISTRATION_RULES)=>{
  if(objHas(FIELDS, name)){
    if(overwrite){
      FIELDS[name] = value;
    }else if(compose){
      Object.assign(FIELDS[name], value);
    }
  }else{
    FIELDS[name] = value;
  }
};

module.exports.registerFields = (fields, {overwrite = false, compose = true})=>{
  for(let t in fields){
    module.exports.registerField(t, fields[t], {overwrite, compose});
  }
};

/**
list = [
  'title', //for standart only name
  ['titleNonStandart', {component: 'UITextforBlind'}] //arrays of [name, mutation]
  ['someID', {}, 'ID'],  //copy of standart ID field under name as someID
]
*/
module.exports.initFields = (list, type = 'ui') => {
  let fields = {};
  list.forEach((field) => {
    let res = module.exports.initField(field, false, type);
    fields[res[0]] = res[1];
  });
  return fields;
};


/**
* Retrieves field information
* there are few signatures of this function
* (field:string, resultOnly:boolean = true, type:string = 'ui')=> Object | [string, Object]
* (field:Array<string, Object>, resultOnly:boolean = true, type:string = 'ui')=> Object | [string, Object]
* @param {(string|Array)} field   field to retrieve from store and init
                                  field: string - just name of the field
                                  field: Array - [destinationField:string, mutation: Object, sourceField:string]
                                  field: Array - [sourceField:string, mutation: Object]
                                                sourceField - standart field to extend
                                                mutation - to extend by
                                                destinationField - name of resulting field,
                                                if no dest then src will be used
* @param {boolean}  resultOnly    return only result, if false then returns [name, value]
* @param {string}   type          type of field information
**/
module.exports.initField = (field, resultOnly = true, type = 'ui') => {
  let srcName, destName, mutation = {};
  if (Array.isArray(field)) {
    destName = srcName = field[0];
    mutation = field[1];
    if (field.length === 3) {
      srcName = field[2];
    }
  } else {
    destName = srcName = field;
  }
  let proto = (objHas(FIELDS, srcName) && objHas(FIELDS[srcName], type)) ? FIELDS[srcName][type]:{};
  let result = Object.assign({}, proto, mutation);
  if (resultOnly) {
    return result;
  } else {
    return [destName, result];
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

/**
* Takes in mongoose model schema, scans for fields names nad creates list of
* field's names to initialize from LIB, if in supplied rawMutationsList, exists
* mutation for a field in list, field name in list will be replaced by a
* mutation description
* @param {Object} schema            mongoose model schema
* @param {Array}  rawMutationsList  list of mutations [src, mutation]/[dst,mutation,src]
* @returns {Object}                 initialized ui descriptions of fields for schema
**/
module.exports.fromSchema = (schema, rawMutationsList = []) => {
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
    return module.exports.initFields(list);
  }else{
    return {};
  }
};

module.exports.LIB = FIELDS;
