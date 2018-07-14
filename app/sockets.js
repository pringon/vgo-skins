"use strict";
const userUtils   = require("../libs/user_utils"),
      randomColor = require("randomcolor");

let stakesData = [{ id: 1, user: "Matt", avatar: "/img/player-photo.jpg", stake: 10, color: randomColor()}, { id: 2, user: "Steve", avatar: "/img/player-photo.jpg", stake: 20, color: randomColor()},
              { id: 3, user: "Bill", avatar: "/img/player-photo.jpg", stake: 30, color: randomColor()}, { id: 4, user: "Dan", avatar: "/img/player-photo.jpg", stake: 40, color: randomColor()}, 
              { id: 5, user: "Igor", avatar: "/img/player-photo.jpg", stake: 60, color: randomColor()}];
let headonPosts = [{ id: 1, user: "Matt", stake: 30, upper: true, lower: true }, { id: 2, user: "Bill", stake: 20, upper: true, lower: true},
                { id: 3, user: "Matt", stake: 40, upper: true, lower: false }, { id: 4, user: "Dan", stake: 100, upper: false, lower: true},
                { id: 5, user: "Igor", stake: 90, upper: false, lower: false}];

let getTotal = () => {
    let total = 0;
    for(let stake of stakesData) {
        total += stake.stake;
    }
    return total;
};

let getWinnerPos = (winnerId) => {
    let total = getTotal();
    let winnerSum = 0;
    for(let stake of stakesData) {
        if(stake.id = winnerId) {
            winnerSum += stake.stake/2;
            break;
        } else {
            winnerSum += stake.stake;
        }
    }
    return Math.round((winnerSum*360)/total);
};

let getWinner = () => {
    let winner = Math.random() * getTotal();
    for(let stake of stakesData) {
        if(winner < stake.stake) {
            stakesData = [{ id: 1, user: "Matt", avatar: "/img/player-photo.jpg", stake: 10, color: randomColor()}, { id: 2, user: "Steve", avatar: "/img/player-photo.jpg", stake: 20, color: randomColor()},
                        { id: 3, user: "Bill", avatar: "/img/player-photo.jpg", stake: 30, color: randomColor()}, { id: 4, user: "Dan", avatar: "/img/player-photo.jpg", stake: 40, color: randomColor()}, 
                        { id: 5, user: "Igor", avatar: "/img/player-photo.jpg", stake: 60, color: randomColor()}];
            return stake;
        }
        winner -= stake.stake;
    }
};

module.exports = (io) => {

    let timeRemaining = 90;
    let connectedUsers = 0;
    setInterval(() => {
        timeRemaining--;
        if(timeRemaining == 0) {
            let winner = getWinner();
            io.sockets.emit("round finished", { winner, winnerPos: getWinnerPos(winner.id)});
            setTimeout(function() {
                io.sockets.emit("get roulette stakes", stakesData);
            }, 7000);
            timeRemaining = 100;
        }
        if(timeRemaining <= 90) {
            io.sockets.emit("time elapsed", timeRemaining);
        }
    }, 1000);
    setInterval(() => {
        io.sockets.emit("user count", connectedUsers);
    }, 10000)

    io.on("connection", (socket) => {

        connectedUsers++;

        socket.on("user data", (userData) => {

            console.log(`User ${userData.userName} has connected.`);
            socket.userId = userData.userId;
            socket.userName = userData.userName;
            socket.avatar = userData.avatar;
            socket.emit("timer update", timeRemaining);
        });

        socket.on("chat message", (message) => {

            if(message.length > 2) {
                console.log(`User with id ${socket.userId} has sent a message of: ${message}`);
                io.sockets.emit("chat message", {
                    message,
                    emittingUser: {
                        userName: socket.userName,
                        avatar: socket.avatar
                    }
                });
            }
        });

        socket.on("play roulette", () => {

            socket.emit("get roulette stakes", stakesData);
            console.log(`${socket.userName} is playing roulette`);
        });

        socket.on("play headon", () => {

            socket.emit("get headon posts", headonPosts);
            console.log(`${socket.userName} is playing headon`);
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

            stakesData.push({ id: socket.userId, user: socket.userName, avatar: socket.avatar, stake: parseFloat(stake), color: ((color == null) ? randomColor() : color) });
            io.sockets.emit("get roulette stakes", stakesData);
        });

        socket.on("disconnect", () => {
            connectedUsers--;
        });
    });
};