const path = require('path');

const notModuleRegistratorLogics = require('../../src/manifest/registrator/logics');

module.exports = ({
  expect
}) => {
  describe('notModuleRegistratorLogics', () => {

    describe('getPath', () => {
      it('module paths(logics)', function() {
        const testPath = 'path_to_logics';
        const ctx = {
          module: {
            paths: {
              logics: testPath
            }
          }
        };
        const pathTo = notModuleRegistratorLogics.getPath(ctx);
        expect(pathTo).to.be.equal(testPath);
      });
    });


    describe('getName', () => {
      it('get logics name, thisLogicName is set', function() {
        const param = {
          logic: {
            thisLogicName: 'thisLogicName'
          },
          file: 'filename'
        };
        const name = notModuleRegistratorLogics.getName(param);
        expect(name).to.be.equal('thisLogicName');
      });

      it('get logics name, thisLogicName is not set', function() {
        const param = {
          logic: {},
          file: 'filename'
        };
        const name = notModuleRegistratorLogics.getName(param);
        expect(name).to.be.equal('filename');
      });
    });

    describe('run', () => {
      const logicsPath = path.join(__dirname, '../testies/module/logics');
      it('path to logics is not defined', function() {
        const ctx = {
          findAll(){}
        };
        const param = {
          nModule:{
            module:{ paths:{} }
          }
        };
        const res  = notModuleRegistratorLogics.prototype.run.call(ctx, param);
        expect(res).to.be.false;

      });

      it('paths to logics is defined', function() {
        const ctx = {
          findAll(){}
        };
        const param = {
          nModule:{
            module:{ paths:{logics: 'path_to_logics'} }
          }
        };
        const res  = notModuleRegistratorLogics.prototype.run.call(ctx, param);
        expect(res).to.be.true;
      });
    });

    describe('extend', function() {
      it('notApp exists', function() {
        const logic = {
          filename: 'filename'
        };
        const ctx = {};
        const param = {
          logic,
          logicName: '',
          fromPath: '',
          nModule: {
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
        notModuleRegistratorLogics.prototype.extend.call(ctx, param);

        expect(typeof logic.getModel).to.be.equal('function');
        expect(typeof logic.getModelFile).to.be.equal('function');
        expect(typeof logic.getModelSchema).to.be.equal('function');
        expect(typeof logic.getLogic).to.be.equal('function');
        expect(typeof logic.getLogicFile).to.be.equal('function');
        expect(typeof logic.getModule).to.be.equal('function');

        expect(typeof logic.log.log).to.be.equal('function');
        expect(typeof logic.log.error).to.be.equal('function');
        expect(typeof logic.log.debug).to.be.equal('function');

        expect(logic).to.have.keys(['getThisModule', 'filename', 'log', 'getModel', 'getModelFile', 'getModelSchema', 'getLogic', 'getLogicFile', 'getModule']);
        expect(logic.getThisModule()).to.be.deep.equal(param.nModule);
      });

      it('notApp doesnt exists', function() {
        const logic = {
          filename: 'filename'
        };
        const ctx = {};
        const param = {
          logic,
          logicName: '',
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
        notModuleRegistratorLogics.prototype.extend.call(ctx, param);

        expect(typeof logic.log.log).to.be.equal('function');
        expect(typeof logic.log.error).to.be.equal('function');
        expect(typeof logic.log.debug).to.be.equal('function');

        expect(logic).to.have.keys(['getThisModule', 'filename', 'log']);
        expect(logic.getThisModule()).to.be.deep.equal(param.nModule);
      });
    });


    describe('register', () => {
      const logicsPath = path.join(__dirname, '../testies/module/logics/one.js');
      it('file exists', function(done) {
        const ctx = {
          extend(){}
        };
        const param = {
          nModule:{
            module:{ paths:{} },
            setLogic(logicName, logic){
              expect(logicName).to.be.equal('One');
              done();
            }
          },
          fromPath: logicsPath,
          file: 'one.js'
        };
        notModuleRegistratorLogics.prototype.register.call(ctx, param);
        expect(res).to.be.false;
      });
    });


    describe('findAll', () => {
      const logicsPath = path.join(__dirname, '../testies/module/logics');
      it('path exists', function() {
        let result = [];
        const ctx = {
          register({nModule, fromPath, file}){
            result.push(file);
          }
        };
        const param = {
          nModule:{
            module:{ paths:{} },
          },
          srcDir: logicsPath
        };
        notModuleRegistratorLogics.prototype.findAll.call(ctx, param);
        expect(result.sort()).to.be.deep.equal(['one.js', 'two.js', 'three.js'].sort());
      });
    });

  });
};
