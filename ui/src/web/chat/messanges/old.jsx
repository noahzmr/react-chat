import React, { useEffect, useState, useContext } from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'
import { BackendContext } from '../../Services/default_values'
import MarkdownView from './markdown'

export default function WebOldMessages() {
  const params = useParams()
  const userID = localStorage.getItem('user')
  /* eslint-disable no-unused-vars */
  const [backend, setBackend] = useContext(BackendContext)
  /* eslint-enable no-unused-vars */

  const [test, setTest] = useState({
    id: 0,
    image: ''
  })

  const [messages, setMessages] = useState()
  const [hasSeen, setHasSeen] = useState()
  const [fileName, setFileName] = useState()

  const loadOldMessages = (chatId) => {
    axios
      .get(`${backend}chatRooms/messages/${chatId}`)
      .then((res) => setMessages(res.data))
      .catch((err) => {
        if (err) {
          console.log(err.message)
        }
      })
  }

  const loadHasSeen = (messageId) => {
    axios
      .get(`${backend}chatRooms/readed/${messageId}`)
      .then((res) => setHasSeen(res.data))
      .catch((err) => {
        if (err) {
          console.log(err.message)
        }
      })
  }

  // Download File Function
  const getDisplayName = (id) => {
    axios
      .get(`${backend}chatrooms/downloadFileData/${id}`)
      .then((res) => {
        console.log('file Name', res.data)
        setFileName(res.data)
        downloadFile(id)
      })
      .catch((err) => {
        if (err) {
          console.log(err.message)
        }
      })
  }

  async function downloadFile(id) {
    const image = await fetch(`${backend}chatrooms/message/${id}/image`)
    const imageBlog = await image.blob()
    const imageURL = URL.createObjectURL(imageBlog)

    const link = document.createElement('a')
    link.href = imageURL
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const showImage = (id) => {
    axios
      .get(`${backend}chatrooms/downloadFile/${id}`)
      .then((res) => {
        setTest({
          id,
          image: res.data.file
        })
        console.log(test)
      })
      .catch((err) => {
        if (err) {
          console.log(err.message)
        }
      })
  }

  useEffect(() => {
    console.log('Props for the Old Messages: ', { Chat: params?.id, User: parseInt(userID) })
    loadOldMessages(params?.id)
  }, [params])

  return (
    <div id="message">
      {messages?.map((item, index) => {
        console.log('Old Msg: ', item)
        return (
          <div
            onClick={() => {
              item.file === null ? console.log('no file msg') : showImage(item.id)
            }}
            key={index}>
            <div className="clearfix" id="parent">
              <div
                className={
                  item.user_id === parseInt(userID) ? 'message-data align-right' : 'message-data'
                }
                id="child">
                <span className="message-data-time" id="time">
                  {item.send_at}{' '}
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
                {item.file === null ? (
                  <MarkdownView text={item.chat_message} />
                ) : (
                  <div>
                    <button
                      onClick={() => {
                        getDisplayName(item.id)
                      }}>
                      <i className="bi bi-file-earmark-arrow-down"></i>
                    </button>
                    <img
                      src={`${backend}chatrooms/message/${item.id}/image`}
                      className="chatImage"
                      alt="file"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
