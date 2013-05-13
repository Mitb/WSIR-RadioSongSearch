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

DS.RESTAdapter.map('App.SongDetail', {
  primaryKey: '_id'
});


App.SearchResult = DS.Model.extend({
  hits: DS.attr('number'),
  items: DS.hasMany('App.SearchResultItem')
});


App.SearchResultItem = DS.Model.extend({
  score: DS.attr('number'),
  name: DS.attr('string'),
  type: DS.attr('string'),
  typeId: DS.attr('string'),
  snippet: DS.attr('string'),
  searchResult: DS.belongsTo('App.SearchResult'),
  isArtist: function(){
    return this.get('type') == 'artist';
  }.property('type'),
  isSong: function(){
    return this.get('type') == 'song';
  }.property('type'),
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
  name: DS.attr('string'),
  wikiUrl: DS.attr('string'), 
  twitterUrl: DS.attr('string'),
  songs: DS.attr('emberarr'),
  bands: DS.attr('emberarr'),
  members: DS.attr('emberarr'),
  spinsByStationDonut: DS.attr('emberobj'),
  spinsOverTimeArea: DS.attr('emberobj'),
  hasBands: function() {
      var bands = this.get('bands');
      if(bands && bands.length > 0){
        return true;
      }else{
        return false;
      };
  }.property('bands'),
  hasMembers: function() {
      var members = this.get('members');
      if(members && members.length > 0){
        return true;
      }else{
        return false;
      };   
  }.property('members'),
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



