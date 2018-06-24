"use strict";
const request = require("request-promise");

module.exports = (app, passport) => {

    app.get('/', (req, res) => {
    
        if(req.user) {
            request(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_API_KEY}&steamids=${req.user.id.match(/\d+$/)[0]}`)
                .then(data => JSON.parse(data))
                .then((data) => {
                    res.render("pages/home.ejs", {
                        user: data.response.players[0]
                    });
                });
        } else {
            res.render("pages/home.ejs", {
                user: false
            });
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