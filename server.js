// prepare the HTTP server on port 3000
//We need an HTTP server to do two things: serve our client-side assets
//and provide a hook for the WebSocket server to monitor for upgrade requests
var express = require('express');
const Websocket = require('ws');
//var clientes = {} ;// userID: webSocket

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
    console.log(this.address());
  });


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
var count = 0; // clients index
var id = count;

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
  wss.clients.forEach((client)=> {
    if (client.readyState === Websocket.OPEN) { // antes (cl.readyState === Websocket.OPEN)
      client.send(msg);
      //console.log('clients Id ' + client._ultron.id ) ; // client id
      //console.log('Nro de clientes[] ' + clients.length ) ; // client id
    }
  });
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
  //clients.push(ws);  // testing
  console.log('local adress ');
  console.log(req.connection.localAddress);

  console.log('remote  port ');
  console.log(req.connection.remotePort);

  console.log('local  port ');
  console.log(req.connection.localPort);

  // to identify the parameters tree , just list ws._socket
  // and see on the console the detail tree

  console.log('parametros name ');
  console.log(ws._socket._sockname);
  console.log('parametros peername ');
  console.log(ws._socket._peername);

  console.log('key');
  console.log(ws._socket._server._connectionKey);

  count++;
  console.log(count + ' Client connected');
  ws.isAlive = true;
  ws.on('pong', heartbeat);


  var ip = req.connection.remoteAddress;
  const ip2 = req.headers['x-forwarded-for']; //
  console.log('ip2 :' + ip2);

  //console.log(ws._socket.remoteAddress);
  console.log('ip ' + ip);
  const location = url.parse(req.url, true);
  console.log('location : ' + location);
  //console.log(ws);

  //var connection = ws.accept('', ws.origin);
  var connection = ws;
  var userID = ws._socket._server._connectionKey;
  id = count;
  // Store the connection method so we can loop through & contact all clients

  clients[id] = connection;
  console.log('connected: ' + userID + ' in ' + Object.getOwnPropertyNames(ws));
  console.log('connection');
  console.log(clients[id]);

  // You might use location.query.access_token to authenticate or share sessions
  // or req.headers.cookie (see http://stackoverflow.com/a/16395220/151312)

  ws.send(JSON.stringify({
    'msgName': 'newclientconnect',
    'type': 3,
    'message': count + ' clients connected!'
  }));

  ws.on('close', function(connection) {
    console.log('Client disconnected');
    count--;
    console.log((new Date()) + " Peer " +
      req.connection.remoteAddress + " disconnected.");
    //clients.forEach((i) => {
    if (ws.isAlive === false) return ws.terminate();
    wss.clients.forEach(function each(cl) {
      cl.send(JSON.stringify({
        'msgName': 'newclientconnect',
        'type': 3,
        'message': count + ' clients connected!'
      }));
    });
    //});
  });

  // once matrix is received from source it is send back to all clients

  // test de envio  como array
  ws.on('message', function(msg) {
    if (false) { // just a bypass to avoid parsing and test performance
      wss.broadcast(msg);
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
            //var columna = JsonObject.columna;
              //console.log(msgContent.length); // debug
              wss.broadcast(JSON.stringify({ // antes ws.send ()
                'msgName': 'msgArray1', // antes msgArray2
                'type': 3,
                'message': msgContent
                //'columna' :columna
              }));
              break;
            default: //;
          }
        }
      }
    }
  });
});
