"use strict";
import Actor   from "../../lib/scenes/actors/Actor";
import Scene   from "../../lib/scenes/Scene";
import Vector2 from "../../lib/utils/Vector2";

/**
 * Cog class
 */

export default class Cog extends Actor {
  public leader:Cog|null;
  public teeth:number;
  public inactive:number=0;

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
      try {
        return -this.leader.rotationSpeed * (this.leader.teeth/this.teeth);
      } catch (err) {
        this.inactive = 8;
        return 0;
      }
    }
    return 0;
  }

  get edgeSpeed() {
    return (this.rotationSpeed/Math.PI*2) * this.circumference;
  }

  update() {
    if (this.inactive) {
      this.inactive--;
      if (this.leader) this.leader.inactive = this.inactive;
      this.leader = null;
      this._preRotation = null;
      this.angularVelocity.set(0);
    }
    super.update();
    if (this.leader) {
      if (this._preRotation == null) {
        let v = Vector2.dispense();
        v.copyFrom(this.position).subtract(this.leader.position);
        this._preRotation = v.angle + v.angle * (this.leader.teeth/this.teeth);
        v.recycle();
      }
      this.rotation.rad = this._preRotation - this.leader.rotation.rad * (this.leader.teeth/this.teeth);
      this.order = this.leader.order + .125;
    } else {
      this._preRotation = null;
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
  private _preRotation:number|null;

}
