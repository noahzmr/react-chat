import React, { useState, useContext } from 'react'
import axios from 'axios'
import { BackendContext } from '../../Services/default_values'
import gravatar from 'gravatar'

export default function WebPictureProfile() {
  const userID = localStorage.getItem('user')
  const email = localStorage.getItem('email')
  const [postImage, setPostImage] = useState()
  /* eslint-disable no-unused-vars */
  const [backend, setBackend] = useContext(BackendContext)
  /* eslint-enable no-unused-vars */

  // Uploade Image Function

  const DefaultAvatar = (event, email) => {
    var url = gravatar.url(email)
    console.warn(
      'gravatarv Profile:',
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

  const handleFileUpload = (e) => {
    if (e.target.files.length !== 1) {
      return
    }
    console.log(e.target.files[0].type)
    const formData = new FormData()
    formData.append('file', e.target.files[0])

    setPostImage(formData)
    try {
      axios
        .post(`${backend}users/${userID}/picture`, formData, {
          headers: {
            'Content-Type': e.target.files[0].type
          }
        })
        .then((res) => {
          console.log('Buffer from the image:', res.data)
          console.log(postImage)
        })
        .catch((reason) => {
          console.error('post failed', reason)
        })
    } catch (err) {
      console.log(err)
    }
  }

  
  return (
    <div>
      <div>
        <div className="userPictureContainer">
          <div className="userPicture">
            <div>
              <img
                id="avatar_action"
                src={`${backend}users/picture/${userID}`}
                alt="userProfilePicture"
                onError={(e) => DefaultAvatar(e, email)}
              />
            </div>
            <div className="userPictureHover">
              <input
                id="avatar_profile"
                type="file"
                label="Image"
                name="myFile"
                accept=".jpeg, .png, .jpg, .ico"
                onChange={(e) => handleFileUpload(e)}
                // onClick={console.log(postImage)}
              />
              <div>
                <label htmlFor="upload-photo">
                  <i className="bi bi-camera"></i>
                  <p>Profilbild ändern</p>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
