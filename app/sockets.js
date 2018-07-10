"use strict";
let randomColor = require("randomcolor");

let stakesData = [{user: "Matt", stake: 10, color: randomColor()}, {user: "Steve", stake: 20, color: randomColor()},
              { user: "Bill", stake: 30, color: randomColor()}, { user: "Dan", stake: 40, color: randomColor()}, 
              { user: "Igor", stake: 60, color: randomColor()}];

let getTotal = () => {
    let total = 0;
    for(let stake of stakesData) {
        total += stake.stake;
    }
    return total;
};

let getWinner = () => {
    let winner = Math.random() * getTotal();
    for(let stake of stakesData) {
        if(winner < stake.stake) {
            stakesData = [{user: "Matt", stake: 10, color: randomColor()}, {user: "Steve", stake: 20, color: randomColor()},
                        { user: "Bill", stake: 30, color: randomColor()}, { user: "Dan", stake: 40, color: randomColor()}, 
                        { user: "Igor", stake: 60, color: randomColor()}];
            return stake;
        }
        winner -= stake.stake;
    }
};

module.exports = (io) => {

    let timeRemaining = 30;
    setInterval(() => {
        timeRemaining--;
        if(timeRemaining == 0) {
            io.sockets.emit("round finished", getWinner());
            io.sockets.emit("get roulette stakes", stakesData);
            timeRemaining = 30;
        }
        io.sockets.emit("time elapsed", timeRemaining);
    }, 1000);

    io.on("connection", (socket) => {

        socket.on("user data", (userData) => {

            console.log(`User ${userData.userName} has connected.`);
            socket.userId = userData.userId;
            socket.userName = userData.userName;
            socket.emit("timer update", timeRemaining);
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
            let color = null;
            for(let stakeIndex in stakesData) {

                if(stakesData[stakeIndex].user == socket.userName) {
                
                    color = stakesData[stakeIndex].color;
                    stakesData.splice(stakeIndex, 1);
                    break;
                }
            }
            stakesData.push({ user: socket.userName, stake: parseFloat(stake), color: ((color == null) ? randomColor() : color) });
            socket.emit("get roulette stakes", stakesData);
        });
    });
};