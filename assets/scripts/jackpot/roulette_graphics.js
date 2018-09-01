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
            success: items => {
                console.log(items);
                listModalItems(items, (totalMoneyGambled, userItemsInPot, potTotal) => {

                    $(".modal-content .row .score-panel .item .score:eq(1)").text(`$${totalMoneyGambled.toFixed(2)}`);
                    $(".data-panel .bottom-sec button").text(`Deposit $${totalMoneyGambled.toFixed(2)} (${Object.keys(selectedItems).length} Skins)`);
                    $(".modal-content .row .score-panel .item .score:eq(0)").text(`(${Object.keys(selectedItems).length + userItemsInPot}/20)`);
                    $(".modal-content .row .score-panel .item .score:eq(2)").text(`$${potTotal.toFixed(2)}`);
                    $(".modal-content .row .score-panel .item .score:eq(3)").text(`${(totalMoneyGambled/(potTotal+totalMoneyGambled-userStakeInPot)*100).toFixed(2)}%`);
                },  (totalMoneyGambled, userStakeInPot, potTotal) => {
                    $(".data-panel .bottom-sec button").text(`Deposit $${totalMoneyGambled.toFixed(2)} (0 Skins)`);
                    $(".modal-content .row .score-panel .item .score:eq(0)").text(`(${userItemsInPot}/20)`);
                    $(".modal-content .row .score-panel .item .score:eq(1)").text(`$${totalMoneyGambled.toFixed(2)}`);
                    $(".modal-content .row .score-panel .item .score:eq(3)").text(`${(totalMoneyGambled/(potTotal+totalMoneyGambled-userStakeInPot)*100).toFixed(2)}%`);                
                });
            }
        });
    });
    $("#dump-items").on("click", clearSelection);
    $(".data-panel .bottom-sec button").on("click", submitSelection);
});