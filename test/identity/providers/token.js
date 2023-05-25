const Provider = require("../../../src/identity/providers/token");
const mongoose = require("mongoose");
const JWT = require("jsonwebtoken");

function stubReq({ headers }) {
    return {
        get(name) {
            return headers[name];
        },
    };
}

function stubReqWithTokenContent({ tokenContent, secret }) {
    const headers = {
        Authentication: "Bearer " + JWT.toString(tokenContent, secret),
    };
    return {
        get(name) {
            return headers[name];
        },
    };
}

module.exports = ({ expect }) => {
    describe(`${Provider.name}`, () => {
        /* describe("isUser", function () {
            it("check if user exists - true", function () {
                var t = {
                    session: {
                        user: true,
                    },
                };
                var res = new Provider(t).isUser();
                expect(res).to.eql(true);
            });
            it("check if user exists - false", function () {
                var t = {
                    session: {},
                };
                var res = new Provider(t).isUser();
                expect(res).to.eql(false);
            });
        });

        describe("isRoot", function () {
            it("check if user admin - true", function () {
                var t = {
                    session: {
                        user: mongoose.Types.ObjectId(),
                        role: "root",
                    },
                };
                var res = new Provider(t).isRoot();
                expect(res).to.eql(true);
            });
            it("check if user admin - false", function () {
                var t = {
                    session: {
                        user: mongoose.Types.ObjectId(),
                    },
                };
                var res = new Provider(t).isRoot();
                expect(res).to.eql(false);
            });
        });

        describe("getRole", function () {
            it("get role - root", function () {
                var t = {
                    session: {
                        user: mongoose.Types.ObjectId(),
                        role: "root",
                    },
                };
                var res = new Provider(t).getRole();
                expect(res).to.eql("root");
            });
            it("get role - undefined", function () {
                var t = {
                    session: {
                        user: mongoose.Types.ObjectId(),
                    },
                };
                var res = new Provider(t).getRole();
                expect(res).to.eql(undefined);
            });
        });

        describe("setRole", function () {
            it("session exist, set role - root", function () {
                var t = {
                    session: {
                        user: mongoose.Types.ObjectId(),
                        role: "user",
                    },
                };
                new Provider(t).setRole("root");
                expect(t.tokenContent.role).to.eql("root");
            });

            it("session not exist, set role - admin", function () {
                var t = {};
                new Provider(t).setRole("admin");
                expect(t).to.be.deep.eql({});
            });
        });

        describe("setUserId", function () {
            it("session exist, set _id", function () {
                const t = {
                    session: {
                        role: "user",
                    },
                };
                const id = mongoose.Types.ObjectId();
                Auth.setUserId(t, id);
                expect(t.session.user).to.eql(id);
            });

            it("session not exist, set _id", function () {
                const t = {};
                const id = mongoose.Types.ObjectId();
                Auth.setUserId(t, id);
                expect(t).to.be.deep.eql({});
            });
        });

        describe("getUserId", function () {
            it("session exist, user id exist", function () {
                const t = {
                    session: {
                        user: mongoose.Types.ObjectId(),
                        role: "user",
                    },
                };
                const id = Auth.getUserId(t);
                expect(id.toString()).to.eql(t.session.user.toString());
            });

            it("session not exist", function () {
                const t = {};
                const id = Auth.getUserId(t);
                expect(id).to.be.deep.eql(undefined);
            });
        });

        describe("getSessionId", function () {
            it("session exist, session id exist", function () {
                const t = {
                    session: {
                        id: mongoose.Types.ObjectId(),
                        role: "user",
                    },
                };
                const id = Auth.getSessionId(t);
                expect(id.toString()).to.eql(t.session.id.toString());
            });

            it("session not exist", function () {
                const t = {};
                const id = Auth.getSessionId(t);
                expect(id).to.be.deep.eql(undefined);
            });
        });

        describe("setAuth", function () {
            it("session exist", function () {
                const t = {
                    session: {},
                };
                const id = mongoose.Types.ObjectId();
                Auth.setAuth(t, id, "root");
                expect(t.session.user.toString()).to.eql(id.toString());
                expect(t.session.role).to.eql("root");
            });

            it("session not exist", function () {
                const t = {};
                const id = mongoose.Types.ObjectId();
                Auth.setAuth(t, id, "user");
                expect(t).to.be.deep.eql({});
            });
        });

        describe("setGuest", function () {
            it("session exist", function () {
                const id = mongoose.Types.ObjectId();
                const t = {
                    session: { user: id, role: "admin" },
                    user: { _id: id },
                };
                Auth.setGuest(t);
                expect(t.session.user).to.eql(null);
                expect(t.user).to.eql(null);
                expect(t.session.role).to.eql(["guest"]);
            });

            it("session not exist", function () {
                const t = {};
                Auth.setGuest(t);
                expect(t).to.be.deep.eql({});
            });
        });

        describe("cleanse", function () {
            it("session exist, destroy method exists", function () {
                const id = mongoose.Types.ObjectId();
                let destroyed = false;
                const t = {
                    session: {
                        user: id,
                        role: "admin",
                        destroy() {
                            destroyed = true;
                        },
                    },
                };
                Auth.cleanse(t);
                expect(t.session.user).to.eql(null);
                expect(t.session.role).to.eql(["guest"]);
                expect(destroyed).to.eql(true);
            });

            it("session exist, destroy method exists", function () {
                const id = mongoose.Types.ObjectId();
                const t = {
                    session: {
                        user: id,
                        role: "admin",
                    },
                };
                Auth.cleanse(t);
                expect(t.session.user).to.eql(null);
                expect(t.session.role).to.eql(["guest"]);
            });

            it("session not exist", function () {
                const t = {};
                Auth.cleanse(t);
                expect(t).to.be.deep.eql({});
            });
        });*/
    });
};
