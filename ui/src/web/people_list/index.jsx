import WebUserHeader from './header'
import WebCreateGroup from './new_group'
import React, { useContext } from 'react'
import { CreateGroupContext, CreateDierectContext } from '../Services/css_values'
import WebCreateDierect from './new_user'
import UserList from './userList'
export default function WebPeopleList() {
  /* eslint-disable no-unused-vars */
  const [showCreateGroup, setShowCreateGroups] = useContext(CreateGroupContext)
  const [showCreateDierect, setShowCreateDierect] = useContext(CreateDierectContext)
  /* eslint-enable no-unused-vars */
  return (
    <div className="people-list" id="people-list">
      <WebUserHeader />
      <br />
      {/*
    <-------- Show Rooms begin ---------->
    */}
      <div style={{ gridArea: 'peopleListBody', display: showCreateGroup }}>
        <WebCreateGroup />
      </div>
      <div style={{ gridArea: 'peopleListBody', display: showCreateDierect }}>
        <WebCreateDierect />
      </div>
      <UserList />
      {/*
    <-------- Show Rooms end ---------->
    */}
    </div>
  )
}
