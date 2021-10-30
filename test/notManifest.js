const expect = require('chai').expect,
	notManifest = require('../src/manifest/manifest'),
	manifest = new notManifest();

const rawRoutesManifest = {
	admin: {
		model: 'admin',
		url: '/api/:modelName',
		actions: {
			reboot: {
				method: 'post',
				rules: [{
					root: true
				}]
			}
		}
	},
	post: {
		model: 'post',
		url: '/api/:modelName',
		actions: {
			list: {
				method: 'get',
				rules: [{
					auth: false
				}, {
					auth: true,
					actionPrefix: 'user'
				}, {
					root: true,
					actionName: 'listForAdmin'
				}]
			},
			listAll: {
				method: 'get',
				rules: [{
					auth: true,
					role: ['manager'],
					actionName: 'managerListAll'
				}, {
					root: true,
					actionPrefix: '__',
					actionName: 'listForAdmin'
				}]
			}
		}
	},
	user: {
		model: 'user',
		url: '/api/:modelName',
		actions: {
			list: {
				method: 'get',
				rules: [{
					root: true
				}]
			},
			profile: {
				method: 'get',
				rules: [{
					auth: true
				}, {
					root: true
				}]
			},
			activate: {
				method: 'get',
				auth: false,
				role: 'notActivated'
			}
		}
	},
	journal:{},
	files:{actions:{empty: undefined}}
};

describe('Manifest', function () {
	const initSummary = ()=>{
		return {
			get: [],
			post: [],
			delete: []
		};
	};

	const initFakeApp = (summary)=>{
		return {
			get(url, cb){
				summary.get.push([url, cb]);
			},
			post(url, cb){
				summary.post.push([url, cb]);
			},
			delete(url, cb){
				summary.delete.push([url, cb]);
			},
		};
	};

	describe('registerRouteForAction', function () {
		it('Guest GET request', function () {
			manifest.app = {'get':()=>{}};
			let result = manifest.registerRouteForAction('/api/:modelName', 'list', 'list', rawRoutesManifest.post.actions.list);
			expect(result).to.be.equal(true);
		});
		it('Guest GET request to wrong end point', function () {
			let result = manifest.registerRouteForAction('/api/:modelName', 'get', 'list', rawRoutesManifest.post.actions.listAlly);
			expect(result).to.deep.equal(false);
		});
		it('Guest POST request', function () {
			manifest.app = {'post':()=>{}};
			let result = manifest.registerRouteForAction('/api/:modelName', 'admin', 'reboot', rawRoutesManifest.admin.actions.reboot);
			expect(result).to.deep.equal(true);
		});
	});

	describe('registerRoutes', function () {
		it('empty routes', function () {
			const summary = initSummary();
			const fakeApp = initFakeApp(summary);
			manifest.app = fakeApp;
			const input = {};
			manifest.registerRoutes(input);
			expect(summary).to.be.deep.equal(initSummary());
		});

		it('empty routes', function () {
			const summary = initSummary();
			const fakeApp = initFakeApp(summary);
			manifest.app = fakeApp;
			const input = {
				user: {
					url: '/api/:modelName',
					model: 'user',
					actions:{
						info: {
							method: 'GET'
						},
						rules: [{auth: false}]
					}
				},
				looser: {
					url: '/api/:modelName',
					actions:{}
				}
			};
			manifest.registerRoutes(input);
			expect(summary.get[0][0]).to.be.equal('/api/user');
			expect(typeof summary.get[0][1]).to.be.equal('function');
			expect(summary.get.length).to.be.equal(1);
		});
	});

	describe('routeHasRoutes', function () {
		it('actions', function () {
			const result = manifest.routeHasRoutes({actions:{}});
			expect(result).to.deep.equal(false);
		});

		it('actions, url', function () {
			const result = manifest.routeHasRoutes({actions:{}, url: ''});
			expect(result).to.deep.equal(false);
		});

		it('actions, url, model not empty', function () {
			const result = manifest.routeHasRoutes({actions:{}, url: '', model: 'sadf'});
			expect(result).to.deep.equal(true);
		});

		it('actions, url, model is empty', function () {
			const result = manifest.routeHasRoutes({actions:{}, url: '', model: ''});
			expect(result).to.deep.equal(false);
		});
	});

	//filterManifest
	describe('filterManifest', function () {
		it('filter;', function () {

			expect(notManifest.prototype.filterManifest.call({}, rawRoutesManifest, true, 'user', false)).to.deep.equal(
				{
					post: {
						model: 'post',
						url: '/api/:modelName',
						actions: {
							list: {
								method: 'get'
							}
						}
					},
					user: {
						model: 'user',
						url: '/api/:modelName',
						actions: {
							profile: {
								method: 'get'
							}
						}
					},
				}
			);
		});

	});
});
