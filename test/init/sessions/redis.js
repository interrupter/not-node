const InitSessionsRedis = require('../../../src/init/sessions/redis');
const mock = require('mock-require');



module.exports = ({
  expect
}) => {
  describe('InitSessionsRedis', () => {
    describe('run', () => {
      it('run, middleware returned and set', async () => {
        let events = [];
        mock('redis', {
          createClient(){
            return {
              on(name, arg){
                expect(typeof name).to.be.equal('string');
                expect(typeof arg).to.be.equal('function');
                events.push(name)
                arg(new Error('test error'));
              }
            }
          }
        });
        mock('express-session', (cnf)=>{
          expect(cnf).have.keys(['secret', 'key', 'cookie', 'resave', 'saveUninitialized', 'store']);
          return ()=>{};
        });
        mock('connect-redis', (inpt)=>{
          expect(typeof inpt).to.be.equal('function');
          return class FakeRedis{};
        });

        const config = {
          get(str){
            return str + '__fake';
          }
        };

        const master = {
          getEnv(){

          },
          getServer(){
            return {
              use(arg){
                expect(typeof arg).to.be.equal('function');
              }
            }
          },
          getApp(){
            return {
              report(arg){
                expect(arg).to.be.instanceof(Error);
              },
              getEnv(){

              }
            }
          }
        };
        await new InitSessionsRedis().run({master, config});

      });
    });
  });
};
