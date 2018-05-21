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
