"use strict";
const coinflipStore = require("../../libs/coinflip_lobbies_store");

module.exports = {
    
    initCoinflip: function(io) {
        this.io = io;
    },

    refreshCoinflipLobbiesList: function() {
        coinflipStore.getLobbies((err, coinflipLobbies) => {
            console.log(coinflipLobbies);
            this.io.sockets.emit("get coinflip lobbies", coinflipLobbies);
        })
    }
};