const mongoose = require('mongoose');

module.exports = ({
  Auth,
  expect
}) => {
  describe('Fields', () => {
    describe('getOwnerId', ()=>{
      it('data has ownerId as String', ()=>{
        const val = mongoose.Types.ObjectId().toString();
        const data = {
            ownerId: val
          };
        let result = Auth.getOwnerId(data);
        expect(result).to.deep.equal(val);
      });

      it('data has ownerId as ObjectId', ()=>{
        const val = mongoose.Types.ObjectId();
        const data = {
            ownerId: val
          };
        let result = Auth.getOwnerId(data);
        expect(result).to.deep.equal(val);
      });

      it('data hasn\'t ownerId', ()=>{
        const data = {};
        let result = Auth.getOwnerId(data);
        expect(result).to.deep.equal(undefined);
      });

      it('data undefined', ()=>{
        let result = Auth.getOwnerId(undefined);
        expect(result).to.deep.equal(undefined);
      });
    });

    describe('isOwner', ()=>{
      it('data.ownerId:ObjectId, user_id not empty:string, equal', ()=>{
        const owner = mongoose.Types.ObjectId();
        const data = {
            ownerId:owner
          };
        let result = Auth.isOwner(data, owner.toString());
        expect(result).to.deep.equal(true);
      });

      it('data.ownerId:ObjectId, user_id:ObjectId, not equal', ()=>{
        const data = {
            ownerId: mongoose.Types.ObjectId()
          };
        let result = Auth.isOwner(data, mongoose.Types.ObjectId());
        expect(result).to.deep.equal(false);
      });

      it('data.ownerId not defined, user_id:ObjectId, not equal', ()=>{
        const data = {};
        let result = Auth.isOwner(data, mongoose.Types.ObjectId());
        expect(result).to.deep.equal(false);
      });

      it('data.ownerId:undefined, user_id:undefined, not equal', ()=>{
        const data = {ownerId: undefined};
        let result = Auth.isOwner(data, undefined);
        expect(result).to.deep.equal(false);
      });
    });

    describe('ruleIsWildcard', ()=>{
      it('undefined', ()=>{
        const rule = undefined;
        let result = Auth.ruleIsWildcard(rule);
        expect(result).to.deep.equal(false);
      });

      it('"*"', ()=>{
        const rule = '*';
        let result = Auth.ruleIsWildcard(rule);
        expect(result).to.deep.equal(true);
      });

      it('""', ()=>{
        const rule = '';
        let result = Auth.ruleIsWildcard(rule);
        expect(result).to.deep.equal(false);
      });

      it('[]', ()=>{
        const rule = [];
        let result = Auth.ruleIsWildcard(rule);
        expect(result).to.deep.equal(false);
      });

      it('["*"]', ()=>{
        const rule = ['*'];
        let result = Auth.ruleIsWildcard(rule);
        expect(result).to.deep.equal(true);
      });
    });


    describe('fieldIsSafe', ()=>{
      it('field.safe.action:Array<string>, action:string, roles:Array<string>, special:undefined', ()=>{
        const field = {
            safe:{
              update: ['root']
            }
          },
          action = 'update',
          roles = ['root'],
          special = undefined;
        let result = Auth.fieldIsSafe(field, action,roles, special);
        expect(result).to.deep.equal(true);
      });

      it('field.safe.action:not defined, action:string, roles:Array<string>, special:undefined', ()=>{
        const field = {
            safe:{}
          },
          action = 'update',
          roles = ['root'],
          special = undefined;
        let result = Auth.fieldIsSafe(field, action,roles, special);
        expect(result).to.deep.equal(false);
      });

      it('field.safe.action:wildcard, action:string, roles:Array<string>, special:undefined', ()=>{
        const field = {
            safe:{
              update: "*"
            }
          },
          action = 'update',
          roles = ['root'],
          special = undefined;
        let result = Auth.fieldIsSafe(field, action,roles, special);
        expect(result).to.deep.equal(true);
      });

      it('field.safe: not defined, action:string, roles:Array<string>, special:undefined', ()=>{
        const field = {},
          action = 'update',
          roles = ['root'],
          special = undefined;
        let result = Auth.fieldIsSafe(field, action,roles, special);
        expect(result).to.deep.equal(false);
      });

      it('field.safe.action:string but not wildcard , action:string, roles:Array<string>, special:undefined', ()=>{
        const field = {
          safe:{
            update: 'root'
          }
        },
          action = 'update',
          roles = ['root'],
          special = undefined;
        let result = Auth.fieldIsSafe(field, action,roles, special);
        expect(result).to.deep.equal(false);
      });

      it('field.safe.action:Array<string> with special, action:string, roles:Array<string>, special:Array<string>', ()=>{
        const field = {
          safe:{
            update: ['root', '@owner']
          }
        },
          action = 'update',
          roles = ['guest'],
          special = ['@owner'];
        let result = Auth.fieldIsSafe(field, action,roles, special);
        expect(result).to.deep.equal(true);
      });

      it('field.safe.action:Array<string> with special, action:string, roles:Array<string>, special:Array<string>', ()=>{
        const field = {
          safe:{
            update: ['root', '@owner']
          }
        },
          action = 'update',
          roles = ['guest'],
          special = ['@system'];
        let result = Auth.fieldIsSafe(field, action,roles, special);
        expect(result).to.deep.equal(false);
      });
    });

    describe('createSpecial', ()=>{
      it('owner - true, system - true', ()=>{
        let result = Auth.createSpecial(true, true);
        expect(result).to.deep.equal(['@owner', '@system']);
      });

      it('owner - false, system - false', ()=>{
        let result = Auth.createSpecial(false, false);
        expect(result).to.deep.equal([]);
      });
    });

    const schema_1 = {
      name:{
        safe: {
          'read': '*',
          'update': ['@owner', '@system', 'root']
        }
      },
      email:{
        safe: {
          'read': ['@owner', '@system', 'root', 'admin', 'manager'],
          'update': ['@owner', '@system', 'root']
        }
      },
      country:{
        safe: {
          'read': '*',
          'update': ['@owner']
        }
      },
      active:{
        safe: {
          'read': '*',
          'update': ['@system', 'root', 'admin']
        }
      },
      legacy:{},
      banned:{safe:{}},
      ID:1
    };

    const data_1 = {
      name: 'alex',
      email: 'alex@mail.net',
      country: 'dr',
      active: true
    };

    const data_2 = {
      name: 'alex',
      country: 'dr',
      active: true
    };

    describe('getSafeFieldsForRoleAction', ()=>{
      it('guest performing reading', ()=>{
        let result = Auth.getSafeFieldsForRoleAction(schema_1, 'read', ['guest'], false, false);
        expect(result).to.deep.equal(['name', 'country', 'active']);
      });

      it('root performing update', ()=>{
        let result = Auth.getSafeFieldsForRoleAction(schema_1, 'update', ['root'], false, false);
        expect(result).to.deep.equal(['name', 'email', 'active']);
      });

      it('@owner performing update', ()=>{
        let result = Auth.getSafeFieldsForRoleAction(schema_1, 'update', ['user'], true, false);
        expect(result).to.deep.equal(['name', 'email', 'country']);
      });


      it('@system performing update', ()=>{
        let result = Auth.getSafeFieldsForRoleAction(schema_1, 'update', ['user'], false, true);
        expect(result).to.deep.equal(['name', 'email', 'active']);
      });
    });


    describe('extractSafeFields', ()=>{
      it('guest performing reading', ()=>{
        let result = Auth.extractSafeFields(schema_1, 'read', data_1, ['guest'], null);
        expect(result).to.deep.equal({
          name: 'alex',
          country: 'dr',
          active: true
        });
      });

      it('guest performing reading, data has some fields not defined', ()=>{
        let result = Auth.extractSafeFields(schema_1, 'read', data_2, ['root'], null);
        expect(result).to.deep.equal({
          name: 'alex',
          country: 'dr',
          active: true
        });
      });

    });

  });

};
