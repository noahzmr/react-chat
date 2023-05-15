import React, { useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { BackendContext } from '../web/Services/default_values'
import { useNavigate } from 'react-router-dom'
import LoadingScreen from '../web/pages/loading'

export default function Signup() {
  const navigate = useNavigate()
  const tmp = JSON.parse(localStorage.getItem('tmp'))
  const [terms, setTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  /* eslint-disable no-unused-vars */
  const [backend, setBackend] = useContext(BackendContext)
  /* eslint-enable no-unused-vars */

  const create = () => {
    setLoading(true)
    const values = {
      name: tmp.name,
      email: tmp.email
    }
    console.log(values)
    axios
      .post(`${backend}auth/keycloak/signup`, values)
      .then((res) => {
        console.warn(res.data)
        navigate('/')
        setLoading(false)
        localStorage.removeItem('tmp')
      })
      .catch((reason) => {
        console.error('post failed', reason)
      })
  }
  const cancle = () => {
    navigate('/login')
    localStorage.removeItem('tmp')
  }

  useEffect(() => {
    if (tmp) {
      console.warn('SIGNUP', tmp)
    } else {
      navigate('/')
    }
  }, [])
  return (
    <div style={{ display: 'block' }} id="signupeUser">
      <div className="createBody">
        {loading ? <LoadingScreen /> : <></>}
        <div className="card">
          <div style={{ padding: '1em' }} className="card-body">
            <div>
              <h1>Signup!</h1>
              <p>Hi {tmp?.name},</p>
              <p>Thank you for signing up. We appreciate your interest.</p>
              <p>
                Since you signed up using Keycloak, your name and email are automatically filled in
                and no passwords are stored with us.
              </p>
              <p>Before we proceed, you need to confirm the terms and conditions again.</p>
              <div className="terms">
                <input
                  id="terms_signup"
                  type="checkbox"
                  onClick={() => {
                    terms ? setTerms(false) : setTerms(true)
                  }}
                />
                <p> I agree to the NoerkelIt Software and Service Agreement</p>
              </div>
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
              style={{
                background: !terms ? 'rgb(0, 123, 255, 0.25)' : 'rgb(0, 123, 255, 1)',
                color: !terms ? 'rgb(227, 230, 233,0.25)' : 'rgb(227, 230, 233,1)',
                cursor: !terms ? 'not-allowed' : 'pointer',
                border: 'none'
              }}
              id="sign_up_button"
              type="button"
              onClick={() => {
                terms ? create() : console.log('Waiting for terms')
              }}>
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
