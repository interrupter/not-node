const InitSequence = require('../../src/init/sequence');

module.exports = ({expect})=>{
  describe('InitSequence', ()=>{
    describe('constructor', ()=>{
      it('Init with list', ()=>{
        const res = new InitSequence([1, 3, 2]);
        expect(res.list).to.be.deep.equal([1, 3, 2]);
      });

      it('Init with no list', ()=>{
        const res = new InitSequence();
        expect(res.list).to.be.deep.equal([]);
      });
    });


    describe('insert', ()=>{

      it('list empty, !where', ()=>{
        class Abs{};
        const ctx = {
          list: []
        };
        InitSequence.prototype.insert.call(ctx, Abs);
        expect(ctx.list).to.be.deep.equal([Abs]);
      });

      it('list !empty, !where', ()=>{
        class Abs{};
        const ctx = {
          list: [1,2]
        };
        InitSequence.prototype.insert.call(ctx, Abs);
        expect(ctx.list).to.be.deep.equal([1,2, Abs]);
      });

      it('list empty, where not filled', ()=>{
        class Abs{};
        const where = {};
        const ctx = {
          list: [1,2,3]
        };
        InitSequence.prototype.insert.call(ctx, Abs, where);
        expect(ctx.list).to.be.deep.equal([1,2,3,Abs]);
      });

      it('list empty, where after filled', ()=>{
        class Abs1{};
        class Abs2{};
        class Abs3{};
        class Abs4{};
        const where = {after: ['Abs1', 'Abs3']};
        const ctx = {
          highestPos(){
            return 3;
          },
          list: [Abs1,Abs2,Abs3]
        };
        InitSequence.prototype.insert.call(ctx, Abs4, where);
        expect(ctx.list.map(itm => itm.prototype.constructor.name)).to.be.deep.equal([Abs1,Abs2,Abs3, Abs4].map(itm => itm.prototype.constructor.name));
      });


      it('list empty, where before filled', ()=>{
        class Abs1{};
        class Abs2{};
        class Abs3{};
        class Abs4{};
        const where = {before: ['Abs3', 'Abs2']};
        const ctx = {
          lowestPos(){
            return 1;
          },
          list: [Abs1,Abs2,Abs3]
        };
        InitSequence.prototype.insert.call(ctx, Abs4, where);
        expect(ctx.list.map(itm => itm.prototype.constructor.name)).to.be.deep.equal([Abs1, Abs4, Abs2, Abs3].map(itm => itm.prototype.constructor.name));
      });


      it('list empty, where after and before filled', ()=>{
        class Abs1{};class Abs2{};class Abs3{};class Abs4{};
        class Abs5{};class Abs6{};class Abs7{};class Abs8{};
        class Abs9{};
        const where = {after: ['Abs3', 'Abs1'], before: ['Abs7', 'Abs8']};
        const ctx = {
          lowestPos(){
            return 6;
          },
          highestPos(){
            return 2;
          },
          list: [Abs1,Abs2,Abs3,Abs4,Abs5,Abs6,Abs7,Abs8]
        };
        InitSequence.prototype.insert.call(ctx, Abs9, where);
        expect(ctx.list.map(itm => itm.prototype.constructor.name)).to.be.deep.equal([
          Abs1,Abs2,Abs3,Abs9,Abs4,Abs5,Abs6,Abs7,Abs8
        ].map(itm => itm.prototype.constructor.name));
      });

      it('list empty, where after and before filled', ()=>{
        class Abs1{};class Abs2{};class Abs3{};class Abs4{};
        class Abs5{};class Abs6{};class Abs7{};class Abs8{};
        class Abs9{};
        const where = {after: ['Abs8'], before: ['Abs3']};
        const ctx = {
          lowestPos(){
            return 2;
          },
          highestPos(){
            return 7;
          },
          list: [Abs1,Abs2,Abs3,Abs4,Abs5,Abs6,Abs7,Abs8]
        };
        try{
          InitSequence.prototype.insert.call(ctx, Abs9, where);
        }catch(e){
          expect(e).to.be.instanceof(Error);
          expect(e.message).to.be.equal('Insertion of initalization module impossible: Abs9');
        }
      });

    });


    describe('pos', ()=>{
      it('list empty', ()=>{
        const ctx = {
          list: []
        };
        const res = InitSequence.prototype.pos.call(ctx, 'InitClass');
        expect(res).to.be.deep.equal(-1);
      });

      it('list not empty, class name empty', ()=>{
        class A{};class B{};
        const ctx = {
          list: [A,B]
        };
        const res = InitSequence.prototype.pos.call(ctx);
        expect(res).to.be.deep.equal(-1);
      });


      it('list not empty, class name not empty', ()=>{
        class A{};class B{};
        const ctx = {
          list: [A,B]
        };
        let res = InitSequence.prototype.pos.call(ctx, 'A');
        expect(res).to.be.deep.equal(0);
        res = InitSequence.prototype.pos.call(ctx, 'B');
        expect(res).to.be.deep.equal(1);
      });
    });


    describe('remove', ()=>{
      it('list empty', ()=>{
        const ctx = {
          pos(){
            return -1;
          },
          list: []
        };
        InitSequence.prototype.remove.call(ctx, 'A');
        expect(ctx.list).to.be.deep.equal([]);
      });

      it('list not empty, class name not empty', ()=>{
        const posRes = (function*(){
          yield 2;
          yield 0;
          return 0;
        })();
        const ctx = {
          pos(){
            return posRes.next().value;
          },
          list: [1,2,3]
        };
        InitSequence.prototype.remove.call(ctx, 3);
        expect(ctx.list).to.be.deep.equal([1,2]);
        InitSequence.prototype.remove.call(ctx, 1);
        expect(ctx.list).to.be.deep.equal([2]);
        InitSequence.prototype.remove.call(ctx, 2);
        expect(ctx.list).to.be.deep.equal([]);
      });

      it('list not empty, class name not exists', ()=>{
        class A{}; class B{}; class C{};
        const ctx = {
          pos(){
            return -1;
          },
          list: [A,B,C]
        };
        InitSequence.prototype.remove.call(ctx, 'D');
        expect(ctx.list).to.be.deep.equal([A, B ,C]);
      });
    });

    describe('replace', ()=>{
      it('list empty', ()=>{
        const ctx = {
          insert(){},
          pos(){
            return -1;
          },
          list: []
        };
        InitSequence.prototype.replace.call(ctx, 'A');
        expect(ctx.list).to.be.deep.equal([]);
      });

      it('list not empty', ()=>{
        const ctx = {
          remove(){
            this.list = [];
          },
          pos(){
            return 0;
          },
          list: [
            class A{},
          ]
        };
        InitSequence.prototype.replace.call(ctx, 'A');
        expect(ctx.list).to.be.deep.equal([]);
      });

    });

    describe('highestPos', ()=>{
      it('list not empty, few needles', ()=>{
        const posRes = (function*(){
          yield 1;
          yield 2;
          yield 4;
          yield -1;
          yield 3;
          return 0;
        })();
        const ctx = {
          pos(){
            return posRes.next().value;
          },
          list: []
        };
        const res = InitSequence.prototype.highestPos.call(ctx, [1,2,3,4,5,6]);
        expect(res).to.be.deep.equal(4);
      });

      it('list empty, few needles', ()=>{
        const ctx = {
          pos(){
            return -1;
          },
          list: []
        };
        const res = InitSequence.prototype.highestPos.call(ctx, [1,2,3,4,5,6]);
        expect(res).to.be.deep.equal(-1);
      });
    });


    describe('lowestPos', ()=>{
      it('list not empty, few needles', ()=>{
        const posRes = (function*(){
          yield 2;
          yield 1;
          yield 4;
          return 3;
        })();
        const ctx = {
          pos(){
            return posRes.next().value;
          },
          list: [1,2,3,4,5,6,7,8,9]
        };
        const res = InitSequence.prototype.lowestPos.call(ctx, [1,2,3,4]);
        expect(res).to.be.deep.equal(1);
      });

      it('list empty, few needles', ()=>{
        const ctx = {
          pos(){
            return -1;
          },
          list: [1,2,3,4,5,6,7,8,9]
        };
        const res = InitSequence.prototype.lowestPos.call(ctx, [1,2,3,4,5,6]);
        expect(res).to.be.deep.equal(9);
      });
    });


    describe('run', ()=>{
      it('list not empty - ok', async()=>{
        let runned = [];
        const ctx = {
          list: [
            class Init_1{async run(){runned.push('Init_1');}},
            1,
            class Init_2{async run(){runned.push('Init_2');}},
            class Init_3{async run(){ throw new Error('Test error');}},
            class Init_4{async run(){runned.push('Init_4');}},
            class Init_5{async run(){runned.push('Init_5');}},
          ]
        };
        await InitSequence.prototype.run.call(ctx);
        expect(runned).to.be.deep.equal(['Init_1','Init_2','Init_4','Init_5',]);
      });
    });

  });
};
