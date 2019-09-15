const generateMessage = (username, text) => {
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
}

generateLocationMessage = (username, location) => {
    return {
        username,
        url: `http://www.google.com/maps?q=${location.latitude},${location.longitude}`,
        createdAt: new Date().getTime()
    }
}
module.exports = {
    generateMessage,
    generateLocationMessage
}