import Keycloak from 'keycloak-js'
import React, { useContext } from 'react'
import { BackendContext } from '../web/Services/default_values'
import axios from 'axios'
import Update from './update'
import { useNavigate } from 'react-router-dom'
import config from '../config.json'

export default function KeycloakAuth() {
  const csrf = localStorage.getItem('csrf')
  const socket = localStorage.getItem('socketToken')
  const id = localStorage.getItem('user')
  const name = localStorage.getItem('name')
  const navigate = useNavigate()
  /* eslint-disable no-unused-vars */
  const [backend, setBackend] = useContext(BackendContext)
  /* eslint-enable no-unused-vars */

  if (id !== null && name !== null && csrf !== null && socket !== null) {
    navigate('/')
  }

  const loadProfile = () => {
    keycloak
      .loadUserProfile()
      .then((profile) => {
        console.warn('[Keycloak] Profile values: ', profile)
        output(profile)
        axios
          .post(`${backend}auth/keycloak`, profile)
          .then((res) => {
            if (res.data.msg === 'update') {
              document.getElementById('updateUser').style.display = 'block'
              document.getElementById('updateUserEmail').innerHTML = profile.email
              document.getElementById('updateUserName').innerHTML =
                profile.firstName + ' ' + profile.lastName
            } else if (res.data.msg === 'login') {
              localStorage.setItem('user', res.data.id)
              localStorage.setItem('name', profile.firstName + ' ' + profile.lastName)
              localStorage.setItem('csrf', res.data.csrfToken)
              localStorage.setItem('socketToken', res.data.socketToken)
              navigate('/')
            }
            console.log(res.data)
          })
          .catch((reason) => {
            console.error('post failed', reason)
          })
      })
      .catch(function () {
        output('Failed to load profile')
      })
  }

  const output = (data) => {
    if (id !== null && name !== null && csrf !== null && socket !== null) {
      navigate('/')
    } else {
      if (typeof data === 'object') {
        data = JSON.stringify(data, null, '  ')
      }
      document.getElementById('output').innerHTML = data
      if (data === 'Not Authenticated') {
        loadProfile()
      }
    }
  }

  const event = (event) => {
    var e = document.getElementById('events').innerHTML
    document.getElementById('events').innerHTML =
      new Date().toLocaleString() + '\t' + event + '\n' + e
  }

  var keycloak = new Keycloak({
    url: config.KC_URL,
    realm: config.KC_REALM,
    clientId: config.KC_CLIENT
  })

  keycloak.onAuthSuccess = () => {
    event('Auth Success')
  }

  keycloak.onAuthError = (errorData) => {
    event('Auth Error: ' + JSON.stringify(errorData))
  }
  keycloak.onTokenExpired = () => {
    event('Access token expired.')
  }

  keycloak.onActionUpdate = (status) => {
    switch (status) {
      case 'success':
        event('Action completed successfully')
        break
      case 'cancelled':
        event('Action cancelled by user')
        break
      case 'error':
        event('Action failed')
        break
    }
  }

  // Flow can be changed to 'implicit' or 'hybrid', but then client must enable implicit flow in admin console too
  var initOptions = {
    responseMode: 'fragment',
    flow: 'standard'
  }

  keycloak
    .init(initOptions)
    .then((authenticated) => {
      console.warn(authenticated)
      output('Init Success (' + (authenticated ? 'Authenticated' : 'Not Authenticated') + ')')
      authenticated ? loadProfile() : <></>
    })
    .catch((err) => {
      output('Init Error', err.message)
    })

  if (document.getElementById('output')?.innerHTML === 'Not Authenticated') {
    loadProfile()
  }
  return (
    <div>
      <Update />
      <button
        onClick={() => {
          keycloak.login()
        }}>
        Login
      </button>
      <button
        onClick={() => {
          loadProfile()
        }}>
        Get Profile
      </button>
      <h2>Result</h2>
      <pre id="output"></pre>

      <h2>Events</h2>
      <pre id="events"></pre>
    </div>
  )
}
