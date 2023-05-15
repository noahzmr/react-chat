import React, { useEffect, useContext, useState, useRef } from 'react'
import Options from './options'
import PropTypes from 'prop-types'
import axios from 'axios'
import { ShowMsgContainerContext, ShowShareContainerContext } from '../../Services/context'
import { BackendContext, SocketContext } from '../../Services/default_values'
import WebOldMessages from '../../chat/messanges/old'
import WebSend from '../../chat/input/send'
import LoadingScreen from '../../pages/loading'
import gravatar from 'gravatar'

export default function Group(props) {
  const userID = localStorage.getItem('user')
  const chatName = props?.chatName
  const bottomRef = useRef(null)
  const [typingMsg, setTypingMsg] = useState('')

  // Props
  const [socket, setSocket] = useContext(SocketContext)
  const peer = props?.myPeer
  const roomId = props?.roomId
  const [myStream, setMyStream] = useState(props?.myStream)

  // Credentials
  const credentials = {
    user: localStorage.getItem('user'),
    socketToken: localStorage.getItem('socketToken'),
    csrf: localStorage.getItem('csrf')
  }
  // Video Container
  const videoGrid = document.getElementById('video-grid')
  const videos = document.querySelectorAll('#video-grid video')
  const videoArray = [...videos]

  // Stream Values
  const [currentCall, setCurrentCall] = useState(null)
  const streamsRef = useRef([])
  const streams = streamsRef.current

  const [screenShare, setScreenShare] = useContext(ShowShareContainerContext)
  // Members
  const [members, setMembers] = useState(null)
  const [showMsgContainer, setShowMsgContainer] = useContext(ShowMsgContainerContext)
  const [backend, setBackend] = useContext(BackendContext)

  const [showLoadingScreen, setShowLoadingScreen] = useState(true)
  // Prop Validation
  Group.propTypes = {
    socket: PropTypes.any.isRequired,
    myPeer: PropTypes.any.isRequired,
    myStream: PropTypes.any,
    roomId: PropTypes.any.isRequired,
    chatName: PropTypes.any.isRequired
  }

  // End Call function
  const endCall = () => {
    currentCall?.close()
    currentCall?._localStream.getTracks()[0].stop()
  }

  // Addings Stream to Video
  const addVideoStream = async (video, stream) => {
    video.srcObject = stream
    video.id = stream.id
    console.log('CHECK', stream.getTracks(), stream.getTracks(), stream)
    video.addEventListener('loadedmetadata', () => {
      video.play()
      videoGrid.append(video)
    })
  }

  // Connect with other users
  const connectToNewUser = (userId, stream) => {
    console.log(`${userId.peer} joined ${roomId} with `, stream)
    const call = peer.call(userId.peer, stream, {
      metadata: { type: 'user' }
    })
    setCurrentCall(call)
  }

  // Clean Video Grid
  const deleteChild = async () => {
    const e = document.querySelector('#video-grid')

    const child = e.lastElementChild
    while (child) {
      e.removeChild(child)
      child = e.lastElementChild
    }
    if (!child) {
      return true
    }
  }

  // Push Streams
  const pushStream = (stream) => {
    console.log('streams', streams)
    if (streams.includes(stream)) {
      console.log('STREAM already exist')
      const duplicateArray = []
      streams.forEach((item, index) => {
        if (item.id === stream.id) {
          const updateArray = streams.splice(index, index)
          duplicateArray.push(index)
          console.log(
            'item Stream',
            'streams: ',
            streams,
            'updateArray: ',
            updateArray,
            'duplicateArray: ',
            duplicateArray
          )
        }
      })
    } else {
      streams.push(stream)
    }
  }

  const createCall = (call) => {
    setCurrentCall(call)
    call.answer(myStream)
    // Peer function
    call.on('stream', (userVideoStream) => {
      pushStream(userVideoStream)
      const video = document.createElement('video')
      addVideoStream(video, userVideoStream)
    })
    call.on('error', (error) => {
      console.log('[Peer] (incomming Stream error)', error.message)
      call?.close()
    })
    call.on('close', () => {
      endCall()
    })
  }

  const cleanVideoGrid = () => {
    console.log('videoArray', videoArray, videos)
    if (!members) {
      console.log('No Members')
    } else {
      members.forEach((item) => {
        if (item.peer === peer.id) {
          console.log('Cannot call yourself!')
        } else {
          const check = videoArray.includes(item.peer)
          console.log('Connect to new User', item.peer, check)
          connectToNewUser(item, myStream)
          if (item.screenShare === true) {
            setScreenShare(true)
          }
        }
      })
    }
  }

  const clean = () => {
    const vid = document.querySelectorAll('#video-grid video')
    const id = new Array()
    const vidGrid = document.getElementById('video-grid')

    if (vid?.length !== members?.length - 1) {
      console.log('vid: Video duplicate!', vidGrid?.children[0])
      vid?.forEach((item, index) => {
        console.log('vid: ', item.id, index)
        if (id.includes(item.id)) {
          console.log('vid: ID already in the Array!', item)
          vidGrid?.removeChild(vidGrid?.lastElementChild)
          console.log('vid: after delte', vid)
        } else {
          console.log('vid: Add ID to the Array!')
          id.push(item.id)
        }
      })
    } else if (vid?.length === members?.length - 1 || vid?.length === members?.length) {
      console.warn('FINISH')
      setShowLoadingScreen(false)
    }
  }

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

  // Share Display Function
  useEffect(() => {
    setShowLoadingScreen(true)
    cleanVideoGrid()
    setTimeout(() => {
      console.log('CLEANING')
      clean()
    }, 1000)
  }, [members])

  // Setup User Stream
  useEffect(() => {
    if (myStream !== props?.myStream) {
      document.getElementById('local-video').srcObject = props?.myStream
      document.getElementById('local-video').play()
      setMyStream(props?.myStream)
      socket?.emit('join-room', roomId, credentials, peer.id, props?.myStream.id)
    }
  }, [props])

  // Peer Function
  useEffect(() => {
    if (peer) {
      peer?.on('open', (id) => {
        console.log('credentials ', credentials)
        console.log(`Sign in as ${id} and try to join ${roomId}`)
        socket.emit('join-room', roomId, credentials, id, myStream)

        axios
          .put(`${backend}users/peer`, {
            peer: id,
            user: userID,
            room: roomId
          })
          .then((res) => {
            console.log('You are now oline!')
          })
          .catch((err) => {
            if (err) {
              console.log(err.message)
            }
          })
      })
      peer?.on('call', async (call) => {
        console.log('METADATA', call.metadata)
        if (call.metadata.type === 'screenshare') {
          call.answer(myStream)
          // Peer function
          call.on('stream', (screenshare) => {
            const video = document.getElementById('screen-share')
            video.srcObject = screenshare
            video.id = screenshare.id
            console.log('CHECK', screenshare.getTracks(), screenshare.getTracks())
            video.addEventListener('loadedmetadata', () => {
              video.play()
            })
          })
          call.on('error', (error) => {
            console.log('[Peer] (incomming Stream error)', error.message)
            call?.close()
          })
          call.on('close', () => {
            endCall()
          })
        } else {
          if (currentCall !== call && currentCall !== null) {
            await deleteChild()
            await currentCall.close()
            createCall(call)
          } else {
            await deleteChild()
            createCall(call)
          }
        }
      })
    }
  }, [peer])

  // Socket Function
  useEffect(() => {
    if (!socket) {
      return
    }
    socket.on('update-room-attributes', async (roomValues) => {
      console.log('Room Values: ', roomValues)
      setMembers(roomValues)
    })
    socket.on('user-disconnected', async (roomValues) => {
      console.log('Room Values: ', roomValues)
      await deleteChild()
      setMembers(roomValues)
    })
    socket.on('typing', (name, chat) => {
      setTypingMsg(`${name} is typing...`)
      setTimeout(() => {
        setTypingMsg('')
      }, 1000)
    })
    socket.on('update-stream', (values) => {
      console.log('MEMBERS', members)
      members?.map((item) => {
        if (item.socketId === values.socketId) {
          console.log(item)
          members[values.socketId].video = values.video
          members[values.socketId].audio = values.audio
        } else {
          console.log(item)
        }
      })

      console.log('Stream has updated to: ', values)
    })
  }, [socket])

  return (
    <div>
      <div className="header">
        <div className="logo">
          <h3>{chatName}</h3>
        </div>
      </div>
      <div className={showMsgContainer === 'none' ? 'mainOne' : 'mainTwo'}>
        {showLoadingScreen ? <LoadingScreen /> : null}
        <div className="video">
          {screenShare ? <video className="share" id="screen-share" /> : null}
          <div className={screenShare ? 'videoContainer' : ''} id="video-grid"></div>
        </div>
        <div className="members">
          {members?.map((item) => {
            if (item.socketId === socket.id) {
              console.log('Not show own state')
            } else {
              return (
                <div className="container" key={item.socketId}>
                  <div className="user">
                    <img
                      src={`${backend}users/picture/${userID}`}
                      alt="userProfilePicture"
                      onError={(e) => DefaultAvatar(e, item.email)}
                    />
                    {JSON.parse(item.name).username}
                  </div>
                  <div>
                    {item.video === true ? (
                      <i className="bi bi-camera-video-fill"> </i>
                    ) : (
                      <i className="bi bi-camera-video-off"> </i>
                    )}
                    {item.audio === true ? (
                      <i className="bi bi-mic-fill"> </i>
                    ) : (
                      <i className="bi bi-mic-mute"> </i>
                    )}
                  </div>
                </div>
              )
            }
          })}
        </div>
        <div className="user">
          <video id="local-video" muted></video>
        </div>
        <Options
          myStream={myStream}
          currentCall={currentCall}
          roomId={roomId}
          peer={peer}
          socket={socket}
          members={members}
        />
        <div style={{ display: showMsgContainer }} className="chat">
          <div className="chat-history" id="message-container">
            <WebOldMessages />
            <ul id="messages"></ul>
            <div id="information">{typingMsg}</div>
            <div ref={bottomRef}></div>
          </div>
          <WebSend chatName={chatName} />
        </div>
      </div>
    </div>
  )
}
