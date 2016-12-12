var express = require("express");
var router  = express.Router();
var path    = require("path");
var errorHandler = require(__dirname+'/app/errors.js');
var routes  = require(__dirname+'/routes.js');
var app     = express();
var bodyParser = require('body-parser');

// 
// Settings
// 

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.set('view engine', 'pug');
app.set('views', './views');


// 
// Routes
// 

app.use(express.static(__dirname+'/public'));
routes.run(app);
app.use(errorHandler);

// 
// Run the app
// 

app.listen(8080);
console.log("Running at Port 8080");
