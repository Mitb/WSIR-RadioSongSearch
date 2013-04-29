DS.RESTAdapter.registerTransform('emberobj', {
    deserialize: function(serialized) {
        return Ember.Object.create(serialized);
    },  
    serialize: function(deserialized) {
        return deserialized.getProperties();
    }   
});

DS.RESTAdapter.registerTransform('emberarr', {
    deserialize: function(serialized) {
       return serialized;
    },  
    serialize: function(deserialized) {
        return deserialized;
    }   
});


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
  snippet: DS.attr('string'),
  searchResult: DS.belongsTo('App.SearchResult')
});


App.SongDetail = DS.Model.extend({
  spins: DS.attr('number'),
  title: DS.attr('string'),
  artist: DS.attr('string'),
  spinsByStationDonut: DS.attr('emberobj'),
  spinsOverTimeArea: DS.attr('emberobj')
});

App.ArtistDetail = DS.Model.extend({
  spins: DS.attr('number'),
  firstName: DS.attr('string'),
  lastName: DS.attr('string'),
  wikiUrl: DS.attr('string'), 
  twitterUrl: DS.attr('string'),
  songs: DS.attr('emberarr'),
  bands: DS.attr('emberarr'),
  spinsByStationDonut: DS.attr('emberobj'),
  spinsOverTimeArea: DS.attr('emberobj')
});

App.BandDetail = DS.Model.extend({
  spins: DS.attr('number'),
  name: DS.attr('string'),
});

App.Song = DS.Model.extend({
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



