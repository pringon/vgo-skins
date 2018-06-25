"use strict";
const request = require("request-promise");
const baseUri = "http://api.steampowered.com";

module.exports = (app, passport) => {

    app.get('/', async(req, res) => {
        if(req.user) {
            let currentUser = await getCurrentUser(req.user.steamId);
            res.render("pages/home.ejs", {
                currentUser: currentUser
            });
        } else {
            res.render("pages/home.ejs", {
                currentUser: false
            });
        }
    });
    app.get("/user/profile/:id", isLoggedIn, async(req, res) => {
        let currentUser = await getCurrentUser(req.user.steamId);
        if(req.params.id == req.user.steamId) {
            res.render("pages/profile.ejs", {
                currentUser: currentUser,
                queriedUser: currentUser
            });
        } else {
            let user = {};
            user.personaname = "Lorem Ipsum";
            user.avatar = "http://i0.kym-cdn.com/photos/images/original/000/002/941/Duckroll.jpg";
            res.render("pages/profile.ejs", {
                currentUser: currentUser,
                queriedUser: user
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

let isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()) {
      return next();
    }
  
    res.redirect('/');
};

let getCurrentUser = async(userId) => {
    let jsonData = await request(`${baseUri}/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_API_KEY}&steamids=${userId}`);
    let data = JSON.parse(jsonData);
    return data.response.players[0];
}