let tossTimeout;
let winnerTimeout;

function coinflipTossAnimation(winner = "host", coinflipResult = "red") {

    tossTimeout = setTimeout(function() {
        $('#coin-flip-here').addClass(coinflipResult == "red" ? "heads" : "tails");
    }, 100);
    winnerTimeout = setTimeout(function() {
        if(winner == "host") {
            $('#coinFlipPlayer1').addClass('winner animated rubberBand');
            $('#coinFlipPlayer2').addClass('loser');
        } else {
            $('#coinFlipPlayer1').addClass('loser');
            $('#coinFlipPlayer2').addClass('winner animated rubberBand');
        }
    }, 4000);
}

function cancelCoinflipTossAnimation() {
    clearTimeout(tossTimeout);
    clearTimeout(winnerTimeout);
    $('#coinFlipPlayer1').removeClass('winner animated rubberBand loser');
    $('#coinFlipPlayer2').removeClass('winner animated rubberBand loser');
    $("coin-flip-here").removeClass("heads tails");
}