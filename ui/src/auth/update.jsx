import React, { useContext, useState, useMemo, useEffect } from 'react'
import axios from 'axios'
import { BackendContext } from '../web/Services/default_values'
import { useNavigate } from 'react-router-dom'
export default function Update() {
  const navigate = useNavigate()

  /* eslint-disable no-unused-vars */
  const [backend, setBackend] = useContext(BackendContext)
  /* eslint-enable no-unused-vars */
  const tmp = JSON.parse(localStorage.getItem('tmp'))

  const update = () => {
    const values = {
      name: tmp.name
    }
    axios
      .put(`${backend}auth/keycloak/${tmp.email}`, values)
      .then((res) => {
        console.warn(res.data)
        localStorage.setItem('user', res.data.id)
        localStorage.setItem('email', tmp.email)
        localStorage.setItem('name', res.data.name)
        localStorage.setItem('csrf', res.data.csrfToken)
        localStorage.setItem('socketToken', res.data.socketToken)
        localStorage.removeItem('tmp')
        navigate('/')
      })
      .catch((reason) => {
        console.error('post failed', reason)
        navigate('/')
      })
  }
  const cancle = () => {
    navigate('/login')
    localStorage.removeItem('tmp')
  }
  return (
    <div style={{ display: 'block' }} id="updateUser">
      <div className="createBody">
        <div className="card">
          <div style={{ padding: '1em' }} className="card-body">
            <div>
              <h1>Create a new Chat!</h1>
              <p>Hello {tmp.name},</p>
              <p id="updateUserEmail"></p>
              <p>
                It seems that you already have an account with us, under the email {tmp.email}. If
                you want we can overwrite your old account, none of your chats will be lost, however
                we would delete your login details so that you can only login via Keycloak. If you
                want to do this click on continue, otherwise click on cancel.
              </p>
            </div>
          </div>
          <div className="btnContainer">
            <button
              onClick={() => {
                cancle()
              }}
              style={{ background: '#6c757d', border: 'none', cursor: 'pointer' }}>
              Cancle
            </button>
            <button
              onClick={() => {
                update()
              }}
              style={{ background: 'rgb(0, 123, 255, 1)', border: 'none', cursor: 'pointer' }}>
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
