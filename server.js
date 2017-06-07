// prepare the server on port 3000
var express = require('express'),
  http = require('http'),
  https = require('https');
var app = express(); // made express aplication
var path = require('path');


// viewed at http://localhost:8080

// http.createServer(app).listen(8080,"192.168.0.16");
// var server = http.Server(app);
var server    = app.listen(3000);
// llama la funcion socket con la funcion server como argumento
// io es ahora organiza el intercambio de datos llamando a la funcion socket
// import socket library
var socket = require('socket.io');
var io = socket(server);

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/index.html'));
});

//var server = app.listen(8080);
var clientNum = 0;

// todo lo que esta el directorio public , los usuarios lo ven directamente con la app
app.use(express.static('public'));

console.log('VIDEO socket server running');
