const notModuleRegistrator = require('../../src/manifest/registrator');

module.exports = (input)=>{
  const {expect} = input;

  describe('notModuleRegistrator', ()=>{

    it('setRegistrators', (done)=>{
      const param = 'query';
      const regs = [
        {
          run(t){ expect(t).to.be.equal(param); done();}
        }
      ];
      notModuleRegistrator.setRegistrators(regs);
      expect(notModuleRegistrator.registrators).to.be.deep.equal(regs);
      notModuleRegistrator.registrators[0].run(param);
    });

    it('resetRegistrators', ()=>{
      const regs = [];
      notModuleRegistrator.setRegistrators(regs);
      expect(notModuleRegistrator.registrators.length).to.be.equal(0);
      notModuleRegistrator.resetRegistrators();
      expect(notModuleRegistrator.registrators.length).to.be.equal(6);
    });

    it('with paths', ()=>{
      const nModule = {
        module:{
          paths: {}
        }
      };
      notModuleRegistrator.setRegistrators([]);
      const res = notModuleRegistrator.registerContent({nModule});
      expect(res).to.be.true;
    });


    it('without paths', function() {
      const nModule = { module:{}};
      const res = notModuleRegistrator.registerContent({nModule});
      expect(res).to.be.false;
    });

    require('./fields')(input);
    require('./models')(input);
    require('./logics')(input);
    require('./routes')(input);
    require('./routes.ws')(input);
    require('./locales')(input);
  });

};
