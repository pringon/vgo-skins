"use strict";

module.exports = (io) => {

    io.on("connection", (socket) => {

        socket.on("user data", (userId) => {

            console.log(`User with id ${userId} has connected.`);
            socket.userId = userId;
        });

        socket.on("chat message", (message) => {

            console.log(`User with id ${socket.userId} has sent a message of: ${message}`);
            io.sockets.emit("chat message", {
                message,
                emittingUser: socket.userId
            });
        });
    });
};