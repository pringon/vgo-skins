"use strict";
const userUtils         = require("../../libs/user_utils"),
      jackpotStakeStore = require("../../libs/jackpot_stakes_store"),
      offerHandler      = require("../../libs/offer_handler");

module.exports = (() => {

    this.getRoulette = async(req, res) => {
        let currentUser = await userUtils.getUser(req.user.steamId);
        res.render("pages/roulette.ejs", {
            currentUser: {
                level: req.user.level,
                ...currentUser
            },
            chat: true,
            roulette: true,
            rouletteType: req.params.rouletteType
        });
    };

    this.postRouletteStake = (req, res) => {

        jackpotStakeStore.getStake(req.user.steamId, stake => {

            let newStake = [];

            if(stake !== null) {

                let betItems = req.params.itemsGambled.split(',');
                for(let item of betItems) {
                    if(stake.itemIds.indexOf(item) == -1) {
                        newStake.push(item);
                    }
                }
                newStake = newStake.join(',');
            } else {
                newStake = req.params.itemsGambled;
            }

            offerHandler.sendOffer(req.user.steamId,
                newStake, "Jackpot stake", (body) => {
                    let responseData = JSON.parse(body).response;
                    if(typeof responseData !== 'undefined') {
                        if(responseData.status !== 400) {
                            
                            res.json({ tradeId: responseData.offer.id });
                        }
                    }
            });
        });
    };

    this.getHeadon = async(req, res) => {
        let currentUser = await userUtils.getUser(req.user.steamId);
        res.render("pages/headon.ejs", {
            currentUser: {
                level: req.user.level,
                ...currentUser
            },
            chat: true,
            headon: true
        });
    };

    return this;
})();