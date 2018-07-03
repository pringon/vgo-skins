"use strict";
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
}