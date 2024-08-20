const expect = require("chai").expect,
    transformers = require("../src/form/transformers");

describe("Form//Transformers", () => {
    it("xss", () => {
        const stringWithAttack = "<IMG SRC=j&#X41vascript:alert('test2')>";
        const cleanString = transformers.xss(stringWithAttack);
        expect(stringWithAttack).to.be.not.equal(cleanString);
    });

    it("stringToJSON", () => {
        const stringifiedJSON =
            '{"field1": 1, "field2":true, "field3": [1,"string", false]}';
        const json = transformers.stringToJSON(stringifiedJSON);
        expect(json).to.be.deep.equal({
            field1: 1,
            field2: true,
            field3: [1, "string", false],
        });
    });

    it("__CLEAR__ presented in input", () => {
        const input = "__CLEAR__";
        const result = transformers.__CLEAR__(input);
        expect(result).to.be.null;
    });

    it("__CLEAR__ not presented in input", () => {
        const input = "";
        const result = transformers.__CLEAR__(input);
        expect(result).to.be.not.null;
    });
});
