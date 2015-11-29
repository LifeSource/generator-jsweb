var express = require("express"),
    mongoose = require("mongoose"),
    bodyParser = require("body-parser");

var config = require("../../config")();

var app = express();

// database setup
// mongoose.connect("mongodb://localhost/<appName>")

// middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// api goes here.

// static files
app.use(express.static(config.client));
app.use(express.static(config.root));
app.use("/*", express.static(config.index));

app.listen(config.port);
