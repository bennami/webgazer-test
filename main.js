let recording = null;
let recordingStartTime = null;
let recordingImageIndex = null;

let prevX = null, prevY = null;

// Function to download the recorded data as an OBJ file
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

// Function to load a random image
function loadRandomImage(callback) {
  const TOTAL_IMAGE_COUNT = 12;
  const imageIndex = Math.ceil(Math.random() * TOTAL_IMAGE_COUNT);
  const filename = `images/image-${imageIndex}.jpg`;
  const img = new Image();
  img.src = filename;
  img.onload = () => {
    const imageContainer = document.querySelector("#image-container");
    imageContainer.innerHTML = "";
    imageContainer.appendChild(img);
    initializeBlackCanvas();
    if (callback) callback(img, imageIndex);
  };
  img.onerror = () => {
    console.error("Failed to load image");
  };
}

// Initialize the black canvas
function initializeBlackCanvas() {
  blackCanvas.width = window.innerWidth;
  blackCanvas.height = window.innerHeight;
  blackCtx.clearRect(0, 0, blackCanvas.width, blackCanvas.height);
  blackCanvas.style.backgroundColor = 'transparent';
}


// Save image element
function saveImageAsPNG(imgElement, filename) {
  const link = document.createElement('a');
  link.href = imgElement.src;
  link.download = filename;
  link.click();
}

// Save canvas as PNG
function saveCanvasAsPNG(canvas, filename) {
  // Convert canvas to Blob object
  canvas.toBlob(function(blob) {
    // Create a link element
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  }, 'image/png');
}



// Event listener for keypress (when you press spacebar)
window.addEventListener("keypress", (event) => {
  console.log(event.key);
  if (event.key === " ") {
    loadRandomImage((imgElement, imageIndex) => {
   
      saveImageAsPNG(imgElement, `random-image-${imageIndex}-${Date.now()}.png`);
    });

    saveCanvasAsPNG(blackCanvas, `black-canvas-${Date.now()}.png`);
  }
  initializeBlackCanvas();
});

// Initialize the canvas where images are placed
const gazeCanvas = document.getElementById("gaze-canvas");
const ctx = gazeCanvas.getContext("2d");
gazeCanvas.width = window.innerWidth;
gazeCanvas.height = window.innerHeight;

// We add a second black canvas to create the erase effect
const blackCanvas = document.getElementById("blackCanvas");
const blackCtx = blackCanvas.getContext('2d');
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

// Adjust brush radius as needed
const brushRadius = 30;

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
  // Erase a circular area with a gradient destination-out, draw is source-over
  blackCtx.globalCompositeOperation = "source-over";
  const gradient = blackCtx.createRadialGradient(x, y, 0, x, y, brushRadius);
  gradient.addColorStop(0, "rgba(255, 0, 0, 0.3)");
  gradient.addColorStop(1, "rgba(255, 0, 0, 0)");
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
      if ( track stop ) { track.stop(); }
      track = null;
    } else {
      getWebcam();
    }
  });

})()
*/
