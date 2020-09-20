const users = []

//addUser, removeUser, getUser, getUsersinRoom

const addUser =({id,username,room})=>{
    //Clean Data
    username = username.trim()
    room = room.trim()

    //validate Data
    if(!username || !room){
        return {
            error: 'Username and Room are required!'
        }
    }

    //check for existing username
    const existingUser = users.find((user)=>{
        return user.username.toLowerCase() === username.toLowerCase() && user.room === room
    })

    if(existingUser){
        return {
            error : 'Username is taken!'
        }
    }

    //Store user
    const user = {id,username,room}
    users.push(user)
    return {user}

}

const removeUser =(id)=>{
    const index = users.findIndex((user)=> user.id === id)

    if(index !== -1){
        return users.splice(index,1)[0]
    }
}

const getUser = (id)=>{
    return users.find((user)=> user.id ===id)
}

const getUsersinRoom =(room)=>{
    return users.filter((user)=> user.room ===room)
}

module.exports ={
    addUser,
    removeUser,
    getUser,
    getUsersinRoom
}