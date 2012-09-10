/**
 * Backbone Nested Models
 * Author: Bret Little
 * 
 * Nested model support in Backbone.js
 * 
 **/
(function(Backbone) {
	var set = Backbone.Model.prototype.set,
		add = Backbone.Collection.prototype.add,
		Model = Backbone.Model,
		Collection = Backbone.Collection,
		parent;

	Backbone.Model.prototype.setRelation = function(attr, val) {
		var relation = this.attributes[attr];
		if(_.has(this.relations, attr)) {

			if(relation && relation instanceof Collection) {
				relation.reset(val);
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

	Backbone.Model.prototype.set = function(key, value, options) {
		var attrs, attr, val;

		// Handle both `"key", value` and `{key: value}` -style arguments.
		if (_.isObject(key) || key == null) {
			attrs = key;
			options = value;
		} else {
			attrs = {};
			attrs[key] = value;
		}

		// Extract attributes and options.
		options || (options = {});
		if (!attrs) return this;
		if (attrs instanceof Model) attrs = attrs.attributes;
		if (options.unset) for (attr in attrs) attrs[attr] = void 0;

		// Run validation.
		if (!this._validate(attrs, options)) return false;

		// Check for changes of `id`.
		if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

		var changes = options.changes = {};
		var now = this.attributes;
		var escaped = this._escapedAttributes;
		var prev = this._previousAttributes || {};

		// For each `set` attribute...
		for (attr in attrs) {
			val = attrs[attr];

			val = this.setRelation(attr, val);

			// If the new and current value differ, record the change.
			if (!_.isEqual(now[attr], val) || (options.unset && _.has(now, attr))) {
				delete escaped[attr];
				(options.silent ? this._silent : changes)[attr] = true;
			}

			// Update or delete the current value.
			options.unset ? delete now[attr] : now[attr] = val;

			// If the new and previous value differ, record the change.  If not,
			// then remove changes for this attribute.
			if (!_.isEqual(prev[attr], val) || (_.has(now, attr) != _.has(prev, attr))) {
				this.changed[attr] = val;
				if (!options.silent) this._pending[attr] = true;
			} else {
				delete this.changed[attr];
				delete this._pending[attr];
			}
		}

		// Fire the `"change"` events.
		if (!options.silent) this.change(options);
		return this;
	};



})(Backbone);
