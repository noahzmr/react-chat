import React, { useContext, useState, useMemo, useEffect } from 'react'
import axios from 'axios'
import { BackendContext } from '../Services/default_values'
import { CreateDierectContext } from '../Services/css_values'
import gravatar from 'gravatar'
import { useNavigate } from 'react-router-dom'

export default function WebCreateDierect() {
  const navigate = useNavigate()
  const userID = localStorage.getItem('user')
  /* eslint-disable no-unused-vars */
  const [users, setUsers] = useState()
  const [backend, setBackend] = useContext(BackendContext)
  const [showCreateDierect, setShowCreateDierect] = useContext(CreateDierectContext)
  const [wantedUser, setWantedUser] = useState(null)
  const [query, setQuery] = useState('')

  /* eslint-enable no-unused-vars */

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
  // Filter function
  const filterdUsers = useMemo(() => {
    return users?.filter((item) => {
      return item.name?.toLowerCase().includes(query.toLowerCase())
    })
  }, [users, query])
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
  const loadPrivateMSg = () => {
    const insertValues = {
      user: wantedUser,
      creater: userID,
      group: 0
    }

    axios
      .post(`${backend}chatrooms/`, insertValues, {
        headers: { 'Content-Type': 'application/json;charset=utf-8' }
      })
      .then((res) => {
        console.log(res.data)
        setWantedUser(null)
        loadUsers()
        navigate(`/${res.data}`)
      })
      .catch((error) => {
        console.error('post failed', error.message)
      })
  }

  useEffect(() => {
    loadUsers()
  }, [])
  return (
    <div id="createNewUser">
      <div className="createBody">
        <div className="card">
          <div className="card-body">
            <div>
              <h1>Create a new Chat!</h1>
            </div>
            <label className="input">
              <input
                onChange={(e) => {
                  setQuery(e.target.value)
                }}
                className="input__field"
                type="text"
                placeholder=" "
                value={query}
              />
              <span style={{ marginLeft: '2em' }} className="input__label">
                Search
              </span>
            </label>
            <ul>
              {filterdUsers?.map((item, index) => {
                return (
                  <li
                    key={index}
                    id={`user_${item.id}`}
                    className={item.id === wantedUser ? 'primary' : ''}
                    style={{ display: 'flex', justifyContent: 'space-around', cursor: 'pointer' }}
                    onClick={() => {
                      setWantedUser(item.id)
                    }}>
                    <img
                      src={`${backend}users/picture/${item.id}`}
                      alt="userProfilePicture"
                      onError={(e) => DefaultAvatar(e, item.email)}
                    />
                    <div className="about">
                      <div className="name">{item.name}</div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
          <div className="btnContainer">
            <button
              onClick={() => {
                setShowCreateDierect('none')
                setQuery('')
                setWantedUser(null)
              }}
              style={{ background: '#6c757d' }}
              className="secondary">
              Cancle
            </button>

            <button
              id="submit_private"
              disabled={wantedUser === null ? true : ''}
              style={{
                background: wantedUser === null ? 'rgb(0, 123, 255, 0.25)' : 'rgb(0, 123, 255, 1)',
                color: wantedUser === null ? 'rgb(227, 230, 233,0.25)' : 'rgb(227, 230, 233,1)',
                cursor: wantedUser === null ? 'not-allowed' : 'pointer'
              }}
              onClick={() => {
                loadPrivateMSg()
                setShowCreateDierect('none')
                setQuery('')
              }}>
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
