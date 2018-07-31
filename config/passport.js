"use strict"
const db = require("../app/database/models"),
      OpenIDStrategy = require("passport-openid").Strategy;
const host = process.env.NODE_ENV == "production" ? "https://vgo-gem-alpha.herokuapp.com/" : "http://localhost:3000/";

module.exports = (passport) => {

    passport.serializeUser((user, done) => {
        done(null, JSON.stringify({
            id: user.steamId,
            level: user.level
        }));
    });
    passport.deserializeUser((user, done) => {
        let userData = JSON.parse(user);
        done(null, {
            steamId: userData.id,
            level: userData.level
        });
    });

    passport.use("steam-auth", new OpenIDStrategy({
        providerURL: "http://steamcommunity.com/openid",
        stateless: true,
        returnURL: `${host}user/auth/openid/return`,
        realm: host
        }, (id, done) => {

            process.nextTick(async() => {

                let user;
                let steamId = id.match(/\d+$/)[0];
                try {
                    user = await db.user.findById(steamId);
                } catch(err) {
                    return done(err);
                }
                if(user === null) {
                    try {
                        user = await db.user.create({
                            steamId: steamId
                        });
                    } catch(err) {
                        return done(err);
                    }
                    if(user !== null) {
                        return done(null, user);
                    } else {
                        return done(null, false, req.flash("signinMessage", "Failed to process your sign in information."));
                    }
                } else {
                    return done(null, user);
                }
            });
        }));
};