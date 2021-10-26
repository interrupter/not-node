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
						root: true
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
						root: true
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
						root: true
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
						root: true
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
						root: true
					}, {
						auth: true,
						role: ['manager']
					}]
				},
				routerAction = new notRoute({}, 'not-user', 'user', 'listAll', actionData);
			expect(routerAction.selectRule(req)).to.deep.equal({
				root: true
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
				list:()=>{
					return 'list';
				}
			},
		 fakeMod = {
				getRoute:()=>{
					return fakeRoute;
				}
			},
			fakeNotApp = {
				getModule:()=>{return fakeMod;}
			};
		it('Guest request post.list', function (done) {
			let req = {
					session: {
						user: false
					}
				},
				actionData = {
					method: 'get',
					auth: false
				},
				routerAction = new notRoute(fakeNotApp, 'not-user', 'post', 'list', actionData);
				routerAction.exec(req)
					.then((result)=>{
						expect(result).to.deep.equal('list');
						done();
					})
					.catch(done);
			//console.log('result', routerAction, actionData, result);

		});

		it('Admin request post.listAll', function (done) {
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
						root: true
					}]
				},
				routerAction = new notRoute(fakeNotApp, 'not-user', 'post', 'listAll', actionData);
			routerAction.exec(req)
				.then((result)=>{
					expect(result).to.deep.equal('_listAll');
					done()
				})
				.catch(done);
		});

		it('Auth with manager role request post.listAll', function (done) {
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
						root: true
					}, {
						auth: true,
						role: ['manager']
					}]
				},
				routerAction = new notRoute(fakeNotApp, 'not-user', 'post', 'listAll', actionData);
				routerAction.exec(req)
					.then((result)=>{
						expect(result).to.deep.equal('listAll');
						done();
					})
					.catch(done);
		});

		it('Auth request post.list', function (done) {
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
						root: true
					}]
				},
				routerAction = new notRoute(fakeNotApp, 'not-user', 'post', 'list', actionData);
				routerAction.exec(req)
					.then((result)=>{
						expect(result).to.deep.equal('list');
						done();
					})
					.catch(done);
		});

		it('Admin request post.list', function (done) {
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
						root: true,
					}, {
						auth: true
					}]
				},
				routerAction = new notRoute(fakeNotApp, 'not-user', 'post', 'list', actionData);
				routerAction.exec(req)
					.then((result)=>{
						expect(result).to.deep.equal('_list');
						done();
					})
					.catch(done);
		});

		it('Admin request post.list with actionName override', function (done) {
			let fakeRoute = {
					manager_listAll:()=>{return 'manager_listAll';}
				},
				fakeMod = {
					getRoute:()=>{
						return fakeRoute;
					}
				},
				fakeNotApp = {
					report(e){done(e);},
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
						root: true,
						actionName: 'manager_listAll'
					}, {
						auth: true
					}]
				},
				routerAction = new notRoute(fakeNotApp, 'not-user', 'post', 'list', actionData);
				routerAction.exec(req)
					.then((result)=>{
						expect(result).to.deep.equal('manager_listAll');
						done();
					})
					.catch(done);
		});

		it('Admin request post.list with actionPrefix override', function (done) {
			let fakeRoute = {
					__listAll:()=>{return '__listAll';}
				},
				fakeMod = {
					getRoute:()=>{
						return fakeRoute;
					}
				},
				fakeNotApp = {
					report(e){done(e);},
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
						root: true,
						actionPrefix: '__'
					}, {
						auth: true
					}]
				},
				routerAction = new notRoute(fakeNotApp, 'not-user', 'post', 'listAll', actionData);
				routerAction.exec(req)
					.then((result)=>{
						expect(result).to.deep.equal('__listAll');
						done();
					})
					.catch(done);
		});

		it('Auth request post.list with actionPrefix override', function (done) {
			let fakeRoute = {
					__list:()=>{return '__list';}
				},
				fakeMod = {
					getRoute:()=>{
						return fakeRoute;
					}
				},
				fakeNotApp = {
					report(e){done(e);},
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
						root: true
					}, {
						auth: true,
						actionPrefix: '__'
					}]
				},
				routerAction = new notRoute(fakeNotApp, 'not-user', 'post', 'list', actionData);
				routerAction.exec(req)
					.then((result)=>{
						expect(result).to.deep.equal('__list');
						done();
					})
					.catch(done);
		});

		it('Auth request post.list with actionName override', function (done) {
			let fakeRoute = {
					manager_listAll:()=>{return 'manager_listAll';}
				},
				fakeMod = {
					getRoute:()=>{
						return fakeRoute;
					}
				},
				fakeNotApp = {
					report(e){done(e);},
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
						root: true
					}, {
						auth: true,
						actionName: 'manager_listAll'
					}]
				},
				routerAction = new notRoute(fakeNotApp, 'not-user', 'post', 'list', actionData);
				routerAction.exec(req)
				 .then((result)=>{
					 expect(result).to.deep.equal('manager_listAll');
					 done();
				 })
				 .catch(done);
		});

		it('Auth with manager role request post.list with actionPrefix override', function (done) {
			let fakeRoute = {
					__list:()=>{return '__list';}
				},
				fakeMod = {
					getRoute:()=>{
						return fakeRoute;
					}
				},
				fakeNotApp = {
					report(e){done(e);},
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
						root: true
					}, {
						auth: true,
						role: 'manager',
						actionPrefix: '__'
					}]
				},
				routerAction = new notRoute(fakeNotApp, 'not-user', 'post', 'list', actionData);
				routerAction.exec(req)
					.then((result)=>{
						expect(result).to.deep.equal('__list');
						done();
					})
					.catch(done);
		});

		it('Auth with manager role request post.list with actionName override', async () => {
			let fakeRoute = {
					manager_listAll:()=>{return 'manager_listAll';}
				},
				fakeMod = {
					getRoute:()=>{
						return fakeRoute;
					}
				},
				fakeNotApp = {
					report(e){
						console.error(e);
						throw e;
					},
					getModule:()=>{
						return fakeMod;
					}
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
						root: true
					}, {
						auth: true,
						role: 'manager',
						actionName: 'manager_listAll'
					}]
				},
				routerAction = new notRoute(fakeNotApp, 'not-user', 'post', 'list', actionData);
				const result = await routerAction.exec(req, {}, (e)=>{
					console.error(e); throw e;
				});
				expect(result).to.deep.equal('manager_listAll');
		});

		it('Wrong modelName', function (done) {
			let fakeRoute = {
					manager_listAll:()=>{return 'manager_listAll';}
				},
				fakeMod = {
					getRoute:()=>{
						return fakeRoute;
					}
				},
				fakeNotApp = {
					report(e){
						console.error(e);
						done(e);
					},
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
						root: true
					}, {
						auth: true,
						role: 'manager',
						actionName: 'manager_listAll'
					}]
				},
				routerAction = new notRoute(fakeNotApp, 'not-user', 'post1', 'listasdf', actionData);

			routerAction.exec(req, {}, (err) => {
				expect(err).to.be.instanceof(Error);
				done();
			})
		});

		it('Wrong rule', function () {
			let
				req = {
					session: {
						user: false,
						role: 'manager'
					}
				},
				actionData = {
					method: 'get',
					rules: [{
						root: true
					}, {
						auth: true,
						role: 'manager',
						actionName: 'manager_listAll'
					}]
				},
				routerAction = new notRoute({}, 'not-user', 'post', 'list', actionData);
			routerAction.exec(req, false, (err)=>{
				expect(err).to.be.deep.equal(new HttpError(403, 'rule for router not found; not-user; post'));
			})
		});
	});
});
