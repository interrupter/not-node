var Auth = require('./auth'),
    validate = require('mongoose-validator'),
    extend = require('extend');

exports.checkCredentials = function (actionData, auth, role, admin){
/*
    console.log('check credentials');
    console.log(actionData);
    console.log(auth, role, admin);
*/
    if (typeof actionData === 'undefined' || actionData === null){
//        console.error(actionData);
        return false;
    }
    if (actionData && actionData.hasOwnProperty('admin') ){
        return actionData.admin === admin;
    }
    if (actionData.hasOwnProperty('role')){
        if (Auth.compareRoles(actionData.role, role)){
            return actionData.hasOwnProperty('auth')?(actionData.auth === auth):true;
        }else{
            return false;
        }
    }else{
        return actionData.hasOwnProperty('auth')?(actionData.auth === auth):true;
    }
    return false;
}

exports.filterManifestRoute = function(route, auth, role, admin){
    var result = extend({}, route);
    result.actions = {};
    //console.log(route);
    if (route && route.actions){
        for(var actionName in route.actions){
            //console.log(actionName, route.actions[actionName]);
            var actionSet = route.actions[actionName];
            if (actionSet){
                if(actionSet.length > 0){
                    //console.log('actions set');
                    for(var i = 0; i < actionSet.length; i++){
                        if (this.checkCredentials(actionSet[i], auth, role, admin)){
                            result.actions[actionName] = actionSet[i];
                        }else{

                        }
                    }
                }else{
                    //console.log('action alone');
                    if (this.checkCredentials(actionSet, auth, role, admin)){
                        result.actions[actionName] = actionSet;
                    }else{
                        //console.log('credentials not fit');
                    }
                }
            }
        }
    }
    return result;
}

exports.filterManifest = function(manifest, auth, role, admin){
    var result = {};
    for(var routeName in manifest){
        result[routeName] = this.filterManifestRoute(manifest[routeName], auth, role, admin);
    }
    return result;
}

/**
 *  Collect all existing manifests from files in the routes directory
 *  return object(extensionless routes collection file name : manifest)
 */

exports.getManifest = function(routesPath) {
    var manifest = {};
    var normalizedPath = routesPath;
    //console.log('normalizedPath', normalizedPath);
    require("fs").readdirSync(normalizedPath).forEach(function(file) {
        var route = require(routesPath + '/' + file),
            fileName = file.slice(0, file.length - 3);
        if(route.hasOwnProperty('manifest') && route.manifest !== null) {
            manifest[fileName] = route.manifest;
        }
    });
    return manifest;
}

/**
 *  Take array of validator (https://www.npmjs.com/package/validator) rules
 *  and create array of mongoose-validator (https://www.npmjs.com/package/mongoose-validator) rules
 *  then return it
 */

exports.buildValidator = function(validators) {
    var result = null;
    result = validators.map(function(item) {
        return validate(item);
    });
    return result;
};


/**
 *  routeLine parser
 *
 *  line    -   raw route line like '/api/:modelName' or '/:record[_id]'
 *              modelName           -   is for name of the model routes collection
 *              actionName          -   is for name of the action in the routes collection
 *              record[fieldName]   -   is for client side mostly, shows what model field walue should be placed there. Samples ':record[_id]', ':record[authorId]'
 *
 */

var parseLine = function(line, modelName, actionName) {
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
}

/**
 *  Create routeLine for end-point
 *
 *  (string)url         -   url in manifest format
 *  (string)modelName   -   name of the model
 *  (string)modelName   -   name of the action in the route file
 *  (object)actionData  -   data from manifest for this action
 *
 */

var getRouteLine = function(url, modelName, actionName, actionData) {
    return parseLine(url, modelName, actionName) + ((actionData.hasOwnProperty('postFix')) ? parseLine(actionData.postFix, modelName, actionName) : '');
}

/**
 *  Создаем путь для однойконечной точки
 *
 *  app         -   express app object
 *  routesPath  -   directory where routes files is placed
 *  routeLine   -   aka '/login', '/user/:id', etc
 *  modelName   -   name of the mongoose model, should be exact as file name with routes for this model. If /models/theme.js contains 'Theme' mongoose model, then /routes/theme.js should  `
 *                  contain routes for that model.
 *  actionName  -   name of action in routes file. Look for existing route file for understanding
 *  actionData  -
 *
 */

var registerRouteForAction = function(app, routesPath, routeLine, modelName, actionName, actionData) {
    //console.log(modelName, actionName);
    if(!(actionData.admin && actionData.auth)) {
        //for 'guest' is no specific middleware required
        //console.log(actionData);
        app[actionData.method.toLowerCase()](routeLine, require(routesPath + '/' + modelName)[actionName]);
    } else {
        if(actionData.admin){
            //all actions in route file that should be accessed only by 'admin', should be prefixed by underscore
            //for 'admin' user role should be specified specific middleware
            app[actionData.method.toLowerCase()](routeLine, Auth.checkAdmin, require(routesPath + '/' + modelName)['_' + actionName]);
        } else {
            //for 'authentificated' user role should be specified specific middleware
            app[actionData.method.toLowerCase()](routeLine, Auth.checkUser, require(routesPath + '/' + modelName)[actionName]);
            /*
                ! new feature
                check access by role in manifest and in req.session.userRole
            */
            if(typeof actionData.role !== 'undefined' && actionData.role !== null && actionData.role.toString().length > 0) {
                app[actionData.method.toLowerCase()](routeLine, Auth.checkRoleBuilder(actionData(actoinData.role)), require(routesPath + '/' + modelName)[actionName]);
            }
        }
    }
};


var registerRouteForActionSet = function(app, routesPath, routeLine, modelName, actionSetName, actionSetData) {
    //console.log(modelName, actionSetName);
    if (actionSetData.length && actionSetData.length > 0){
        for(var i = 0; i < actionSetData.length;i++){
            registerRouteForAction(app, routesPath, routeLine, modelName, actionSetName, actionSetData[i]);
        }
    }else{
        registerRouteForAction(app, routesPath, routeLine, modelName, actionSetName, actionSetData);
    }
};

/**
 *  Создаем пути согласно манифесту
 *
 *  app - express app object
 *  routesPath - directory where routes files is placed
 *
 */

exports.registerRoutes = function(app, interfaceManifests) {
    var manModuleName = null,
        manModuleActionName,
        actionData,
        routeLine,
        routesPath = app.get('routes');

    for(manModuleName in interfaceManifests) {
        for(manModuleActionName in interfaceManifests[manModuleName].actions) {
            //console.log(manModuleName, manModuleActionName);
            actionData = interfaceManifests[manModuleName].actions[manModuleActionName];
            routeLine = getRouteLine(interfaceManifests[manModuleName].url, manModuleName, manModuleActionName, actionData);
            //console.log(actionData.method, routeLine, actionData.auth, actionData.admin);
            registerRouteForActionSet(app, routesPath, routeLine, manModuleName, manModuleActionName, actionData);
        }
    }
}

/**
 *  Создаем манифест приложения и отдаём
 *
 *
 */

exports.updateManifests = function(routesPath) {
    return this.getManifest(routesPath);
}
