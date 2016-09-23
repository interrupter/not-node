module.exports = {
    model: 'user',
    url: '/api/:modelName',
    actions:{
        list:{
            method: 'get',
            rules:[{
                admin: true
            }]
        },
        profile:{
            method: 'get',
            rules:[{
                auth: true
            },{
                admin: true
            }]
        },
        activate:{
            method: 'get',
            auth: false,
            role: 'notActivated'
        }
    }
};
