const getIP = require("../../auth").getIP;

module.exports = (form, req) => {
    return {
        name: "ip",
        value: getIP(req),
    };
};
