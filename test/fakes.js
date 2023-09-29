const { DEFAULT_USER_ROLE_FOR_GUEST } = require("../src/auth");

module.exports = {
    createFakeEmit: (val, err) => {
        return async () => {
            if (err) {
                throw err;
            } else {
                return val;
            }
        };
    },
    fakeIdentity: (
        id = {
            root: false,
            admin: false,
            auth: false,
            role: [DEFAULT_USER_ROLE_FOR_GUEST],
            primaryRole: DEFAULT_USER_ROLE_FOR_GUEST,
            uid: undefined,
            sid: undefined,
            ip: undefined,
        }
    ) => {
        return class {
            static of() {
                return class {
                    static isRoot() {
                        return id.root;
                    }
                    static isAdmin() {
                        return id.admin;
                    }
                    static isUser() {
                        return id.auth;
                    }
                    static getRole() {
                        return id.role;
                    }
                    static getPrimaryRole() {
                        return id.primaryRole;
                    }
                    static getUserId() {
                        return id.uid;
                    }
                    static getSessionId() {
                        return id.sid;
                    }
                    static getIP() {
                        return id.ip;
                    }
                };
            }
        };
    },
};
