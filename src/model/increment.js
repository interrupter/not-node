/** @module Model/Increment */

var thisSchema = {
	id: {
		type: String,
		unique: true,
		required: true
	},
	seq: {
		type: Number,
		default: 0,
		required: true
	}
};

var mongooseLocal = null;
var schema = null;

exports.init = function (mongoose) {
	mongooseLocal = mongoose;
	schema = new(mongooseLocal.Schema)(thisSchema);
	schema.statics.getNext = function (modelName) {
		let thisModel = this;
		return new Promise((resolve, reject) => {
			let which = {
					id: modelName
				},
				cmd = {
					$inc: {
						seq: 1
					}
				},
				opts = {
					new: true
				};

			thisModel.findOneAndUpdate(which, cmd, opts)
				.then((doc) => {
					if (doc) {
						resolve(doc.seq);
					} else {
						let t = {
							id: modelName,
							seq: 1
						};
						thisModel.collection.insert(t)
							.then(() => {
								resolve(1);
							});
					}
				})
				.catch(reject);
		});
	};

	var model = null;
	try {
		model = mongooseLocal.model('Increment', schema);
	} catch (e) {
		model = mongooseLocal.model('Increment');
	}
	exports.model = model;
	exports.next = model.getNext.bind(model);
};
