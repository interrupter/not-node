var thisSchema = {
	_id: {
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

exports.init = function(mongoose){
	mongooseLocal = mongoose;
	schema = new (mongooseLocal.Schema)(thisSchema);
	schema.statics.getNext = function(modelName, callbackOK, callbackError){
		var thisModel = this;
		thisModel.findOneAndUpdate({
			_id: modelName
		}, {
			$inc: {
				seq: 1
			}
		}, {
			new: true
		}, function(err, doc) {
			if(err) {
				if (callbackError) {callbackError(err);}
			} else {
				if(doc) {
					if (callbackOK) {callbackOK(doc.seq);}
				} else {
					thisModel.collection.insert({
						_id: modelName,
						seq: 1
					});
					if (callbackOK) {callbackOK(1);}
				}
			}
		});
	};

	var model = null;
	try{
		model =  mongooseLocal.model('Increment', schema);
	}catch(e){		
		model = mongooseLocal.model('Increment');
	}
	exports.model = model;
	exports.next = model.getNext.bind(model);
};
