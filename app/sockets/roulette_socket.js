"use strict";
const randomColor = require("randomcolor");

let mockImg = "https://files.opskins.media/file/vgo-img/item/dual-berettas-trigger-happy-battle-scarred-300.png";
let mockName = "MAG-7 Gold Digger (Factory New)";
    

module.exports = {

    stakesData: [{ id: 1, user: "Matt", avatar: "/img/player-photo.jpg", stake: 10, color: randomColor()}, { id: 2, user: "Steve", avatar: "/img/player-photo.jpg", stake: 20, color: randomColor()},
                { id: 5, user: "Igor", avatar: "/img/player-photo.jpg", stake: 60, color: randomColor()}, { id: 4, user: "Dan", avatar: "/img/player-photo.jpg", stake: 40, color: randomColor()}, 
                { id: 3, user: "Bill", avatar: "/img/player-photo.jpg", stake: 30, color: randomColor()}],

    items: [{ id: 1, name: mockName, price: 7.13, image: { "--300px": mockImg}}, 
                { id: 2, name: mockName, price: 3.12, image: { "--300px": mockImg}}, { id: 3, name: mockName, price: 1.27, image: { "--300px": mockImg}}, 
                { id: 4, name: mockName, price: 2.32, image: { "--300px": mockImg}}, { id: 5, name: mockName, price: 15.73, image: { "--300px": mockImg}}, 
                { id: 6, name: mockName, price: 7.14, image: { "--300px": mockImg}}, { id: 7, name: mockName, price: 9.23, image: { "--300px": mockImg}}, 
                { id: 8, name: mockName, price: 3.14, image: { "--300px": mockImg}}],

    getTotal: function() {
        let total = 0;
        for(let stake of this.stakesData) {
            total += stake.stake;
        }
        return total;
    },

    getWinnerPos: function(winnerId) {
        let total = this.getTotal();
        let winnerSum = 0;
        for(let stake of this.stakesData) {
            if(stake.id == winnerId) {
                winnerSum += stake.stake/2;
                return Math.round((winnerSum*360)/total);
            } else {
                winnerSum += stake.stake;
            }
        }
        return 0;
    },

    getWinner: function() {
        let winner = Math.random() * this.getTotal();
        for(let stake of this.stakesData) {
            if(winner < stake.stake) {
                return stake;
            }
            winner -= stake.stake;
        }
    },

    initSocket: function(io, socket) {

        console.log(this.stakesData);

        socket.on("play roulette", () => {
    
            socket.emit("get roulette stakes", this.stakesData);
            console.log(`${socket.userName} is playing roulette`);
        });

        socket.on("select items", () => {

            socket.emit("select items", { availableItems: this.items, gambledItems: socket.itemsGambled ? socket.itemsGambled : [] });
        }); 
    
        socket.on("items gambled", ({stake, itemsGambled }) => {
    
            console.log(`stake is ${stake}`);
            let color = null;
            socket.itemsGambled = itemsGambled;
            for(let stakeIndex in this.stakesData) {
    
                if(this.stakesData[stakeIndex].user == socket.userName) {
                
                    color = this.stakesData[stakeIndex].color;
                    this.stakesData.splice(stakeIndex, 1);
                    break;
                }
            }
    
            this.stakesData.push({ id: socket.userId, user: socket.userName, avatar: socket.avatar, stake: parseFloat(stake), color: ((color == null) ? randomColor() : color) });
            io.sockets.emit("get roulette stakes", this.stakesData);
        });
    }
};