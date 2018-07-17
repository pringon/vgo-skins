"use strict";
const chronJobs = require("./chron_jobs");

let headonPosts = [{ id: 1, user: "Matt", stake: 30, upper: true, lower: true }, { id: 2, user: "Bill", stake: 20, upper: true, lower: true},
                { id: 3, user: "Matt", stake: 40, upper: true, lower: false }, { id: 4, user: "Dan", stake: 100, upper: false, lower: true},
                { id: 5, user: "Igor", stake: 90, upper: false, lower: false}];

const rouletteSocket = require("./sockets/roulette_socket");

module.exports = (io) => {
    
    setInterval(chronJobs.jackPotTimer(io), 1000);
    setInterval(chronJobs.updateUsers(io), 10000);

    io.on("connection", (socket) => {

        chronJobs.connectedUsers++;

        socket.on("user data", (userData) => {

            console.log(`User ${userData.userName} has connected.`);
            socket.userId = userData.userId;
            socket.userName = userData.userName;
            socket.avatar = userData.avatar;
            socket.emit("timer update", chronJobs.timeRemaining);
        });

        require("./sockets/chat_socket")(io, socket);
        rouletteSocket.initSocket(io, socket);

        socket.on("play headon", () => {

            socket.emit("get headon posts", headonPosts);
            console.log(`${socket.userName} is playing headon`);
        });

        socket.on("disconnect", () => {
            chronJobs.connectedUsers--;
        });
    });
};