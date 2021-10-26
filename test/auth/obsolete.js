const obsolete = require('../../src/auth/obsolete');
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
