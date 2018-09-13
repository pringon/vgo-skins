let playerStake = {};

function hostCoinflipHandler() {
    let submitButton = document.getElementById('coinflip-submit-selection');
    submitButton.textContent = 'Host Coinflip';
    submitButton.setAttribute("disabled", true);
    
    $('.your-coins').show();

    $('.modal-content .row .score-panel .item:eq(0)').hide(); 

    playerStake = {
        selectedItems: new Set(),
        totalMoneyGambled: 0,
        coinColor: "blue"
    };

    handleSelectionModal(playerStake);
}

function joinCoinflipHandler(lobbyId) {
    let submitButton = document.getElementById('coinflip-submit-selection');
    submitButton.textContent = 'Deposit';
    submitButton.setAttribute("disabled", true);

    $('.your-coins').hide();

    let lobbyStake = parseFloat($(`#lobby-${lobbyId} .player-vs .amount .badge`).text());
    let bettingMargin = lobbyStake * 0.1;
    $('.modal-content .row .score-panel .item:eq(0) .score').text(`$${(lobbyStake - bettingMargin).toFixed(2)} - $${(lobbyStake + bettingMargin).toFixed(2)}`); 
    $('.modal-content .row .score-panel .item:eq(0)').show();

    playerStake = {
        lobbyId,
        selectedItems: new Set(),
        totalMoneyGambled: 0
    };

    handleSelectionModal(playerStake);
}

function handleSelectionModal(playerStake) {

    $.ajax({
        url: "/user/items",
        success: items => {
            listModalItems(items, playerStake, () => {
                $(".modal-content .row .score-panel .item .score:eq(1)").text(`(${playerStake.selectedItems.size}/20)`);
                $(".modal-content .row .score-panel .item .score:eq(2)").text(`$${playerStake.totalMoneyGambled.toFixed(2)}`);
            });
        }
    });
}

function handleViewModal() {
    let lobbyId = this.parentNode.parentNode.id.replace("lobby-", '');
    $.ajax({
        url: `${window.location.pathname}/${lobbyId}`,
        method: "GET",
        success: renderViewModal
    });
}

$(document).ready(function() {

    $(".your-coins .rounded-circle").on("click", itemSelection.selectCoinflipColor());
    $("#dump-items").on("click", itemSelection.clearSelection(playerStake => {
        $(".modal-content .row .score-panel .item .score:eq(1)").text(`(${playerStake.selectedItems.size()}/20)`);
        $(".modal-content .row .score-panel .item .score:eq(2)").text(`$${playerStake.totalMoneyGambled.toFixed(2)}`);
    }));
    $(".data-panel .bottom-sec button").on("click", () => {
        if(document.getElementById('coinflip-submit-selection').textContent == "Host Coinflip") {
            itemSelection.submitSelection("/games/coinflip");
        } else if(document.getElementById("coinflip-submit-selection").textContent == "Deposit") {
            itemSelection.submitSelection("/games/coinflip");
        }
    });
    $("a.bg-gray").on("click", handleViewModal);
});