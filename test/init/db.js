const path = require("path");
const mock = require("mock-require");
const InitDB = require("../../src/init/lib/db");
const pathToIncrement = path.resolve(__dirname, "../../src/model/increment");

class Schema {
    constructor() {
        this.statics = {};
    }
}

module.exports = ({ expect }) => {
    describe("DB", () => {
        describe("run", () => {
            it("simple", async () => {
                console.log(pathToIncrement);
                const config = {
                    get(str) {
                        return {
                            mongoose: {
                                uri: "mongodb://localhost/base?authSource=base",
                                options: {
                                    host: "localhost",
                                    autoIndex: false,
                                    poolSize: 10,
                                    bufferMaxEntries: 0,
                                },
                            },
                        }[str];
                    },
                };
                mock("mongoose", {
                    async connect(uri, opts) {
                        expect(typeof uri).to.be.equal("string");
                        expect(typeof opts).to.be.equal("object");
                    },
                    model() {
                        return {
                            getNext() {},
                            rebase() {},
                        };
                    },
                    Schema,
                    fakeMongoose: true,
                });
                mock(pathToIncrement, {
                    init() {},
                });
                const master = {
                    setMongoose(itm) {
                        expect(itm.fakeMongoose).to.be.true;
                    },
                };
                await new InitDB().run({ config, master });
            });
        });
        after(() => {
            mock.stop("mongoose");
            mock.stop(pathToIncrement);
            const mod = require(pathToIncrement);
            delete mod.model;
            delete mod.next;
            delete mod.rebase;
        });
    });
};
