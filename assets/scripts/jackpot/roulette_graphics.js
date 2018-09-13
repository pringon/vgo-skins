const jackpotTiers = ["plant", "coal", "diamond"];

const playerStake = {
    selectedItems: new Set(),
    totalMoneyGambled: 0
};

function handleSelectionModal() {

    $.ajax({
        url: `/games/roulette/${rouletteTier}/items`,
        success: items => {
            playerStake.selectedItems.clear();
            playerStake.totalMoneyGambled = 0;

            listModalItems(items, playerStake, () => {

                $(".modal-content .row .score-panel .item .score:eq(1)").text(`$${playerStake.totalMoneyGambled.toFixed(2)}`);
                $(".data-panel .bottom-sec button").text(`Deposit $${playerStake.totalMoneyGambled.toFixed(2)} (${playerStake.selectedItems.size} Skins)`);
                $(".modal-content .row .score-panel .item .score:eq(0)").text(`(${playerStake.selectedItems.size + items.gambledItems.length}/20)`);
                $(".modal-content .row .score-panel .item .score:eq(2)").text(`$${potTotal.toFixed(2)}`);
                $(".modal-content .row .score-panel .item .score:eq(3)").text(`${(playerStake.totalMoneyGambled/(potTotal+playerStake.totalMoneyGambled-getTotal(items.gambledItems, "suggested_price")/100)*100).toFixed(2)}%`);
                $(".data-panel .bottom-sec button").text(`Deposit $${playerStake.totalMoneyGambled.toFixed(2)} (0 Skins)`);
            });
        }
    });
}

$(document).ready(function() {
    $(".jackpot-btn button").on("click", handleSelectionModal);
    $("#dump-items").on("click", itemSelection.clearSelection(() => {
        $(".modal-content .row .score-panel .item .score:eq(0)").text(`(0/20)`);
        $(".modal-content .row .score-panel .item .score:eq(1)").text(`$0.00`);
        $(".modal-content .row .score-panel .item .score:eq(3)").text(`0.00%`);
        $(".data-panel .bottom-sec button").text(`Deposit $0.00 (0 Skins)`);
        $(".data-panel .bottom-sec button").prop("disabled", true);
    }));
    $(".data-panel .bottom-sec button").on("click", () => {
        itemSelection.submitSelection(`/games/roulette/${jackpotTiers[rouletteTier]}`);
    });
});