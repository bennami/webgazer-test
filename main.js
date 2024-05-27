let recording = null;
let recordingStartTime = null;
let recordingImageIndex = null;

let prevX = null, prevY = null;

//this function records some data that you download
function downloadOBJ(recording, imageIndex) {
  let obj = ``;
  for (let i = 0; i < recording.length; i++) {
    const { x, y, time } = recording[i];
    obj += `v ${x / 500} ${y / 500} ${time}\n`;
  }
  obj += `l `;
  for (let i = 0; i < recording.length; i++) {
    obj += `${i + 1} `;
  }
  console.log(recording);
  const a = document.createElement("a");
  const file = new Blob([obj], {
    type: "application/json",
  });
  a.href = URL.createObjectURL(file);
  a.download = `recording-${recordingStartTime}-${imageIndex}.obj`;
  a.click();
  URL.revokeObjectURL(a.href);
}
let pic;
function loadRandomImage() {
  const TOTAL_IMAGE_COUNT = 12;
  const imageIndex = Math.ceil(Math.random() * TOTAL_IMAGE_COUNT);
  const filename = `images/image-${imageIndex}.jpg`;
  const img = document.createElement("img");
  img.src = filename;
  const imageContainer = document.querySelector("#image-container");
  imageContainer.innerHTML = "";
  imageContainer.appendChild(img);
  pic = document.querySelector('#image-container img')
  console.log(pic);

  //dowload png from canvas on tab

  //var png = ReImg.fromSvg(pic).downloadPng();
  //var pngblack = ReImg.fromCanvas(document.getElementById('blackCanvas')).downloadPng();

  /*
  here is where you download the object, you can uncomment this when needed.
  */

  // if (recording !== null) {
  //   downloadOBJ(recording, recordingImageIndex);
  // }

  // ctx.clearRect(0, 0, gazeCanvas.width, gazeCanvas.height);
  // recordingImageIndex = imageIndex;
  // recording = [];
  // recordingStartTime = Date.now();

  initializeBlackCanvas();
}

function initializeBlackCanvas() {
  blackCanvas.width = window.innerWidth;
  blackCanvas.height = window.innerHeight;
  blackCtx.clearRect(0, 0, blackCanvas.width, blackCanvas.height);
}




// Function to save the canvas as a PNG
function saveCanvasAsPNG(canvas, filename) {
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = filename;
  link.click();
}

// Function to save the image element as a PNG
function saveImageAsPNG(imgElement, filename) {
  const imgCanvas = document.createElement('canvas');
  const imgCtx = imgCanvas.getContext('2d');
  imgCanvas.width = imgElement.width;
  imgCanvas.height = imgElement.height;
  imgCtx.drawImage(imgElement, 0, 0);
  const link = document.createElement('a');
  link.href = imgCanvas.toDataURL('image/png');
  link.download = filename;
  link.click();
}

//event listener for keypress (when you press spacebar i guess?)
window.addEventListener("keypress", (event) => {
  console.log(event.key);
  if (event.key === " ") {
    loadRandomImage();
  }
  initializeBlackCanvas();

  saveImageAsPNG(pic, "image")
});

//here we create the canvas where our images are placed..
const gazeCanvas = document.getElementById("gaze-canvas");
const ctx = gazeCanvas.getContext("2d");
gazeCanvas.width = window.innerWidth;
gazeCanvas.height = window.innerHeight;

// We add a second black canvas to create the erase effect
const blackCanvas = document.getElementById("blackCanvas");
const blackCtx = blackCanvas.getContext("2d");
initializeBlackCanvas();

webgazer
  .setGazeListener(function (data, elapsedTime) {
    if (data == null) {
      return;
    }
    const x = data.x;
    const y = data.y;
    if (recording !== null) {
      recording.push({ x, y, time: (Date.now() - recordingStartTime) / 1000 });
    }

    if (prevX !== null && prevY !== null) {
      interpolateErase(prevX, prevY, x, y);
    } else {
      smoothBrush(x, y);
    }

    prevX = x;
    prevY = y;

  })
  .begin();


  

//this is the part where we create the erase function
const brushRadius = 30; // Adjust radius for softer effect

function interpolateErase(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const steps = Math.ceil(distance / brushRadius);

  for (let i = 0; i < steps; i++) {
    const x = x1 + (dx * i) / steps;
    const y = y1 + (dy * i) / steps;
    smoothBrush(x, y);
  }
}

function smoothBrush(x, y) {
  // Erase a circular area with a gradient - destination-out  - source-over
  blackCtx.globalCompositeOperation = "source-over";
  const gradient = blackCtx.createRadialGradient(x, y, 0, x, y, brushRadius);

  gradient.addColorStop(0, "rgba(0, 0, 0, 0.3)"); 
  gradient.addColorStop(1, "rgba(0, 0, 0, 0)"); 
  blackCtx.fillStyle = gradient;
  blackCtx.beginPath();
  blackCtx.arc(x, y, brushRadius, 0, 2 * Math.PI);
  blackCtx.fill();
}

/*
// livecam on canvas
console.clear();
;(function(){
 
navigator.getUserMedia  = navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia;

if ( !navigator.getUserMedia ) { return false; }
  
  var width = 0, height = 0;
  
  var canvas = document.getElementById('livecam-canvas'),
      ctx = canvas.getContext('2d');
  document.body.appendChild(canvas);
  
  var video = document.createElement('video'),
      track;
  video.setAttribute('autoplay',true);
  
  window.vid = video;
  
  function getWebcam(){ 
  
    navigator.getUserMedia({ video: true, audio: false }, function(stream) {
      video.srcObject = stream;
      track = stream.getTracks()[0];
    }, function(e) {
      console.error('Rejected!', e);
    });
  }
  
  getWebcam();
  
  var rotation = 0,
      loopFrame,
      centerX,
      centerY,
      twoPI = Math.PI * 2;
  
  function loop(){
    
    loopFrame = requestAnimationFrame(loop);
    
    ctx.save();
    
    ctx.globalAlpha = 0.1;
    ctx.drawImage(video, 0, 0, width, height);
    
    ctx.restore();

  }
  
  function startLoop(){ 
    loopFrame = loopFrame || requestAnimationFrame(loop);
  }
  
  video.addEventListener('loadedmetadata',function(){
    width = canvas.width = video.videoWidth;
    height = canvas.height = video.videoHeight;
    centerX = width / 2;
    centerY = height / 2;
    startLoop();
  });
  
  canvas.addEventListener('click',function(){
    if ( track ) {
      if ( track.stop ) { track.stop(); }
      track = null;
    } else {
      getWebcam();
    }
  });
  
  
})()
*/