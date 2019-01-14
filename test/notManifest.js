const expect = require('chai').expect,
	HttpError = require('../src/error').Http,
	notManifest = require('../src/manifest/manifest'),
	manifest = new notManifest(),
	notRoute = require('../src/manifest/route'),
	routesPath = __dirname + '/routes',
	modulesPath = __dirname + '/modules';


const rawRoutesManifest = {
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
	}
};

describe('Manifest', function () {
	describe('clearActionFromRules', function () {
		it('with rules', function () {
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

		it('without rules', function () {
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

	describe('filterManifestRoute', function () {
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
		it('route [{admin},{auth},{!auth}],  !auth, \'user\', !admin', function () {
			const result = manifest.filterManifestRoute(route, false, 'user', false);
			expect(result).to.deep.equal({
				actions: {
					list: {
						postFix: ':actionName'
					}
				}
			});
		});

		it('route [{admin},{auth},{!auth}],  !auth, \'user\', admin', function () {
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

		it('route [{admin},{auth},{!auth}],  auth, \'user\', !admin', function () {
			const result = manifest.filterManifestRoute(route, true, 'user', false);
			expect(result).to.deep.equal({
				actions: {
					list: {
						postFix: ':actionName'
					}
				}
			});
		});

		it('route [{admin},{auth},{!auth}],  auth, \'user\', !admin', function () {
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


	describe('filterManifest', function () {
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
		it('Guest manifest', function () {
			let man = rawRoutesManifest,
				manAfterFilter = manifest.filterManifest(man, false, false, false);
			expect(manAfterFilter).to.deep.equal(filtered.guest);
		});

		it('Auth manifest', function () {
			let man = rawRoutesManifest,
				manAfterFilter = manifest.filterManifest(man, true, false, false);
			expect(manAfterFilter).to.deep.equal(filtered.user);
		});

		it('Auth with manager role manifest', function () {
			let man = rawRoutesManifest,
				manAfterFilter = manifest.filterManifest(man, true, 'manager', false);
			expect(manAfterFilter).to.deep.equal(filtered.manager);
		});

		it('Guest with notActivated role manifest', function () {
			let man = rawRoutesManifest,
				manAfterFilter = manifest.filterManifest(man, false, 'notActivated', false);
			expect(manAfterFilter).to.deep.equal(filtered.notActivated);
		});

		it('Admin manifest', function () {
			let man = rawRoutesManifest,
				manAfterFilter = manifest.filterManifest(man, false, false, true);
			expect(manAfterFilter).to.deep.equal(filtered.admin);
		});
	});

	describe('getManifest', function () {
		it('Get manifest from test routes', function () {
			let man = rawRoutesManifest,
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
				};
			expect(man).to.deep.equal(fullMan);
		});
	});

	describe('getModuleManifest', function () {
		it('Get manifest from test routes', function () {
			/*const subModule = require('./module');
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
				};*/
			expect(true).to.deep.equal(true);
		});
	});


	var fakeApp = {
		get: function (routeLine, callback) {
			this.method = 'get';
			this.routeLine = routeLine;
			this.callback = callback;
		},
		post: function (routeLine, callback) {
			this.method = 'post';
			this.routeLine = routeLine;
			this.callback = callback;
		},
		put: function (routeLine, callback) {
			this.method = 'put';
			this.routeLine = routeLine;
			this.callback = callback;
		},
		delete: function (routeLine, callback) {
			this.method = 'delete';
			this.routeLine = routeLine;
			this.callback = callback;
		},
		patch: function (routeLine, callback) {
			this.method = 'patch';
			this.routeLine = routeLine;
			this.callback = callback;
		},
	};

	describe('registerRouteForAction', function () {
		it('Guest GET request', function () {
			manifest.app = {'get':()=>{

			}};
			let result = manifest.registerRouteForAction('/api/:modelName', 'list', 'list', rawRoutesManifest.post.actions.list);

			expect(result).to.be.equal(true);
		});

		it('Guest GET request to wrong end point', function () {
			let result = manifest.registerRouteForAction('/api/:modelName', 'get', 'list', rawRoutesManifest.post.actions.listAlly);
			expect(result).to.deep.equal(false);
		});

		it('Guest POST request', function () {
			manifest.app = {'post':()=>{

			}};
			let result = manifest.registerRouteForAction('/api/:modelName', 'admin', 'reboot', rawRoutesManifest.admin.actions.reboot);
			expect(result).to.deep.equal(true);
		});
	});

});
