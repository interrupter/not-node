const expect = require("chai").expect;
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

let mongod;

describe("notModel", function () {
    before(async () => {
        mongod = await MongoMemoryServer.create();
        let uri = mongod.getUri();
        await mongoose.connect(uri);
    });

    require("./model/increment")({
        expect,
        mongod,
        mongoose,
    });

    require("./model/enrich")({
        expect,
        mongod,
        mongoose,
    });

    require("./model/proto")({
        expect,
        mongod,
        mongoose,
    });

    require("./model/routine")({
        expect,
        mongod,
        mongoose,
    });

    require("./model/versioning")({
        expect,
        mongod,
        mongoose,
    });

    require("./model/utils")({
        expect,
        mongod,
        mongoose,
    });

    after(async () => {
        await mongoose.disconnect();
        await mongod.stop();
    });
});
