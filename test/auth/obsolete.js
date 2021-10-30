const obsolete = require('../../src/obsolete');
module.exports = () => {
  describe('Obsolete params warnings', () => {
    it('user', ()=>{
      const obj = {
          user: false
        };
      obsolete(obj);
    });

  });

};
