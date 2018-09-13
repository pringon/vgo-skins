$(document).ready(function() {

    socket.emit("play coinflip", true);
    socket.on("get coinflip lobbies", populateCoinflipLobbyGallery);
});