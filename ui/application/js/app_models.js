App.Store = DS.Store.extend({
    revision: 12,
    adapter: DS.RESTAdapter.create({
        bulkCommit: true,
        mappings: {
          search_result: App.SearchResult,
          search_results: App.SearchResult
    }})
});


App.SearchResult = DS.Model.extend({
  hits: DS.attr('number'),
  items: DS.hasMany('App.SearchResultItem')
});


App.SearchResultItem = DS.Model.extend({
  score: DS.attr('number'),
  name: DS.attr('string'),
  type: DS.attr('string'),
  typeId: DS.attr('number'),
  searchResult: DS.belongsTo('App.SearchResult')

});


App.TrackDetail = DS.Model.extend({
  spins: DS.attr('number'),
  name: DS.attr('string'),
});

App.ArtistDetail = DS.Model.extend({
  spins: DS.attr('number'),
  firstName: DS.attr('string'),
  lastName: DS.attr('string'),
});

App.BandDetail = DS.Model.extend({
  spins: DS.attr('number'),
  name: DS.attr('string'),
});

App.Track = DS.Model.extend({
  spins: DS.attr('number'),
  name: DS.attr('string'),
});

App.Artist = DS.Model.extend({
  spins: DS.attr('number'),
  firstName: DS.attr('string'),
  lastName: DS.attr('string'),
});

App.Band = DS.Model.extend({
  spins: DS.attr('number'),
  name: DS.attr('string'),
  lastName: DS.attr('string'),
});


