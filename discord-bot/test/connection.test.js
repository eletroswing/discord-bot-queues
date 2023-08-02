const { io } = require('socket.io-client');

// dotenv
const dotenv = require('dotenv');
dotenv.config()
const { SOCKET_SERVER } = process.env;
const socket = new io(SOCKET_SERVER);

//listen to queue updates
socket.on('queue-update', async (data) => {
    console.log("QUEUE HAS BEEN UPDATED: ", data)
})

//listen to final response
socket.on('queue-response', async (data) => {
    console.log("QUEUE HAVE A RESPONSE: ", data)
    process.exit(1);
})

//join to queue
socket.emit('join', {
    prompt: "prompt de testes",
    messageId: 40,
    channelId: 50,
    guildId: 70,
}, (data) => {
    console.log(">> entered! your position is: ", data)
})
