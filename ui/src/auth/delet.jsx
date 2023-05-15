import React, { useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { BackendContext } from '../web/Services/default_values'
import { useNavigate } from 'react-router-dom'
import LoadingScreen from '../web/pages/loading'

export default function Delete() {
  const navigate = useNavigate()
  const [terms, setTerms] = useState(false)
  const user = localStorage.getItem('user')
  const email = localStorage.getItem('email')
  const name = localStorage.getItem('name')
  const [reason, setReason] = useState(undefined)
  const [loading, setLoading] = useState(false)
  /* eslint-disable no-unused-vars */
  const [backend, setBackend] = useContext(BackendContext)
  /* eslint-enable no-unused-vars */

  const deleteUser = () => {
    setLoading(true)
    const values = {
      id: user,
      email: email,
      name: name,
      reason: reason
    }
    console.log(values)
    axios
      .post(`${backend}auth/delete`, values)
      .then((res) => {
        console.warn(res.data)
        window.localStorage.clear()
        navigate('/')
        setLoading(false)
      })
      .catch((reason) => {
        console.error('post failed', reason)
      })
  }
  const cancle = () => {
    navigate('/login')
    localStorage.removeItem('tmp')
  }

  return (
    <div style={{ display: 'block' }} id="deleteUser">
      <div className="createBody">
        {loading ? <LoadingScreen /> : <></>}
        <div className="card">
          <div style={{ padding: '1em' }} className="card-body">
            <div>
              <h1>Delet the account!</h1>
              <p>Hi {name},</p>
              <p>we are sorry that you want to leave us, would you give us a reason?</p>
              <select>
                <option selected disabled value="">
                  Reason
                </option>
                <option
                  onClick={(e) => {
                    setReason(e.target.value)
                  }}
                  value="tested enough">
                  tested enough
                </option>
                <option
                  onClick={(e) => {
                    setReason(e.target.value)
                  }}
                  value="I do not like">
                  I do not like
                </option>
                <option
                  onClick={(e) => {
                    setReason(e.target.value)
                  }}
                  value="better alternative found">
                  better alternative found
                </option>
                <option
                  onClick={(e) => {
                    setReason(e.target.value)
                  }}
                  value="no specification">
                  no specification
                </option>
              </select>
              <p>You will receive an email from us where you can delete your account.</p>
              <div className="terms">
                <input
                  type="checkbox"
                  onClick={() => {
                    terms ? setTerms(false) : setTerms(true)
                  }}
                />
                <p>I am sure that I want to delete the account.</p>
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
                background: !terms ? 'rgb(178, 34, 34, 0.25)' : 'rgb(178, 34, 34, 1)',
                color: !terms ? 'rgb(227, 230, 233,0.25)' : 'rgb(227, 230, 233,1)',
                cursor: !terms ? 'not-allowed' : 'pointer',
                border: 'none'
              }}
              onClick={() => {
                deleteUser()
              }}>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
