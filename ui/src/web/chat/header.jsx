import React, { useContext, useState, useEffect } from 'react'
import { CountContext, BackendContext } from '../Services/default_values'
import { OptionContext, WidthContext } from '../Services/css_values'
import { useNavigate, useParams } from 'react-router-dom'
export default function WebChatHeader(props) {
  const navigate = useNavigate()
  const params = useParams()
  const chatId = Number(params?.id)

  // CSS Properies
  /* eslint-disable no-unused-vars */
  const [showOptions, setShowOptions] = useContext(OptionContext)
  const [inputWidth, setInputWidth] = useContext(WidthContext)

  // All about Rooms
  /* eslint-disable react/prop-types */
  const [chatName, setChatName] = useState()
  useEffect(() => {
    console.log('[Chat](Header) PROPS', props)
    if (props?.chatName !== chatName) {
      setChatName(props?.chatName)
    }
  }, [props])
  /* eslint-enable react/prop-types */
  const DefaultAvatar = (event) => {
    event.target.src = 'https://freeiconshop.com/wp-content/uploads/edd/many-people-outline.png'
  }
  // Notifications
  const [count, setCount] = useContext(CountContext)
  /* eslint-enable no-unused-vars */
  const [backend, setBackend] = useContext(BackendContext)

  return (
    <div className="chat-header clearfix" id="chat-header">
      <img
        className="profilePictur"
        id="avatar"
        src={`${backend}chatRooms/picture/${chatId}`}
        alt="userProfilePicture"
        onError={(e) => DefaultAvatar(e)}
      />
      <div className="chat-about">
        <div className="chat-with"> {chatName}</div>
      </div>
      <div className="chatConatinerBtn">
        {/* Notification Start */}
        <div className="dropdown">
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyConten: 'center'
            }}>
            <button
              onClick={() => {
                navigate(`${chatId}/call`)
              }}>
              <i className="bi bi-telephone"> </i>
            </button>
            <button
              onClick={() => {
                navigate(`${chatId}/call`)
              }}>
              <i className="bi bi-camera-video"> </i>
            </button>
            <div className="icons">
              <div
                className="notification"
                onClick={() => {
                  setCount(0)
                }}>
                <div className="notBtn">
                  <div className="number">{count}</div>
                  <i className="bi bi-bell"></i>
                  <div className="box">
                    <div className="display">
                      <div className="nothing">
                        <i className="stick"></i>
                        <div className="cent">Looks Like your all caught up!</div>
                      </div>
                      <div className="cont">
                        <div id="notification"> </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Notification End */} {/* Function to show Options Side Bar */}
        <button
          type="button"
          onClick={() => {
            if (showOptions === 'none') {
              setShowOptions('block')
              setInputWidth('chatBodyDetail')
            } else {
              setShowOptions('none')
              setInputWidth('chatBody')
            }
          }}>
          <i className="bi bi-three-dots-vertical"> </i>
        </button>
      </div>
    </div>
  )
}
