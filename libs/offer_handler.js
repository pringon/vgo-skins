"use strict";
const request = require("request"),
      authenticator = require("otplib").authenticator,
      OPSkinsTrade = require("opskins-express-trade"),
      jackpotBetsStore = require("./jackpot_stakes_store"),
      rouletteSocket = require("../app/sockets/roulette_socket");

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
                jackpotBetsStore.setStake({ 
                    id: offer.recipient.steam_id,
                    user: offer.recipient.display_name,
                    avatar: offer.recipient.avatar
                }, offer.recipient.items, () => {
                    rouletteSocket.refreshStakes();
                });
            }
        })
    },

    handleIncomingOffers: function() {
        
        let tradeBot = new OPSkinsTrade(process.env.OPSKINS_API_KEY, process.env.TWO_FACTOR_SECRET);

        tradeBot.pollTrades();
        tradeBot.on("offerUpdated", (offer) => {
            if(offer.state_name == "Accepted" && offer.message == "Jackpot stake") {
                this.handleJackpotOffer(offer);
            }
        });
    }
};