import React, { useEffect, useContext } from 'react'
import axios from 'axios'
import { SearchUserContext, BackendContext, SortContext } from '../Services/default_values'
import { CreateGroupContext, CreateDierectContext } from '../Services/css_values'
import { useNavigate } from 'react-router-dom'
import gravatar from 'gravatar'

export default function WebUserHeader() {
  const navigate = useNavigate()
  const params = window.location.href
  const userID = JSON.parse(localStorage.getItem('user'))

  // CSS Properies
  /* eslint-disable no-unused-vars */
  const [showCreateDierect, setShowCreateDierect] = useContext(CreateDierectContext)
  const chatId = Number(params?.id)
  const [backend, setBackend] = useContext(BackendContext)
  const email = localStorage.getItem('email')

  // All about Rooms
  const [query, setQuery] = useContext(SearchUserContext)
  const [showCreateGroup, setShowCreateGroups] = useContext(CreateGroupContext)
  const [sort, setSort] = useContext(SortContext)

  /* eslint-enable no-unused-vars */

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

  const loadUserData = () => {
    axios
      .get(`${backend}users/data/${userID}`)
      .then((res) => {
        console.log('Get user Profile!', res.data)
      })
      .catch((err) => {
        if (err) {
          console.log('Failed Get user Profile!', err.message)
        }
      })
  }
  // Display Profile
  const displayProfile = () => {
    if (params.includes('user')) {
      navigate(`/${chatId}`)
    } else {
      navigate('/user')
    }
  }

  useEffect(() => {
    loadUserData()
  }, [userID])
  return (
    <div className="chatHeader">
      {/*
<-------- Serach Room Header begin ---------->
*/}
      <div className="chatButtonContainer">
        <button
          onClick={() => {
            displayProfile()
          }}>
          <img
            id="avatar"
            src={`${backend}users/picture/${userID}`}
            alt="userProfilePicture"
            onError={(e) => DefaultAvatar(e, email)}
            style={{ height: '3em', border: '3px solid black', borderRadius: '50%' }}
          />
        </button>
      </div>
      <div className="search-container">
        <div className="box">
          <form name="search">
            <input
              type="serach"
              className="input"
              name="txt"
              placeholder="Search Chat..."
              onChange={(e) => {
                setQuery(e.target.value)
              }}
            />
          </form>
          <i className="bi bi-search"></i>
        </div>
      </div>
      {/*
<-------- Serach Room Header end ---------->
*/}
      <div className="chatButtonContainer">
        {/*
<-------- New Privat Msg begin ---------->
*/}
        <div className="dropdown">
          <button className="dropbtn" id="create_chat_button">
            <i className="bi bi-pencil-square"></i>
          </button>
          <div className="dropdown-content">
            <div
              onClick={() => {
                setShowCreateGroups('block')
              }}>
              <i className="bi bi-people"></i>
              <p>Create new Group Chat</p>
            </div>
            <div
              id="create_chat_private"
              onClick={() => {
                setShowCreateDierect('block')
              }}>
              <i className="bi bi-person"></i>
              <p>Create new Private Messange</p>
            </div>
          </div>
        </div>
        {/*
<-------- New Privat Msg end ---------->
*/}
        {/*
<-------- New Group Chat begin ---------->
*/}
        <div className="dropdown">
          <button type="button">
            <i className="bi bi-sort-down"></i>
          </button>
          <div className="dropdown-content" id="sort">
            <div
              onClick={() => {
                setSort('byName')
              }}>
              <i className="bi bi-person"></i>
              <p>Name</p>
            </div>
            <div
              onClick={() => {
                setSort('byTime')
              }}>
              <i className="bi bi-clock"></i>
              <p>Activity</p>
            </div>
            <div
              onClick={() => {
                setSort('byRead')
              }}>
              <i className="bi bi-bookmark"></i>
              <p>Unread</p>
            </div>
          </div>
        </div>
        {/*
<-------- New Group Chat end ---------->
*/}
      </div>
    </div>
  )
}
