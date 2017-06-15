// prepare the server on port 3000
var express = require('express'),
  http = require('http'),
  https = require('https');
var app = express(); // made express aplication

// llama la funcion socket con la funcion server como argumento
// io es ahora organiza el intercambio de datos llamando a la funcion socket
// import socket library
var socket = require('socket.io');
var io = socket(server);
var clients = 0;

// todo lo que esta el directorio public , los usuarios lo ven directamente con la app
//app.use(express.static('public'));
app.use(express.static(__dirname + '/public'));

var path = require('path');
const INDEX = path.join(__dirname, '/public/index.html');

// viewed at http://localhost:8080

// http.createServer(app).listen(8080,"192.168.0.16");
// var server = http.Server(app);
// use the following for Heroku
var server = app
  .use((req, res) => res.sendFile(INDEX))
  .listen(process.env.PORT || 3000, function() {
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });


//var server    = app.listen(3000);



//var server = app.listen(8080);
var clientNum = 0;


console.log('VIDEO socket server running');

io.on('connection', function(socket){
      console.log('Client connected');
      clients++;
      socket.emit('newclientconnect', {
        description: 'Hey, welcome!'
      });
      socket.broadcast.emit('newclientconnect', {
        description: clients + ' clients connected!'
      });
      socket.on('disconnect', function() {
          console.log('Client disconnected');
          clients--;
          socket.broadcast.emit('newclientconnect', {
            description: clients + ' clients connected!'
          });
        });
        socket.on('msgMatrixAserver', function(msg) {
            console.log('recibido :',data);
          });
      });

    setInterval(() => io.emit('time', new Date().toTimeString()), 1000);
