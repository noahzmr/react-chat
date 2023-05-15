import React, { useContext } from 'react'
import { AcceptContext } from '../../Services/context'
import { BackendContext } from '../../Services/default_values'
import gravatar from 'gravatar'
import axios from 'axios'

export default function GetCall(props) {
  const [acceptCall, setAcceptCall] = useContext(AcceptContext)
  const [backend, setBackend] = useContext(BackendContext)
  const userID = localStorage.getItem('user')
  const email = localStorage.getItem('email')
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
  return (
    <div className="infoContainer">
      <div className="pulsating-circle">
        <img
          className="pulsating-circle"
          id="remote-video-avatar"
          src={`${backend}users/picture/${userID}`}
          alt="userProfilePicture"
          onError={(e) => DefaultAvatar(e, email)}
        />
      </div>
      <div>
        <h3> is trying to call you...</h3>
        <button
          className="callBtn start"
          onClick={() => {
            setAcceptCall(true)
            console.log(acceptCall)
          }}>
          <i className="bi bi-telephone-fill"></i>
        </button>
        <button
          className="callBtn end"
          onClick={() => {
            setAcceptCall(false)
            console.log(acceptCall)
          }}>
          <i className="bi bi-telephone-fill"></i>
        </button>
      </div>
    </div>
  )
}
