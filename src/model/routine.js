var incrementNext = require('./increment');

exports.returnErrors = function (err, callbackError) {
	var i, validationReport = {};
	for (i in err.errors) {
		validationReport[i] = err.errors[i].message;
	}
	callbackError && callbackError(err, validationReport);
};

exports.addWithoutVersion = function (thisModel, data) {
	return (new thisModel(data)).save();
};

exports.addWithVersion = function (thisModel, data) {
	data.__latest = true;
	return (new thisModel(data)).save()
		.then((item) => {
			return thisModel.saveVersion(item._id);
		});
};

exports.add = function (model, data) {
	let thisModel = model,
		that = this;
	return new Promise((resolve, reject) => {

		if (model.__incField) {
			incrementNext.next(model.__incModel)
				.then((modelId) => {
					data[model.__incField] = modelId;
					if (model.__versioning) {
						that.addWithVersion(thisModel, data)
							.then(resolve)
							.catch(reject);
					} else {
						that.addWithoutVersion(thisModel, data)
							.then(resolve)
							.catch(reject);
					}
				})
				.catch(reject);
		} else {
			if (model.__versioning) {
				this.addWithVersion(thisModel, data)
					.then(resolve)
					.catch(reject);
			} else {
				this.addWithoutVersion(thisModel, data)
					.then(resolve)
					.catch(reject);
			}
		}
	});
};
