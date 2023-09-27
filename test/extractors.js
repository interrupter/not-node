const expect = require("chai").expect,
    extractors = require("../src/form/extractors");

describe("Form//Extractors", () => {
    describe("activeUserId", () => {
        it("user object exists ", () => {
            const _id = Math.random();
            const res = extractors.activeUserId({ user: { _id } });
            expect(_id).to.be.equal(res);
        });
        it("user object doesnt exists ", () => {
            const res = extractors.activeUserId({});
            expect(res).to.be.undefined;
        });
    });

    it("activeUserModelName", () => {
        const res = extractors.activeUserModelName();
        expect("User").to.be.equal(res);
    });

    it("fromBody", () => {
        const req = {
            body: {
                a: 1,
                b: 2,
                c: 3,
                d: 4,
            },
        };
        expect(extractors.fromBody(req, "b")).to.be.equal(2);
        expect(extractors.fromBody(req, "e")).to.be.undefined;
    });

    it("fromParams", () => {
        const req = {
            params: {
                a: 1,
                b: 2,
                c: 3,
                d: 4,
            },
        };
        expect(extractors.fromParams(req, "b")).to.be.equal(2);
        expect(extractors.fromParams(req, "e")).to.be.undefined;
    });

    it("fromQuery", () => {
        const req = {
            query: {
                a: 1,
                b: 2,
                c: 3,
                d: 4,
            },
        };
        expect(extractors.fromQuery(req, "b")).to.be.equal(2);
        expect(extractors.fromQuery(req, "e")).to.be.undefined;
    });
});
