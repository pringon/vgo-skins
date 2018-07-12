"use strict";

/**
 * A function that takes all the bets from the current round and returns the total sum of money bet
 * @method getTotal
 * @param {Array} stakesList is an array containing the current round's bets
 * @return {int} the total amount of money that was bet this round
 */
function getTotal(stakesList) {
    let myTotal = 0;
    for (let j = 0; j < stakesList.length; j++) {
        myTotal += Math.round(stakesList[j].stake);
    }
    return myTotal;
}

/**
 * A function that takes the users that bet this round and lists them on the screen
 * @method listUsers
 * @param {Array} stakesList is an array containing the current round's bets
 */
function listUsers(stakesList) {

    stakesList.sort(function(a, b) {
        if (a.stake < b.stake)
            return -1;
        if (a.stake > b.stake)
            return 1;
        return 0;
    });

    let total = getTotal(stakesList);
    $(".jackpot-score > .amount").text(`$${total}`);
    document.getElementsByClassName("score")[6].textContent = `$${total}`;

    document.getElementsByClassName("score")[3].textContent = stakesList.length;

    let usersList = document.createDocumentFragment();

    for(let i = stakesList.length-1; i >= 0; i--) {

        let playerDiv = document.createElement("div");
        playerDiv.setAttribute("class", "row");

        let playerInfoDiv = document.createElement("div");
        playerInfoDiv.setAttribute("class", "col");
        let playerAvatarHolder = document.createElement("span");
        playerAvatarHolder.setAttribute("class", "avatar");
        let playerAvatar = document.createElement("img");
        playerAvatar.setAttribute("src", stakesList[i].avatar);
        playerAvatar.setAttribute("alt", "Player");
        playerAvatarHolder.appendChild(playerAvatar);
        let playerName = document.createElement("span");
        playerName.setAttribute("class", "name");
        playerName.textContent = stakesList[i].user;
        
        playerInfoDiv.appendChild(playerAvatarHolder);
        playerInfoDiv.appendChild(playerName);

        let playerDataDiv = document.createElement("div");
        playerDataDiv.setAttribute("class", "col");
        let playerAmountBet = document.createElement("span");
        playerAmountBet.setAttribute("class", "amonut");
        playerAmountBet.textContent = `$${stakesList[i].stake}`;
        let playerItemCount = document.createElement("span");
        playerItemCount.setAttribute("class", "items");
        playerItemCount.textContent = "(16 Items)";
        let playerStakeRatio = document.createElement("span");
        playerStakeRatio.setAttribute("class", "ratio");
        playerStakeRatio.textContent = `${(stakesList[i].stake/total*100).toFixed(2)}%`;

        playerDataDiv.appendChild(playerAmountBet);
        playerDataDiv.appendChild(playerItemCount);
        playerDataDiv.appendChild(playerStakeRatio);

        playerDiv.appendChild(playerInfoDiv);
        playerDiv.appendChild(playerDataDiv);

        let playerDivHolder = document.createElement("div");
        playerDivHolder.setAttribute("class", "player");
        playerDivHolder.appendChild(playerDiv);
        usersList.appendChild(playerDivHolder);
    }

    let usersListElement = document.getElementsByClassName("player-list")[0];
    usersListElement.innerHTML = '';
    usersListElement.appendChild(usersList);
}

/**
 * A function that takes the users that bet this round and draws a pie chart where the slices are
 *  proportional to the value bet by the player
 * @method plotData
 * @param {Array} stakesList is an array containing the current round's bets
 */
function plotData(stakesList) {

    let chartData = { stakes: [], colors: [], avatars: [] };

    for(let stake of stakesList) {
        chartData.stakes.push(stake.stake);
        chartData.colors.push(stake.color);
        chartData.avatars.push({
            src: stake.avatar,
            width: 30,
            height: 30
        });
    }

    plotStakes("doughnut", chartData);
}

/**
 * A function that fetches the items owned by the player and lists them in the bet items modal
 * @method listModalItems
 */
function listModalItems() {

    let mockImg = "https://files.opskins.media/file/vgo-img/item/dual-berettas-trigger-happy-battle-scarred-300.png";
    let mockName = "MAG-7 Gold Digger (Factory New)";
    let items = [{ id: 1, name: mockName, price: 7.13, image: { "--300px": mockImg}}, 
    { id: 2, name: mockName, price: 3.12, image: { "--300px": mockImg}}, { id: 3, name: mockName, price: 1.27, image: { "--300px": mockImg}}, 
    { id: 4, name: mockName, price: 2.32, image: { "--300px": mockImg}}, { id: 5, name: mockName, price: 15.73, image: { "--300px": mockImg}}, 
    { id: 6, name: mockName, price: 7.14, image: { "--300px": mockImg}}, { id: 7, name: mockName, price: 9.23, image: { "--300px": mockImg}}, 
    { id: 8, name: mockName, price: 3.14, image: { "--300px": mockImg}}];

    selectedItems = currentSelectedItems ? currentSelectedItems : {};
    totalMoneyGambled = currentMoneyGambled ? totalMoneyGambled : 0;

    let itemsList = document.createDocumentFragment();

    for(let item of items) {

        let itemContainer = document.createElement("div");
        itemContainer.className = "modal-item-container";

        let itemImage = document.createElement("img");
        itemImage.id = item.id;
        itemImage.className = "modal-item-image";
        itemImage.src = item.image["--300px"];
        itemImage.onclick = selectItem;
        if(selectedItems.hasOwnProperty(item.id)) {
            itemImage.className = "modal-item-image selected-item";
        } else {
            itemImage.className = "modal-item-image";
        }

        let itemCost = document.createElement("div");
        itemCost.className = "modal-item-cost";
        itemCost.textContent = item.price;

        itemContainer.appendChild(itemImage);
        itemContainer.appendChild(itemCost);
        itemsList.appendChild(itemContainer);
    }

    let itemsElementList = document.getElementsByClassName("modal-body")[0];
    itemsElementList.innerHTML = '';
    itemsElementList.appendChild(itemsList);
    $("#total-gambled").text(`Total: ${currentMoneyGambled.toFixed(2)}$`);
    totalMoneyGambled = currentMoneyGambled;
    selectedItems = currentSelectedItems;
}

/**
 * A function that calls the plotData and listUsers functions
 * @method refreshScreen
 * @param {Array} stakesList is an array containing the current round's bets
 */
function refreshScreen(stakesList) {
    
    plotData(stakesList);
    listUsers(stakesList);
}

$(document).ready(function() {

    $("#roulette-bet > button").on("click", listModalItems);
    //$("#roulette-modal").on('hidden.bs.modal', clearSelection);
    //$(".modal-footer > button").on("click", submitSelection);
});