const path = require('path');
const notModuleRegistratorRoutes = require('../../src/manifest/registrator/routes');

module.exports = ({
  expect
}) => {
  describe('notModuleRegistratorRoutes', () => {
    const routesPath = path.join(__dirname, '../module/routes');
    describe('getPath', () => {
      it('module paths(routes)', function() {
        const testPath = 'path_to_routes';
        const ctx = {
          module: {
            paths: {
              routes: testPath
            }
          }
        };
        const pathTo = notModuleRegistratorRoutes.getPath(ctx);
        expect(pathTo).to.be.equal(testPath);
      });
    });

    describe('run', () => {
      it('path to routes is not defined', function() {
        const ctx = {
          findAll(){}
        };
        const param = {
          nModule:{
            module:{ paths:{} }
          }
        };
        const res  = notModuleRegistratorRoutes.prototype.run.call(ctx, param);
        expect(res).to.be.false;
      });

      it('paths to routes is defined', function() {
        const ctx = {
          findAll(){}
        };
        const param = {
          nModule:{
            module:{ paths:{routes: 'path_to_routes'} }
          }
        };
        const res  = notModuleRegistratorRoutes.prototype.run.call(ctx, param);
        expect(res).to.be.true;
      });
    });


    describe('tryRouteFile', function() {
      it('route file doesnt exists', function() {
        const res = notModuleRegistratorRoutes.tryRouteFile({
          srcDir: routesPath,
          routeBasename: 'jingle'
        });
        expect(res).to.be.false;
      });
    });

    describe('tryRouteManifestFile', function() {
      it('route file doesnt exists', function() {
        const res = notModuleRegistratorRoutes.tryRouteManifestFile({
          srcDir: routesPath,
          file: 'jingle'
        });
        expect(res).to.be.false;
      });
    });


    describe('tryWSRouteFile', function() {

      it('route file doesnt exists', function() {
        const res = notModuleRegistratorRoutes.tryWSRouteFile({
          srcDir: routesPath,
          routeBasename: 'jingle'
        });
        expect(res).to.be.false;
      });
    });


    describe('findOne', function() {
      it('route manifest file doesnt exists', function() {
        const ctx = {};
        const param = {
          nModule: {},
          srcDir: routesPath,
          file: 'mangle.manifest.js'
        };
        const res = notModuleRegistratorRoutes.prototype.findOne.call(ctx, param);
        expect(res).to.be.false;
      });

      it('route and ws-route files doesnt exists', function() {
        const ctx = {};
        const param = {
          nModule: {},
          srcDir: routesPath,
          file: 'jingle.manifest.js'
        };
        const res = notModuleRegistratorRoutes.prototype.findOne.call(ctx, param);
        expect(res).to.be.false;
      });

      it('route - exists; wsRoute - !exists;', function() {
        const ctx = {};
        const param = {
          nModule: {},
          srcDir: routesPath,
          file: 'icon.manifest.js'
        };
        const res = notModuleRegistratorRoutes.prototype.findOne.call(ctx, param);
        expect(res).to.be.false;
      });

      it('route - !exists; wsRoute - exists;', function() {
        const ctx = {
          registerManifestAndRoutes({wsRoute}){
            expect(wsRoute).to.be.ok;
            expect(wsRoute.clients).to.have.keys(['main']);
          }
        };
        const param = {
          nModule: {},
          srcDir: routesPath,
          file: 'logo.manifest.js'
        };
        const res = notModuleRegistratorRoutes.prototype.findOne.call(ctx, param);
        expect(res).to.be.true;
      });

    });


    describe('registerManifestAndRoutes', function() {
      it('route not exists, ws end-points exists', function() {
        let i = 0;
        notModuleRegistratorRoutes.prototype.registerManifestAndRoutes.call({
          registerRoute() {
            i++;
          },
          registerWSRoute() {
            i++
          }
        }, {
          nModule:{
            setManifest(){},
          },
          route: false,
          wsRoute: true
        });
        expect(i).to.be.equal(1);
      });

      it('route exists, ws end-points not exists', function() {
        let i = 0;
        notModuleRegistratorRoutes.prototype.registerManifestAndRoutes.call({
          registerRoute() {
            i++;
          },
          registerWSRoute() {
            i++
          }
        }, {
          nModule:{
            setManifest(){},
          },
          route: {thisRouteName: 'asdf'},
          wsRoute: false
        });
        expect(i).to.be.equal(1);
      });

      it('route exists, ws end-points exists', function() {
        let i = 0;
        notModuleRegistratorRoutes.prototype.registerManifestAndRoutes.call({
          registerRoute() {
            i++;
          },
          registerWSRoute() {
            i++
          }
        }, {
          nModule:{
            setManifest(){},
          },
          route: {thisRouteName: 'asdf'},
          wsRoute: {thisRouteName: 'asdf.ws'}
        });
        expect(i).to.be.equal(2);
      });
    });



    describe('registerRoute', function() {
      it('notApp exists', function() {
        const route = {
          thisRouteName: 'filename',
          filename: 'filename'
        };
        const ctx = {};
        const param = {
          route,
          routeName: '',
          fromPath: '',
          nModule: {
            setRoute(...params){
              expect(params[0]).to.be.equal(route.thisRouteName);
              expect(params[1]).to.be.deep.equal(route);
            },
            appIsSet(){return true;},
            getApp(){
              return {
                getModel(){},
                getModelFile(){},
                getModelSchema(){},
                getLogic(){},
                getLogicFile(){},
                getModule(){},
              };
            }
          }
        };
        notModuleRegistratorRoutes.prototype.registerRoute.call(ctx, param);
        expect(typeof route.getLogic).to.be.equal('function');
        expect(typeof route.getLogicFile).to.be.equal('function');
        expect(typeof route.getModel).to.be.equal('function');
        expect(typeof route.getModelFile).to.be.equal('function');
        expect(typeof route.getModelSchema).to.be.equal('function');
        expect(typeof route.getModule).to.be.equal('function');
        expect(typeof route.log.log).to.be.equal('function');
        expect(typeof route.log.error).to.be.equal('function');
        expect(typeof route.log.debug).to.be.equal('function');

        expect(route).to.have.keys(['getThisModule', 'thisRouteName','filename', 'log', 'getModel', 'getModelFile', 'getModelSchema', 'getLogic', 'getLogicFile', 'getModule']);
        expect(route.getThisModule()).to.be.deep.equal(param.nModule);
      });

      it('notApp doesnt exists', function() {
        const route = {
          thisRouteName: 'filename',
          filename: 'filename'
        };
        const ctx = {};
        const param = {
          route,
          routeName: '',
          fromPath: '',
          nModule: {
            setRoute(...params){
              expect(params[0]).to.be.equal(route.thisRouteName);
              expect(params[1]).to.be.deep.equal(route);
            },
            appIsSet(){return false;},
            getApp(){
              return {
                getModel(){},
                getModelFile(){},
                getModelSchema(){},
                getLogic(){},
                getLogicFile(){},
                getModule(){},
              };
            }
          }
        };
        notModuleRegistratorRoutes.prototype.registerRoute.call(ctx, param);

        expect(typeof route.log.log).to.be.equal('function');
        expect(typeof route.log.error).to.be.equal('function');
        expect(typeof route.log.debug).to.be.equal('function');

        expect(route).to.have.keys(['getThisModule', 'thisRouteName', 'filename', 'log']);
        expect(route.getThisModule()).to.be.deep.equal(param.nModule);
      });
    });



  });


};
