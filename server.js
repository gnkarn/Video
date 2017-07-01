// prepare the HTTP server on port 3000
//We need an HTTP server to do two things: serve our client-side assets
//and provide a hook for the WebSocket server to monitor for upgrade requests
var express = require('express');

// http.createServer(app).listen(8080,"192.168.0.16");
// var server = http.Server(app);
// use the following for Heroku
var app = express(); // made express aplication and create HTTP server
var path = require('path');
const INDEX = path.join(__dirname, '/public/index.html');

// viewed at http://localhost:8080
var server = app
  .use((req, res) => res.sendFile(INDEX))
  .listen(process.env.PORT || 3000, function () {
    console.log('Express server listening on port %d in %s mode', this.address().port, app.settings.env);
  });

var clients = 0;


// llama la funcion socket con la funcion server como argumento
// io es ahora organiza el intercambio de datos llamando a la funcion socket
// import socket library

const WStype_TEXT = 3;

var myJSON; // contine el mensaje desde el servidor a los clientes


// todo lo que esta el directorio public , los usuarios lo ven directamente con la app
//app.use(express.static('public'));
app.use(express.static(__dirname + '/public'));



// Create Websocket server
//The WebSocket server takes an HTTP server as an argument so that it can listen for ‘upgrade’ events:
const wss = new SocketServer ({
  server
});
//var server    = app.listen(3000);

//var server = app.listen(8080);
console.log('VIDEO socket server running');

wss.on('connection', (ws) => {
  console.log('Client connected');
  clients++;
  socket.emit('newclientconnect', {
    description: 'Hey, welcome!'
  });
  socket.send('newclientconnect', {
    description: clients + ' clients connected!'
  });
  ws.on ('disconnect', function () {
    console.log('Client disconnected');
    clients--;
    socket.emit('newclientconnect', {
      description: clients + ' clients connected!'
    });
  });
  // once matrix is received from source it is send back to all clients
  ws.on('msgMatrixAserver', function (msg) {
    //console.log('recibido :', msg.length);
    // change for a stringify version
    //socket.send('{"msgName": "msgVideo", "type": 3, "message": ' + msg + '}');
    // emit es una prueba para ver como reacciona el ESP funcionaok
    ws.send('messages', '{"msgName": "msgVideo", "type": 3, "message": ' + msg + '}');
  });

  // test de envio  como array
  ws.on('msgArray1', function (msg) {
    wss.send('msgArray2', msg);
  });
});

setInterval(() => {
      wss.clients.forEach((client) => {
        wss.send('time', JSON.stringify({
            'msgName': 'time',
            'type': 3,
            'message': new Date().toTimeString()
          }))
        })
      }, 1000);

    //setInterval(() => io.emit('time', new Date().toTimeString()), 1000);
