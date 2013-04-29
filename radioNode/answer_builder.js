var mysql = require('mysql');
var url 	= require('url');
var _ = require('underscore');

var connection = mysql.createConnection({
  host     	: 'localhost',
  database	: 'Radio',
  user     	: 'root',
  password 	: '',
});


function getSong(callback, songId){
  connection.query(
    'SELECT artist, title FROM Songs WHERE id = '+songId,
    function(err, rows, fields) {
      if(err) throw err;
      callback(null, rows[0]); 
    }
  );
}

function getNumberOfSpinsForSong(callback, songId){
  connection.query(
    'SELECT count(*) AS number FROM Radio WHERE song_id = '+songId,
    function(err, rows, fields) {
      if(err) throw err;
      callback(null, rows[0].number); 
    }
  );
};

function getSpinsByStationDonutForSong(callback, songId){
  connection.query( 'SELECT s.name AS label, count(r.song_id) AS value FROM Radio AS r JOIN Stations AS s ON r.station_id = s.id WHERE song_id = '+ songId +' GROUP BY label ORDER BY value DESC',
    function(err, rows, fields) {
      if(err) throw err;
      callback(null, rows); 
    }
  );
}

function getSpinsOverTimeArea(callback, songId){
  connection.query( 'SELECT s.name AS stationName, r.station_id as stationId, FROM_UNIXTIME(time) AS timestamp, count(song_id) FROM Radio AS r JOIN Stations AS s ON r.station_id = s.id WHERE song_id = '+ songId +' GROUP BY stationId, timestamp ORDER BY time ASC',
  function(err, rows, fields) {
    if(err) throw err;
      
    var data = _.reduce(rows, function(memo, num){ 
      var date = new Date(num.timestamp);
      var dateStr = '' + date.getFullYear() + '-' + date.getMonth();
      var dateObj = memo[dateStr] || {};
      if(dateObj[num.stationId]){
        dateObj[num.stationId] = dateObj[num.stationId] + 1;
      }else{
        dateObj[num.stationId] = 1;
      }
      memo[dateStr] = dateObj;
      return memo;
    }, {});
    data = _.map(data, function(num, key){ num['month'] = key; return num});

    var ykeys = _.map( _.groupBy(rows, function(elem){ return elem.stationId }), function(elem){ return '' + elem[0].stationId});

    var labels = _.map( _.groupBy(rows, function(elem){ return elem.stationName }), function(elem){ return elem[0].stationName });
      
    callback(null, { data: data, ykeys: ykeys, labels: labels, xkey: 'month'}); 
  }
);
}


function getNumberOfSpinsForArtist(artistId){
  connection.query( 'Select count(Radio.station_id) AS number FROM Radio LEFT JOIN Songs on Radio.song_id = Songs.id WHERE Songs.artist = "'+artistId+'"', function(err, rows, fields) {
    if (err) throw err;

    console.log("Number of Spins of Artist " + artistId + " is " + rows[0].number);
  }
)
};


exports.getNumberOfSpinsForArtist = getNumberOfSpinsForArtist;
exports.getNumberOfSpinsForSong = getNumberOfSpinsForSong;
exports.getSong = getSong;
exports.getSpinsByStationDonutForSong = getSpinsByStationDonutForSong;
exports.getSpinsOverTimeArea = getSpinsOverTimeArea