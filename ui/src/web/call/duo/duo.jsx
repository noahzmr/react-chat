import React, { useEffect, useState, useContext } from 'react'
import axios from 'axios'
import TryToCall from './tryToCall'
import GetCall from './getCall'
import { AcceptContext } from '../../Services/context'
import Messages from './message'
import PropTypes from 'prop-types'
import { BackendContext } from '../../Services/default_values'
import gravatar from 'gravatar'

export default function Duo(props) {
  // User Values
  const peer = props?.myPeer
  const chatName = props?.chatName
  const [myStream, setMyStream] = useState(props?.myStream)
  const [myPeerId, setMyPeerId] = useState()
  const userName = localStorage.getItem('user')
  const [inCall, setInCall] = useState(false)
  const [acceptCall, setAcceptCall] = useContext(AcceptContext)
  const [screenShare, setScreenShare] = useState(false)

  // Call partner Values
  const [otherPeer, setOtherPeer] = useState(false)

  // Stream values
  const [notMuted, setNotMuted] = useState(true)
  const [video, setVideo] = useState(true)

  // Send Call
  const [tryToCall, setTryToCall] = useState(false)
  const [currentCall, setCurrentCall] = useState(null)
  const [currenScreenShare, setCurrenScreenShare] = useState(null)
  // Incoming Call
  const [getCall, setGetCall] = useState(false)
  const [incommingCall, setIncomingCall] = useState(null)
  const [incommingScreenShare, setIncomingScreenShare] = useState(null)

  const [backend, setBackend] = useContext(BackendContext)
  const userID = localStorage.getItem('user')
  const email = localStorage.getItem('email')
  // Prop Validation
  Duo.propTypes = {
    myPeer: PropTypes.any.isRequired,
    myStream: PropTypes.any.isRequired,
    chatName: PropTypes.any.isRequired
  }
  // message Properties
  const [showMsg, setShowMsg] = useState(false)
  // Avatars from the users default
  const DefaultAvatar = (event, email) => {
    var url = gravatar.url(email)
    console.warn(
      'gravatarv PeopleList:',
      url,
      email,
      gravatar.profile_url(email, { protocol: 'https' })
    )

    axios
      .get(gravatar.profile_url(email, { protocol: 'https' }))
      .then((res) => {
        console.warn('gravatar JSON', res.data)
        event.target.src = url
      })
      .catch((err) => {
        if (err) {
          console.log('gravatar JSON', err.message)
          event.target.src =
            'https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png'
        }
      })
  }

  // Class for the local video stream
  const localClass = () => {
    if (!getCall && !tryToCall && !inCall) {
      return 'main-video'
    } else {
      if (!screenShare) {
        return 'local-video'
      } else {
        return 'side-video'
      }
    }
  }
  // Update Peer id on the Server
  peer?.on('open', (id) => {
    setMyPeerId(id)
    const values = {
      peerId: id,
      user: userName
    }
    axios
      .post(`ttps://${backend}/auth/peer`, values, {
        withCredentials: true
      })
      .then(() => {
        console.log('Update PeerId')
      })
      .catch((err) => {
        console.log(err.message)
      })
  })

  // Call User function
  const callUser = async () => {
    setGetCall(true)
    // switch to the video call and play the camera preview
    document.getElementById('local-video').srcObject = myStream
    document.getElementById('local-video').play()
    // make the call
    const call = peer?.call(otherPeer, myStream)
    call.on('stream', (stream) => {
      document.getElementById('remote-video').srcObject = stream
      document.getElementById('remote-video').play()
      setInCall(true)
      setGetCall(false)
    })
    call.on('data', (stream) => {
      document.querySelector('#remote-video').srcObject = stream
    })
    call.on('error', (err) => {
      console.log(err)
    })
    call.on('close', () => {
      endCall()
    })
    // save the close function
    setCurrentCall(call)
  }

  // End Call function
  const endCall = () => {
    currentCall?.close()
    incommingCall?.close()
    incommingScreenShare?.close()
    currenScreenShare?.close()
    currentCall?._localStream.getTracks()[0].stop()
    incommingCall?._localStream.getTracks()[0].stop()
    incommingScreenShare?._localStream.getTracks()[0].stop()
    currenScreenShare?._localStream.getTracks()[0].stop()
    setScreenShare(false)
    setInCall(false)
    setAcceptCall(null)
  }

  // Get Video and Audio Stream
  const getMedia = (video, audio) => {
    navigator.mediaDevices
      .getUserMedia({
        video,
        audio
      })
      .then((stream) => {
        document.getElementById('local-video').srcObject = stream
        document.getElementById('local-video').play()
        setMyStream(stream)
      })
      .catch((err) => {
        if (err) {
          console.log(err.message)
        }
      })
  }

  // Get Screen stream
  const captureScreen = async () => {
    if (!screenShare) {
      navigator.mediaDevices
        .getDisplayMedia({
          video: {
            cursor: 'always'
          },
          audio: false
        })
        .then((stream) => {
          document.getElementById('screen-share').srcObject = stream
          document.getElementById('screen-share').play()
          setScreenShare(stream)

          const call = peer?.call(otherPeer, stream)
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
          setCurrenScreenShare(call)
        })
        .catch((err) => console.error(err.message))
    } else {
      screenShare.getTracks()[0].stop()
      setScreenShare(false)
      currenScreenShare?.close()
      incommingScreenShare.close()
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
    } else {
      console.log('change Video Attributes...', {
        video,
        audio: true
      })
      setNotMuted(true)
      myStream.getAudioTracks()[0].enabled = true
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
    } else {
      console.log('change Video Attributes...', {
        video: true,
        audio: notMuted
      })
      setVideo(true)
      myStream.getVideoTracks()[0].enabled = true
    }
  }

  // Waiting for Revice a Call
  peer?.on('call', (call) => {
    console.log('[Stream] Call Value:', call)
    setTryToCall(false)
    if (call.peer === otherPeer) {
      console.log('[Stream] User Want to add another Stream!')
      call.answer()
      setIncomingScreenShare(call)
      // save the close function
      call.on('stream', (remoteStream) => {
        // when we receive the remote stream, play it
        document.getElementById('screen-share').srcObject = remoteStream
        document.getElementById('screen-share').play()
        setScreenShare(true)
      })
    }
    peer?.on('close', (call) => {
      call.close()
    })
    if (call.peer !== otherPeer) {
      if (incommingCall === null || currentCall === null) {
        setTryToCall(true)
        setIncomingCall(call)
      }
    }
  })

  // Handle Own Screen Share Listener
  incommingScreenShare?.on('error', (error) => {
    console.log('[Peer] (incomming Stream error)', error.message)
    incommingScreenShare?.close()
    currenScreenShare?.close()
    setScreenShare(false)
  })
  incommingScreenShare?.on('close', () => {
    console.log('Sharing screen was ending!')
    setScreenShare(false)
    incommingScreenShare?.close()
    document.getElementById('screen-share').srcObject = ''
  })

  // Handle Own Call Stream
  incommingCall?.on('error', (error) => {
    console.log('[Peer] (incomming Stream error)', error.message)
    incommingCall?.close()
    currentCall?.close()
    incommingScreenShare?.close()
    currenScreenShare?.close()
  })
  incommingCall?.on('close', () => {
    console.log('Sharing screen was ending!')
    setScreenShare(false)
    setInCall(false)
    setAcceptCall(null)
    incommingCall?.close()
    currentCall?.close()
    incommingScreenShare?.close()
    currenScreenShare?.close()
  })

  // Handle Other Screen Share Listener
  currenScreenShare?.on('error', (error) => {
    console.log('[Peer] (incomming Stream error)', error.message)
    currenScreenShare?.close()
  })
  currenScreenShare?.on('close', () => {
    console.log('Sharing screen was ending!')
    setScreenShare(false)
    currenScreenShare?.close()
  })
  // Handle other Call Stream
  currentCall?.on('error', (error) => {
    console.log('[Peer] (incomming Stream error)', error.message)
    currentCall?.close()
  })
  currentCall?.on('close', () => {
    console.log('Sharing screen was ending!')
    setScreenShare(false)
    setInCall(false)
    setAcceptCall(null)
    incommingCall?.close()
    currentCall?.close()
    incommingScreenShare?.close()
    currenScreenShare?.close()
  })
  // Anwser incoming Call
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (acceptCall) {
      incommingCall?.answer(myStream)
      // save the close function
      incommingCall?.on('stream', (remoteStream) => {
        // when we receive the remote stream, play it
        document.getElementById('remote-video').srcObject = remoteStream
        document.getElementById('remote-video').play()
      })
      setTryToCall(false)
      setInCall(true)
      setOtherPeer(incommingCall?.peer)
    }
    if (acceptCall === false) {
      // user rejected the call, close it
      incommingCall?.close()
      setTryToCall(false)
    }
  }, [acceptCall])
  /* eslint-enable react-hooks/exhaustive-deps */

  useEffect(() => {
    console.log('PROPS', props)
    if (props?.myStream === undefined) {
      getMedia(true, true)
    }
  }, [props])
  return (
    <div className="videoMainContainer">
      {chatName}
      <div id="live">
        <div className={!screenShare ? 'videoContainer' : 'videoContainerShare'}>
          <div id="shareContainer" style={{ visibility: !screenShare ? 'hidden' : 'visible' }}>
            <video className="main-video" id="screen-share"></video>
          </div>
          <div className="videos">
            <div>
              <video
                className={!screenShare ? 'main-video' : 'side-video'}
                id="remote-video"
                style={{ visibility: !inCall ? 'hidden' : 'visible' }}></video>
              {getCall ? <TryToCall otherPeer={otherPeer} /> : null}
              {tryToCall ? <GetCall /> : null}
            </div>
            <div>
              <img
                style={{ display: video ? 'none' : 'block' }}
                id="local-video-avatar"
                src={`${backend}users/picture/${userID}`}
                alt="userProfilePicture"
                onError={(e) => DefaultAvatar(e, email)}
              />
              <video className={localClass()} id="local-video" muted></video>
            </div>
          </div>
        </div>
        {inCall ? null : (
          <div>
            <input
              type="text"
              placeholder="Peer id"
              onChange={(element) => {
                setOtherPeer(element.target.value)
              }}
            />
            <p>Your ID: {myPeerId}</p>
          </div>
        )}
        {tryToCall ? null : (
          <div>
            <div className="control">
              <button
                className="iconBtn"
                onClick={() => {
                  muteMic()
                }}>
                {!notMuted ? (
                  <i className="bi bi-mic-mute"></i>
                ) : (
                  <i className="bi bi-mic-fill"></i>
                )}
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
                className={!inCall ? 'callBtn start' : 'callBtn end'}
                onClick={() => {
                  !inCall ? callUser() : endCall()
                }}>
                <i className="bi bi-telephone-fill"></i>
              </button>
              <button
                onClick={() => {
                  !showMsg ? setShowMsg(true) : setShowMsg(false)
                }}
                className="iconBtn">
                <i className="bi bi-chat"></i>
              </button>
              <button
                onClick={() => {
                  captureScreen()
                }}
                className="iconBtn">
                {!screenShare ? (
                  <i className="bi bi-display"></i>
                ) : (
                  <i className="bi bi-display-fill"></i>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
      <div style={{ display: !showMsg ? 'none' : 'block' }} className="videoChatMsg">
        <Messages />
      </div>
    </div>
  )
}
