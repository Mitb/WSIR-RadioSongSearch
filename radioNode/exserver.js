var http = require('http');
var express = require('express');
var _ = require('underscore');
var url = require('url');
var async = require('async');
var ask = require ('./answer_builder');

var app = express();
app.use(express.static(__dirname + '/application'));

app.get('/search_results', function(req, res){
	var urlParts = url.parse(req.url, true);
	var queryParams = urlParts.query;
  var query = queryParams.query;
  var page = queryParams.page ? queryParams.page : 0;
  var numberOfResults = 10;
  console.log('Query: "' + query + '" has been received');
  console.log('Page: '+ page);
  var start = (page-1) * 10;
  var options = {
    host: 'localhost',
    port: '8983',
    path: '/solr/Radio/select?q=' + query.replace(" ", "%20OR%20") + '&wt=json&defType=edismax&qf=primaryIdentifierText%5E50+secondaryIdentifierText%5E30+identifierPhonetic%5E10&mm=1%3C50%25+5%3C70%25&stopwords=true&bf=log(spins)^5&start='+start+'&row='+numberOfResults+'&lowercaseOperators=true'   
  };

  console.log('Solr-Path ' + options.path );
  
  var callback = function(solrResponse) {
    var solrData = '';
    solrResponse.on('data', function (chunk) {
      solrData += chunk;
    });
    solrResponse.on('end', function () {
      var uiJson = {};
      if(solrData){
      var solrJson = solrData ? JSON.parse(solrData) : {response:{}};
      var result = {};
      result.hits = solrJson.response.numFound;
      result.item_ids = [];
      uiJson.search_results = [result];
      var counter = 0;
      uiJson.search_result_items =  _.map(solrJson.response.docs, function(doc){ 
          counter++;
          result.item_ids.push(counter);
          var name = '';
          if(doc.secondaryIdentifier && (doc.type == 'song' || doc.type == 'album') && doc.secondaryIdentifier[0].trim() != ''){ name = doc.primaryIdentifier + ' - ' + doc.secondaryIdentifier;
          }else{ name = doc.primaryIdentifier; }
          return {
             id: counter,
             score: 100,
             name: name,
             type: doc.type,
             type_id: doc.typeId,
             snippet_text: doc.snippetText,
             snippet_license: doc.snippetLicense,
             snippet_url: doc.snippetUrl
           }
       });
       console.log('Number of Results: ' + solrJson.response.numFound);
     }
       res.send(uiJson)
    });
  }
  http.request(options, callback).end();

});



app.get('/artist_details/:artistId', function(req, res){
  var id = req.params.artistId;
  console.log("Details requested for Artist ID: "+ id);
  async.parallel({
      attr: function(callback){
          ask.getArtist(callback, id);
      },
      spins: function(callback){
          ask.getSpinsOverTimeForArtist(callback, id);
      },
      songs: function(callback){
          ask.getSongsOfArtist(callback, id);
      },
      bands: function(callback){
          ask.getBandsOfArtist(callback, id);
      },
      members: function(callback){
          ask.getMembersOfArist(callback, id);
      },     
  },
  function(err, artist) {
      var attr = artist.attr || {};
      var twitterUrl = attr.twiter_id ? 'https://twitter.com/' + attr.twiter_id : attr.twiter_id;
      var facebookUrl = attr.facebook_id ? 'https://facebook.com/' + attr.facebook_id : attr.facebook_id;
      var lastfmUrl = attr.lastfm_id ? 'http://www.last.fm/user/' + attr.lastfm_id : attr.lastfm_id;
    
      var spins = artist.spins || [];
      var spinsOverTimeArea = ask.buildAreaOverTimeChartFrom(spins);
      var spinsByStationDonut = ask.buildSpinsByStationDonutFrom(spins);
    
      res.send({
        artist_detail: {
          id: id,
          spins: spins.length,
          name: attr.name,
          homepage: attr.homepage,
          wiki_url: attr.wikipedia_en, 
          twitter_url: twitterUrl,
          facebook_url: facebookUrl,
          lastfm_url: lastfmUrl,
          songs: artist.songs,
          bands: artist.bands,
          members: artist.members,
          spins_by_station_donut: spinsByStationDonut,
          spins_over_time_area: spinsOverTimeArea
        }
      });
  });
});



app.get('/song_details/:songId', function(req, res){
  var id = req.params.songId;
  console.log("Details requested for Song ID: "+ id);
  async.parallel({
      attr: function(callback){
          ask.getSong(callback, id);
      },
      spins: function(callback){
          ask.getSpinsOverTimeForSong(callback, id);
      }
  },
  function(err, song) {
    var attr = song.attr || {};
    var spins = song.spins || [];
    var spinsOverTimeArea = ask.buildAreaOverTimeChartFrom(spins);
    var spinsByStationDonut = ask.buildSpinsByStationDonutFrom(spins);
 
    res.send({
        song_detail: {
          id: id,
          spins: spins.length,
          title: ''+attr.title,
          artist: ''+attr.artist_name,
          spins_by_station_donut: spinsByStationDonut,
          spins_over_time_area: spinsOverTimeArea
        }
      });
  });
});

app.get('/album_details/:albumId', function(req, res){
  var id = req.params.albumId;
  console.log("Details requested for Album ID: "+ id);
  async.parallel({
      attr: function(callback){
          ask.getAlbum(callback, id);
      },
      songs: function(callback){
          ask.getSongsOfAlbum(callback, id);
      }
  },
  function(err, album) {
    var attr = album.attr || {};
    var songs = album.songs || [];
    res.send({
        album_detail: {
          id: id,
          title: ''+attr.album_title,
          artist_name: ''+attr.album_artist_name,
          artist_id: ''+attr.album_artist_id,
          release_year: ''+attr.released,
          tracks: songs
        }
      });
  });
});

app.listen(8889);