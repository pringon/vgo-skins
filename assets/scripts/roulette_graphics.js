"use strict";

function getTotal(stakesList) {
    let myTotal = 0;
    for (let j = 0; j < stakesList.length; j++) {
        myTotal += stakesList[j].stake;
    }
    return myTotal;
}

function listUsers(stakesList) {

    let usersList = document.createDocumentFragment()

    for(let i = stakesList.length-1; i >= 0; i--) {

        let user = document.createElement("li");
        user.innerHTML = `<b>${stakesList[i].user}: ${stakesList[i].stake}</b>`;
        user.style.color = stakesList[i].color;
        usersList.appendChild(user);
    }

    let usersListElement = document.getElementById("users-list");
    usersListElement.innerHTML = '';
    usersListElement.appendChild(usersList);
}

function plotData(stakesList) {

    let canvas;
    let ctx;
    let lastend = 0;
    let myTotal = getTotal(stakesList);

    canvas = document.getElementById("roulette");
    ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < stakesList.length; i++) {
        ctx.fillStyle = stakesList[i].color;
        ctx.beginPath();
        ctx.moveTo(250,250);
        ctx.arc(250,250,250,lastend,lastend+
          (Math.PI*2*(stakesList[i].stake/myTotal)),false);
        ctx.lineTo(250,250);
        ctx.fill();
        lastend += Math.PI*2*(stakesList[i].stake/myTotal);
    }
}

function listModalItems() {

    let mockImg = "https://files.opskins.media/file/vgo-img/item/dual-berettas-trigger-happy-battle-scarred-300.png";
    let mockName = "MAG-7 Gold Digger (Factory New)";
    let items = [{ id: 1, name: mockName, price: 7.13, image: { "--300px": mockImg}}, { id: 2, name: mockName, price: 3.12, image: { "--300px": mockImg}},
    { id: 3, name: mockName, price: 1.27, image: { "--300px": mockImg}}, { id: 4, name: mockName, price: 2.32, image: { "--300px": mockImg}},
    { id: 5, name: mockName, price: 15.73, image: { "--300px": mockImg}}, { id: 6, name: mockName, price: 7.14, image: { "--300px": mockImg}},
    { id: 7, name: mockName, price: 9.23, image: { "--300px": mockImg}}, { id: 8, name: mockName, price: 3.14, image: { "--300px": mockImg}}];

    let itemsList = document.createDocumentFragment();

    for(let item of items) {

        let itemContainer = document.createElement("div");
        itemContainer.className = "modal-item-container";

        let itemImage = document.createElement("img");
        itemImage.id = item.id;
        itemImage.className = "modal-item-image";
        itemImage.src = item.image["--300px"];
        itemImage.onclick = selectItem;

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
}

function refreshScreen(stakesList) {
    
    plotData(stakesList);
    listUsers(stakesList);
}

$(document).ready(function() {

    $("#roulette-bet > button").on("click", () => {
        listModalItems();
    })
});