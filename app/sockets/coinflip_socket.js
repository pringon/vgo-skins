"use strict";
const coinflipStore = require("../../libs/coinflip_lobbies_store");

module.exports = {
    
    initCoinflip: function(io) {
        this.io = io;
    },

    initSocket: function(socket) {

        socket.on("play coinflip", () => {
            socket.join("coinflip play");
            coinflipStore.getLobbies((err, lobbies) => {
                socket.emit("get coinflip lobbies", lobbies);
            });
        });
    },

    emitCoinflipWinner: function(lobby, winnerId) {
        this.io.to("coinflip play").emit("get coinflip winner", {
            winner: winnerId,
            ...lobby
        });
    },

    refreshCoinflipLobbiesList: function() {
        coinflipStore.getLobbies((err, coinflipLobbies) => {
            this.io.to("coinflip play").emit("get coinflip lobbies", coinflipLobbies);
        });
    },

    refreshCoinflipLobbiesCountdown: function(lobbyCounts) {
        this.io.to("coinflip play").emit("get coinflip lobby timers", lobbyCounts);
    }
};