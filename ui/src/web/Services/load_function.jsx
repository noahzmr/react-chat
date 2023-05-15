import React, { useState } from 'react'
import PropTypes from 'prop-types'

const initalStateLoadUser = []
const initalStateLoadChatRooms = []

export const LoadUserContext = React.createContext()
export const LoadChatRoomsContext = React.createContext()

export const LoadUserState = ({ children }) => {
  const [users, setUsers] = useState(initalStateLoadUser)
  return <LoadUserContext.Provider value={[users, setUsers]}>{children}</LoadUserContext.Provider>
}
export const LoadChatRoomState = ({ children }) => {
  const [chatRooms, setChatRooms] = useState(initalStateLoadChatRooms)
  return (
    <LoadChatRoomsContext.Provider value={[chatRooms, setChatRooms]}>
      {children}
    </LoadChatRoomsContext.Provider>
  )
}

LoadChatRoomState.propTypes = {
  children: PropTypes.any.isRequired
}
LoadUserState.propTypes = {
  children: PropTypes.any.isRequired
}
