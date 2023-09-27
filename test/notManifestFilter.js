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
                        auth: false,
                    },
                    {
                        auth: true,
                        actionPrefix: "user",
                    },
                    {
                        root: true,
                        actionName: "listForAdmin",
                    },
                ],
            },
            listAll: {
                method: "get",
                rules: [
                    {
                        auth: true,
                        role: ["manager"],
                        actionName: "managerListAll",
                    },
                    {
                        root: true,
                        actionPrefix: "__",
                        actionName: "listForAdmin",
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
                        auth: true,
                    },
                    {
                        root: true,
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
        it("with rules", function () {
            const input = {
                modelName: "jelly",
                rules: [
                    {
                        auth: true,
                        fields: ["name"],
                    },
                    {
                        root: true,
                        fields: ["name", "email"],
                    },
                ],
            };
            const result = notManifestFilter.clearActionFromRules(input, {
                root: true,
                fields: ["name", "email"],
            });
            expect(result).to.deep.equal({
                modelName: "jelly",
                fields: ["name", "email"],
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
                    },
                    get: {
                        formData: true,
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
                    },
                    update: {
                        formData: false,
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
                        },
                        profile: {
                            method: "get",
                        },
                    },
                },
                post: {
                    model: "post",
                    url: "/api/:modelName",
                    actions: {
                        list: {
                            method: "get",
                        },
                        listAll: {
                            method: "get",
                        },
                    },
                },
                admin: {
                    model: "admin",
                    url: "/api/:modelName",
                    actions: {
                        reboot: {
                            method: "post",
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
                        },
                    },
                },
                post: {
                    model: "post",
                    url: "/api/:modelName",
                    actions: {
                        list: {
                            method: "get",
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
                        },
                    },
                },
                post: {
                    model: "post",
                    url: "/api/:modelName",
                    actions: {
                        list: {
                            method: "get",
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
                        },
                    },
                },
                post: {
                    model: "post",
                    url: "/api/:modelName",
                    actions: {
                        list: {
                            method: "get",
                        },
                        listAll: {
                            method: "get",
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
            const actionName = "get";
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
            const routeMan = {
                actions: {},
            };
            const targetResult = {
                actions: {
                    get: {
                        method: "get",
                        fields: ["name", "username", "country"],
                    },
                },
            };
            notManifestFilter.filterRouteAction(
                actionName,
                actionData,
                auth,
                roles,
                root,
                routeMan,
                modelName,
                moduleName
            );
            expect(routeMan).to.be.deep.equal(targetResult);
        });

        it("filterRouteAction @* for READ", () => {
            const actionName = "get";
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
            const routeMan = {
                actions: {},
            };
            const targetResult = {
                actions: {
                    get: {
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
                    },
                },
            };
            notManifestFilter.filterRouteAction(
                actionName,
                actionData,
                auth,
                roles,
                root,
                routeMan,
                modelName,
                moduleName
            );
            expect(routeMan).to.be.deep.equal(targetResult);
        });

        it("filterRouteAction @*,-@safe for READ", () => {
            const actionName = "get";
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
            const routeMan = {
                actions: {},
            };
            const targetResult = {
                actions: {
                    get: {
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
                    },
                },
            };
            notManifestFilter.filterRouteAction(
                actionName,
                actionData,
                auth,
                roles,
                root,
                routeMan,
                modelName,
                moduleName
            );
            expect(routeMan).to.be.deep.equal(targetResult);
        });

        it("filterRouteAction @* for UPDATE as guest", () => {
            const actionName = "update";
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
            const routeMan = {
                actions: {},
            };
            const targetResult = {
                actions: {},
            };
            notManifestFilter.filterRouteAction(
                actionName,
                actionData,
                auth,
                roles,
                root,
                routeMan,
                modelName,
                moduleName
            );
            expect(routeMan).to.be.deep.equal(targetResult);
        });

        it("filterRouteAction @safe for CREATE as guest", () => {
            const actionName = "create";
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
            const routeMan = {
                actions: {},
            };
            const targetResult = {
                actions: {},
            };
            notManifestFilter.filterRouteAction(
                actionName,
                actionData,
                auth,
                roles,
                root,
                routeMan,
                modelName,
                moduleName
            );
            expect(routeMan).to.be.deep.equal(targetResult);
        });

        it("filterRouteAction @listFields for READ", () => {
            const actionName = "list";
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
            const routeMan = {
                actions: {},
            };
            const targetResult = {
                actions: {
                    list: {
                        method: "get",
                        fields: ["userID", "name", "username", "country"],
                    },
                },
            };
            notManifestFilter.filterRouteAction(
                actionName,
                actionData,
                auth,
                roles,
                root,
                routeMan,
                modelName,
                moduleName
            );
            expect(routeMan).to.be.deep.equal(targetResult);
        });
    });
});
