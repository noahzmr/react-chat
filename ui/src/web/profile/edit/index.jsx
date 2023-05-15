import React from 'react'
import WebGroupsProfile from '../groups'
import WebPrivatesProfile from '../private'
import Informations from './informations'
export default function WebEditProfile() {
  return (
    <div className="profileBody">
      <div>
        <Informations />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        <WebGroupsProfile />
        <WebPrivatesProfile />
      </div>
    </div>
  )
}
