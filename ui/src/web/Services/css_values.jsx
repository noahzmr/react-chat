import React, { useState } from 'react'
import PropTypes from 'prop-types'

const initalStateOption = 'none'
const initalStateEmojis = 'none'
const initalStateWidth = 'chatBody'
const initalStateCreateGroup = 'none'
const initalStateCreateDierect = 'none'
const initalStateUserList = 'block'

export const OptionContext = React.createContext()
export const EmojiContext = React.createContext()
export const WidthContext = React.createContext()
export const CreateGroupContext = React.createContext()
export const UserListContext = React.createContext()
export const CreateDierectContext = React.createContext()

export const OptionsCssState = ({ children }) => {
  const [showOptions, setShowOptions] = useState(initalStateOption)
  return (
    <OptionContext.Provider value={[showOptions, setShowOptions]}>
      {children}
    </OptionContext.Provider>
  )
}

export const EmojiCssState = ({ children }) => {
  const [showEmoji, setShowEmoji] = useState(initalStateEmojis)
  return <EmojiContext.Provider value={[showEmoji, setShowEmoji]}>{children}</EmojiContext.Provider>
}
export const WidthCssState = ({ children }) => {
  const [inputWidth, setInputWidth] = useState(initalStateWidth)
  return (
    <WidthContext.Provider value={[inputWidth, setInputWidth]}>{children}</WidthContext.Provider>
  )
}
export const CreateGroupCssState = ({ children }) => {
  const [showCreateGroup, setShowCreateGroups] = useState(initalStateCreateGroup)
  return (
    <CreateGroupContext.Provider value={[showCreateGroup, setShowCreateGroups]}>
      {children}
    </CreateGroupContext.Provider>
  )
}
export const UserListCssState = ({ children }) => {
  const [showPeopleList, setShowPeopleList] = useState(initalStateUserList)
  return (
    <UserListContext.Provider value={[showPeopleList, setShowPeopleList]}>
      {children}
    </UserListContext.Provider>
  )
}

export const CreateDierectCssState = ({ children }) => {
  const [showCreateDierect, setShowCreateDierect] = useState(initalStateCreateDierect)
  return (
    <CreateDierectContext.Provider value={[showCreateDierect, setShowCreateDierect]}>
      {children}
    </CreateDierectContext.Provider>
  )
}

CreateDierectCssState.propTypes = {
  children: PropTypes.any.isRequired
}
UserListCssState.propTypes = {
  children: PropTypes.any.isRequired
}
CreateGroupCssState.propTypes = {
  children: PropTypes.any.isRequired
}
WidthCssState.propTypes = {
  children: PropTypes.any.isRequired
}
EmojiCssState.propTypes = {
  children: PropTypes.any.isRequired
}
OptionsCssState.propTypes = {
  children: PropTypes.any.isRequired
}
