"use strict";

/**
 * A function that takes all the bets from the current round and returns the total sum of money bet
 * @method getTotal
 * @param {Array} stakesList is an array containing the current round's bets
 * @return {int} the total amount of money that was bet this round
 */
function getTotal(stakesList, att = "total") {
    let myTotal = 0;
    for (let j = 0; j < stakesList.length; j++) {
        myTotal += stakesList[j][att];
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
        if (a.total < b.total)
            return -1;
        if (a.total > b.total)
            return 1;
        return 0;
    });

    let total = getTotal(stakesList);
    $(".jackpot-score > .amount").text(`$${total.toFixed(2)}`);
    document.getElementsByClassName("score")[6].textContent = `$${total.toFixed(2)}`;

    document.getElementsByClassName("score")[3].textContent = stakesList.length;
    document.getElementsByClassName("score")[0].innerHTML = `${(currentMoneyGambled/total*100).toFixed(2)}<small>%</small>`;

    let usersList = document.createDocumentFragment();

    for(let i = stakesList.length-1; i >= 0; i--) {

        let playerDiv = document.createElement("div");
        playerDiv.setAttribute("class", "row");

        let playerInfoDiv = document.createElement("div");
        playerInfoDiv.setAttribute("class", "col");
        let playerAvatarHolder = document.createElement("span");
        playerAvatarHolder.setAttribute("id", `playerholder-${stakesList[i].id}`);
        playerAvatarHolder.setAttribute("class", "avatar");
        playerAvatarHolder.style.border = `solid 4px ${stakesList[i].color}`;
        setArrowColor(`playerholder-${stakesList[i].id}`, stakesList[i].color);
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
        playerAmountBet.textContent = `$${stakesList[i].total}`;
        let playerItemCount = document.createElement("span");
        playerItemCount.setAttribute("class", "items");
        playerItemCount.textContent = "(16 Items)";
        let playerStakeRatio = document.createElement("span");
        playerStakeRatio.setAttribute("class", "ratio");
        playerStakeRatio.textContent = `${(stakesList[i].total/total*100).toFixed(2)}%`;

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
 * A function that takes this round's stakes data and populates the item gallery
 * @method populateItemsGallery
 * @param {Array} stakesList is an array containing the current round's bets
 */
function populateItemsGallery(stakesList) {

    let itemsGallery = document.createDocumentFragment();
    let firstSelected = false;
    let itemCount = 0;

    for(let stake of stakesList) {
        for(let item of stake.items) {

            console.log(item);
            let itemHolder = document.createElement("div");
            if(!firstSelected) {

                itemHolder.setAttribute("class", "gallery-cell item is-selected");
                itemHolder.setAttribute("style", `position: absolute; left: ${(itemCount*10.38).toFixed(2)}%;`);
                itemHolder.setAttribute("aria-selected", "true");
                firstSelected = true;
            } else {

                itemHolder.setAttribute("class", "gallery-cell item");
                itemHolder.setAttribute("style", `position: absolute; left: ${(itemCount*10.38).toFixed(2)}%;`);
                itemHolder.setAttribute("aria-selected", "false");
            }


            let topSection = document.createElement("div");
            topSection.setAttribute("class", "top-sec");

            let playerAvatarHolder = document.createElement("span");
            playerAvatarHolder.setAttribute("class", "avatar");
            let playerAvatar = document.createElement("img");
            playerAvatar.setAttribute("src", stake.avatar);
            playerAvatarHolder.appendChild(playerAvatar);

            let itemCode = document.createElement("span");
            itemCode.setAttribute("class", "code");
            itemCode.textContent = "MM";

            let itemPrice = document.createElement("span");
            itemPrice.setAttribute("class", "amount");
            itemPrice.textContent = `$${item.price}`;

            topSection.appendChild(playerAvatarHolder);
            topSection.appendChild(itemCode);
            topSection.appendChild(itemPrice);


            let midSection = document.createElement("div");
            midSection.setAttribute("class", "mid-sec");

            let itemImage = document.createElement("img");
            itemImage.setAttribute("src", item.image["300px"]);

            midSection.appendChild(itemImage);


            let bottomSection = document.createElement("div");
            bottomSection.setAttribute("class", "bottom-sec");
            bottomSection.textContent = item.name;


            itemHolder.appendChild(topSection);
            itemHolder.appendChild(midSection);
            itemHolder.appendChild(bottomSection);

            itemsGallery.appendChild(itemHolder);
            
            itemCount++;
        }
    }

    let gallerySlider = document.getElementsByClassName("flickity-slider")[0];
    gallerySlider.innerHTML = '';
    gallerySlider.appendChild(itemsGallery);
}

/**
 * A function that takes the users that bet this round and draws a pie chart where the slices are
 *  proportional to the value bet by the player
 * @method plotData
 * @param {Array} stakesList is an array containing the current round's bets
 */
function plotData(stakesList) {

    let chartData = { names: [], stakes: [], colors: [], avatars: [] };

    for(let stake of stakesList) {
        chartData.names.push(stake.user);
        chartData.stakes.push(stake.total);
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
function listModalItems({ availableItems, gambledItems }) {

    selectedItems = {};
    totalMoneyGambled = getTotal(gambledItems, "price");

    /*selectedItems = currentSelectedItems ? Object.assign({}, currentSelectedItems) : {};
    totalMoneyGambled = currentMoneyGambled ? currentMoneyGambled : 0;*/
    for(let gambledItem of gambledItems) {
        console.log(gambledItem);
        selectedItems[gambledItem.id] = gambledItem;
        console.log(selectedItems[gambledItem.id]);
    }
    console.log(gambledItems);
    console.log(selectedItems);

    let itemsList = document.createDocumentFragment();

    let itemsRow = document.createElement("div");
    itemsRow.setAttribute("class", "row");
    let columnIndex = 0;

    for(let item of availableItems) {

        let itemContainer = document.createElement("div");

        console.log(item.id);
        if(gambledItems.map(e => e.id).indexOf(item.id.toString()) !== -1) {
            itemContainer.setAttribute("class", "col gambling-selection-item selected-item");    
        } else {
            itemContainer.setAttribute("class", "gambling-selection-item col");
        }

        itemContainer.setAttribute("id", item.id);
        itemContainer.onclick = selectItem;
        let itemHolder = document.createElement("div");
        itemHolder.setAttribute("class", "skin-item");

        let topSection = document.createElement("div");
        topSection.setAttribute("class", "top-sec");
        let itemCode = document.createElement("span");
        itemCode.setAttribute("class", "code");
        itemCode.textContent = "MM";
        let itemPrice = document.createElement("span");
        itemPrice.setAttribute("class", "amount");
        itemPrice.textContent = `$${item.price}`;
        topSection.appendChild(itemCode);
        topSection.appendChild(itemPrice);

        let midSection = document.createElement("div");
        midSection.setAttribute("class", "mid-sec");
        let itemImage = document.createElement("img");
        itemImage.setAttribute("src", item.image["300px"]);
        midSection.appendChild(itemImage);

        let bottomSection = document.createElement("div");
        bottomSection.setAttribute("class", "bottom-sec");
        bottomSection.textContent = item.name;
        
        itemHolder.appendChild(topSection);
        itemHolder.appendChild(midSection);
        itemHolder.appendChild(bottomSection);
        itemContainer.appendChild(itemHolder);
        itemsRow.appendChild(itemContainer);

        columnIndex++;
        if(columnIndex == 5) {
            itemsList.appendChild(itemsRow);
            itemsRow = document.createElement("div");
            itemsRow.setAttribute("class", "row");
            columnIndex = 0;
        }
    }

    if(columnIndex > 0) {
        itemsList.appendChild(itemsRow);
    }

    let itemsElementList = document.getElementsByClassName("data-content")[0];
    itemsElementList.innerHTML = '';
    itemsElementList.appendChild(itemsList);
    $(".modal-content .row .score-panel .item .score:eq(1)").text(`$${currentMoneyGambled.toFixed(2)}`);
    $(".data-panel .bottom-sec button").text(`Deposit $${currentMoneyGambled.toFixed(2)} (0 Skins)`);
    /*totalMoneyGambled = currentMoneyGambled;
    selectedItems = Object.assign({}, currentSelectedItems);*/
}

/**
 * A function that calls the plotData and listUsers functions
 * @method refreshScreen
 * @param {Array} stakesList is an array containing the current round's bets
 */
function refreshScreen(stakesList) {
    
    potTotal = getTotal(stakesList);
    plotData(stakesList);
    listUsers(stakesList);
    populateItemsGallery(stakesList);
}

$(document).ready(function() {

    $(".jackpot-btn > button").on("click", () => socket.emit("select items", true));
    $("#dump-items").on("click", clearSelection);
    $(".data-panel .bottom-sec button").on("click", submitSelection);
});