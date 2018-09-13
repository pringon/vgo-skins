"use strict";
const db                = require("../app/database/models"),
      request           = require("request"),
      authenticator     = require("otplib").authenticator,
      OPSkinsTrade      = require("opskins-express-trade"),
      jackpotBetsStore  = require("./jackpot_stakes_store"),
      coinflipBetsStore = require("./coinflip_lobbies_store"),
      rouletteSocket    = require("../app/sockets/roulette_socket"),
      coinflipSocket    = require("../app/sockets/coinflip_socket");

module.exports = {

    opskinsHeaders: { 
        Authorization: "Basic " + Buffer.from(process.env.OPSKINS_API_KEY + ":", "ascii").toString("base64")
    },

    insertLobbyIntoDatabase: function(lobby, hostIsTheWinner = true) {
        let hostInsert = db.CoinflipStakes.create({
            user: lobby.host.id,
            total: lobby.host.total*100,
            stake: JSON.stringify(lobby.host.items)
        });
        let challengerInsert = db.CoinflipStakes.create({
            user: lobby.challenger.id,
            total: lobby.challenger.total*100,
            stake: JSON.stringify(lobby.challenger.items)
        });

        Promise.all([hostInsert, challengerInsert]).then(([host, challenger]) => {
            let winner;
            if(hostIsTheWinner) {
                winner = lobby.host.id;
            } else {
                winner = lobby.challenger.id;
            }
            db.CoinflipHistory.create({
                winner,
                host: host.get("id"),
                challenger: challenger.get("id")
            }).then((lobbyRow) => {
                console.log(lobbyRow);
                coinflipBetsStore.deleteLobby(lobby.id, (err) => {
                    if(err) {
                        throw new Error(err);
                    }
                    coinflipSocket.refreshCoinflipLobbiesList();
                });
            });
        });
    },

    getCoinflipWinner: function(lobbyId) {
        coinflipBetsStore.getLobby(lobbyId, (err, lobby) => {
            let flipResult = Math.random();
            let hostTotal = parseFloat(lobby.host.total);
            let challengerTotal = parseFloat(lobby.challenger.total);
            let hostWinMargin = 0;
            if(hostTotal > challengerTotal + challengerTotal * 0.05) {
                hostWinMargin += 0.01;
            } else if(challengerTotal > hostTotal + hostTotal * 0.05) {
                hostWinMargin -= 0.01;
            }
            if(lobby.host.coinColor == "blue") {
                if(flipResult - hostWinMargin < 0.5) {
                    this.insertLobbyIntoDatabase(lobby);
                } else {
                    this.insertLobbyIntoDatabase(lobby, false);
                }
            } else {
                if(flipResult + hostWinMargin > 0.5) {
                    this.insertLobbyIntoDatabase(lobby);
                } else {
                    this.insertLobbyIntoDatabase(lobby, false);
                }
            }
        })
    },

    sendOffer: function(userId, items, message = "", cb = null) {

        console.log("user id is", userId);
        let options = { method: 'POST',
                    url: 'https://api-trade.opskins.com/ITrade/SendOfferToSteamId/v1/',
                    headers: { 
                        'Cache-Control': 'no-cache',
                        'Authorization': this.opskinsHeaders.Authorization,
                        'Content-Type': 'application/x-www-form-urlencoded' },
                    form: { 
                        twofactor_code: authenticator.generate(process.env.TWO_FACTOR_SECRET),
                        steam_id: userId,
                        items: items,
                        message: message } };

        request(options, function (error, response, body) {
            if (error) {
                throw new Error(error);
            }

            if(cb !== null) {
                cb(body);
            }
        });
    },

    handleJackpotOffer: function(offer) {

        jackpotBetsStore.offerExists(offer.id, (offerExists) => {
            if(!offerExists) {
                jackpotBetsStore.addOffer(offer.id);
                console.log(offer.message.slice(-1));
                jackpotBetsStore.setStake(offer.message.slice(-1), 
                { 
                    id: offer.recipient.steam_id,
                    user: offer.recipient.display_name,
                    avatar: offer.recipient.avatar
                }, offer.recipient.items, () => {
                    rouletteSocket.refreshStakes(offer.message.slice(-1));
                });
            }
        });
    },

    handleCoinflipHostOffer: function(offer) {
        coinflipBetsStore.offerExists(offer.id, (offerExists) => {
            if(!offerExists) {
                let lobbyId = offer.message.replace("Coinflip host ", '');
                coinflipBetsStore.addOffer(offer.id);
                coinflipBetsStore.createLobby({
                    id: offer.recipient.steam_id,
                    user: offer.recipient.display_name,
                    avatar: offer.recipient.avatar
                }, offer.recipient.items, 
                lobbyId, (err, results) => {
                    if(err) {
                        throw new Error(err);
                    }
                    coinflipSocket.refreshCoinflipLobbiesList();
                });
            }
        });
    },

    handleCoinflipChallengeOffer: function(offer) {
        coinflipBetsStore.offerExists(offer.id, (offerExists) => {
            if(!offerExists) {
                let lobbyId = offer.message.replace("Coinflip challenger ", '');
                coinflipBetsStore.addOffer(offer.id);
                coinflipBetsStore.setLobbyChallengerStake({
                    id: offer.recipient.steam_id,
                    user: offer.recipient.display_name,
                    avatar: offer.recipient.avatar
                }, offer.recipient.items, 
                lobbyId, (err, results) => {
                    if(err) {
                        throw new Error(err);
                    }
                    this.getCoinflipWinner(lobbyId);
                });
            }
        });
    },

    handleIncomingOffers: function() {
        
        let tradeBot = new OPSkinsTrade(process.env.OPSKINS_API_KEY, process.env.TWO_FACTOR_SECRET);

        tradeBot.pollTrades();
        tradeBot.on("offerUpdated", (offer) => {
            if(offer.state_name == "Accepted") {
                let offerMessage = offer.message;
                if(offerMessage.indexOf("Jackpot stake") !== -1) {
                    this.handleJackpotOffer(offer);
                } else if(offerMessage.indexOf("Coinflip host") !== -1) {
                    this.handleCoinflipHostOffer(offer);
                } else if(offerMessage.indexOf("Coinflip challenger") !== -1) {
                    this.handleCoinflipChallengeOffer(offer);
                }
            }
        });
    }
};