"use strict";
let Roulete = function() {

    this.getTotal = function(stakesList) {

        let myTotal = 0;
        for(user of stakesList) {
            myTotal += user.stake;
        }
        return myTotal;
    };
}