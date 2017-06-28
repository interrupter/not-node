var query = require('../src/queryHelpers.js');
var expect = require("chai").expect;
const Schema = require('mongoose').Schema;
const escapeStringRegexp = require('escape-string-regexp');

var modelSchema = {
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

describe("filter parser", function () {
	describe("empty input", function () {
		it("parse", function () {
			var filter = query.getFilter({}, modelSchema);
			expect(filter).to.deep.equal([]);
		});
	});
	describe("filterSearch input", function () {

		it("filterSearch string", function () {
			var searchFor = "John";
			var filter = query.getFilter({
				filterSearch: searchFor
			}, modelSchema);
			expect(filter).to.deep.equal([{
				name: new RegExp('.*' + escapeStringRegexp(searchFor) + '.*', 'i')
			}]);
		});

		it("filterSearch number", function () {
			var searchFor = "12";
			var filter = query.getFilter({
				filterSearch: searchFor
			}, modelSchema);
			expect(filter).to.deep.equal([{
					name: new RegExp('.*' + escapeStringRegexp(searchFor) + '.*', 'i')
				},
				{
					id: 12
				}
			]);
		});

		it("filterSearch number with NaN input", function () {
			var searchFor = "g1g2";
			var filter = query.getFilter({
				filterSearch: searchFor
			}, modelSchema);
			expect(filter).to.deep.equal([{
				name: new RegExp('.*' + escapeStringRegexp(searchFor) + '.*', 'i')
			}]);
		});

		it("filter by number field", function () {
			var searchFor = 12;
			var filter = query.getFilter({
				id: searchFor
			}, modelSchema);
			expect(filter).to.deep.equal([{
				id: 12
			}]);
		});

		it("filter by number field with NaN input", function () {
			var searchFor = "g12g";
			var filter = query.getFilter({
				id: searchFor
			}, modelSchema);
			expect(filter).to.deep.equal([]);
		});

		it("filter by string field", function () {
			var searchFor = "John";
			var filter = query.getFilter({
				name: searchFor
			}, modelSchema);
			expect(filter).to.deep.equal([{
				name: searchFor
			}]);
		});
	});
});

var sorterDefaults = {
	'id': -1
};

describe("sorter parser", function () {
	describe("empty input", function () {
		it("parse", function () {
			var sorter = query.getSorter({}, modelSchema);
			expect(sorter).to.deep.equal({
				'_id': 1
			});
		});
	});
	describe("empty input, with sorter defaults", function () {
		it("parse", function () {
			var sorter = query.getSorter({}, modelSchema, sorterDefaults);
			expect(sorter).to.deep.equal(sorterDefaults);
		});
	});
	describe("not empty input, but field forbiden to sort", function () {
		it("parse", function () {
			var sorter = query.getSorter({
				sortDirection: -1,
				sortByField: "name"
			}, modelSchema);
			expect(sorter).to.deep.equal(query.sorterDefaultsLocal);
		});
	});
	describe("not empty input, with sorter defaults", function () {
		it("full input", function () {
			var sorter = query.getSorter({
				sortDirection: 1,
				sortByField: "country"
			}, modelSchema, sorterDefaults);
			expect(sorter).to.deep.equal({
				"country": 1
			});
		});
		it("without direction", function () {
			var sorter = query.getSorter({
				sortByField: "country"
			}, modelSchema, sorterDefaults);
			expect(sorter).to.deep.equal({
				"country": query.sorterDefaultsLocal_Direction
			});
		});

		it("sort with field path starting from :", function () {
			var sorter = query.getSorter({
				sortDirection: 1,
				sortByField: ":country"
			}, modelSchema);
			expect(sorter).to.deep.equal({
				'country': 1
			});
		});
	});
	describe("not empty input, sort by sub-field of mixed", function () {
		it("user.subfield", function () {
			var sorter = query.getSorter({
				sortDirection: -1,
				sortByField: ":user.subfield"
			}, modelSchema);
			expect(sorter).to.deep.equal({
				'user.subfield': -1
			});
		});
	});
});
