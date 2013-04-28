var server = require("./server");
var router = require("./router");
var requestHandler = require("./requestHandler");
var express = require("express");

var handle = {};
handle["/"] = requestHandler.index;
handle["/getSpinNumber"] = requestHandler.getSpinNumber;
handle["/getStationNumber"] = requestHandler.getStationNumber;


server.start(router.route, handle);
