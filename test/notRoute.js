const Parser = require('../src/parser'),
	HttpError = require('../src/error').Http,
	notManifest = require('../src/manifest/manifest'),
	notRoute = require('../src/manifest/route'),
	notApp = require('../src/app'),
	expect = require('chai').expect;

describe('RouterAction', function () {
	describe('RouterAction init call', function () {
		it('Init object', function () {
			let routerAction = new notRoute({}, 'not-user', 'user', 'getAll', {});
			expect(routerAction).to.have.keys(['notApp', 'routeName', 'moduleName', 'actionName', 'actionData']);
		});
	});

	describe('RouterAction.selectRule', function () {
		it('User(auth) request, post.list action', function () {
			let req = {
					session: {
						user: true,
						role: 'root'
					}
				},
				actionData = {
					method: 'get',
					rules: [{
						auth: false
					}, {
						auth: true
					}, {
						admin: true
					}]
				},
				routerAction = new notRoute({}, 'not-user', 'user', 'list', actionData);
			expect(routerAction.selectRule(req)).to.deep.equal({
				auth: true
			});
		});
		it('User(!auth) request, post.list action', function () {
			let req = {
					session: {
						user: false
					}
				},
				actionData = {
					method: 'get',
					rules: [{
						admin: true
					}, {
						auth: false
					}, {
						auth: true
					}]
				},
				routerAction = new notRoute({}, 'not-user', 'user', 'list', actionData);
			expect(routerAction.selectRule(req)).to.deep.equal({
				auth: false
			});
		});

		it('User(auth) request, post.listAll action', function () {
			let req = {
					session: {
						user: true
					}
				},
				actionData = {
					method: 'get',
					rules: [{
						auth: true,
						role: ['manager']
					}, {
						admin: true
					}]
				},
				routerAction = new notRoute({}, 'not-user', 'user', 'listAll', actionData);
			expect(routerAction.selectRule(req)).to.deep.equal(null);
		});

		it('User(auth, manager) request, post.listAll action', function () {
			let req = {
					session: {
						user: true,
						role: ['manager']
					}
				},
				actionData = {
					method: 'get',
					rules: [{
						auth: true,
						role: ['manager']
					}, {
						admin: true
					}]
				},
				routerAction = new notRoute({}, 'not-user', 'user', 'listAll', actionData);
			expect(routerAction.selectRule(req)).to.deep.equal({
				auth: true,
				role: ['manager']
			});
		});

		it('Admin request, post.listAll action', function () {
			let req = {
					session: {
						user: true,
						role: 'root'
					}
				},
				actionData = {
					method: 'get',
					rules: [{
						admin: true
					}, {
						auth: true,
						role: ['manager']
					}]
				},
				routerAction = new notRoute({}, 'not-user', 'user', 'listAll', actionData);
			expect(routerAction.selectRule(req)).to.deep.equal({
				admin: true
			});
		});

		it('Guest request, post.list action', function () {
			let req = {
					session: {
						user: false
					}
				},
				actionData = {
					method: 'get',
					auth: false
				},
				routerAction = new notRoute({}, 'not-user', 'user', 'list', actionData),
				rule = routerAction.selectRule(req);
			expect(rule).to.have.keys(['method', 'auth']);
			expect(rule.method).to.be.equal('get');
			expect(rule.auth).to.be.equal(false);
		});
	});

	describe('RouterAction.exec', function () {
		//manifest.registerRoutesPath('', __dirname + '/routes');
		//manifest.getManifest();
		let fakeRoute = {
				list:()=>{return 'list';}
			},
		 fakeMod = {
				getRoute:()=>{
					return fakeRoute;
				}
			},
			fakeNotApp = {
				getModule:()=>{return fakeMod;}
			};
		it('Guest request post.list', function () {
			let req = {
					session: {
						user: false
					}
				},
				actionData = {
					method: 'get',
					auth: false
				},
				routerAction = new notRoute(fakeNotApp, 'not-user', 'post', 'list', actionData),
				result = routerAction.exec(req);
			//console.log('result', routerAction, actionData, result);
			expect(result).to.deep.equal('list');
		});

		it('Admin request post.listAll', function () {
			let fakeRoute = {
					_listAll:()=>{return '_listAll';}
				},
			 fakeMod = {
					getRoute:()=>{
						return fakeRoute;
					}
				},
				fakeNotApp = {
					getModule:()=>{return fakeMod;}
				};
			let req = {
					session: {
						user: true,
						role: 'root'
					}
				},
				actionData = {
					method: 'get',
					rules: [{
						auth: true,
						role: ['manager']
					}, {
						admin: true
					}]
				},
				routerAction = new notRoute(fakeNotApp, 'not-user', 'post', 'listAll', actionData);
			let result = routerAction.exec(req);
			expect(result).to.deep.equal('_listAll');
		});

		it('Auth with manager role request post.listAll', function () {
			let fakeRoute = {
					listAll:()=>{return 'listAll';}
				},
			 fakeMod = {
					getRoute:()=>{
						return fakeRoute;
					}
				},
				fakeNotApp = {
					getModule:()=>{return fakeMod;}
				};
			let req = {
					session: {
						user: true,
						role: 'manager'
					}
				},
				actionData = {
					method: 'get',
					rules: [{
						admin: true
					}, {
						auth: true,
						role: ['manager']
					}]
				},
				routerAction = new notRoute(fakeNotApp, 'not-user', 'post', 'listAll', actionData);
			expect(routerAction.exec(req)).to.deep.equal('listAll');
		});

		it('Auth request post.list', function () {
			let fakeRoute = {
					list:()=>{return 'list';}
				},
				fakeMod = {
					getRoute:()=>{
						return fakeRoute;
					}
				},
				fakeNotApp = {
					getModule:()=>{return fakeMod;}
				};
			let req = {
					session: {
						user: true
					}
				},
				actionData = {
					method: 'get',
					rules: [{
						auth: true
					}, {
						auth: false
					}, {
						admin: true
					}]
				},
				routerAction = new notRoute(fakeNotApp, 'not-user', 'post', 'list', actionData);
			expect(routerAction.exec(req)).to.deep.equal('list');
		});

		it('Admin request post.list', function () {
			let fakeRoute = {
					_list:()=>{return '_list';}
				},
				fakeMod = {
					getRoute:()=>{
						return fakeRoute;
					}
				},
				fakeNotApp = {
					getModule:()=>{return fakeMod;}
				};
			let req = {
					session: {
						user: true,
						role: 'root'
					}
				},
				actionData = {
					method: 'get',
					rules: [{
						auth: false,
					}, {
						admin: true,
					}, {
						auth: true
					}]
				},
				routerAction = new notRoute(fakeNotApp, 'not-user', 'post', 'list', actionData);
			expect(routerAction.exec(req)).to.deep.equal('_list');
		});

		it('Admin request post.list with actionName override', function () {
			let fakeRoute = {
					manager_listAll:()=>{return 'manager_listAll';}
				},
				fakeMod = {
					getRoute:()=>{
						return fakeRoute;
					}
				},
				fakeNotApp = {
					getModule:()=>{return fakeMod;}
				};
			let req = {
					session: {
						user: true,
						role: 'root'
					}
				},
				actionData = {
					method: 'get',
					rules: [{
						auth: false,
					}, {
						admin: true,
						actionName: 'manager_listAll'
					}, {
						auth: true
					}]
				},
				routerAction = new notRoute(fakeNotApp, 'not-user', 'post', 'list', actionData);
			expect(routerAction.exec(req)).to.deep.equal('manager_listAll');
		});

		it('Admin request post.list with actionPrefix override', function () {
			let fakeRoute = {
					__listAll:()=>{return '__listAll';}
				},
				fakeMod = {
					getRoute:()=>{
						return fakeRoute;
					}
				},
				fakeNotApp = {
					getModule:()=>{return fakeMod;}
				};
			let req = {
					session: {
						user: true,
						role: 'root'
					}
				},
				actionData = {
					method: 'get',
					rules: [{
						auth: false,
					}, {
						admin: true,
						actionPrefix: '__'
					}, {
						auth: true
					}]
				},
				routerAction = new notRoute(fakeNotApp, 'not-user', 'post', 'listAll', actionData);
			expect(routerAction.exec(req)).to.deep.equal('__listAll');
		});

		it('Auth request post.list with actionPrefix override', function () {
			let fakeRoute = {
					__list:()=>{return '__list';}
				},
				fakeMod = {
					getRoute:()=>{
						return fakeRoute;
					}
				},
				fakeNotApp = {
					getModule:()=>{return fakeMod;}
				};
			let req = {
					session: {
						user: true
					}
				},
				actionData = {
					method: 'get',
					rules: [{
						auth: false,
					}, {
						admin: true
					}, {
						auth: true,
						actionPrefix: '__'
					}]
				},
				routerAction = new notRoute(fakeNotApp, 'not-user', 'post', 'list', actionData);
			expect(routerAction.exec(req)).to.deep.equal('__list');
		});

		it('Auth request post.list with actionName override', function () {
			let fakeRoute = {
					manager_listAll:()=>{return 'manager_listAll';}
				},
				fakeMod = {
					getRoute:()=>{
						return fakeRoute;
					}
				},
				fakeNotApp = {
					getModule:()=>{return fakeMod;}
				};
			let req = {
					session: {
						user: true
					}
				},
				actionData = {
					method: 'get',
					rules: [{
						auth: false,
					}, {
						admin: true
					}, {
						auth: true,
						actionName: 'manager_listAll'
					}]
				},
				routerAction = new notRoute(fakeNotApp, 'not-user', 'post', 'list', actionData);
			expect(routerAction.exec(req)).to.deep.equal('manager_listAll');
		});

		it('Auth with manager role request post.list with actionPrefix override', function () {
			let fakeRoute = {
					__list:()=>{return '__list';}
				},
				fakeMod = {
					getRoute:()=>{
						return fakeRoute;
					}
				},
				fakeNotApp = {
					getModule:()=>{return fakeMod;}
				};
			let req = {
					session: {
						user: true,
						role: 'manager'
					}
				},
				actionData = {
					method: 'get',
					rules: [{
						auth: false,
					}, {
						admin: true
					}, {
						auth: true,
						role: 'manager',
						actionPrefix: '__'
					}]
				},
				routerAction = new notRoute(fakeNotApp, 'not-user', 'post', 'list', actionData);
			expect(routerAction.exec(req)).to.deep.equal('__list');
		});

		it('Auth with manager role request post.list with actionName override', function () {
			let fakeRoute = {
					manager_listAll:()=>{return 'manager_listAll';}
				},
				fakeMod = {
					getRoute:()=>{
						return fakeRoute;
					}
				},
				fakeNotApp = {
					getModule:()=>{return fakeMod;}
				};
			let req = {
					session: {
						user: true,
						role: 'manager'
					}
				},
				actionData = {
					method: 'get',
					rules: [{
						auth: false,
					}, {
						admin: true
					}, {
						auth: true,
						role: 'manager',
						actionName: 'manager_listAll'
					}]
				},
				routerAction = new notRoute(fakeNotApp, 'not-user', 'post', 'list', actionData);
			expect(routerAction.exec(req)).to.deep.equal('manager_listAll');
		});

		it('Wrong modelName', function () {
			let fakeRoute = {
					manager_listAll:()=>{return 'manager_listAll';}
				},
				fakeMod = {
					getRoute:()=>{
						return fakeRoute;
					}
				},
				fakeNotApp = {
					getModule:()=>{return null;}
				};
			let req = {
					session: {
						user: true,
						role: 'manager'
					}
				},
				actionData = {
					method: 'get',
					rules: [{
						auth: false,
					}, {
						admin: true
					}, {
						auth: true,
						role: 'manager',
						actionName: 'manager_listAll'
					}]
				},
				routerAction = new notRoute(fakeNotApp, 'not-user', 'post1', 'listasdf', actionData);

			expect(routerAction.exec(req, {}, err => err )).to.be.an.instanceof(Error);
		});

		it('Wrong rule', function () {
			let next = function (val) {
					return val;
				},
				req = {
					session: {
						user: false,
						role: 'manager'
					}
				},
				actionData = {
					method: 'get',
					rules: [{
						admin: true
					}, {
						auth: true,
						role: 'manager',
						actionName: 'manager_listAll'
					}]
				},
				routerAction = new notRoute({}, 'not-user', 'post', 'list', actionData);
			expect(routerAction.exec(req, false, next)).to.deep.equal(new HttpError(403, 'rule for router not found'));
		});
	});
});
