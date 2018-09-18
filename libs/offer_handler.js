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
                    coinflipBetsStore.createLobbyCount(lobbyId);
                    coinflipSocket.refreshCoinflipLobbiesList();
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