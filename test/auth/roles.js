module.exports = ({ Auth, expect }) => {
    describe("Roles", () => {
        describe("compareRolesArrayAgainstArray", () => {
            it("userRoles: Array, actionRoles: Array, strict = true", () => {
                const userRoles = ["user", "manager", "comfirmed"];
                const actionRoles = ["user", "comfirmed"];
                let result = Auth.compareRolesArrayAgainstArray(
                    userRoles,
                    actionRoles,
                    false
                );
                expect(result).to.deep.equal(true);
            });
        });
    });
};
