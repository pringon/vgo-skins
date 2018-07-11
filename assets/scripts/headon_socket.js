$(document).ready(function() {

    socket.emit("play headon", true);
    socket.on("get headon posts", (headonPosts) => {
        refreshPosts(headonPosts);
    });
});