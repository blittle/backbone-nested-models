describe("Simple Tests", function() {
    var Book, Author, defaultAuthor;

    beforeEach(function() {
        Author = Backbone.Model.extend({
            defaults: {
                name: "Anonymous"
            }
        });
        
        defaultAuthor = new Author();

        Book = Backbone.Model.extend({
            relations: {
              author: Author,
              pages: Backbone.Collection
            },
            defaults: {
              author: defaultAuthor,
              pages: new Backbone.Collection()
            }
        });
    });

    it("Should have valid relations by default", function() {
        var book = new Book();

        expect(book.get('author')).not.toBe(null);
        expect(book.get('author')).not.toBe(null);
        expect(book.get('author').get('name')).toEqual('Anonymous');
        
        expect(book.toJSON().author.name).toEqual('Anonymous');
        // it should create new instance
        expect(book.get('author')).not.toEqual(defaultAuthor);

        expect(book.get('pages').length).toBe(0);

        expect(book.get('author').parent).toEqual(book);
        expect(book.get('pages').parent).toEqual(book);
    });

    it("Should build relations after a set", function() {
        var book = new Book();
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

        expect(book.get('author').get('name')).toEqual('Heber J. Grant');
        expect(book.get('author').get('title')).toEqual('President');
        expect(book.get('author').get('age')).toEqual('47');
        
        expect(book.toJSON().author.age).toEqual('47');

        expect(book.get('pages').length).toBe(2);
        expect(book.get('pages').at(0).get('number')).toBe(1);
        expect(book.get('pages').at(1).get('number')).toBe(2);
        expect(book.get('pages').at(0).get('words')).toBe(500);
        expect(book.get('pages').at(1).get('words')).toBe(450);

        expect(book.get('author').parent).toEqual(book);
        expect(book.get('pages').at(0).collection.parent).toEqual(book);
    });
});
