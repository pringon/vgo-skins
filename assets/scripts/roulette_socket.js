$(document).ready(function() {

    $('.gallery').flickity('resize');

    socket.emit("play roulette", rouletteTier);
    socket.on("get roulette stakes", (stakesData) => {
        console.log(stakesData);
        refreshScreen(stakesData);
    });
    socket.on("time elapsed", (timeRemaining) => {
        let minutes = Math.floor(timeRemaining/60);
        let seconds = timeRemaining%60;
        createCircles(timeRemaining);
        document.getElementsByClassName("score")[2].textContent = `${minutes > 9 ? minutes : "0" + minutes}:${seconds > 9 ? seconds : "0" + seconds}`;
        document.getElementsByClassName("score")[8].textContent = `${minutes > 9 ? minutes : "0" + minutes}:${seconds > 9 ? seconds : "0" + seconds}`;
    });
    socket.on("round finished", ({winner, winnerPos}) => {
        console.log(`The winner is ${winner.user}`);
        spinJackpot(winnerPos);
        $(".firework img").show();
        setTimeout(function(){
            $(".firework img").hide();    
        }, 5000);
        for(let item in currentSelectedItems) {
            delete currentSelectedItems[item];
        }
        totalMoneyGambled = 0;
        currentMoneyGambled = 0;
        $(".scoreboard .panel .score:eq(0)").html("0<small>%</small>");
        $(".scoreboard .panel .score:eq(1)").html("<small>$</small>0.00");
        $(".modal-content .row .score-panel .item .score:eq(1)").text(`$0.00`);
        $(".data-panel .bottom-sec button").text(`Deposit $0.00 (0 Skins)`);
    });
    socket.on("invalid tier option", () => {
        window.location.href = "/games/roulette/plant";
    })
});