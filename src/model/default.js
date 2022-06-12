/** @module Model/Default */
const routine = require('./routine');
const notQuery = require('not-filter');
const {objHas} = require('../common');

const defaultFilter = (obj)=>{
  return (obj.schema.statics.__versioning ? {
    __latest: true,
    __closed: false
  } : {});
};

const defaultSorter = ()=>{
  return [
    ['_id', 'descending']
  ];
};

module.exports.extractVariants = function (items) {
  if (Array.isArray(items)) {
    return items.map(item => item.getVariant());
  }else{
    return [];
  }
};

function populateQuery_markVersioning(inst){
  if(objHas(inst, 'match')){
    inst.match.__latest = true;
  }else{
    inst.match = {__latest: true};
  }
}

module.exports.populateQuery_markVersioning = populateQuery_markVersioning;

const populateQuery = (query, populate, versioning = false) => {
  if (Array.isArray(populate)) {
    for(let key of populate){
      let inst = {};
      if(typeof key === 'string'){
        inst.path = key;
      }else if(objHas(key, 'path')){
        Object.assign(inst, key);
      }else{
        throw new Error(`No path to populate: \n` + JSON.stringify(key, null, 4));
      }
      if(versioning){
        populateQuery_markVersioning(inst);
      }
      query.populate(inst);
    }
  }
};

module.exports.populateQuery = populateQuery;

/**
*	Sanitize input
*	@static
*	@param	{object}	input 	data
*	@return	{object}	data;
**/
function sanitizeInput(input) {
  if (!objHas(input, 'default')) {
    input.default = false;
  }
  return input;
}

/**
*	Retrieves one record by primary key
*	If versioning ON, it retrieves __latest and not __closed
*	@static
*	@param 	{string}	id 	primary key
*	@param 	{Array}		population 	optional if needed population of some fields
*	@param 	{Object}	condition 	optional if needed additional condition
*	@return {Promise}	Promise
**/
function getOne(id, population = [], condition = {}) {
  let query;
  if (this.schema.statics.__versioning) {
    query = this.findOne({
      _id: id,
      ...condition,
      __latest: true,
      __closed: false
    });
    if(Array.isArray(population)){
      population.push('__versions');
    }else{
      population = ['__versions'];
    }
  } else {
    query = this.findOne({
      _id: id,
      ...condition
    });
  }
  populateQuery(query, population, this.schema.statics.__versioning);
  return query.exec();
}

/**
*	Retrieves one record by unique numeric ID
*	If versioning ON, it retrieves __latest and not __closed
*	@static
*	@param 	{number}	ID		some unique numeric identificator
*	@param 	{Object}	condition 	optional if needed additional condition
*	@return {Promise}	      Promise of document, if increment is OFF - then Promise.resolve(null)
**/
function getOneByID(ID, condition = {}) {
  if (this.schema.statics.__incField) {
    let by = (this.schema.statics.__versioning ? {
        ...condition,
        __latest: true,
        __closed: false,
      } : {
        ...condition
      }),
      query;
    by[this.schema.statics.__incField] = ID;
    query = this.findOne(by);
    return query.exec();
  } else {
    return Promise.resolve(null);
  }
}


/**
*	Retrieves one record by primary key, without any restriction
*	@static
*	@param 	{string}	id 	primary key
*	@param 	{Object}	condition 	optional if needed additional condition
*	@return {Promise}	Promise
**/
function getOneRaw(id, condition = {}) {
  let query = this.findOne({
    _id: id,
    ...condition
  });
  return query.exec();
}

/**
*	Common query with filtering constructor for generic method
*	@static
*	@param 	{string}		method 		name of the method
*	@param 	{object|array}	filter 		filtering rules object
*	@return {Query}						mongoose query object
**/
function makeQuery(method, filter){
  let versioningMod = {
      __latest: true,
      __closed: false
    },
    finalFilter = {};
  switch(notQuery.filter.getFilterType(filter)){
  case notQuery.filter.OPT_OR:
    if (this.schema.statics.__versioning){
      finalFilter = {
        $and: [versioningMod, {$or: filter}]
      };
    }else{
      finalFilter = {
        $or: filter
      };
    }
    break;
  case notQuery.filter.OPT_AND:
    if (this.schema.statics.__versioning){
      finalFilter = {
        $and: [versioningMod, filter]
      };
    }else{
      finalFilter = {
        $and:[filter]
      };
    }
    break;
  default:
    finalFilter = {...(this.schema.statics.__versioning?versioningMod:{})};
  }
  return this[method](finalFilter);
}

