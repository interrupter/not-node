module.exports = {
	model: 'logo',
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
