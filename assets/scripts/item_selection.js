const itemSelection = {

    setPlayerStake: function(playerStake) {
        this.playerStake = playerStake;
    },

    selectItem: function(dataUpdateHandler = null) {

        return function() {
            this.playerStake = playerStake;
    
            let element = $(this);
            if(element.hasClass("selected-item")) {
            
                element.removeClass("selected-item");
    
                this.playerStake.totalMoneyGambled -= parseFloat(element.get(0).childNodes[0].childNodes[0].childNodes[1].innerText.substr(1));
                delete this.playerStake.selectedItems.delete(element.attr("id"));
            } else {
            
                element.addClass("selected-item");
    
                this.playerStake.selectedItems.add(element.attr("id"));
                this.playerStake.totalMoneyGambled += parseFloat(element.get(0).childNodes[0].childNodes[0].childNodes[1].innerText.substr(1));
            }
    
            if(dataUpdateHandler !== null) {
                dataUpdateHandler(this.playerStake);
            } 
    
            if(this.playerStake.selectedItems.size > 0) {
    
                //$(".data-panel .bottom-sec button").addClass("btn-info");
                //$(".data-panel .bottom-sec button").removeClass("btn-basic");
                $(".data-panel .bottom-sec button").prop("disabled", false);
            } else {
    
                //$(".data-panel .bottom-sec button").addClass("btn-basic");
                //$(".data-panel .bottom-sec button").removeClass("btn-info");
                $(".data-panel .bottom-sec button").prop("disabled", true);
            }
        };
    },

    selectCoinflipColor: function() {

        return function() {
            this.playerStake = playerStake;

            let coin = this;
            this.playerStake.coinColor = coin.id.replace("-coin", '');
        };
    },

    submitSelection: function(requestUrl) {
        
        if(this.playerStake) {
            let gambledItems = [];
            this.playerStake.selectedItems.forEach(item => {
                gambledItems.push(item);
            });

            if(typeof this.playerStake.lobbyId !== "undefined") {
                requestUrl += `/${this.playerStake.lobbyId}`;
            }
            requestUrl += `/${gambledItems}`;
            if(this.playerStake.coinColor) {
                requestUrl += `/${this.playerStake.coinColor}`;
            }

            console.log(requestUrl);
            let tradePopup = window.open('', "_blank");
            $.ajax({
                url: requestUrl,
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
                    
                    tradePopup.location = `https://trade.opskins.com/trade-offers/${res.tradeId}`;
                    tradePopup.focus();
                    
                    if(this.playerStake) {
                        this.playerStake.selectedItems.clear();
                        this.playerStake.totalMoneyGambled = 0;
                    }
                }
            });
        }
    },

    clearSelection: function(cb = null) {

        return function() {
            this.playerStake = playerStake;

            this.playerStake.selectedItems.clear();
            this.playerStake.totalMoneyGambled = 0;
            let items = document.getElementsByClassName("ungambled-item");
            for(let item of items) {
                item.setAttribute("class", "ungambled-item gambling-selection-item col");
            }
            if(cb !== null) {
                cb(this.playerStake);
            }
        };
    }
};