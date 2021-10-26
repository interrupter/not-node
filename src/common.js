/** @module Common */
/**
 * Change first letter case to lower
 * @param  {string} string input string
 * @return {string}        result
 */

exports.firstLetterToLower = function (string) {
	return string.charAt(0).toLowerCase() + string.slice(1);
};

/**
 * Change first letter case to higher
 * @param  {string} string input string
 * @return {string}        result
 */

exports.firstLetterToUpper = function (string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
};

/**
 *	Validates if string is a ObjectId
 *	@param	{string}	id 	ObjectId string to validate
 *	@return {booelean}	true if check is not failed
 */
exports.validateObjectId = (id)=>{
	try{
		return id.match(/^[0-9a-fA-F]{24}$/)?true:false;
	}catch(e){
		return false;
	}
};

/**
 *	Validates and compares ObjectIds in string or Object form
 *	@param	{string|ObjectId}	firstId 	first id
 *	@param	{string|ObjectId}	secondId 	second id
 *	@return {booelean}				true if equal
 */
exports.compareObjectIds = (firstId, secondId)=>{
	try{
		let a = firstId, b = secondId;
		if(typeof firstId !== 'string'){
			a = a.toString();
		}
		if(typeof secondId !== 'string'){
			b = b.toString();
		}
		if(
			!exports.validateObjectId(a)
			||
			!exports.validateObjectId(b)
		){
			return false;
		}
		return a === b;
	}catch(e){
		return false;
	}
};

/**
 *	Returns today Date object without hours, minutes, seconds
 *	@return {Date}	current date with 00:00:00
 */
exports.getTodayDate = ()=>{
	let t = new Date();
	return (new Date(t.getFullYear(), t.getMonth(),t.getDate())).getTime();
};
