const expect = require("chai").expect,
    auth = require("../src/auth/auth"),
    HttpError = require('../src/error').Http;

describe("Auth", function() {
  describe("intersect_safe", function() {
    it("a - array, b - array", function() {
        var res = auth.intersect_safe(['safe1', 'safe', 'unsafebutpresented'], ['unsafe','safe', 'safeguard']);
        expect(res).to.deep.equal(['safe']);
    });

    it("a - array, b - array with more length", function() {
        var res = auth.intersect_safe(['safe1', 'safe', 'unsafebutpresented'], ['unsafe','safeasdfjsdjkf','safe', 'safeguard']);
        expect(res).to.deep.equal(['safe']);
    });

    it("a - null, b - null", function() {
        var res = auth.intersect_safe(null, null);
        expect(res).to.deep.equal([]);
    });

    it("intersection of a and b equals empty", function() {
        var res = auth.intersect_safe(['safe1'], ['safe2']);
        expect(res).to.deep.equal([]);
    });

    it("intersection of a = b", function() {
        var res = auth.intersect_safe(['safe'], ['safe']);
        expect(res).to.deep.equal(['safe']);
    });
  });

  describe("ifUser", function() {
    it("check if user exists - true", function() {
        var t = {
            session:{
                user: true
            }
        }
        var res = auth.ifUser(t);
        expect(res).to.eql(true);
    });
    it("check if user exists - false", function() {
        var t = {
            session:{}
        }
        var res = auth.ifUser(t);
        expect(res).to.eql(false);
    });
  });

  describe("checkUser", function() {
    it("check if user exists and continues", function() {
        const req = {
                session: {
                    user: true
                }
            },
            next = function(val){return val;};
        let result = auth.checkUser(req, false, next);
        expect(result).to.deep.equal();
    });

    it("check if user exists and throw exception", function() {
        const req = {
                session: {
                    user: false
                }
            },
            next = function(val){return val;};
        let result = auth.checkUser(req, false, next);
        expect(result).to.deep.equal(new HttpError(401, "Вы не авторизованы"));
    });
  });

  describe("ifAdmin", function() {
      it("check if user admin - true", function() {
          var t = {
              session:{
                  user: true,
                  userRole: 'root'
              }
          }
          var res = auth.ifAdmin(t);
          expect(res).to.eql(true);
      });
      it("check if user admin - false", function() {
          var t = {
              session:{
                  user: true
              }
          }
          var res = auth.ifAdmin(t);
          expect(res).to.eql(false);
      });
  });

  describe("checkAdmin", function() {
    it("check if admin exists and continues", function() {
        const req = {
                session: {
                    user: true,
                    userRole: auth.DEFAULT_USER_ROLE_FOR_ADMIN
                }
            },
            next = function(val){return val;};
        let result = auth.checkAdmin(req, false, next);
        expect(result).to.deep.equal();
    });

    it("check if admin exists and throw exception", function() {
        const req = {
                session: {
                    user: true,
                    userRole: 'manager'
                }
            },
            next = function(val){return val;};
        let result = auth.checkAdmin(req, false, next);
        expect(result).to.deep.equal(new HttpError(401, "Вы не авторизованы " + req.session.user + ':' + req.session.userRole));
    });
  });

  describe("getRole", function() {
      it("get role - root", function() {
          var t = {
              session:{
                  user: true,
                  userRole: 'root'
              }
          }
          var res = auth.getRole(t);
          expect(res).to.eql('root');
      });
      it("get role - undefined", function() {
          var t = {
              session:{
                  user: true
              }
          }
          var res = auth.getRole(t);
          expect(res).to.eql(undefined);
      });
  });

  describe("compareRoles", function() {
      it("user - guest, action - root", function() {
          var res = auth.compareRoles('guest', 'root');
          expect(res).to.deep.equal(false);
      });

      it("user - guest, action - guest", function() {
          var res = auth.compareRoles('guest', 'guest');
          expect(res).to.deep.equal(true);
      });

      it("user - guest, action - [root, admin]", function() {
          var res = auth.compareRoles('guest', ['root', 'admin']);
          expect(res).to.deep.equal(false);
      });

      it("user - guest, action - [root, admin, guest]", function() {
          var res = auth.compareRoles('guest', ['root', 'admin', 'guest']);
          expect(res).to.deep.equal(true);
      });

      it("user - [user, notActivated], action - notActivated", function() {
          var res = auth.compareRoles(['user', 'notActivated'], 'notActivated');
          expect(res).to.deep.equal(true);
      });

      it("user - [user, notActivated, jailed], action - [root, manager]", function() {
          var res = auth.compareRoles(['user', 'notActivated', 'jailed'], ['root', 'manager']);
          expect(res).to.deep.equal(false);
      });

  });

  describe("checkRoleBuilder", function() {
    it("Role", function() {
        const role = 'user',
            req = {
                session: {
                    user: true,
                    userRole: 'user'
                }
            },
            next = function(val){return val;};
        let resultFunction = auth.checkRoleBuilder(role),
            result = resultFunction(req, false, next);
        expect(result).to.deep.equal();
    });

    it("Role with error", function() {
        const role = 'manager',
            req = {
                session: {
                    user: true,
                    userRole: 'user'
                }
            },
            next = function(val){return val;};
        let resultFunction = auth.checkRoleBuilder(role),
            result = resultFunction(req, false, next);
        expect(result).to.deep.equal(new HttpError(401, "Вы не авторизованы " + req.session.user + ':' + req.session.userRole));
    });
  });

  describe("checkCredentials", function() {
    const rule = {
        admin: true,
        role: 'root',
        auth: true
    };
    it("rule (admin, root, authentificated),  auth - true, role - root, admin - true ", function() {
        const res = auth.checkCredentials(rule, true, 'root', true);
        expect(res).to.deep.equal(true);
    });

    it("rule (admin, root, authentificated),  auth - true, role - root, admin - false ", function() {
        const res = auth.checkCredentials(rule, true, 'root', false);
        expect(res).to.deep.equal(false);
    });

    it("rule - empty,  auth - true, role - root, admin - false ", function() {
        const res = auth.checkCredentials({}, true, 'root', false);
        expect(res).to.deep.equal(true);
    });

    it("rule - null,  auth - true, role - root, admin - false ", function() {
        const res = auth.checkCredentials(null, true, 'root', false);
        expect(res).to.deep.equal(false);
    });


    it("rule - (auth),  auth - true, role - root, admin - false ", function() {
        const res = auth.checkCredentials({auth: true}, true, 'root', false);
        expect(res).to.deep.equal(true);
    });

    it("rule - (role: 'notActivated'),  auth - true, role - root, admin - false ", function() {
        const res = auth.checkCredentials({role: 'notActivated'}, true, 'root', false);
        expect(res).to.deep.equal(false);
    });

    it("rule - (role: 'user', auth),  auth - true, role - user, admin - false ", function() {
        const res = auth.checkCredentials({role: 'user', auth: true}, true, 'user', false);
        expect(res).to.deep.equal(true);
    });

    it("rule - (role: 'user', !auth),  auth - false, role - user, admin - false ", function() {
        const res = auth.checkCredentials({role: 'user', auth: false}, false, 'user', false);
        expect(res).to.deep.equal(true);
    });

    it("rule - (role: 'user'),  auth - false, role - user, admin - false ", function() {
        const res = auth.checkCredentials({role: 'user'}, false, 'user', false);
        expect(res).to.deep.equal(true);
    });

    it("rule - (auth),  auth - true, role - user, admin - false ", function() {
        const res = auth.checkCredentials({auth: true}, true, 'user', false);
        expect(res).to.deep.equal(true);
    });

    it("rule - (!auth),  auth - false, role - user, admin - false ", function() {
        const res = auth.checkCredentials({auth: false}, false, 'user', false);
        expect(res).to.deep.equal(true);
    });

    it("rule - (auth),  auth - false, role - user, admin - false ", function() {
        const res = auth.checkCredentials({auth: true}, false, 'user', false);
        expect(res).to.deep.equal(false);
    });

    it("rule - (!auth),  auth - false, role - user, admin - true ", function() {
        const res = auth.checkCredentials({auth: false}, false, 'user', true);
        expect(res).to.deep.equal(true);
    });

    it("rule - (admin),  auth - false, role - user, admin - true ", function() {
        const res = auth.checkCredentials({admin: true}, false, 'user', true);
        expect(res).to.deep.equal(true);
    });

    it("rule - (!auth, 'notActivated', false),  auth - false, role - notActivated, admin - false ", function() {
        const res = auth.checkCredentials({auth: false, role: 'notActivated'}, false, 'notActivated', false);
        expect(res).to.deep.equal(true);
    });

    it("rule - (!auth, 'notActivated', undefined),  auth - false, role - false, admin - false ", function() {
        const res = auth.checkCredentials({auth: false, role: 'notActivated'}, false, false, false);
        expect(res).to.deep.equal(false);
    });

    it("rule - (admin),  auth - false, role - false, admin - true ", function() {
        const res = auth.checkCredentials({admin: true}, false, false, true);
        expect(res).to.deep.equal(true);
    });

  });
});
