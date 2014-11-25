describe("Nested relations", function() {
	var item, Item;

	beforeEach(function() {
    var Outlook = Backbone.Model.extend({
      relations: {
        "scenarios": Backbone.Collection
      }
    });

    var OutlookCollection = Backbone.Collection.extend({
      model: Outlook
    });

    Item = Backbone.Model.extend({
      relations: {
        "outlooks": OutlookCollection
      }
    });

    item = new Item();
    item.set({
      outlooks: [
        {
          'name': "Bret",
          "scenarios": [
            {
              "someValue": true
            }
          ]
        }
      ]
    });
	});

	it("Should build a nested relation", function() {
          expect(item.get('outlooks').at(0).get('scenarios').at(0).get('someValue')).toBe(true);
	});

});
