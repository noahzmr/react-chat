import WebChat from './chat'
import WebPeopleList from './people_list'
import WebProfile from './profile'
import React from 'react'

export default function Web() {
  const finishedFetch = '0'
  if (finishedFetch === '100%') {
    return (
      <div>
        <div className="loader"></div>
      </div>
    )
  } else {
    return (
      <div className="container clearfix">
        {/*
      <-------- Side Bar begin ---------->
      */}
        <WebPeopleList />
        {/*
      <-------- Side Bar end ---------->
      */}
        {/*
      <-------- Chat Body begin ---------->
      */}
        <WebProfile />
        <WebChat />
        {/*
      <-------- Chat Body end ---------->
      */}
      </div>
    )
  }
}
