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
  URL.revokeObjectURL(a.href);
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
    ctx.globalCompositeOperation = "source-over";
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 50);
    gradient.addColorStop(0, "rgba(0, 0, 0, 0.3)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = gradient; // "rgba(255, 255, 255, 0.01)";
    ctx.lineWidth = 5;
    if (prevX && prevY) {
      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.arc(x, y, 50, 0, 2 * Math.PI);
      //   ctx.lineTo(x, y);
      ctx.fill();
    }
    prevX = x;
    prevY = y;
  })
  .begin();