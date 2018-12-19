// Brunch automatically concatenates all files in your
// watched paths. Those paths can be configured at
// config.paths.watched in "brunch-config.js".
//
// However, those files will only be executed if
// explicitly imported. The only exception are files
// in vendor, which are never wrapped in imports and
// therefore are always executed.

// Import dependencies
//
// If you no longer want to use a dependency, remember
// to also remove its path from "config.paths.watched".
import 'phoenix_html'
import {Socket, Presence} from 'phoenix'

// init

// signup
let userName = document.getElementById('user-input')
userName.addEventListener('keypress', e => {
    // keyCode 13 is enter
  if (e.keyCode == 13 && userName.value != '') {
    let currentUrl = window.location.origin
    window.location.replace(currentUrl + '/?user=' + userName.value)
  }
})

// Socket
let user = userName.value
let socket = new Socket('/socket', {params: {user:user}})
console.log("user:", user)
socket.connect()

// Presence
let presences = {}

let formatTimestamp = timestamp => {
    let date = new Date(timestamp)
    return date.toLocaleTimeString()
}
let listBy = (user, {metas: metas}) => {
    return {
        user: user,
        onlineAt: formatTimestamp(metas[0].online_at)
    }
}

let userList = document.getElementById('user-list')
let render = presences => {
    userList.innerHTML = Presence.list(presences, listBy)
        .map(presence => `
            <li>
                ${presence.user}
                <br>
                <small>on since ${presence.onlineAt}</small>
            <li>
        `)
        .join('')
}

// Channels
let room = socket.channel('room:lobby')
room.on('presence_state', state => {
    presences = Presence.syncState(presences, state)
    render(presences)
})

room.on('presence_diff', diff => {
    presences = Presence.syncDiff(presences, diff)
    render(presences)
})

room.join() // join the room

// Chat
let msg = document.getElementById('message-input')
msg.addEventListener('keypress', e => {
    // keyCode 13 is enter
    if (e.keyCode == 13 && msg.value != '') {
      room.push('message:new', {
        name: user,
        message: msg.value
      })
        msg.value = ''
    }
})

let messageList = document.getElementById('msg-list')
let messageBox = document.getElementById('chat-messages')
let renderMessage = msg => {
    let messageElement = document.createElement('li')
    let name = msg.name || 'guest';
    messageElement.innerHTML = `
      <b>${name}</b>
      <i>${formatTimestamp(msg.timestamp)}</i>
      <p>${msg.message}</p>
    ` 
    messageList.appendChild(messageElement)
    messageBox.scrollTop = messageBox.scrollHeight
}

room.on('message:new', msg => {
    console.log(msg)
    renderMessage(msg)
})
