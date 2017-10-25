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
    if (this.count === 0) this.scene.removeActor(this);
    if (this.count-- > 0) {
      this.position.set(this.scene.size.x * Math.random(), this.scene.size.y * Math.random());
      // this.position.set(this.scene.size.x / 2, this.scene.size.y / 2).addXY(Math.random() * 512 - 256, Math.random() * 256 - 128);
      this.emit();
    }
    return super.update();
  }

  /*
    _privates
  */

}
