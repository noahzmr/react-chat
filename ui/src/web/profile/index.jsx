import React from 'react'

import WebEditProfile from './edit/index'
import WebPeopleList from '../people_list'

export default function WebProfile() {
  return (
    <div className="container clearfix">
      <WebPeopleList />
      <div className="chat" id="chat-body">
        <WebEditProfile />
      </div>
    </div>
  )
}
