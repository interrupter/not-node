module.exports = ({
  Auth,
  expect
}) => {
  describe('Rules', () => {
    describe('compareAuthStatus', ()=>{
      it('rule.user = true, auth = false ;rule has obsolete field "user"', ()=>{
        let result = Auth.compareAuthStatus({user:true}, false);
        expect(result).to.deep.equal(false);
      });

      it('rule.user = true, auth = true ;rule has obsolete field "user"', ()=>{
        let result = Auth.compareAuthStatus({user:true}, true);
        expect(result).to.deep.equal(true);
      });
    });
  });

};
