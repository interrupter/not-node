/** @module Model/Versioning */

var diff = require('deep-diff').diff;

var stripTechData = function (a) {
	delete a._id;
	delete a.__version;
	delete a.__versions;
	delete a.__v;
	delete a.__latest;
	return a;
};

var isThisDocsDifferent = function (a, b) {
	a = stripTechData(a);
	b = stripTechData(b);
	var diffLog = diff(a, b);
	return (typeof diffLog !== 'undefined');
};

var isDiff = function (thisModel, data) {
	return new Promise((resolve, reject) => {
		thisModel.findById(data.__versions[0])
			.then((previous) => {
				if (typeof previous !== 'undefined' && previous !== null) {
					resolve(isThisDocsDifferent(data, previous.toObject()));
				} else {
					reject('No previous version!');
				}
			});
	});
};

var saveVersion = (id, data, thisModel) => {
	let preservedVersionNumber = (typeof data.__version !== 'undefined' && data.__version !== null) ? data.__version : 0,
		preservedVersionsList = data.__versions;
	return new Promise((resolve, reject) => {
		isDiff(thisModel, data)
			.then((different) => {
				if (!different) {
					reject('Same old data');
				} else {
					delete data.__latest;
					let versionDoc = new thisModel(data);
					versionDoc.__version = preservedVersionNumber;
					versionDoc.__versions = preservedVersionsList;
					versionDoc.save()
						.then(() => {
							return thisModel.findById(id).exec();
						})
						.then((originalDoc) => {
							originalDoc.__version = preservedVersionNumber + 1;
							if (typeof originalDoc.__versions === 'undefined' || originalDoc.__versions === null || !(originalDoc.__versions)) {
								originalDoc.__versions = [];
							}
							originalDoc.__versions.unshift(versionDoc._id); //первая в массиве последняя [3,2,1,0]
							originalDoc.save()
								.then(resolve)
								.catch(reject);
						})
						.catch(reject);
				}
			});
	});

};

var saveFirstVersion = (id, data, thisModel) => {
	delete data.__latest;
	let versionDoc = new thisModel(data);
	return new Promise((resolve, reject) => {
		versionDoc.save()
			.then(() => {
				return thisModel.findById(id).exec();
			})
			.then((originalDoc) => {
				originalDoc.__version = originalDoc.__version + 1;
				if (typeof originalDoc.__versions === 'undefined' || originalDoc.__versions === null || !(originalDoc.__versions)) {
					originalDoc.__versions = [];
				}
				originalDoc.__versions.unshift(versionDoc._id); //первая в массиве последняя [3,2,1,0]
				originalDoc.save()
					.then(resolve)
					.catch(reject);
			})
			.catch(reject);
	});
};

var saveDiff = function (doc) {
	let data = doc.toObject(),
		id = data._id;
	delete data._id;
	if (typeof data.__versions !== 'undefined' && data.__versions !== null && data.__versions.length > 0) {
		return saveVersion(id, data, this);
	} else {
		return saveFirstVersion(id, data, this);
	}
};

module.exports = function (id) {
	return this.findById(id).exec().then(saveDiff.bind(this));
};
