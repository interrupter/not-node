const escapeStringRegexp = require('escape-string-regexp');

exports.getFilter = function(requestQuery, modelSchema){
    var result = [];
    //есть ли фильтрация по полям
    if(requestQuery.hasOwnProperty('filterSearch') && requestQuery.filterSearch !== null && requestQuery.filterSearch.length>0) {
        var filterSearch = requestQuery.filterSearch.toString();
            searchRule = new RegExp('.*'+escapeStringRegexp(filterSearch)+'.*', 'i');
        for(var k in modelSchema){
            if (modelSchema[k].searchable && !(requestQuery.hasOwnProperty(k) && requestQuery[k].length > 0)){
                var emptyRule = {};
                switch(modelSchema[k].type){
                    case Number:
                            if (!isNaN(filterSearch)){
                                emptyRule[k] = parseInt(filterSearch);
                            }else{
                                continue;
                            }
                        break;
                    case Boolean: emptyRule[k] = searchRule;
                    case String:
                    default: emptyRule[k] = searchRule;
                }
                result.push(emptyRule);
            }
        }
    }

    for(var k in modelSchema){
        if (modelSchema[k].searchable && requestQuery.hasOwnProperty(k) && requestQuery[k].length > 0){
            var emptyRule = {};
            var searchString = requestQuery[k];
            
            switch(modelSchema[k].type){
                case Number:
                        if (!isNaN(searchString)){
                            emptyRule[k] = parseInt(searchString);
                        }else{
                            continue;
                        }
                    break;
                case String:
                default: emptyRule[k] = searchString;
            }
            result.push(emptyRule);
        }
    }
    return result;
};

var sorterDefaultsLocal = {
    sortByField: '_id',
    sortDirection: 'ascending'
};

exports.getSorter = function(requestQuery, modelSchema, sorterDefaults /* optional */){
    if (typeof sorterDefaults === 'undefined' || sorterDefaults === null){
        var result = [[sorterDefaultsLocal.sortByField, sorterDefaultsLocal.sortDirection]];
    }else{
        var result = [[sorterDefaults.sortByField, sorterDefaults.sortDirection]];
    }
    if(requestQuery.hasOwnProperty('sortDirection') && requestQuery.sortDirection !== null &&
        requestQuery.hasOwnProperty('sortByField') && requestQuery.sortByField !== null) {
        var sortByField = requestQuery.sortByField;
        var sortDirection = parseInt(requestQuery.sortDirection);
        //санация данных
        switch(sortDirection) {
            case -1:
                sortDirection = 'descending';
                break;
            case 1:
                sortDirection = 'ascending';
                break;
            default:
                sortDirection = config.get("sortDirection");
        }
        if(modelSchema.hasOwnProperty(sortByField) && (Object.keys(modelSchema).indexOf(sortByField) > -1)) {
            if(modelSchema[sortByField].hasOwnProperty('sortable') && modelSchema[sortByField].sortable) {
                //все чисто - можно отправлять в базу
                result = [
                    [sortByField, sortDirection]
                ];
            }
        }
    }
    return result;
};
