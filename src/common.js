/*
	args - array from function input arguments
		[
			0 => arg 1
			1 => arg 2
			2 => arg 3
			...
		]
	validators -
		[
			0 => validator for arg 1
			1 => validator for arg 2
		]

*/

exports.validateArgs = function (args, validators) {
	if (args.length === validators.length) {
		for (let i in args) {
			obj[i] = validators[i];
		}
		return false;
	} else {
		return true;
	}
};

exports.firstLetterToLower = function (string) {
	return string.charAt(0).toLowerCase() + string.slice(1);
};
