import React, { useEffect, useState, useContext } from 'react'
import Duo from './duo/duo'
import Group from './group/groupnew'
import Peer from 'peerjs'
import { BackendContext, SocketContext } from '../Services/default_values'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import PropTypes from 'prop-types'

export default function Call(props) {
  Call.propTypes = {
    socket: PropTypes.any.isRequired
  }

  const params = useParams()
  const chatId = Number(params?.id)
  // Socket Values
  const socketToken = localStorage.getItem('socketToken')
  const userName = localStorage.getItem('user')
  // Peer Values
  const [myPeer, setMyPeer] = useState()
  // User Values
  const roomId = 15
  /* eslint-disable no-unused-vars */
  const [socket, setSocket] = useContext(SocketContext)

  const [backend, setBackend] = useContext(BackendContext)
  const splitBacken = backend.split(':')
  const [roomValues, setRoomValues] = useState({})
  /* eslint-enable no-unused-vars */

  // My Viedeo Values
  const [myStream, setMyStream] = useState()
  const credentials = {
    token: socketToken,
    userName,
    socketId: socket?.id
  }
  // Map with connected members
  /* eslint-disable no-unused-vars */
  const [members, setMembers] = useState()
  /* eslint-enable no-unused-vars */
  // Setup Socket Connection, Viedeo Stream
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    const host = splitBacken[1].split('//')[1]
    const port = splitBacken[2].split('/')[0]
    console.log('PEER', host, port)
    if (!myPeer) {
      // Peer Values
      const peer = new Peer(credentials?.socketToken, {
        host: host,
        port: port,
        path: '/peerjs',
        secure: true,
        pingInterval: 3000,
        debug: 1
      })
      setMyPeer(peer)
    }
    console.log('User Values: ', userName, socketToken)
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true
      })
      .then((stream) => {
        setMyStream(stream)
        console.log('members:', members)
      })
      .catch((err) => {
        if (err) {
          console.log(err.message)
        }
      })
    axios
      .get(`${backend}chatRooms/attributes/${chatId}`)
      .then((res) => {
        console.log('ROOM ATTRIBUTES', res.data)
        setRoomValues(res.data)
      })
      .catch((err) => {
        if (err) {
          console.log(err.message)
        }
      })
  }, [])
  /* eslint-enable react-hooks/exhaustive-deps */

  return (
    <div className="indexCall">
      {myStream?.is_group === 0 ? (
        <Duo myPeer={myPeer} myStream={myStream} chatName={roomValues?.name} />
      ) : (
        <Group
          myPeer={myPeer}
          myStream={myStream}
          roomId={roomId}
          socket={socket}
          chatName={roomValues?.name}
        />
      )}
    </div>
  )
}
