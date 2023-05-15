import React from 'react'
import Logo from '../../style/img/logo-color.png'
import { useNavigate } from 'react-router-dom'

export default function NotFoundError() {
  const navigate = useNavigate()
  return (
    <div id="notFound">
      <div className="row">
        <h1>
          4<img src={Logo} alt="logo" />4
        </h1>
        <h2>UH OH! We are sorry but,</h2>
        <p>
          the page you are looking for does not exist. How you got here is a mystery. But you can
          click the button below to go back to the homepage.
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
