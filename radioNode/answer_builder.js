var mysql = require('mysql');
var url 	= require('url');
var _ = require('underscore');

var connection = mysql.createConnection({
  host     	: 'localhost',
  database	: 'Radio',
  user     	: 'search',
  password 	: 'wsir',
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

function getAlbum(callback, albumId){
  connection.query(
   'SELECT album_artist_name, album_artist_id, album_id, album_title, released FROM RS_Album WHERE album_id = \''+albumId+'\'',
    function(err, rows, fields) {
      if(err) throw err;
      callback(null, rows[0]); 
    }
  );
}

function getSongsOfAlbum(callback, albumId){
  connection.query(
    'SELECT track_number as track, song_title, song_id, song_artist_name as artist_name , song_artist_id as artist_id FROM RS_Tracklist WHERE album_id = \''+albumId+'\'',
    function(err, rows, fields) {
      if(err) throw err;
      callback(null, rows); 
    }
  );
}

function getSpinsOverTimeForSong(callback, songId){  
connection.query( 'SELECT st.name AS stationName, sp.station_id as stationId, \
                   FROM_UNIXTIME(sp.timestamp) AS timestamp \
                     FROM RS_Spin AS sp JOIN RS_Station AS st \
                     ON sp.station_id = st.id \
                     WHERE song_id = \''+ songId +'\' \
                     GROUP BY stationId, timestamp \
                     ORDER BY timestamp ASC',
function(err, rows, fields) {
  if(err) throw err;
  callback(null, rows); 
});
}

function getSpinsOverTimeForArtist(callback, artistId){  
connection.query( 'SELECT st.name AS stationName, sp.station_id as stationId, \
                   FROM_UNIXTIME(sp.timestamp) AS timestamp \
                     FROM RS_Spin AS sp JOIN RS_Station AS st \
                     ON sp.station_id = st.id \
                     WHERE artist_id = \''+ artistId +'\' \
                     GROUP BY stationId, timestamp \
                     ORDER BY timestamp ASC',
function(err, rows, fields) {
  if(err) throw err;
  callback(null, rows); 
});
}

function groupByStation(spins){
   var grouped =  _.groupBy(spins, function(elem){ return elem.stationId });
   var mapped = _.map(grouped, function(value, key){ 
     return { stationId: value[0].stationId, 
              stationName: value[0].stationName,
              spins: value.length } 
   });
   var sortedDesc = _.sortBy(mapped,function(elem){ 
     return elem.spins
   }).reverse();
   return sortedDesc;
}

function buildSpinsByStationDonutFrom(spins){
   var groupedByStation = groupByStation(spins)
   var topStations = _.map(_.take(groupedByStation, 5),
     function(elem){return {label: elem.stationName, value: elem.spins }}
   );   
   var others = _.reduce( _.rest(groupedByStation , 5),
      function(memo, num){ memo.value += num.spins; return memo}, {label: 'others', value: 0}
   );
   var all = topStations.concat([others]);
   return { data: all };
}

function buildAreaOverTimeChartFrom(spins){
  var topStations = _.take(groupByStation(spins),3);
  var topStattionIds = _.map(topStations, function(elem){return elem.stationId});

  var data = _.reduce(spins, function(memo, num){ 
    var date = new Date(num.timestamp);
    var dateStr = '' + date.getFullYear() + '-' + date.getMonth();
    var dateObj = memo[dateStr] || {};
    var id = topStattionIds.indexOf(num.stationId) != -1 ? num.stationId : 0;
    if(dateObj[id]){
      dateObj[id] = dateObj[id] + 1;
    }else{
      dateObj[id] = 1;
    }
    memo[dateStr] = dateObj;
    return memo;
  }, {});

  data = _.map(data, function(num, key){ num['month'] = key; return num});

  var ykeys = _.map(topStations, function(elem){ return '' + elem.stationId});
  var labels = _.map(topStations, function(elem){ return elem.stationName });
  // prepend others
  ykeys = ['0'].concat(ykeys);
  labels = ['others'].concat(labels);
 
  return { data: data, ykeys: ykeys, labels: labels, xkey: 'month' };
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



exports.getSong = getSong;
exports.getSongsOfArtist = getSongsOfArtist;
exports.getArtist = getArtist;
exports.getMembersOfArist = getMembersOfArist;
exports.getBandsOfArtist = getBandsOfArtist;
exports.getSpinsOverTimeForSong = getSpinsOverTimeForSong;
exports.getSpinsOverTimeForArtist = getSpinsOverTimeForArtist;
exports.buildAreaOverTimeChartFrom = buildAreaOverTimeChartFrom;
exports.buildSpinsByStationDonutFrom = buildSpinsByStationDonutFrom;
exports.getAlbum = getAlbum;
exports.getSongsOfAlbum = getSongsOfAlbum;
