const { objHas } = require("./common");

/** @module Parser */

/**
 *  routeLine parser
 *
 *  @param {string}   line    raw route line like '/api/:modelName' or '/:record[_id]'
 *  @param {string}   modelName  is for name of the model routes collection
 *  @param {string}   actionName  is for name of the action in the routes collection
 *        record[fieldName]   -   is for client side mostly, shows what model field walue should be placed there. Samples ':record[_id]', ':record[authorId]'
 *  @return {string}        resolved line
 */
module.exports.parseLine = function (line, modelName, actionName) {
    var recStart = ":record[",
        recEnd = "]";
    //remove client-side markers and replace them with name of field. :record[_id] turns into :_id
    while (line.indexOf(recStart) > -1) {
        line = line.replace(recStart, ":");
        line = line.replace(recEnd, "");
    }
    //place server-side markers
    if (typeof modelName !== "undefined")
        line = line.replace(":modelName", modelName);
    if (typeof actionName !== "undefined")
        line = line.replace(":actionName", actionName);
    return line;
};

/**
 *  Create routeLine for end-point
 *
 *  @param  {string}  url      url in manifest format
 *  @param  {string}  modelName  name of the model
 *  @param  {string}  actionName  name of the action in the route file
 *  @param  {object}  actionData  data from manifest for this action
 *  @return  {string}        resolved router line
 */
module.exports.getRouteLine = function (
    url,
    modelName,
    actionName,
    actionData
) {
    let part1 = this.parseLine(url, modelName, actionName),
        part2 = "";
    if (objHas(actionData, "postFix")) {
        part2 = this.parseLine(actionData.postFix, modelName, actionName);
    } else {
        part2 = "";
    }
    return part1 + part2;
};
