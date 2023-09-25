const obsolete = require("../../src/obsolete");
module.exports = () => {
    describe("Obsolete rules params warnings", () => {
        it("'user' field presented", () => {
            const obj = {
                user: false,
            };
            obsolete.obsoleteRuleFields(obj);
        });
    });

    describe("Obsolete action params warnings", () => {
        it("'rules' field not presented", () => {
            const obj = {
                user: false,
            };
            obsolete.obsoleteActionFields(obj);
        });
    });
};
