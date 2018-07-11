"use strict";

/**
 * A function that takes the number of posts as parameter and lists them on the screen for the user
 * @method refreshPosts
 * @param {Array} headonPosts is an array containing the headon posts currently open
 */
function refreshPosts(headonPosts) {

    let postsList = document.createDocumentFragment();

    for(let post of headonPosts) {

        let postHolder = document.createElement("li");
        let postContent = document.createElement('a');
        postContent.setAttribute("id", `post-${post.id}`);
        postContent.className = "headon-post";
        postContent.href = '#';
        postContent.setAttribute("data-toggle", "modal");
        postContent.setAttribute("data-target", "#headon-modal");
        postHolder.appendChild(postContent);

        let postTitle = document.createElement('p');
        postTitle.innerHTML = `<b>${post.user}:</b> ${post.stake}`;
        let postData = document.createElement('p');
        postData.innerHTML = getBettingRange(post.stake, post.upper, post.lower);

        postContent.appendChild(postTitle);
        postContent.appendChild(postData);
        postsList.appendChild(postHolder);
    }

    let postsListHolder = document.getElementById("active-posts");
    postsListHolder.innerHTML = '';
    postsListHolder.appendChild(postsList);
}

/**
 * A method that takes the post data and show an appropiate betting range
 * @method getBettingRange
 * @param {float} stake 
 * @param {bool} upper 
 * @param {bool} lower
 * @return {string} a string containing the betting range data 
 */
function getBettingRange(stake, upper, lower) {
    
    let range = "";
    if(lower) {
        range += (stake - (stake * 0.1)).toFixed(2);
    } else {
        range += (stake - (stake * 0.05)).toFixed(2);
    }
    range += '-';
    if(upper) {
        range += (stake + (stake * 0.1)).toFixed(2);
    } else {
        range += (stake + (stake * 0.1)).toFixed(2);
    }
    return range;
}

/**
 * A function that fills the modal with the player's items
 * @method showItems
 * @param {DOM Object} element the element that triggered the event 
 */
function showItems() {

    console.log("intra");
    let mockImg = "https://files.opskins.media/file/vgo-img/item/dual-berettas-trigger-happy-battle-scarred-300.png";
    let mockName = "MAG-7 Gold Digger (Factory New)";
    let items = [{ id: 1, name: mockName, price: 7.13, image: { "--300px": mockImg}}, { id: 2, name: mockName, price: 3.12, image: { "--300px": mockImg}},
    { id: 3, name: mockName, price: 1.27, image: { "--300px": mockImg}}, { id: 4, name: mockName, price: 2.32, image: { "--300px": mockImg}},
    { id: 5, name: mockName, price: 15.73, image: { "--300px": mockImg}}, { id: 6, name: mockName, price: 7.14, image: { "--300px": mockImg}},
    { id: 7, name: mockName, price: 9.23, image: { "--300px": mockImg}}, { id: 8, name: mockName, price: 3.14, image: { "--300px": mockImg}}];

    let itemsList = document.createDocumentFragment();

    for(let item of items) {

        let itemContainer = document.createElement("div");
        itemContainer.className = "modal-item-container";

        let itemImage = document.createElement("img");
        itemImage.id = item.id;
        itemImage.className = "modal-item-image";
        itemImage.src = item.image["--300px"];

        let itemCost = document.createElement("div");
        itemCost.className = "modal-item-cost";
        itemCost.textContent = item.price;

        itemContainer.appendChild(itemImage);
        itemContainer.appendChild(itemCost);
        itemsList.appendChild(itemContainer);
    }

    let itemsElementList = document.getElementsByClassName("modal-body")[0];
    itemsElementList.innerHTML = '';
    itemsElementList.appendChild(itemsList);
}

$(document).ready(function() {
    $("#active-posts").on("click", ".headon-post", showItems);
});