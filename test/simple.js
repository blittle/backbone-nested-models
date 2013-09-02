describe("Simple Tests", function() {
	var Book, book;

	beforeEach(function() {
		Book = Backbone.Model.extend({
		    relations: {
		      "author": Backbone.Model,
		      "pages" : Backbone.Collection
		    }
		});

		book = new Book();

		book.set({
		  "author": {
		    "name" : "Heber J. Grant",
		    "title": "President",
		    "age"  : "47"
		  },
		  "pages": [
		  	{
		  		number: 1,
		  		words: 500
		  	},
		  	{
		  		number: 2,
		  		words: 450
		  	}
		  ]
		});
	});

	it("Should build a model relation", function() {
		expect(book.get('author').get('name')).toEqual('Heber J. Grant');
		expect(book.get('author').get('title')).toEqual('President');
		expect(book.get('author').get('age')).toEqual('47');
	});

	it("Should build a collection relation", function() {
		expect(book.get('pages').length).toBe(2);
		expect(book.get('pages').at(0).get('number')).toBe(1);
		expect(book.get('pages').at(1).get('number')).toBe(2);
		expect(book.get('pages').at(0).get('words')).toBe(500);
		expect(book.get('pages').at(1).get('words')).toBe(450);
	});

	it("Should provide backwards references to the parent models", function() {
		expect(book.get('author').parent).toEqual(book);
		expect(book.get('pages').at(0).collection.parent).toEqual(book);
	});

	it("Should merge in new properties into an existing relation", function() {
		var author = book.get('author');

		book.set({
			'author': {
				'city': "SLC"
			}
		});

		expect(book.get('author')).toBe(author);
		expect(book.get('author').get('name')).toBe('Heber J. Grant');
		expect(book.get('author').get('city')).toBe('SLC');
	});

	it("Should deconstruct model references", function() {
		var author = book.get('author');
		book.unset('author');

		expect(author.parent).not.toBeDefined();
	});

	it("Should merge new models into a relation which is a collection", function() {
		book.set({
		  "pages": [
		  	{
		  		number: 3,
		  		words: 600
		  	}
		  ]
		});

		expect(book.get('pages').length).toBe(3);
	});

	it("Should merge values into models which already exist in a sub collection", function() {
		book.set({
		  "pages": [
		  	{
		  		id: 1,
		  		number: 3,
		  		words: 600
		  	}
		  ]
		});


		book.set({
		  "pages": [
		  	{
		  		id: 1,
		  		test: "test"
		  	}
		  ]
		});

		expect(book.get('pages').length).toBe(3);
		expect(book.get('pages').at(2).get('test')).toBe('test');
		expect(book.get('pages').at(2).get('words')).toBe(600);
	});

	it("Should remove models which no longer exist in a sub collection", function() {
		book.set({
		  "pages": [
		  	{
		  		id: 1,
		  		number: 3,
		  		words: 600
		  	}
		  ]
		});


		book.set({
		  "pages": [
		  	{
		  		id: 2,
		  		test: "test"
		  	}
		  ]
		});

		expect(book.get('pages').length).toBe(3);
		expect(book.get('pages').at(2).get('test')).toBe('test');
		expect(book.get('pages').at(2).get('words')).not.toBe(600);
		expect(book.get('pages').at(2).id).toBe(2);
	});

	it("Should trigger reset events on nested collection relations", function() {
		var Thing = Backbone.Model.extend();

		var spy = jasmine.createSpy();

		var Things = Backbone.Collection.extend({
		  model: Thing,

		  initialize: function() {
		    this.on('reset', spy);
		  }
		});

		var Bucket = Backbone.Model.extend({
		  relations: {
		    'things': Things
		  }
		});

		var Buckets = Backbone.Collection.extend({
		  model: Bucket
		});

		var buckets = new Buckets([
		  {
		    name: 'a',
		    things: [{num: 1}, {num: 2}]
		  }
		]);
		expect(spy.callCount).toEqual(1);

		buckets.reset([
		  {
		    name: 'b',
		    things: [{num: 1}, {num: 2}]
		  }
		]);
		expect(spy.callCount).toEqual(2);

		buckets.add([
		  {
		    name: 'c',
		    things: [{num: 1}, {num: 2}]
		  }
		]);
		expect(spy.callCount).toEqual(3);
	});

	it("Should recursively call .toJSON", function() {
		var json = book.toJSON();
		expect(json.pages[0].number).toEqual(1);

		var emptyBook = new Book();
		expect(emptyBook.toJSON()).toEqual({});
	});
});