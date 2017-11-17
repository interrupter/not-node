const query = require('../src/query'),
  expect = require('chai').expect,
  Schema = require('mongoose').Schema,
  escapeStringRegexp = require('escape-string-regexp');

let modelSchema = {
  "name": {
    type: String,
    searchable: true
  },
  "user": {
    type: Schema.Types.Mixed,
    sortable: true,
    searchable: true
  },
  "country": {
    type: String,
    sortable: true
  },
  "id": {
    type: Number,
    searchable: true,
    sortable: true
  },
};


let sorterDefaults = [{
  'id': -1
}];


describe("query", function() {
  describe("search", function() {
    it("string", function() {
      let searchFor = "John";
      let filter = query.search({
        search: searchFor
      }, modelSchema);
      expect(filter).to.deep.equal([{
        name: new RegExp('.*' + escapeStringRegexp(searchFor) + '.*', 'i')
      }]);
    });

    it("number", function() {
      let searchFor = "12";
      let filter = query.search({
        search: searchFor
      }, modelSchema);
      expect(filter).to.deep.equal([{
          name: new RegExp('.*' + escapeStringRegexp(searchFor) + '.*', 'i')
        },
        {
          id: 12
        }
      ]);
    });

    it("number with NaN input", function() {
      let searchFor = "g1g2";
      let filter = query.search({
        search: searchFor
      }, modelSchema);
      expect(filter).to.deep.equal([{
        name: new RegExp('.*' + escapeStringRegexp(searchFor) + '.*', 'i')
      }]);
    });
  });

  describe("sorter", function() {
    describe("empty input", function() {
      it("parse", function() {
        let sorter = query.sorter({}, modelSchema);
        expect(sorter).to.deep.equal([{
          '_id': 1
        }]);
      });
    });
    describe("empty input, with sorter defaults", function() {
      it("parse", function() {
        let sorter = query.sorter({}, modelSchema, sorterDefaults);
        expect(sorter).to.deep.equal(sorterDefaults);
      });
    });
    describe("not empty input, but field forbiden to sort", function() {
      it("parse", function() {
        let sorter = query.sorter({
          sorter: [{
            direction: -1,
            field: "name"
          }]
        }, modelSchema);
        expect(sorter).to.deep.equal(query.sorterDefaultsLocal);
      });
    });
    describe("not empty input, with sorter defaults", function() {
      it("full input", function() {
        let sorter = query.sorter({
          sorter: [{
            direction: 1,
            field: "country"
          }]
        }, modelSchema, sorterDefaults);
        expect(sorter).to.deep.equal([{
          "country": 1
        }]);
      });
      it("without direction", function() {
        let sorter = query.sorter({
          sorter: [{
            field: "country"
          }]
        }, modelSchema, sorterDefaults);
        expect(sorter).to.deep.equal([{
          "country": query.sorterDefaultsLocal_Direction
        }]);
      });

      it("sort with field path starting from :", function() {
        let sorter = query.sorter({
          sorter: [{
            direction: 1,
            field: ":country"
          }]
        }, modelSchema);
        expect(sorter).to.deep.equal([{
          'country': 1
        }]);
      });
    });
    describe("not empty input, sort by sub - field of mixed", function() {
      it("user.subfield", function() {
        let sorter = query.sorter({
          sorter: [{
            direction: -1,
            field: ":user.subfield"
          }]
        }, modelSchema);
        expect(sorter).to.deep.equal([{
          'user.subfield': -1
        }]);
      });
    });
  });

  describe("filter", function() {
    it("empty", function() {
      let filter = query.filter({}, modelSchema);
      expect(filter).to.deep.equal([]);
    });
    it("by number field", function() {
      let searchFor = 12;
      let filter = query.filter({
        filter: {
          id: searchFor
        }
      }, modelSchema);
      expect(filter).to.deep.equal([{
        id: 12
      }]);
    });
    it("by number field with NaN input", function() {
      let searchFor = "g12g";
      let filter = query.filter({
        filter: {
          id: searchFor
        }
      }, modelSchema);
      expect(filter).to.deep.equal([]);
    });
    it("by string field", function() {
      let searchFor = "John";
      let filter = query.filter({
        filter: {
          name: searchFor
        }
      }, modelSchema);
      expect(filter).to.deep.equal([{
        name: searchFor
      }]);
    });
  });
});
