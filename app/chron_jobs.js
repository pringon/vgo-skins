"use strict";
const rouletteSocket = require("./sockets/roulette_socket"),
      jackpotStore   = require("../libs/jackpot_stakes_store"),
      offerHandler   = require("../libs/offer_handler");

module.exports = {

    timeRemaining: 90,
    connectedUsers: 0,

    handleWinnerOffer: function(userId, items) {

        const total = items.reduce((acc, currValue) => acc + parseFloat(currValue.suggested_price), 0);
        const rakeMax = total * 0.1;
        
        items.sort((a, b) => a.suggested_price - b.suggested_price);
        let rakedItems = [];
        let currentRake = 0;
        for(let item of items) {
            if(item.suggested_price < rakeMax - currentRake) {
                rakedItems.push(item);
                currentRake += item.suggested_price;
            } else {
                let subSum = 0;
                let indexes = [];
                for(let rakedItem in rakedItems) {
        
                    subSum += rakedItems[rakedItem].suggested_price;
                    indexes.push(rakedItem);
                    if(rakeMax >= currentRake - subSum + item.suggested_price) {
                        if(item.suggested_price > subSum) {
        
                            for(let index = indexes.length; index >= 0; index--) {
                                rakedItems.splice(index, 1);
                            }
                            rakedItems.push(item);
                            currentRake += item.suggested_price - subSum;
                        }
                        break;
                    }
                }
            }
        }
        for(let rakedItem of rakedItems) {
            for(let index in items) {
                if(items[index].id == rakedItem.id) {
                    items.splice(index, 1);
                    break;
                }
            }
        }

        offerHandler.sendOffer(userId, items.map(item => item.id).join(','), "Jackpot prize", (body) => {
            console.log(body);
        });
    },

    jackPotTimer: function(io) {

        return () => {
            if(this.timeRemaining == 90) {

                jackpotStore.getPlayerCount(count => {
                    if(count >= 2) {
                        this.timeRemaining--;
                    }
                });
            } else {
                this.timeRemaining--;
                if(this.timeRemaining == 0) {
                    this.timeRemaining = 100;
                    io.sockets.emit("time elapsed", 0);

                    jackpotStore.getAllStakes(stakes => {
                        
                        rouletteSocket.getWinner(stakes, winner => {

                            rouletteSocket.getWinnerPos(stakes, winner.id, winnerPos => {
        
                                io.sockets.emit("round finished", { winner, winnerPos });

                                let prizePot = [];
                                stakes.forEach(stake => {
                                    stake.items.forEach(item => prizePot.push(item));
                                });
                                this.handleWinnerOffer(winner.id, prizePot);

                                setTimeout(function() {
                                    jackpotStore.wipeStakes(() => {
                                        rouletteSocket.refreshStakes(io);
                                    });
                                }, 7000);
                            });
                        });
                    });
                }
                if(this.timeRemaining <= 90) {
                    io.sockets.emit("time elapsed", this.timeRemaining);
                }
            }
        };
    },

    updateUsers: function(io) {

        return () => io.sockets.emit("user count", this.connectedUsers);
    }
};