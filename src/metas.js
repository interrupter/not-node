const Auth = require("./auth"),
    notAppIdentity = require("./identity"),
    notStyler = require("./styler"),
    notEnv = require("./env");

function getRole(req) {
    const identity = new notAppIdentity(req);
    if (identity.isUser()) {
        return identity.getPrimaryRole();
    } else {
        return Auth.DEFAULT_USER_ROLE_FOR_GUEST;
    }
}

const DEFAULT_STYLER = (req, res) => {
    const role = getRole(req);
    const host = notEnv.get("fullServerName");
    const canonical = host + req.originalUrl;

    return {
        title: res?.options?.APP_TITLE,
        desription: res?.options?.APP_DESCRIPTION,
        canonical,
        rand: Math.random(),
        env: process.env.NODE_ENV,
        host,
        role,
        authenticated: role !== Auth.DEFAULT_USER_ROLE_FOR_GUEST,
    };
};

const notMetasStyler = new notStyler(DEFAULT_STYLER);

module.exports = notMetasStyler;
