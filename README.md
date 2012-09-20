Backbone Nested Models
======================

Backbone nested models is meant to be a lightweight and simple solution for nested models in [Backbone.js](http://backbonejs.org/). It gives you
nothing fancy, just simple relations (662 bytes minified/gzipped). If you are looking for a larger more complex and exhaustive solution checkout
[Backbone-relational](https://github.com/PaulUithol/Backbone-relational) by Paul Uithol.

## Options

Each `Backbone.Model` can contain an array of `relations`. Each Relation defines a nested model or collection which will
be represented by that attribute.

```javascript

Document = Backbone.Model.extend({
    relations: [
      "author": Backbone.Model
    ]
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
the relation will be given a backwards reference to its parent model through the keyword `parent`.

Collections work similarly except that the backwards reference from a model which is part of a colleciton which is a 
relation of a model is `collection.parent`.

```javascript

Package = Backbone.Model.extend({
    relations: [
      "documents": Backbone.Collection
    ]
});

Package pkg = new Package();

pkg.set({
  "documents": [
    {id:1, name: "Document 1"},
    {id:2, name: "Document 2"},
  ],
  "packageTitle": "My package"
});

var document1 = pkg.get("documents").get(1);

document1.get("name") === "Document 1";

document1.collection.parent.get("packageTitle") === "My Package";

```

Backbone nested models will never recreate an entire relation as an attribute to a model. It only creates the relation
once and thereafter updates the collection or model representing the relation. This is important because event bindings
or cached references may be pointing to the previous relations, and if they are recreated those references would be lost.