/**
 * Duplicates standart set with names postpended with 'Own'
 * Work with:
 * beforeActionsOnCondition = [
 *       require("./actions.before/ownage/ownage.js").ifActionNameEndsWith_Own(),
 *   ],
 * It modifies filtering queries before actions with names ended with 'Own'
 */

const standartSet = require("./standart");

const standartOwnSet = {};
Object.keys(standartSet).forEach((actionName) => {
    standartOwnSet[`${actionName}Own`] = standartSet[actionName];
});

Object.freeze(standartOwnSet);
module.exports = standartOwnSet;
