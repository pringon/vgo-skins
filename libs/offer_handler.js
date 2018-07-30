"use strict";
const request = require("request"),
      authenticator = require("otplib").authenticator,
      OPSkinsTrade = require("opskins-express-trade"),
      jackpotBetsStore = require("./jackpot_stakes_store");

module.exports = {

    sendOffer: function(opskinsId, opskinsTradeToken, items, message = "", cb = null) {

        let options = { method: 'POST',
                    url: 'https://api-trade.opskins.com/ITrade/SendOffer/v1/',
                    headers: { 
                        'Cache-Control': 'no-cache',
                        'Authorization': `Basic ${apiHash}`,
                        'Content-Type': 'application/x-www-form-urlencoded' },
                    form: { 
                        twofactor_code: authenticator.generate(process.env.TWO_FACTOR_SECRET),
                        uid: opskinsId,
                        token: opskinsTradeToken,
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
                jackpotBetsStore.addBets({ 
                    id: offer.recipient.steam_id,
                    user: offer.recipient.display_name,
                    avatar: offer.recipient.avatar
                }, offer.recipient.items);
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