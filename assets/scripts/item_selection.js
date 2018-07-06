"use strict";
let currentSelectedItems = {};
let currentMoneyGambled = {};
let selectedItems = {};
let totalMoneyGambled = 0;

function selectItem(event) {
    
    let element = $(event.target);

    if(element.hasClass("selected-item")) {
    
        element.removeClass("selected-item");

        totalMoneyGambled -= selectedItems[element.attr("id")];
        delete selectedItems[element.attr("id")];

        $("#total-gambled").text(`Total: ${totalMoneyGambled.toFixed(2)}$`);
    } else {
    
        element.addClass("selected-item");

        selectedItems[element.attr("id")] = parseFloat(element.next().text());
        totalMoneyGambled += selectedItems[element.attr("id")];

        $("#total-gambled").text(`Total: ${totalMoneyGambled.toFixed(2)}$`);
    }

    if(Object.keys(selectedItems).length !== 0 && selectedItems.constructor === Object) {

        $(".modal-footer > button").addClass("btn-info");
        $(".modal-footer > button").removeClass("btn-basic");
        $(".modal-footer > button").prop("disabled", false);
    } else {

        $(".modal-footer > button").addClass("btn-basic");
        $(".modal-footer > button").removeClass("btn-info");
    }
}

function submitSelection() {

    console.log(`stake is ${totalMoneyGambled}`);
    socket.emit("items gambled", totalMoneyGambled.toFixed(2));
    currentSelectedItems = selectedItems;
    currentMoneyGambled = totalMoneyGambled;
}

function clearSelection() {

    selectedItems = {};
    totalMoneyGambled = 0;
    $("#total-gambled").text("Total: 0.00$");
}