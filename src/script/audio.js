(function () {
  "use strict";
  let snd = "music";
  let btn;

  function init() {
    setTimeout(addAudioBtn, 1024);
  }

  function addAudioBtn() {
    let container = game.container;
    btn = document.createElement("button");
    btn.classList.add("audio");
    if (!game.prefs.get(`${snd}.enabled`)) btn.classList.add("muted");
    btn.setAttribute("title", "Toggle audio");
    btn.textContent = "Sound";
    btn.addEventListener("click", toggleAudio);
    container.appendChild(btn);
  }

  function toggleAudio() {
    game.prefs.set(`${snd}.enabled`, !game.prefs.get(`${snd}.enabled`));
    // game.prefs.set(`sfx.enabled`, game.prefs.get(`${snd}.enabled`));
    if (game.prefs.get(`${snd}.enabled`)) {
      btn.classList.remove("muted");
    } else {
      btn.classList.add("muted");
    }
  }

  addEventListener("DOMContentLoaded", init);
})()