var video;

var myJSON;
 var socket = io();

var ledMatrixWidth = 20;
var ledMatrixHeight = 24;

var myCanvasW = 800,
  myCanvasH = 600;

  var hScale = myCanvasW / ledMatrixWidth;
  var vScale = myCanvasH / ledMatrixHeight;

var lcolor = {
    "r":0,
    "g":0,
    "b":0
};

// preparo el objeto para el mensaje
var ledMatrix = [];

// led element not needed so far
function  LedElement(x,y,lcolor){
    this.x=x;
    this.y=y;
     this.lcol.r = lcolor
   }

function setup() {

  // connecto al servidor de socket, default is fixed ip
  //if (io.connect('192.168.0.16:3000')) {
  //socket = io.connect('192.168.0.16:3000')
  //} else {
  //  socket = io.connect('http://localhost:3000');
  //}

  createCanvas(myCanvasW, myCanvasH);
  pixelDensity(1);
  video = createCapture(VIDEO);
  video.size(width / hScale, height / vScale); // sets the video dom element size

// set up the matrix object and all elements
for (var y = 0; y < video.height; y++) {
  for (var x = 0; x < video.width; x++) {
    var index = (video.width - x + 1 + (y * video.width)) * 4;
    var r = x;
    var g = y;
    var b = 0;
    console.log(r,g,b);
    ledMatrix[y*ledMatrixWidth+x] = {"r":r,"g":g,"b":b};
  }
}
  console.log(ledMatrix);

  socket.on('newclientconnect',function(data){
			  //document.body.innerHTML = '';
			  //document.write(data.description);
	  });
}

function draw() {
  background(51);

  video.loadPixels();
  loadPixels();
  for (var y = 0; y < video.height; y++) {
    for (var x = 0; x < video.width; x++) {
      var index = (video.width - x + 1 + (y * video.width)) * 4;
      var r = video.pixels[index + 0];
      var g = video.pixels[index + 1];
      var b = video.pixels[index + 2];

      var bright = video.pixels[index + 3]; // (r+g+b)/3;

      //var w = map(bright, 0, 255, 0, vScale);
      noStroke();
      fill(r, g, b, bright);
      //rectMode(CENTER);
      rect(x * (hScale), y * (vScale), hScale, vScale);
      ledMatrix[y*ledMatrixWidth+x] = {"r":r,"g":g,"b":b};

    }
  }
   myJSON = JSON.stringify(ledMatrix);
   socket.emit('msgMatrixAserver', myJSON);
  //console.log(myJSON);
}
