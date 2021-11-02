const main = require('./logo.ws.client.js');

module.thisRouteName = 'logo';

module.exports = {
	servers: {},
	clients: {
		main
	}
};
