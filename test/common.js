const expect = require('chai').expect,
	mongoose = require('mongoose'),
	ObjectId = mongoose.Types.ObjectId,
	Common = require('../src/common');

describe('Common', function() {
	describe('firstLetterToLower', function() {
		it('`Some error` -> `some error`', function() {
			expect(Common.firstLetterToLower('Some error')).to.be.equal('some error');
		});
	});

	describe('firstLetterToUpper', function() {
		it('`some error` -> `Some error`', function() {
			expect(Common.firstLetterToUpper('some error')).to.be.equal('Some error');
		});
	});

	let testie = 'Иероним Босх';
	describe(`validateObjectId, build in validator failed on ${testie}`, function() {

		it(`Mongoose.Types.ObjectId.isValid('${testie}') -> true`, function(){
			expect(ObjectId.isValid(testie)).to.be.ok;
		});
		it(`validateObjectId(${testie}) -> false`, function() {
			expect(Common.validateObjectId(testie)).to.be.not.ok;
		});
		it('validateObjectId(`5af96abbce4adb46c5202ed3`) -> true', function() {
			expect(Common.validateObjectId('5af96abbce4adb46c5202ed3')).to.be.ok;
		});
	});
});
