const mock = require('mock-require');

class FakeInform{};



const InitInformer = require('../../src/init/informer');

module.exports = ({expect})=>{
  describe('Informer', ()=>{
    describe('run', ()=>{
      it('ok', async()=>{
        mock('not-inform', { Inform: FakeInform});
        const fakeApp = {
          informer: false
        };
        const master = {
          getApp(){
            return fakeApp;
          }
        };
        await (new InitInformer()).run({master});
        expect(fakeApp.informer).to.be.instanceof(FakeInform);
      });
    });

  });

};
