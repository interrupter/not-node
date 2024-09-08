const Log = require("not-log")(module, "InitSequence");
const { objHas } = require("../common");

/**
 * Initialization sequence manipulations
 * Holds list of initalizers and manages em adds/removes
 **/
module.exports = class InitSequence {
    constructor(list = []) {
        this.list = [...list];
    }
    /**
     * Insert initalizator after and before specified modules or at the end
     * @param  {Object}  what    initializator class constructor
     * @param  {Object}  where   specification where to insert
     * @param  {string}  where.after   list of constructor names of
     *                       initalizators after which item should be inserted
     * @param  {string}  where.before   list of constructor names of
     *                       initalizators before which item should be inserted
     **/
    insert(what, where = { after: "", before: "" }) {
        if (where && this.list.length > 0) {
            let start = -1,
                end = this.list.length;
            if (objHas(where, "after") && where.after) {
                start = this.highestPos(where.after);
            }
            if (objHas(where, "before") && where.before) {
                end = this.lowestPos(where.before);
            }
            if (start > end) {
                throw new Error(
                    "Insertion of initalization module impossible: " +
                        what.prototype.constructor.name
                );
            }
            if (start > -1) {
                this.list.splice(start + 1, 0, what);
            } else if (end < this.list.length) {
                this.list.splice(end, 0, what);
            } else {
                this.list.push(what);
            }
        } else {
            this.list.push(what);
        }
    }

    /**
     * Removing item and optionally adding few on place of removed
     * @param {string} rem  name of class of initalizator to remove
     * @param {Array.Constructor} add  list of class constructors
     **/
    remove(rem, add = []) {
        const index = this.pos(rem);
        if (index > -1) {
            this.list.splice(index, 1, ...add);
        }
    }

    /**
     * Replacing existing item or if item is not exists in list
     * then inserting items accroding to where instruction
     * @param {string} whatRemove  name of class of initalizator to remove
     * @param {Array.Constructor} whatInsert  list of class constructors
     * @param  {Object}  where   specification where to insert
     * @param  {Array.String}  where.after   list of constructor names of
     *                       initalizators after which item should be inserted
     * @param  {Array.String}  where.before   list of constructor names of
     *                       initalizators before which item should be inserted
     **/
    replace(whatRemove, whatInsert = [], where = {}) {
        const pos = this.pos(whatRemove);
        if (pos > -1) {
            //if what is presented, we replace
            this.remove(whatRemove, whatInsert);
        } else {
            //else, use where to position insertion
            this.insert(whatInsert, where);
        }
    }

    pos(what) {
        return this.list.findIndex((val) => {
            return val.prototype.constructor.name === what;
        });
    }

    highestPos(whats) {
        return whats.reduce((prev /*number*/, cur /*string*/) => {
            const index = this.pos(cur);
            if (index > prev) {
                return index;
            } else {
                return prev;
            }
        }, -1);
    }

    lowestPos(whats) {
        return whats.reduce((prev /*number*/, cur /*string*/) => {
            const index = this.pos(cur);
            if (index > -1 && index < prev) {
                return index;
            } else {
                return prev;
            }
        }, this.list.length);
    }

    async run(context) {
        for (let Step of this.list) {
            try {
                if (Step && Step.prototype && Step.prototype.constructor) {
                    await new Step().run({ ...context });
                }
            } catch (e) {
                Log.error(
                    `Initalization step failed, initializator class name: '${Step.prototype.constructor.name}'`
                );
                Log.error(e);
            }
        }
    }
};
