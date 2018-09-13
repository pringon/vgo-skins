"use strict";
const jackpotStore = require("../../libs/jackpot_stakes_store"),
      randomColor  = require("randomcolor");

let mockImg = "https://files.opskins.media/file/vgo-img/item/dual-berettas-trigger-happy-battle-scarred-300.png";
let mockName = "MAG-7 Gold Digger (Factory New)";

module.exports = {

    items: {
        1: { name: mockName, suggested_price: 7.13, image: { "300px": mockImg } },
        2: { name: mockName, suggested_price: 3.12, image: { "300px": mockImg } },
        3: { name: mockName, suggested_price: 1.27, image: { "300px": mockImg } },
        4: { name: mockName, suggested_price: 2.32, image: { "300px": mockImg } },
        5: { name: mockName, suggested_price: 15.73, image: { "300px": mockImg } },
        6: { name: mockName, suggested_price: 7.14, image: { "300px": mockImg } },
        7: { name: mockName, suggested_price: 9.23, image: { "300px": mockImg } },
        8: { name: mockName, suggested_price: 3.14, image: { "300px": mockImg } }
    },


    seedStakes: function() {

        let stakesData = [{ id: 1, user: "Matt", avatar: "/img/player-photo.jpg", stake: 10, color: randomColor()}, { id: 2, user: "Steve", avatar: "/img/player-photo.jpg", stake: 20, color: randomColor()},
        { id: 5, user: "Igor", avatar: "/img/player-photo.jpg", stake: 60, color: randomColor()}, { id: 4, user: "Dan", avatar: "/img/player-photo.jpg", stake: 40, color: randomColor()}, 
        { id: 3, user: "Bill", avatar: "/img/player-photo.jpg", stake: 30, color: randomColor()}];

        stakesData.forEach((stake, index) => {
            jackpotStore.setStake(stake, [{ id: 3*index+1, name: mockName, suggested_price: 7.13, image: { "300px": mockImg}}, 
            { id: 3*index+2, name: mockName, suggested_price: 3.12, image: { "300px": mockImg}}, { id: 3*index+3, name: mockName, suggested_price: 1.27, image: { "300px": mockImg}}]);
        });
    },

    getTotal: function(stakes, cb) {

        let total = 0;
        for(let stake of stakes) {
            total += parseFloat(stake.total);
        }
        cb(total);
    },

    getWinnerPos: function(stakes, winnerId, cb) {
        this.getTotal(stakes, total => {

            let winnerSum = 0;
            for(let stake of stakes) {
                if(stake.id == winnerId) {
                    winnerSum += parseFloat(stake.total)/2;
                    cb(Math.round((winnerSum*360)/total));
                    return;
                } else {
                    winnerSum += parseFloat(stake.total);
                }
            }
            cb(0);
        });
    },

    getWinner: function(tier, stakes,  cb) {

        this.getTotal(stakes, total => {
            jackpotStore.getRoundToken(tier, (err, token) => {
                let winner = token * total;

                for(let stake of stakes) {
                    if(winner <= parseFloat(stake.total)) {
                        cb(stake);
                        return;
                    }
                    winner -= parseFloat(stake.total);
                }
            })
        });
    },

    refreshStakes: function(tier) {

        jackpotStore.getAllStakes(tier, stakes => {
            console.log(stakes);
            this.io.to(`roulette tier ${tier}`).emit("get roulette stakes", stakes);
        });
    },

    startRound: function(tier) {

        jackpotStore.wipeStakes(tier, (err) => {
            if(err) {
                throw new Error(err);
            }

            jackpotStore.setRoundToken(tier);
            this.refreshStakes(tier);
        });
    },

    initRoulette: function(io) {
        this.io = io;
    },

    initSocket: function(socket, timeElapsed) {

        socket.on("play roulette", (tier) => {
    
            if(tier > 2) {
                socket.emit("invalid tier option", true);
                socket.disconnect();
            } else {
                socket.emit("time elapsed", timeElapsed[tier]);
                socket.join(`roulette tier ${tier}`);
                jackpotStore.getAllStakes(tier, stakes => {
                
                    socket.emit("get roulette stakes", stakes);
                });
                console.log(`${socket.userName} is playing roulette tier ${tier}`);
            }
        });
    }
};