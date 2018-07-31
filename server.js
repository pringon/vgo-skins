"use strict";
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const express        = require("express"),
      app            = express(),
      http           = require("http").Server(app),
      io             = require("socket.io")(http),
      db             = require("./app/database/models"),
      expressLayouts = require("express-ejs-layouts"),
      logger         = require("morgan"),
      flash          = require("connect-flash"),
      passport       = require("passport"),
      session        = require("express-session"),
      cookieParser   = require("cookie-parser"),
      bodyParser     = require("body-parser"),
      offerHandler   = require("./libs/offer_handler");

require("./config/passport")(passport);

app.use(logger("dev"));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('view options', { layout: 'layout.ejs' });
app.use('/', express.static(__dirname + '/assets'));
app.use(expressLayouts);

app.use(session({
    secret: (process.env.SECRET || "drowssap"),
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require("./app/routes")(app, passport);

require("./app/sockets")(io);
offerHandler.handleIncomingOffers();

db.sequelize.sync().then( () => http.listen(
                                        process.env.PORT || 3000, 
                                        () => console.log(`App is listening on port ${process.env.PORT || 3000}`)
                                    ));