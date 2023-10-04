const {
    HttpExceptionUnauthorized,
    HttpExceptionForbidden,
} = require("../../src/exceptions/http");

const notAppIdentity = require("../../src/identity/index");
const IdentityProviderSession = require("../../src/identity/providers/session");

module.exports = ({ Auth, expect }) => {
    describe("Routes", () => {
        describe("getIP", () => {
            it("req.header[x-forwarded-for]", () => {
                const req = {
                    headers: {
                        "x-forwarded-for": "127.0.0.1",
                    },
                };
                let result = Auth.getIP(req);
                expect(result).to.deep.equal("127.0.0.1");
            });

            it("req.connection.remoteAddress", () => {
                const req = {
                    connection: {
                        remoteAddress: "127.0.0.1",
                    },
                };
                let result = Auth.getIP(req);
                expect(result).to.deep.equal("127.0.0.1");
            });

            it("req.socket.remoteAddress", () => {
                const req = {
                    socket: {
                        remoteAddress: "127.0.0.1",
                    },
                    get() {},
                };
                let result = Auth.getIP(req);
                expect(result).to.deep.equal("127.0.0.1");
            });

            it("req.connection.socket.remoteAddress", () => {
                const req = {
                    connection: {
                        socket: {
                            remoteAddress: "127.0.0.1",
                        },
                    },
                };
                let result = Auth.getIP(req);
                expect(result).to.deep.equal("127.0.0.1");
            });
        });

        describe("extractAuthData", () => {
            it("not authorized", () => {
                const req = {
                    headers: {
                        "x-forwarded-for": "127.0.0.1",
                    },
                    get() {},
                    user: {},
                    session: {
                        save() {},
                    },
                };
                let result = Auth.extractAuthData(req);
                expect(result).to.deep.equal({
                    root: false,
                    admin: false,
                    auth: false,
                    role: [Auth.DEFAULT_USER_ROLE_FOR_GUEST],
                    primaryRole: Auth.DEFAULT_USER_ROLE_FOR_GUEST,
                    provider: IdentityProviderSession.name,
                    uid: null,
                    sid: undefined,
                    ip: "127.0.0.1",
                });
            });
        });

        describe("checkUser", function () {
            it("check if user exists and continues", function () {
                const req = {
                        session: {
                            user: true,
                        },
                        get() {},
                    },
                    next = function (val) {
                        return val;
                    };
                let result = Auth.checkUser(req, false, next);
                expect(result).to.deep.equal();
            });

            it("check if user exists and throw exception", function () {
                const req = {
                        session: {
                            user: false,
                        },
                        get() {},
                    },
                    next = function (val) {
                        return val;
                    };
                let result = Auth.checkUser(req, false, next);
                expect(result).to.be.instanceOf(HttpExceptionUnauthorized);
            });
        });

        describe("checkRoot", function () {
            it("check if root exists and continues", function () {
                const req = {
                        get() {},
                        session: {
                            user: true,
                            role: [Auth.DEFAULT_USER_ROLE_FOR_ROOT],
                        },
                    },
                    next = function (val) {
                        return val;
                    };
                let result = Auth.checkRoot(req, false, next);
                expect(result).to.deep.equal();
            });

            it("check if root exists and throw exception", function () {
                const req = {
                        session: {
                            user: true,
                            role: "manager",
                        },
                        get() {},
                    },
                    next = function (val) {
                        return val;
                    };
                let result = Auth.checkRoot(req, false, next);
                expect(result).to.be.instanceOf(HttpExceptionForbidden);
            });
        });

        describe("checkAdmin", function () {
            it("check if admin exists and continues", function () {
                const req = {
                        session: {
                            user: true,
                            role: [Auth.DEFAULT_USER_ROLE_FOR_ROOT],
                        },
                        get() {},
                    },
                    next = function (val) {
                        return val;
                    };
                let result = Auth.checkRoot(req, false, next);
                expect(result).to.deep.equal();
            });
        });

        describe("checkRoleBuilder", function () {
            it("Role", function () {
                notAppIdentity.identity = class {
                    static of() {
                        return class {
                            static getRole() {
                                return "user";
                            }
                            static getUserId() {}
                            static isUser() {
                                return true;
                            }
                        };
                    }
                };
                const role = "user",
                    req = {},
                    next = function (val) {
                        return val;
                    };
                let resultFunction = Auth.checkRoleBuilder(role),
                    result = resultFunction(req, false, next);
                expect(result).to.deep.equal();
            });

            it("Role with error", function () {
                let saved = false;
                const role = "manager",
                    req = {
                        session: {
                            save() {
                                saved = true;
                            },
                            user: true,
                            role: "user",
                        },
                    },
                    next = function (val) {
                        return val;
                    };
                let resultFunction = Auth.checkRoleBuilder(role),
                    result = resultFunction(req, false, next);
                expect(result).to.be.instanceOf(HttpExceptionForbidden);
            });
        });
    });
};
