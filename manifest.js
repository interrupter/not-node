var Auth = require('./auth'),
    validate = require('mongoose-validator'),
    HttpError = require('./error').Http,
    extend = require('extend');

exports.checkCredentials = function (rule, auth, role, admin){
    if (typeof rule === 'undefined' || rule === null){
//        console.error(actionData);
        return false;
    }
    if (rule.hasOwnProperty('admin')){
        if (rule.admin){
            return rule.admin && admin;
        }
    }
    if (rule.hasOwnProperty('role')){
        if (Auth.compareRoles(rule.role, role)){
            if(rule.hasOwnProperty('auth')){
                if(rule.auth && auth){
                    return true;
                }else{
                    if(!rule.auth && !auth){
                        return true;
                    }
                }
            }else{
                return true;
            }
        }else{
            return false;
        }
    }else{
        if(rule.hasOwnProperty('auth')){
            if(rule.auth && auth){
                return true;
            }else{
                if(!rule.auth && !auth){
                    return true;
                }
            }
        }else{
            return true;
        }
    }
    return false;
}

exports.filterManifestRoute = function(route, auth, role, admin){
    var result = extend({}, route);
    result.actions = {};
    if (route && route.actions){
        for(var actionName in route.actions){
            var actionSet = route.actions[actionName];
            if (actionSet){
                if(actionSet.rules && actionSet.rules.length > 0){
                    for(var i = 0; i < actionSet.rules.length; i++){
                        if (this.checkCredentials(actionSet.rules[i], auth, role, admin)){
                            result.actions[actionName] = extend({}, actionSet);
                            delete result.actions[actionName].rules;
                        }else{

                        }
                    }
                }else{
                    if (this.checkCredentials(actionSet, auth, role, admin)){
                        result.actions[actionName] = extend({}, actionSet);
                        delete result.actions[actionName].admin;
                        delete result.actions[actionName].auth;
                        delete result.actions[actionName].role;
                    }else{

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

var RouterAction = function(app, routesPath, routeLine, modelName, actionName, actionSetData){
    this.app = app;
    this.routesPath = routesPath;
    this.routeLine = routeLine;
    this.modelName = modelName;
    this.actionName = actionName;
    this.actionSetData = actionSetData;
    return this;
}

RouterAction.prototype.checkRule = function (rule, auth, role, admin){
    return exports.checkCredentials(rule, auth, role, admin);
}

RouterAction.prototype.selectRule = function(req){
    if (this.actionSetData){
        if(this.actionSetData.rules && this.actionSetData.rules.length > 0){
            for(var i = 0; i < this.actionSetData.rules.length; i++){
                if (this.checkRule(this.actionSetData.rules[i], Auth.ifUser(req), Auth.getRole(req), Auth.ifAdmin(req))){
                    return this.actionSetData.rules[i];
                }
            }
        }else{
            if (this.checkRule(this.actionSetData, Auth.ifUser(req), Auth.getRole(req), Auth.ifAdmin(req))){
                return this.actionSetData;
            }
        }
    }
    return null;
}

RouterAction.prototype.exec = function(req, res, next){
    var rule = this.selectRule(req);
    if (rule){
        var actionName = this.actionName;
        if(rule.admin){
            actionName = '_' + this.actionName;
        }
        if (rule.actionPrefix){
            actionName = rule.actionPrefix + this.actionName;
        }
        if(rule.actionName){
            actionName = rule.actionName;
        }
        try{
            var mod = require(this.routesPath + '/' + this.modelName);
            if (mod.hasOwnProperty(actionName) && typeof mod[actionName] === 'function'){
                mod[actionName](req, res, next);
            }
        }
        catch(e){
            console.log(e);
        }
    }else{
    	return next(new HttpError(403, "rule for router not found"));
    }
}

/**
 *  Создаем путь для одной конечной точки
 *
 *  app         -   express app object
 *  routesPath  -   directory where routes files is placed
 *  routeLine   -   aka '/login', '/user/:id', etc
 *  modelName   -   name of the mongoose model, should be exact as file name with routes for this model. If /models/theme.js contains 'Theme' mongoose model, then /routes/theme.js should  `
 *                  contain routes for that model.
 *  actionSetName  -   name of action in routes file. Look for existing route file for understanding
 *  actionSetData  -
 *
 */


var registerRouteForActionSet = function(app, routesPath, routeLine, modelName, actionSetName, actionSetData) {
    if(actionSetData && actionSetData.method){
        var routerAction =  new RouterAction(app, routesPath, routeLine, modelName, actionSetName, actionSetData);
        app[actionSetData.method.toLowerCase()](routeLine, routerAction.exec.bind(routerAction));
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
            actionSetData = interfaceManifests[manModuleName].actions[manModuleActionName];
            routeLine = getRouteLine(interfaceManifests[manModuleName].url, manModuleName, manModuleActionName, actionSetData);
            registerRouteForActionSet(app, routesPath, routeLine, manModuleName, manModuleActionName, actionSetData);
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


/**
 *    Пополняем объект ошибок
 */

exports.addError = function(errors, field, error) {
    if (!errors) {
        errors = {};
    }
    if (!errors.hasOwnProperty(field)) {
        errors[field] = error;
    }
    return errors;
}
