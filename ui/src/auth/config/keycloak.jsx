import Keycloak from 'keycloak-js'
import React, { useEffect } from 'react'

export default function KeycloakAuth() {
  function loadProfile() {
    keycloak
      .loadUserProfile()
      .then((profile) => {
        console.warn('[Keycloak] Profile values: ', profile)
        output(profile)
      })
      .catch(function () {
        output('Failed to load profile')
      })
  }

  function loadUserInfo() {
    keycloak
      .loadUserInfo()
      .then(function (userInfo) {
        output(userInfo)
      })
      .catch(function () {
        output('Failed to load user info')
      })
  }

  function refreshToken(minValidity) {
    keycloak
      .updateToken(minValidity)
      .then(function (refreshed) {
        if (refreshed) {
          output(keycloak.tokenParsed)
        } else {
          output(
            'Token not refreshed, valid for ' +
              Math.round(
                keycloak.tokenParsed.exp + keycloak.timeSkew - new Date().getTime() / 1000
              ) +
              ' seconds'
          )
        }
      })
      .catch(function () {
        output('Failed to refresh token')
      })
  }

  function showExpires() {
    if (!keycloak.tokenParsed) {
      output('Not authenticated')
      return
    }

    var o =
      'Token Expires:\t\t' +
      new Date((keycloak.tokenParsed.exp + keycloak.timeSkew) * 1000).toLocaleString() +
      '\n'
    o +=
      'Token Expires in:\t' +
      Math.round(keycloak.tokenParsed.exp + keycloak.timeSkew - new Date().getTime() / 1000) +
      ' seconds\n'

    if (keycloak.refreshTokenParsed) {
      o +=
        'Refresh Token Expires:\t' +
        new Date((keycloak.refreshTokenParsed.exp + keycloak.timeSkew) * 1000).toLocaleString() +
        '\n'
      o +=
        'Refresh Expires in:\t' +
        Math.round(
          keycloak.refreshTokenParsed.exp + keycloak.timeSkew - new Date().getTime() / 1000
        ) +
        ' seconds'
    }

    output(o)
  }

  function output(data) {
    if (typeof data === 'object') {
      data = JSON.stringify(data, null, '  ')
    }
    document.getElementById('output').innerHTML = data
  }

  function event(event) {
    var e = document.getElementById('events').innerHTML
    document.getElementById('events').innerHTML =
      new Date().toLocaleString() + '\t' + event + '\n' + e
  }

  var keycloak = new Keycloak({
    url: 'https://keycloak.noerkelit.online/',
    realm: 'NoerkelIT',
    clientId: 'noerkelit_chat'
  })

  keycloak.onAuthSuccess = function () {
    event('Auth Success')
  }

  keycloak.onAuthError = function (errorData) {
    event('Auth Error: ' + JSON.stringify(errorData))
  }

  keycloak.onAuthRefreshSuccess = function () {
    event('Auth Refresh Success')
  }

  keycloak.onAuthRefreshError = function () {
    event('Auth Refresh Error')
  }

  keycloak.onAuthLogout = function () {
    event('Auth Logout')
  }

  keycloak.onTokenExpired = function () {
    event('Access token expired.')
  }

  keycloak.onActionUpdate = function (status) {
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
      output('Init Success (' + (authenticated ? 'Authenticated' : 'Not Authenticated') + ')')
      console.warn(
        '[KEYCLOAK] Init Success (' + (authenticated ? 'Authenticated' : 'Not Authenticated') + ')'
      )
      output('Init Success (' + (authenticated ? 'Authenticated' : 'Not Authenticated') + ')')
      authenticated
        ? loadProfile()
        : console.warn(
            '[KEYCLOAK] Init Success (' +
              (authenticated ? 'Authenticated' : 'Not Authenticated') +
              ')'
          )
    })
    .catch((err) => {
      output('Init Error', err.message)
    })

  // useEffect(() => {
  //   keycloak.login()
  // }, [])
  return (
    <div>
      <button
        onClick={() => {
          keycloak.login()
        }}>
        Login
      </button>
      <button
        onClick={() => {
          keycloak.logout()
        }}>
        Logout
      </button>
      <button
        onClick={() => {
          keycloak.register()
        }}>
        Register
      </button>
      <button
        onClick={() => {
          refreshToken(9999)
        }}>
        Refresh Token
      </button>
      <button
        onClick={() => {
          refreshToken(30)
        }}>
        Refresh Token
      </button>
      <button
        onClick={() => {
          loadProfile()
        }}>
        Get Profile
      </button>
      <button
        onClick={() => {
          loadUserInfo()
        }}>
        Get User Info
      </button>
      <button
        onClick={() => {
          output(keycloak.tokenParsed)
        }}>
        Show Token
      </button>
      <button
        onClick={() => {
          output(keycloak.refreshTokenParsed)
        }}>
        Show Refresh Token
      </button>
      <button
        onClick={() => {
          output(keycloak.idTokenParsed)
        }}>
        Show ID Token
      </button>
      <button
        onClick={() => {
          showExpires()
        }}>
        Show Expires
      </button>
      <button
        onClick={() => {
          output(keycloak)
        }}>
        Show Details
      </button>
      <button
        onClick={() => {
          output(keycloak.createLoginUrl())
        }}>
        Show Login URL
      </button>
      <button
        onClick={() => {
          output(keycloak.createLogoutUrl())
        }}>
        Show Logout URL
      </button>
      <button
        onClick={() => {
          output(keycloak.createRegisterUrl())
        }}>
        Show Register URL
      </button>
      <button
        onClick={() => {
          output(keycloak.createAccountUrl())
        }}>
        Show Account URL
      </button>
      <h2>Result</h2>
      <pre id="output"></pre>

      <h2>Events</h2>
      <pre id="events"></pre>
    </div>
  )
}
