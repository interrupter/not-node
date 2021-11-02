const FIELDS = require('../../src/fields');
const path = require('path');
const notModuleRegistratorFields = require('../../src/manifest/registrator/fields');

module.exports = ({
  expect
}) => {
  describe('notModuleRegistratorFields', () => {
    describe('getPath', () => {
      it('module paths(fields)', function() {
        const testPath = 'path_to_fields';
        const ctx = {
          module: {
            paths: {
              fields: testPath
            }
          }
        };
        const pathTo = notModuleRegistratorFields.getPath(ctx);
        expect(pathTo).to.be.equal(testPath);
      });
    });

    describe('run', function() {
      it('path to fields is not defined', function() {
        const ctx = {
          findAll() {}
        };
        const param = {
          nModule: {
            module: {
              paths: {}
            }
          }
        };
        const res = notModuleRegistratorFields.prototype.run.call(ctx, param);
        expect(res).to.be.false;
      });

      it('paths to fields is defined', function() {
        const ctx = {
          findAll() {}
        };
        const param = {
          nModule: {
            module: {
              paths: {
                fields: 'some fields'
              }
            }
          }
        };
        const res = notModuleRegistratorFields.prototype.run.call(ctx, param);
        expect(res).to.be.true;
      });
    });


    it('findAll', function() {
      const logicsPath = path.join(__dirname, '../testies/module/fields');
      const list = [
        path.resolve(__dirname, '../testies/module/fields/collection.js'),
        path.resolve(__dirname, '../testies/module/fields/single.js')
      ].sort();
      let result = [];
      const ctx = {
        register({
          fromPath
        }) {
          result.push(fromPath);
        }
      };
      const param = {
        nModule: {},
        srcDir: logicsPath
      };
      notModuleRegistratorFields.prototype.findAll.call(ctx, param);
      result.sort();
      expect(result).to.be.deep.equal(list);
    });


    describe('register', function() {
      it('file is lib', (done) => {
        const ctx = {
          registerFields({
            lib,
            fieldsImportRules
          }) {
            expect(fieldsImportRules).to.be.deep.equal({
              one: true
            });
            expect(lib).to.be.have.keys(['collectionItem']);
            done();
          }
        };
        const param = {
          nModule: {
            fieldsImportRules: {
              one: true
            }
          },
          fromPath: path.resolve(__dirname, '../testies/module/fields/collection.js')
        };
        notModuleRegistratorFields.prototype.register.call(ctx, param);
        expect(result).to.be.deep.equal(list);
      });

      it('file is single field', (done) => {
        const ctx = {
          registerField({
            name,
            field,
            fieldsImportRules
          }) {
            expect(fieldsImportRules).to.be.deep.equal({
              one: true
            });
            expect(field).to.be.have.keys(['ui', 'model']);
            expect(name).to.be.equal('single');
            done();
          }
        };
        const param = {
          nModule: {
            fieldsImportRules: {
              one: true
            }
          },
          fromPath: path.resolve(__dirname, '../testies/module/fields/single.js')
        };
        notModuleRegistratorFields.prototype.register.call(ctx, param);
        expect(result).to.be.deep.equal(list);
      });

    });

    describe('registerFields', function() {
      it('file is a lib', () => {
        const ctx = {};
        const param = {
          fieldsImportRules:{},
          lib: require(path.resolve(__dirname, '../testies/module/fields/collection.js')).FIELDS
        };
        notModuleRegistratorFields.prototype.registerFields.call(ctx, param);
        expect(Object.keys(FIELDS.LIB).includes('collectionItem')).to.be.true;
      });
    });

    describe('registerField', function() {
      it('file is a single field', () => {
        const ctx = {};
        const param = {
          name: 'single',
          field: require(path.resolve(__dirname, '../testies/module/fields/single.js')),
          fieldsImportRules:{},
        };
        notModuleRegistratorFields.prototype.registerField.call(ctx, param);
        expect(Object.keys(FIELDS.LIB).includes('single')).to.be.true;
      });

    });

  });
};
