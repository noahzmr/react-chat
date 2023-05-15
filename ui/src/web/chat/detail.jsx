import React, { useEffect, useContext, useState, useMemo } from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'
import { LoadUserContext } from '../Services/load_function'
import { BackendContext } from '../Services/default_values'
export default function WebDetail() {
  const params = useParams()
  const chatId = Number(params?.id)
  const userID = localStorage.getItem('user');

  /* eslint-disable no-unused-vars */
  const [userId, setUserId] = useState()
  const [users, setUsers] = useContext(LoadUserContext)
  const [backend, setBackend] = useContext(BackendContext)
  /* eslint-enable no-unused-vars */

  // All for the Members Detail
  const [members, setMembers] = useState()
  const [showMembers, setShowMembers] = useState('none')
  const [query, setQuery] = useState('')
  const [showOldMessages, setShowOldMessages] = useState('none')
  const [isGroup, setIsGroup] = useState()
  const [showAddMember, setShowAddMember] = useState('none')
  const [postImage, setPostImage] = useState()

  // Filter function
  const filtedMembers = useMemo(() => {
    return members?.filter((item) => {
      return item.name?.toLowerCase().includes(query.toLowerCase())
    })
  }, [members, query])

  // All for Search Messages
  const [showMessages, setShowMessages] = useState('grid')
  const [messages, setMessages] = useState()

  const filtedMessages = useMemo(() => {
    return messages?.filter((item) => {
      return (
        item.chat_message?.toLowerCase().includes(query.toLowerCase()) ||
        item.name?.toLowerCase().includes(query.toLowerCase())
      )
    })
  }, [messages, query])

  // load Function
  const loadIsGroup = (chatId) => {
    axios
      .get(`${backend}chatRooms/groupChat/${chatId}`)
      .then((res) => {
        setIsGroup(res.data)
        res.data === 1
          ? console.log(`The Chat ${chatId} is a group Chat ${res.data}`)
          : console.log(`The Chat ${chatId} is a Privat Chat ${res.data}`)
      })
      .catch((err) => {
        if (err) {
          console.log(err.message)
        }
      })
  }
  const loadUsers = (chatId) => {
    axios
      .get(`${backend}chatRooms/notMembers/${chatId}`)
      .then((res) => {
        setUsers(res.data)
      })
      .catch((err) => {
        if (err) {
          console.log(err.message)
        }
      })
  }
  const loadMembers = (chatId) => {
    axios
      .get(`${backend}chatRooms/members/${chatId}`)
      .then((res) => {
        setMembers(res.data)
        console.log(`Members From ${chatId} are: ${res.data}`)
      })
      .catch((err) => {
        if (err) {
          console.log(err.message)
        }
      })
  }
  const loadOldMessages = (chatId) => {
    axios
      .get(`${backend}chatRooms/messages/${chatId}`)
      .then((res) => {
        setMessages(res.data)
      })
      .catch((err) => {
        if (err) {
          console.log(err.message)
        }
      })
  }
  const loadShowMembers = () => {
    setShowMembers('grid')
    setShowMessages('none')
    setShowOldMessages('none')
  }
  const loadShowMessages = () => {
    setShowMembers('none')
    setShowMessages('flex')
    setShowOldMessages('flex')
  }

  // remove Function
  const removeUser = (userId) => {
    const memebrValues = {
      chat: params?.id,
      member: userId
    }
    axios
      .post(`${backend}chatRooms/removeMember`, memebrValues)
      .then((res) => {
        console.log(res.data)
        loadMembers(chatId)
        loadUsers(chatId)
      })
      .catch((err) => {
        if (err) {
          console.log(err.message)
        }
      })
  }

  // add Function
  const addUser = (userId) => {
    const groupValue = {
      groupId: params?.id,
      userId
    }
    axios
      .post(`${backend}chatRooms/addMember`, groupValue)
      .then((res) => {
        console.log(res.data)
        loadMembers(chatId)
        loadUsers(chatId)
      })
      .catch((err) => {
        if (err) {
          console.log(err.message)
        }
      })
  }

  const DefaultAvatar = (event) => {
    event.target.src = 'https://freeiconshop.com/wp-content/uploads/edd/many-people-outline.png'
  }

  const handleFileUpload = (e) => {
    if (e.target.files.length !== 1) {
      return
    }
    console.log(e.target.files[0].type)
    const formData = new FormData()
    formData.append('file', e.target.files[0])

    setPostImage(formData)
    try {
      axios
        .post(`${backend}chatRooms/${chatId}/picture`, formData, {
          headers: {
            'Content-Type': e.target.files[0].type
          }
        })
        .then((res) => {
          console.log('Buffer from the image:', res.data)
          console.log(postImage)
        })
        .catch((reason) => {
          console.error('post failed', reason)
        })
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    if (params?.id) {
      loadMembers(chatId)
      loadOldMessages(chatId)
      loadIsGroup(chatId)
    }
  }, [params])

  if (isGroup === 1) {
    return (
      <div className="listDetail">
        <div
          className="chatHeader"
          style={{ display: showMembers, justifyContent: 'space-between' }}>
          <div className="userPictureContainer">
            <div className="userPicture">
              <div>
                <img
                  id="avatar"
                  src={`${backend}chatRooms/picture/${chatId}`}
                  alt="userProfilePicture"
                  onError={(e) => DefaultAvatar(e)}
                />
              </div>
              <div className="userPictureHover">
                <input
                  type="file"
                  label="Image"
                  name="myFile"
                  accept=".jpeg, .png, .jpg"
                  onChange={(e) => handleFileUpload(e)}
                  onClick={console.log(postImage)}
                />
                <div>
                  <label htmlFor="upload-photo">
                    <i className="bi bi-camera"></i>
                    <p>Profilbild ändern</p>
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className="search-container">
            <div className="box">
              <form name="search">
                <input
                  type="serach"
                  className="input"
                  name="txt"
                  placeholder="Search Member..."
                  onChange={(e) => {
                    setQuery(e.target.value)
                  }}
                />
              </form>
              <i className="bi bi-search"></i>
            </div>
          </div>
          <div className="chatButtonContainer">
            <div className="dropdown">
              <button
                type="button"
                onClick={() => {
                  if (showAddMember === 'none') {
                    setShowAddMember('block')
                  } else {
                    setShowAddMember('none')
                  }
                }}>
                <i className="bi bi-person-plus"></i>
              </button>
              <div className="dropdown-content" style={{ display: showAddMember }}>
                {users?.map((item, index) => {
                  return (
                    <p
                      key={index}
                      value={item.id}
                      onClick={() => {
                        addUser(item.id)
                      }}>
                      {item.name}
                    </p>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
        <div className="chatHeader" style={{ display: showMessages }}>
          <div className="userPictureContainer">
            <div className="userPicture">
              <div>
                <img
                  id="avatar"
                  src={`${backend}chatRooms/picture/${chatId}`}
                  alt="userProfilePicture"
                  onError={(e) => DefaultAvatar(e)}
                />
              </div>
              <div className="userPictureHover">
                <input
                  type="file"
                  label="Image"
                  name="myFile"
                  accept=".jpeg, .png, .jpg"
                  onChange={(e) => handleFileUpload(e)}
                  onClick={console.log(postImage)}
                />
                <div>
                  <label htmlFor="upload-photo">
                    <i className="bi bi-camera"></i>
                    <p>Profilbild ändern</p>
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className="search-container">
            <div className="box">
              <form name="search">
                <input
                  type="serach"
                  className="input"
                  name="txt"
                  placeholder="Search Message..."
                  onChange={(e) => {
                    setQuery(e.target.value)
                  }}
                />
              </form>
              <i className="bi bi-search"></i>
            </div>
          </div>
        </div>
        <ul>
          <li className="clearfix">
            <div
              onClick={() => {
                showMembers === 'none' ? loadShowMembers() : loadShowMessages()
                setShowOldMessages('none')
              }}>
              <img
                src="https://freeiconshop.com/wp-content/uploads/edd/many-people-outline.png"
                alt="avatar"
              />
              <div className="about">
                <div className="name">Members</div>
                {/* <div className="status">
                                    <i className="bi bi-circle-fill online"></i> active
                                </div> */}
              </div>
            </div>
            <br />
            <div style={{ display: showMembers, flexDirection: 'column' }}>
              {filtedMembers?.map((item, index) => {
                return (
                  <div
                    key={index}
                    onClick={() => {
                      setUserId(item.id)
                    }}
                    className={item.id === userId ? 'clearfix primary' : 'clearfix'}
                    style={{ position: 'relativ', left: '0%' }}>
                    {item.name}
                    <button
                      onClick={() => {
                        removeUser(item.id)
                      }}
                      style={{ fontSize: '20px' }}>
                      <i className="bi bi-person-dash"></i>
                    </button>
                  </div>
                )
              })}
            </div>
          </li>
          <li className="clearfix">
            {/* eslint-disable no-lone-blocks */}
            <div
              onClick={() => {
                setShowMessages('flex')
                {
                  showOldMessages === 'none' ? loadShowMessages() : setShowOldMessages('none')
                }
              }}>
              {/* eslint-enable no-lone-blocks */}
              <div className="aboutDetail">
                <div className="name">
                  <i className="bi bi-chat" id="img" />
                  Messages
                </div>
              </div>
            </div>
            <ul
              className="chat-history-detail"
              style={{ display: showOldMessages, flexDirection: 'column', width: '100%' }}>
              {filtedMessages?.map((item, index) => {
                return (
                  <div key={index}>
                    <div className="clearfix" id="parent">
                      <div
                        className={
                          item.user_id === parseInt(userID)
                            ? 'message-data align-right'
                            : 'message-data'
                        }
                        id="child">
                        <span className="message-data-time" id="time">
                          {item.send_at}
                        </span>
                        <span className="message-data-name" id="msgDetailName">
                          {item.name}
                        </span>
                      </div>
                      <div
                        className={
                          item.user_id === parseInt(userID)
                            ? 'message other-message float-right'
                            : 'message my-message'
                        }
                        id="chatMsg">
                        {item.chat_message}
                      </div>
                    </div>
                  </div>
                )
              })}
            </ul>
          </li>
        </ul>
      </div>
    )
  } else {
    return (
      <div className="listDetail">
        <div className="chatHeader" style={{ display: showMembers }}>
          <div className="search-container">
            <div className="box">
              <form name="search">
                <input
                  type="serach"
                  className="input"
                  name="txt"
                  placeholder="Search Member..."
                  onChange={(e) => {
                    setQuery(e.target.value)
                  }}
                />
              </form>
              <i className="bi bi-search"></i>
            </div>
          </div>
        </div>
        <div className="chatHeader" style={{ display: showMessages }}>
          <div className="search-container">
            <div className="box">
              <form name="search">
                <input
                  type="serach"
                  className="input"
                  name="txt"
                  placeholder="Search Message..."
                  onChange={(e) => {
                    setQuery(e.target.value)
                  }}
                />
              </form>
              <i className="bi bi-search"></i>
            </div>
          </div>
        </div>
        <ul>
          <li className="clearfix">
            {/* eslint-disable no-lone-blocks */}
            <div
              onClick={() => {
                setShowMessages('flex')
                {
                  showOldMessages === 'none' ? loadShowMessages() : setShowOldMessages('none')
                }
              }}>
              {/* eslint-enable no-lone-blocks */}
              <i className="bi bi-chat" id="img"></i>
              <div className="about">
                <div className="name">Messages</div>
              </div>
            </div>
            <ul
              className="chat-history"
              style={{ display: showOldMessages, flexDirection: 'column', width: '100%' }}>
              {filtedMessages?.map((item, index) => {
                return (
                  <div key={index}>
                    <div className="clearfix" id="parent">
                      <div
                        className={
                          item.user_id === parseInt(userID)
                            ? 'message-data align-right'
                            : 'message-data'
                        }
                        id="child">
                        <span className="message-data-time" id="time">
                          {item.send_at}
                        </span>
                        <span className="message-data-name" id="msgDetailName">
                          {item.name}
                        </span>
                      </div>
                      <div
                        className={
                          item.user_id === parseInt(userID)
                            ? 'message other-message float-right'
                            : 'message my-message'
                        }
                        id="chatMsg">
                        {item.chat_message}
                      </div>
                    </div>
                  </div>
                )
              })}
            </ul>
          </li>
        </ul>
      </div>
    )
  }
}
