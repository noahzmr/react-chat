import React, { useEffect, useMemo, useContext } from 'react'
import axios from 'axios'
import {
  SearchUserContext,
  CountContext,
  SocketContext,
  BackendContext,
  SortContext
} from '../Services/default_values'
import { LoadChatRoomsContext } from '../Services/load_function'
import { UserListContext } from '../Services/css_values'
import { useNavigate, useParams } from 'react-router-dom'
import moment from 'moment/moment'
import gravatar from 'gravatar'
import MarkdownView from '../chat/messanges/markdown'
export default function UserList() {
  const navigate = useNavigate()
  const params = useParams()
  const chatId = Number(params?.id)
  const userID = localStorage.getItem('user')
  const currentTime = moment().format('MMMM Do YYYY, h:mm:ss a')

  // Socket Connection
  /* eslint-disable no-unused-vars */
  const [socket, setSocket] = useContext(SocketContext)
  const [backend, setBackend] = useContext(BackendContext)

  // All about Users

  // All about Rooms
  const [chatRooms, setChatRooms] = useContext(LoadChatRoomsContext)
  const [query, setQuery] = useContext(SearchUserContext)
  const [showPeopleList, setShowPeopleList] = useContext(UserListContext)

  const [sort, setSort] = useContext(SortContext)
  const [count, setCount] = useContext(CountContext)

  /* eslint-enable no-unused-vars */

  // Load Functions
  const loadChatRooms = () => {
    axios
      .get(`${backend}chatRooms/chats/${userID}/${sort}`)
      .then((res) => {
        setChatRooms(res.data)
        console.warn('[User List](users)Chat Rooms', res.data)
      })
      .catch((err) => {
        if (err) {
          console.log('[User List](users)', err.message)
        }
      })
  }

  const leafChat = async (oldChat, newChat) => {
    await socket.emit('leave-chat', userID, oldChat, (message) => {
      console.log('[User List](users)', newChat, oldChat)
    })
    joinChat(newChat)
  }

  // Function to Search in Rooms
  const filtedChat = useMemo(() => {
    return chatRooms?.filter((item) => {
      return (
        item.name?.toLowerCase().includes(query.toLowerCase()) ||
        item.namePrivat?.toLowerCase().includes(query.toLowerCase())
      )
    })
  }, [chatRooms, query])

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
      loadChatRooms()
    }
  }, [userID])

  useEffect(() => {
    if (chatId && socket) {
      console.log('Connect....')
      socket.emit('join-chat', userID, chatId, (message) => {})
    }
  }, [socket])

  useEffect(() => {
    loadChatRooms()
  }, [sort])
  return (
    <ul className="list" style={{ display: showPeopleList }}>
      {filtedChat?.map((item, index) => {
        return (
          <li
            id={`chat_${item.id}`}
            key={index}
            className={item.id === chatId ? 'primary' : 'secondary'}
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
            <div className="chatPicture">
              <img
                id="avatar"
                src={`${backend}chatRooms/picture/${item.is_group === 1 ? item.id : item.idPrivat}`}
                alt="userProfilePicture"
                onError={(e) =>
                  item.is_group === 1 ? DefaultAvatarGroup(e) : DefaultAvatar(e, item.email)
                }
              />
              {item.is_group === 1 ? (
                <></>
              ) : (
                <i
                  className={item.statusColor === null ? 'bi bi-circle' : 'bi bi-circle-fill'}
                  style={{ color: item.statusColor, margin: '1em 0 0 1em' }}></i>
              )}
            </div>
            <div className="chatQucikBody">
              <div className="name">{item.is_group === 1 ? item.name : item.namePrivat}</div>
              {item.LastMsg ? (
                <p className="lastMessage">
                  <MarkdownView text={item.LastMsg} />
                </p>
              ) : (
                <div className="lastMessage">
                  <p>No Messanges...</p>
                </div>
              )}
            </div>
            <div className="lastMessageDetail">
              {item.LastMsgTime !== null ? (
                <p className="lastMessageTime">
                  {item.LastMsgTime.split(',')[0] === currentTime.split(',')[0]
                    ? item.LastMsgTime.split(',')[1]
                    : item.LastMsgTime.split(',')[0]}
                </p>
              ) : (
                <></>
              )}
              {item.wasRead !== '0' ? (
                <div
                  className="unreadMessanges"
                  onClick={() => {
                    setCount(0)
                  }}>
                  <div className="number">{item.wasRead}</div>
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
