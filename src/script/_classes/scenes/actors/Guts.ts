"use strict";
import Actor from "../../lib/scenes/actors/Actor";
import Scene from "../../lib/scenes/Scene";

/**
 * Guts class
 */

export default class Guts extends Actor {
  constructor(scene: Scene, obj: any) {
    super(scene, obj);
    this.shape = "circle";
    this.addAnimation("gore", [0, 1, 2, 3, 4, 5, 6, 7]);
    this.playAnimation("gore");
    this.animationFrame += Math.random()*8;
    this.order = 2048;
  }
}
