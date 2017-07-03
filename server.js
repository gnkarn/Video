// prepare the HTTP server on port 3000
//We need an HTTP server to do two things: serve our client-side assets
//and provide a hook for the WebSocket server to monitor for upgrade requests
var express = require('express');
const WebSocketServer = require('ws').Server;

// http.createServer(app).listen(8080,"192.168.0.16");
// var server = http.Server(app);
// use the following for Heroku
var app = express(); // made express aplication and create HTTP server
var path = require('path');
const INDEX = path.join(__dirname, '/public/index.html');


// todo lo que esta el directorio public , los usuarios lo ven directamente con la app
//app.use(express.static('public'));
app.use(express.static(__dirname + '/public'));

// viewed at http://localhost:8080
var server = app
  .use((req, res) => res.sendFile(INDEX))
  .listen(process.env.PORT || 3000, function() {
    console.log('Express server listening on port %d in %s mode', this.address().port, app.settings.env);
  });

var clients = 0;


// llama la funcion socket con la funcion server como argumento
// io es ahora organiza el intercambio de datos llamando a la funcion socket
// import socket library

var WStype_TEXT = 3;

var myJSON; // contine el mensaje desde el servidor a los clientes

// Create Websocket server
//The WebSocket server takes an HTTP server as an argument so that it can listen for ‘upgrade’ events:
var wss = new WebSocketServer({
  server,
  autoAcceptConnections: true
});

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed
  return true;
}

//var server    = app.listen(3000);

//var server = app.listen(8080);
console.log('VIDEO socket server running');

function heartbeat() {
  this.isAlive = true;
}

var interval = setInterval(() => {
  wss.clients.forEach((client) => {
    if (ws.isAlive === false) return ws.terminate();
    client.send(JSON.stringify({
      'msgName': 'time',
      'type': 3,
      'message': new Date().toLocaleTimeString()
    }));
    //ws.isAlive = false;
    //ws.ping('', false, true);
  });
}, 30000);


wss.on('connection', function connection(ws, req) {
      console.log('Client connected');
      clients++;
      ws.isAlive = true;
      ws.on('pong', heartbeat);
      var ip = req.connection.remoteAddress;
      socket.send({
        'msgName': 'newclientconnect',
        'type': 3,
        'message': clients + ' clients connected!'
      });

      wss.on('close', () => console.log('Client disconnected'); console.log('Client disconnected'); clients--; ws.send({
        'msgName': 'newclientconnect',
        'type': 3,
        'message': clients + ' clients connected!'
      });)

      // once matrix is received from source it is send back to all clients

      // test de envio  como array
      wss.on('message', function(msg) {

            var JsonObject = JSON.parse(msg.data);
            var msgName = JsonObject.msgName;
            var msgContent = JsonObject.message;

            switch (msgName) {
              case "msgArray1":
                wss.send(JSON.stringify({
                  'msgName': 'msgArray2',
                  'type': 3,
                  'message': msg.message
                }));
                break;
                default : //;

            });
