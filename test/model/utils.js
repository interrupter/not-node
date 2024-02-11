const expect = require("chai").expect,
    utils = require("../../src/model/utils");

module.exports = ({ mongod, mongoose }) => {
    let TestModel;
    before(() => {
        TestModel = mongoose.model(
            "TestModel",
            new mongoose.Schema({ name: { type: String, required: true } })
        );
    });

    describe("Utils", function () {
        describe("insertManyResponseSuccess", () => {
            it("ok", async () => {
                const res = await TestModel.insertMany(
                    [
                        {
                            name: "FirstInsertOne",
                        },
                        {
                            name: "FirstInsertTwo",
                        },
                    ],
                    { rawResult: true }
                );

                expect(utils.insertResponseSuccess(res, 2)).to.be.true;
            });

            it("errors", async () => {
                try {
                    const res = await TestModel.insertMany(
                        [
                            {
                                name: Date.now(),
                            },
                            { name: "SecondInsertTwo" },
                        ],
                        { rawResult: true }
                    );

                    expect(utils.insertResponseSuccess(res, 1)).to.be.false;
                } catch (e) {
                    console.error(e);
                }
            });
        });
    });
};
