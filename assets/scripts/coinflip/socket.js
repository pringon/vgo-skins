$(document).ready(function() {

    socket.emit("play coinflip", true);
    socket.on("get coinflip lobbies", populateCoinflipLobbyGallery);
    socket.on("get coinflip lobby timers", updateCoinflipLobbyTimers);
    socket.on("get coinflip winner", (lobby) => {
        console.log(lobby);
        if(document.getElementById("lobby-title").textContent.indexOf(lobby.id) !== -1) {
            console.log("Intra");
            let coinflipTossDiv = document.createElement("div");
            coinflipTossDiv.setAttribute("id", "coin-flip-here");

            let coinflipSideA = document.createElement("div");
            coinflipSideA.setAttribute("class", "side-a");
            let coinflipSideB = document.createElement("div");
            coinflipSideB.setAttribute("class", "side-b");

            coinflipTossDiv.appendChild(coinflipSideA);
            coinflipTossDiv.appendChild(coinflipSideB);

            let coinflipTossHolder = document.getElementsByClassName("coin-flip-anim")[0];
            coinflipTossHolder.innerHTML = '';
            coinflipTossHolder.appendChild(coinflipTossDiv);

            if(lobby.host.id == lobby.winner) {
                coinflipTossAnimation("host", lobby.host.coinColor);
            } else {
                coinflipTossAnimation("challenger", lobby.challenger.coinColor);
            }
        }
    })
});