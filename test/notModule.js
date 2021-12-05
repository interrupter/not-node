const path = require('path');
const expect = require('chai').expect,
  notModule = require('../src/manifest/module'),
  notManifest = require('../src/manifest/manifest'),
  mongoose = require('mongoose'),
  modulePath = __dirname + '/testies/module',
  {
    MongoMemoryServer
  } = require('mongodb-memory-server');

const moduleManifest = {
  'file': {
    model: 'file',
    url: '/api/:modelName',
    actions: {
      list: {
        method: 'get'
      }
    }
  }
};

var mongod = null;

describe('notModule', function() {
  before(async () => {
    mongod = await MongoMemoryServer.create();
    let uri = mongod.getUri();
    await mongoose.connect(uri);
  });

  describe('constructor', function() {
    it('With init from path: ' + modulePath, function() {
      var mod = new notModule({
        modPath: modulePath,
        mongoose: mongoose,
        fields:{}
      });
      mod.fabricateModels();
      expect(mod.faulty).to.deep.equal(false);
      expect(mod.path).to.deep.equal(modulePath);
      expect(mod.models).to.have.any.keys(['UserLocal']);
      expect(mod.routes).to.have.keys(['file', 'icon']);
      let model = mod.getModel('UserLocal');
      expect(model).to.be.ok;
    });

    it('With init from module', function() {
      var mod = new notModule({
        modObject: require('./testies/module'),
        mongoose: mongoose
      });
      expect(mod.faulty).to.deep.equal(false);
      expect(mod.models).to.have.any.keys(['UserLocal']);
      expect(mod.routes).to.have.keys(['file', 'icon']);
      expect(mod.getModel('UserLocal')).to.be.ok;
    });
  });


  describe('init', ()=>{
    it('path is not set, module is not set', ()=>{
      const ctx = {
        path: false,
        module: null
      };
      const res = notModule.prototype.init.call(ctx);
      expect(res).to.be.equal(false);
    });

    it('path is not set, module is not set', ()=>{
      const ctx = {
        path: false,
        module: {},
        initFromModule(){},
        appIsSet(){return true;},
        notApp:{
          getModel(){},
          getModelFile(){},
          getModelSchema(){},
          getLogic(){},
          getLogicFile(){},
          getModule(){},
        }
      };
      notModule.prototype.init.call(ctx);
      expect(typeof ctx.module.getModel).to.be.equal('function');
      expect(typeof ctx.module.getModelFile).to.be.equal('function');
      expect(typeof ctx.module.getModelSchema).to.be.equal('function');
    });
  });

  describe('getManifest', function() {
    it('Get module manifest without params', function(done) {
      const ctx = {
        manifests: {
          some: 'fest'
        },
        manifest: {
          filterManifest(collection, auth, role, root) {
            expect(collection).to.deep.equal({
              some: 'fest'
            });
            expect(auth).to.be.false;
            expect(role).to.be.equal('guest');
            expect(root).to.be.false;
            done()
          }
        }
      }
      notModule.prototype.getManifest.call(ctx);
    });

    it('Get module manifest, with params', function(done) {
      const prms = {
        auth: true,
        role: 'manager',
        root: false
      };
      const ctx = {
        manifests: {
          some: 'fest'
        },
        manifest: {
          filterManifest(collection, auth, role, root) {
            expect(collection).to.deep.equal({
              some: 'fest'
            });
            expect(auth).to.be.true;
            expect(role).to.be.equal('manager');
            expect(root).to.be.false;
            done()
          }
        }
      }
      notModule.prototype.getManifest.call(ctx, prms);
    });
  });

  describe('getModuleName', function() {
    it('Get module name from module.exports.name', function() {
      const ctx = {
        module: {
          name: 'fake my name'
        }
      }
      expect(notModule.prototype.getName.call(ctx)).to.be.equal('fake my name');
    });

    it('no module.name, no path', function() {
      const ctx = {
        module: {}
      }
      expect(notModule.prototype.getName.call(ctx)).to.be.undefined;
    });
  });


  describe('expose', function() {
    it('!manifests', function() {
      const ctx = {
        manifests:{},
        initManifest(){
          this.manifest = {
            registerRoutes(){}
          };
        },
        fabricateModels(){}
      };
      notModule.prototype.expose.call(ctx, false, 'moduleName');
    });

    it('manifests', function() {
      const ctx = {
        manifests:{},
        initManifest(){
          this.manifest = {
            registerRoutes(){}
          };
        },
        fabricateModels(){}
      };
      notModule.prototype.expose.call(ctx, {}, 'moduleName');
    });
  });


  describe('initManifest', function() {
    it('plain', function() {
      const ctx = {
        notApp:{}
      };
      notModule.prototype.initManifest.call(ctx, true, 'moduleName');
      expect(ctx.manifest).to.be.instanceof(notManifest);
    });
  });


  describe('initFromPath', function() {
    it('modPath is points to a directory, require failed', function() {
      const mod = new notModule({
        modPath: path.join(__dirname, 'testies/badmodule'),
        mongoose: mongoose
      });
      expect(mod.faulty).to.be.true;
    });

    it('modPath is points to a file, require failed', function() {
      const mod = new notModule({
        modPath: path.join(__dirname, 'testies/module/index.js'),
        mongoose: mongoose
      });
      expect(mod.faulty).to.be.false;
    });
  });

  describe('initFromModule', function() {
    it('throws', function() {
      const mod = new notModule({
        modPath: path.join(__dirname, 'testies/badmodule'),
        mongoose: mongoose
      });
      mod.registerContent = () => {
        throw new Error('Some error!');
      }
      mod.initFromModule();
      expect(mod.faulty).to.be.true;
    });
  });

  describe('getApp', function() {
    it('get', function() {
      const ctx = {
        notApp: '123123'
      };
      expect(notModule.prototype.getApp.call(ctx)).to.be.equal('123123');
    });
  });


  describe('getName', function() {
    it('get', function() {
      const ctx = {
        module: {
          name: '123123'
        }
      };
      expect(notModule.prototype.getName.call(ctx)).to.be.equal('123123');
    });
  });



  describe('getEndPoints', function() {
    it('get', function() {
      const ctx = {
        routesWS: {
          name: '123123'
        }
      };
      expect(notModule.prototype.getEndPoints.call(ctx)).to.be.deep.equal({
        name: '123123'
      });
    });
  });

  describe('getRoute', function() {
    it('exists', function() {
      const ctx = {
        routes: {
          someRoute: '123123'
        }
      };
      expect(notModule.prototype.getRoute.call(ctx, 'someRoute')).to.be.equal('123123');
    });
    it('doesnt exists', function() {
      const ctx = {
        routes: {}
      };
      expect(notModule.prototype.getRoute.call(ctx, 'someRoute')).to.be.null;
    });
  });


  describe('getLogic', function() {
    it('exists', function() {
      const ctx = {
        getLogicFile(){
          return {
            LogicUnit:{t:'123123'}
          };
        }
      };
      expect(notModule.prototype.getLogic.call(ctx, 'LogicUnit')).to.be.deep.equal({t:'123123'});
    });
    it('doesnt exists', function() {
      const ctx = {
        getLogicFile(){
          return {};
        }
      };
      expect(notModule.prototype.getLogic.call(ctx, 'LogicUnit')).to.be.null;
    });
  });


  describe('getLogicFile', function() {
    it('exists', function() {
      const ctx = {
        logics: {
          LogicUnit:{t:'123123'}
        }
      };
      expect(notModule.prototype.getLogicFile.call(ctx, 'LogicUnit')).to.be.deep.equal({t:'123123'});
    });

    it('doesnt exists', function() {
      const ctx = {
        logics: {}
      };
      expect(notModule.prototype.getLogicFile.call(ctx, 'LogicUnit')).to.be.null;
    });
  });


  describe('getModelSchema', function() {
    it('exists', function() {
      const ctx = {
        getModelFile(){
          return { modelName: '123123', thisSchema: {} };
        }
      };
      expect(notModule.prototype.getModelSchema.call(ctx, 'modelName')).to.be.deep.equal({});
    });

    it('file doesnt exists', function() {
      const ctx = {
        getModelFile(){
          return false;
        }
      };
      expect(notModule.prototype.getModelSchema.call(ctx, 'modelName')).to.be.null;
    });

    it('exists', function() {
      const ctx = {
        getModelFile(){
          return {};
        }
      };
      expect(notModule.prototype.getModelSchema.call(ctx, 'modelName')).to.be.null;
    });
  });

  describe('getModel', function() {
    it('exists', function() {
      const ctx = {
        getModelFile(){
          return { modelName: '123123', thisSchema: {} };
        }
      };
      expect(notModule.prototype.getModel.call(ctx, 'modelName')).to.be.deep.equal('123123');
    });

    it('file doesnt exists', function() {
      const ctx = {
        getModelFile(){
          return false;
        }
      };
      expect(notModule.prototype.getModel.call(ctx, 'modelName')).to.be.null;
    });

    it('exists', function() {
      const ctx = {
        getModelFile(){
          return {};
        }
      };
      expect(notModule.prototype.getModel.call(ctx, 'modelName')).to.be.null;
    });
  });

  describe('getModelFile', function() {
    it('exists', function() {
      const ctx = {
        models: {
          modelName: {g: 12}
        }
      };
      expect(notModule.prototype.getModelFile.call(ctx, 'modelName')).to.be.deep.equal({g: 12});
    });

    it('file doesnt exists', function() {
      const ctx = {
        models: {}
      };
      expect(notModule.prototype.getModelFile.call(ctx, 'modelName')).to.be.null;
    });

  });

  describe('getModelsStatuses', function() {
    it('exists', function() {
      const ctx = {
        models: {
          user: '123123'
        },
        getModelSchema() {
          return '321321';
        }
      };
      expect(notModule.prototype.getModelsStatuses.call(ctx)).to.be.deep.equal({
        user: '321321'
      });
    });
  });

  describe('getRoutesStatuses', function() {
    it('exists', function() {
      const ctx = {
        manifests: {
          user: {
            actions: {
              legacy: {}
            }
          },
          client: {}
        }
      };
      expect(notModule.prototype.getRoutesStatuses.call(ctx)).to.be.deep.equal({
        user: {
          legacy: {}
        }
      });
    });
  });

  //getActionsList
  describe('getActionsList', function() {
    it('exists', function() {
      const ctx = {
        manifests: {
          user: {
            actions: {
              legacy: {}
            }
          },
          client: {}
        }
      };
      expect(notModule.prototype.getActionsList.call(ctx)).to.be.deep.equal([
        'user//legacy'
      ]);
    });
  });
  //getStatus

  describe('getStatus', function() {
    it('exists', function() {
      const ctx = {
        getActionsList() {
          return ['route//action'];
        },
        models: {
          userModel: {}
        },
        routes: {
          userRoute: {}
        },
        forms: {
          'route//action':{}
        },
        getModelsStatuses() {
          return {
            user: {
              name: 'UserModel'
            }
          };
        },
        getRoutesStatuses() {
          return {
            user: {
              name: 'UserRoute'
            }
          };
        },
      };
      expect(notModule.prototype.getStatus.call(ctx)).to.be.deep.equal({
        models: {
          count: 1,
          list: ['userModel'],
          content: {
            user: {
              name: 'UserModel'
            }
          }
        },
        routes: {
          count: 1,
          list: ['userRoute'],
          content: {
            user: {
              name: 'UserRoute'
            }
          }
        },
        actions: {
          count: 1,
          list: ['route//action']
        },
        forms: {
          count: 1,
          list: ['route//action']
        }
      });
    });
  });
  //exec

  describe('exec', function() {
    it('!this.module', async() => {
      const ctx = {
        module: false,
        path: 'modPath'
      };
      const res = await notModule.prototype.exec.call(ctx);
      expect(res).to.be.false;
    });

    it('this.module; !methodName', async() => {
      const ctx = {
        module: {},
        path: 'modPath'
      };
      const res = await notModule.prototype.exec.call(ctx, 'methodName');
      expect(res).to.be.false;
    });

    it('this.module; methodName; sync', async() => {
      const ctx = {
        module: {
          methodName(){}
        },
        path: 'modPath'
      };
      const res = await notModule.prototype.exec.call(ctx, 'methodName');
      expect(res).to.be.true;
    });

    it('this.module; methodName; async', async() => {
      const ctx = {
        module: {
          async methodName(){}
        },
        path: 'modPath'
      };
      const res = await notModule.prototype.exec.call(ctx, 'methodName');
      expect(res).to.be.true;
    });

    it('this.module; methodName; sync throwed', async() => {
      const ctx = {
        module: {
          methodName(){throw new Error('error');}
        },
        path: 'modPath'
      };
      const res = await notModule.prototype.exec.call(ctx, 'methodName');
      expect(res).to.be.false;
    });


    it('this.module; methodName; async throwed', async() => {
      const ctx = {
        module: {
          async methodName(){throw new Error('error');}
        },
        path: 'modPath'
      };
      const res = await notModule.prototype.exec.call(ctx, 'methodName');
      expect(res).to.be.false;
    });
  });

  describe('createEmptyIfNotExistsRouteWSType', function() {
    it('collection and end-point type not exists', function() {
      const ctx = {
        routesWS: {
          servers: {}
        }
      };
      notModule.prototype.createEmptyIfNotExistsRouteWSType.call(ctx, {
        collectionType: 'servers',
        collectionName: 'unit',
        endPointType: 'request'
      });
      expect(ctx.routesWS.servers.unit).to.be.ok;
      expect(ctx.routesWS.servers.unit.request).to.be.ok;
    });

    it('collection and end-point type exists', function() {
      const ctx = {
        routesWS: {
          servers: {
            unit: {
              request: {}
            }
          }
        }
      };
      notModule.prototype.createEmptyIfNotExistsRouteWSType.call(ctx, {
        collectionType: 'servers',
        collectionName: 'unit',
        endPointType: 'request'
      });
      expect(ctx.routesWS.servers.unit).to.be.ok;
      expect(ctx.routesWS.servers.unit.request).to.be.ok;
    });

  });


  describe('setRouteWS', function() {
    it('collection and end-point type not exists', function() {
      const ctx = {
        routesWS: {
          servers: {
            unit: {
              request: {}
            }
          }
        }
      };
      const param = {
        collectionType: 'servers',
        collectionName: 'unit',
        endPointType: 'request',
        wsRouteName: 'route',
        action: 'action',
        func: () => {}
      };
      notModule.prototype.setRouteWS.call(ctx, param);
      expect(ctx.routesWS.servers.unit).to.be.ok;
      expect(ctx.routesWS.servers.unit.request).to.be.ok;
      expect(typeof ctx.routesWS.servers.unit.request[`${param.wsRouteName}//${param.action}`]).to.be.equal('function');
    });


  });


  require('./module')({
    expect
  });

  after(async() => {
    await mongoose.disconnect()
    await mongod.stop();
  });
});
