'use strict';
var https = require('https'),
	apiGroups = ['clean', 'suggest'],
	apiUrl = {
		clean: '/api/v2/clean/',
		suggest: '/suggestions/api/4_1/rs/suggest/'
	},
	apiTypes = {
		clean: ['address', 'birthdate', 'email', 'name', 'phone'],
		suggest: ['fio', 'address', 'party', 'email', 'bank']
	};

// request sender
function reqSend(apiGroup, apiType, queries, callback) {
	/* jshint validthis:true */
	var req;

	// handle invalid apiType
	if(apiGroups.indexOf(apiGroup) === -1)
		return callback({
			code: -3,
			message: 'node-dadata: invalid apiGroup'
		});

	// handle invalid apiType
	if(apiTypes[apiGroup].indexOf(apiType) === -1)
		return callback({
			code: -2,
			message: 'node-dadata: invalid apiType'
		});

	// ok
	else {

		// set api endpoint
		this.reqOptions[apiGroup].path = apiUrl[apiGroup] + apiType;
		console.log(this.reqOptions);
		// create request
		req = https.request(this.reqOptions[apiGroup], function(res) {
			var body = '';

			// handle http error
			if(res.statusCode !== 200)
				return callback({
					code: res.statusCode,
					message: 'HTTP ERROR: bad status code'
				});
			// ok
			else {
				res.on('data', function(chunk) {
					body += chunk;
				});
				res.on('end', function() {
					callback(null, JSON.parse(body));
				});
			}
		});

		// handle request error
		req.on('error', function(err) {
			callback({
				code: -1,
				message: 'REQUEST ERROR: ' + err.message
			});
		});

		// send request body
		// utf8 is by default
		if (apiGroup === 'clean'){
			req.write(JSON.stringify(queries));
		}else{
			req.write(JSON.stringify({query: queries, count: 5}));
		}
		req.end();
	}
};

// service constructor
function DaData(API_KEY, SECRET_KEY) {
	// fail if no keys provided
	if(!API_KEY || !SECRET_KEY) {
		console.log('node-dadata: keys are strongly required');
		return null;
	}
	// don't fail if someone have forgotten about new
	else if(!(this instanceof DaData))
		return new DaData(API_KEY, SECRET_KEY);
	// ok
	else {
		// set request options
		this.reqOptions = {
			'clean':{
				method: 'POST',
				hostname: 'dadata.ru',
				port: 443,
				headers: {
					'Content-Type': 'application/json',
					'Authorization': 'Token ' + API_KEY,
					'X-Secret': SECRET_KEY
				}
			},
			'suggest':{
				method: 'POST',
				hostname: 'suggestions.dadata.ru',
				port: 443,
				headers: {
					'Content-Type': 'application/json',
					'Authorization': 'Token 596a55480dcf390a6465839e6980b9e1cafe7a21'
				}
			},
		};
		// return request sender
		return reqSend.bind(this);
	}
};

// exports
module.exports = DaData;
