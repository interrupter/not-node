const expect = require('chai').expect,
	error = require('../src/error'),
	HttpError = require('../src/error').Http;

describe('Error', function() {
	describe('addError', function() {
		it('Add error to existing `Errors` object', function() {
			let errors = {};
			expect(error.addError(errors, 'name', 'some error')).to.deep.equal({
				name: ['some error']
			});
		});

		it('Add error to not existing `Errors` object', function() {
			expect(error.addError(undefined, 'name', 'some error')).to.deep.equal({
				name: ['some error']
			});
		});

		it('Add error to existing `Errors` object with existing error field of Array type', function() {
			let errors = {
				name: ['some nice error']
			};
			expect(error.addError(errors, 'name', 'some error')).to.deep.equal({
				name: ['some nice error', 'some error']
			});
		});

		it('Add error to existing `Errors` object with existing error field of not Array type', function() {
			let errors = {
				name: 'some nice error'
			};
			expect(error.addError(errors, 'name', 'some error')).to.deep.equal({
				name: ['some nice error', 'some error']
			});
		});
	});
});
