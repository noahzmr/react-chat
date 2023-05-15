import React, { useState, useContext, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { SocketContext, BackendContext, CountContext } from '../Services/default_values'
import icon from '../../style/img/favicon.ico'
import gravatar from 'gravatar'
import axios from 'axios'

export default function Notifications() {
  /* eslint-disable no-unused-vars */
  const [socket, setSocket] = useContext(SocketContext)
  const [backend, setBackend] = useContext(BackendContext)
  /* eslint-enable no-unused-vars */
  const [message, setMessage] = useState('1510515015105')
  const [name, setName] = useState('Noah Danael Zeumer')
  const [chat, setChatName] = useState('Males')
  const [notication, setNotication] = useState('none')

  const userId = localStorage.getItem('user')
  const params = useParams()
  const chatID = Number(params?.id)
  const [focus, setFocus] = useState()
  const [count, setCount] = useContext(CountContext)

  document.addEventListener('visibilitychange', (event) => {
    if (document.hidden) {
      console.log('not visible')
      setFocus(false)
    } else {
      console.log('is visible')
      setFocus(true)
    }
  })
  const navigate = useNavigate()

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

  useEffect(() => {
    if (!socket) {
      return
    }
    socket.on('notification', (msg, userID, chatId, name, chatName) => {
      console.warn('[Notification]', msg, userID, chatId, name, chatName)
      if (chatID === chatId || userId === userID) {
        console.log('[Notification] Not need to create Notification')
      } else {
        setCount(count + 1)
        // Create all nessessary objects
        const sec = document.createElement('div')
        sec.classList.add('sec')

        const profCont = document.createElement('div')
        profCont.classList.add('profCont')

        const img = document.createElement('img')
        img.classList.add('profile')

        const txt = document.createElement('div')
        txt.classList.add('txt')

        const sub = document.createElement('div')
        sub.classList.add('txt')
        sub.classList.add('sub')

        // connect the Elements together
        profCont.appendChild(img)
        sec.appendChild(profCont)
        sec.appendChild(txt)
        sec.appendChild(sub)

        // Add Content
        txt.textContent = msg
        img.src = `${backend}users/picture/${chatID}`
        img.onerror = function (event) {
          event.target.src =
            'https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png'
        }
        sub.textContent = new Date().toLocaleTimeString('en-US', {
          hour12: true,
          hour: 'numeric',
          minute: 'numeric'
        })
        document.getElementById('notification').appendChild(sec)

        if (focus === false) {
          Notification.requestPermission()
            .then((perm) => {
              if (perm === 'granted') {
                /* eslint-disable no-new */
                new Notification(chatName, {
                  /* eslint-enable no-new */
                  body: name + ': ' + msg,
                  data: { chat },
                  icon
                })
              } else {
                console.log('Failed to send Notification')
              }
            })
            .catch((reason) => {
              console.error('[Notification]', reason)
            })
        } else {
          setMessage(msg)
          setName(name)
          setChatName(chatName)
          setNotication('flex')
          setTimeout(() => {
            setNotication('none')
          }, 5000)
        }
      }
    })
  }, [socket])

  return (
    <label style={{ display: notication }} className={`alert-message message`}>
      <img
        id="avatar"
        src={`${backend}chatRooms/picture/chatId`}
        alt="userProfilePicture"
        // onError={(e) => DefaultAvatar(e)}
      />
      <div>
        <h1>{chat}</h1>
        <h3>{name}</h3>
        {message}
      </div>
      <span
        onClick={() => {
          setNotication('none')
        }}
        className="close">
        ×
      </span>
    </label>
  )
}
