const { notFieldsFilter } = require("..");

const {
    DEFAULT_USER_ROLE_FOR_GUEST,
    ACTION_SIGNATURES,
} = require("../src/auth");

const Schema = require("mongoose").Schema;
const expect = require("chai").expect,
    notManifestFilter = require("../src/manifest/manifest.filter");

const rawRoutesManifest = {
    admin: {
        model: "admin",
        url: "/api/:modelName",
        actions: {
            reboot: {
                method: "post",
                rules: [
                    {
                        root: true,
                    },
                ],
            },
        },
    },
    post: {
        model: "post",
        url: "/api/:modelName",
        actions: {
            list: {
                method: "get",
                rules: [
                    {
                        root: true,
                        actionName: "listForAdmin",
                    },
                    {
                        auth: true,
                        actionPrefix: "user",
                    },
                    {
                        auth: false,
                    },
                ],
            },
            listAll: {
                method: "get",
                rules: [
                    {
                        root: true,
                        actionPrefix: "__",
                        actionName: "listForAdmin",
                    },
                    {
                        auth: true,
                        role: ["manager"],
                        actionName: "managerListAll",
                    },
                ],
            },
        },
    },
    user: {
        model: "user",
        url: "/api/:modelName",
        actions: {
            list: {
                method: "get",
                rules: [
                    {
                        root: true,
                    },
                ],
            },
            profile: {
                method: "get",
                rules: [
                    {
                        root: true,
                    },
                    {
                        auth: true,
                    },
                ],
            },
            activate: {
                method: "get",
                auth: false,
                role: "notActivated",
            },
        },
    },
    journal: {},
    files: { actions: { empty: undefined } },
};

