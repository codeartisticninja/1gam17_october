"use strict";
import MyGame from "./_classes/MyGame";

/**
 * main.ts
 * Main script
 */
var game: MyGame;

function init() {
  game = (<any>window)["game"] = new MyGame("#game");
  game.debug = location.search.indexOf("debug") !== -1;
}

if (location.search === "?nojs") {
  let tags = document.getElementsByTagName("noscript");
  for (let i = 0; i < tags.length; i++) {
    let tag = document.createElement("span");
    tag.classList.add("noscript");
    tag.innerHTML = tags[i].innerHTML;
    (tags[i].parentElement||document.body).insertBefore(tag, tags[i]);
  }
} else {
  addEventListener("DOMContentLoaded", init);
}
