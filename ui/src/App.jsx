import './style/main.css'
import React, { useEffect, useContext } from 'react'
import io from 'socket.io-client'
import 'bootstrap-icons/font/bootstrap-icons.css'
import axios from 'axios'
import { isMobile } from 'react-device-detect'
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom'
import { LoadUserContext } from './web/Services/load_function'
import Mobil from './mobile'
import SignUp from './auth'
import WebChat from './web/chat'
import WebProfile from './web/profile'
import ErrorPage from './web/pages/error'
import NotFoundError from './web/pages/404'
import { SocketContext, BackendContext } from './web/Services/default_values'
import Call from './web/call/index'
import ProtectedRoutes from './web/Services/privateroute'
import KeycloakAuth from './auth/keycloak'
import Update from './auth/update'
import Signup from './auth/signup'
import Delete from './auth/delet'
import Notifications from './web/notification'
import Validate from './auth/validate'

export default function App() {
  const location = useLocation()
  /* eslint-disable no-unused-vars */
  // Socket Connection
  const [backend, setBackend] = useContext(BackendContext)
  // All about Users
  const [users, setUsers] = useContext(LoadUserContext)
  const [socket, setSocket] = useContext(SocketContext)
  const userID = localStorage.getItem('user')
  const userName = localStorage.getItem('name')
  const socketToken = localStorage.getItem('socketToken')
  const credentials = {
    token: socketToken,
    userName,
    id: userID,
    socketId: socket?.id
  }
  /* eslint-enable no-unused-vars */

  // Load Functions
  const loadUsers = () => {
    axios
      .get(`${backend}users`)
      .then((res) => {
        setUsers(res.data)
      })
      .catch((err) => {
        if (err) {
          console.log(err.message)
        }
      })
  }

  // When user Change Load Chat Rooms and create Socket connection
  useEffect(() => {
    if (userID !== null && userName !== null && credentials.token !== null) {
      console.log(socket)
      if (
        !socket ||
        (socket?.connected === false && credentials.userName !== 'undefined') ||
        credentials.userName !== undefined
      ) {
        const ws = io.connect(`${backend}`, {
          query: credentials,
          onOpen: console.log('connection established'),
          auth: credentials.socketToken
        })
        setSocket(ws)

        axios
          .put(`${backend}users/status`, {
            status: 1,
            user: userID
          })
          .then((res) => {
            console.log('You are now oline!')
          })
          .catch((err) => {
            if (err) {
              console.log(err.message)
            }
          })
      }
      loadUsers()
    }
  }, [userID])

  // In Call ?
  useEffect(() => {
    if (userID !== null && userName !== null && credentials.token !== null) {
      if (location.pathname.includes('call')) {
        console.log(
          'URL Location changed! Now in a Call',
          location.pathname,
          location.pathname.includes('call')
        )
        axios
          .put(`${backend}chatRooms/setCall`, {
            call: 1,
            user: parseInt(userID),
            room: parseInt(location.pathname.split('/')[1])
          })
          .then((res) => {
            console.log('You are now oline!')
          })
          .catch((err) => {
            if (err) {
              console.log(err.message)
            }
          })
      } else {
        console.log('URL Location changed! Not in a Call', location.pathname)
        axios
          .put(`${backend}chatRooms/setCall`, {
            call: 0,
            user: parseInt(userID)
          })
          .then((res) => {
            console.log('You are now oline!')
          })
          .catch((err) => {
            if (err) {
              console.log(err.message)
            }
          })
      }
    }
  }, [location])

  if (isMobile) {
    return <Mobil />
  } else {
    return (
      <div>
        <Notifications />
        <Routes>
          <Route path="/login" element={<SignUp />}>
            <Route path="/login/update" element={<Update />} />
            <Route path="/login/signup" element={<Signup />} />
            <Route path="/login/:uuid" element={<Validate />} />
          </Route>
          <Route path="/keycloak" element={<KeycloakAuth />} />
          <Route
            path="/"
            element={
              <ProtectedRoutes>
                <WebChat socket={socket} />
              </ProtectedRoutes>
            }>
            <Route
              path="/:id"
              element={
                <ProtectedRoutes>
                  <WebChat socket={socket} />
                </ProtectedRoutes>
              }
            />
          </Route>
          <Route
            path="/:id/call"
            element={
              <ProtectedRoutes>
                <Call />
              </ProtectedRoutes>
            }
          />
          <Route
            path="/user"
            element={
              <ProtectedRoutes>
                <WebProfile socket={socket} />
              </ProtectedRoutes>
            }>
            <Route
              path="/user/delete"
              element={
                <ProtectedRoutes>
                  <Delete />
                </ProtectedRoutes>
              }
            />
          </Route>
          <Route
            path="/error"
            element={
              <ProtectedRoutes>
                <ErrorPage />
              </ProtectedRoutes>
            }
          />
          <Route
            path="*"
            element={
              <ProtectedRoutes>
                <NotFoundError />
              </ProtectedRoutes>
            }
          />
        </Routes>
      </div>
    )
  }
}
