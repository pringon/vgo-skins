$(document).ready(function() {
    $(".coin-flip-score .action-panel .bg-blue").on("click", function() {
        
        $.ajax({
            url: "/user/items",
            success: items => {
                console.log(items);
                listModalItems(items, (totalMoneyGambled, userStakeInPot, potTotal) => {

                }, (totalMoneyGambled, userItemsInPot, potTotal) => {
                    
                });
            }
        })
    });
});