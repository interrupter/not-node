const expect = require('chai').expect,
  notApp = require('../src/app');
const mock = require('mock-require');

mock('not-inform',{
  Inform: class FakeInformer{}
});

describe('noApp', function() {

  describe('Constructor', function() {
    it('With options', function() {
      let app = new notApp({
        someOption: true
      });
      expect(app.getOptions()).to.deep.equal({
        someOption: true
      });
      expect(app.getModulesNames()).to.deep.equal([]);
    });
  });

  describe('getManifest', function() {
    it('getManifest', function() {
      const ctx = {
        collectManifest() {
          return {
            manifest: true
          };
        }
      };
      const res = notApp.prototype.getManifest.call(ctx);
      expect(res).to.deep.equal({
        manifest: true
      });
    });
  });

  describe('collectManifest', function() {
    it('modules - empty', function() {
      const ctx = {
        modules: {}
      };
      const res = notApp.prototype.collectManifest.call(ctx);
      expect(res).to.deep.equal({});
    });

    it('modules - empty', function() {
      const ctx = {
        modules: {
          user: {
            getManifest() {
              return {
                user: {
                  url: '/api/:modelName',
                  modelName: 'user',
                  actions: {
                    tst: {
                      mathod: 'get'
                    }
                  }
                }
              };
            }
          },
          far: {
            getManifest() {
              return {
                far: {
                  url: '/api/:modelName',
                  modelName: 'far',
                  actions: {
                    pst: {
                      mathod: 'get'
                    }
                  }
                }
              };
            }
          }
        }
      };
      const res = notApp.prototype.collectManifest.call(ctx);
      expect(res).to.deep.equal({
        user: {
          url: '/api/:modelName',
          modelName: 'user',
          actions: {
            tst: {
              mathod: 'get'
            }
          }
        },
        far: {
          url: '/api/:modelName',
          modelName: 'far',
          actions: {
            pst: {
              mathod: 'get'
            }
          }
        }
      });
    });
  });

  describe('expose', function() {
    it('ok', function() {
      let exposed = [];
      const ctx = {
        forEachMod(cb) {
          [
            [
              'mod1',
              {
                expose(app, n) {
                  exposed.push(n);
                }
              }
            ],
            ['mod2', {}]
          ].forEach(item => cb(...item));
        }
      };
      notApp.prototype.expose.call(ctx);
      expect(exposed).to.deep.equal(['mod1']);
    });
  });



  describe('getActionManifestForUser', function() {
    it('model and action exists', function() {
      const ctx = {
        collectManifest() {
          return {
            user: {
              actions: {
                tst: {
                  lf: true
                }
              }
            }
          };
        }
      };
      const model = 'user',
        action = 'tst',
        user = {
          auth: true
        };
      const res = notApp.prototype.getActionManifestForUser.call(ctx, model, action, user);
      expect(res).to.deep.equal({
        lf: true
      });
    });

    it('model not exists', function() {
      const ctx = {
        collectManifest() {
          return {
            book: {
              actions: {
                tst: {
                  lf: true
                }
              }
            }
          };
        }
      };
      const model = 'user',
        action = 'tst',
        user = {
          auth: true
        };
      const res = notApp.prototype.getActionManifestForUser.call(ctx, model, action, user);
      expect(res).to.deep.equal(false);
    });

    it('action not exists', function() {
      const ctx = {
        collectManifest() {
          return {
            user: {
              actions: {
                look: {
                  lf: true
                }
              }
            }
          };
        }
      };
      const model = 'user',
        action = 'tst',
        user = {
          auth: true
        };
      const res = notApp.prototype.getActionManifestForUser.call(ctx, model, action, user);
      expect(res).to.deep.equal(false);
    });
  });

});
