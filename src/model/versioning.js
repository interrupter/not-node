var diff = require('deep-diff').diff;

var stripTechData = function(a) {
	delete a._id;
	delete a.__version;
	delete a.__versions;
	delete a.__v;
	delete a.__latest;
	return a;
};

var isThisDocsDifferent = function(a, b) {
	a = stripTechData(a);
	b = stripTechData(b);
	var diffLog = diff(a, b);
	return (typeof diffLog !== 'undefined');
};

var isDiff = function(thisModel, data, callback) {
	thisModel.findById(data.__versions[0], function(err, previous) {
		console.log('ifItNew', err, previous);
		if(!err && typeof previous !== 'undefined' && previous !== null) {
			callback(isThisDocsDifferent(data, previous.toObject()));
		} else {
			throw err;
		}
	});
};

module.exports = function(id, callback) {
	var thisModel = this;
	thisModel.findById(id, function(err, doc) {
		if(err) {
			callback(err);
			return;
		} else {
			var data = doc.toObject();
			delete data._id;
			if(typeof data.__versions !== 'undefined' && data.__versions !== null && data.__versions.length > 0) {
				var preservedVersionNumber = (typeof data.__version !== 'undefined' && data.__version !== null)?data.__version:0;
				var preservedVersionsList = data.__versions;
				//console.log('preservedVersionNumber', preservedVersionNumber);
				isDiff(thisModel, data, function(different) {
					if(!different) {
						callback('Same old data');
					} else {
						//console.log('preservedVersionNumber', preservedVersionNumber);
						delete data.__latest;
						console.log(data);
						var versionDoc = new thisModel(data);
						versionDoc.__version = preservedVersionNumber;
						versionDoc.__versions = preservedVersionsList;
						versionDoc.save(function(err) {
							if(err) {
								callback(err);
								return;
							}
							console.log('preservedVersionNumber', preservedVersionNumber);
							thisModel.findById(id, function(err, originalDoc) {
								if(!err) {
									console.log('preservedVersionNumber', preservedVersionNumber);
									originalDoc.__version = preservedVersionNumber + 1;
									if(typeof originalDoc.__versions === 'undefined' || originalDoc.__versions === null || !(originalDoc.__versions)) {
										originalDoc.__versions = [];
									}
									console.log(originalDoc.toObject());
									originalDoc.__versions.unshift(versionDoc._id); //первая в массиве последняя [3,2,1,0]
									console.log(originalDoc);
									originalDoc.save(callback);
								} else {
									callback(err);
									return;
								}
							});
						});
					}

				});
			} else {
				delete data.__latest;
				console.log(data);
				var versionDoc = new thisModel(data);
				versionDoc.save(function(err) {
					if(err) {
						callback(err);
						return;
					}
					thisModel.findById(id, function(err, originalDoc) {
						if(!err) {
							originalDoc.__version = originalDoc.__version + 1;
							if(typeof originalDoc.__versions === 'undefined' || originalDoc.__versions === null || !(originalDoc.__versions)) {
								originalDoc.__versions = [];
							}
							console.log(originalDoc.toObject());
							originalDoc.__versions.unshift(versionDoc._id); //первая в массиве последняя [3,2,1,0]
							originalDoc.save(callback);
						} else {
							callback(err);
							return;
						}
					});
				});
			}
		}
	});

};
