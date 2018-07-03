$(document).ready(function() {

    socket.emit("play roulette", true);
    socket.on("get roulette stakes", (stakesData) => {
        refreshScreen(stakesData);
    });
});