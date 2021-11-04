const InitMethodOverride = require('../../src/init/methodoverride');
const mock = require('mock-require');

module.exports = ({
  expect
}) => {
  describe('MethodOverride', () => {
    describe('run', () => {
      it('run, middleware returned and set', async () => {
        let useCalled = false;
        let middlewareGeneratorCalled = false;
        mock('method-override', ()=>{
          middlewareGeneratorCalled = true;
          return ()=>{};
        });
        const master = {
          getServer() {
            return {
              use(func) {
                expect(typeof func).to.be.equal('function');
                useCalled = true;
              }
            };
          }
        };
        await (new InitMethodOverride()).run({master});
        expect(useCalled).to.be.true;
        expect(middlewareGeneratorCalled).to.be.true;
      });
    });
    after(()=>{
      mock.stop('method-override');
    });
  });
};
