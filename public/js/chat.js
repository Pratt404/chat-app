const socket = io()
const $messageform = document.querySelector('#messageForm')
const $messageformInput = $messageform.querySelector('input')
const $messageformButton = $messageform.querySelector('button')
const $messages = document.querySelector('#messages')

const $messageTemplate = document.querySelector('#message-template').innerHTML

const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const {username, room} = Qs.parse(location.search,{ignoreQueryPrefix:true})
// socket.on('countUpdated',(count)=>{
//     console.log('Count has been updated',count)
// })

// document.querySelector('#increment').addEventListener('mouseover',()=>{
//     console.log('I am Highlighted!!')
//     socket.emit('increment')
// })
autoscroll =()=>{
    //New message element
    const $newMessage = $messages.lastElementChild

    //Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    //Visible Height
    const visibleHeight = $messages.offsetHeight
    //Height of message container
    const containerHeight = $messages.scrollHeight
    //How far have I scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight-newMessageHeight <= scrollOffset+2){
        $messages.scrollTop = $messages.scrollHeight
    }

    
}
socket.on('message',(message)=>{
    // console.log(message)
    const html = Mustache.render($messageTemplate,{
        username:message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('HH:mm')
    })
    $messages.insertAdjacentHTML("beforeend",html)
    autoscroll()
})

$messageform.addEventListener('submit',(e)=>{
    e.preventDefault()
    $messageform.setAttribute('disabled','disabled')
    const message = e.target.elements.message.value

    socket.emit('sendMessage',message,(error)=>{
        $messageform.removeAttribute('disabled')
        $messageformInput.value = ''
        $messageformInput.focus()
        if(error){
            return console.log(error)
        }

        console.log('Message Delivered!')
    })
})

socket.on('fetchLocation',()=>{
    if(!navigator.geolocation){
        return alert('Browser Does not Support Geo Location')
    }
    navigator.geolocation.getCurrentPosition((position)=>{
        var request = new XMLHttpRequest();
        var method = 'GET'
        var url =
        'https://us1.locationiq.com/v1/reverse.php?key=5b3629ab6bb67e&lat='+ position.coords.latitude + '&lon=' + position.coords.longitude + '&format=json'
        var async = true
        request.open(method, url, async)
        request.onreadystatechange = function(){
            if(request.readyState == 4 && request.status == 200){
                var data = JSON.parse(request.responseText);
                var address = data.address;
                var city = address.city ||address.town
                address =city+" "+ address.country
                socket.emit('sendLocation',address,(message)=>{
                    console.log(message)
                })
                // alert(address.city.short_name);
            }
        }
        request.send();
        
    })
})

socket.on('roomData',({room,users})=>{
    const html = Mustache.render($sidebarTemplate,{
        room,
        users
    })
    const $sidebar = document.querySelector("#sidebar")
    $sidebar.innerHTML = html
})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})