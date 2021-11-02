module.thisRouteName = 'file';

const main = require('./file.ws.server.js');

module.exports = {
	servers: { main },
	clients: {}
};
