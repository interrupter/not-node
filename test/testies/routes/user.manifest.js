module.exports = {
    model: 'user',
    url: '/api/:modelName',
    actions:{
        list:{
            method: 'get',
            rules:[{
                root: true
            }]
        },
        profile:{
            method: 'get',
            rules:[{
                auth: true
            },{
                root: true
            }]
        },
        activate:{
            method: 'get',
            auth: false,
            role: 'notActivated'
        }
    }
};
