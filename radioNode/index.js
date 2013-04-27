var server = require("./server");
var router = require("./router");
var requestHandler = require("./requestHandler");

var handle = {};
handle["/getSpinNumber"] = requestHandler.getSpinNumber;
handle["/getStationNumber"] = requestHandler.getStationNumber;


server.start(router.route, handle);
