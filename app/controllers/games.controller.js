"use strict";
const request              = require("request-promise"),
      db                   = require("../database/models"),
      userUtils            = require("../../libs/user_utils"),
      jackpotStakeStore    = require("../../libs/jackpot_stakes_store"),
      coinflipLobbiesStore = require("../../libs/coinflip_lobbies_store"),
      offerHandler         = require("../../libs/offer_handler");

module.exports = (() => {

    // /games/roulette/:rouletteType
    this.getRoulette = (req, res) => {
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
            userUtils.getUser(req.user.steamId, (err, currentUser) => {
                db.JackpotHistory.getHistory({ tier: rouletteTier }, jackpotHistory => {
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
            });
        }
    };

    // /games/roulette/:rouletteType/items
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

    // /games/roulette/:rouletteType/:itemsGambled
    this.postRouletteStake = (req, res) => {

        let maxStake, minStake, rouletteTier;

        switch(req.params.rouletteType) {
            case "plant":
                rouletteTier = 0;
                minStake = 0.1;
                maxStake = 0.5;
                break;
            case "coal":
                rouletteTier = 1;
                minStake = 0.5;
                maxStake = 1.0;
                break;
            case "diamond":
                rouletteTier = 2;
                minStake = 1.0;
                maxStake = Infinity;
                break;
            default:
                res.send("Invalid roullete type");
                return;
        }

        jackpotStakeStore.getStake(rouletteTier, req.user.steamId, stake => {

            let newStake = [];
            let totalGambled = 0.0;

            if(stake !== null) {
                totalGambled = parseFloat(stake.total);

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

            request({
                method: "GET",
                url: `https://api-trade.opskins.com/IItem/GetItemsById/v1/?item_id=${newStake}`,
                headers: { 
                    'Cache-Control': 'no-cache',
                    'Authorization': offerHandler.opskinsHeaders.Authorization 
                }
            })
            .then(body => JSON.parse(body))
            .then(body => {
                body.response.items.forEach(item => {
                    totalGambled += parseFloat(item.suggested_price)/100;
                });
                
                if(totalGambled <= maxStake && totalGambled >= minStake) {
                    offerHandler.sendOffer(req.user.steamId,
                        newStake, `Jackpot stake ${this.getRouletteTier(req.params.rouletteType)}`, (body) => {
                            let responseData = JSON.parse(body).response;
                            if(typeof responseData !== 'undefined') {
                                if(responseData.status !== 400) {
                                    
                                    res.json({ tradeId: responseData.offer.id });
                                }
                            }
                    });
                } else {
                    res.json({ err: { message: "Stake is not withing limits" }});
                }
            })
            .catch(console.log);
        });
    };

    // /games/coinflip
    this.getCoinflip = (req, res) => {
        userUtils.getUser(req.user.steamId, (err, currentUser) => {
            coinflipLobbiesStore.getLobbies((err, coinflipLobbies) => {
                coinflipLobbiesStore.getCoinflipLobbyCount((err, coinflipLobbyCount) => {
                    res.render("pages/coinflip.ejs", {
                        coinflipLobbies,
                        coinflipLobbyCount,
                        currentUser: {
                            level: req.user.level,
                            ...currentUser
                        },
                        chat: true,
                        coinflip: true
                    });
                });
            });
        });
    };

    // /games/coinflip/history
    this.getCoinflipHistory = (req, res) => {
        userUtils.getUser(req.user.steamId, (err, currentUser) => {
            db.CoinflipHistory.getHistory({}, 5, (coinflipHistory) => {
                res.render("pages/coinflip_history.ejs", {
                    coinflipHistory,
                    currentUser: {
                        level: req.user.level,
                        ...currentUser
                    },
                    chat: true,
                    coinflip: true,
                    coinflipHistoryPage: true
                });
            });
        })
    };

    // /games/coinflip/:lobbyId
    this.getCoinflipLobby = (req, res) => {
        coinflipLobbiesStore.getLobby(req.params.lobbyId, (err, lobby) => {
            if(err) {
                throw new Error(err);
            }
            res.json(lobby);
        });
    };

    this.getCoinflipLobbyFromHistory = (req, res) => {
        db.CoinflipHistory.getLobby(req.params.lobbyId, res.json.bind(res));
    };

    // /games/coinflip/:itemsGambled/:coinColor
    this.postCoinflipLobby = (req, res) => {
        offerHandler.sendOffer(req.user.steamId, req.params.itemsGambled, `Coinflip host ${req.params.coinColor}`, (body) => {
            let responseData = JSON.parse(body).response;
            if(responseData && responseData.status !== 400) {
                res.json({ tradeId: responseData.offer.id });
            }
        });
    };

    // /games/coinflip/:lobbyId/:itemsGambled
    this.postCoinflipDeposit = (req, res) => {
        coinflipLobbiesStore.getLobby(req.params.lobbyId, (err, lobby) => {
            let depositedAmount = parseFloat(req.params.depositedAmount);
            if(lobby.host.total * 1.1 > depositedAmount && lobby.host.total * 0.9 < depositedAmount) {
                offerHandler.sendOffer(req.user.steamId, req.params.itemsGambled, `Coinflip challenger ${req.params.lobbyId}`, (body) => {
                    let responseData = JSON.parse(body).response;
                    if(responseData && responseData.status !== 400) {
                        res.json({ tradeId: responseData.offer.id });
                    }
                });
            } else {
                res.json({ err: { message: "Stake is not within betting limits" }});
            }
        });
    };

    this.getRouletteTier = rouletteType => {
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