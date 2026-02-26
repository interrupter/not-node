const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const expect = require("chai").expect,
    notFieldsFilter = require("../src/fields/filter"),
    { ACTION_SIGNATURES } = require("../src/auth/const"),
    safetyProtocols = require("../src/core/safety.protocols");

const SCHEMA = () => {
    return {
        role: {
            type: [String],
            required: true,
            searchable: true,
            default: ["user"],
            validate: [],
            safe: {
                update: ["root", "admin"],
                read: ["@owner", "root", "admin"],
            },
        },
        name: {
            type: String,
            safe: {
                update: ["@system", "@owner", "root", "admin"],
                read: ["@*"],
            },
        },
        salt: {
            type: String,
            required: true,
        },
        telephone: {
            type: String,
            unique: false,
            searchable: true,
            required: false,
            safe: {
                update: ["@owner", "root", "admin"],
                read: ["@owner", "root", "admin"],
            },
        },
        username: {
            type: String,
            unique: true,
            searchable: true,
            required: true,
            safe: {
                read: ["*"],
            },
        },
        confirm: {
            type: Schema.Types.Mixed,
            required: false,
            searchable: true,
            safe: {
                update: ["@system", "root", "admin"],
            },
        },
        code: {
            type: String,
            searchable: true,
            required: true,
        },
        country: {
            type: String,
            required: false,
            searchable: true,
            default: "ru",
            safe: notFieldsFilter.mergeSafetyProtocols(
                {
                    update: ["@system", "@owner", "root", "admin"],
                    read: "*",
                },
                safetyProtocols.publicReadable
            ),
        },
        email: {
            type: String,
            unique: true,
            searchable: true,
            required: true,
            safe: {
                update: ["@owner", "root", "admin"],
                read: ["@owner", "root", "admin"],
            },
        },
    };
};

