const express = require('express')
const path = require('path')
const http = require('http')
const socketIo = require('socket.io')
const Filter = require('bad-words')

const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketIo(server)

const PORT = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

//let count = 0

//the on function takes an event and runs the callback when that event occurs
io.on('connection', (socket) => {
    //socket object contains information about the connection
    console.log('New Web Socket connection')

    //socket can be used to receive and send events and data to and from client
    //we are emitting an event which can be used by client
    //here we are passing data with event
    //socket.emit('countUpdated', count)

    //listening an event emited from client
    // socket.on('increment', () => {
    //     count++
    //     //socket handles only the current connected client
    //     //socket.emit('countUpdated', count)

    //     //this will emit the event oto all the clients
    //     io.emit('countUpdated', count)
    // })

    socket.on('join', ({ username, room }, callback) => {
        //each connection has a unique id associated to its socket
        const { error, user } = addUser({ id: socket.id, username, room })
        if (error) {
            return callback(error)
        }

        //join can only be used on server to join a room
        socket.join(user.room)
        socket.emit('message', generateMessage('System', 'Welcome!'))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        //broadcast will emit the event to all the other clients
        //except the one in the current socket
        //the to call allows to send event to specific room
        socket.broadcast.to(user.room).emit('message',
            generateMessage('System', `${user.username} has joined!`))

        callback()
    })

    //callback is a function used to send acknowledgement 
    //to the client emitng the event, we can pass data along with acknowledgement
    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()
        //if the message contains bad words
        if (filter.isProfane(message)) {
            return callback('Profanity is not alllowed!')
        }
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })

    //when a client leaves the chat or closes the browser
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('message', generateMessage('System', `${user.username} has left!.`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

    socket.on('sendLocation', (location, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage',
            generateLocationMessage(user.username, location))
        callback()
    })
})


server.listen(PORT, () => {
    console.log(`Server is up on port ${PORT}`)
})