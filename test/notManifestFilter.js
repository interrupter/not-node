const expect = require('chai').expect,
	notManifestFilter = require('../src/manifest/manifest.filter');


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

describe('notManifestFilter', function () {
	describe('clearActionFromRules', function () {
		it('with rules', function () {
			const input = {
				modelName: 'jelly',
				rules: [{
					auth: true,
					fields: ['name']
				}, {
					root: true,
					fields: ['name', 'email']
				}]
			};
			const result = notManifestFilter.clearActionFromRules(input, {
				root: true,
				fields: ['name', 'email']
			});
			expect(result).to.deep.equal({
				modelName: 'jelly',
				fields: ['name', 'email']
			});
		});

		it('without rules', function () {
			const input = {
				modelName: 'jelly',
				auth: true,
				role: ['root'],
				root: true
			};
			const result = notManifestFilter.clearActionFromRules(input);
			expect(result).to.deep.equal({
				modelName: 'jelly'
			});
		});
	});

	describe('filterRoute', function () {
		const route = {
			actions: {
				list: {
					postFix: ':actionName',
					rules: [{
						root: true
					}, {
						auth: true
					}, {
						auth: false
					}]
				},
				get: {
					formData: true,
					rules: [{
						root: true
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
			const result = notManifestFilter.filterRoute(route, false, 'user', false);
			expect(result).to.deep.equal({
				actions: {
					list: {
						postFix: ':actionName'
					}
				}
			});
		});

		it('route [{admin},{auth},{!auth}],  !auth, \'user\', admin', function () {
			const result = notManifestFilter.filterRoute(route, false, 'user', true);
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
			const result = notManifestFilter.filterRoute(route, true, 'user', false);
			expect(result).to.deep.equal({
				actions: {
					list: {
						postFix: ':actionName'
					}
				}
			});
		});

		it('route [{admin},{auth},{!auth}],  auth, \'user\', !admin', function () {
			const result = notManifestFilter.filterRoute(route, true, 'manager', false);
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


	describe('filter', function () {
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
				manAfterFilter = notManifestFilter.filter(man, false, false, false);
			expect(manAfterFilter).to.deep.equal(filtered.guest);
		});

		it('Auth manifest', function () {
			let man = rawRoutesManifest,
				manAfterFilter = notManifestFilter.filter(man, true, false, false);
			expect(manAfterFilter).to.deep.equal(filtered.user);
		});

		it('Auth with manager role manifest', function () {
			let man = rawRoutesManifest,
				manAfterFilter = notManifestFilter.filter(man, true, 'manager', false);
			expect(manAfterFilter).to.deep.equal(filtered.manager);
		});

		it('Guest with notActivated role manifest', function () {
			let man = rawRoutesManifest,
				manAfterFilter = notManifestFilter.filter(man, false, 'notActivated', false);
			expect(manAfterFilter).to.deep.equal(filtered.notActivated);
		});

		it('Admin manifest', function () {
			let man = rawRoutesManifest,
				manAfterFilter = notManifestFilter.filter(man, false, false, true);
			expect(manAfterFilter).to.deep.equal(filtered.admin);
		});
	});


});
