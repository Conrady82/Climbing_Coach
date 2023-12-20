let detector;

async function loadBlazePoseModel() {
  const model = poseDetection.SupportedModels.BlazePose;
  const detectorConfig = {
    runtime: "tfjs",
    enableSmoothing: true,
    modelType: "full", // You can change to 'lite' or 'heavy'
  };
  detector = await poseDetection.createDetector(model, detectorConfig);
}

document
  .getElementById("file-upload")
  .addEventListener("change", async (event) => {
    await loadBlazePoseModel();

    const file = event.target.files[0];
    const video = document.getElementById("climbing-video");
    const canvas = document.getElementById("output-canvas");
    const ctx = canvas.getContext("2d");
    const url = URL.createObjectURL(file);
    video.src = url;
    video.hidden = false;

    video.addEventListener("play", async () => {
      const intervalId = setInterval(async () => {
        if (!detector) {
          console.error("BlazePose model not loaded");
          return;
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const estimationConfig = { flipHorizontal: false };
        const poses = await detector.estimatePoses(video, estimationConfig);

        if (poses && poses.length > 0) {
          drawPose(ctx, poses[0]);
        }
      }, 100);

      video.addEventListener("pause", () => clearInterval(intervalId));
      video.addEventListener("ended", () => clearInterval(intervalId));
    });
  });

function drawPose(ctx, pose) {
  for (const keypoint of pose.keypoints) {
    if (keypoint.score > 0.5) {
      ctx.beginPath();
      ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = "red";
      ctx.fill();
    }
  }
}
