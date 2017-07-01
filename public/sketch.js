var video;

var myJSON;

var HOST = location.origin.replace(/^http/, 'ws');
var ws = new WebSocket(HOST);

var ledMatrixWidth = 20;
var ledMatrixHeight = 24;

var myCanvasW = 800,
  myCanvasH = 600;
var myCanvas;
var h1;

var hScale = myCanvasW / ledMatrixWidth;
var vScale = myCanvasH / ledMatrixHeight;

var lcolor = {
  "r": 0,
  "g": 0,
  "b": 0
};
var matrixReceived = [lcolor];

// preparo el objeto para el mensaje
var ledMatrix = [lcolor];

// led element not needed so far
function LedElement (x, y, lcolor) {
  this.x = x;
  this.y = y;
  this.lcolor = lcolor;
}

function setup () {

  // connecto al servidor de socket, default is fixed ip
  //if (io.connect('192.168.0.16:3000')) {
  //socket = io.connect('192.168.0.16:3000')
  //} else {
  //  socket = io.connect('http://localhost:3000');
  //}

  myCanvas = createCanvas(myCanvasW, myCanvasH);
  //myCanvas.position(10, 300);
  pixelDensity(1);
  myCanvas.parent('#canvas1');

  video = createCapture(VIDEO);

  video.size(myCanvas.width / hScale, myCanvas.height / vScale); // sets the video dom element size
  //video.position(0, 0);
    video.parent('#canvas2')

  // set up the matrix object and all elements
  for (var y = 0; y < video.height; y++) {
    for (var x = 0; x < video.width; x++) {
      var index = (video.width - x + 1 + (y * video.width)) * 4;
      lcolor.r = x;
      lcolor.g = y;
      lcolor.b = 0;
      console.log(lcolor);
      ledMatrix[y * ledMatrixWidth + x] = {
        "r": lcolor.r,
        "g": lcolor.g,
        "b": lcolor.b
      };
    }
  }
  console.log(ledMatrix);

  ws.onmessage('newclientconnect', function (data) {
    var footer1 = select('#footer1');
    footer1.html('descripcion :' + data.description);
  });

  ws.on('messages', function (msg) {
    var footer2 = select('#footer2');
    footer2.html('FR= ' + floor(frameRate()));
      console.log('recibido :', msg.length);
      var parsed = JSON.parse(msg);
      matrixReceived = parsed.message;
      // matrixReceived = JSON.parse(msg);
  });

  // recibe matrix como array ( test)
  ws.onmessage('msgArray2', function (msg) {
    var footer2 = select('#footer2');
    footer2.html('FRarray= ' + floor(frameRate()));
      console.log('recibido array:', msg.length);
      //var parsed = JSON.parse(msg);
      matrixReceived = msg;
      // matrixReceived = JSON.parse(msg);
  });

  ws.onmessage('time', function (data) {
    var footer3 = select('#footer3');
     var parsed = JSON.parse(data);
     var time = parsed.message;
    footer3.html('time = ' + time);
      console.log('date :', time);

  });
}

function draw() {
  background(100);

  video.loadPixels();
  loadPixels();
  for (var y = 0; y < video.height; y++) {
    for (var x = 0; x < video.width; x++) {
      var index = (video.width - x + 1 + (y * video.width)) * 4;
      lcolor.r = video.pixels[index + 0];
      lcolor.g = video.pixels[index + 1];
      lcolor.b = video.pixels[index + 2];
      var bright = video.pixels[index + 3]; // (r+g+b)/3;

      ledMatrix[y * ledMatrixWidth + x] = {
        "r": lcolor.r,
        "g": lcolor.g,
        "b": lcolor.b
      };

      // load received matrix instead of original matrix
      //ledMatrix holds de source leds , to be sent to server
      //matrixReceived is the Matrix "rebounded" by the server to clients
      // if you need to see on canvas the sent matrix , just commentOut next line
      lcolor = Object.assign({}, matrixReceived[y * ledMatrixWidth + x]);

      //var w = map(bright, 0, 255, 0, vScale);
      noStroke();
      fill(lcolor.r, lcolor.g, lcolor.b, bright);
      //rectMode(CENTER);
      rect(x * (hScale), y * (vScale), hScale, vScale);
    }
  }
  // sends Matrix pixel data to server as 1 matrix per frame
  myJSON = JSON.stringify(ledMatrix);
  // socket.emit('msgMatrixAserver', myJSON); // * original ok
  ws.send('msgArray1', ledMatrix); // testing array
  // console.log(myJSON);
}