/**
*	List record method
*	@static
*	@param	{number} 		skip		number of skiped records
*	@param	{number} 		size		length of return list
*	@param	{Object} 		sorter		sorter rules
*	@param	{(Object|Array)} 	filter		filter rules
*	@return {Promise}					Promise
**/
function list(skip, size, sorter, filter){
  let query = this.makeQuery('find', filter);
  return query.sort(sorter).skip(skip).limit(size).exec();
}


/**
*	Returns list of items with specific values in specific field, optionaly filtered
*	@static
*	@param	{string} 				field			name of the field to search in
*	@param	{array} 				list			list of 'id' field values
*	@param	{object|array} 	filter		filter rules
*	@param	{object} 				populate	populate rules
*	@return {Promise}					Promise
*/

function listByField(field, list = [], filter = {}, populate = []){
  let query = this.makeQuery('find', {
    [field]: {
      $in: list,
      ...filter
    }
  });
  populateQuery(query, populate, this.schema.statics.__versioning);
  return query.exec();
}

/**
*	List record and populate method
*	@static
*	@param	{number} 		skip		number of skiped records
*	@param	{number} 		size		length of return list
*	@param	{object} 		sorter		sorter rules
*	@param	{object|array} 	filter		filter rules
*	@param	{object} 		populate	populate rules
*	@return {Promise}					Promise
*/
function listAndPopulate(skip, size, sorter, filter, populate) {
  let query = this.makeQuery('find', filter);
  query.sort(sorter).skip(skip).limit(size);
  populateQuery(query, populate, this.schema.statics.__versioning);
  return query.exec();
}

/**
*	List all records from collection
*	If Versioning is ON restricts to __latest and not __closed
*	By default sorts by _id in DESC
*	@static
*	@return {Promise}					Promise
*/
function listAll() {
  let by = defaultFilter(this),
    query = this.find(by).sort(defaultSorter());
  return query.exec();
}

/**
*	List all record in collection and populates
*	If Versioning is ON restricts to __latest and not __closed
*	By default sorts by _id in DESC
*	@static
*	@param	{object|array} 	populate	populate rules
*	@return {Promise}					Promise
*/
function listAllAndPopulate(populate) {
  let by = defaultFilter(this),
    query = this.find(by);
  query.sort(defaultSorter());
  populateQuery(query, populate,this.schema.statics.__versioning);
  return query.exec();
}

/**
*	List record in collection and populates, with count of total founded records
*	By default sorts by _id in DESC
*	@static
*	@param	{number} 		skip		number of skiped records
*	@param	{number} 		size		length of return list
*	@param	{object} 		sorter		sorter rules
*	@param	{(object|array)} 	filter		filter rules
*	@param	{(object|array)} 	search		search rules
*	@param	{object} 		populate	populate rules
*	@return {Promise}		{list, count, pages}
*/
async function listAndCount(skip, size, sorter, filter, search, populate = []){
  let listQuery = this.listAndPopulate(skip, size, sorter, search || filter, populate),
    countQuery = this.countWithFilter(search || filter);
  const [list, count] = await Promise.all([listQuery, countQuery]);
  return {
    list,
    skip,
    count,
    page:   Math.floor(skip / size) + (skip % size === 0? 1:0),
    pages:  Math.ceil(count / size),
  };
}

/**
*	Counts record method
*	@static
*	@param	{object|array} 	filter		filter rules
*	@return {Promise}					Promise
*/
function countWithFilter(filter){
  let query =  this.makeQuery('countDocuments', filter);
  return query.exec();
}


/**
*	Starts add routine
*	@static
*	@param	{object} 		data		data
*	@return {Promise}					Promise
*/
function add(data) {
  return routine.add(this, data);
}

/**
*	Starts update routine
*	@static
*	@param	{object} 		filter		search criteria
*	@param	{object} 		data			data
*	@param	{boolean} 		many			if true will affect all records according to filter
*	@return {Promise}					Promise
*/
function update(filter, data, many = false) {
  if(many){
    return routine.updateMany(this, filter, data);
  }else{
    return routine.update(this, filter, data);
  }
}

module.exports.thisStatics = {
  sanitizeInput,
  getOne,
  getOneByID,
  getOneRaw,
  makeQuery,
  list,
  listByField,
  listAll,
  listAllAndPopulate,
  countWithFilter,
  listAndPopulate,
  listAndCount,
  add,
  update
};

/**
*	Returns incremental ID for this doc
*	@return {numeric}	ID
*/
function getID() {
  return this.schema.statics.__incField ? this[this.schema.statics.__incField] : 0;
}

/**
*	Closes document and saves it
*	This is replaces remove when Versioning is ON
*	@return {numeric}	ID
*/
function close() {
  this.__closed = true;
  return this.save();
}

module.exports.thisMethods = {
  getID,
  close
};
