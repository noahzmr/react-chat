import { useContext } from 'react'
import { io } from 'socket.io-client'
import { BackendContext } from './web/Services/default_values'

/* eslint-disable no-unused-vars */
const [backend, setBackend] = useContext(BackendContext)
/* eslint-enable no-unused-vars */

const URL = `http://${backend}:9001`
const socket = io(URL, { autoConnect: false })

socket.onAny((event, ...args) => {
  console.log(event, args)
})

export default socket
