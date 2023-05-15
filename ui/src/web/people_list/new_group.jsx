import React, { useState, useContext, useMemo } from 'react'
import axios from 'axios'
import { BackendContext } from '../Services/default_values'
import { CreateGroupContext } from '../Services/css_values'
import gravatar from 'gravatar'

export default function WebCreateGroup() {
  const userID = localStorage.getItem('user')
  /* eslint-disable no-unused-vars */
  const [users, setUsers] = useState()
  const [backend, setBackend] = useContext(BackendContext)
  /* eslint-enable no-unused-vars */
  const [groupName, setGroupName] = useState('')

  const [groupId, setGroupId] = useState(null)
  const [groupMembers, setGroupMembers] = useState(null)
  const [showCreateGroup, setShowCreateGroups] = useContext(CreateGroupContext)
  const [query, setQuery] = useState('')
  const [queryR, setQueryR] = useState('')
  // Filter function
  const filterdUsers = useMemo(() => {
    return users?.filter((item) => {
      return item.name?.toLowerCase().includes(query.toLowerCase())
    })
  }, [users, query])
  const filterdGroupMembers = useMemo(() => {
    return groupMembers?.filter((item) => {
      return item.name?.toLowerCase().includes(queryR.toLowerCase())
    })
  }, [groupMembers, queryR])
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
  const loadUsers = (groupId) => {
    axios
      .get(`${backend}chatRooms/${userID}/createGroup/:${groupId}`)
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
        setGroupMembers(res.data)
        console.log(`Members From ${chatId} are: ${res.data}`)
      })
      .catch((err) => {
        if (err) {
          console.log(err.message)
        }
      })
  }
  const createNewGroup = () => {
    const groupValues = {
      name: groupName,
      isGroup: 1,
      creator: userID
    }
    axios
      .post(`${backend}chatRooms/createGroup`, groupValues)
      .then((res) => {
        console.log(res.data)
        setGroupId(res.data)
        loadUsers(res.data)
      })
      .catch((error) => {
        console.error('post failed', error.message)
      })
  }
  const addUserToGroup = (id) => {
    const groupValues = {
      groupId,
      userId: id
    }
    axios
      .post(`${backend}chatRooms/addMember`, groupValues)
      .then((res) => {
        console.log(res.data)
        loadMembers(groupId)
      })
      .catch((error) => {
        console.error('post failed', error.message)
      })
  }
  const removeUser = (userId) => {
    const memebrValues = {
      chat: groupId,
      member: userId
    }
    axios
      .post(`${backend}chatRooms/removeMember`, memebrValues)
      .then((res) => {
        console.log(res.data)
        loadMembers()
        loadUsers()
      })
      .catch((err) => {
        if (err) {
          console.log(err.message)
        }
      })
  }

  return (
    <div className="createBody">
      <div className="card">
        <div className="card-body">
          <div>
            <h1>Create Group Chat</h1>
          </div>

          <label className="input">
            <input
              className="input__field"
              type="text"
              placeholder=" "
              value={groupName}
              onChange={(e) => {
                setGroupName(e.target.value)
              }}
            />
            <span style={{ marginLeft: '2em' }} className="input__label">
              Group Name
            </span>
          </label>
          <div id="createGroupRemove">
            {groupId === null ? (
              <></>
            ) : (
              <div style={{ border: '2px solid var(--s)' }}>
                <h4>Add member</h4>
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
                <ul style={{ border: '2px solid var(--s)', height: '250px' }}>
                  {filterdUsers?.map((item, index) => {
                    return (
                      <li
                        key={index}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-around',
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          addUserToGroup(item.id)
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
            )}
          </div>
          <div id="createGroupRemove">
            {groupMembers === null ? (
              <></>
            ) : (
              <div style={{ border: '2px solid var(--s)' }}>
                <h4>Remove User</h4>
                <label className="input">
                  <input
                    onChange={(e) => {
                      setQueryR(e.target.value)
                    }}
                    className="input__field"
                    type="text"
                    placeholder=" "
                    value={queryR}
                  />
                  <span style={{ marginLeft: '2em' }} className="input__label">
                    Search
                  </span>
                </label>
                <ul>
                  {filterdGroupMembers?.map((item, index) => {
                    return (
                      <li
                        key={index}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-around',
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          removeUser(item.id)
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
            )}
          </div>
        </div>
        <div className="btnContainer">
          {groupId === null ? (
            <button
              onClick={() => {
                setShowCreateGroups('none')
                setGroupId(null)
                setGroupName('')
                setQuery('')
              }}
              style={{ background: '#6c757d' }}
              className="secondary">
              Cancle
            </button>
          ) : (
            <></>
          )}
          <button
            disabled={groupName === '' ? true : ''}
            style={{
              background: groupName === '' ? 'rgb(0, 123, 255, 0.25)' : 'rgb(0, 123, 255, 1)',
              color: groupName === '' ? 'rgb(227, 230, 233,0.25)' : 'rgb(227, 230, 233,1)',
              cursor: groupName === '' ? 'not-allowed' : 'pointer'
            }}
            onClick={() => {
              if (groupId === null) {
                createNewGroup()
              } else {
                setShowCreateGroups('none')
                setGroupId(null)
                setGroupName('')
                setQuery('')
              }
            }}>
            {groupId === null ? 'Create' : 'Finish'}
          </button>
        </div>
      </div>
    </div>
  )
}
