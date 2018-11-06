/** @module Model/Default */
const routine = require('./routine');

const notQuery = require('not-filter');

exports.extractVariants = function (items) {
	var variants = [];
	if (items && items.length) {
		for (var i = 0; i < items.length; i++) {
			variants.push(items[i].getVariant());
		}
	}
	return variants;
};

let populateQuery = (query, populate) => {
	if (populate && populate.length) {
		while (populate.length > 0) {
			query.populate({
				path: populate.shift(),
				match: {
					__latest: true
				}
			});
		}
	}
};

/**
*	Sanitize input
*	@static
*	@param	{object}	input 	data
*	@return	{object}	data;
**/
function sanitizeInput(input) {
	if (!input.hasOwnProperty('default')) {
		input.default = false;
	}
	return input;
}

/**
*	Retrieves one record by primary key
*	If versioning ON, it retrieves __latest and not __closed
*	@static
*	@param 	{string}	id 	primary key
*	@return {Promise}	Promise
**/
function getOne(id) {
	if (this.schema.statics.__versioning) {
		let query = this.findOne({
			_id: id,
			__latest: true,
			__closed: false
		}).populate('__versions');
		return query.exec();
	} else {
		let query = this.findOne({
			_id: id
		});
		return query.exec();
	}
}

/**
*	Retrieves one record by unique numeric ID
*	If versioning ON, it retrieves __latest and not __closed
*	@static
*	@param 	{number}	ID		some unique numeric identificator
*	@return {Promise}	Promise or NULL if increment is OFF
**/
function getOneByID(ID) {
	if (this.schema.statics.__incField) {
		let by = (this.schema.statics.__versioning ? {
				__latest: true,
				__closed: false
			} : {}),
			query;
		by[this.schema.statics.__incField] = ID;
		query = this.findOne(by);
		return query.exec();
	} else {
		return null;
	}
}


/**
*	Retrieves one record by primary key, without any restriction
*	@static
*	@param 	{string}	id 	primary key
*	@return {Promise}	Promise
**/
function getOneRaw(id) {
	let query = this.findOne({
		_id: id
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
		query;
	switch(notQuery.filter.getFilterType(filter)){
	case notQuery.filter.OPT_OR:
		if (this.schema.statics.__versioning){
			query = this[method]({
				$and: [versioningMod, {$or: filter}]
			});
		}else{
			query = this[method]({
				$or: filter
			});
		}
		break;
	case notQuery.filter.OPT_AND:
		if (this.schema.statics.__versioning){
			query = this[method]({
				$and: [versioningMod, filter]
			});
		}else{
			query = this[method]({
				$and:[filter]
			});
		}
		break;
	default:
		query = this[method](this.schema.statics.__versioning?versioningMod:{});
	}
	return query;
}

/**
*	List record method
*	@static
*	@param	{number} 		skip		number of skiped records
*	@param	{number} 		size		length of return list
*	@param	{object} 		sorter		sorter rules
*	@param	{object|array} 	filter		filter rules
*	@return {Promise}					Promise
*/
function list(skip, size, sorter, filter){
	let query = this.makeQuery('find', filter);
	return query.sort(sorter).skip(skip).limit(size).exec();
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
	populateQuery(query, populate);
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
	let by = (this.schema.statics.__versioning ? {
			__latest: true,
			__closed: false
		} : {}),
		query = this.find(by).sort([
			['_id', 'descending']
		]);
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
	let by = this.schema.statics.__versioning ? {
			__latest: true,
			__closed: false
		} : {},
		query = this.find(by);
	query.sort([
		['_id', 'descending']
	]);
	populateQuery(query, populate);
	return query.exec();
}

/**
*	List record in collection and populates, with count of total founded records
*	By default sorts by _id in DESC
*	@static
*	@param	{number} 		skip		number of skiped records
*	@param	{number} 		size		length of return list
*	@param	{object} 		sorter		sorter rules
*	@param	{object|array} 	filter		filter rules
*	@param	{object} 		populate	populate rules
*	@return {Promise}		{list, count}
*/
function listAndCount(skip, size, sorter, filter, populate = ['']){
	let list = this.listAndPopulate(req.pager.skip, req.pager.size, req.sorter, req.search || req.filter, populate),
		count = this.countWithFilter(req.search || req.filter);
	return Promise.all([list, count])
		.then(([list, count])=>{
			return {
				list,
				count,
			};
		});
}

/**
*	Counts record method
*	@static
*	@param	{object|array} 	filter		filter rules
*	@return {Promise}					Promise
*/
function countWithFilter(filter){
	let query =  this.makeQuery('count', filter);
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


exports.statics = {
	sanitizeInput,
	getOne,
	getOneByID,
	getOneRaw,
	makeQuery,
	list,
	listAll,
	listAllAndPopulate,
	countWithFilter,
	listAndPopulate,
	add
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
	this.save();
}

exports.methods = {
	getID,
	close
};
