var answer_builder = require ('./answer_builder');

function getSpinNumber(request, response) {
	console.log("Request handler 'getSpinNumber' was called.");

	answer_builder.getNumberOfSpins(request, response);
}

function getStationNumber(request, response) {
	console.log("Request handler 'getStationNumber' was called.");
	response.writeHead(200, {"Content-Type": "text/plain"});
	response.write("Hello This needs to be implemented");
	response.end();
}

exports.getSpinNumber = getSpinNumber;
exports.getStationNumber = getStationNumber;