describe("notManifestFilter", function () {
    describe("clearActionFromRules", function () {
        const spGuestC = Object.freeze({
            [ACTION_SIGNATURES.CREATE]: ["root", "admin", "*"],
            [ACTION_SIGNATURES.READ]: ["root", "admin"],
            [ACTION_SIGNATURES.UPDATE]: ["root", "admin"],
            [ACTION_SIGNATURES.DELETE]: ["root", "admin"],
        });

        const spSystem = Object.freeze({
            [ACTION_SIGNATURES.CREATE]: ["@system"],
            [ACTION_SIGNATURES.READ]: ["@system"],
            [ACTION_SIGNATURES.UPDATE]: ["@system"],
            [ACTION_SIGNATURES.DELETE]: ["@system"],
        });

        it("with rules", function () {
            notManifestFilter.schemaLoader = (schemaName) => {
                console.log("schema getter", schemaName);
                switch (schemaName) {
                    case "Jelly":
                        return {
                            name: {
                                type: String,
                                safe: spGuestC,
                            },
                            email: {
                                type: String,
                                safe: spGuestC,
                            },
                            __version: {
                                type: String,
                                safe: spSystem,
                            },
                        };
                    case "Post":
                        return [];
                }
                return undefined;
            };
            const input = {
                modelName: "jelly",
                rules: [
                    {
                        root: true,
                    },
                    {
                        auth: true,
                    },
                ],
            };
            const result = notManifestFilter.clearActionFromRules(
                //raw actionData
                input,
                //current user statem model name, action  name and action signature - minimum if you want to filter
                {
                    root: true,
                    role: ["root"],
                    modelName: "Jelly",
                    actionSignature: ACTION_SIGNATURES.READ,
                },
                {
                    //what earlier were selected as best suited rule
                    root: true,
                }
            );
            expect(result).to.deep.equal({
                modelName: "jelly",
                fields: ["name", "email"], //if fields ommited, it replaced by ["@safe"], __version is not safe to everyone but system invoked operations
                return: ["_id", "jellyID", "name", "email"],
            });
        });

        it("without rules", function () {
            const input = {
                modelName: "jelly",
                auth: true,
                role: ["root"],
                root: true,
            };
            const result = notManifestFilter.clearActionFromRules(input);
            expect(result).to.deep.equal({
                modelName: "jelly",
                return: ["_id", "ID"],
            });
        });
    });

    describe("filterRoute", function () {
        const route = {
            actions: {
                list: {
                    postFix: ":actionName",
                    rules: [
                        {
                            root: true,
                        },
                        {
                            auth: true,
                        },
                        {
                            auth: false,
                        },
                    ],
                },
                get: {
                    formData: true,
                    rules: [
                        {
                            root: true,
                        },
                    ],
                },
                update: {
                    formData: false,
                    auth: true,
                    role: ["manager"],
                },
            },
        };
        it("route [{admin},{auth},{!auth}],  !auth, 'user', !admin", function () {
            const result = notManifestFilter.filterRoute(
                route,
                false,
                ["user"],
                false
            );
            expect(result).to.deep.equal({
                actions: {
                    list: {
                        postFix: ":actionName",
                        return: ["_id", "ID"],
                    },
                },
            });
        });

        it("route [{admin},{auth},{!auth}],  !auth, 'user', admin", function () {
            const result = notManifestFilter.filterRoute(
                route,
                false,
                ["user"],
                true
            );
            expect(result).to.deep.equal({
                actions: {
                    list: {
                        postFix: ":actionName",
                        return: ["_id", "ID"],
                    },
                    get: {
                        formData: true,
                        return: ["_id", "ID"],
                    },
                },
            });
        });

        it("route [{admin},{auth},{!auth}],  auth, 'user', !admin", function () {
            const result = notManifestFilter.filterRoute(
                route,
                true,
                ["user"],
                false
            );
            expect(result).to.deep.equal({
                actions: {
                    list: {
                        postFix: ":actionName",
                        return: ["_id", "ID"],
                    },
                },
            });
        });

        it("route [{admin},{auth},{!auth}],  auth, 'manager', !admin", function () {
            const result = notManifestFilter.filterRoute(
                route,
                true,
                ["manager"],
                false
            );
            expect(result).to.deep.equal({
                actions: {
                    list: {
                        postFix: ":actionName",
                        return: ["_id", "ID"],
                    },
                    update: {
                        formData: false,
                        return: ["_id", "ID"],
                    },
                },
            });
        });
    });

    describe("filter", function () {
        let filtered = {
            admin: {
                user: {
                    model: "user",
                    url: "/api/:modelName",
                    actions: {
                        list: {
                            method: "get",
                            return: ["_id", "userID"],
                        },
                        profile: {
                            method: "get",
                            return: ["_id", "userID"],
                        },
                    },
                },
                post: {
                    model: "post",
                    url: "/api/:modelName",
                    actions: {
                        list: {
                            method: "get",
                            return: ["_id", "postID"],
                        },
                        listAll: {
                            method: "get",
                            return: ["_id", "postID"],
                        },
                    },
                },
                admin: {
                    model: "admin",
                    url: "/api/:modelName",
                    actions: {
                        reboot: {
                            method: "post",
                            return: ["_id", "adminID"],
                        },
                    },
                },
            },
            user: {
                user: {
                    model: "user",
                    url: "/api/:modelName",
                    actions: {
                        profile: {
                            method: "get",
                            return: ["_id", "userID"],
                        },
                    },
                },
                post: {
                    model: "post",
                    url: "/api/:modelName",
                    actions: {
                        list: {
                            method: "get",
                            return: ["_id", "postID"],
                        },
                    },
                },
            },
            guest: {
                post: {
                    model: "post",
                    url: "/api/:modelName",
                    actions: {
                        list: {
                            method: "get",
                            return: ["_id", "postID"],
                        },
                    },
                },
            },
            notActivated: {
                user: {
                    model: "user",
                    url: "/api/:modelName",
                    actions: {
                        activate: {
                            method: "get",
                            return: ["_id", "userID"],
                        },
                    },
                },
                post: {
                    model: "post",
                    url: "/api/:modelName",
                    actions: {
                        list: {
                            method: "get",
                            return: ["_id", "postID"],
                        },
                    },
                },
            },
            manager: {
                user: {
                    model: "user",
                    url: "/api/:modelName",
                    actions: {
                        profile: {
                            method: "get",
                            return: ["_id", "userID"],
                        },
                    },
                },
                post: {
                    model: "post",
                    url: "/api/:modelName",
                    actions: {
                        list: {
                            method: "get",
                            return: ["_id", "postID"],
                        },
                        listAll: {
                            method: "get",
                            return: ["_id", "postID"],
                        },
                    },
                },
            },
        };
        it("Guest manifest", function () {
            let man = rawRoutesManifest,
                manAfterFilter = notManifestFilter.filter(
                    man,
                    false,
                    [],
                    false,
                    ""
                );
            expect(manAfterFilter).to.deep.equal(filtered.guest);
        });

        it("Auth manifest", function () {
            let man = rawRoutesManifest,
                manAfterFilter = notManifestFilter.filter(man, true, [], false);
            expect(manAfterFilter).to.deep.equal(filtered.user);
        });

        it("Auth with manager role manifest", function () {
            let man = rawRoutesManifest,
                manAfterFilter = notManifestFilter.filter(
                    man,
                    true,
                    ["manager"],
                    false
                );
            expect(manAfterFilter).to.deep.equal(filtered.manager);
        });

        it("Guest with notActivated role manifest", function () {
            let man = rawRoutesManifest,
                manAfterFilter = notManifestFilter.filter(
                    man,
                    false,
                    ["notActivated"],
                    false
                );
            expect(manAfterFilter).to.deep.equal(filtered.notActivated);
        });

        it("Admin manifest", function () {
            let man = rawRoutesManifest,
                manAfterFilter = notManifestFilter.filter(man, false, [], true);
            expect(manAfterFilter).to.deep.equal(filtered.admin);
        });
    });

    describe("Filter fields with schema and actionSignature", () => {
        const SCHEMA = () => {
            return {
                role: {
                    type: [String],
                    required: true,
                    searchable: true,
                    default: ["user"],
                    validate: [],
                    safe: {
                        create: ["@system"],
                        update: ["root", "admin"],
                        read: ["@owner", "root", "admin"],
                    },
                },
                name: {
                    type: String,
                    safe: {
                        create: ["@system"],
                        update: ["@system", "@owner", "root", "admin"],
                        read: ["*"],
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
                        create: ["@system"],
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
                        create: ["@system"],
                        read: ["*"],
                    },
                },
                confirm: {
                    type: Schema.Types.Mixed,
                    required: false,
                    searchable: true,
                    safe: {
                        create: ["@system"],
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
                    safe: {
                        create: ["@system"],
                        update: ["@system", "@owner", "root", "admin"],
                        read: ["*"],
                    },
                },
                email: {
                    type: String,
                    unique: true,
                    searchable: true,
                    required: true,
                    safe: {
                        create: ["@system"],
                        update: ["@owner", "root", "admin"],
                        read: ["@owner", "root", "admin"],
                    },
                },
            };
        };

        const modelName = "User";
        const moduleName = "User";

        before(() => {
            notManifestFilter.schemaLoader = SCHEMA;
        });

        it("filterRouteAction @safe for READ", () => {
            const actionData = {
                actionSignature: ACTION_SIGNATURES.READ,
                method: "get",
                rules: [
                    {
                        auth: false,
                        fields: ["@safe"],
                    },
                ],
            };
            const auth = false;
            const root = false;
            const roles = [DEFAULT_USER_ROLE_FOR_GUEST];

            const targetResult = {
                method: "get",
                fields: ["name", "username", "country"],
                return: ["_id", "userID", "name", "username", "country"],
            };
            const result = notManifestFilter.filterRouteAction(
                actionData,
                auth,
                roles,
                root,
                modelName,
                moduleName
            );
            expect(result).to.be.deep.equal(targetResult);
        });

        it("filterRouteAction @* for READ", () => {
            const actionData = {
                actionSignature: ACTION_SIGNATURES.READ,
                method: "get",
                rules: [
                    {
                        auth: false,
                        fields: ["@*"],
                    },
                ],
            };
            const auth = false;
            const root = false;
            const roles = [DEFAULT_USER_ROLE_FOR_GUEST];
            const targetResult = {
                method: "get",
                fields: [
                    "_id",
                    "userID",
                    "role",
                    "name",
                    "salt",
                    "telephone",
                    "username",
                    "confirm",
                    "code",
                    "country",
                    "email",
                ],
                return: ["_id", "userID", "name", "username", "country"],
            };
            const result = notManifestFilter.filterRouteAction(
                actionData,
                auth,
                roles,
                root,
                modelName,
                moduleName
            );
            expect(result).to.be.deep.equal(targetResult);
        });

        it("filterRouteAction @*,-@safe for READ", () => {
            const actionData = {
                actionSignature: ACTION_SIGNATURES.READ,
                method: "get",
                rules: [
                    {
                        auth: false,
                        fields: ["@*", "-@safe"],
                    },
                ],
            };
            const auth = false;
            const root = false;
            const roles = [DEFAULT_USER_ROLE_FOR_GUEST];

            const targetResult = {
                method: "get",
                fields: [
                    "_id",
                    "userID",
                    "role",
                    "salt",
                    "telephone",
                    "confirm",
                    "code",
                    "email",
                ],
                return: ["_id", "userID", "name", "username", "country"],
            };
            const result = notManifestFilter.filterRouteAction(
                actionData,
                auth,
                roles,
                root,
                modelName,
                moduleName
            );
            expect(result).to.be.deep.equal(targetResult);
        });

        it("filterRouteAction @* for UPDATE as guest", () => {
            const actionData = {
                actionSignature: ACTION_SIGNATURES.UPDATE,
                method: "post",
                rules: [
                    {
                        role: ["user"],
                        fields: ["@*"],
                    },
                ],
            };
            const auth = false;
            const root = false;
            const roles = [DEFAULT_USER_ROLE_FOR_GUEST];
            const result = notManifestFilter.filterRouteAction(
                actionData,
                auth,
                roles,
                root,
                modelName,
                moduleName
            );
            expect(result).to.be.undefined;
        });

        it("filterRouteAction @safe for CREATE as guest", () => {
            const actionData = {
                actionSignature: ACTION_SIGNATURES.CREATE,
                method: "put",
                rules: [
                    {
                        role: ["user"],
                        fields: ["@safe"],
                    },
                ],
            };
            const auth = false;
            const root = false;
            const roles = [DEFAULT_USER_ROLE_FOR_GUEST];
            const result = notManifestFilter.filterRouteAction(
                actionData,
                auth,
                roles,
                root,
                modelName,
                moduleName
            );
            expect(result).to.be.undefined;
        });

        it("filterRouteAction @listFields for READ", () => {
            notFieldsFilter.addSet("listFields", ["@ID", "@safe"]);
            const actionData = {
                actionSignature: ACTION_SIGNATURES.READ,
                method: "get",
                rules: [
                    {
                        auth: false,
                        fields: ["@listFields"],
                    },
                ],
            };
            const auth = false;
            const root = false;
            const roles = [DEFAULT_USER_ROLE_FOR_GUEST];
            const targetResult = {
                method: "get",
                fields: ["userID", "name", "username", "country"],
                return: ["_id", "userID", "name", "username", "country"],
            };
            const result = notManifestFilter.filterRouteAction(
                actionData,
                auth,
                roles,
                root,
                modelName,
                moduleName
            );
            expect(result).to.be.deep.equal(targetResult);
        });
    });
});
