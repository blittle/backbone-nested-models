/**
 * Backbone Nested Models
 * Author: Bret Little
 * Version: 0.3
 *
 * Nested model support in Backbone.js
 *
 **/

(function(Backbone) {
    var Model = Backbone.Model,
        Collection = Backbone.Collection;

    Backbone.Model.prototype.setRelation = function(attr, val) {
        var relation = this.attributes[attr],
            modelToSet, modelsToAdd = [], modelsToRemove = [];

        if(_.has(this.relations, attr)) {

            // If the relation already exists, we don't want to replace it, rather
            // update the data within it whether it is a collection or model
            if(relation && relation instanceof Collection) {

                // If the val that is being set is already a collection, use the models
                // within the collection.
                if(val instanceof Collection || val instanceof Array){
                    val = val.models || val;
                    modelsToAdd = _.clone(val);

                    relation.each(function(model, i) {

                        // If the incoming model also exists within the existing collection,
                        // call set on that model. If it doesn't exist in the incoming array,
                        // then add it to a list that will be removed.
                        var rModel = _.find(val, function(_model) {
                            return _model.id === model.id;
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
                        if(val.id === model.id) {
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

            val = new this.relations[attr](val);
            val.parent = this;
        }

        return val;
    };

    Backbone.Model.prototype.set = function(key, val, options) {
        var attr, attrs;
        if (key == null) return this;

        // Handle both `"key", value` and `{key: value}` -style arguments.
        if (_.isObject(key)) {
            attrs = key;
            options = val;
        } else {
            (attrs = {})[key] = val;
        }

        // Extract attributes and options.
        var silent = options && options.silent;
        var unset = options && options.unset;

        // Run validation.
        if (!this._validate(attrs, options)) return false;

        // Check for changes of `id`.
        if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

        var now = this.attributes;

        // For each `set` attribute...
        for (attr in attrs) {
            val = attrs[attr];

            val = this.setRelation(attr, val);

            // Update or delete the current value, and track the change.
            unset ? delete now[attr] : now[attr] = val;
            this._changes.push(attr, val);
        }

        // Signal that the model's state has potentially changed, and we need
        // to recompute the actual changes.
        this._hasComputed = false;

        // Fire the `"change"` events.
        if (!silent) this.change(options);
        return this;
    };



})(Backbone);
