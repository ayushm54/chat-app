const socket = io()

socket.on('rooms', (rooms) => {
    console.log(rooms)
    if (rooms.length <= 0) {
        document.querySelector('#room').setAttribute('required', 'true')
        document.querySelector('#active-rooms-div').style.display = "none"
        return
    }
    document.querySelector('#room').removeAttribute('required')
    document.querySelector('#active-rooms-div').style.display = "block"
    const html = Mustache.render(document.querySelector('#rooms-template').innerHTML, {
        rooms
    })
    document.querySelector('#active-rooms').innerHTML = html;
})

document.querySelector('#chatForm').addEventListener('submit', (e) => {
    e.preventDefault()
    const roomInput = document.getElementById('room').value || document.getElementById('activeRoomSelected').value
    if (roomInput.trim() === '' || roomInput.trim() === '#') {
        document.getElementById('error').style.display = 'block'
        return
    }
    document.getElementById('error').style.display = 'none'
    const username = document.getElementById('username').value
    loc = `/chat.html?username=${username}&room=${roomInput}`
    location.href = loc
})