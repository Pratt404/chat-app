const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage}  = require('./utils/messages') 
const {addUser,removeUser,getUser,getUsersinRoom} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const publicDir = path.join(__dirname,'../public')
app.use(express.static(publicDir))


const port = process.env.PORT
// let count =0
io.on('connection',(socket)=>{
    console.log("Connected to Web Socket")

    // socket.emit('countUpdated',count)

    // socket.on('increment',()=>{
    //     count++
    //     io.emit('countUpdated',count)
    // })
    socket.on('join',(options,next)=>{
        const {error, user}= addUser({id :socket.id , ...options})
        if(error){
            return next(error)
        }
        socket.join(user.room)
        socket.emit('message',generateMessage('Admin',"Welcome!!"))

        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUsersinRoom(user.room)
        })

        socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined!!`))
        socket.emit('fetchLocation')
        socket.on('sendLocation',(location,next)=>{
            socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`Logged in from ${location}`))
            next("Location Shared")
        })
        next()

    })
   

    socket.on('sendMessage',(message,next)=>{
        const user = getUser(socket.id)
        const filter = new Filter()
        if(filter.isProfane(message)){
            return next('Profanity is not allowed!')
        }
        io.to(user.room).emit('message',generateMessage(user.username,message))
        next()
    })

    socket.on('disconnect',()=>{
        
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left!!!`))
            io.to(user.room).emit('roomData',{
                room: user.room,
                users: getUsersinRoom(user.room)
            })
        }
        
    
    
})
})

server.listen(port,()=>{
    console.log('Server is up and running on Port', port)
})