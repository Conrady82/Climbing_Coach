document.getElementById("file-upload").addEventListener("change", (event) => {
  const file = event.target.files[0];
  const video = document.getElementById("climbing-video");
  const canvas = document.getElementById("output-canvas");
  const ctx = canvas.getContext("2d");

  // Load the video file
  const url = URL.createObjectURL(file);
  video.src = url;
  video.hidden = false;

  // Load Pose Estimation Model (PoseNet as an example)
  let net;
  posenet.load().then((model) => {
    net = model;
  });

  // Function to process video frame and perform pose estimation
  function processVideoFrame() {
    // Ensure the model is loaded
    if (net) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      // Perform pose estimation
      net.estimateSinglePose(video).then((pose) => {
        // Draw detected pose
        drawPose(pose);
      });
    }
  }

  // Draw Pose on Canvas
  function drawPose(pose) {
    // Draw each keypoint (e.g., hands, feet)
    for (let keypoint of pose.keypoints) {
      if (keypoint.score > 0.5) {
        ctx.beginPath();
        ctx.arc(keypoint.position.x, keypoint.position.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
      }
    }
  }

  // Process each frame when video is playing
  video.addEventListener("play", () => {
    setInterval(processVideoFrame, 100); // Adjust interval as needed
  });
});
