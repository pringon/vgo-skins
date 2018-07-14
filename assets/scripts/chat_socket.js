"use strict";

function sendChatMessage() {
    let message = $("#chat-message-submit").val();
    if(message.length > 2) {
        socket.emit("chat message", message);
        $("#chat-message-submit").val('');
    }
}

$("#chat-submit").on("click", () => {

    sendChatMessage();
});
$("#chat-message-submit").on("keyup", (event) => {

    if((event.keyCode ? event.keyCode : event.which) == 13) {
        sendChatMessage();
    }
    return false;
});

socket.on("chat message", ({ message, emittingUser}) => {

    let messageUserData = document.createElement("div");
    messageUserData.className = "users";

    let messageUserImageHolder = document.createElement("div");
    messageUserImageHolder.className = "avatar";
    let messageUserImage = document.createElement("img");
    messageUserImage.setAttribute("src", emittingUser.avatar);
    messageUserImage.setAttribute("alt", "user");
    messageUserImageHolder.appendChild(messageUserImage);

    let messageUserContent = document.createElement("div");
    messageUserContent.className = "content-sec";
    let messageUserContentName = document.createElement("div");
    messageUserContentName.className = "name";
    messageUserContentName.innerHTML = `${emittingUser.userName} <span class="badge bg-blue">20</span>`;
    let messageUserContentComment = document.createElement("div");
    messageUserContentComment.className = "comment";
    messageUserContentComment.innerHTML = message;
    messageUserContent.appendChild(messageUserContentName);
    messageUserContent.appendChild(messageUserContentComment);

    messageUserData.appendChild(messageUserImageHolder);
    messageUserData.appendChild(messageUserContent);

    document.getElementsByClassName("chat-list")[0].appendChild(messageUserData);
});