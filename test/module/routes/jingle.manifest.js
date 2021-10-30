module.exports = {
	model: 'jingle',
	url: '/api/:modelName',
	actions:{
		list:{
			method: 'get',
			rules:[{
				root: true
			}]
		}
	}
};
