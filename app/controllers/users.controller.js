"use strict";
const db           = require("../database/models"),
      userUtils    = require("../../libs/user_utils"),
      jackpotStore = require("../../libs/jackpot_stakes_store");

module.exports = (() => {

    this.isLoggedIn = (req, res, next) => {
        if(req.isAuthenticated()) {
            return next();
        }

        res.redirect('/');
    };

    // /user/profile/:id
    this.getProfile = async(req, res) => {

        userUtils.getUser(req.user.steamId, (err, currentUser) => {
            db.JackpotHistory.procedures.getHistory({ winner: req.params.id }, 5, jackpotHistory => {
                db.CoinflipHistory.procedures.getHistory({ winner: req.params.id }, 5, coinflipHistory => {
                    if(req.params.id == req.user.steamId) {
                        db.user.findOne({
                            where: { steamId: req.user.steamId }
                        }).then(userProfileData => {
                            res.render("pages/profile.ejs", {
                                jackpotHistory,
                                coinflipHistory,
                                currentUser: {
                                    level: req.user.level,
                                    ...currentUser
                                },
                                queriedUser: {
                                    ...{
                                        level: userProfileData.level,
                                        experiencePoints: userProfileData.experiencePoints,
                                        totalWon: userProfileData.totalWon,
                                        totalGambled: userProfileData.totalGambled,
                                        skinsWagered: userProfileData.skinsWagered,
                                        luckiestWin: userProfileData.luckiestWin 
                                    },
                                    ...currentUser,
                                },
                                profilePage: true,
                                chat: true
                            });
                        })
                    } else {
                        userUtils.getUser(req.params.id, (err, queriedUser) => {
                            db.user.findOne({
                                where: { steamId: queriedUser.steamid }
                            }).then(userProfileData => {
                                res.render("pages/profile.ejs", {
                                    jackpotHistory,
                                    coinflipHistory,
                                    currentUser: {
                                        level: req.user.level,
                                        ...currentUser
                                    },
                                    queriedUser: {
                                        ...{
                                            level: userProfileData.level,
                                            experiencePoints: userProfileData.experiencePoints,
                                            totalWon: userProfileData.totalWon,
                                            totalGambled: userProfileData.totalGambled,
                                            skinsWagered: userProfileData.skinsWagered,
                                            luckiestWin: userProfileData.luckiestWin 
                                        },
                                        ...queriedUser
                                    },
                                    profilePage: true,
                                    chat: true
                                });
                            });
                        });
                    }
                });
            });
        });
    };

    // /user/items
    this.getAvailableItems = (req, res) => {
        userUtils.getAvailableItems(req.user.steamId, (err, availableItems) => {
            if(err) {
                throw new Error(err);
            }
            res.json({ availableItems });
        });
    };

    // /user/auth/openid/return
    this.handleOpenIDReturn = (req, res) => {

        if(req.user) {
            res.redirect('/');
        } else {
            res.redirect("/?failed");
        }
    };

    // /user/tradeUrl
    this.postTradeUrl = (req, res) => {

        if(req.body.tradeUrl.indexOf("https://trade.opskins.com/t/") == 0) {
            let tradeUrlKeys = req.body.tradeUrl.split('/');
            db.user.update({
                opskinsId: tradeUrlKeys[4],
                opskinsTradeToken: tradeUrlKeys[5]
            }, {
                where: { steamId: req.user.steamId }
            });
            
            res.status(204);
            res.send();
        } else {
            res.send("Trade url does not exist");
        }
    },

    // /user/logout
    this.postLogout = (req, res) => {

        req.logout();
        res.redirect('/');
    };

    return this;
})();