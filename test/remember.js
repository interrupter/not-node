var data = {};

exports.save = function(key, val){
	//console.log(data);
	data[key] = val;
};

exports.load = function(key){
	//console.log(data[key].username);
	return data[key];
};

exports.forget = function(key){
	delete data[key];
};
