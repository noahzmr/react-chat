import React, { useState } from 'react'
import PropTypes from 'prop-types'

const initalStateCount = 0
const initalStateSearchUser = ''
const initalStateSocket = undefined
export const backendInit = 'https://demo.noerkelit.online:3000/'
const sortInit = 'byRead'

export const SocketContext = React.createContext()
export const CountContext = React.createContext()
export const SearchUserContext = React.createContext()
export const BackendContext = React.createContext()
export const SortContext = React.createContext()

export const CountState = ({ children }) => {
  const [count, setCount] = useState(initalStateCount)
  return <CountContext.Provider value={[count, setCount]}>{children}</CountContext.Provider>
}
export const SearchUserState = ({ children }) => {
  const [query, setQuery] = useState(initalStateSearchUser)
  return (
    <SearchUserContext.Provider value={[query, setQuery]}>{children}</SearchUserContext.Provider>
  )
}
export const SocketState = ({ children }) => {
  const [socket, setSocket] = useState(initalStateSocket)
  return <SocketContext.Provider value={[socket, setSocket]}>{children}</SocketContext.Provider>
}
export const BackendState = ({ children }) => {
  const [backend, setBackend] = useState(backendInit)
  return <BackendContext.Provider value={[backend, setBackend]}>{children}</BackendContext.Provider>
}
export const SortState = ({ children }) => {
  const [sort, setSort] = useState(sortInit)
  return <SortContext.Provider value={[sort, setSort]}>{children}</SortContext.Provider>
}
SearchUserState.propTypes = {
  children: PropTypes.any.isRequired
}
CountState.propTypes = {
  children: PropTypes.any.isRequired
}
SocketState.propTypes = {
  children: PropTypes.any.isRequired
}
BackendState.propTypes = {
  children: PropTypes.any.isRequired
}
SortState.propTypes = {
  children: PropTypes.any.isRequired
}
