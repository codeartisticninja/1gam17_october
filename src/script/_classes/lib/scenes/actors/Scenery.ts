"use strict";
import Actor from "./Actor";
import Scene from "../Scene";

/**
 * Scenery class
 * 
 * @date 10-oct-2017
 */

export default class Scenery extends Actor {
  public img = new Image();

  constructor(scene:Scene, obj:any) {
    super(scene, obj);
    this.setAnchor(0);
    this.position.set(obj.offsetx, obj.offsety);
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
    let x = 0;
    let y = 0;
    while (this.position.x+x < this.scene.camera.x) x += this.img.width;
    while (this.position.y+y < this.scene.camera.y) y += this.img.height;
    while (this.position.y+y > this.scene.camera.y) y -= this.img.height;
    while (this.position.y+y < this.scene.camera.y+this.scene.game.canvas.height) {
      while (this.position.x+x > this.scene.camera.x) x -= this.img.width;
      while (this.position.x+x < this.scene.camera.x+this.scene.game.canvas.width) {
        g.drawImage(this.img, x, y);
        x += this.img.width;
      }
      y += this.img.height;
    }
  }

  /*
    _privates
  */
}
