import React from 'react'
import MarkdownView from './markdown'
import moment from 'moment/moment'
import { CountContext, backendInit } from '../../Services/default_values'
import gravatar from 'gravatar'
import axios from 'axios'

import ReactDOMServer from 'react-dom/server'

export default async function displayMessage(message, user, userName, userID) {
  console.log('new Message', { message, user, userName, userID })
  return new Promise((resolve, reject) => {
    if (user === 'system') {
      systemMsg(message)
    } else if (user === 'user') {
      userMsg(message, userName)
    } else if (user === userID) {
      ownMsg(message, user, userName, userID)
    } else if (user !== userID && user !== 'system' && user !== 'user' && message !== 'typing') {
      typingMsg(message, user, userName, userID)
    } else {
      alert('error')
      reject('It is an error turned up. The message cannot be displayed.')
    }
  })
}

const createParent = async () => {
  // Create Msg Container
  const item = document.createElement('div')
  item.id = 'parent'
  item.classList.add('clearfix')
  return item
}

const createDetail = async (userName) => {
  const detail = document.createElement('div')
  detail.id = 'child'
  const time = document.createElement('span')
  time.id = 'time'
  time.textContent = moment().format('MMMM Do YYYY, h:mm:ss a')
  time.classList.add('message-data-time')
  // Create Detail Name
  const name = document.createElement('span')
  name.id = 'msgDetailName'
  name.textContent = ' ' + userName
  name.classList.add('message-data-name')

  // Connect Time && Name with Detail Container
  detail.appendChild(time)
  detail.appendChild(name)

  return detail
}

const createMessageBody = async (message) => {
  // Create Msg Container
  const msg = document.createElement('div')
  msg.id = 'chatMsg'
  msg.innerHTML = ReactDOMServer.renderToStaticMarkup(<MarkdownView text={message} />)

  return msg
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
const downloadFile = async (id, fileName) => {
  const image = await fetch(`${backendInit}chatrooms/message/${id}/image`)
  const imageBlog = await image.blob()
  const imageURL = URL.createObjectURL(imageBlog)

  const link = document.createElement('a')
  link.href = imageURL
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
const getDisplayName = (id) => {
  axios
    .get(`${backendInit}chatrooms/downloadFileData/${id}`)
    .then((res) => {
      console.log('file Name', res.data)
      downloadFile(id, res.data)
    })
    .catch((err) => {
      if (err) {
        console.log(err.message)
      }
    })
}
const systemMsg = (message) => {
  //   setCount(count + 1)
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
  if (message.msg) {
    txt.textContent = message.msg
    img.src = `${backendInit}users/picture/${message.id}`
    img.onerror = function (event) {
      event.target.src = 'https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png'
    }
  } else {
    txt.textContent = message
    img.onerror = (e) => {
      DefaultAvatar(e)
    }
  }
  sub.textContent = new Date().toLocaleTimeString('en-US', {
    hour12: true,
    hour: 'numeric',
    minute: 'numeric'
  })
  document.getElementById('notification').appendChild(sec)
  document.getElementById('bottomRef').scrollIntoView({ behavior: 'smooth' })
}

const userMsg = async (message, userName) => {
  const item = await createParent()

  const detail = await createDetail(userName)

  // Connect Detail with Container
  item.appendChild(detail)

  // Create Msg
  const msg = await createMessageBody(message)
  msg.classList.add('msgNotification')

  // Connect Msg with Container
  item.appendChild(msg)

  // Add the paar to the msg div
  document.getElementById('messages').appendChild(item)

  // scroll to the bottom
  document.getElementById('bottomRef').scrollIntoView({ behavior: 'smooth' })
}

const ownMsg = async (message, user, userName, userID) => {
  if (message.split('+')[0] === 'this_is_a_file') {
    const id = message.split('+')[1]
    console.log('new Message', message.split('+'))
    console.log('new Message Detected File', id)

    const item = await createParent()

    const detail = await createDetail(userName)

    detail.classList.add('message-data')
    detail.classList.add('align-right')

    // Connect Detail with Container
    item.appendChild(detail)

    // Create Msg
    const msg = await createMessageBody(message)
    msg.classList.add('message')
    msg.classList.add('other-message')
    msg.classList.add('float-right')

    // Create  File Icon
    const fileIcon = document.createElement('i')
    fileIcon.classList.add('bi')
    fileIcon.classList.add('bi-file-earmark-arrow-down')
    msg.addEventListener('click', () => {
      getDisplayName(id)
    })

    msg.appendChild(fileIcon)

    // Create Image
    const image = document.createElement('img')
    console.group(`${backendInit}chatrooms/message/${id}/image`)
    image.src = `${backendInit}chatrooms/message/${id}/image`
    image.classList.add('chatImage')
    msg.appendChild(image)

    // Connect Msg with Container
    item.appendChild(msg)

    // Add the paar to the msg div
    document.getElementById('messages').appendChild(item)

    // scroll to the bottom
    document.getElementById('bottomRef').scrollIntoView({ behavior: 'smooth' })
  } else {
    console.log({ 'user Msg': user, 'login as': userID })

    const item = await createParent()

    // Create Detail Container
    const detail = await createDetail(userName)

    detail.classList.add('message-data')
    detail.classList.add('align-right')

    // Connect Detail with Container
    item.appendChild(detail)

    // Create Msg
    const msg = await createMessageBody(message)
    msg.classList.add('message')
    msg.classList.add('other-message')
    msg.classList.add('float-right')

    // Connect Msg with Container
    item.appendChild(msg)

    // Add the paar to the msg div
    document.getElementById('messages').appendChild(item)

    // scroll to the bottom
    document.getElementById('bottomRef').scrollIntoView({ behavior: 'smooth' })
  }
}

const typingMsg = async (message, user, userName, userID) => {
  console.log({ 'user Msg': user, 'login as': userID })

  const item = await createParent()

  // Create Detail Container
  const detail = await createDetail(userName)

  detail.classList.add('message-data')

  // Connect Detail with Container
  item.appendChild(detail)

  // Create Msg
  const msg = await createMessageBody(message)
  msg.classList.add('message')
  msg.classList.add('my-message')

  // Connect Msg with Container
  item.appendChild(msg)

  // Add the paar to the msg div
  document.getElementById('messages').appendChild(item)

  // scroll to the bottom
  document.getElementById('bottomRef').scrollIntoView({ behavior: 'smooth' })
}
