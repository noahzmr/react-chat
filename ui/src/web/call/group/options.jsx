import React, { useEffect, useState, useContext } from 'react'
import PropTypes from 'prop-types'
import { ShowMsgContainerContext, ShowShareContainerContext } from '../../Services/context'
import { SocketContext } from '../../Services/default_values'

export default function Options(props) {
  Options.propTypes = {
    myStream: PropTypes.any,
    currentCall: PropTypes.any,
    roomId: PropTypes.any,
    peer: PropTypes.any,
    socket: PropTypes.any,
    members: PropTypes.any
  }

  // User Values
  /* eslint-disable no-unused-vars */
  const [peer, setPeer] = useState()
  const [myStream, setMyStream] = useState()
  const [screenShare, setScreenShare] = useContext(ShowShareContainerContext)
  const [socket, setSocket] = useContext(SocketContext)
  const userId = localStorage.getItem('user');
  const [members, setMembers] = useState(null)
  // Call partner Values
  const [roomId, setRoomId] = useState(false)

  // Stream values
  const [notMuted, setNotMuted] = useState(true)
  const [video, setVideo] = useState(true)
  const [share, setShare] = useState()
  // Send Call
  const [currentCall, setCurrentCall] = useState(null)

  // message Properties
  const [showMsgContainer, setShowMsgContainer] = useContext(ShowMsgContainerContext)

  // Update the Streams
  const updateStreams = (stream) => {
    if (stream === true || stream === false) {
      console.log('ScreenShare has updated', roomId, userId)
      const val = {
        roomId: roomId,
        user: userId,
        socketId: socket.id,
        screenShare: stream
      }
      socket.emit('update-screen-share', val)
    } else {
      const audio = stream.getAudioTracks()[0].enabled
      const vid = stream.getVideoTracks()[0].enabled
      console.log('Stream has updated', roomId, userId, audio, vid)
      const val = {
        roomId: roomId,
        user: userId,
        audio: audio,
        video: vid,
        socketId: socket.id,
        screenShare: screenShare
      }
      socket.emit('update-stream', val)
    }
  }

  // End Call function
  const endCall = () => {
    currentCall?.close()
    setScreenShare(false)
  }

  // Get Screen stream
  const captureScreen = async () => {
    if (!screenShare) {
      setScreenShare(true)
      updateStreams(true)
      navigator.mediaDevices
        .getDisplayMedia({
          video: {
            cursor: 'always'
          },
          audio: false
        })
        .then((stream) => {
          setShare(stream)

          members.forEach((item) => {
            if (item.peer !== peer.id) {
              console.log(item.peer, peer.id)
              const call = peer?.call(item.peer, stream, {
                metadata: { type: 'screenshare' }
              })
              console.log(peer, call, call.metadata)
              document.getElementById('screen-share').srcObject = stream
              document.getElementById('screen-share').play()
              call.on('stream', (stream) => {
                document.getElementById('screen-share').srcObject = stream
                document.getElementById('screen-share').play()
              })
              call.on('data', (stream) => {
                document.querySelector('#screen-share').srcObject = stream
              })
              call.on('error', (err) => {
                console.log(err)
              })
              call.on('close', () => {
                document.getElementById('screen-share').srcObject = ''
              })
            }
          })
        })
        .catch((err) => console.error(err.message))
    } else {
      share?.getTracks()[0].stop()
      setScreenShare(false)
      updateStreams(false)
    }
  }
  // Mute and unmute the microphone function
  const muteMic = () => {
    if (notMuted) {
      console.log('change Video Attributes...', {
        video,
        audio: false
      })
      setNotMuted(false)
      myStream.getAudioTracks()[0].enabled = false
      updateStreams(myStream)
    } else {
      console.log('change Video Attributes...', {
        video,
        audio: true
      })
      setNotMuted(true)
      myStream.getAudioTracks()[0].enabled = true
      updateStreams(myStream)
    }
  }

  // Mute and unmute the video function
  const muteCam = () => {
    if (video) {
      console.log('change Video Attributes...', {
        video: false,
        audio: notMuted
      })
      setVideo(false)
      console.log('STREAM: ', myStream.getVideoTracks())
      myStream.getVideoTracks()[0].enabled = false
      updateStreams(myStream)
    } else {
      console.log('change Video Attributes...', {
        video: true,
        audio: notMuted
      })
      setVideo(true)
      myStream.getVideoTracks()[0].enabled = true
      updateStreams(myStream)
    }
  }

  useEffect(() => {
    setMyStream(props?.myStream)
    setCurrentCall(props?.currentCall)
    setRoomId(props?.roomId)
    setPeer(props?.peer)
    setSocket(props?.socket)
    setMembers(props.members)
  }, [props])
  /* eslint-enable no-unused-vars */

  return (
    <div className="options">
      <button
        className="iconBtn"
        onClick={() => {
          muteMic()
        }}>
        {!notMuted ? <i className="bi bi-mic-mute"></i> : <i className="bi bi-mic-fill"></i>}
      </button>
      <button
        className="iconBtn"
        onClick={() => {
          muteCam()
        }}>
        {video ? (
          <i className="bi bi-camera-video-fill"></i>
        ) : (
          <i className="bi bi-camera-video-off"></i>
        )}
      </button>
      <button
        className="callBtn end"
        onClick={() => {
          endCall()
        }}>
        <i className="bi bi-telephone-fill"></i>
      </button>
      <button
        onClick={() => {
          showMsgContainer === 'none' ? setShowMsgContainer('flex') : setShowMsgContainer('none')
        }}
        className="iconBtn">
        <i className="bi bi-chat"></i>
      </button>
      <button
        onClick={() => {
          captureScreen()
        }}
        className="iconBtn">
        {!screenShare ? <i className="bi bi-display"></i> : <i className="bi bi-display-fill"></i>}
      </button>
    </div>
  )
}
