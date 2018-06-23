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
