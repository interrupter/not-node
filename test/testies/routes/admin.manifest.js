module.exports = {
    model: 'admin',
    url: '/api/:modelName',
    actions:{
        reboot:{
            method: 'post',
            rules:[{
                root: true
            }]
        }
    }
};
