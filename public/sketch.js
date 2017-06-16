var video;

var myJSON;
var socket = io();

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

// preparo el objeto para el mensaje
var ledMatrix = [lcolor];

// led element not needed so far
function LedElement(x, y, lcolor) {
  this.x = x;
  this.y = y;
  this.lcolor = lcolor;
}

function setup() {

  // connecto al servidor de socket, default is fixed ip
  //if (io.connect('192.168.0.16:3000')) {
  //socket = io.connect('192.168.0.16:3000')
  //} else {
  //  socket = io.connect('http://localhost:3000');
  //}

  myCanvas = createCanvas(myCanvasW, myCanvasH);
  //myCanvas.position(10, 300);
  pixelDensity(1);
  video = createCapture(VIDEO);

  video.size(myCanvas.width / hScale, myCanvas.height / vScale); // sets the video dom element size
  video.position(400, 0);

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

  socket.on('newclientconnect', function(data) {
    //document.footer = '';
    //document.write(data.description);
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

      //var w = map(bright, 0, 255, 0, vScale);
      noStroke();
      fill(lcolor.r, lcolor.g, lcolor.b, bright);
      //rectMode(CENTER);
      rect(x * (hScale), y * (vScale), hScale, vScale);
      ledMatrix[y * ledMatrixWidth + x] = lcolor;
      //ledMatrix[y*ledMatrixWidth+x] = {"r":r,"g":g,"b":b};
    }
  }
  myJSON = JSON.stringify(ledMatrix);
  socket.emit('msgMatrixAserver', myJSON);
  //console.log(myJSON);
}
