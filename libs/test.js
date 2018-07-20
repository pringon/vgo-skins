"use strict";
const jackpotStore = require("./jackpot_stakes_store");

jackpotStore.setStake({ id: 1, user: "Matt", avatar: "lorem ipsum" }, [{ id: 1, name: "glock", price: 7.5}, {id: 3, name: "uzi", price: 13 }]);
jackpotStore.setStake({ id: 75, user: "Dan", avatar: "lorem ipsum" }, [{ id: 2, name: "tec-9", price: 12 }, { id: 12, name: "ak-47", price: 20}]);
jackpotStore.getAllStakes(console.log);
jackpotStore.wipeStakes();