const expect = require("chai").expect,
	HttpError = require('../src/error').Http,
	manifest = require("../src/manifest/manifest"),
	RouterAction = require("../src/manifest/routerAction"),
	routesPath = __dirname + '/routes';

describe("Manifest", function() {
	describe("clearActionFromRules", function() {
		it("with rules", function() {
			const input = {
				modelName: 'jelly',
				rules: [{
					auth: true,
				}, {
					admin: true,
				}]
			};
			const result = manifest.clearActionFromRules(input);
			expect(result).to.deep.equal({
				modelName: 'jelly'
			});
		});

		it("without rules", function() {
			const input = {
				modelName: 'jelly',
				auth: true,
				role: ['root'],
				admin: true,
			};
			const result = manifest.clearActionFromRules(input);
			expect(result).to.deep.equal({
				modelName: 'jelly'
			});
		});
	});

	describe("filterManifestRoute", function() {
		const route = {
			actions: {
				list: {
					postFix: ':actionName',
					rules: [{
						admin: true
					}, {
						auth: true
					}, {
						auth: false
					}]
				},
				get: {
					formData: true,
					rules: [{
						admin: true
					}]
				},
				update: {
					formData: false,
					auth: true,
					role: ['manager']
				}
			}
		};
		it("route [{admin},{auth},{!auth}],  !auth, 'user', !admin", function() {
			const result = manifest.filterManifestRoute(route, false, 'user', false);
			expect(result).to.deep.equal({
				actions: {
					list: {
						postFix: ':actionName'
					}
				}
			});
		});

		it("route [{admin},{auth},{!auth}],  !auth, 'user', admin", function() {
			const result = manifest.filterManifestRoute(route, false, 'user', true);
			expect(result).to.deep.equal({
				actions: {
					list: {
						postFix: ':actionName'
					},
					get: {
						formData: true
					}
				}
			});
		});

		it("route [{admin},{auth},{!auth}],  auth, 'user', !admin", function() {
			const result = manifest.filterManifestRoute(route, true, 'user', false);
			expect(result).to.deep.equal({
				actions: {
					list: {
						postFix: ':actionName'
					}
				}
			});
		});

		it("route [{admin},{auth},{!auth}],  auth, 'user', !admin", function() {
			const result = manifest.filterManifestRoute(route, true, 'manager', false);
			expect(result).to.deep.equal({
				actions: {
					list: {
						postFix: ':actionName'
					},
					update: {
						formData: false
					}
				}
			});
		});
	});


	describe("filterManifest", function() {
		manifest.registerRoutesPath('', routesPath);
		let filtered = {
			admin: {
				user: {
					model: 'user',
					url: '/api/:modelName',
					actions: {
						list: {
							method: 'get'
						},
						profile: {
							method: 'get'
						}
					}
				},
				post: {
					model: 'post',
					url: '/api/:modelName',
					actions: {
						list: {
							method: 'get'
						},
						listAll: {
							method: 'get'
						}
					}
				},
				admin: {
					model: 'admin',
					url: '/api/:modelName',
					actions: {
						reboot: {
							method: 'post'
						}
					}
				}
			},
			user: {
				user: {
					model: 'user',
					url: '/api/:modelName',
					actions: {
						profile: {
							method: 'get'
						}
					}
				},
				post: {
					model: 'post',
					url: '/api/:modelName',
					actions: {
						list: {
							method: 'get'
						}
					}
				}
			},
			guest: {
				post: {
					model: 'post',
					url: '/api/:modelName',
					actions: {
						list: {
							method: 'get'
						}
					}
				}
			},
			notActivated: {
				user: {
					model: 'user',
					url: '/api/:modelName',
					actions: {
						activate: {
							method: 'get'
						}
					}
				},
				post: {
					model: 'post',
					url: '/api/:modelName',
					actions: {
						list: {
							method: 'get'
						}
					}
				}
			},
			manager: {
				user: {
					model: 'user',
					url: '/api/:modelName',
					actions: {
						profile: {
							method: 'get'
						}
					}
				},
				post: {
					model: 'post',
					url: '/api/:modelName',
					actions: {
						list: {
							method: 'get'
						},
						listAll: {
							method: 'get'
						}
					}
				}
			}
		};
		it("Guest manifest", function() {
			let man = manifest.getManifest(routesPath),
				manAfterFilter = manifest.filterManifest(man, false, false, false);
			expect(manAfterFilter).to.deep.equal(filtered.guest);
		});

		it("Auth manifest", function() {
			let man = manifest.getManifest(routesPath),
				manAfterFilter = manifest.filterManifest(man, true, false, false);
			expect(manAfterFilter).to.deep.equal(filtered.user);
		});

		it("Auth with manager role manifest", function() {
			let man = manifest.getManifest(routesPath),
				manAfterFilter = manifest.filterManifest(man, true, 'manager', false);
			expect(manAfterFilter).to.deep.equal(filtered.manager);
		});

		it("Guest with notActivated role manifest", function() {
			let man = manifest.getManifest(routesPath),
				manAfterFilter = manifest.filterManifest(man, false, 'notActivated', false);
			expect(manAfterFilter).to.deep.equal(filtered.notActivated);
		});

		it("Admin manifest", function() {
			let man = manifest.getManifest(routesPath),
				manAfterFilter = manifest.filterManifest(man, false, false, true);
			expect(manAfterFilter).to.deep.equal(filtered.admin);
		});
	});

	describe("getManifest", function() {
		it("Get manifest from test routes", function() {
			manifest.registerRoutesPath('',routesPath);
			let man = manifest.getManifest();
			fullMan = {
					admin: {
						model: 'admin',
						url: '/api/:modelName',
						actions: {
							reboot: {
								method: 'post',
								rules: [{
									admin: true
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
									admin: true
								}]
							},
							profile: {
								method: 'get',
								rules: [{
									auth: true
								}, {
									admin: true
								}]
							},
							activate: {
								method: 'get',
								auth: false,
								role: 'notActivated'
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
									admin: true,
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
									admin: true,
									actionPrefix: '__',
									actionName: 'listForAdmin'
								}]
							}
						}
					}
				},
				expect(man).to.deep.equal(fullMan);
		});
	});

	describe("getModuleManifest", function() {
		it("Get manifest from test routes", function() {
			const subModule = require('./module');
			let man = manifest.getModuleManifest(subModule.routesPath),
				fullMan = {
					file: {
						model: 'file',
						url: '/api/:modelName',
						actions: {
							list: {
								method: 'get',
								rules: [{
									admin: true
								}]
							}
						}
					}
				};
			expect(man).to.deep.equal(fullMan);
		});
	});


	var fakeApp = {
		get: function(routeLine, callback) {
			this.method = 'get';
			this.routeLine = routeLine;
			this.callback = callback;
		},
		post: function(routeLine, callback) {
			this.method = 'post';
			this.routeLine = routeLine;
			this.callback = callback;
		},
		put: function(routeLine, callback) {
			this.method = 'put';
			this.routeLine = routeLine;
			this.callback = callback;
		},
		delete: function(routeLine, callback) {
			this.method = 'delete';
			this.routeLine = routeLine;
			this.callback = callback;
		},
		patch: function(routeLine, callback) {
			this.method = 'patch';
			this.routeLine = routeLine;
			this.callback = callback;
		},
	};

	describe("registerRouteForAction", function() {
		it("Guest GET request", function() {
			let man = manifest.getManifest(),
				result = manifest.registerRouteForAction(fakeApp, '/api/:modelName', 'post', 'list', man.post.actions.list);
			expect(result).to.deep.equal(true);
			expect(fakeApp.method).to.deep.equal('get');
		});

		it("Guest GET request to wrong end point", function() {
			let man = manifest.getManifest(),
				result = manifest.registerRouteForAction(fakeApp, '/api/:modelName', 'post', 'list', man.post.actions.listAlly);
			expect(result).to.deep.equal(false);
	});

		it("Guest POST request", function() {
			let man = manifest.getManifest(),
				result = manifest.registerRouteForAction(fakeApp, '/api/:modelName', 'admin', 'reboot', man.admin.actions.reboot);
			expect(result).to.deep.equal(true);
			expect(fakeApp.method).to.deep.equal('post');
		});
	});

	describe("registerRoutes", function() {
		it("Try to register to fake app", function() {
			let man = manifest.getManifest(),
				results = manifest.registerRoutes(fakeApp, man);
			expect(results).to.deep.equal(true);
		});
	});

	describe("Init", function() {
		it("Init default app routes", function() {
			manifest.init(routesPath);
			expect(manifest.routesPaths).to.deep.equal({
				'':routesPath
			});
		});
	});

});
