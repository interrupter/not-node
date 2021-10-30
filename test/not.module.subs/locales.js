const notModuleRegistratorLocales = require('../../src/manifest/registrator/locales');

module.exports = ({
  expect
}) => {
  describe('notModuleRegistratorLocales', () => {
    describe('getPath', () => {
      it('module paths(locales)', function() {
        const testPath = 'path_to_locales';
        const ctx = {
          module: {
            paths: {
              locales: testPath
            }
          }
        };
        const pathTo = notModuleRegistratorLocales.getPath(ctx);
        expect(pathTo).to.be.equal(testPath);
      });
    });

    describe('run', () => {
      it('path exists', function() {
        const testPath = 'path_to_locales';
        const nModule = {
          module: {
            paths: {
              locales: testPath
            }
          },
          getName(){
            return 'test'
          }
        };
        const ctx = {};
        const res = notModuleRegistratorLocales.prototype.run.call(ctx, {nModule});
        expect(res).to.be.true;
      });
    });

  });
};
