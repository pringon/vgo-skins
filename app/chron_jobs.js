"use strict";
const randomColor = require("randomcolor");
const rouletteSocket = require("./sockets/roulette_socket");
const jackpotStore = require("../libs/jackpot_stakes_store");

module.exports = {

    timeRemaining: 90,
    connectedUsers: 0,

    jackPotTimer: function(io) {

        return () => {
            this.timeRemaining--;
            if(this.timeRemaining == 0) {
                this.timeRemaining = 100;

                jackpotStore.getAllStakes(stakes => {
                    
                    rouletteSocket.getWinner(stakes, winner => {

                        rouletteSocket.getWinnerPos(stakes, winner.id, winnerPos => {
    
                            io.sockets.emit("round finished", { winner, winnerPos });

                            setTimeout(function() {
                                jackpotStore.wipeStakes();
                                setTimeout(rouletteSocket.seedStakes, 1000);
                                setTimeout(function() {
                                    rouletteSocket.refreshStakes(io);
                                }, 2000);
                            }, 7000);
                        });
                    });
                });
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