describe("Fields/notFieldsFilter", function () {
    describe("userSets", () => {
        it("static getter", () => {
            expect(notFieldsFilter.userSets).to.be.deep.equal({});
        });
    });

    describe("addSet", () => {
        it("add new", () => {
            const result = notFieldsFilter.addSet("test1", [
                "field1",
                "-field2",
            ]);
            expect(result).to.be.true;
            expect(notFieldsFilter.userSets).to.have.key("test1");
            expect(notFieldsFilter.userSets.test1).to.be.deep.equal([
                "field1",
                "-field2",
            ]);
        });

        it("add new with faulty items, discarded", () => {
            const result = notFieldsFilter.addSet("test2", [123123, "-field2"]);
            expect(result).to.be.false;
            expect(notFieldsFilter.userSets).to.not.have.key("test2");
        });

        it("add new with restricted name, discarded", () => {
            const result = notFieldsFilter.addSet("*", ["-field2"]);
            expect(result).to.be.false;
            expect(notFieldsFilter.userSets).to.not.have.key("test2");
        });
    });

    describe("removeSet", () => {
        it("set exists", () => {
            const result = notFieldsFilter.removeSet("test1");
            expect(result).to.be.true;
        });

        it("set not exists", () => {
            const result = notFieldsFilter.removeSet("test1");
            expect(result).to.be.false;
        });
    });

    describe("isSpecialSet", () => {
        it("exclude special set", () => {
            const name = "-@*";
            const result = notFieldsFilter.isSpecialSet(name);
            expect(result).to.be.true;
        });
    });
    describe("specials", () => {
        it("static specials getter", () => {
            const result = notFieldsFilter.specials;
            expect(result).to.be.instanceOf(Object);
            expect(result).to.have.all.keys([
                "ALL",
                "SAFE",
                "UNSAFE",
                "TIMESTAMPS",
                "OWNAGE",
                "VERSIONING",
                "ID_NUMERIC",
                "ID_UUID",
            ]);
        });

        it("SPECIAL_SET_SAFE; action=update other undefined", () => {
            const result = notFieldsFilter.getSpecialSetContent(
                notFieldsFilter.specials.SAFE,
                SCHEMA(),
                { action: "update" }
            );
            expect(result).to.be.deep.equal([]);
        });

        it("SPECIAL_SET_SAFE; action=read other undefined", () => {
            const result = notFieldsFilter.getSpecialSetContent(
                notFieldsFilter.specials.SAFE,
                SCHEMA(),
                { action: "read" }
            );
            expect(result).to.be.deep.equal(["name", "username", "country"]);
        });
    });

    describe("specialsToPlain", () => {
        it("get all fields ['@*']", () => {
            const result = notFieldsFilter.specialsToPlain(["@*"], SCHEMA(), {
                modelName: "SomeModel",
            });
            const target = ["_id", "someModelID", ...Object.keys(SCHEMA())];
            expect(Array.isArray(result)).to.be.true;
            expect(result.length).to.be.equal(target.length);
            expect(result).to.be.deep.equal(target);
        });

        it("get all fields ['@*']", () => {
            const result = notFieldsFilter.specialsToPlain(["@*"], SCHEMA(), {
                modelName: "SomeModel",
            });
            const target = ["_id", "someModelID", ...Object.keys(SCHEMA())];
            expect(Array.isArray(result)).to.be.true;
            expect(result.length).to.be.equal(target.length);
            expect(result).to.be.deep.equal(target);
        });

        it("list with special set exclusions", () => {
            const list = ["id", "name", "-@versioning"];
            const result = notFieldsFilter.specialsToPlain(list, SCHEMA(), {
                modelName: "SomeModel",
            });
            expect(result).to.be.deep.equal([
                "id",
                "name",
                "-__version",
                "-__versions",
                "-__closed",
                "-__latest",
                "-__v",
            ]);
        });
    });

    describe("removeExcludedFields", () => {
        it("empty list", () => {
            const list = [];
            const result = notFieldsFilter.removeExcludedFields(list);
            expect(result).to.be.deep.equal([]);
        });

        it("list without exclusions", () => {
            const list = ["id", "name"];
            const result = notFieldsFilter.removeExcludedFields(list);
            expect(result).to.be.deep.equal(["id", "name"]);
        });

        it("list with exclusions but no target fields presentation in list", () => {
            const list = ["-gag", "id", "name", "-data", "-time"];
            const result = notFieldsFilter.removeExcludedFields(list);
            expect(result).to.be.deep.equal(["id", "name"]);
        });

        it("list with exclusions predicating includsions", () => {
            const list = ["-id", "id", "name", "-name", "-time"];
            const result = notFieldsFilter.removeExcludedFields(list);
            expect(result).to.be.deep.equal(["id"]);
        });

        it("list with exclusions, end up empty", () => {
            const list = ["id", "-id", "name", "-name", "-time"];
            const result = notFieldsFilter.removeExcludedFields(list);
            expect(result).to.be.deep.equal([]);
        });

        it("list with exclusions, but later inclusions", () => {
            const list = ["id", "-id", "name", "-name", "id"];
            const result = notFieldsFilter.removeExcludedFields(list);
            expect(result).to.be.deep.equal(["id"]);
        });
    });

    describe("fieldsListIsNotPlain", () => {
        it("plain list", () => {
            const fields = ["field1", "field2"];
            expect(notFieldsFilter.fieldsListIsNotPlain(fields)).to.be.false;
        });

        it("not plain list, exlusion", () => {
            const fields = ["field1", "-field2"];
            expect(notFieldsFilter.fieldsListIsNotPlain(fields)).to.be.true;
        });

        it("not plain list, special set", () => {
            const fields = ["@safe"];
            expect(notFieldsFilter.fieldsListIsNotPlain(fields)).to.be.true;
        });
    });

    describe("filter", () => {
        it("complex operations exclude/include with deep of 3", () => {
            notFieldsFilter.addSet("user1", ["-@safe"]);
            notFieldsFilter.addSet("user2", ["-@user1"]);
            const result = notFieldsFilter.filter(
                ["id", "name", "@user2"],
                SCHEMA(),
                {
                    action: "read",
                }
            );
            expect(result).to.be.deep.equal([
                "id",
                "name",
                "username",
                "country",
            ]);
        });
    });

    describe("mergeSafetyProtocols", () => {
        it("ownerRootAdmin + publicReadable", () => {
            const result = notFieldsFilter.mergeSafetyProtocols(
                safetyProtocols.ownerRootAdmin,
                safetyProtocols.publicReadable
            );
            expect(result).to.be.deep.equal({
                [ACTION_SIGNATURES.CREATE]: ["@owner", "root", "admin"],
                [ACTION_SIGNATURES.READ]: ["@owner", "root", "admin", "@*"],
                [ACTION_SIGNATURES.UPDATE]: ["@owner", "root", "admin"],
                [ACTION_SIGNATURES.DELETE]: ["@owner", "root", "admin"],
            });
        });

        it("ownerRootAdmin - @owner", () => {
            const result = notFieldsFilter.mergeSafetyProtocols(
                safetyProtocols.ownerRootAdmin,
                {
                    [ACTION_SIGNATURES.CREATE]: ["-@owner"],
                    [ACTION_SIGNATURES.READ]: ["-@owner"],
                    [ACTION_SIGNATURES.UPDATE]: ["-@owner"],
                    [ACTION_SIGNATURES.DELETE]: ["-@owner"],
                }
            );
            expect(result).to.be.deep.equal({
                [ACTION_SIGNATURES.CREATE]: ["root", "admin"],
                [ACTION_SIGNATURES.READ]: ["root", "admin"],
                [ACTION_SIGNATURES.UPDATE]: ["root", "admin"],
                [ACTION_SIGNATURES.DELETE]: ["root", "admin"],
            });
        });
    });

    describe("initSafetyProtocol", () => {
        it("empty", () => {
            const result = notFieldsFilter.initSafetyProtocol();
            expect(result).to.be.deep.equal({
                [ACTION_SIGNATURES.CREATE]: [],
                [ACTION_SIGNATURES.READ]: [],
                [ACTION_SIGNATURES.UPDATE]: [],
                [ACTION_SIGNATURES.DELETE]: [],
            });
        });

        it("all = user", () => {
            const result = notFieldsFilter.initSafetyProtocol(
                undefined,
                undefined,
                undefined,
                undefined,
                ["user"]
            );
            expect(result).to.be.deep.equal({
                [ACTION_SIGNATURES.CREATE]: ["user"],
                [ACTION_SIGNATURES.READ]: ["user"],
                [ACTION_SIGNATURES.UPDATE]: ["user"],
                [ACTION_SIGNATURES.DELETE]: ["user"],
            });
        });

        it("CRUD - @owner", () => {
            const result = notFieldsFilter.initSafetyProtocol(
                ["@owner"],
                ["@owner"],
                ["@owner"],
                ["@owner"]
            );
            expect(result).to.be.deep.equal({
                [ACTION_SIGNATURES.CREATE]: ["@owner"],
                [ACTION_SIGNATURES.READ]: ["@owner"],
                [ACTION_SIGNATURES.UPDATE]: ["@owner"],
                [ACTION_SIGNATURES.DELETE]: ["@owner"],
            });
        });

        it("D - -@owner, ALL - @owner, root, admin", () => {
            const result = notFieldsFilter.initSafetyProtocol(
                undefined,
                undefined,
                undefined,
                ["-@owner"],
                ["@owner", "root", "admin"]
            );
            expect(result).to.be.deep.equal({
                [ACTION_SIGNATURES.CREATE]: ["@owner", "root", "admin"],
                [ACTION_SIGNATURES.READ]: ["@owner", "root", "admin"],
                [ACTION_SIGNATURES.UPDATE]: ["@owner", "root", "admin"],
                [ACTION_SIGNATURES.DELETE]: ["root", "admin"],
            });
        });
    });
});
