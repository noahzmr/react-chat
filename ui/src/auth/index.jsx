import React, { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { Buffer } from 'buffer'
import $ from 'jquery'
import { useNavigate } from 'react-router-dom'
import { BackendContext } from '../web/Services/default_values'
import Keycloak from 'keycloak-js'
import { Outlet } from 'react-router-dom'

export default function SignUp() {
  const navigate = useNavigate()
  const tmp = JSON.parse(localStorage.getItem('tmp'))
  const [password, setPassword] = useState()
  const [passwordRepet, setPasswordRepet] = useState()
  const [email, SetEmail] = useState()
  /* eslint-disable no-unused-vars */
  const [backend, setBackend] = useContext(BackendContext)
  const [chatId, setChatId] = useState(null)
  const [message, setMessage] = useState()
  const [userNameCo, setUserName] = useState()

  /* eslint-enable no-unused-vars */
  const [showOtp, setShowOtp] = useState('none')
  const [showLogin, setShowLogin] = useState('block')
  const [qrCode, setQrCode] = useState('')
  const [notification, setNotication] = useState('none')
  const [type, setType] = useState('alert')
  // OTP Input
  const [token1, setToken1] = useState('')
  const [token2, setToken2] = useState('')
  const [token3, setToken3] = useState('')
  const [token4, setToken4] = useState('')
  const [token5, setToken5] = useState('')
  const [token6, setToken6] = useState('')
  const tokenAll = [token1 + token2 + token3 + token4 + token5 + token6]
  const csrf = localStorage.getItem('csrf')
  const socket = localStorage.getItem('socketToken')
  const id = localStorage.getItem('user')
  const name = localStorage.getItem('name')
  const [showOtpWanted, setShowOtpWanted] = useState('hidden')
  const [otpWanted, setOtpWanted] = useState('0')
  const [otpInput, setOtpInput] = useState('none')
  const [terms, setTerms] = useState(false)
  const wantOtp = () => {
    setShowOtpWanted('visible')
    setOtpWanted('1')
  }
  const dontWantOtp = () => {
    setShowOtpWanted('hidden')
    setOtpWanted('0')
  }

  // Jump to The next OTP field
  $(document).ready(function () {
    $('input').keyup(function () {
      if ($(this).val().length === $(this).attr('maxlength')) {
        $(this).next().focus()
      }
    })
  })

  const showNotification = (msg, type) => {
    setNotication('block')
    setMessage(msg)
    setType(type)
    setTimeout(() => {
      setNotication('none')
    }, 5000)
  }
  const signUp = () => {
    if (password === passwordRepet) {
      const UserValues = {
        userNameCo,
        password,
        email
      }
      axios
        .post(`${backend}auth/signup`, UserValues)
        .then((res) => {
          console.warn('Success! Signup', res.data)
          console.log('Success!')
        })
        .catch((reason) => {
          console.error('Failed create User!', reason)
        })
      navigate('/')

      console.log(UserValues)
    } else {
      showNotification(`Hello ${email ? email : ''}, the passwords entered do not match.`, 'warn')
    }
  }

  const login = () => {
    const data = {
      user: email,
      psw: password
    }
    axios
      .post(`${backend}auth/login`, data)
      .then((res) => {
        console.warn('[AUTH](Login)', res.data)

        if (res.data.message === 'firstLogin') {
          setOtpInput('none')
          setShowOtp('block')
          setShowLogin('none')
          setQrCode(res.data.otp)
          setMessage(
            `Hello ${
              email ? email : ''
            }, it it looks like this is your first application!  If you want you can activate the two factor authentication in the next step.`
          )
          showNotification(
            `Hello ${
              email ? email : ''
            }, it it looks like this is your first application!  If you want you can activate the two factor authentication in the next step.`,
            'warn'
          )
        } else if (res.data.message.includes('Authend as')) {
          localStorage.setItem('csrf', res.data.csrfToken)
          localStorage.setItem('socketToken', res.data.socketToken)
          localStorage.setItem('user', res.data.val.id)
          localStorage.setItem('email', res.data.val.email)
          localStorage.setItem('name', res.data.val.name)
          navigate('/')
        } else if (res.data.message.includes('Already Sign In')) {
          localStorage.setItem('csrf', res.data.csrfToken)
          localStorage.setItem('socketToken', res.data.socketToken)
          localStorage.setItem('user', res.data.id)
          localStorage.setItem('email', res.data.user)
          localStorage.setItem('name', res.data.name)
          navigate('/')
        } else if (res.data.message === 'otpCheck') {
          setOtpInput('block')
          setShowOtp('none')
          setShowLogin('none')
          setMessage(
            `Hello ${
              email ? email : ''
            }, you have activated your two factor authentication to continue please enter your token.`
          )
          showNotification(
            `Hello ${
              email ? email : ''
            }, you have activated your two factor authentication to continue please enter your token.`,
            'warn'
          )
        } else if (res.data.message === 'verify') {
          setMessage(`Somthing went wrong `)
          showNotification(
            `Hello ${
              email ? email : ''
            }, You must first complete your registration with the email you received from us.`,
            'warn'
          )
        } else {
          setMessage(`Somthing went wrong `)
          showNotification(
            `Hello ${
              email ? email : ''
            }, it looks like the credentials are not correct, please try again.`,
            'error'
          )
        }
      })
      .catch((err) => {
        console.error(err.message)
        setMessage(`Somthing went wrong ${err.message}`)
        showNotification(
          `Hello ${
            email ? email : ''
          }, it looks like the credentials are not correct, please try again.`,
          'error'
        )
      })
  }

  const checkOtp = () => {
    const updateValues = {
      username: email,
      wanted: otpWanted,
      token: tokenAll.toString(),
      password: password
    }
    console.warn('[Auth](CHECK OTP)', updateValues)
    axios
      .post(`${backend}auth/token`, updateValues)
      .then((res) => {
        console.warn('[Auth](CHECK OTP)', res.data)
        if (res.data.id) {
          localStorage.setItem('csrf', res.data.csrfToken)
          localStorage.setItem('socketToken', res.data.socketToken)
          localStorage.setItem('user', res.data.id)
          localStorage.setItem('email', res.data.username)
          localStorage.setItem('name', res.data.name)
          console.warn('[AUTH](Login)', res.data)
          navigate('/')
        } else {
          showNotification(
            `Hello ${
              email ? email : ''
            }, it looks like the token is not correct, please try again.`,
            'error'
          )
        }
      })
      .catch((reason) => {
        console.error('post failed', reason)
      })
  }
  const loadProfile = () => {
    keycloak
      .loadUserProfile()
      .then((profile) => {
        if (profile) {
          console.warn('[Keycloak] Profile values: ', profile)
          output(profile)
          axios
            .post(`${backend}auth/keycloak`, profile)
            .then((res) => {
              if (res.data.msg === 'update') {
                localStorage.setItem(
                  'tmp',
                  JSON.stringify({
                    email: profile.email,
                    name: profile.firstName + ' ' + profile.lastName,
                    url: '/login/update'
                  })
                )
                navigate('/login/update?r=' + new Date().getTime(), { replace: true })
              } else if (res.data.msg === 'login') {
                localStorage.setItem('user', res.data.id)
                localStorage.setItem('email', profile.email)
                localStorage.setItem('name', profile.firstName + ' ' + profile.lastName)
                localStorage.setItem('csrf', res.data.csrfToken)
                localStorage.setItem('socketToken', res.data.socketToken)
                navigate('/?r=' + new Date().getTime(), { replace: true })
              } else if (res.data.msg === 'signup') {
                localStorage.setItem(
                  'tmp',
                  JSON.stringify({
                    email: profile.email,
                    name: profile.firstName + ' ' + profile.lastName,
                    url: '/login/signup'
                  })
                )

                navigate('/login/signup?r=' + new Date().getTime(), { replace: true })
              } else if (res.data.msg === 'verify') {
                setMessage(`Somthing went wrong `)
                showNotification(
                  `Hello ${
                    email ? email : ''
                  }, You must first complete your registration with the email you received from us.`,
                  'warn'
                )
              }
            })
            .catch((reason) => {
              console.error('post failed', reason)
            })
        }
      })
      .catch(() => {
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
      if (data === 'Not Authenticated') {
        loadProfile()
      }
    }
  }

  var keycloak = new Keycloak({
    url: 'https://keycloak.noerkelit.online/',
    realm: 'NoerkelIT',
    clientId: 'noerkelit_chat'
  })

  // Flow can be changed to 'implicit' or 'hybrid', but then client must enable implicit flow in admin console too
  var initOptions = {
    responseMode: 'fragment',
    flow: 'standard'
  }

  useEffect(() => {
    if (tmp) {
      return
    }
    keycloak
      .init(initOptions)
      .then((authenticated) => {
        console.warn('authenticated: ', authenticated)
        output('Init Success (' + (authenticated ? 'Authenticated' : 'Not Authenticated') + ')')
        authenticated ? loadProfile() : <></>
      })
      .catch((err) => {
        output('Init Error', err.message)
      })
    if (id !== null && name !== null && csrf !== null && socket !== null) {
      if (chatId === null) {
        navigate(`/`)
      } else {
        navigate(`/${chatId}`)
      }
    } else if (tmp) {
      navigate(tmp.url)
    } else {
      console.log('Render but no values')
    }
  }, [keycloak])

  return (
    <div>
      <label style={{ display: notification }} className={`alert-message ${type}`}>
        {message}
        <span
          onClick={() => {
            setNotication('none')
          }}
          className="close">
          ×
        </span>
      </label>
      <Outlet />
      <div className="loginBody">
        <div className="main" style={{ display: showLogin }}>
          <input type="checkbox" id="chk" aria-hidden="true" />

          <div className="signup">
            <form style={{ marginTop: '-25px' }}>
              <label htmlFor="chk" aria-hidden="true">
                Sign up
              </label>
              <div style={{ marginTop: '-25px' }}>
                <input
                  type="text"
                  name="txt"
                  placeholder="User name"
                  id="user_name"
                  required=""
                  onChange={(e) => {
                    setUserName(e.target.value)
                  }}
                />

                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  id="email"
                  required=""
                  onChange={(e) => {
                    SetEmail(e.target.value)
                  }}
                />
                <input
                  type="password"
                  name="pswd"
                  placeholder="Password"
                  id="password"
                  required=""
                  onChange={(e) => {
                    setPassword(e.target.value)
                  }}
                />
                <input
                  type="password"
                  name="pswd"
                  placeholder="Repat Password"
                  id="password_repet"
                  required=""
                  onChange={(e) => {
                    setPasswordRepet(e.target.value)
                  }}
                />
              </div>
              <div style={{ marginTop: '-12px' }}>
                <button
                  style={{
                    background: !terms ? 'rgb(0, 123, 255, 0.25)' : 'rgb(0, 123, 255, 1)',
                    color: !terms ? 'rgb(227, 230, 233,0.25)' : 'rgb(227, 230, 233,1)',
                    cursor: !terms ? 'not-allowed' : 'pointer',
                    border: 'none'
                  }}
                  type="button"
                  id="sign_up_button"
                  onClick={() =>
                    terms
                      ? signUp()
                      : showNotification(
                          `Hello ${
                            email ? email : ''
                          }, You must agree to the terms and conditions before you can continue.`,
                          'warn'
                        )
                  }>
                  Sign up
                </button>
                <button
                  type="button"
                  id="keycloak_btn"
                  onClick={() => {
                    keycloak.login()
                  }}>
                  Keycloak
                </button>
                <div className="terms">
                  <input
                    type="checkbox"
                    id="terms"
                    onClick={() => {
                      terms ? setTerms(false) : setTerms(true)
                    }}
                  />
                  <p> I agree to the NoerkelIt Software and Service Agreement</p>
                </div>
              </div>
            </form>
          </div>

          <div className="login">
            <div>
              <label id="login_label" htmlFor="chk" aria-hidden="true">
                Login
              </label>
              <input
                type="email"
                name="email"
                id="login_email"
                placeholder="Email"
                required=""
                onChange={(e) => {
                  SetEmail(e.target.value)
                }}
              />
              <input
                type="password"
                id="login_password"
                name="pswd"
                placeholder="Password"
                required=""
                onChange={(e) => {
                  setPassword(e.target.value)
                }}
              />
              <button id="login_submit" type="button" onClick={() => login()}>
                Login
              </button>
            </div>
          </div>
        </div>
        <div className="main" style={{ display: showOtp }}>
          <div style={{ textAlign: 'center' }}>
            <label htmlFor="chk" aria-hidden="true">
              OTP
            </label>
            <div style={{ height: '100px', marginTop: '-2em' }}>
              <p style={{ color: 'white' }}>Do you want to enable two-factor authentication?</p>
              <div style={{ marginTop: '-50px' }}>
                <label id="change_otp_type" className="switch">
                  <input
                    type="checkbox"
                    onClick={() => {
                      showOtpWanted === 'hidden' ? wantOtp() : dontWantOtp()
                    }}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
            <div style={{ visibility: showOtpWanted }}>
              {qrCode === '' ? <></> : <img src={Buffer.from(qrCode, '').toString('')} />}
              <div className="otpCotainer">
                <input
                  className="otpFild"
                  id="otp_1"
                  maxLength={1}
                  onChange={(e) => {
                    setToken1(e.target.value)
                    setOtpWanted('1')
                  }}
                  value={token1}
                />
                <input
                  className="otpFild"
                  maxLength={1}
                  onChange={(e) => setToken2(e.target.value)}
                  value={token2}
                  id="otp_2"
                />
                <input
                  className="otpFild"
                  maxLength={1}
                  onChange={(e) => setToken3(e.target.value)}
                  value={token3}
                  id="otp_3"
                />
                <input
                  className="otpFild"
                  maxLength={1}
                  onChange={(e) => setToken4(e.target.value)}
                  value={token4}
                  id="otp_4"
                />
                <input
                  className="otpFild"
                  maxLength={1}
                  onChange={(e) => setToken5(e.target.value)}
                  value={token5}
                  id="otp_5"
                />
                <input
                  className="otpFild"
                  maxLength={1}
                  onChange={(e) => setToken6(e.target.value)}
                  value={token6}
                  id="otp_6"
                />
              </div>
            </div>
            <button id="otp_button" type="button" onClick={() => checkOtp()}>
              Continue
            </button>
          </div>
        </div>
        <div className="main" style={{ display: otpInput }}>
          <label htmlFor="chk" aria-hidden="true">
            OTP
          </label>
          <input type="checkbox" id="chk" aria-hidden="true" />
          <div
            style={{
              height: '70%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
            <div className="otpCotainer">
              <input
                className="otpFild"
                maxLength={1}
                onChange={(e) => {
                  setToken1(e.target.value)
                  setOtpWanted('1')
                }}
                value={token1}
              />
              <input
                className="otpFild"
                maxLength={1}
                onChange={(e) => setToken2(e.target.value)}
                value={token2}
              />
              <input
                className="otpFild"
                maxLength={1}
                onChange={(e) => setToken3(e.target.value)}
                value={token3}
              />
              <input
                className="otpFild"
                maxLength={1}
                onChange={(e) => setToken4(e.target.value)}
                value={token4}
              />
              <input
                className="otpFild"
                maxLength={1}
                onChange={(e) => setToken5(e.target.value)}
                value={token5}
              />
              <input
                className="otpFild"
                maxLength={1}
                onChange={(e) => setToken6(e.target.value)}
                value={token6}
              />
            </div>
            <button type="button" onClick={() => checkOtp()}>
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
