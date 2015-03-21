
var express = require('express');

var app = express();
app.configure(function(){
    app.use(express.static(__dirname + '/'));
});
var server = app.listen(9000);
