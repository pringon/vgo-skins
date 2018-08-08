"use strict";
const db                = require("../database/models"),
      userUtils         = require("../../libs/user_utils"),
      jackpotStakeStore = require("../../libs/jackpot_stakes_store"),
      offerHandler      = require("../../libs/offer_handler");

module.exports = (() => {

    this.getRoulette = async(req, res) => {
        let rouletteTier = null;
        switch(req.params.rouletteType) {
            case "plant":
                rouletteTier = 0;
                break;
            case "coal":
                rouletteTier = 1;
                break;
            case "diamond":
                rouletteTier = 2;
                break;
            default:
                rouletteTier = null;
        }
        if(rouletteTier == null) {
            res.redirect("/games/roulette/plant");
        } else {
            let currentUser = await userUtils.getUser(req.user.steamId);
            db.JackpotHistory.getTierHistory(rouletteTier, jackpotHistory => {
                res.render("pages/roulette.ejs", {
                    rouletteTier,
                    jackpotHistory,
                    currentUser: {
                        level: req.user.level,
                        ...currentUser
                    },
                    chat: true,
                    roulette: true
                });
            });
        }
    };

    this.getRouletteStake = (req, res) => {

        userUtils.getAvailableItems(req.user.steamId, (err, availableItems) => {
            if(err) {
                console.log(err);
            }
            jackpotStakeStore.getStake(req.params.rouletteType, req.user.steamId, gambledItems => {
                console.log("intra");
                if(gambledItems == null) {
                    gambledItems = { items: [] };
                }
                res.json({ availableItems, gambledItems: gambledItems.items });
            });
        })
    };

    this.postRouletteStake = (req, res) => {

        console.log(req.params.rouletteType);
        jackpotStakeStore.getStake(req.params.rouletteType, req.user.steamId, stake => {

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

            console.log(`Deposit tier is ${req.params.rouletteType}`);
            offerHandler.sendOffer(req.user.steamId,
                newStake, `Jackpot stake ${this.getRouletteTier(req.params.rouletteType)}`, (body) => {
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

    this.getRouletteTier= rouletteType => {
        switch(rouletteType) {
            case "plant":
                return 0;
            case "coal":
                return 1;
            case "diamond":
                return 2;
            default:
                return null;
        };
    }

    return this;
})();