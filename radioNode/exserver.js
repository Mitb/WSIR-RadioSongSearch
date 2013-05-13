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
  console.log('Query: "' + query + '" has been received');
  var options = {
    host: 'localhost',
    port: '8983',
    path: '/solr/Radio/select?q=' + query.replace(" ", "%20OR%20") + '&wt=json&defType=edismax&qf=primaryIdentifier%5E50+secondaryIdentifier%5E30+identifierText%5E10&mm=1%3C50%25+5%3C70%25&stopwords=true&lowercaseOperators=true'
    
      
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
      var solrJson = solrData ? JSON.parse(solrData) : {};
      var result = {};
      result.hits = solrJson.response.numFound;
      result.item_ids = [];
      uiJson.search_results = [result];
      var counter = 0;
      uiJson.search_result_items =  _.map(solrJson.response.docs, function(doc){ 
          counter++;
          result.item_ids.push(counter);
          var name = ''
          if(doc.secondaryIdentifier && doc.secondaryIdentifier.trim() != ''){ name = doc.primaryIdentifier + ' - ' + doc.secondaryIdentifier;
          }else{ name = doc.primaryIdentifier; }
          return {
             id: counter,
             score: 100,
             name: name,
             type: doc.type,
             type_id: doc.typeId,
             snippet: "Horem ipsum dolor sit amet, consectetur adipiscing elit. Proin nunc justo, vestibulum nec egestas quis, luctus eu elit."
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
          ask.getNumberOfSpinsForArtist(callback, id);
      },
      spinsByStationDonut: function(callback){
          ask.getSpinsByStationDonutForArtist(callback, id);
      },
      spinsOverTimeArea: function(callback){
          ask.getSpinsOverTimeAreaForArtist(callback, id);
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
      res.send({
        artist_detail: {
          id: id,
          spins: artist.spins,
          name: artist.attr.name,
          wiki_url: artist.attr.wikipedia_en, 
          twitter_url: 'https://twitter.com/' + artist.attr.twiter_id,
          songs: artist.songs,
          bands: artist.bands,
          members: artist.members,
          spins_by_station_donut: { data: artist.spinsByStationDonut },
          spins_over_time_area: {
              xkey: artist.spinsOverTimeArea.xkey,
              ykeys: artist.spinsOverTimeArea.ykeys,
              labels: artist.spinsOverTimeArea.labels,
              data : artist.spinsOverTimeArea.data
          }
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
          ask.getNumberOfSpinsForSong(callback, id);
      },
      spinsByStationDonut: function(callback){
          ask.getSpinsByStationDonutForSong(callback, id);
      },
      spinsOverTimeArea: function(callback){
          ask.getSpinsOverTimeAreaForSong(callback, id);
      }
  },
  function(err, song) {
      res.send({
        song_detail: {
          id: id,
          spins: song.spins,
          title: ''+song.attr.title,
          artist: ''+song.attr.artist_name,
          spins_by_station_donut: { data: song.spinsByStationDonut },
          spins_over_time_area: {
              xkey: song.spinsOverTimeArea.xkey,
              ykeys: song.spinsOverTimeArea.ykeys,
              labels: song.spinsOverTimeArea.labels,
              data : song.spinsOverTimeArea.data
          }
        }
      });
  });
});

app.listen(8889);