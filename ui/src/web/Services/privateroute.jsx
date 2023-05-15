import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Navigate, useLocation } from 'react-router-dom'

export default function ProtectedRoutes({ children }) {
  ProtectedRoutes.propTypes = {
    children: PropTypes.any.isRequired
  }

  const location = useLocation()
  const keycloakRoute = location.pathname.includes('keycloak')
  const csrf = localStorage.getItem('csrf')
  const socket = localStorage.getItem('socketToken')
  const id = localStorage.getItem('user')
  const name = localStorage.getItem('name')
  const tmp = JSON.parse(localStorage.getItem('tmp'))
  console.log(id, name, csrf, socket)
  if (tmp) {
    return <Navigate to={tmp.url} replace />
  } else if (id !== null && name !== null && csrf !== null && socket !== null) {
    if (location.pathname.includes('login') || keycloakRoute) {
      return <Navigate to="/" replace />
    }
    return children
  } else {
    if (keycloakRoute) {
      console.warn('[Protected Route] Keycloak')
    } else {
      console.warn('[Protected Route] 401 Unauthorized ')
      return <Navigate to="/login" replace />
    }
  }
}
