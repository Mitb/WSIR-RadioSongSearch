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
    'SELECT title, artist_name FROM RS_Song WHERE id = \''+songId+'\'',
    function(err, rows, fields) {
      if(err) throw err;
      callback(null, rows[0]); 
    }
  );
}

function getSongsOfArtist(callback, artistId){
  connection.query(
    'SELECT id, title FROM RS_Song WHERE artist_id = \''+artistId+'\'',
    function(err, rows, fields) {
      if(err) throw err;
      callback(null, rows); 
    }
  );
}

function getArtist(callback, artistId){
  connection.query(
    'SELECT name, homepage, facebook_id, twitter_id, lastfm_id, wikipedia_en FROM RS_Artist WHERE id = \''+artistId+'\'',
    function(err, rows, fields) {
      if(err) throw err;
      callback(null, rows[0]); 
    }
  );
}

function getNumberOfSpinsForSong(callback, songId){
  connection.query(
    'SELECT count(*) AS number FROM rs_spin WHERE song_id = \''+songId+'\'',
    function(err, rows, fields) {
      if(err) throw err;
      callback(null, rows[0].number); 
    });
}

function getNumberOfSpinsForArtist(callback, artistId){
  connection.query(
    'SELECT count(*) AS number FROM rs_spin WHERE artist_id = \''+artistId+'\'',
    function(err, rows, fields) {
      if(err) throw err;
      callback(null, rows[0].number); 
    });
}


function getSpinsByStationDonutForSong(callback, songId){  
  connection.query( 'SELECT st.name AS label, count(sp.song_id) AS value FROM rs_spin as sp \
                       JOIN RS_Station AS st \
                       ON sp.station_id = st.id \
                       WHERE song_id = \''+ songId +'\' \
                       GROUP BY sp.station_id ORDER BY value DESC',
  function(err, rows, fields) {
    if(err) throw err;
    callback(null, rows); 
  });
}

function getSpinsByStationDonutForArtist(callback, artistId){  
  connection.query( 'SELECT st.name AS label, count(sp.song_id) AS value FROM rs_spin as sp \
                       JOIN RS_Station AS st \
                       ON sp.station_id = st.id \
                       WHERE artist_id = \''+ artistId +'\' \
                       GROUP BY sp.station_id ORDER BY value DESC',
  function(err, rows, fields) {
    if(err) throw err;
    callback(null, rows); 
  });
}

function getSpinsOverTimeAreaForSong(callback, songId){  
connection.query( 'SELECT st.name AS stationName, sp.station_id as stationId, \
                   FROM_UNIXTIME(sp.timestamp) AS timestamp, count(sp.song_id) \
                     FROM rs_spin AS sp JOIN RS_Station AS st \
                     ON sp.station_id = st.id \
                     WHERE song_id = \''+ songId +'\' \
                     GROUP BY stationId, timestamp \
                     ORDER BY timestamp ASC',
function(err, rows, fields) {
  if(err) throw err;
  var res = areaRowProcessing(rows);
  callback(null, { data: res.data, ykeys: res.ykeys, labels: res.labels, xkey: 'month'}); 
});
}

function getSpinsOverTimeAreaForArtist(callback, artistId){  
connection.query( 'SELECT st.name AS stationName, sp.station_id as stationId, \
                   FROM_UNIXTIME(sp.timestamp) AS timestamp, count(sp.song_id) \
                     FROM rs_spin AS sp JOIN RS_Station AS st \
                     ON sp.station_id = st.id \
                     WHERE artist_id = \''+ artistId +'\' \
                     GROUP BY stationId, timestamp \
                     ORDER BY timestamp ASC',
function(err, rows, fields) {
  if(err) throw err;
  var res = areaRowProcessing(rows);
  callback(null, { data: res.data, ykeys: res.ykeys, labels: res.labels, xkey: 'month'}); 
});
}


function areaRowProcessing(rows){
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
  return { data: data, ykeys: ykeys, labels: labels };
}

function getMembersOfArist(callback, artistId){
  connection.query(
    'SELECT a.name as name, a.id as id FROM RS_Bandmember as bm JOIN RS_Artist as a on bm.member = a.id where bm.band = \''+artistId+'\'',
    function(err, rows, fields) {
      if(err) throw err;
      callback(null, rows); 
    });
}

function getBandsOfArtist(callback, artistId){
  connection.query(
    'SELECT a.name as name, a.id as id FROM RS_Bandmember as bm JOIN RS_Artist as a on bm.band = a.id where bm.member = \''+artistId+'\'',
    function(err, rows, fields) {
      if(err) throw err;
      callback(null, rows); 
    });
}


exports.getNumberOfSpinsForArtist = getNumberOfSpinsForArtist;
exports.getNumberOfSpinsForSong = getNumberOfSpinsForSong;
exports.getSong = getSong;
exports.getSongsOfArtist = getSongsOfArtist;
exports.getArtist = getArtist;
exports.getMembersOfArist = getMembersOfArist;
exports.getBandsOfArtist = getBandsOfArtist;
exports.getSpinsByStationDonutForSong = getSpinsByStationDonutForSong;
exports.getSpinsByStationDonutForArtist = getSpinsByStationDonutForArtist;
exports.getSpinsOverTimeAreaForSong = getSpinsOverTimeAreaForSong;
exports.getSpinsOverTimeAreaForArtist = getSpinsOverTimeAreaForArtist;