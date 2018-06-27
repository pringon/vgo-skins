"use strict";
const request = require("request-promise"),
      db      = require("./database/models"),
      baseUri = "http://api.steampowered.com";

module.exports = (app, passport) => {

    app.get('/', async(req, res) => {
        if(req.user) {
            let currentUser = await getUser(req.user.steamId);
            res.render("pages/home.ejs", {
                currentUser: currentUser
            });
        } else {
            res.render("pages/home.ejs");
        }
    });
    app.get("/user/profile/:id", isLoggedIn, async(req, res) => {
        let currentUser = await getUser(req.user.steamId);
        if(req.params.id == req.user.steamId) {
            res.render("pages/profile.ejs", {
                currentUser: currentUser,
                queriedUser: currentUser
            });
        } else {
            let queriedUser = await getUser(req.params.id);
            if(typeof queriedUser === 'undefined') {
                queriedUser = currentUser;
            }
            res.render("pages/profile.ejs", {
                currentUser: currentUser,
                queriedUser: queriedUser
            });
        }
    });
    app.post("/user/tradeUrl", (req, res) => {
        if(req.body.tradeUrl.indexOf("https://trade.opskins.com/t/") == 0) {
            db.user.update({
                opskinsTradeUrl: req.body.tradeUrl
            }, {
                where: { steamId: req.user.steamId }
            });
            console.log("updated");
            res.status(204);
            res.send();
        }
    });

    app.post("/auth/openid", passport.authenticate("steam-auth"));
    app.get("/auth/openid/return", passport.authenticate("steam-auth"),
        (req, res) => {

        if(req.user) {
            res.redirect('/');
        } else {
            res.redirect("/?failed");
        }
    });
    app.post("/auth/logout", (req, res) => {
        req.logout();
        res.redirect(req.get("Referer") || '/');
    })
};

let isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()) {
      return next();
    }
  
    res.redirect('/');
};

let getUser = async(userId) => {
    let jsonData = await request(`${baseUri}/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_API_KEY}&steamids=${userId}`);
    let data = JSON.parse(jsonData);
    return data.response.players[0];
}