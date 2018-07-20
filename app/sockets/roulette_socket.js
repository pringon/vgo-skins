"use strict";
const jackpotStore = require("../../libs/jackpot_stakes_store");
const randomColor  = require("randomcolor");

let mockImg = "https://files.opskins.media/file/vgo-img/item/dual-berettas-trigger-happy-battle-scarred-300.png";
let mockName = "MAG-7 Gold Digger (Factory New)";

module.exports = {

    items: {
        1: { name: mockName, price: 7.13, image: { "--300px": mockImg } },
        2: { name: mockName, price: 3.12, image: { "--300px": mockImg } },
        3: { name: mockName, price: 1.27, image: { "--300px": mockImg } },
        4: { name: mockName, price: 2.32, image: { "--300px": mockImg } },
        5: { name: mockName, price: 15.73, image: { "--300px": mockImg } },
        6: { name: mockName, price: 7.14, image: { "--300px": mockImg } },
        7: { name: mockName, price: 9.23, image: { "--300px": mockImg } },
        8: { name: mockName, price: 3.14, image: { "--300px": mockImg } }
    },

    seedStakes: function() {

        let stakesData = [{ id: 1, user: "Matt", avatar: "/img/player-photo.jpg", stake: 10, color: randomColor()}, { id: 2, user: "Steve", avatar: "/img/player-photo.jpg", stake: 20, color: randomColor()},
                    { id: 5, user: "Igor", avatar: "/img/player-photo.jpg", stake: 60, color: randomColor()}, { id: 4, user: "Dan", avatar: "/img/player-photo.jpg", stake: 40, color: randomColor()}, 
                    { id: 3, user: "Bill", avatar: "/img/player-photo.jpg", stake: 30, color: randomColor()}];
        
        stakesData.forEach((stake, index) => {
            jackpotStore.setStake(stake, [{ id: 3*index+1, name: mockName, price: 7.13, image: { "--300px": mockImg}}, 
            { id: 3*index+2, name: mockName, price: 3.12, image: { "--300px": mockImg}}, { id: 3*index+3, name: mockName, price: 1.27, image: { "--300px": mockImg}}]);
        });
    },

    getTotal: function(stakes, cb) {

        let total = 0;
        for(let stake of stakes) {
            total += stake.total;
        }
        cb(total);
    },

    getWinnerPos: function(stakes, winnerId, cb) {
        this.getTotal(stakes, total => {

            let winnerSum = 0;
            for(let stake of stakes) {
                if(stake.id == winnerId) {
                    winnerSum += stake.total/2;
                    cb(Math.round((winnerSum*360)/total));
                    return;
                } else {
                    winnerSum += stake.total;
                }
            }
            cb(0);
        });
    },

    getWinner: function(stakes, cb) {

        this.getTotal(stakes, total => {
            let winner = Math.random() * total;

            for(let stake of stakes) {
                if(winner <= stake.total) {
                    cb(stake);
                    return;
                }
                winner -= stake.total;
            }
        });
    },

    refreshStakes: function(io) {

        jackpotStore.getAllStakes((stakes) => io.sockets.emit("get roulette stakes", stakes));
    },

    initSocket: function(io, socket) {

        this.seedStakes();

        socket.on("play roulette", () => {
    
            jackpotStore.getAllStakes(stakes => socket.emit("get roulette stakes", stakes));
            console.log(`${socket.userName} is playing roulette`);
        });

        socket.on("select items", () => {

            let availableItems = [];

            for(let item in this.items) {
                if(this.items.hasOwnProperty(item)) {
                    availableItems.push({ id: item, ...this.items[item]});
                }
            }

            socket.emit("select items", { availableItems, gambledItems: socket.itemsGambled ? socket.itemsGambled : [] });
        }); 
    
        socket.on("items gambled", itemsGambled => {
    
            socket.itemsGambled = itemsGambled;

            jackpotStore.getStake(socket.userId, (stake) => {
                if(stake == null) {
                    jackpotStore.setStake({ id: socket.userId, user: socket.userName, avatar: socket.avatar },
                                        itemsGambled, randomColor());
                } else {
                    jackpotStore.setStake({ id: socket.userId, user: socket.userName, avatar: socket.avatar },
                        itemsGambled, stake.color);
                }
                this.refreshStakes(io);
            })
    
        });
    }
};