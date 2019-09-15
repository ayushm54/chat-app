//This is the function available in client side socket.io lib
//It is used to connect websocket
const socket = io()

//socket can be used to receive and send events and data to and from server
//here we are receiving an event from server
// socket.on('countUpdated', (count) => {
//     console.log('Count Updated ',count)
// })

// document.querySelector('#increment').addEventListener('click', () => {
//     socket.emit('increment')
// })

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageText = document.getElementById('messageText')
const $messageButton = $messageForm.querySelector('button') //referencing button inside form
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
//location.search returns the query string from url
//second arg is the options to parse the query string
//ignoreQueryPrefix helps us remove the question mark
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoScroll = () => {
    // New Message element
    const $newMessage = $messages.lastElementChild
    
    // Height of new message
    // getComputedStyle is a browser provided method
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseFloat(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    
    // Visible height
    const visibleHeight = $messages.offsetHeight
    
    // Total height of messages container
    const contentHeight = $messages.scrollHeight
    
    // How far have i scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight
    
    if (contentHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop =  $messages.scrollHeight
    }
}

socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('locationMessage', (location) => {
    const html = Mustache.render(locationTemplate, {
        username: location.username,
        location: location.url,
        createdAt: moment(location.createdAt).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    //disabling button
    $messageButton.setAttribute('disabled', 'disabled')

    //last argument is a function that runs when the event is acknowleged by the server
    //it is an optional argument
    socket.emit('sendMessage', $messageText.value, (errorMessage) => {
        //enabling button
        $messageButton.removeAttribute('disabled')
        $messageText.value = ''
        $messageText.focus()

        if (errorMessage) {
            return console.log(errorMessage)
        }
    })
})

$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser!')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        //console.log(position)
        const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }
        socket.emit('sendLocation', location, () => {
            $sendLocationButton.removeAttribute('disabled')
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})