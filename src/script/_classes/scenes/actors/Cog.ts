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
      // this.scale.x = -this.leader.scale.x;
      this.rotation.rad = -this.leader.rotation.rad * (this.leader.teeth/this.teeth);
      this.position.x = this.leader.position.x;
      /* let int = Math.PI/Math.round(this.circumference/(12*3));
      let diff = Vector2.dispense().copyFrom(this.position).subtract(this.leader.position);
      let actualAngle = diff.angle;
      let nearestAngle = Math.round(actualAngle/int) * int;
      this.rotation += actualAngle - nearestAngle;
      diff.recycle(); */
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

}
