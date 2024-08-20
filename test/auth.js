require("not-log")(false);

const expect = require("chai").expect,
    auth = require("../src/auth"),
    HttpError = require("../src/error").Http;

describe("Auth", function () {
    describe("intersect_safe", function () {
        it("a - array, b - array", function () {
            var res = auth.intersect_safe(
                ["safe1", "safe", "unsafebutpresented"],
                ["unsafe", "safe", "safeguard"]
            );
            expect(res).to.deep.equal(["safe"]);
        });

        it("a - array, b - array with more length", function () {
            var res = auth.intersect_safe(
                ["safe1", "safe", "unsafebutpresented"],
                ["unsafe", "safeasdfjsdjkf", "safe", "safeguard"]
            );
            expect(res).to.deep.equal(["safe"]);
        });

        it("a - null, b - null", function () {
            var res = auth.intersect_safe(null, null);
            expect(res).to.deep.equal([]);
        });

        it("intersection of a and b equals empty", function () {
            var res = auth.intersect_safe(["safe1"], ["safe2"]);
            expect(res).to.deep.equal([]);
        });

        it("intersection of a = b", function () {
            var res = auth.intersect_safe(["safe"], ["safe"]);
            expect(res).to.deep.equal(["safe"]);
        });
    });

    describe("compareRoles", function () {
        it("user - guest, action - root", function () {
            var res = auth.compareRoles("guest", "root");
            expect(res).to.deep.equal(false);
        });

        it("user - guest, action - guest", function () {
            var res = auth.compareRoles("guest", "guest");
            expect(res).to.deep.equal(true);
        });

        it("user - guest, action - [root, admin]", function () {
            var res = auth.compareRoles("guest", ["root", "admin"]);
            expect(res).to.deep.equal(false);
        });

        it("user - guest, action - [root, admin, guest], strict - false", function () {
            var res = auth.compareRoles(
                "guest",
                ["root", "admin", "guest"],
                false
            );
            expect(res).to.deep.equal(true);
        });

        it("user - guest, action - [root, admin, guest], strict - true", function () {
            var res = auth.compareRoles("guest", ["root", "admin", "guest"]);
            expect(res).to.deep.equal(false);
        });

        it("user - [user, notActivated], action - notActivated", function () {
            var res = auth.compareRoles(
                ["user", "notActivated"],
                "notActivated"
            );
            expect(res).to.deep.equal(true);
        });

        it("user - [user, notActivated, jailed], action - [root, manager]", function () {
            var res = auth.compareRoles(
                ["user", "notActivated", "jailed"],
                ["root", "manager"]
            );
            expect(res).to.deep.equal(false);
        });
    });

    describe("checkCredentials", function () {
        const rule = {
            admin: true,
            role: "root",
            auth: true,
        };
        it("rule (admin, root, authentificated),  auth - true, role - root, root - true ", function () {
            const res = auth.checkCredentials(rule, true, "root", true);
            expect(res).to.deep.equal(true);
        });

        it("rule (admin, root, authentificated),  auth - true, role - root, root - false ", function () {
            const res = auth.checkCredentials(rule, true, "root", false);
            expect(res).to.deep.equal(false);
        });

        it("rule - empty,  auth - true, role - root, root - false ", function () {
            const res = auth.checkCredentials({}, true, "root", false);
            expect(res).to.deep.equal(false);
        });

        it("rule - null,  auth - true, role - root, root - false ", function () {
            const res = auth.checkCredentials(null, true, "root", false);
            expect(res).to.deep.equal(false);
        });

        it("rule - (auth),  auth - true, role - root, root - false ", function () {
            const res = auth.checkCredentials(
                { auth: true },
                true,
                "root",
                false
            );
            expect(res).to.deep.equal(true);
        });

        it("rule - (role: 'notActivated'),  auth - true, role - root, root - false ", function () {
            const res = auth.checkCredentials(
                { role: "notActivated" },
                true,
                "root",
                false
            );
            expect(res).to.deep.equal(false);
        });

        it("rule - (role: 'user', auth),  auth - true, role - user, root - false ", function () {
            const res = auth.checkCredentials(
                { role: "user", auth: true },
                true,
                "user",
                false
            );
            expect(res).to.deep.equal(true);
        });

        it("rule - (role: 'user', !auth),  auth - false, role - user, root - false ", function () {
            const res = auth.checkCredentials(
                { role: "user", auth: false },
                false,
                "user",
                false
            );
            expect(res).to.deep.equal(true);
        });

        it("rule - (role: 'user'),  auth - false, role - user, root - false ", function () {
            const res = auth.checkCredentials(
                { role: "user" },
                false,
                "user",
                false
            );
            expect(res).to.deep.equal(true);
        });

        it("rule - (auth),  auth - true, role - user, root - false ", function () {
            const res = auth.checkCredentials(
                { auth: true },
                true,
                "user",
                false
            );
            expect(res).to.deep.equal(true);
        });

        it("rule - (!auth),  auth - false, role - user, root - false ", function () {
            const res = auth.checkCredentials(
                { auth: false },
                false,
                "user",
                false
            );
            expect(res).to.deep.equal(true);
        });

        it("rule - (auth),  auth - false, role - user, root - false ", function () {
            const res = auth.checkCredentials(
                { auth: true },
                false,
                "user",
                false
            );
            expect(res).to.deep.equal(false);
        });

        it("rule - (!auth),  auth - false, role - user, root - true ", function () {
            const res = auth.checkCredentials(
                { auth: false },
                false,
                "user",
                true
            );
            expect(res).to.deep.equal(true);
        });

        it("rule - (admin),  auth - false, role - user, root - true ", function () {
            const res = auth.checkCredentials(
                { admin: true },
                false,
                "user",
                true
            );
            expect(res).to.deep.equal(true);
        });

        it("rule - (!auth, 'notActivated', false),  auth - false, role - notActivated, root - false ", function () {
            const res = auth.checkCredentials(
                { auth: false, role: "notActivated" },
                false,
                "notActivated",
                false
            );
            expect(res).to.deep.equal(true);
        });

        it("rule - (!auth, 'notActivated', undefined),  auth - false, role - false, root - false ", function () {
            const res = auth.checkCredentials(
                { auth: false, role: "notActivated" },
                false,
                false,
                false
            );
            expect(res).to.deep.equal(false);
        });

        it("rule - (admin),  auth - false, role - false, root - true ", function () {
            const res = auth.checkCredentials(
                { admin: true },
                false,
                false,
                true
            );
            expect(res).to.deep.equal(true);
        });
    });

    describe("checkSupremacy", function () {
        it("Both undefined, order undefined", function () {
            let resultFunction = () => {
                auth.checkSupremacy(undefined, "undefined", undefined);
            };
            expect(resultFunction).to.throw();
            resultFunction = () => {
                auth.checkSupremacy("undefined", undefined, undefined);
            };
            expect(resultFunction).to.throw();
            resultFunction = () => {
                auth.checkSupremacy("undefined", "undefined", undefined);
            };
            expect(resultFunction).to.throw();
        });

        it("Both undefined, order defined but not Array", function () {
            let resultFunction = () => {
                auth.checkSupremacy("undefined", "undefined", 12);
            };
            expect(resultFunction).to.throw();
        });

        it("Both undefined, order defined Array with wrong types of element", function () {
            let resultFunction = () => {
                auth.checkSupremacy("undefined", "undefined", [null]);
            };
            expect(resultFunction).to.throw();
        });

        it("Both defined, order list dont contains roles of sets", function () {
            expect(
                auth.checkSupremacy("undefined", "undefined", ["root"])
            ).to.be.equal(false);
        });

        it("Various situations with valid input", function () {
            expect(
                auth.checkSupremacy("undefined", "undefined", [
                    "root",
                    "admin",
                    "client",
                    "user",
                    "guest",
                ])
            ).to.be.equal(false);
            expect(
                auth.checkSupremacy(
                    "root",
                    ["root"],
                    ["root", "admin", "client", "user", "guest"]
                )
            ).to.be.equal(false);
            expect(
                auth.checkSupremacy("undefined", "root", [
                    "root",
                    "admin",
                    "client",
                    "user",
                    "guest",
                ])
            ).to.be.equal(false);
            expect(
                auth.checkSupremacy("undefined", "guest", [
                    "root",
                    "admin",
                    "client",
                    "user",
                    "guest",
                ])
            ).to.be.equal(false);
            expect(
                auth.checkSupremacy(
                    "root",
                    ["undefined", "manager"],
                    ["root", "admin", "client", "user", "guest"]
                )
            ).to.be.equal(true);
            expect(
                auth.checkSupremacy("client", "root", [
                    "root",
                    "admin",
                    "client",
                    "user",
                    "guest",
                ])
            ).to.be.equal(false);
            expect(
                auth.checkSupremacy("client", "client", [
                    "root",
                    "admin",
                    "client",
                    "user",
                    "guest",
                ])
            ).to.be.equal(false);
            expect(
                auth.checkSupremacy("guest", "guest", [
                    "root",
                    "admin",
                    "client",
                    "user",
                    "guest",
                ])
            ).to.be.equal(false);
            expect(
                auth.checkSupremacy("guest", "root", [
                    "root",
                    "admin",
                    "client",
                    "user",
                    "guest",
                ])
            ).to.be.equal(false);
            expect(
                auth.checkSupremacy(
                    "client",
                    ["root", "guest"],
                    ["root", "admin", "client", "user", "guest"]
                )
            ).to.be.equal(false);
            expect(
                auth.checkSupremacy("client", "guest", [
                    "root",
                    "admin",
                    "client",
                    "user",
                    "guest",
                ])
            ).to.be.equal(true);
            expect(
                auth.checkSupremacy(["admin", "manager"], "guest", [
                    "root",
                    "admin",
                    "client",
                    "user",
                    "guest",
                ])
            ).to.be.equal(true);
            expect(
                auth.checkSupremacy(["client", "manager"], "client", [
                    "root",
                    "admin",
                    "client",
                    "user",
                    "guest",
                ])
            ).to.be.equal(false);
            expect(
                auth.checkSupremacy(["admin"], "root", [
                    "root",
                    "admin",
                    "client",
                    "user",
                    "guest",
                ])
            ).to.be.equal(false);
            expect(
                auth.checkSupremacy("manager", "client", [
                    "root",
                    "admin",
                    "client",
                    "user",
                    "guest",
                ])
            ).to.be.equal(false);
            expect(
                auth.checkSupremacy("admin", "client", [
                    "root",
                    "admin",
                    "client",
                    "user",
                    "guest",
                ])
            ).to.be.equal(true);
        });
    });

    require("./auth/routes.js")({ Auth: auth, HttpError, expect });
    require("./auth/roles.js")({ Auth: auth, HttpError, expect });
    require("./auth/rules.js")({ Auth: auth, HttpError, expect });
    require("./auth/obsolete.js")({ Auth: auth, HttpError, expect });
    require("./auth/fields.js")({ Auth: auth, HttpError, expect });
});
