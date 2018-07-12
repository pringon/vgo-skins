$(document).ready(function() {

    socket.emit("play roulette", true);
    socket.on("get roulette stakes", (stakesData) => {
        refreshScreen(stakesData);
    });
    socket.on("time elapsed", (timeRemaining) => {
        let minutes = Math.floor(timeRemaining/60);
        let seconds = timeRemaining%60;
        document.getElementsByClassName("score")[2].textContent = `${minutes > 9 ? minutes : "0" + minutes}:${seconds > 9 ? seconds : "0" + seconds}`;
        document.getElementsByClassName("score")[8].textContent = `${minutes > 9 ? minutes : "0" + minutes}:${seconds > 9 ? seconds : "0" + seconds}`;
    });
    socket.on("round finished", (winner) => {
        console.log(`The winner is ${winner.user}`);
    });
});