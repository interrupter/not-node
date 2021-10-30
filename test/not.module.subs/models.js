const path = require('path');
const notModuleRegistratorModels = require('../../src/manifest/registrator/models');

module.exports = ({
  expect
}) => {
  describe('notModuleRegistratorModels', () => {

    describe('getPath', () => {
      it('module paths(models)', function() {
        const testPath = 'path_to_models';
        const ctx = {
          module: {
            paths: {
              models: testPath
            }
          }
        };
        const pathTo = notModuleRegistratorModels.getPath(ctx);
        expect(pathTo).to.be.equal(testPath);
      });
    });

    describe('run', function() {
      const modelsPath = path.join(__dirname, 'module/models');
      it('path to models is not defined', function() {
        const ctx = {};
        const param = {
          nModule:{
            module:{
              paths: {
                //models:modelsPath
              }
            }
          }
        };
        const res = notModuleRegistratorModels.prototype.run.call(ctx, param);
        expect(res).to.be.false;
      });

      it('paths to models is defined', function() {
        let findAllCalled = false;
        const ctx = {
          findAll(){
            findAllCalled = true;
          }
        };
        const param = {
          nModule:{
            module:{
              paths: {
                models:modelsPath
              }
            }
          }
        };
        const res = notModuleRegistratorModels.prototype.run.call(ctx, param);
        expect(res).to.be.true;
        expect(findAllCalled).to.be.true;
      });

    });


    describe('extend', function() {
      it('notApp exists', function() {
        const model = {
          filename: 'filename'
        };
        const ctx = {};
        const param = {
          model,
          modelName: '',
          fromPath: '',
          nModule: {
            appIsSet(){return true;},
            getApp(){
              return {
                getModel(){},
                getModelFile(){},
                getModelSchema(){},
                getModule(){},
              };
            }
          }
        };
        notModuleRegistratorModels.prototype.extend.call(ctx, param);

        expect(typeof model.getModel).to.be.equal('function');
        expect(typeof model.getModelFile).to.be.equal('function');
        expect(typeof model.getModelSchema).to.be.equal('function');
        expect(typeof model.getModule).to.be.equal('function');

        expect(typeof model.log.log).to.be.equal('function');
        expect(typeof model.log.error).to.be.equal('function');
        expect(typeof model.log.debug).to.be.equal('function');

        expect(model).to.have.keys(['getThisModule', 'filename', 'log', 'getModel', 'getModelFile', 'getModelSchema', 'getModule']);
        expect(model.getThisModule()).to.be.deep.equal(param.nModule);
      });

      it('notApp doesnt exists', function() {
        const model = {
          filename: 'filename'
        };
        const ctx = {};
        const param = {
          model,
          modelName: '',
          fromPath: '',
          nModule: {
            appIsSet(){return false;},
            getApp(){
              return {
                getModel(){},
                getModelFile(){},
                getModelSchema(){},
                getModule(){},
              };
            }
          }
        };
        notModuleRegistratorModels.prototype.extend.call(ctx, param);

        expect(typeof model.log.log).to.be.equal('function');
        expect(typeof model.log.error).to.be.equal('function');
        expect(typeof model.log.debug).to.be.equal('function');

        expect(model).to.have.keys(['getThisModule', 'filename', 'log']);
        expect(model.getThisModule()).to.be.deep.equal(param.nModule);
      });
    });

  });





};
