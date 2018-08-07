"use strict";
const db             = require("./database/models"),
      rouletteSocket = require("./sockets/roulette_socket"),
      jackpotStore   = require("../libs/jackpot_stakes_store"),
      offerHandler   = require("../libs/offer_handler");

module.exports = {

    timeRemaining: 90,
    connectedUsers: 0,

    getItemWearCode: function(wearValue) {

        if(wearValue == null) {
            return'';
        }
        if(wearValue < 0.07) {
            return "FN";
        }
        if(wearValue < 0.15) {
            return "MW";
        }
        if(wearValue < 0.37) {
            return "FT";
        }
        if(wearValue < 0.44) {
            return "WW";
        }
        return "BS";
    },

    handleWinnerOffer: function(userId, items, cb = null) {

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
            setTimeout(rouletteSocket.startRound.bind(rouletteSocket), 6500);
            if(cb) {
                cb(total);
            }
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
                if(this.timeRemaining <= 90) {
                    io.sockets.emit("time elapsed", this.timeRemaining);
                }
                if(this.timeRemaining == 0) {
                    this.timeRemaining = 100;

                    jackpotStore.getAllStakes(stakes => {
                        console.log(stakes);
                        rouletteSocket.getWinner(stakes, winner => {
                            console.log(winner);
                            rouletteSocket.getWinnerPos(stakes, winner.id, winnerPos => {
                                console.log(winnerPos);
                                io.sockets.emit("round finished", { winner, winnerPos });

                                let prizePot = [];
                                stakes.forEach(stake => {
                                    stake.items.forEach(item => prizePot.push(item));
                                });
                                this.handleWinnerOffer(winner.id, prizePot, total => {
                                    db.JackpotHistory.create({
                                        total,
                                        winner: winner.id,
                                        tier: 0,
                                        stakes: JSON.stringify(stakes.map(stake => {
                                            return {
                                                userId: stake.id,
                                                total: stake.total,
                                                items: stake.items.map(item => {
                                                    return {
                                                        wear: this.getItemWearCode(item.wear),
                                                        image: {
                                                            "300px": item.image["300px"]
                                                        },
                                                        name: item.name,
                                                        suggested_price: item.suggested_price
                                                    }
                                                })
                                            }
                                        }))
                                    });
                                });
                            });
                        });
                    });
                }
            }
        };
    },

    updateUsers: function(io) {

        return () => io.sockets.emit("user count", this.connectedUsers);
    }
};