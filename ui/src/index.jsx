import React from 'react'
import ReactDOM from 'react-dom/client'
import './style/index.css'
import App from './App'
import reportWebVitals from './reportWebVitals'
import { BrowserRouter as Router } from 'react-router-dom'
import {
  CountState,
  SocketState,
  SearchUserState,
  BackendState,
  SortState
} from './web/Services/default_values'
import {
  OptionsCssState,
  EmojiCssState,
  WidthCssState,
  CreateGroupCssState,
  UserListCssState,
  CreateDierectCssState
} from './web/Services/css_values'
import { LoadUserState, LoadChatRoomState } from './web/Services/load_function'
import {
  SocketTokenState,
  AcceptState,
  ShowMsgContainerState,
  ShowShareContainerState
} from './web/Services/context'
import * as Sentry from '@sentry/react'
import { BrowserTracing } from '@sentry/tracing'
import config from './config.json'

Sentry.init({
  dsn: config.SENTRY_DSN,
  integrations: [new BrowserTracing()],
  tracesSampleRate: 1.0
})

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <SocketTokenState>
      <AcceptState>
        <ShowMsgContainerState>
          <ShowShareContainerState>
            <CountState>
              <SocketState>
                <SearchUserState>
                  <OptionsCssState>
                    <EmojiCssState>
                      <WidthCssState>
                        <CreateGroupCssState>
                          <LoadUserState>
                            <LoadChatRoomState>
                              <UserListCssState>
                                <CreateDierectCssState>
                                  <BackendState>
                                    <SortState>
                                      <Router>
                                        <App />
                                      </Router>
                                    </SortState>
                                  </BackendState>
                                </CreateDierectCssState>
                              </UserListCssState>
                            </LoadChatRoomState>
                          </LoadUserState>
                        </CreateGroupCssState>
                      </WidthCssState>
                    </EmojiCssState>
                  </OptionsCssState>
                </SearchUserState>
              </SocketState>
            </CountState>
          </ShowShareContainerState>
        </ShowMsgContainerState>
      </AcceptState>
    </SocketTokenState>
  </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
