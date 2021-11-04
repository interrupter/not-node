const InitModules = require('../../src/init/modules');

module.exports = ({expect})=>{
  describe('Modules', ()=>{
    describe('run', ()=>{
      it('ok', async()=>{
        let executed = false;
        const master = {
          getApp(){
            return {
              execInModules(str){
                executed = str;
              }
            };
          }
        };
        await (new InitModules()).run({master});
        expect(executed).to.be.equal('initialize');
      });
    });
  });
};
