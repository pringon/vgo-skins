"use strict";
let randomColor = require("randomcolor");

let stakesData = [{user: "Matt", stake: 10, color: randomColor()}, {user: "Steve", stake: 20, color: randomColor()},
              { user: "Bill", stake: 30, color: randomColor()}, { user: "Dan", stake: 40, color: randomColor()}, 
              { user: "Igor", stake: 60, color: randomColor()}];

module.exports = (io) => {

    io.on("connection", (socket) => {

        socket.on("user data", (userData) => {

            console.log(`User ${userData.userName} has connected.`);
            socket.userId = userData.userId;
            socket.userName = userData.userName;
        });

        socket.on("chat message", (message) => {

            console.log(`User with id ${socket.userId} has sent a message of: ${message}`);
            io.sockets.emit("chat message", {
                message,
                emittingUser: socket.userId
            });
        });

        socket.on("play roulette", () => {

            socket.emit("get roulette stakes", stakesData);
        });

        socket.on("items gambled", (stake) => {

            console.log(`stake is ${stake}`);        
            let index = 0;
            while(stakesData[index].stake < stake) {
                index++;
            }
            stakesData.splice(index, 0, { stake, user: socket.userName, color: randomColor()});
            socket.emit("get roulette stakes", stakesData);
        });
    });
};