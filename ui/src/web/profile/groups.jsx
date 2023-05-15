import React, { useContext, useState, useMemo } from 'react'
import { CreateGroupContext, UserListContext } from '../Services/css_values'
import { LoadChatRoomsContext } from '../Services/load_function'
import { useParams } from 'react-router-dom'

export default function WebGroupsProfile() {
  const params = useParams()
  /* eslint-disable no-unused-vars */
  const [chatRooms, setChatRooms] = useContext(LoadChatRoomsContext)
  const [showCreateGroup, setShowCreateGroups] = useContext(CreateGroupContext)
  const [showPeopleList, setShowPeopleList] = useContext(UserListContext)
  /* eslint-enable no-unused-vars */
  const [query, setQuery] = useState('')

  const filtedGroupChat = useMemo(() => {
    return chatRooms?.filter((item) => {
      return item.name?.toLowerCase().includes(query?.toLowerCase())
    })
  }, [chatRooms, query])

  // Show Create Group Functions
  const displayPeopleList = () => {
    setShowCreateGroups('none')
    setShowPeopleList('block')
    setShowCreateGroups('none')
  }
  const displayCreateGroup = () => {
    setShowCreateGroups('block')
    setShowPeopleList('none')
    setShowCreateGroups('none')
  }

  if (chatRooms?.length === 0) {
    return (
      <div style={{ color: 'black' }}>
        <h1>Its looks like u have no Direkt Messages</h1>
        <h3>But dont worry just create a new one</h3>
        <button
          onClick={() => {
            showCreateGroup === 'none' ? displayCreateGroup() : displayPeopleList()
          }}>
          <i className="bi bi-plus-square"></i>
        </button>
      </div>
    )
  } else {
    return (
      <div>
        <div className="chatHeader" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr' }}>
          <div className="search-container">
            <div className="box">
              <form name="search">
                <input
                  type="serach"
                  className="input"
                  name="txt"
                  placeholder="Search Group..."
                  onChange={(e) => {
                    setQuery(e.target.value)
                  }}
                />
              </form>
              <i className="bi bi-search"></i>
            </div>
          </div>
          <button
            onClick={() => {
              showCreateGroup === 'none' ? displayCreateGroup() : displayPeopleList()
            }}>
            <i className="bi bi-plus-square"></i>
          </button>
        </div>
        <ul className="list userRoomsProfile">
          {filtedGroupChat?.map((item, index) => {
            return (
              <li
                key={index}
                className={item.id === params?.id ? 'clearfix primary' : 'clearfix'}
                style={{ display: 'flex', justifyContent: 'space-around' }}>
                <img
                  src="https://freeiconshop.com/wp-content/uploads/edd/many-people-outline.png"
                  alt="avatar"
                />
                <div className="about">
                  <div className="name">{item.name}</div>
                </div>
                <div>
                  {item.wasRead !== '0' ? (
                    <div className="unreadMessanges">
                      <div className="number">{item.wasRead}</div>
                    </div>
                  ) : (
                    <div></div>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    )
  }
}
