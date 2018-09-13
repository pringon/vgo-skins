"use strict";
const db             = require("./database/models"),
      rouletteSocket = require("./sockets/roulette_socket"),
      jackpotStore   = require("../libs/jackpot_stakes_store"),
      offerHandler   = require("../libs/offer_handler");

module.exports = {

    timeRemaining: [90, 90, 90],
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

    handleJackpotWinnerOffer: function(userId, items, tier, cb = null) {

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
            setTimeout(() => rouletteSocket.startRound(tier), 6500);
            if(cb) {
                cb(total-currentRake, currentRake);
            }
        });
    },

    jackPotTimer: function(io) {

        return () => {
            for(let tier in this.timeRemaining) {

                if(this.timeRemaining[tier] == 90) {

                    jackpotStore.getPlayerCount(tier, count => {
                        if(count >= 2) {
                            this.timeRemaining[tier]--;
                        }
                    });
                } else {
                    this.timeRemaining[tier]--;
                    if(this.timeRemaining[tier] <= 90) {
                        io.to(`roulette tier ${tier}`).emit("time elapsed", this.timeRemaining[tier]);
                    }
                    if(this.timeRemaining[tier] == 0) {
                        this.timeRemaining[tier] = 100;
    
                        jackpotStore.getAllStakes(tier, stakes => {
                            console.log(stakes);
                            rouletteSocket.getWinner(tier, stakes, winner => {
                                console.log(winner);
                                rouletteSocket.getWinnerPos(stakes, winner.id, winnerPos => {
                                    console.log(winnerPos);
                                    io.to(`roulette tier ${tier}`).emit("round finished", { winner, winnerPos });
    
                                    let prizePot = [];
                                    stakes.forEach(stake => {
                                        stake.items.forEach(item => prizePot.push(item));
                                    });
                                    this.handleJackpotWinnerOffer(winner.id, prizePot, tier, (totalWon, totalRaked) => {
                                        db.JackpotHistory.create({
                                            total: totalWon,
                                            tier,
                                            winner: winner.id,
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
                                        }).then(() => {
                                            db.JackpotHistory.getHistory({ tier }, jackpotHistory => {
                                                io.to(`roulette tier ${tier}`).emit("update jackpot history", jackpotHistory);
                                            });
                                        });
                                        db.user.update({
                                            totalWon: db.Sequelize.literal(`totalWon + ${parseFloat(totalWon)/100}`),
                                            luckiestWin: (parseFloat(winner.total)/((totalWon+totalRaked)/100))*100
                                        }, {
                                            where: { steamId: winner.id }
                                        });
                                    });
                                });
                            });
                        });
                    }
                }
            }
        };
    },

    updateUsers: function(io) {

        return () => io.sockets.emit("user count", this.connectedUsers);
    }
};