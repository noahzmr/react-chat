import React, { useState } from 'react'
import PropTypes from 'prop-types'

const initalStateSocketToken = null
const initStateAccept = null
const initShowMsgContainer = 'none'
const initShowShareContainer = false

export const SocketContext = React.createContext()
export const AcceptContext = React.createContext()
export const ShowMsgContainerContext = React.createContext()
export const ShowShareContainerContext = React.createContext()

export const SocketTokenState = ({ children }) => {
  const [socketToken, setSocketToken] = useState(initalStateSocketToken)
  return (
    <SocketContext.Provider value={[socketToken, setSocketToken]}>
      {children}
    </SocketContext.Provider>
  )
}

export const AcceptState = ({ children }) => {
  const [acceptCall, setAcceptCall] = useState(initStateAccept)
  return (
    <AcceptContext.Provider value={[acceptCall, setAcceptCall]}>{children}</AcceptContext.Provider>
  )
}

export const ShowMsgContainerState = ({ children }) => {
  const [showMsgContainer, setShowMsgContainer] = useState(initShowMsgContainer)
  return (
    <ShowMsgContainerContext.Provider value={[showMsgContainer, setShowMsgContainer]}>
      {children}
    </ShowMsgContainerContext.Provider>
  )
}
export const ShowShareContainerState = ({ children }) => {
  const [screenShare, setScreenShare] = useState(initShowShareContainer)
  return (
    <ShowShareContainerContext.Provider value={[screenShare, setScreenShare]}>
      {children}
    </ShowShareContainerContext.Provider>
  )
}

SocketTokenState.propTypes = {
  children: PropTypes.any.isRequired
}

AcceptState.propTypes = {
  children: PropTypes.any.isRequired
}

ShowMsgContainerState.propTypes = {
  children: PropTypes.any.isRequired
}
ShowShareContainerState.propTypes = {
  children: PropTypes.any.isRequired
}
