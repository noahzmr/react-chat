import React, { useState, useEffect, useMemo, useContext } from 'react'
import axios from 'axios'
import {
  SearchUserContext,
  CountContext,
  SocketContext,
  BackendContext
} from '../Services/default_values'
import { LoadChatRoomsContext } from '../Services/load_function'
import { UserListContext } from '../Services/css_values'
import { useNavigate, useParams } from 'react-router-dom'
import gravatar from 'gravatar'

export default function WebUserList() {
  const navigate = useNavigate()
  const params = useParams()
  const chatId = Number(params?.id)
  const userID = localStorage.getItem('user')
  // Socket Connection
  /* eslint-disable no-unused-vars */
  const [socket, setSocket] = useContext(SocketContext)
  const [backend, setBackend] = useContext(BackendContext)

  // All about Users

  // All about Rooms
  const [chatRooms, setChatRooms] = useContext(LoadChatRoomsContext)
  const [query, setQuery] = useContext(SearchUserContext)
  const [showPeopleList, setShowPeopleList] = useContext(UserListContext)

  const [count, setCount] = useContext(CountContext)

  /* eslint-enable no-unused-vars */
  const [privateChatRooms, setPrivateChatRooms] = useState([])

  const notification = document.getElementById('notification')

  // Load Functions
  const loadChatRooms = () => {
    axios
      .get(`${backend}chatRooms/${userID}`)
      .then((res) => {
        setChatRooms(res.data)
        console.log('[User List](users)Chat Rooms', res.data)
      })
      .catch((err) => {
        if (err) {
          console.log('[User List](users)', err.message)
        }
      })
  }

  const loadPrivatRooms = () => {
    axios
      .get(`${backend}chatRooms/private/${userID}`)
      .then((res) => {
        setPrivateChatRooms(res.data)
        console.log('[User List](users)Chat Rooms', res.data)
      })
      .catch((err) => {
        if (err) {
          console.log('[User List](users)', err.message)
        }
      })
  }

  const displayMessage = (message, user, userName) => {
    if (user === 'system') {
      setCount(count + 1)
      const item = document.createElement('p')
      item.classList.add('notification')
      item.textContent = message
      notification.appendChild(item)
    }
  }

  const leafChat = async (oldChat, newChat) => {
    await socket.emit('leave-chat', userID, oldChat, (message) => {
      console.log('[User List](users)', newChat, oldChat)
    })
    joinChat(newChat)
  }

  // Function to Search in Rooms
  const filtedGroupChat = useMemo(() => {
    return chatRooms?.filter((item) => {
      return item.name?.toLowerCase().includes(query.toLowerCase())
    })
  }, [chatRooms, query])

  const filtedPrivatChat = useMemo(() => {
    return privateChatRooms?.filter((item) => {
      return item.name?.toLowerCase().includes(query.toLowerCase())
    })
  }, [privateChatRooms, query])

  // Join Chat Room function
  const joinChat = (id) => {
    console.log('[User List](users)Socket Values:', socket)
    if (chatId === id) {
      console.log('[User List](users)matched')
    } else {
      navigate(`/${id}`)
      socket.emit('join-chat', userID, id, (message) => {})
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
  function getGravatarURL(email) {
    // Trim leading and trailing whitespace from
    // an email address and force all characters
    // to lower case
    const address = String(email).trim().toLowerCase()

    // Create an MD5 hash of the final string
    const hash = md5(address)
    console.warn(`https://www.gravatar.com/avatar/${hash}`)
    // Grab the actual image URL
    return `https://www.gravatar.com/avatar/${hash}`
  }

  const DefaultAvatarGroup = (event) => {
    event.target.src = 'https://freeiconshop.com/wp-content/uploads/edd/many-people-outline.png'
  }
  const readMessagesNotification = (chat) => {
    const values = {
      chatId: chat,
      userId: userID
    }
    axios
      .post(`${backend}chatRooms/updateReadMsg`, values, {
        headers: { 'Content-Type': 'application/json;charset=utf-8' }
      })
      .then((res) => {
        console.log('[User List](users)', res.data)
        loadPrivatRooms()
        loadChatRooms()
      })
      .catch((error) => {
        console.error('post failed', error.message)
      })
  }
  // When user Change Load Chat Rooms and create Socket connection
  useEffect(() => {
    if (userID === 0) {
      console.log('[User List](users)no user')
    } else {
      loadPrivatRooms()
    }
  }, [userID])

  useEffect(() => {
    if (chatId && socket) {
      console.log('Connect....')
      socket.emit('join-chat', userID, chatId, (message) => {
        displayMessage(message, 'system')
      })
    }
  }, [socket])
  return (
    <ul className="list" style={{ display: showPeopleList }}>
      {filtedGroupChat?.map((item, index) => {
        return (
          <li
            key={index}
            className={item.id === chatId ? 'clearfix primary' : 'clearfix'}
            onClick={() => {
              console.log({ '[User List](users) item.id': item.id, chatId })
              readMessagesNotification(item.id)
              /* eslint-disable no-lone-blocks */
              {
                chatId ? leafChat(chatId, item.id) : joinChat(item.id)
              }
              /* eslint-enable no-lone-blocks */
            }}
            style={{ display: 'flex', justifyContent: 'space-around' }}>
            <img
              id="avatar"
              src={`${backend}chatRooms/picture/${item.id}`}
              alt="userProfilePicture"
              onError={(e) => DefaultAvatarGroup(e)}
            />
            <div className="about">
              <div className="name">{item.name}</div>
            </div>
            <div>
              {item.unreadMSG !== '0' ? (
                <div className="icons">
                  <div
                    className="notification"
                    onClick={() => {
                      setCount(0)
                    }}>
                    <div className="notBtn">
                      <div className="number">{item.unreadMSG}</div>
                      <i className="bi bi-chat"></i>
                    </div>
                  </div>
                </div>
              ) : (
                <div></div>
              )}
            </div>
          </li>
        )
      })}
      {filtedPrivatChat.map((item, index) => {
        return (
          <li
            key={index}
            className={item.id === chatId ? 'clearfix primary' : 'clearfix'}
            style={{ display: 'flex', justifyContent: 'space-around' }}
            onClick={() => {
              readMessagesNotification(item.id)
              /* eslint-disable no-lone-blocks */
              {
                chatId ? leafChat(chatId, item.id) : joinChat(item.id)
              }
              /* eslint-enable no-lone-blocks */
            }}>
            <img
              src={`${backend}users/picture/${item.id}`}
              alt="userProfilePicture"
              onError={(e) => DefaultAvatar(e, item.email)}
            />
            <div className="about">
              <div className="name">{item.name}</div>
              <div className={item.status === null ? 'status' : `status ${item.status}`}>
                {item.status === null ? <p>offline</p> : <p>{item.status}</p>}
              </div>
            </div>
            <div>
              {item.unreadMSG !== '0' ? (
                <div className="circle-not">
                  <h1>{item.unreadMSG}</h1>
                </div>
              ) : (
                <div></div>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
