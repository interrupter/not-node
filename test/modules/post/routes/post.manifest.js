module.exports = {
	model: 'post',
	url: '/api/:modelName',
	actions:{
		list:{
			method: 'get',
			rules:[{
				auth: false
			},{
				auth: true,
				actionPrefix: 'user'
			},{
				root: true,
				actionName: 'listForAdmin'
			}]
		},
		listAll:{
			method: 'get',
			rules:[{
				auth: true,
				role: ['manager'],
				actionName: 'managerListAll'
			},{
				root: true,
				actionPrefix: '__',
				actionName: 'listForAdmin'
			}]
		}
	}
};
