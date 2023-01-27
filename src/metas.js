const Auth = require("./auth"),
    Env = require("./env"),
    notStyler = require("./styler"),
    config = require("not-config").createReader();

function getRole(req) {
    if (Auth.isUser(req) && req.user) {
        return req.user.getPrimaryRole(Env.getEnv("rolesPriority"));
    } else {
        return Auth.DEFAULT_USER_ROLE_FOR_GUEST;
    }
}

const DEFAULT_STYLER = (req, res) => {
    const role = getRole(req);
    const host = config.get("fullServerName");
    const canonical = host + req.originalUrl;

    return {
        title: res?.options?.APP_TITLE,
        desription: res?.options?.APP_DESCRIPTION,
        canonical,
        rand: Math.random(),
        host,
        role,
        authenticated: role !== Auth.DEFAULT_USER_ROLE_FOR_GUEST,
    };
};

class notMetasStyler extends notStyler {}

notMetasStyler.setDefault(DEFAULT_STYLER);

module.exports = notMetasStyler;
