const Parser = require('../src/parser'),
    expect = require("chai").expect;

    describe("parseLine", function() {
        it("Simple line", function() {
            const line = '/api/';
            expect(Parser.parseLine(line, 'user', 'get')).to.deep.equal('/api/');
        });

        it("Simple line with :modelName", function() {
            const line = '/api/:modelName';
            expect(Parser.parseLine(line, 'user', 'get')).to.deep.equal('/api/user');
        });

        it("Simple line with :modelName, :actionName", function() {
            const line = '/api/:modelName/:actionName';
            expect(Parser.parseLine(line, 'user', 'get')).to.deep.equal('/api/user/get');
        });

        it("Simple line with :modelName, :actionName, :record[_id]", function() {
            const line = '/api/:modelName/:actionName/:record[_id]';
            expect(Parser.parseLine(line, 'user', 'get')).to.deep.equal('/api/user/get/:_id');
        });

    });

    describe("getRouteLine", function() {
        it("Full featured line", function() {
            const url = '/api/:modelName',
                modelName = 'user',
                actionName = 'getAll',
                actionData = {
                    postFix: '/:actionName/:record[_id]'
                };
            expect(Parser.getRouteLine(url, modelName, actionName, actionData)).to.deep.equal('/api/user/getAll/:_id');
        });
    });
