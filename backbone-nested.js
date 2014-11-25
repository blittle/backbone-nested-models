/**
 * Backbone Nested Models
 * Author: Bret Little
 * Version: 0.7.0
 *
 * Nested model support in Backbone.js
 *
 **/

// support amd and common js
(function(factory) {
  if (typeof Backbone !== 'undefined' ||
      typeof exports !== 'undefined') {
    factory(Backbone);

  } else if (typeof define === 'function' && define.amd) {
    // AMD
    define(['backbone'], function(backbone) {
      factory(Backbone);
    });
  } 
}(function(Backbone) {
    var Model = Backbone.Model,
        Collection = Backbone.Collection;

    Backbone.Model.prototype.setRelation = function(attr, val, options) {
        var relation = this.attributes[attr],
            id = this.idAttribute || "id",
            modelToSet, modelsToAdd = [], modelsToRemove = [];

        if(options.unset && relation) delete relation.parent;

        if(this.relations && _.has(this.relations, attr)) {

            // If the relation already exists, we don't want to replace it, rather
            // update the data within it whether it is a collection or model
            if(relation && relation instanceof Collection) {

                // If the val that is being set is already a collection, use the models
                // within the collection.
                if(val instanceof Collection || val instanceof Array){
                    val = val.models || val;
                    modelsToAdd = _.clone(val);

                    relation.each(function(model, i) {

                        // If the model does not have an "id" skip logic to detect if it already
                        // exists and simply add it to the collection
                        if(typeof model[id] == 'undefined') return;

                        // If the incoming model also exists within the existing collection,
                        // call set on that model. If it doesn't exist in the incoming array,
                        // then add it to a list that will be removed.
                        var rModel = _.find(val, function(_model) {
                            return _model[id] === model[id];
                        });

                        if(rModel) {
                            model.set(rModel.toJSON ? rModel.toJSON() : rModel);

                            // Remove the model from the incoming list because all remaining models
                            // will be added to the relation
                            modelsToAdd.splice(i,1);
                        } else {
                            modelsToRemove.push(model);
                        }

                    });

                    _.each(modelsToRemove, function(model) {
                        relation.remove(model);
                    });

                    relation.add(modelsToAdd);

                } else {

                    // The incoming val that is being set is not an array or collection, then it represents
                    // a single model.  Go through each of the models in the existing relation and remove
                    // all models that aren't the same as this one (by id). If it is the same, call set on that
                    // model.

                    relation.each(function(model) {
                        if(val[id] === model[id]) {
                            model.set(val);
                        } else {
                            relation.remove(model);
                        }
                    });
                }

                return relation;
            }

            if(relation && relation instanceof Model) {
                relation.set(val);
                return relation;
            }

            options._parent = this;

            val = new this.relations[attr](val, options);
            val.parent = this;
        }

        return val;
    };

    Backbone.Model.prototype.set = function(key, val, options) {
        var attr, attrs, unset, changes, silent, changing, prev, current;
        if (key == null) return this;

        // Handle both `"key", value` and `{key: value}` -style arguments.
        if (typeof key === 'object') {
            attrs = key;
            options = val;
        } else {
            (attrs = {})[key] = val;
        }

        options || (options = {});

        // Run validation.
        if (!this._validate(attrs, options)) return false;

        // Extract attributes and options.
        unset           = options.unset;
        silent          = options.silent;
        changes         = [];
        changing        = this._changing;
        this._changing  = true;

        if (!changing) {
            this._previousAttributes = _.clone(this.attributes);
            this.changed = {};
        }
        current = this.attributes, prev = this._previousAttributes;

        // Check for changes of `id`.
        if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

        // For each `set` attribute, update or delete the current value.
        for (attr in attrs) {
            val = attrs[attr];

            // Inject in the relational lookup
            val = this.setRelation(attr, val, options);

            if (!_.isEqual(current[attr], val)) changes.push(attr);
            if (!_.isEqual(prev[attr], val)) {
                this.changed[attr] = val;
            } else {
                delete this.changed[attr];
            }
            unset ? delete current[attr] : current[attr] = val;
        }

        // Trigger all relevant attribute changes.
        if (!silent) {
            if (changes.length) this._pending = true;
            for (var i = 0, l = changes.length; i < l; i++) {
                this.trigger('change:' + changes[i], this, current[changes[i]], options);
            }
        }

        if (changing) return this;
        if (!silent) {
            while (this._pending) {
                this._pending = false;
                this.trigger('change', this, options);
            }
        }
        this._pending = false;
        this._changing = false;
        return this;
    };

    Backbone.Model.prototype.toJSON = function(options) {
      var attrs = _.clone(this.attributes);

      _.each(this.relations, function(rel, key) {
        if (_.has(attrs, key)) {
          attrs[key] = attrs[key].toJSON();
        } else {
            attrs[key] = (new rel()).toJSON();
        }
      });

      return attrs;
    };

    Backbone.Model.prototype.clone = function(options) {
        return new this.constructor(this.toJSON());
    };

    Backbone.Collection.prototype.resetRelations = function(options) {
        _.each(this.models, function(model) {
            _.each(model.relations, function(rel, key) {
                if(model.get(key) instanceof Backbone.Collection) {
                    model.get(key).trigger('reset', model, options);
                }
            });
        })
    };

    Backbone.Collection.prototype.reset = function(models, options) {
      options || (options = {});
      for (var i = 0, l = this.models.length; i < l; i++) {
        this._removeReference(this.models[i]);
      }
      options.previousModels = this.models;
      this._reset();
      this.add(models, _.extend({silent: true}, options));
      if (!options.silent) {
        this.trigger('reset', this, options);
        this.resetRelations(options);
      }
      return this;
    };
}));
