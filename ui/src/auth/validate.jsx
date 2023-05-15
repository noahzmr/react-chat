import React, { useContext, useEffect } from 'react'
import axios from 'axios'
import { BackendContext } from '../web/Services/default_values'
import { useNavigate, useParams } from 'react-router-dom'
import Logo from '../style/img/logo-color.png'

export default function Validate() {
  const navigate = useNavigate()
  const { uuid } = useParams()

  /* eslint-disable no-unused-vars */
  const [backend, setBackend] = useContext(BackendContext)
  /* eslint-enable no-unused-vars */
  const tmp = JSON.parse(localStorage.getItem('tmp'))

  useEffect(() => {
    axios
      .get(`${backend}auth/verify/${uuid}`)
      .then((res) => {
        console.warn(res.data)
        setTimeout(() => {
          navigate('/')
        }, 10000)
      })
      .catch((err) => {
        console.log(err)
      })
  }, [])
  return (
    <div id="notFound">
      <div className="row">
        <h1>
          Welcome to the Chat! <img src={Logo} alt="logo" />
        </h1>
        <p>
          Your registration is now complete, you can click on the button and you will be redirected
          to the login page. You will also be redirected automatically in a few seconds.
        </p>
        <button
          onClick={() => {
            navigate('/')
          }}
          className="btn green">
          HOME
        </button>
      </div>
    </div>
  )
}
