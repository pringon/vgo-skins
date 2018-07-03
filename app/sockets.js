"use strict";
let stakesData = [{user: "Matt", stake: 10, color: "#ECD078"}, {user: "Steve", stake: 20, color: "#D95B43"},
              { user: "Bill", stake: 30, color: "#C02942"}, { user: "Dan", stake: 40, color: "#542437"}, 
              { user: "Igor", stake: 60, color: "#53777A"}];

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

        socket.on("play roulette", () => {

            socket.emit("get roulette stakes", stakesData);
        });
    });
};