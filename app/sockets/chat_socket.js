module.exports = (io, socket) => {

    socket.on("chat message", (message) => {

        if(message.length > 2) {
            console.log(`User with id ${socket.userId} has sent a message of: ${message}`);
            io.sockets.emit("chat message", {
                message,
                emittingUser: {
                    userName: socket.userName,
                    avatar: socket.avatar,
                    level: socket.level
                }
            });
        }
    });
};