module.exports = ({ expect }) => {
    describe("notAppIdentity", () => {});

    require("./identity.js")({ expect });

    require("./providers/session.js")({
        expect,
    });
    require("./providers/token.js")({
        expect,
    });
};
