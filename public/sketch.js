var video;

var myJSON;
// https://www.npmjs.com/package/ws
// initialize connection to the server
var HOST = location.origin.replace(/^http/, 'ws');
var ws = new WebSocket(HOST);


var ledMatrixWidth = 20; //20
var ledMatrixHeight = 24; //24

var myCanvasW = 800,
  myCanvasH = 600;
var myCanvas;
var h1;

var hScale = myCanvasW / ledMatrixWidth;
var vScale = myCanvasH / ledMatrixHeight;
// {r,g,b}
//var lcolor = {
//  "r": 0,
//  "g": 0,
//  "b": 0
//};

var lcolor = [0, 0, 0];

var matrixReceived = [];
//for(var matrixReceived = [], x=ledMatrixWidth; x--; matrixReceived[x]=[lcolor]);
// ahora lo organizo como matriz [y][x]
var readyToSend = 1; // setup value is 0 . when ESP parses a received frame it autorizes a new one
const OK = 1;
const notOK = 0;

// preparo el objeto para el mensaje
var ledMatrix = [];
//for(var ledMatrix = [], x=ledMatrixWidth; x--; ledMatrix[x]=[lcolor]);

// Prepare data and send as binary socket
function sendBinary(binData) {
  var merged = [].concat.apply([], binData)
  ws.binaryType = 'arraybuffer';
  var byteArray = new Uint8Array(merged); // combina los arrays RGB en un array plano
  ws.send(byteArray.buffer);
}


// led element not needed so far
function LedElement(x, y, lcolor) {
  this.x = x;
  this.y = y;
  this.lcolor = lcolor;
}

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

function setup() {
  frameRate(30);
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
  video.parent('#canvas2');

  // set up the matrix object and all elements
  for (var x = 0; x < video.width; x++) {
    for (var y = 0; y < video.height; y++) {
      // var index = (y + (x * video.height)) * 4;
      lcolor = [int(x * 254 / ledMatrixWidth),int(x * 254 / ledMatrixWidth),int(x * 254 / ledMatrixWidth)]; // for debugging and identification
      if (x/2==int(x/2)) {
        lcolor = [0,0,0]
      }
      console.log(lcolor);
      ledMatrix[x * ledMatrixHeight + y] = lcolor; // vertical serpentine layout
      //ledMatrix[x][y] = lcolor;
    }

  }
  console.log(ledMatrix); // solo la columna y=0

  ws.onopen = function(evt) {
    var footer1 = select('#footer1');
    footer1.html('descripcion :' + evt.type);
  };


  ws.onmessage = function(evt) {
    //if (typeof evt.data === 'string') { // utf8 o string
    //create a JSON object
    var tipo = evt.data instanceof ArrayBuffer;
    if (tipo) {
      // if binary
      //*console.log('binario');
      var buffer = new ArrayBuffer;
       buffer = (evt.data);
       var bufferView = new Uint8Array(buffer); // enable access to the buffer array
      //var bufferArray = Array.from(buffer); // convert to normal array
      //*console.log(bufferView);
      for (var x = 0; x <  ledMatrixWidth; x++) {
        for (var y= 0; y < ledMatrixHeight; y++) {
          var index = (y + (x * ledMatrixHeight)); // index represents pixels adress, index*3 is begining of each RGB value on the flat bin arrray
          // converts to a normal array
          matrixReceived[index] = [bufferView[3*index+0],bufferView[3*index + 1],bufferView[3*index + 2]];
          //matrixReceived[index+1] = bufferView[index + 1];
          //matrixReceived[index+2] = bufferView[index + 2];

          //matrixReceived = evt.data
          //alert('binary received')
          //readyToSend = OK; //* enable for  debugging , receiving a frame enables the next
        }
      }

    } else {
      // if text UTF-8
      //*console.log('text');
      var JsonObject = safelyParseJson(evt.data);
      var msgName = JsonObject.msgName;
      var msgContent = JsonObject.message;
      switch (msgName) {
        case "msgArray1": // antes msgArray2
          //var columna = JsonObject.columna ;
          var footer2 = select('#footer2');
          footer2.html('FRarray= ' + floor(frameRate()));
          //console.log('recibido array:', evt.length);
          matrixReceived = msgContent;
          //readyToSend = OK; // enable for  debugging , receiving a frame enables the next
          break;
        case "recibido":
          readyToSend = OK;
          break;
        case "time":
          var footer3 = select('#footer3');
          var time = msgContent;
          footer3.html('time = ' + time);
          //console.log('date :', time);
          break;
        default:
      }
    };
  };
} // end of setup

function draw() {
  background(100);
  video.loadPixels();
  loadPixels();
  for (var y = 0; y < video.height; y++) {
    for (var x = 0; x < video.width; x++) {
      //var index = (video.width - x + 1 + (y * video.width)) * 4;
      var index = (x + (y * video.width)) * 4;
      //lcolor.r = video.pixels[index + 0];
      //lcolor.g = video.pixels[index + 1];
      //lcolor.b = video.pixels[index + 2];
      var bright = video.pixels[index + 3]; // (r+g+b)/3;
      lcolor = [video.pixels[index + 0], video.pixels[index + 1],
      video.pixels[index + 2]];
      // ledMatrix[y * ledMatrixWidth + x] = lcolor; // ** ! enable this rebound at heroku (NO ESP)
       //ledMatrix[(ledMatrixHeight-y) +  x * ledMatrixHeight] = lcolor; // ** For led matrix with ESP

      // load received matrix instead of original matrix
      //ledMatrix holds de source leds , to be sent to server
      //matrixReceived is the Matrix "rebounded" by the server to clients
      // if you need to see on canvas the sent matrix , just commentOut next line

      //lcolor = Object.assign({}, matrixReceived[y * ledMatrixWidth + x]); // ** ! enable to see the image send form heroku
        //lcolor = Object.assign({}, matrixReceived[(ledMatrixHeight-y) + ledMatrixHeight * x]); // ** ! enable to see the image send by ESP
      noStroke();
      // fill(lcolor.r, lcolor.g, lcolor.b, bright);
      fill(lcolor[0], lcolor[1], lcolor[2], bright);
      //rectMode(CENTER);
      rect(x * (hScale), y * (vScale), hScale, vScale);
      // console.log(myJSON);
    }

  }
  // sends Matrix pixel data to server as 1 matrix per frame
  // socket.emit('msgMatrixAserver', myJSON); // * original ok
  // en lugar de enviar toda la matriz , envio cada columna por separado para limitar el uso de memoria en el ESP
  if (ws.readyState * readyToSend) {
    var obj = {
      'msgName': "msgArray1",
      'type': 3,
      'message': ledMatrix // antes ledMatrix[x]
      //'columna':x
    };
    //ws.send(JSON.stringify(obj));
    sendBinary(ledMatrix); //  binary send
    readyToSend = notOK; // noOK  -  change to OK for debug
  }


}
