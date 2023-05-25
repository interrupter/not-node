const Provider = require("../../../src/identity/providers/session");
const { DEFAULT_USER_ROLE_FOR_GUEST } = require("../../../src/auth/const");
const mongoose = require("mongoose");

const SESSION_NOT_EXISTS = "session not exists";

module.exports = ({ expect }) => {
    describe(`${Provider.name}`, () => {
        describe("isUser", function () {
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
                        save() {},
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
                        save() {},
                    },
                };
                var res = new Provider(t).getRole();
                expect(res).to.eql("root");
            });
            it("get role - undefined", function () {
                var t = {
                    session: {
                        user: mongoose.Types.ObjectId(),
                        save() {},
                    },
                };
                var res = new Provider(t).getRole();
                expect(res).to.eql([DEFAULT_USER_ROLE_FOR_GUEST]);
            });
        });

        describe("setRole", function () {
            it("session exist, set role - root", function () {
                var t = {
                    session: {
                        user: mongoose.Types.ObjectId(),
                        role: "user",
                        save() {},
                    },
                };
                new Provider(t).setRole("root");
                expect(t.session.role).to.eql("root");
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
                        save() {},
                    },
                };
                const id = mongoose.Types.ObjectId();
                new Provider(t).setUserId(id);
                expect(t.session.user).to.eql(id);
            });

            it("session not exist, set _id", function () {
                const t = {};
                const id = mongoose.Types.ObjectId();
                new Provider(t).setUserId(id);
                expect(t).to.be.deep.eql({});
            });
        });

        describe("getUserId", function () {
            it("session exist, user id exist", function () {
                const t = {
                    session: {
                        user: mongoose.Types.ObjectId(),
                        role: "user",
                        save() {},
                    },
                };
                const id = new Provider(t).getUserId();
                expect(id.toString()).to.eql(t.session.user.toString());
            });

            it(SESSION_NOT_EXISTS, function () {
                const t = {};
                const id = new Provider(t).getUserId();
                expect(id).to.be.deep.eql(undefined);
            });
        });

        describe("getSessionId", function () {
            it("session exist, session id exist", function () {
                const t = {
                    session: {
                        id: mongoose.Types.ObjectId(),
                        role: "user",
                        save() {},
                    },
                };
                const id = new Provider(t).getSessionId();
                expect(id.toString()).to.eql(t.session.id.toString());
            });

            it(SESSION_NOT_EXISTS, function () {
                const t = {};
                const id = new Provider(t).getSessionId();
                expect(id).to.be.deep.eql(undefined);
            });
        });

        describe("setAuth", function () {
            it("session exist", function () {
                const t = {
                    session: { save() {} },
                };
                const id = mongoose.Types.ObjectId();
                new Provider(t).setAuth(id, "root");
                expect(t.session.user.toString()).to.eql(id.toString());
                expect(t.session.role).to.eql("root");
            });

            it(SESSION_NOT_EXISTS, function () {
                const t = {};
                const id = mongoose.Types.ObjectId();
                new Provider(t).setAuth(id, "user");
                expect(t).to.be.deep.eql({});
            });
        });

        describe("setGuest", function () {
            it("session exist", function () {
                const id = mongoose.Types.ObjectId();
                const t = {
                    session: { user: id, role: "admin", save() {} },
                    user: { _id: id },
                };
                new Provider(t).setGuest();
                expect(t.session.user).to.eql(null);
                expect(t.user).to.eql(null);
                expect(t.session.role).to.eql(["guest"]);
            });

            it(SESSION_NOT_EXISTS, function () {
                const t = {};
                new Provider(t).setGuest();
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
                        save() {},
                        destroy() {
                            destroyed = true;
                        },
                    },
                };
                new Provider(t).cleanse();
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
                        save() {},
                    },
                };
                new Provider(t).cleanse();
                expect(t.session.user).to.eql(null);
                expect(t.session.role).to.eql(["guest"]);
            });

            it(SESSION_NOT_EXISTS, function () {
                const t = {};
                new Provider(t).cleanse();
                expect(t).to.be.deep.eql({});
            });
        });
    });
};
