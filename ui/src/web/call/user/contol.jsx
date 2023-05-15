import React, { useState } from 'react'

export default function Control () {
  const [video, setVideo] = useState(true)
  const [audio, setAudio] = useState(true)

  return (
    <div className="control">
      <button
        onClick={() => {
          video ? setVideo(false) : setVideo(true)
        }}
      >
        {video
          ? (
          <i className="bi bi-camera-video-fill"></i>
            )
          : (
          <i className="bi bi-camera-video-off"></i>
            )}
      </button>
      <button
        onClick={() => {
          audio ? setAudio(false) : setAudio(true)
        }}
      >
        {audio
          ? (
          <i className="bi bi-mic-fill"></i>
            )
          : (
          <i className="bi bi-mic-mute"></i>
            )}
      </button>
    </div>
  )
}
