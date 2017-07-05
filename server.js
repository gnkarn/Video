// prepare the HTTP server on port 3000
//We need an HTTP server to do two things: serve our client-side assets
//and provide a hook for the WebSocket server to monitor for upgrade requests
var express = require('express');
const Websocket = require('ws');
var webSockets = {} ;// userID: webSocket

//const WebSocketServer = require('ws').Server;
// WebSocket server is tied to a HTTP server. WebSocket
// request is just an enhanced HTTP request. For more info
// http://tools.ietf.org/html/rfc6455#page-6
const WebSocketServer = Websocket.Server;
// http.createServer(app).listen(8080,"192.168.0.16");
// var server = http.Server(app);
// use the following for Heroku
var app = express(); // made express aplication and create HTTP server
var path = require('path');
const INDEX = path.join(__dirname, '/public/index.html');
var url = require("url");

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
var clients = []; // defines the clients array

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed
  return true;
}

console.log('*** VIDEO socket server running ***');

function heartbeat() {
  this.isAlive = true;
}

var interval = setInterval(() => {
  wss.clients.forEach((client) => {
    if (wss.isAlive === false) return //wss.terminate();
    client.send(JSON.stringify({
      'msgName': 'time',
      'type': 3,
      'message': new Date().toLocaleTimeString()
    }));
    //wss.isAlive = false;
    //wss.ping('', false, true);
  });
}, 2000);

// server.connections An Array with all connected clients
// it's useful for broadcasting a message:
wss.broadcast = function(msg) {
  for (var i in this.clients)
    if (client[i].readyState === Websocket.OPEN) {
      this.clients[i].sendText(msg);
    }
};


function safelyParseJson(json) {
  var JsonObject;
  try {
    JsonObject = JSON.parse(json);
  } catch (e) {
    console.log(e.message); // error in the above string (in this case, yes)!
    JsonObject = null;
  }
  return JsonObject;
}

wss.on('connection', function connection(ws, req) {
  //clients.push(ws);
  clients++;
  console.log(clients + ' Client connected');
  ws.isAlive = true;
  ws.on('pong', heartbeat);

  var ip = req.connection.remoteAddress;
  const ip2 = req.headers['x-forwarded-for'];
  console.log('ip2 :' + ip2);

  //console.log(ws._socket.remoteAddress);
  console.log('ip ' + ip);
  const location = url.parse(req.url, true);

console.log(ws.req.headers);

var userID = ws.req.headers['sec-websocket-key'];
  webSockets[userID] = ws;
  console.log('connected: ' + userID + ' in ' + Object.getOwnPropertyNames(ws));


  // You might use location.query.access_token to authenticate or share sessions
  // or req.headers.cookie (see http://stackoverflow.com/a/16395220/151312)

  ws.send(JSON.stringify({
    'msgName': 'newclientconnect',
    'type': 3,
    'message': clients + ' clients connected!'
  }));

  ws.on('close', function(connection) {
    console.log('Client disconnected');
    clients--;
    console.log((new Date()) + " Peer " +
      connection.remoteAddress + " disconnected.");
    wss.clients.forEach((client) => {
      if (ws.isAlive === false) return ws.terminate();
      ws.send(JSON.stringify({
        'msgName': 'newclientconnect',
        'type': 3,
        'message': clients + ' clients connected!'
      }));
    });
  });

  // once matrix is received from source it is send back to all clients

  // test de envio  como array
  ws.on('message', function(msg) {
    if (true) {
      ws.send(msg);
    } else {
    //console.log('message received ');
        var JsonObject = safelyParseJson(msg);
        //console.log("server: " + msg); // for debug
        if (JsonObject) {
          var msgName = JsonObject.msgName;
          var msgContent = JsonObject.message;
          if (msgName != null) {
            switch (msgName) {
              case "msgArray1":
                ws.send(JSON.stringify({
                  'msgName': 'msgArray1', // antes msgArray2
                  'type': 3,
                  'message': msgContent
                }));
                break;
              default: //;
            }
          }
        }
      }
  });
});
