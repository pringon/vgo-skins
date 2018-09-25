"use strict";
const chronJobs = require("./chron_jobs"),
      rouletteSocket = require("./sockets/roulette_socket"),
      coinflipSocket = require("./sockets/coinflip_socket");

module.exports = (io) => {

    rouletteSocket.initRoulette(io);
    coinflipSocket.initCoinflip(io);
    
    rouletteSocket.startRound(0);
    rouletteSocket.startRound(1);
    rouletteSocket.startRound(2);
    setInterval(chronJobs.jackPotTimer(io), 1000);
    setInterval(chronJobs.coinflipLobbiesTimer(), 1000);
    setInterval(chronJobs.updateUsers(io), 10000);

    //rouletteSocket.seedStakes();

    io.on("connection", (socket) => {

        chronJobs.connectedUsers++;

        socket.on("user data", (userData) => {

            console.log(`User ${userData.userName} has connected.`);
            socket.userId = userData.userId;
            socket.userName = userData.userName;
            socket.avatar = userData.avatar;
            socket.level = userData.level;
        });

        require("./sockets/chat_socket")(io, socket);
        rouletteSocket.initSocket(socket, chronJobs.timeRemaining);
        coinflipSocket.initSocket(socket);

        socket.on("disconnect", () => {
            chronJobs.connectedUsers--;
        });
    });
};