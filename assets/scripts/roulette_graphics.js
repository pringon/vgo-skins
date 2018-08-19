/**
 * A function that takes all the bets from the current round and returns the total sum of money bet
 * @method getTotal
 * @param {Array} stakesList is an array containing the current round's bets
 * @param {String} att is the object attribute to be summed up
 * @return {int} the total amount of money that was bet this round
 */
function getTotal(stakesList, att = "total") {
    let myTotal = 0;
    for (let j = 0; j < stakesList.length; j++) {
        myTotal += parseFloat(stakesList[j][att]);
    }
    return myTotal;
}

/**
 * A function that takes the users that bet this round and lists them on the screen
 * @method listUsers
 * @param {Array} stakesList is an array containing the current round's bets
 */
function listUsers(stakesList) {

    stakesList.sort((a, b) => a.total - b.total);

    let total = getTotal(stakesList);
    $(".jackpot-score > .amount").text(`$${total.toFixed(2)}`);
    Array.from(document.getElementsByClassName("score")).slice(-5)[2].textContent = `$${total.toFixed(2)}`;

    document.getElementsByClassName("score")[3].textContent = stakesList.length;
    

    let usersList = document.createDocumentFragment();

    for(let i = stakesList.length-1; i >= 0; i--) {

        if(stakesList[i].id == currentUserData.steamId) {
            document.getElementsByClassName("score")[0].innerHTML = `${(parseFloat(stakesList[i].total)/total*100).toFixed(2)}<small>%</small>`;        
            document.getElementsByClassName("score")[1].innerHTML = `<small>$</small>${parseFloat(stakesList[i].total).toFixed(2)}`;
     
        }

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
        playerItemCount.textContent = `(${stakesList[i].items.length} Items)`;
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

            let wearCode = '';
            if(item.wear == null) {
                wearCode = '';
            } else if(item.wear < 0.07) {
                wearCode = "FN";
            } else if(item.wear < 0.15) {
                wearCode = "MW";
            } else if(item.wear < 0.37) {
                wearCode = "FT";
            } else if(item.wear < 0.44) {
                wearCode = "WW";
            } else {
                wearCode = "BS";
            }

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
            itemCode.textContent = wearCode;

            let itemPrice = document.createElement("span");
            itemPrice.setAttribute("class", "amount");
            itemPrice.textContent = `$${(parseFloat(item.suggested_price)/100).toFixed(2)}`;

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
            bottomSection.textContent = item.name.indexOf('|') !== -1 ?
                                            item.name.substring(item.name.indexOf('|')+1, item.name.indexOf('(')) :
                                            item.name;


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
    $(".gallery").flickity("reloadCells");
}

/**
 * A function that takes up to 5 of the latest jackpot rounds and showcases them at the bottom of the page
 * @method populateJackpotHistory
 * @param {Array} jackpotHistory 
 */
function populateJackpotHistory(jackpotHistory) {

    let jackpotRounds = document.createDocumentFragment();

    jackpotHistory.forEach(jackpotEntry => {

        let roundPanel = document.createElement("div");
        roundPanel.setAttribute("class", "panel rounded");


        let playerList = document.createElement("div");
        playerList.setAttribute("class", "player-list");


        let winnerInfo = document.createElement("div");
        winnerInfo.setAttribute("class", "winner-info rounded");
        
        
        let avatarDiv = document.createElement("div");
        avatarDiv.setAttribute("class", "avatar rounded-circle");
        let avatarLink = document.createElement('a');
        avatarLink.setAttribute("href", `/user/profile/${jackpotEntry.winner.id}`);
        let avatarImage = document.createElement("img");
        avatarImage.setAttribute("src", jackpotEntry.winner.avatar);
        avatarImage.setAttribute("class", "rounded-circle");
        avatarLink.appendChild(avatarImage);
        avatarDiv.appendChild(avatarLink);
        
        let playerInfoDiv = document.createElement("div");
        playerInfoDiv.setAttribute("class", "info");
        
        let playerNameDiv = document.createElement("div");
        playerNameDiv.setAttribute("class", "name");
        playerNameDiv.textContent = jackpotEntry.winner.name;
        let playerPrizeDiv = document.createElement("div");
        playerPrizeDiv.setAttribute("class", "score");
        playerPrizeDiv.innerHTML = `<label>Win: </label> $${(parseFloat(jackpotEntry.total)/100).toFixed(2)}`
        let playerWinChanceDiv = document.createElement("div");
        playerWinChanceDiv.setAttribute("class", "score");
        playerWinChanceDiv.innerHTML = `<label>Chance: </label> ${(parseFloat(jackpotEntry.winner.total)*100/parseFloat(jackpotEntry.total)/100).toFixed(2)}%`;

        playerInfoDiv.appendChild(playerNameDiv);
        playerInfoDiv.appendChild(playerPrizeDiv);
        playerInfoDiv.appendChild(playerWinChanceDiv);

        winnerInfo.appendChild(avatarDiv);
        winnerInfo.appendChild(playerInfoDiv);

        playerList.appendChild(winnerInfo);

        let losingPlayersList = document.createElement("ul");
        jackpotEntry.stakes.forEach(stake => {

            if(stake.userId != jackpotEntry.winner.id) {
                
                let losingPlayer = document.createElement("li");

                let losingPlayerAvatarLink = document.createElement("a");
                losingPlayerAvatarLink.setAttribute("href", `/user/profile/${stake.userId}`);
                losingPlayerAvatarLink.setAttribute("class", "rounded");

                let losingPlayerAvatar = document.createElement("span");
                losingPlayerAvatar.setAttribute("class", "avatar");

                losingPlayerAvatarImage = document.createElement("img");
                losingPlayerAvatarImage.setAttribute("src", stake.userData.avatar);
                losingPlayerWinChance = document.createElement("span");
                losingPlayerWinChance.setAttribute("class", "score");
                losingPlayerWinChance.textContent = `${(parseFloat(stake.total)*100/(parseFloat(jackpotEntry.total)/100)).toFixed(2)}%`;
            
                losingPlayerAvatar.appendChild(losingPlayerAvatarImage);
                losingPlayerAvatar.appendChild(losingPlayerWinChance);
                losingPlayerAvatarLink.appendChild(losingPlayerAvatar);
                losingPlayer.appendChild(losingPlayerAvatarLink);
                losingPlayersList.appendChild(losingPlayer);
            }
        });

        let prizePotDiv = document.createElement("div");
        prizePotDiv.setAttribute("class", "winning-items rounded");
        let prizePotDivTitle = document.createElement("div");
        prizePotDivTitle.setAttribute("class", "title");
        prizePotDiv.appendChild(prizePotDivTitle);
        let prizePotList = document.createElement("ul");
        jackpotEntry.stakes.forEach(stake => {
            stake.items.forEach(item => {

                let prizePotItem = document.createElement("li");
                prizePotItem.setAttribute("class", "skin-item rounded");

                let topSection = document.createElement("div");
                topSection.setAttribute("class", "top-sec");
                let itemWearCode = document.createElement("span");
                itemWearCode.setAttribute("class", "code");
                itemWearCode.textContent = item.wear;
                let itemPrice = document.createElement("span");
                itemPrice.setAttribute("class", "amount");
                itemPrice.textContent = `$${(parseFloat(item.suggested_price)/100).toFixed(2)}`;
                topSection.appendChild(itemWearCode);
                topSection.appendChild(itemPrice);
            
                let midSection = document.createElement("div");
                midSection.setAttribute("class", "mid-sec");
                let itemImage = document.createElement("img");
                itemImage.setAttribute("src", item.image["300px"]);
                midSection.appendChild(itemImage);

                let bottomSection = document.createElement("div");
                bottomSection.setAttribute("class", "bottom-sec");
                bottomSection.textContent = item.name;

                prizePotItem.appendChild(topSection);
                prizePotItem.appendChild(midSection);
                prizePotItem.appendChild(bottomSection);

                prizePotList.appendChild(prizePotItem);
            });
        });
        prizePotDiv.appendChild(prizePotList);

        roundPanel.appendChild(playerList);
        roundPanel.appendChild(losingPlayersList);
        roundPanel.appendChild(prizePotDiv);

        jackpotRounds.appendChild(roundPanel);
    });

    let roundPanelContainer = document.getElementsByClassName("winners-history-panel")[0];
    roundPanelContainer.innerHTML = '';
    roundPanelContainer.appendChild(jackpotRounds);
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
    totalMoneyGambled = 0;
    userStakeInPot = getTotal(gambledItems, "suggested_price")/100;
    userItemsInPot = gambledItems.length;

    /*selectedItems = currentSelectedItems ? Object.assign({}, currentSelectedItems) : {};
    totalMoneyGambled = currentMoneyGambled ? currentMoneyGambled : 0;*/

    let itemsList = document.createDocumentFragment();

    let itemsRow = document.createElement("div");
    itemsRow.setAttribute("class", "row");
    let columnIndex = 0;

    for(let item of gambledItems) {

        let wearCode = '';
        if(item.wear == null) {
            wearCode = '';
        } else if(item.wear < 0.07) {
            wearCode = "FN";
        } else if(item.wear < 0.15) {
            wearCode = "MW";
        } else if(item.wear < 0.37) {
            wearCode = "FT";
        } else if(item.wear < 0.44) {
            wearCode = "WW";
        } else {
            wearCode = "BS";
        }

        let itemContainer = document.createElement("div");

        itemContainer.setAttribute("class", "col gambling-selection-item selected-item");

        itemContainer.setAttribute("id", item.id);
        let itemHolder = document.createElement("div");
        itemHolder.setAttribute("class", "skin-item");

        let topSection = document.createElement("div");
        topSection.setAttribute("class", "top-sec");
        let itemCode = document.createElement("span");
        itemCode.setAttribute("class", "code");
        itemCode.textContent = wearCode;
        let itemPrice = document.createElement("span");
        itemPrice.setAttribute("class", "amount");
        itemPrice.textContent = `$${(parseFloat(item.suggested_price)/100).toFixed(2)}`;
        topSection.appendChild(itemCode);
        topSection.appendChild(itemPrice);

        let midSection = document.createElement("div");
        midSection.setAttribute("class", "mid-sec");
        let itemImage = document.createElement("img");
        itemImage.setAttribute("src", item.image["300px"]);
        midSection.appendChild(itemImage);

        let bottomSection = document.createElement("div");
        bottomSection.setAttribute("class", "bottom-sec");
        bottomSection.textContent = item.name.indexOf('|') !== -1 ?
                                            item.name.substring(item.name.indexOf('|')+1, item.name.indexOf('(')) :
                                            item.name;
        
        itemHolder.appendChild(topSection);
        itemHolder.appendChild(midSection);
        itemHolder.appendChild(bottomSection);
        itemContainer.appendChild(itemHolder);
        itemsRow.appendChild(itemContainer);

        columnIndex++;
        if(columnIndex == 4) {
            itemsList.appendChild(itemsRow);
            itemsRow = document.createElement("div");
            itemsRow.setAttribute("class", "row");
            columnIndex = 0;
        }
    }

    for(let item of availableItems) {

        let wearCode = '';
        if(item.wear == null) {
            wearCode = '';
        } else if(item.wear < 0.07) {
            wearCode = "FN";
        } else if(item.wear < 0.15) {
            wearCode = "MW";
        } else if(item.wear < 0.37) {
            wearCode = "FT";
        } else if(item.wear < 0.44) {
            wearCode = "WW";
        } else {
            wearCode = "BS";
        }

        let itemContainer = document.createElement("div");

        itemContainer.setAttribute("class", "ungambled-item gambling-selection-item col");

        itemContainer.setAttribute("id", item.id);
        itemContainer.onclick = selectItem;
        let itemHolder = document.createElement("div");
        itemHolder.setAttribute("class", "skin-item");

        let topSection = document.createElement("div");
        topSection.setAttribute("class", "top-sec");
        let itemCode = document.createElement("span");
        itemCode.setAttribute("class", "code");
        itemCode.textContent = wearCode;
        let itemPrice = document.createElement("span");
        itemPrice.setAttribute("class", "amount");
        itemPrice.textContent = `$${(parseFloat(item.suggested_price)/100).toFixed(2)}`;
        topSection.appendChild(itemCode);
        topSection.appendChild(itemPrice);

        let midSection = document.createElement("div");
        midSection.setAttribute("class", "mid-sec");
        let itemImage = document.createElement("img");
        itemImage.setAttribute("src", item.image["300px"]);
        midSection.appendChild(itemImage);

        let bottomSection = document.createElement("div");
        bottomSection.setAttribute("class", "bottom-sec");
        bottomSection.textContent = item.name.indexOf('|') !== -1 ?
                                            item.name.substring(item.name.indexOf('|')+1, item.name.indexOf('(')) :
                                            item.name;
        
        itemHolder.appendChild(topSection);
        itemHolder.appendChild(midSection);
        itemHolder.appendChild(bottomSection);
        itemContainer.appendChild(itemHolder);
        itemsRow.appendChild(itemContainer);

        columnIndex++;
        if(columnIndex == 4) {
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
    $(".data-panel .bottom-sec button").text(`Deposit $${totalMoneyGambled.toFixed(2)} (0 Skins)`);
    $(".modal-content .row .score-panel .item .score:eq(0)").text(`(${userItemsInPot}/20)`);
    $(".modal-content .row .score-panel .item .score:eq(1)").text(`$${totalMoneyGambled.toFixed(2)}`);
    $(".modal-content .row .score-panel .item .score:eq(3)").text(`${(totalMoneyGambled/(potTotal+totalMoneyGambled-userStakeInPot)*100).toFixed(2)}%`);
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

    $(".jackpot-btn > button").on("click", () => {
    
        // console.log("intra");
        // fetch(`/user/items`, {
        //     headers: {
        //         "Accept": "application/json"
        //     }
        // }).then(items => items.json)
        //   .then(items => {
        //         console.log(items);
        //         listModalItems(items);
        //     });
            $.ajax({
                url: `/games/roulette/${rouletteTier}/items`,
                success: (items) => {
                    console.log(items);
                    listModalItems(items);
                }
            });
    });
    $("#dump-items").on("click", clearSelection);
    $(".data-panel .bottom-sec button").on("click", submitSelection);
});