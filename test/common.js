const expect = require('chai').expect,
	mongoose = require('mongoose'),
	path = require('path'),
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


	describe('mapBind', function() {
    it('to is undefined, exception throwned', function(done) {
      let to = undefined;
      try {
        Common.mapBind({getModel(){}}, to, ['getModel']);
				console.log(to);
				done(new Error('should throw'))
      } catch (e) {
        expect(e).to.be.instanceof(Error);
        done()
      }
    });

    it('list is empty', function() {
      const to = {};
      Common.mapBind({}, to, []);
      expect(to).to.be.deep.equal({});
    });

    it('list item is not pointing to function', function() {
      const to = {};
      Common.mapBind({}, to, ['vasqa de gamma']);
      expect(to).to.be.deep.equal({});
    });
  });


	describe('tryFile', function() {
		const pathToExistingFile = path.join(__dirname, 'module/fields/collection.js');
		const pathToAbsentFile = path.join(__dirname, 'module/fields/collection.ejs');
		const pathToDirectory = path.join(__dirname, 'module/fields/empty');

		it('file exists, type file', function() {
			const res = Common.tryFile(pathToExistingFile);
			expect(res).to.be.equal(true);
		});

		it('file doesnt exist', function() {
			const res = Common.tryFile(pathToAbsentFile);
			expect(res).to.be.equal(false);
		});

		it('directory', function() {
			const res = Common.tryFile(pathToDirectory);
			expect(res).to.be.equal(false);
		});

	});

});
