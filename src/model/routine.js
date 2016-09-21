var incrementNext = require('./increment');

exports.returnErrors = function(err, callbackError){
	var i, validationReport = {};
	for(i in err.errors) {
		validationReport[i] = err.errors[i].message;
	}
	callbackError && callbackError(err, validationReport);
};


exports.addWithoutVersion = function(thisModel, data, callbackOK, callbackError){
	var proto = new thisModel(data);
	proto.save(function(err, item) {
		if(err) {
			exports.returnErrors(err, callbackError);
		} else {
			callbackOK && callbackOK(item);
		}
	});
};

exports.addWithVersion = function(thisModel, data, callbackOK, callbackError){
	data.__latest = true;
	var proto = new thisModel(data);
	proto.save(function(err, item) {
		if(err) {
			exports.returnErrors(err, callbackError);
		} else {
			thisModel.saveVersion(item._id, function(err) {
				if(err) {
					callbackError && callbackError(err);
				} else {
					callbackOK && callbackOK(item);
				}
			});
		}
	});
};

exports.add = function(model, data, callbackOK, callbackError) {
	var thisModel = model,
		that = this;
	if(model.__incField) {
		incrementNext.next(model.__incModel, function(modelId){
			data[model.__incField] = modelId;
			if(model.__versioning){
				that.addWithVersion(thisModel, data, callbackOK, callbackError);
			}else{
				that.addWithoutVersion(thisModel, data, callbackOK, callbackError);
			}
		}, callbackError);
	}else{
		if(model.__versioning){
			this.addWithVersion(thisModel, data, callbackOK, callbackError);
		}else{
			this.addWithoutVersion(thisModel, data, callbackOK, callbackError);
		}

	}
};
