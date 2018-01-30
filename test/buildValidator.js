const expect = require('chai').expect,
	validators = require('./validators.js'),
	buildValidator = require('../src/model/buildValidator');


describe('BuildValidator', function() {
	it('Simple', function() {
		var validator = buildValidator(validators.title);
		expect(validator).to.have.lengthOf(1);
		expect(validator[0]).to.have.keys(['validator', 'message']);
		expect(validator[0].message).to.deep.equal(validators.title[0].message);
	});
});
