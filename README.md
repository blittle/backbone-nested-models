Backbone Nested Models
======================

Backbone nested models is meant to be a lightweight and simple solution for nested models in [Backbone.js](http://backbonejs.org/). It gives you
nothing fancy, just simple relations (2.1 kilobytes minified). If you are looking for a larger more complex and exhaustive solution checkout
[Backbone-relational](https://github.com/PaulUithol/Backbone-relational) by Paul Uithol.

## Options

Each `Backbone.Model` can contain an array of `relations`. Each Relation defines a nested model or collection which will
be represented by that attribute.

```javascript

var Book = Backbone.Model.extend({
    relations: {
      "author": Backbone.Model
    }
});

var book = new Book();

book.set({
  "author": {
    "name" : "Heber J. Grant",
    "title": "President",
    "age"  : "47"
  },
  "pages": 450
});

var author = book.get("author");

author.get("name") === "Heber J. Grant";
author.parent.get('pages') === 450;

```
Whenever set is called on a model, or a json response is saved to a model, if a relation exists for one of the attributes
being saved, a new instance of that relation will be created or if it already exists, it will be updated. Also note that
the relation will be given a backwards reference to its parent model through the keyword `parent`. A `_parent` attribute will also be added to the options paramter passed to the initialize method, but be aware that the parent model is not entirely initialized at this point.

Collections work similarly except that the backwards reference from a model which is part of a colleciton which is a 
relation of a model is `collection.parent`.

```javascript

var Package = Backbone.Model.extend({
    relations: {
      "documents": Backbone.Collection
    }
});

var pkg = new Package();

pkg.set({
  "documents": [
    {id:1, name: "Document 1"},
    {id:2, name: "Document 2"},
  ],
  "packageTitle": "My Package"
});

var document1 = pkg.get("documents").get(1);

document1.get("name") === "Document 1";

document1.collection.parent.get("packageTitle") === "My Package";

```

Backbone nested models will never recreate an entire relation as an attribute to a model. It only creates the relation
once and thereafter updates the collection or model representing the relation. This is important because event bindings
or cached references may be pointing to the previous relations, and if they are recreated those references would be lost.

## Change log

v2.0.1
* Explicitly depend upon underscore - https://github.com/blittle/backbone-nested-models/pull/25

v2.0.0
* Use build int `Collection.prototype.set` - https://github.com/blittle/backbone-nested-models/pull/23

v0.7.0
* Add AMD support

v0.6.0
* Merge https://github.com/blittle/backbone-nested-models/pull/15

v0.5.1
* Fix toJSON from failing when relations are defined but don't exist

v0.5.0 

* Feature - Call reset event for nested Models/Collections - #5
* Feature - Recursively call .toJSON()
* Fix memory leak issue where parent references weren't removed on "unset"
* Fix various issues with the collection merging.
* Add karma test suite


## License

(The MIT License)

Copyright (c) 2012 Bret Little

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/blittle/backbone-nested/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

