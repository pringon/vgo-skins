"use strict";
const randomColor = require("randomcolor");
const rouletteSocket = require("./sockets/roulette_socket");

module.exports = {

    timeRemaining: 90,
    connectedUsers: 0,

    jackPotTimer: function(io) {

        return () => {
            this.timeRemaining--;
            if(this.timeRemaining == 0) {
                let winner = rouletteSocket.getWinner();
                io.sockets.emit("round finished", { winner, winnerPos: rouletteSocket.getWinnerPos(winner.id)});
                setTimeout(function() {
                    rouletteSocket.stakesData = [{ id: 1, user: "Matt", avatar: "/img/player-photo.jpg", stake: 10, color: randomColor()}, { id: 2, user: "Steve", avatar: "/img/player-photo.jpg", stake: 20, color: randomColor()},
                            { id: 3, user: "Bill", avatar: "/img/player-photo.jpg", stake: 30, color: randomColor()}, { id: 4, user: "Dan", avatar: "/img/player-photo.jpg", stake: 40, color: randomColor()}, 
                            { id: 5, user: "Igor", avatar: "/img/player-photo.jpg", stake: 60, color: randomColor()}];
                    io.sockets.emit("get roulette stakes", rouletteSocket.stakesData);
                }, 7000);
                this.timeRemaining = 100;
            }
            if(this.timeRemaining <= 90) {
                io.sockets.emit("time elapsed", this.timeRemaining);
            }
        };
    },

    updateUsers: function(io) {

        return () => io.sockets.emit("user count", this.connectedUsers);
    }
};