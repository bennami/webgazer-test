let recording = null;
let recordingStartTime = null;
let recordingImageIndex = null;

let prevX, prevY;

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
  //   console.log(recording);
  const a = document.createElement("a");
  const file = new Blob([obj], {
    type: "application/json",
  });
  a.href = URL.createObjectURL(file);
  a.download = `recording-${recordingStartTime}-${imageIndex}.obj`;
  a.click();
}

function loadRandomImage() {
  const TOTAL_IMAGE_COUNT = 12;
  const imageIndex = Math.ceil(Math.random() * TOTAL_IMAGE_COUNT);
  const filename = `images/image-${imageIndex}.jpg`;
  const img = document.createElement("img");
  img.src = filename;
  const imageContainer = document.querySelector("#image-container");
  imageContainer.innerHTML = "";
  imageContainer.appendChild(img);

  if (recording !== null) {
    downloadOBJ(recording, recordingImageIndex);
  }

  ctx.clearRect(0, 0, gazeCanvas.width, gazeCanvas.height);
  recordingImageIndex = imageIndex;
  recording = [];
  recordingStartTime = Date.now();
}

window.addEventListener("keypress", (event) => {
  console.log(event.key);
  if (event.key === " ") {
    loadRandomImage();
  }
});

const gazeCanvas = document.getElementById("gaze-canvas");
const ctx = gazeCanvas.getContext("2d");
gazeCanvas.width = window.innerWidth;
gazeCanvas.height = window.innerHeight;

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
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    if (prevX && prevY) {
      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    prevX = x;
    prevY = y;
  })
  .begin();
