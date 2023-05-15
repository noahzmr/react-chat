import React, { useContext, useState, useMemo, useEffect } from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'
import { BackendContext, SortContext } from '../Services/default_values'
import gravatar from 'gravatar'
export default function WebPrivatesProfile() {
  const params = useParams()
  const userID = localStorage.getItem('user')
  /* eslint-disable no-unused-vars */
  const [privateChatRooms, setPrivateChatRooms] = useState(undefined)
  const [users, setUsers] = useState(undefined)
  const [backend, setBackend] = useContext(BackendContext)
  const [sort, setSort] = useContext(SortContext)
  /* eslint-enable no-unused-vars */

  const [query, setQuery] = useState('')

  // Create new Chats
  const loadPrivateMSg = (user) => {
    const insertValues = {
      user,
      creater: userID,
      group: 0
    }

    axios
      .post(`${backend}chatrooms/`, insertValues, {
        headers: { 'Content-Type': 'application/json;charset=utf-8' }
      })
      .then((res) => {
        console.log(res.data)
        loadUsers()
        loadPrivatRooms()
      })
      .catch((error) => {
        console.error('post failed', error.message)
      })
  }

  const loadUsers = () => {
    axios
      .get(`${backend}chatRooms/${userID}/createDm`)
      .then((res) => {
        setUsers(res.data)
      })
      .catch((error) => {
        console.error('post failed', error.message)
      })
  }
  const loadPrivatRooms = () => {
    axios
      .get(`${backend}chatRooms/chats/${userID}/${sort}`)
      .then((res) => {
        setPrivateChatRooms(res.data)
        console.warn('[User List](users)Chat Rooms', res.data)
      })
      .catch((err) => {
        if (err) {
          console.log('[User List](users)', err.message)
        }
      })
  }
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

  const filtedPrivatChat = useMemo(() => {
    return privateChatRooms?.filter((item) => {
      console.warn('DUMMY', users, privateChatRooms)
      return item.namePrivat?.toLowerCase().includes(query.toLowerCase()) && item.is_group === 0
    })
  }, [privateChatRooms, query])
  const filtedUsers = useMemo(() => {
    return users?.filter((item) => {
      return item.name?.toLowerCase().includes(query.toLowerCase())
    })
  }, [privateChatRooms, query])

  useEffect(() => {
    loadUsers()
    loadPrivatRooms()
  }, [])
  if (privateChatRooms?.length === 0) {
    return (
      <div className="card" style={{ background: 'var(--s)' }}>
        <div className="card-body">
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
          <h4>Its looks like u have no Direkt Messages</h4>
          {filtedUsers?.length === 0 ? (
            <h6
              onClick={() => {
                console.warn(users)
              }}>
              No users found
            </h6>
          ) : (
            <h6>But dont worry just create a new one</h6>
          )}
          <ul>
            {filtedUsers?.map((item, index) => {
              const cre = { id: item.id, name: item.name }
              console.log(cre)
              return (
                <li
                  key={index}
                  style={{ display: 'flex', justifyContent: 'space-around', cursor: 'pointer' }}
                  onClick={() => {
                    loadPrivateMSg(item.id)
                  }}>
                  <img
                    src={`${backend}users/picture/${item.id}`}
                    alt="userProfilePicture"
                    onError={(e) => DefaultAvatar(e, item.email)}
                    style={{ height: '2em' }}
                  />
                  <div className="about">
                    <div className="name">{item.name}</div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    )
  } else {
    return (
      <div>
        <div className="chatHeader" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr' }}>
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
                  onClick={() => {
                    console.warn('DUMMY', privateChatRooms, users)
                  }}
                />
              </form>
              <i className="bi bi-search"></i>
            </div>
          </div>
          <button>
            <i className="bi bi-plus-square"></i>
          </button>
        </div>
        <ul className="list userRoomsProfile">
          {filtedPrivatChat?.map((item, index) => {
            return (
              <li
                key={index}
                className={item.id === params?.id ? 'clearfix primary' : 'clearfix'}
                style={{ display: 'flex', justifyContent: 'space-around' }}>
                <img
                  src={`${backend}users/picture/${item.id}`}
                  alt="userProfilePicture"
                  onError={(e) => DefaultAvatar(e, item.email)}
                />
                <div className="about">
                  <div className="name">{item.namePrivat}</div>
                  <div
                    className={item.statusName === null ? 'status' : `status ${item.statusName}`}>
                    {item.statusName === null ? <p>offline</p> : <h3>{item.statusName}</h3>}
                  </div>
                </div>
                <div>
                  {item.wasRead !== '0' ? (
                    <div className="unreadMessanges">
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
      </div>
    )
  }
}
