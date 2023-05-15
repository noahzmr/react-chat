import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { BackendContext } from '../../Services/default_values'
import gravatar from 'gravatar'
import axios from 'axios'

export default function TryToCall(props) {
  const userID = localStorage.getItem('user')
  const [backend, setBackend] = useContext(BackendContext)
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
  // Prop Validation
  TryToCall.propTypes = {
    otherPeer: PropTypes.any.isRequired
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
      <h2>Calling {props?.otherPeer}...</h2>
    </div>
  )
}
