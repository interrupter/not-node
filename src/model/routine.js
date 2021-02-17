/** @module Model/Routine */

const incrementNext = require('./increment');

function returnErrors(err, callbackError) {
	var i, validationReport = {};
	for (i in err.errors) {
		validationReport[i] = err.errors[i].message;
	}
	callbackError && callbackError(err, validationReport);
}

function addWithoutVersion(thisModel, data) {
	return (new thisModel(data)).save();
}

function addWithVersion(thisModel, data) {
	data.__latest = true;
	return (new thisModel(data)).save()
		.then((item) => {
			return thisModel.saveVersion(item._id);
		});
}

function add(model, data) {
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
}


async function update(model, filter, data){
	let thisModel = model,
		that = this;
	if (model.__incField) {
		data[model.__incField] = await incrementNext.next(model.__incModel);
		if (model.__versioning) {
			return that.updateWithVersion(thisModel, filter, data);
		} else {
			return that.updateWithoutVersion(thisModel, filter, data);
		}
	} else {
		if (model.__versioning) {
			return this.updateWithVersion(thisModel, filter, data);
		} else {
			return this.addWithoutVersion(thisModel, filter, data);
		}
	}
}

function updateWithoutVersion(thisModel, filter, data) {
	return thisModel.updateOne(
		filter,
		data,
		{new: true}
	);
}

function updateWithVersion(thisModel, filter, data) {
	filter.__latest = true;
	filter.__closed = false;
	return thisModel.updateOne(filter, data, {new: true}).exec()
		.then((item) => thisModel.saveVersion(item._id) );
}

module.exports = {
	add,
	update,
	returnErrors,
	addWithoutVersion,
	addWithVersion,
	updateWithoutVersion,
	updateWithVersion,
};
