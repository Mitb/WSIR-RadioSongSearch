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
          if(doc.secondaryIdentifier){ name = doc.primaryIdentifier + ' - ' + doc.secondaryIdentifier;
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
	console.log("Our Artist ID is "+req.params.artistId);
  console.log("Number of Spins: "+ask.getNumberOfSpinsForArtist(req.params.artistId));

  res.send({
    "artist_detail": {
        "id": 1,
        "spins": 1000,
        "first_name": "Jack",
        "last_name": "White",
        "wiki_url": "http://en.wikipedia.org/wiki/Jack_White",
        "twitter_url": "https://twitter.com/search?q=%23jackwhite",
        "songs": [
            {"title":"Love Is Blindness", "year":"2012"},
            {"title":"Love Interruption", "year":"2013"},
            {"title":"Sonx X", "year":"2012"},
            {"title":"Song 3434", "year":"2012"},
            {"title":"YSSD", "year":"2012"},
            {"title":"Bla Blup", "year":"2012"}
        ],
        "bands": [
            {"name": "The White Stripes"}
        ],
        "spins_by_station_donut": {
            "data": [
                {"label": "Das Ding", "value": 50},
                {"label": "SWR3", "value": 100},
                {"label": "BigFM", "value": 110}
            ]
        },
        "spins_over_time_area": {
            "xkey": "period",
            "ykeys": ["ding", "swr3", "bigfm"],
            "labels": ["Das Ding", "SWR3", "BigFM"],
            "data": [
                {"period": "2010 Q1", "ding": 2666, "swr3": null, "bigfm": 2647},
                {"period": "2010 Q2", "ding": 2778, "swr3": 2294, "bigfm": 2441},
                {"period": "2010 Q3", "ding": 4912, "swr3": 1969, "bigfm": 2501},
                {"period": "2010 Q4", "ding": 3767, "swr3": 3597, "bigfm": 5689},
                {"period": "2011 Q1", "ding": 6810, "swr3": 1914, "bigfm": 2293},
                {"period": "2011 Q2", "ding": 5670, "swr3": 4293, "bigfm": 1881},
                {"period": "2011 Q3", "ding": 4820, "swr3": 3795, "bigfm": 1588},
                {"period": "2011 Q4", "ding": 15073, "swr3": 5967, "bigfm": 5175},
                {"period": "2012 Q1", "ding": 10687, "swr3": 4460, "bigfm": 2028},
                {"period": "2012 Q2", "ding": 8432, "swr3": 5713, "bigfm": 1791}
            ]
        }
    }
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
          ask.getSpinsOverTimeArea(callback, id);
      }
  },
  function(err, song) {
      res.send({
        song_detail: {
          id: id,
          spins: song.spins,
          title: ''+song.attr.title,
          artist: ''+song.attr.artist,
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