const expect = require('chai').expect,
	Env = require('../src/env');

describe('Env', function() {
	describe('getEnv', function() {
		it('key exists', function() {
			const res = Env.getEnv('process');
			expect(res).to.be.equal('development');
		});

		it('key not exists', function() {
			const res = Env.getEnv('key' + Math.random().toString());
			expect(res).to.be.undefined;
		});
	});

	describe('setEnv', function() {
		it('set', function() {
			const res = Env.setEnv('key', 'happy');
			expect(res).to.be.deep.equal(Env);
			expect(res.getEnv('key')).to.be.deep.equal('happy');
		});
	});
});
