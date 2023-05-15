import React, { useState, useEffect } from 'react'
import Control from './contol'
import PropTypes from 'prop-types'

export default function User (props) {
  const [members, setMembers] = useState()
  const socketToken = localStorage.getItem('socketToken')
  const videoGrid = document.getElementById('video-grid')
  const myVideo = document.createElement('video')
  myVideo.muted = true

  // Prop Validation
  User.propTypes = {
    members: PropTypes.any.isRequired
  }

  // Create a Viedeo Stream
  const addVideoStream = (video, stream, id) => {
    video.srcObject = stream
    if (id !== socketToken) {
      video.className = 'other'
      video.id = id
    } else {
      video.className = 'userWaiting'
      video.id = id
    }
    video.addEventListener('loadedmetadata', () => {
      video.play()
    })
    videoGrid.append(video)
  }
  const checkForDuplicates = (array, keyName) => {
    return new Set(array.map((item) => item[keyName])).size !== array.length
  }

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (members !== props?.members) {
      setMembers(props?.members[0])
    }
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true
      })
      .then((stream) => {
        if (checkForDuplicates([].slice.call(videoGrid?.children), socketToken) === false) {
          addVideoStream(myVideo, stream, socketToken)
        } else {
          console.log('Stream already exist')
        }
      })
      .catch((err) => {
        console.error(err.message)
      })
  }, [props])
  /* eslint-enable react-hooks/exhaustive-deps */

  return (
    <div>
      <h1>Waiting for other users to join...</h1>
      <button
        onClick={() => {
          console.log(members)
        }}>
        Members
      </button>
      <h3>Room: {members?.roomId}</h3>
      <h3>Name: {members?.name?.username}</h3>
      <div id="video-grid"></div>
      <Control />
    </div>
  )
}
