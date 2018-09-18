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
            itemCode.textContent = getItemWearCode(item.wear);

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
            bottomSection.textContent = getItemShortName(item.name);


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
 * A function that takes the id of the lobby and the items deposited and populates the item gallery of the lobby
 * @method populateCoinflipLobbyGallery
 * @param {int} lobbyId 
 * @param {Array} items 
 */
function populateCoinflipLobbyGallery(coinflipLobbies) {

    let coinflipLobbiesHolder = document.createDocumentFragment();
    let coinflipTotalStake = 0.0;

    coinflipLobbies.forEach(lobby => {
        
        let coinflipLobby = document.createElement("div");
        coinflipLobby.setAttribute("id", `lobby-${lobby.id}`);
        coinflipLobby.setAttribute("class", "item");

        let playersColumn = document.createElement("div");
        playersColumn.setAttribute("class", "player-vs");

        let hostPlayerLink = document.createElement('a');
        hostPlayerLink.setAttribute("class", "avatar rounded-circle");
        hostPlayerLink.setAttribute("href", `/user/profile/${lobby.host.id}`);
        let hostPlayerImage = document.createElement("img");
        hostPlayerImage.setAttribute("class", "rounded-circle");
        hostPlayerImage.setAttribute("src", lobby.host.avatar);
        hostPlayerLink.appendChild(hostPlayerImage);

        let delimiterSpan = document.createElement("span");
        delimiterSpan.setAttribute("class", "vs rounded-circle");
        delimiterSpan.textContent = "v/s";

        let challengerPlayerLink = document.createElement("div");
        challengerPlayerLink.setAttribute("class", "avatar rounded-circle");
        let challengerPlayerImage = document.createElement("img");
        challengerPlayerImage.setAttribute("class", "rounded-circle");
        if(lobby.challenger) {
            challengerPlayerLink.setAttribute("href", `/user/profile/${lobby.challenger.id}`);
            challengerPlayerImage.setAttribute("src", lobby.challenger.avatar);
        } else {
            challengerPlayerLink.setAttribute("href", '#');
            challengerPlayerImage.setAttribute("src", `/img/coin-${(lobby.host.coinColor == 'red') ? 'blue' : 'red'}.png`);
        }
        challengerPlayerLink.appendChild(challengerPlayerImage);

        let lobbyStakeHolder = document.createElement("div");
        lobbyStakeHolder.setAttribute("class", "amount");
        let lobbyStake = document.createElement("span");
        lobbyStake.setAttribute("class", "badge");
        if(lobby.challenger) {
            coinflipTotalStake += parseFloat(lobby.host.total) + parseFloat(lobby.challenger.total);
            lobbyStake.textContent = (parseFloat(lobby.host.total) + parseFloat(lobby.challenger.total)).toFixed(2);
        } else {
            coinflipTotalStake += parseFloat(lobby.host.total);
            lobbyStake.textContent = parseFloat(lobby.host.total).toFixed(2);
        }
        lobbyStakeHolder.appendChild(lobbyStake);

        playersColumn.appendChild(hostPlayerLink);
        playersColumn.appendChild(delimiterSpan);
        playersColumn.appendChild(challengerPlayerLink);
        playersColumn.appendChild(lobbyStakeHolder);

        let actionColumn = document.createElement("div");
        actionColumn.setAttribute("class", "action-col");

        if(lobby.host.id !== /[^/]*$/.exec(document.getElementsByClassName("profile-panel")[0].href)[0]) {
            let joinLink = document.createElement('a');
            joinLink.setAttribute("href", "javascript:void(0)");
            joinLink.setAttribute("onclick", `joinCoinflipHandler(${lobby.id})`);
            joinLink.setAttribute("data-toggle", "modal");
            joinLink.setAttribute("data-target", ".coinFlipJoinModal");
            joinLink.setAttribute("class", "btn bg-green");

            let joinImage = document.createElement('i');
            joinImage.setAttribute("class", "fa fa-link");
            let joinText = document.createElement("span");
            joinText.setAttribute("class", "text");
            joinText.textContent = "Join";

            joinLink.appendChild(joinImage);
            joinLink.appendChild(joinText);
            actionColumn.appendChild(joinLink);
        }

        let viewLink = document.createElement('a');
        viewLink.setAttribute("onclick", `handleViewModal(${lobby.id})`);
        viewLink.setAttribute("href", "javascript:void(0)");
        viewLink.setAttribute("data-toggle", "modal");
        viewLink.setAttribute("data-target", ".coinFlipModal");
        viewLink.setAttribute("class", "btn bg-gray");

        let viewImage = document.createElement('i');
        viewImage.setAttribute("class", "fa fa-eye");
        let viewText = document.createElement("span");
        viewText.setAttribute("class", "text");
        viewText.textContent = "View";

        viewLink.appendChild(viewImage);
        viewLink.appendChild(viewText);
        actionColumn.appendChild(viewLink);

        let skinsColumn = document.createElement("div");
        skinsColumn.setAttribute("class", "skins-col");
        let skinsGallery = document.createElement("div");
        skinsGallery.setAttribute("class", "gallery js-flickity skins-list");
        skinsGallery.setAttribute("data-flickity", '{ "freeScroll": true, "contain": true, "prevNextButtons": true, "pageDots": false }');
        
        lobby.host.items.concat((lobby.challenger) ? lobby.challenger.items : []).forEach(item => {
            
            let skinCell = document.createElement("div");
            skinCell.setAttribute("class", "gallery-cell skin-item");

            if(item.wear !== null) {
                let itemWear = document.createElement("div");
                itemWear.setAttribute("class", "code");
                itemWear.textContent = getItemWearCode(item.wear);
                skinCell.appendChild(itemWear);
            }

            let midSection = document.createElement("div");
            midSection.setAttribute("class", "mid-sec");
            let skinImage = document.createElement("img");
            skinImage.setAttribute("src", item.image['300px']);
            midSection.appendChild(skinImage);

            let bottomSection = document.createElement("div");
            bottomSection.setAttribute("class", "bottom-sec");
            bottomSection.textContent = `$${(parseFloat(item.suggested_price)/100).toFixed(2)}`;

            skinCell.appendChild(midSection);
            skinCell.appendChild(bottomSection);
            skinsGallery.appendChild(skinCell);
        });
        skinsColumn.appendChild(skinsGallery);

        coinflipLobby.appendChild(playersColumn);
        coinflipLobby.appendChild(actionColumn);
        coinflipLobby.appendChild(skinsColumn);
        coinflipLobbiesHolder.appendChild(coinflipLobby);
    });

    let coinflipLobbiesElement = document.getElementsByClassName("coin-players-list")[0];
    coinflipLobbiesElement.innerHTML = '';
    coinflipLobbiesElement.appendChild(coinflipLobbiesHolder);
    $(".gallery").flickity();
    $("#coinflip-total-stake").text(`$${coinflipTotalStake.toFixed(2)}`);
    $("#coinflip-lobby-count").text(coinflipLobbies.length);
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
 * @method renderViewModal
 * @param {Object} lobby object containing the data to be displayed in the modal 
 */
function renderViewModal(lobby) {
    console.log(lobby);
    $("#lobby-title").text(`Lobby ID: ${lobby.id}`);

    if(window.location.pathname == "/games/coinflip/history") {
        if(lobby.host.usedId == lobby.winner) {
            coinflipTossAnimation("host", lobby.host.coinColor);
        } else {
            coinflipTossAnimation("challenger", lobby.challenger.coinColor);
        }
    }

    $("#coinFlipPlayer1 img.rounded-circle").attr("src", lobby.host.avatar);
    $(".player-left .coin img").attr("src", `/img/coin-${lobby.host.coinColor}.png`);
    $(".player-left span.name").text(lobby.host.name);

    let challengerCoinColor = lobby.host.coinColor == "blue" ? "red" : "blue";
    if(lobby.challenger) {
        $("#coinFlipPlayer2 img.rounded-circle").attr("src", lobby.challenger.avatar);
        $(".player-right .coin img").attr("src", `/img/coin-${challengerCoinColor}.png`);
        $(".player-right span.name").text(lobby.challenger.name);
    } else {
        $("#coinFlipPlayer2 img").attr("src", `/img/coin-${challengerCoinColor}.png`);
        $(".player-right .coin img").attr("src", `/img/coin-${challengerCoinColor}.png`);
        $(".player-right span.name").text("Challenger awaited");
    }

    if(typeof lobby.host.items == "string") {
        lobby.host.items = JSON.parse(lobby.host.items);
    }
    if(typeof lobby.challenger !== "undefined" && typeof lobby.challenger.items == "string") {
        lobby.challenger.items = JSON.parse(lobby.challenger.items);
    }

    let hostItemsColumn = document.getElementsByClassName("card-header")[0];
    hostItemsColumn.childNodes[1].innerHTML = `<label>Items:</label> ${lobby.host.items.length}`;
    hostItemsColumn.childNodes[3].innerHTML = `<label>Value:</label> $${lobby.host.total}`;

    let itemsHolder = document.createDocumentFragment();
    lobby.host.items.forEach(item => {

        let itemRow = document.createElement("tr");
        
        let itemImageHolder = document.createElement("td");
        let itemImage = document.createElement("img");
        itemImage.setAttribute("src", item.image["300px"]);
        itemImageHolder.appendChild(itemImage);

        let itemDataHolder = document.createElement("td");
        let itemTitle = document.createElement("span");
        itemTitle.setAttribute("class", "title");
        itemTitle.textContent = getItemShortName(item.name);
        let itemDescription = document.createElement("span");
        itemDescription.setAttribute("class", "des");
        itemDescription.textContent = item.category;
        itemDataHolder.appendChild(itemTitle);
        itemDataHolder.appendChild(itemDescription);

        let itemPriceHolder = document.createElement("td");
        let itemPrice = document.createElement("span");
        itemPrice.setAttribute("class", "amount");
        itemPrice.textContent = `$${(parseFloat(item.suggested_price)/100).toFixed(2)}`;
        itemPriceHolder.appendChild(itemPrice);

        
        itemRow.appendChild(itemImageHolder);
        itemRow.appendChild(itemDataHolder);
        itemRow.appendChild(itemPriceHolder);

        itemsHolder.appendChild(itemRow)
    });

    let itemsContainer = document.getElementsByClassName("card-body")[0].childNodes[1];
    itemsContainer.innerHTML = '';
    itemsContainer.appendChild(itemsHolder);

    if(lobby.challenger) {
        let hostItemsColumn = document.getElementsByClassName("card-header")[1];
        hostItemsColumn.childNodes[1].innerHTML = `<label>Items:</label> ${lobby.challenger.items.length}`;
        hostItemsColumn.childNodes[3].innerHTML = `<label>Value:</label> $${lobby.challenger.total}`;
    

        let itemsHolder = document.createDocumentFragment();
        lobby.challenger.items.forEach(item => {

            let itemRow = document.createElement("tr");
            
            let itemImageHolder = document.createElement("td");
            let itemImage = document.createElement("img");
            itemImage.setAttribute("src", item.image["300px"]);
            itemImageHolder.appendChild(itemImage);

            let itemDataHolder = document.createElement("td");
            let itemTitle = document.createElement("span");
            itemTitle.setAttribute("class", "title");
            itemTitle.textContent = getItemShortName(item.name);
            let itemDescription = document.createElement("span");
            itemDescription.setAttribute("class", "des");
            itemDescription.textContent = item.category;
            itemDataHolder.appendChild(itemTitle);
            itemDataHolder.appendChild(itemDescription);

            let itemPriceHolder = document.createElement("td");
            let itemPrice = document.createElement("span");
            itemPrice.setAttribute("class", "amount");
            itemPrice.textContent = `$${(parseFloat(item.suggested_price)/100).toFixed(2)}`;
            itemPriceHolder.appendChild(itemPrice);

            
            itemRow.appendChild(itemImageHolder);
            itemRow.appendChild(itemDataHolder);
            itemRow.appendChild(itemPriceHolder);

            itemsHolder.appendChild(itemRow)
        });

        let itemsContainer = document.getElementsByClassName("card-body")[1].childNodes[1];
        itemsContainer.innerHTML = '';
        itemsContainer.appendChild(itemsHolder);

    } else {
        let hostItemsColumn = document.getElementsByClassName("card-header")[1];
        hostItemsColumn.childNodes[1].innerHTML = "<label>Items:</label> 0";
        hostItemsColumn.childNodes[3].innerHTML = "<label>Value:</label> $0.00";

        let itemsContainer = document.getElementsByClassName("card-body")[1].childNodes[1];
        itemsContainer.innerHTML = '';
    
    }
}

/**
 * A function that fetches the items owned by the player and lists them in the bet items modal
 * @method listModalItems
 */
function listModalItems({ availableItems = [], gambledItems = [] } = {}, playerStake = {}, dataUpdateHandler = null, cb = null) {

    itemSelection.setPlayerStake(playerStake);

    userStakeInPot = getTotal(gambledItems, "suggested_price")/100;
    userItemsInPot = gambledItems.length;

    let itemsList = document.createDocumentFragment();

    let itemsRow = document.createElement("div");
    itemsRow.setAttribute("class", "row");
    let columnIndex = 0;

    for(let item of gambledItems) {

        let itemContainer = document.createElement("div");
        itemContainer.setAttribute("class", "col gambling-selection-item selected-item");
        itemContainer.setAttribute("id", item.id);

        let itemHolder = document.createElement("div");
        itemHolder.setAttribute("class", "skin-item");

        let topSection = document.createElement("div");
        topSection.setAttribute("class", "top-sec");
        let itemCode = document.createElement("span");
        itemCode.setAttribute("class", "code");
        itemCode.textContent = getItemWearCode(item.wear);
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
        bottomSection.textContent = getItemShortName(item.name);
        
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

        let itemContainer = document.createElement("div");
        itemContainer.setAttribute("class", "ungambled-item gambling-selection-item col");
        itemContainer.setAttribute("id", item.id);
        itemContainer.onclick = itemSelection.selectItem(dataUpdateHandler);

        let itemHolder = document.createElement("div");
        itemHolder.setAttribute("class", "skin-item");

        let topSection = document.createElement("div");
        topSection.setAttribute("class", "top-sec");
        let itemCode = document.createElement("span");
        itemCode.setAttribute("class", "code");
        itemCode.textContent = getItemWearCode(item.wear);
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
        bottomSection.textContent = getItemShortName(item.name);
        
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

    if(dataUpdateHandler !== null) {
        dataUpdateHandler(playerStake);
    }

    if(cb !== null) {
        cb(null);
    }
}

/**
 * A function that calls the plotData and listUsers functions
 * @method refreshScreen
 * @param {Array} stakesList is an array containing the current round's bets
 */
function refreshScreen(stakesList) {
    
    plotData(stakesList);
    listUsers(stakesList);
    populateItemsGallery(stakesList);
}