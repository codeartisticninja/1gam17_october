"use strict";
import ParticleEmitter from "../../lib/scenes/actors/ParticleEmitter";
import Scene from "../../lib/scenes/Scene";

/**
 * CogSpawner class
 */

export default class CogSpawner extends ParticleEmitter {
  public count = -1;

  constructor(scene: Scene, obj: any) {
    super(scene, obj);
    this.duration = -1;
    this.startProps = { type: "Cog" }
  }

  update() {
    if (this.count > 0) this.scene.removeActor(this);
    while (this.count-- > 0) {
      this.position.set(Math.random() * this.scene.size.x, Math.random() * this.scene.size.y);
      this.emit();
      console.log("ting!");
    }
    return super.update();
  }

  /*
    _privates
  */

}
