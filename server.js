// prepare the server on port 3000
var express = require('express');

// http.createServer(app).listen(8080,"192.168.0.16");
// var server = http.Server(app);
// use the following for Heroku
var app = express(); // made express aplication and create HTTP server
var server = app
  .use((req, res) => res.sendFile(INDEX))
  .listen(process.env.PORT || 3000, function() {
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });


// llama la funcion socket con la funcion server como argumento
// io es ahora organiza el intercambio de datos llamando a la funcion socket
// import socket library
var socket = require('socket.io');
// Create Websocket server
//The Socket.io server takes an HTTP server as an argument so that it can listen for socket.io-related requests:
var io = socket(server);



// todo lo que esta el directorio public , los usuarios lo ven directamente con la app
//app.use(express.static('public'));
app.use(express.static(__dirname + '/public'));

var path = require('path');
const INDEX = path.join(__dirname, '/public/index.html');

// viewed at http://localhost:8080


var clients = 0;

//var server    = app.listen(3000);

//var server = app.listen(8080);



console.log('VIDEO socket server running');
// for heroku replaces io. for wss.
io.on('connection', function(socket) {
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
    console.log('recibido :', msg);
  });
});

setInterval(() => io.emit('time', new Date().toTimeString()), 1000);
