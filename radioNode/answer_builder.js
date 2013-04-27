var mysql      	= require('mysql');
var url 		= require('url');

var connection = mysql.createConnection({
  host     	: 'localhost',
  database	: 'Radio',
  user     	: 'root',
  password 	: '',
});


function getNumberOfSpins(request, response){
	var url_parts = url.parse(request.url, true);
	var query = url_parts.query;
	if(!query.song_id){
  		response.writeHead(400, {"Content-Type": "text/plain"});
		response.write("Invalid use of API");
		response.end();
	}else{
	connection.query('SELECT count(*) AS number FROM Radio WHERE song_id = '+query.song_id, function(err, rows, fields) {
  		if (err) throw err;

  		response.writeHead(200, {"Content-Type": "text/plain"});
		response.write(JSON.stringify(rows[0].number));
		response.end();
		}
	)}
};


exports.getNumberOfSpins = getNumberOfSpins;