"use strict";

$("#message-submission-form").on("submit", (event) => {

    let message = $("#message-submission-form > input").val();
    socket.emit("chat message", message);
    $("#message-submission-form > input").val('');

    event.preventDefault();
    return false;
});
socket.on("chat message", ({ message, emittingUser}) => {

    $("#messages").append($("<li>").html(`<b>${emittingUser}</b>: ${message}`));
});