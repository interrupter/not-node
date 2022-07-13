const {
    HttpExceptionUnauthorized,
    HttpExceptionForbidden,
} = require("../../src/exceptions/http");

module.exports = ({ Auth, HttpError, expect }) => {
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
                    user: {},
                    session: {},
                };
                let result = Auth.extractAuthData(req);
                expect(result).to.deep.equal({
                    root: false,
                    auth: false,
                    role: undefined,
                    uid: undefined,
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
                    },
                    next = function (val) {
                        return val;
                    };
                let result = Auth.checkUser(req, false, next);
                expect(result).to.be.instanceOf(HttpExceptionUnauthorized);
            });
        });

        describe("checkRoot", function () {
            it("check if admin exists and continues", function () {
                const req = {
                        session: {
                            user: true,
                            role: [Auth.DEFAULT_USER_ROLE_FOR_ADMIN],
                        },
                    },
                    next = function (val) {
                        return val;
                    };
                let result = Auth.checkRoot(req, false, next);
                expect(result).to.deep.equal();
            });

            it("check if admin exists and throw exception", function () {
                const req = {
                        session: {
                            user: true,
                            role: "manager",
                        },
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
                            role: [Auth.DEFAULT_USER_ROLE_FOR_ADMIN],
                        },
                    },
                    next = function (val) {
                        return val;
                    };
                let result = Auth.checkAdmin(req, false, next);
                expect(result).to.deep.equal();
            });
        });

        describe("checkRoleBuilder", function () {
            it("Role", function () {
                const role = "user",
                    req = {
                        session: {
                            user: true,
                            role: "user",
                        },
                    },
                    next = function (val) {
                        return val;
                    };
                let resultFunction = Auth.checkRoleBuilder(role),
                    result = resultFunction(req, false, next);
                expect(result).to.deep.equal();
            });

            it("Role with error", function () {
                const role = "manager",
                    req = {
                        session: {
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
