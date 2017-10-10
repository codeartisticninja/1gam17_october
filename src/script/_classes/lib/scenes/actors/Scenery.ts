"use strict";
import Actor from "./Actor";
import Scene from "../Scene";

/**
 * Scenery class
 * 
 * @date 04-oct-2017
 */

export default class Scenery extends Actor {
  public img = new Image();

  constructor(scene:Scene, obj:any) {
    super(scene, obj);
    this.setAnchor(0);
    let mapUrl = scene.mapUrl || "./";
    this.img.src = mapUrl.substr(0, mapUrl.lastIndexOf("/")+1) + obj.image;

    if (!this.img.complete) {
      this.scene.game.loading++;
      this.img.addEventListener("load", () => {
        this.scene.game.loaded++;
      });
    }

  }

  render () {
    if (!this.img.width) return;
    let g = this.scene.game.ctx;
    g.drawImage(this.img, 0, 0);
  }

  /*
    _privates
  */
}
