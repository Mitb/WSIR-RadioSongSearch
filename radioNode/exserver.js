var express = require('express');
var app = express();

app.use(express.static(__dirname + '/application'));

app.get('/', function(req, res){

  res.send('hello world');
});

app.get('/artist_details/:artistId', function(req, res){
	console.log("Our Artist ID is "+req.params.artistId);
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



app.get('/search_results', function(req, res){
  console.log('Query has been received');

  res.send({
    "search_results": [ 
        {
        "hits": 6,
        "item_ids": [1, 2, 3, 4, 5, 6]
        }
     ],
    "search_result_items": [
        {
            "id": 1,
            "score": 100,
            "name": "Jack White",
            "type": "artist",
            "type_id": 1
        },
        {
            "id": 2,
            "score": 80,
            "name": "Jack Black",
            "type": "artist",
            "type_id": 2
        }, 
        {
            "id": 3,
            "score": 70,
            "name": "Nirvana",
            "type": "band",
            "type_id": 2
        },
        {
            "id": 4,
            "score": 60,
            "name": "The White Stripes",
            "type": "band",
            "type_id": 1
        },
        {
            "id": 5,
            "score": 40,
            "name": "Nirvana - Smells Like a Teen Spirit",
            "type": "track",
            "type_id": 1
        },
        {
            "id": 6,
            "score": 30,
            "name": "The White Stripes - Seven Nation Army",
            "type": "track",
            "type_id": 2
        }     
    ] 
});
});


app.listen(8889);