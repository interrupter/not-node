/**
 *  routeLine parser
 *
 *  line	-   raw route line like '/api/:modelName' or '/:record[_id]'
 *			  modelName		   -   is for name of the model routes collection
 *			  actionName		  -   is for name of the action in the routes collection
 *			  record[fieldName]   -   is for client side mostly, shows what model field walue should be placed there. Samples ':record[_id]', ':record[authorId]'
 *
 */

exports.parseLine = function(line, modelName, actionName) {
	var recStart = ':record[',
		recEnd = ']';
	//remove client-side markers and replace them with name of field. :record[_id] turns into :_id
	while(line.indexOf(recStart) > -1) {
		line = line.replace(recStart, ':');
		line = line.replace(recEnd, '');
	}
	//place server-side markers
	if(typeof modelName !== 'undefined') line = line.replace(':modelName', modelName);
	if(typeof actionName !== 'undefined') line = line.replace(':actionName', actionName);
	return line;
};

/**
 *  Create routeLine for end-point
 *
 *  (string)url		 -   url in manifest format
 *  (string)modelName   -   name of the model
 *  (string)modelName   -   name of the action in the route file
 *  (object)actionData  -   data from manifest for this action
 *
 */

exports.getRouteLine = function(url, modelName, actionName, actionData) {
	return this.parseLine(url, modelName, actionName) + ((actionData.hasOwnProperty('postFix')) ? this.parseLine(actionData.postFix, modelName, actionName) : '');
};
