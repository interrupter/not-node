const InitHTTP = require('../../src/init/http');
const mock = require('mock-require');
const path = require('path');

module.exports = ({expect})=>{
  describe('HTTP', ()=>{
    describe('listenPromise', ()=>{
      it('ok', (done)=>{
        const config = {
          get(str){
            return {
              'port': 80
            }[str];
          }
        };
        const master = {
          getHTTPServer(){
            return {
              listen(port, fn){
                expect(typeof port).to.be.equal('number');
                expect(typeof fn).to.be.equal('function');
                fn();
              }
            };
          }
        };
        InitHTTP.prototype.listenPromise.call({}, {config, master})
          .then(()=>{done();})
          .catch(done);
      });

      it('error', async()=>{
        const config = {
          get(str){
            return {
              'ssl:enabled': true,
              'port': 80
            }[str];
          }
        };
        const master = {
          getHTTPServer(){
            return {
              listen(port, fn){
                expect(typeof port).to.be.equal('number');
                expect(typeof fn).to.be.equal('function');
                fn(new Error('some error'));
              }
            };
          }
        };
        try {
          await InitHTTP.prototype.listenPromise.call({}, {config, master})
        } catch (e) {
          expect(e).to.be.instanceof(Error);
          expect(e.message).to.be.equal('some error');
        }
      });
    });

    describe('getSSLOptions', ()=>{
      it('files exists', ()=>{
        const config = {
          get(str){
            return {
              'ssl:keys:private': path.join(__dirname, '../testies/fake.private'),
              'ssl:keys:chain': path.join(__dirname,'../testies/fake.chain'),
              'ssl:keys:cert': path.join(__dirname,'../testies/fake.cert'),
            }[str];
          }
        };
        const res = InitHTTP.getSSLOptions({config});
        expect(res).to.have.keys(['ca', 'cert', 'key']);
        expect(res).to.be.deep.equal({
          key: "private\n",
          cert: "cert\n",
          ca: "chain\n"
        });
      });
    });


    describe('isSecure', ()=>{
      it('false', ()=>{
        const config = {
          get(str){
            return {
              'ssl:enabled': false
            }[str];
          }
        };
        expect(InitHTTP.isSecure({config})).to.be.equal(false);
      });

      it('true', ()=>{
        const config = {
          get(str){
            return {
              'ssl:enabled': true
            }[str];
          }
        };
        expect(InitHTTP.isSecure({config})).to.be.equal(true);
      });
    });

    describe('run', ()=>{
      it('secure', async()=>{
        let runnerCalled = false;
        const ctx = {
          async runHTTPS(){
            runnerCalled = true;
          },
          async runHTTP(){

          },
        };
        const config = {
          get(str){
            return {
              'ssl:enabled': true
            }[str];
          }
        };
        await InitHTTP.prototype.run.call(ctx, {config});
        expect(runnerCalled).to.be.true;
      });

      it('!secure', async()=>{
        let runnerCalled = false;
        const ctx = {
          async runHTTPS(){},
          async runHTTP(){
            runnerCalled = true;
          },
        };
        const config = {
          get(str){
            return {
              'ssl:enabled': false
            }[str];
          }
        };
        await InitHTTP.prototype.run.call(ctx, {config});
        expect(runnerCalled).to.be.true;
      });
    });


    describe('runHTTP', ()=>{
      before(()=>{
        mock('http', {
          createServer(param){
            param.created = true;
            return param;
          }
        });
      });

      it('simple run', async()=>{
        let runnerCalled = false;
        const ctx = {
          async listenPromise(){
            runnerCalled = true;
          }
        };
        const config = {
          get(str){
            return {
              'ssl:enabled': true
            }[str];
          }
        };
        const master = {
          getServer(){
            return {
              created: false,
              set(key, val){
                expect(key).to.be.equal('protocol');
                expect(val).to.be.equal('http');
              }
            };
          },
          setHTTPServer(f){
            expect(f).to.be.ok;
            expect(f.created).to.be.true;
          },
        };
        await InitHTTP.prototype.runHTTP.call(ctx, {master, config});
        expect(runnerCalled).to.be.true;
      });

      after(()=>{
        mock.stop('http');
      });
    });


    describe('runHTTPS', ()=>{
      before(()=>{
        mock('https', {
          createServer(keys, param){
            param.created = true;
            param.keys = keys;
            return param;
          }
        });
      });

      it('simple run', async()=>{
        let runnerCalled = false;
        const ctx = {
          async listenPromise(){
            runnerCalled = true;
          }
        };
        const config = {
          get(str){
            return {
              'ssl:enabled': true,
              'ssl:keys:private': path.join(__dirname, '../testies/fake.private'),
              'ssl:keys:chain': path.join(__dirname,'../testies/fake.chain'),
              'ssl:keys:cert': path.join(__dirname,'../testies/fake.cert'),
            }[str];
          }
        };
        const master = {
          getServer(){
            return {
              created: false,
              set(key, val){
                expect(key).to.be.equal('protocol');
                expect(val).to.be.equal('https');
              }
            };
          },
          setHTTPServer(f){
            expect(f).to.be.ok;
            expect(f.created).to.be.true;
            expect(f.keys).to.have.keys(['ca', 'cert', 'key']);
            expect(f.keys).to.be.deep.equal({
              key: "private\n",
              cert: "cert\n",
              ca: "chain\n"
            });
          },
        };
        await InitHTTP.prototype.runHTTPS.call(ctx, {master, config});
        expect(runnerCalled).to.be.true;
      });

      after(()=>{
        mock.stop('https');
      });
    });

  });
};
