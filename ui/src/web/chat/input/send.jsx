import { React, useContext, useEffect, useState } from 'react'
import axios from 'axios'
import EmojiPicker from 'emoji-picker-react'
import moment from 'moment/moment'
import { EmojiContext } from '../../Services/css_values'
import { useParams } from 'react-router-dom'
import { SocketContext, BackendContext } from '../../Services/default_values'
import PropTypes from 'prop-types'

export default function WebSend(props) {
  WebSend.propTypes = {
    chatName: PropTypes.string.isRequired
  }
  const params = useParams()
  const chatId = Number(params?.id)
  const userID = localStorage.getItem('user')

  // Socket Connection
  /* eslint-disable no-unused-vars */
  const [backend, setBackend] = useContext(BackendContext)

  const [socket, setSocket] = useContext(SocketContext)

  // CSS Properies
  const [showEmoji, setShowEmoji] = useContext(EmojiContext)

  // All about the User
  const userName = localStorage.getItem('name')

  // All about Rooms
  /* eslint-enable no-unused-vars */

  // File
  const [postImage, setPostImage] = useState(null)
  const [newMsgId, setNewMsgId] = useState()

  const logoFile = document.createElement('i')
  logoFile.classList.add('bi')
  logoFile.classList.add('bi-file-earmark')

  const input = document.getElementById('input')
  const [inputHeight, setInputHeight] = useState('150px')
  const bold = '**'
  const italic = '*'
  const strike = '~~'
  const code = '```'
  const codeSingle = '`'
  const [isBold, setIsBold] = useState('var(--g)')
  const [isItalic, setIstalic] = useState('var(--g)')
  const [isStrike, setIsStrike] = useState('var(--g)')
  const [isCode, setIsCode] = useState('var(--g)')
  const [isCodeSingle, setIsCodeSingle] = useState('var(--g)')
  const [text, setText] = useState('')
  const [chatName, setChatName] = useState()

  // Create new Message function
  const createNewMessage = (message, user, room) => {
    const values = {
      message,
      user,
      room,
      sentAt: moment().format('MMMM Do YYYY, h:mm:ss a')
    }
    axios
      .post(`${backend}chatRooms/message`, values, {
        headers: { 'Content-Type': 'application/json;charset=utf-8' }
      })
      .then((res) => {
        console.log(newMsgId)
        console.log(res.data)
        setNewMsgId(res.data)
      })
      .catch((error) => {
        console.error('post failed', error.message)
      })
  }

  const submit = () => {
    if (socket.connected === true && socket && input.value && postImage === null) {
      console.log('chat message', {
        input: input.value,
        userId: userID,
        chatId,
        userName,
        chatName
      })
      socket.emit('chat message', input.value, userID, chatId, userName, chatName)
      createNewMessage(input.value, userID, chatId)
      input.value = ''
    }
  }

  // Calc Textarea heigth
  const calcHeight = (value) => {
    let numberOfLineBreaks = (value.match(/\n/g) || []).length
    // min-height + lines x line-height + padding + border
    let newHeight = 20 + numberOfLineBreaks * 20 + 12 + 2
    setInputHeight(newHeight + 50 + 'px')
    return newHeight
  }

  const insertAtCursor = (textarea, value, position) => {
    return new Promise((resolve, reject) => {
      if (!textarea) {
        console.error('Textarea is null or undefined.')
        reject('Textarea is null or undefined.')
        return
      }

      if (textarea.selectionStart === null) {
        textarea.selectionStart = 0
      }

      var startPos = textarea.selectionStart
      var endPos = textarea.selectionEnd

      textarea.value =
        textarea.value.substring(0, startPos) +
        value +
        textarea.value.substring(endPos, textarea.value.length)

      // Set cursor position after inserted text
      textarea.selectionStart = startPos + value.length
      textarea.selectionEnd = startPos + value.length

      // Move cursor back two positions
      textarea.selectionStart = Math.max(textarea.selectionStart - position, 0)
      textarea.selectionEnd = Math.max(textarea.selectionEnd - position, 0)

      // Ensure cursor is visible
      textarea.focus()
      resolve('finish')
    })
  }
  const isTextSelected = (textarea) => {
    var startPos = textarea.selectionStart
    var endPos = textarea.selectionEnd

    return startPos !== endPos
  }

  const surroundSelection = (textarea, prefix) => {
    var startPos = textarea.selectionStart
    var endPos = textarea.selectionEnd

    if (startPos === endPos) {
      return
    }

    var selectedText = textarea.value.substring(startPos, endPos)
    var newText = prefix + selectedText + prefix

    textarea.value =
      textarea.value.substring(0, startPos) +
      newText +
      textarea.value.substring(endPos, textarea.value.length)

    // Set cursor position after inserted text
    textarea.selectionStart = startPos + prefix.length
    textarea.selectionEnd = endPos + prefix.length

    // Ensure cursor is visible
    textarea.focus()
  }

  /* 
    CSS Button Start
    */
  const isCursorBetweenBold = (textarea) => {
    var text = textarea?.value
    var cursorPosition = textarea?.selectionStart
    var match
    const boldRegex = /(\*{2}(.*?)\*{2})/gm

    while ((match = boldRegex.exec(text)) !== null) {
      var start = match.index
      var end = boldRegex.lastIndex - 1

      if (cursorPosition >= start && cursorPosition <= end) {
        setIsBold('var(--w)')
        return true
      }
    }

    setIsBold('var(--g)')
    return false
  }
  const isCursorBetweenItalic = (textarea) => {
    var text = textarea?.value
    var cursorPosition = textarea?.selectionStart
    var match
    const italicRegex = /(\*{1}(.*?)\*{1})/gm

    while ((match = italicRegex.exec(text)) !== null) {
      var start = match.index
      var end = italicRegex.lastIndex - 1

      if (cursorPosition >= start && cursorPosition <= end) {
        setIstalic('var(--w)')
        return true
      }
    }

    setIstalic('var(--g)')
    return false
  }
  const isCursorBetweenStrike = (textarea) => {
    var text = textarea?.value
    var cursorPosition = textarea?.selectionStart
    var match
    const strikeRegex = /(\~{2}(.*?)\~{2})/gm

    while ((match = strikeRegex.exec(text)) !== null) {
      var start = match.index
      var end = strikeRegex.lastIndex - 1

      if (cursorPosition >= start && cursorPosition <= end) {
        setIsStrike('var(--w)')
        return true
      }
    }

    setIsStrike('var(--g)')
    return false
  }
  const isCursorBetweenCode = (textarea) => {
    var startPos = textarea.selectionStart
    var endPos = textarea.selectionEnd
    var value = textarea.value
    var textBeforeCursor = value.substring(0, startPos)
    var textAfterCursor = value.substring(endPos, value.length)
    var textBetweenCursors = value.substring(startPos, endPos)
    var textWithCursor = textBeforeCursor + '|' + textBetweenCursors + '|' + textAfterCursor
    const codeRegex = /`{3}.*\|.*`{3}/s

    codeRegex.test(textWithCursor) ? setIsCode('var(--w)') : setIsCode('var(--g)')
  }
  const isCursorBetweenSingle = (textarea) => {
    var text = textarea?.value
    var cursorPosition = textarea?.selectionStart
    var match
    const codeSingleRegex = /(\`{1}(.*?)\`{1})/gm

    while ((match = codeSingleRegex.exec(text)) !== null) {
      var start = match.index
      var end = codeSingleRegex.lastIndex - 1

      if (cursorPosition >= start && cursorPosition <= end) {
        setIsCodeSingle('var(--w)')
        return true
      }
    }

    setIsCodeSingle('var(--g)')
    return false
  }
  /* 
    CSS Button End
    */

  // Handle Emoji Button Click
  const onEmojiClick = (event, emojiObject) => {
    console.log('emojiObject', event, emojiObject)
    insertAtCursor(document?.getElementById('input'), event.emoji, 0)
      .then((value) => {
        setShowEmoji('none')
        console.log(value)
      })
      .catch((reason) => {
        console.error(reason)
      })
  }
  const addeffect = (type) => {
    if (type === bold) {
      setIsBold('var(--w')
    } else if (type === italic) {
      setIstalic('var(--w)')
    } else if (type === isStrike) {
      setIsStrike('var(--w)')
    } else if (type === code) {
      setIsCode('var(--w)')
    } else if (type === codeSingle) {
      setIsCodeSingle('var(--w)')
    }
    insertAtCursor(
      document?.getElementById('input'),
      type === bold || type === italic || type === strike || type === codeSingle
        ? type + type
        : type + '\n' + '\n' + type,
      type === code ? 4 : type.length
    )
      .then((value) => {
        console.log(value)
        console.log(value)
      })
      .catch((reason) => {
        console.error(reason)
      })
  }

  const createOutput = (string) => {
    submit()
    setIsBold('var(--g)')
    setIsCode('var(--g)')
    setIsStrike('var(--g)')
    setIstalic('var(--g)')
    setIsCodeSingle('var(--g)')
    setText(string)
    document.getElementById('input').style.height =
      calcHeight(document?.getElementById('input').value) + 'px'
    document.getElementById('input').value = ''
  }
  /*
    OUTPUT FUNCTIONS End
    */

  useEffect(() => {
    document.getElementById('input').addEventListener('keyup', () => {
      document.getElementById('input').style.height =
        calcHeight(document?.getElementById('input').value) + 'px'
      isCursorBetweenBold(document.getElementById('input'))
      isCursorBetweenItalic(document.getElementById('input'))
      isCursorBetweenStrike(document.getElementById('input'))
      isCursorBetweenCode(document.getElementById('input'))
      isCursorBetweenSingle(document.getElementById('input'))
    })
  }, [])
  useEffect(() => {
    console.log('[Chat](Send) Props: ', props)
    if (props?.chatName !== chatName) {
      setChatName(props?.chatName)
    }
  }, [props])
  // Send File
  const handleFileUpload = (e) => {
    if (e.target.files.length !== 1) {
      return
    }
    console.log(e.target.files[0].type)
    const formData = new FormData()
    formData.append('file', e.target.files[0])
    console.log('formData', e.target.files[0])
    const msg = e.target.files[0].name
    console.log(msg)
    setPostImage(formData)
    try {
      const values = {
        message: 'this_is_a_file',
        user: userID,
        room: chatId,
        sent_at: moment().format('MMMM Do YYYY, h:mm:ss a')
      }
      axios
        .post(`${backend}chatRooms/message`, values, {
          headers: { 'Content-Type': 'application/json;charset=utf-8' }
        })
        .then((res) => {
          console.log(res.data)
          const msgId = res.data
          axios
            .post(`${backend}chatRooms/image/${res.data}/${userID}`, formData, {
              headers: {
                'Content-Type': e.target.files[0].type
              }
            })
            .then((res) => {
              console.log('Buffer from the image:', res.data)
              console.log(postImage)
              setPostImage(null)
              socket.emit('chat message', `this_is_a_file+${msgId}`, userID, chatId, userName)
            })
            .catch((reason) => {
              console.error('post failed', reason)
            })
        })
        .catch((error) => {
          console.error('post failed', error.message)
        })
    } catch (err) {
      console.log(err)
    }
  }
  return (
    <div className="chat-message">
      <div id="sendInput" style={{ height: inputHeight }}>
        <div className="sendNew">
          <div className="emojiPicker" style={{ display: showEmoji }}>
            <EmojiPicker
              onEmojiClick={onEmojiClick}
              height={360}
              emojiStyle={'google'}
              theme={'dark'}
            />
          </div>
          <textarea
            autoComplete="off"
            onChange={() => {
              socket.emit('typing', userName, parseInt(chatId))
            }}
            id="input"
            placeholder="Message"
            className="textarea"></textarea>
          <div className="footer">
            <div>
              <i
                onClick={() => {
                  showEmoji === 'none' ? setShowEmoji('block') : setShowEmoji('none')
                }}
                className="bi bi-emoji-smile"></i>
              <i
                style={{ color: isBold }}
                onClick={() => {
                  isTextSelected(document?.getElementById('input')) === true
                    ? surroundSelection(document?.getElementById('input'), bold)
                    : addeffect(bold)
                }}
                className="bi bi-type-bold"></i>
              <i
                style={{ color: isItalic }}
                onClick={() => {
                  isTextSelected(document?.getElementById('input')) === true
                    ? surroundSelection(document?.getElementById('input'), italic)
                    : addeffect(italic)
                }}
                className="bi bi-type-italic"></i>
              <i
                style={{ color: isStrike }}
                onClick={() => {
                  isTextSelected(document?.getElementById('input')) === true
                    ? surroundSelection(document?.getElementById('input'), strike)
                    : addeffect(strike)
                }}
                className="bi bi-type-strikethrough"></i>
              <i
                style={{ color: isCodeSingle }}
                onClick={() => {
                  isTextSelected(document?.getElementById('input')) === true
                    ? surroundSelection(document?.getElementById('input'), codeSingle)
                    : addeffect(codeSingle)
                }}
                className="bi bi-code-slash"></i>
              <i
                style={{ color: isCode }}
                onClick={() => {
                  isTextSelected(document?.getElementById('input')) === true
                    ? surroundSelection(document?.getElementById('input'), code)
                    : addeffect(code)
                }}
                className="bi bi-code-square"></i>
              <i className="bi bi-file-earmark-arrow-up">
                <input
                  type="file"
                  onChange={(e) => {
                    handleFileUpload(e)
                    console.log(e.target.files[0])
                  }}
                  style={{ display: 'none' }}
                />
              </i>
            </div>
            <div>
              <i
                id="send_message_button"
                onClick={() => {
                  console.log(input.value)
                  createOutput(input.value)
                }}
                className="bi bi-send"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
