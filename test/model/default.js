module.exports = ({
    expect,
    defaultModel,
    moduleProto,
    remember,
    mongoose,
}) => {
    describe("Default Model Statics", () => {
        beforeEach(async () => {
            let d = new Date().getTime();
            const item1 = await moduleProto.User.add({
                username: "tester " + Math.random() + d,
                default: false,
            });

            const item2 = await moduleProto.User.add({
                username: "tester " + Math.random() + d,
                default: true,
            });

            expect(item1).to.exist;
            remember.save("item1", item1);
            remember.save("item2", item2);
        });

        describe("extractVariants", () => {
            it("items not empty", () => {
                let items = [
                        {
                            getVariant: () => {
                                return "variant";
                            },
                        },
                        {
                            getVariant: () => {
                                return "variant 2";
                            },
                        },
                    ],
                    result = defaultModel.extractVariants(items);
                expect(result).to.have.lengthOf(2);
                expect(result[0]).to.be.equal("variant");
                expect(result[1]).to.be.equal("variant 2");
            });

            it("items == null", () => {
                let items = null,
                    result = defaultModel.extractVariants(items);
                expect(result).to.have.lengthOf(0);
                expect(result).to.be.deep.equal([]);
                expect(result).to.be.instanceof(Array);
            });
        });

        describe("makeQuery", () => {
            it("versioning, filter - null", async () => {
                const ctx = {
                    schema: {
                        statics: {
                            __versioning: true,
                        },
                    },
                    goSearch(filter) {
                        expect(filter).to.be.deep.equal({
                            __latest: true,
                            __closed: false,
                        });
                        return "result";
                    },
                };
                const item = await defaultModel.thisStatics.makeQuery.call(
                    ctx,
                    "goSearch",
                    null
                );
                expect(item).to.be.deep.equal("result");
            });

            it("!versioning, filter - null", async () => {
                const ctx = {
                    schema: {
                        statics: {
                            __versioning: false,
                        },
                    },
                    goSearch(filter) {
                        expect(filter).to.be.deep.equal({});
                        return "result";
                    },
                };
                const item = await defaultModel.thisStatics.makeQuery.call(
                    ctx,
                    "goSearch",
                    null
                );
                expect(item).to.be.deep.equal("result");
            });

            it("!versioning, filter - OPT_OR", async () => {
                const filter = [
                    {
                        name: 1,
                    },
                    {
                        job: "sync",
                    },
                ];
                const ctx = {
                    schema: {
                        statics: {
                            __versioning: false,
                        },
                    },
                    goSearch(filt) {
                        expect(filt).to.be.deep.equal({
                            $or: filter,
                        });
                        return "result";
                    },
                };
                const item = await defaultModel.thisStatics.makeQuery.call(
                    ctx,
                    "goSearch",
                    filter
                );
                expect(item).to.be.deep.equal("result");
            });

            it("versioning, filter - OPT_OR", async () => {
                const filter = [
                    {
                        name: 1,
                    },
                    {
                        job: "sync",
                    },
                ];
                const ctx = {
                    schema: {
                        statics: {
                            __versioning: true,
                        },
                    },
                    goSearch(filt) {
                        expect(filt).to.be.deep.equal({
                            $and: [
                                {
                                    __latest: true,
                                    __closed: false,
                                },
                                {
                                    $or: filter,
                                },
                            ],
                        });
                        return "result";
                    },
                };
                const item = await defaultModel.thisStatics.makeQuery.call(
                    ctx,
                    "goSearch",
                    filter
                );
                expect(item).to.be.deep.equal("result");
            });

            it("!versioning, filter - OPT_AND", async () => {
                const filter = {
                    name: 1,
                    job: "sync",
                };
                const ctx = {
                    schema: {
                        statics: {
                            __versioning: false,
                        },
                    },
                    goSearch(filt) {
                        expect(filt).to.be.deep.equal({
                            $and: [filter],
                        });
                        return "result";
                    },
                };
                const item = await defaultModel.thisStatics.makeQuery.call(
                    ctx,
                    "goSearch",
                    filter
                );
                expect(item).to.be.deep.equal("result");
            });

            it("versioning, filter - OPT_AND", async () => {
                const filter = {
                    name: 1,
                    job: "sync",
                };
                const ctx = {
                    schema: {
                        statics: {
                            __versioning: true,
                        },
                    },
                    goSearch(filt) {
                        expect(filt).to.be.deep.equal({
                            $and: [
                                {
                                    __latest: true,
                                    __closed: false,
                                },
                                filter,
                            ],
                        });
                        return "result";
                    },
                };
                const item = await defaultModel.thisStatics.makeQuery.call(
                    ctx,
                    "goSearch",
                    filter
                );
                expect(item).to.be.deep.equal("result");
            });
        });

        describe("populateQuery_markVersioning", () => {
            it("match", () => {
                const inst = {
                    match: {},
                };
                defaultModel.populateQuery_markVersioning(inst);
                expect(inst).to.be.deep.equal({
                    match: {
                        __latest: true,
                    },
                });
            });
        });

        describe("populateQuery", () => {
            it("query - empty, populate - empty, versioning - omitted", () => {
                const query = null,
                    populate = null;
                defaultModel.populateQuery(query, populate);
                expect(query).to.be.null;
            });

            it("query, populate - has object items, versioning - true", () => {
                let result = [];
                const query = {
                        populate(inst) {
                            expect(inst.match.__latest).to.be.true;
                            result.push(inst.path);
                        },
                    },
                    populate = [
                        {
                            path: "keyName",
                        },
                        "jungle",
                    ];
                defaultModel.populateQuery(query, populate, true);
                expect(result).to.be.deep.equal(["keyName", "jungle"]);
            });

            it("query, populate - has misformed items, versioning - false", () => {
                try {
                    let result = [];
                    const query = {
                            populate(inst) {
                                result.push(inst.path);
                            },
                        },
                        populate = [
                            {
                                path: "keyName",
                            },
                            "jungle",
                            123142,
                        ];
                    defaultModel.populateQuery(query, populate, false);
                    expect(false).to.be.true;
                } catch (e) {
                    expect(e).to.be.instanceof(Error);
                }
            });
        });

        describe("sanitizeInput", () => {
            it("sanitizeInput, default - not defined", function () {
                let sanitized = moduleProto.User.sanitizeInput({});
                expect(sanitized).to.deep.equal({
                    default: false,
                });
            });

            it("sanitizeInput, default - defined", function () {
                let sanitized = moduleProto.User.sanitizeInput({
                    default: true,
                });
                expect(sanitized).to.deep.equal({
                    default: true,
                });
            });
        });

        describe("add", () => {
            it("add", async () => {
                const item = await moduleProto.User.add({
                    username: "notTester",
                    default: false,
                });
                expect(item).to.exist;
                expect(item.username).to.be.equal("notTester");
            });
        });

        describe("getOne", () => {
            it("versioning, populate not specified", async () => {
                const id = new mongoose.Types.ObjectId();
                const ctx = {
                    schema: {
                        statics: {
                            __versioning: true,
                        },
                    },
                    findOne(input) {
                        expect(input).to.be.deep.equal({
                            _id: id,
                            __latest: true,
                            __closed: false,
                        });
                        return {
                            populate() {},
                            async exec() {
                                return {
                                    _id: id,
                                    loaded: true,
                                };
                            },
                        };
                    },
                };
                const item = await defaultModel.thisStatics.getOne.call(
                    ctx,
                    id
                );
                expect(item._id).to.be.deep.equal(id);
                expect(item.loaded).to.be.true;
            });

            it("!versioning, populate not specified", async () => {
                const id = new mongoose.Types.ObjectId();
                const ctx = {
                    schema: {
                        statics: {},
                    },
                    findOne(input) {
                        expect(input).to.be.deep.equal({
                            _id: id,
                        });
                        return {
                            populate() {},
                            async exec() {
                                return {
                                    _id: id,
                                    loaded: true,
                                };
                            },
                        };
                    },
                };
                const item = await defaultModel.thisStatics.getOne.call(
                    ctx,
                    id
                );
                expect(item._id).to.be.deep.equal(id);
                expect(item.loaded).to.be.true;
            });

            it("versioning, populate === null", async () => {
                const id = new mongoose.Types.ObjectId();
                const ctx = {
                    schema: {
                        statics: {
                            __versioning: true,
                        },
                    },
                    findOne(input) {
                        expect(input).to.be.deep.equal({
                            _id: id,
                            __latest: true,
                            __closed: false,
                        });
                        return {
                            populate() {},
                            async exec() {
                                return {
                                    _id: id,
                                    loaded: true,
                                };
                            },
                        };
                    },
                };
                const item = await defaultModel.thisStatics.getOne.call(
                    ctx,
                    id,
                    null
                );
                expect(item._id).to.be.deep.equal(id);
                expect(item.loaded).to.be.true;
            });
        });

        describe("getOneByID", () => {
            it("!increment", async () => {
                const ID = Math.round(Math.random() * 1000);
                const ctx = {
                    schema: {
                        statics: {
                            __incField: false,
                            __versioning: true,
                        },
                    },
                    findOne(input) {
                        expect(input).to.be.deep.equal({
                            _id: id,
                            __latest: true,
                            __closed: false,
                        });
                        return {
                            async exec() {
                                return {
                                    _id: id,
                                    loaded: true,
                                };
                            },
                        };
                    },
                };
                const item = await defaultModel.thisStatics.getOneByID.call(
                    ctx,
                    ID
                );
                expect(item).to.be.null;
            });

            it("increment, !versioning", async () => {
                const ID = Math.round(Math.random() * 1000);
                const ctx = {
                    schema: {
                        statics: {
                            __incField: "modelID",
                            __versioning: false,
                        },
                    },
                    findOne(input) {
                        expect(input).to.be.deep.equal({
                            modelID: ID,
                        });
                        return {
                            async exec() {
                                return {
                                    modelID: ID,
                                    loaded: true,
                                };
                            },
                        };
                    },
                };
                const item = await defaultModel.thisStatics.getOneByID.call(
                    ctx,
                    ID
                );
                expect(item).to.be.deep.equal({
                    modelID: ID,
                    loaded: true,
                });
            });

            it("increment, versioning", async () => {
                const ID = Math.round(Math.random() * 1000);
                const ctx = {
                    schema: {
                        statics: {
                            __incField: "modelID",
                            __versioning: true,
                        },
                    },
                    findOne(input) {
                        expect(input).to.be.deep.equal({
                            modelID: ID,
                            __latest: true,
                            __closed: false,
                        });
                        return {
                            async exec() {
                                return {
                                    modelID: ID,
                                    loaded: true,
                                };
                            },
                        };
                    },
                };
                const item = await defaultModel.thisStatics.getOneByID.call(
                    ctx,
                    ID
                );
                expect(item).to.be.deep.equal({
                    modelID: ID,
                    loaded: true,
                });
            });
        });

        describe("getOneRaw", () => {
            it("simple run", async () => {
                const id = new mongoose.Types.ObjectId();
                const ctx = {
                    schema: {
                        statics: {
                            __incField: "modelID",
                            __versioning: true,
                        },
                    },
                    findOne(input) {
                        expect(input).to.be.deep.equal({
                            _id: id,
                        });
                        return {
                            async exec() {
                                return {
                                    _id: id,
                                    loaded: true,
                                };
                            },
                        };
                    },
                };
                const item = await defaultModel.thisStatics.getOneRaw.call(
                    ctx,
                    id
                );
                expect(item).to.be.deep.equal({
                    _id: id,
                    loaded: true,
                });
            });
        });

        function newQuery(ret, beforeReturn) {
            return {
                data: {},
                sort(v) {
                    this.data.sort = v;
                    return this;
                },
                size(v) {
                    this.data.size = v;
                    return this;
                },
                populate(v) {
                    if (!this.data.populate) {
                        this.data.populate = [];
                    }
                    this.data.populate.push(v);
                    return this;
                },
                filter(v) {
                    this.data.filter = v;
                    return this;
                },
                limit(v) {
                    this.data.limit = v;
                    return this;
                },
                skip(v) {
                    this.data.skip = v;
                    return this;
                },
                async exec() {
                    beforeReturn(this.data);
                    return ret;
                },
            };
        }

        describe("list", () => {
            it("list", async () => {
                const skip = 10,
                    size = 20,
                    sorter = {},
                    filter = [];

                const ctx = {
                    schema: {
                        statics: {},
                    },
                    makeQuery(action, f) {
                        expect(action).to.be.equal("find");
                        expect(f).to.be.deep.equal(filter);
                        return newQuery([], (data) => {
                            expect(data).to.be.deep.equal({
                                skip: 10,
                                limit: 20,
                                sort: {},
                            });
                        });
                    },
                };
                const items = await defaultModel.thisStatics.list.call(
                    ctx,
                    skip,
                    size,
                    sorter,
                    filter
                );
                expect(items).to.be.instanceof(Array);
            });
        });

        describe("listByField", () => {
            it("!list, !filter, !populate", async () => {
                const fieldName = "hope";
                const ctx = {
                    schema: {
                        statics: {
                            __versioning: true,
                        },
                    },
                    makeQuery(action, by) {
                        expect(action).to.be.equal("find");
                        expect(by).to.be.deep.equal({
                            hope: {
                                $in: [],
                            },
                        });
                        return newQuery(
                            [
                                {
                                    item: 1,
                                },
                                {
                                    item: 2,
                                },
                            ],
                            () => {}
                        );
                    },
                };
                const items = await defaultModel.thisStatics.listByField.call(
                    ctx,
                    fieldName
                );
                expect(items).to.be.instanceof(Array);
            });
        });

        describe("listAndPopulate", () => {
            it("skip, size, sorter, filter, populate", async () => {
                const skip = 10,
                    size = 20,
                    sorter = [["id", "ascending"]],
                    filter = [{ glowing: true }],
                    populate = ["fieldName"];
                const ctx = {
                    schema: {
                        statics: {
                            __versioning: true,
                        },
                    },
                    makeQuery(action, by) {
                        expect(action).to.be.equal("find");
                        expect(by).to.be.deep.equal(filter);
                        return newQuery(
                            [
                                {
                                    item: 1,
                                },
                                {
                                    item: 2,
                                },
                            ],
                            (acc) => {
                                expect(acc.limit).to.be.equal(size);
                                expect(acc.skip).to.be.equal(skip);
                                expect(acc.sort).to.be.equal(sorter);
                            }
                        );
                    },
                };
                const items =
                    await defaultModel.thisStatics.listAndPopulate.call(
                        ctx,
                        skip,
                        size,
                        sorter,
                        filter,
                        populate
                    );
                expect(items).to.be.instanceof(Array);
            });
        });

        describe("listAll", () => {
            it("versioning", async () => {
                const skip = 10,
                    size = 20,
                    sorter = {},
                    filter = [];
                const ctx = {
                    schema: {
                        statics: {
                            __versioning: true,
                        },
                    },
                    find(by) {
                        expect(by).to.be.deep.equal({
                            __latest: true,
                            __closed: false,
                        });
                        return newQuery(
                            [
                                {
                                    item: 1,
                                },
                                {
                                    item: 2,
                                },
                            ],
                            (acc) => {
                                expect(acc.sort).to.be.deep.equal([
                                    ["_id", "descending"],
                                ]);
                            }
                        );
                    },
                };
                const items = await defaultModel.thisStatics.listAll.call(
                    ctx,
                    skip,
                    size,
                    sorter,
                    filter
                );
                expect(items).to.be.instanceof(Array);
            });

            it("!versioning", async () => {
                const skip = 10,
                    size = 20,
                    sorter = {},
                    filter = [];
                const ctx = {
                    schema: {
                        statics: {
                            __versioning: false,
                        },
                    },
                    find(by) {
                        expect(by).to.be.deep.equal({});
                        return newQuery(
                            [
                                {
                                    item: 1,
                                },
                                {
                                    item: 2,
                                },
                            ],
                            (acc) => {
                                expect(acc.sort).to.be.deep.equal([
                                    ["_id", "descending"],
                                ]);
                            }
                        );
                    },
                };
                const items = await defaultModel.thisStatics.listAll.call(
                    ctx,
                    skip,
                    size,
                    sorter,
                    filter
                );
                expect(items).to.be.instanceof(Array);
            });
        });

        describe("listAllAndPopulate", () => {
            it("versioning", async () => {
                const ctx = {
                    schema: {
                        statics: {
                            __versioning: true,
                        },
                    },
                    find(by) {
                        expect(by).to.be.deep.equal({
                            __latest: true,
                            __closed: false,
                        });
                        return newQuery(
                            [
                                {
                                    item: 1,
                                },
                                {
                                    item: 2,
                                },
                            ],
                            (acc) => {
                                expect(acc.sort).to.be.deep.equal([
                                    ["_id", "descending"],
                                ]);
                                expect(acc.populate).to.be.deep.equal([
                                    {
                                        match: {
                                            __latest: true,
                                        },
                                        path: "fieldName",
                                    },
                                ]);
                            }
                        );
                    },
                };
                const items =
                    await defaultModel.thisStatics.listAllAndPopulate.call(
                        ctx,
                        ["fieldName"]
                    );
                expect(items).to.be.instanceof(Array);
            });
        });

        describe("listAndCount", () => {
            it("filter, !search, populate", async () => {
                const skip = 10,
                    size = 20,
                    sorter = [["id", "ascending"]],
                    search = "",
                    filter = [],
                    populate = ["fieldName"];

                const ctx = {
                    schema: { statics: {} },
                    async listAndPopulate(sk, si, sor, fil, pop) {
                        expect(sk).to.be.equal(skip);
                        expect(si).to.be.equal(size);
                        expect(sor).to.be.deep.equal(sorter);
                        expect(fil).to.be.deep.equal(filter);
                        expect(pop).to.be.deep.equal(populate);
                        return [1, 2, 3, 4];
                    },
                    async countWithFilter() {
                        return 4;
                    },
                };
                const res = await defaultModel.thisStatics.listAndCount.call(
                    ctx,
                    skip,
                    size,
                    sorter,
                    filter,
                    search,
                    populate
                );
                expect(res.list).to.be.deep.equal([1, 2, 3, 4]);
                expect(res.count).to.be.equal(4);
                expect(res.skip).to.be.equal(skip);
                expect(res.page).to.be.equal(0);
                expect(res.pages).to.be.equal(1);
            });

            it("!filter, search, !populate", async () => {
                const skip = 20,
                    size = 20,
                    sorter = [["id", "ascending"]],
                    search = "my baby",
                    filter = null;

                const ctx = {
                    schema: { statics: {} },
                    async listAndPopulate(sk, si, sor, fil, pop) {
                        expect(sk).to.be.equal(skip);
                        expect(si).to.be.equal(size);
                        expect(sor).to.be.deep.equal(sorter);
                        expect(fil).to.be.deep.equal("my baby");
                        expect(pop).to.be.deep.equal([]);
                        return [1, 2, 3, 4];
                    },
                    async countWithFilter() {
                        return 24;
                    },
                };
                const res = await defaultModel.thisStatics.listAndCount.call(
                    ctx,
                    skip,
                    size,
                    sorter,
                    filter,
                    search
                );
                expect(res.list).to.be.deep.equal([1, 2, 3, 4]);
                expect(res.count).to.be.equal(24);
                expect(res.skip).to.be.equal(skip);
                expect(res.page).to.be.equal(2);
                expect(res.pages).to.be.equal(2);
            });
        });

        describe("countWithFilter", () => {
            it("countWithFilter", async () => {
                const filter = [{ mage: true }, { necromant: false }];
                const ctx = {
                    makeQuery(action, f) {
                        expect(action).to.be.equal("countDocuments");
                        expect(f).to.be.deep.equal(filter);
                        return newQuery(3, () => {});
                    },
                };
                const itemsCount =
                    await defaultModel.thisStatics.countWithFilter.call(
                        ctx,
                        filter
                    );
                expect(itemsCount).to.be.equal(3);
            });
        });

        describe("update", () => {
            it("many", async () => {
                const items = await moduleProto.User.update(
                    {},
                    { default: true },
                    true
                );
                expect(items).to.exist;
                expect(items.length).to.be.equal(2);
                const statuses = items.map((item) => item.status);
                expect(statuses.sort()).to.be.deep.equal([
                    "fulfilled",
                    "rejected",
                ]);
            });
            //--require mocha-suppress-logs
            it("one", async () => {
                const item2 = remember.load("item2");
                const item = await moduleProto.User.update(
                    { default: true },
                    { default: false }
                );
                expect(item).to.exist;
                expect(item.username).to.be.equal(item2.username);
            });
        });

        describe("thisMethods", () => {
            describe("getID", () => {
                it("!increment", () => {
                    const ctx = {
                        schema: {
                            statics: {},
                        },
                    };
                    const ID = defaultModel.thisMethods.getID.call(ctx);
                    expect(ID).to.be.equal(0);
                });
            });

            describe("close", () => {
                it("simple run", async () => {
                    const ctx = {
                        schema: {
                            statics: {
                                __versioning: true,
                            },
                        },
                        __closed: false,
                        async save() {
                            return this;
                        },
                    };
                    const item = await defaultModel.thisMethods.close.call(ctx);
                    expect(item.__closed).to.be.true;
                });
            });
        });

        afterEach(function (done) {
            moduleProto.User.deleteMany({})
                .then(() => {
                    done();
                })
                .catch(done);
        });
    });
};
