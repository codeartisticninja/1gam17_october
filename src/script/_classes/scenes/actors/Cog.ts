"use strict";
import Actor   from "../../lib/scenes/actors/Actor";
import Scene   from "../../lib/scenes/Scene";
import Vector2 from "../../lib/utils/Vector2";

/**
 * Cog class
 */

export default class Cog extends Actor {
  public leader:Cog;
  public teeth:number;

  constructor(scene:Scene, obj:any) {
    super(scene, obj);
    this.shape = "circle";
    this.size.subtractXY(12*2);
    this.teeth = Math.round(this.circumference/(12*3*2));
  }

  get rotationSpeed():number {
    if (this.angularVelocity.rad) {
      return this.angularVelocity.rad;
    }
    if (this.leader) {
      return -this.leader.rotationSpeed * (this.leader.teeth/this.teeth);
    }
    return 0;
  }

  get edgeSpeed() {
    return (this.rotationSpeed/Math.PI*2) * this.circumference;
  }

  update() {
    super.update();
    if (this.leader) {
      if (!this._preRotation) {
        let v = Vector2.dispense();
        v.copyFrom(this.position).subtract(this.leader.position);
        this._preRotation = v.angle + v.angle * (this.leader.teeth/this.teeth);
        v.recycle();
      }
      this.rotation.rad = this._preRotation - this.leader.rotation.rad * (this.leader.teeth/this.teeth);
    }
  }

  render() {
    let g = this.scene.game.ctx;
    g.strokeStyle = "green";
    return super.render();
  }


  /*
    _privates
  */
  private _preRotation:number;

}
