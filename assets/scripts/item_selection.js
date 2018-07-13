"use strict";
let currentSelectedItems = {};
let currentMoneyGambled = 0;
let selectedItems = {};
let totalMoneyGambled = 0;

function selectItem() {
    
    let element = $(this);

    if(element.hasClass("selected-item")) {
    
        element.removeClass("selected-item");

        totalMoneyGambled -= selectedItems[element.attr("id")];
        delete selectedItems[element.attr("id")];
    } else {
    
        element.addClass("selected-item");

        selectedItems[element.attr("id")] = parseFloat(element.get(0).childNodes[0].childNodes[0].childNodes[1].innerText.substr(1));
        totalMoneyGambled += selectedItems[element.attr("id")];
    }
    $(".modal-content .row .score-panel .item .score:eq(1)").text(`$${totalMoneyGambled.toFixed(2)}`);
    $(".data-panel .bottom-sec button").text(`Deposit $${totalMoneyGambled.toFixed(2)} (0 Skins)`);
    $(".modal-content .row .score-panel .item .score:eq(0)").text(`(${Object.keys(selectedItems).length}/20)`);

    if(Object.keys(selectedItems).length !== 0 && selectedItems.constructor === Object) {

        //$(".data-panel .bottom-sec button").addClass("btn-info");
        //$(".data-panel .bottom-sec button").removeClass("btn-basic");
        $(".data-panel .bottom-sec button").prop("disabled", false);
    } else {

        //$(".data-panel .bottom-sec button").addClass("btn-basic");
        //$(".data-panel .bottom-sec button").removeClass("btn-info");
        $(".data-panel .bottom-sec button").prop("disabled", true);
    }
}

function submitSelection() {

    document.getElementsByClassName("score")[1].innerHTML = `<small>$</small>${totalMoneyGambled.toFixed(2)}`;
    currentSelectedItems = Object.assign({}, selectedItems);
    currentMoneyGambled = totalMoneyGambled;
    socket.emit("items gambled", totalMoneyGambled.toFixed(2));
}

function clearSelection() {

    for(let item in selectedItems) {
        delete selectedItems[item];
    }
    totalMoneyGambled = 0;
    $(".modal-content .row .score-panel .item .score:eq(1)").text(`$${currentMoneyGambled.toFixed(2)}`);
    $(".data-panel .bottom-sec button").text(`Deposit $${currentMoneyGambled.toFixed(2)} (0 Skins)`);
}