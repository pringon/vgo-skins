let currentSelectedItems = {};
let currentMoneyGambled = 0;
let selectedItems = {};
let totalMoneyGambled = 0;
let userStakeInPot = 0;
let userItemsInPot = 0;
let potTotal = 0;

function selectItem(dataUpdateHandler) {

    return function() {

        let element = $(this);
        if(element.hasClass("selected-item")) {
        
            element.removeClass("selected-item");

            totalMoneyGambled -= selectedItems[element.attr("id")].price;
            delete selectedItems[element.attr("id")];
        } else {
        
            element.addClass("selected-item");

            selectedItems[element.attr("id")] = {
                price: parseFloat(element.get(0).childNodes[0].childNodes[0].childNodes[1].innerText.substr(1)),
                name: element.get(0).childNodes[0].childNodes[2].innerText,
                image: element.get(0).childNodes[0].childNodes[1].childNodes[0].src
            };
            totalMoneyGambled += selectedItems[element.attr("id")].price;
        }
        dataUpdateHandler(totalMoneyGambled, userItemsInPot, potTotal);

        if(Object.keys(selectedItems).length !== 0 && selectedItems.constructor === Object) {

            //$(".data-panel .bottom-sec button").addClass("btn-info");
            //$(".data-panel .bottom-sec button").removeClass("btn-basic");
            $(".data-panel .bottom-sec button").prop("disabled", false);
        } else {

            //$(".data-panel .bottom-sec button").addClass("btn-basic");
            //$(".data-panel .bottom-sec button").removeClass("btn-info");
            $(".data-panel .bottom-sec button").prop("disabled", true);
        }
    };
}

function submitSelection() {

    let gambledItems = [];
    for(let item in selectedItems) {
        if(selectedItems.hasOwnProperty(item)) {
            gambledItems.push({ id: item, ...selectedItems[item] });
        }
    }

    // fetch(`/games/roulette/plant/${gambledItems.map(item => item.id)}`, {
    //     method: "POST",
    //     headers: {
    //         "Accept": "application/json"
    //     }
    // }).then(res => res.json())
    // .then(res => {
    //     tradePopup = window.open(`https://trade.opskins.com/trade-offers/${res.tradeId}`,"_blank");
    //     tradePopup.focus();
        
    //     selectedItems = {};
    //     totalMoneyGambled = 0;
    // });
    let tradePopup = window.open('', "_blank");
    $.ajax({
        url: `/games/roulette/plant/${gambledItems.map(item => item.id)}`,
        method: "POST",
        success: function(res) {
            if(res.err) {
                console.log(res.err.message);
                tradePopup.close();
                $("#wrong-stake-amount-flash").show();
                console.log("Flash message shown");
                setTimeout(function() {
                    $("#wrong-stake-amount-flash").hide();
                    console.log("Flash message hidden");
                }, 4000);
                return;
            }
            
            console.log(window);
            tradePopup.location = `https://trade.opskins.com/trade-offers/${res.tradeId}`;
            tradePopup.focus();
            
            selectedItems = {};
            totalMoneyGambled = 0;
        }
    });
}

function clearSelection() {

    selectedItems = {};
    totalMoneyGambled = 0;
    let items = document.getElementsByClassName("ungambled-item");
    for(let item of items) {
        item.setAttribute("class", "ungambled-item gambling-selection-item col");
    }
    $(".modal-content .row .score-panel .item .score:eq(0)").text(`(0/20)`);
    $(".modal-content .row .score-panel .item .score:eq(1)").text(`$0.00`);
    $(".modal-content .row .score-panel .item .score:eq(3)").text(`0.00%`);
    $(".data-panel .bottom-sec button").text(`Deposit $0.00 (0 Skins)`);
    $(".data-panel .bottom-sec button").prop("disabled", true);
}