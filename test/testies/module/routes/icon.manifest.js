module.exports = {
	model: 'icon',
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
