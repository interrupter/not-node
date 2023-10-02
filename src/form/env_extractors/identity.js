const notAppIdentity = require("../../identity");

module.exports = (form, req) => {
    return {
        name: "identity",
        value: notAppIdentity.extractAuthData(req),
    };
};
