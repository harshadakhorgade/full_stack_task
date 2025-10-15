import React, { useState } from "react";

const VideoPlayer = () => {
  const [rtspUrl, setRtspUrl] = useState("");
  const [streaming, setStreaming] = useState(false);

  // Start or resume the stream
  const playStream = async () => {
    const urlToUse = rtspUrl.trim() || 0; // default webcam if blank
    await fetch("http://localhost:5000/set_rtsp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: urlToUse }),
    });
    setStreaming(true);
  };

  // Pause the stream
  const pauseStream = () => {
    setStreaming(false);
  };

  // Stop the stream and reset URL
  const stopStream = () => {
    setStreaming(false);
    setRtspUrl("");
  };

  return (
    <div>
      <h2>Livestream Video</h2>
      <input
        type="text"
        placeholder="Enter RTSP URL or leave blank for webcam"
        value={rtspUrl}
        onChange={(e) => setRtspUrl(e.target.value)}
        style={{ width: "300px", marginRight: "10px" }}
      />
      <button onClick={playStream}>Play</button>
      <button onClick={pauseStream}>Pause</button>
      <button onClick={stopStream}>Stop</button>

      <div style={{ marginTop: "20px" }}>
        {streaming && (
          <img
            src="http://localhost:5000/video_feed"
            alt="Livestream"
            style={{ width: "640px", height: "480px", border: "1px solid black" }}
          />
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;



