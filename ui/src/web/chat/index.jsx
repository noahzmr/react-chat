import WebChatHeader from './header'
import WebOldMessages from './messanges/old'
import WebSend from './input/send'
import WebDetail from './detail'
import React, { useState, useContext, useEffect } from 'react'
import { OptionContext, WidthContext } from '../Services/css_values'
import { BackendContext, SocketContext } from '../Services/default_values'
import axios from 'axios'
import WebPeopleList from '../people_list'
import { useNavigate, useParams } from 'react-router-dom'
import displayMessage from './messanges/create'

export default function WebChat() {
  const navigate = useNavigate()
  const params = useParams()
  let { id } = useParams()
  const chatId = id
  const userID = localStorage.getItem('user')

  /* eslint-disable no-unused-vars */
  const [socket, setSocket] = useContext(SocketContext)
  const [backend, setBackend] = useContext(BackendContext)
  const [showOptions, setShowOptions] = useContext(OptionContext)
  const [inputWidth, setInputWidth] = useContext(WidthContext)
  /* eslint-enable no-unused-vars */
  const [chatName, setChatName] = useState()
  const [isConnected, setIsConnected] = useState(false)
  const [typingMsg, setTypingMsg] = useState('')
  /* eslint-disable react/prop-types */

  useEffect(() => {
    console.log('CHECK NAV', params, window.location, window.history)
    if (chatId) {
      console.log('Go to chat' + chatId)
      axios
        .get(`${backend}chatrooms/name/${chatId}/${userID}`)
        .then((res) => {
          console.log(`set chat name ${res.data}`)
          setChatName(res.data)
        })
        .catch((err) => {
          if (err) {
            console.log(err.message)
          }
        })
      axios.put(`${backend}chatrooms/${chatId}/messange/${userID}`).then((res) => {
        console.warn('UPDATE MESSAE STATUS', res.data)
      })
    } else {
      navigate('/user')
    }
    console.log('URL Params', chatId)
    if (document.getElementById('messages')) {
      document.getElementById('messages').replaceChildren()
    }
  }, [params])

  // Socket IO function
  useEffect(() => {
    if (!socket) {
      return
    }
    console.log('WebSocket', socket)
    if (socket.connected === true) {
      axios
        .put(`${backend}users/socket`, {
          socket: socket.id,
          user: userID
        })
        .then((res) => {
          console.log('You are now oline!')
        })
        .catch((err) => {
          if (err) {
            console.log(err.message)
          }
        })
    } else {
      console.log('WebSocket is not connected!')
    }
    socket.on('chat message', function (msg, user, chatId, userName, chatName) {
      console.warn(`chat message ${msg}`, user, chatId, userName, chatName)
      displayMessage(msg, user, userName, userID)
    })

    socket.on('connect', () => {
      setIsConnected(true)
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
      displayMessage('Disconnected!', 'system')
      console.log(isConnected)
    })

    socket.on('typing', (name, chat) => {
      setTypingMsg(`${name} is typing...`)
      setTimeout(() => {
        setTypingMsg('')
      }, 1000)
    })

    return () => {
      socket.off('connect')
      socket.off('disconnect')
    }
  }, [userID, socket])

  return (
    <div className="container">
      <WebPeopleList />
      <div className="chat" id="chat-body">
        <div id="chat-interaction">
          <div id={inputWidth}>
            <WebChatHeader chatName={chatName} />
            <div className="chat-history" id="message-container">
              <WebOldMessages />
              <ul id="messages"></ul>
              <div id="information">{typingMsg}</div>
              <div id="bottomRef"></div>
            </div>
            <WebSend chatName={chatName} />
            <div id="listDetail" style={{ display: showOptions }}>
              <WebDetail chatName={chatName} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
