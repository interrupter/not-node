module.exports = {
	model: 'file',
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
