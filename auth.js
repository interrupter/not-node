var HttpError = require('./error').Http;

function intersect_safe(a, b){
  var ai=0, bi=0;
  var result = new Array();
  while( ai < a.length && bi < b.length ){
     if      (a[ai].localeCompare(b[bi]) ){ ai++; }
     else if (a[ai].localeCompare(b[bi]) ){ bi++; }
     else /* they're equal */{
       result.push(a[ai]);
       ai++;
       bi++;
     }
  }
  return result;
}

exports.checkUser = function(req, res, next){
	if(!req.session.user){
		return next(new HttpError(401, "Вы не авторизованы"));
	}
	next();
};

exports.checkAdmin = function(req, res, next){
	if((!req.session.user) || (req.session.userRole!='root')){
		return next(new HttpError(401, "Вы не авторизованы " +req.session.user+':' +req.session.userRole));
	}
	next();
};

export.compareRoles(userRoles, actionRoles){
    //user have many roles
    if (userRoles.constructor === Array){
        //action can be accessed by various roles
        if (actionRoles.constructor === Array){
            //if we have similar elements in those two arrays - grant access
            return intersect_safe(userRoles, actionRoles).length > 0;
        }else{
            return userRoles.indexOf(actionRoles) > -1;
        }
    }else{
        if (actionRoles.constructor === Array){
            return actionRoles.indexOf(userRoles) > -1;
        }else{
            return userRoles == actionRoles;
        }
    }
}

exports.checkRoleBuilder = function(role){
    var userRole = req.session.userRole;
    return function(req, res, next){
        if((!req.session.user) || !this.compareRoles(userRole, role)){
            return next(new HttpError(401, "Вы не авторизованы " +req.session.user+':' +req.session.userRole));
    	}
    	next();
    }
}
