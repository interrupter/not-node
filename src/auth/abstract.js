const CONST = require("./const");

function isObjectString(val) {
    return Object.prototype.toString.call(val) === CONST.OBJECT_STRING;
}

/**
 *	Two arrays in - one intersection of two out
 *	@param	{array}		a	first array
 *	@param	{array}		b	scecond array
 *	@return {array}		array consisted of elements presented in both input arrays
 **/

function intersect_safe(a, b) {
    let result = [];
    if (Array.isArray(a) && Array.isArray(b)) {
        if (b.length > a.length) {
            // indexOf to loop over shorter
            let t = b;
            b = a;
            a = t;
        }
        result = a.filter((e) => {
            if (b.indexOf(e) !== -1) return true;
        });
    }
    return result;
}

module.exports = {
    isObjectString,
    intersect_safe,
};
