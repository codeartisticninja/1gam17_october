"use strict";
import Actor   from "../../lib/scenes/actors/Actor";
import Scene   from "../../lib/scenes/Scene";
import Vector2 from "../../lib/utils/Vector2";

import ParticleEmitter from "../../lib/scenes/actors/ParticleEmitter";

/**
 * Aye class
 */

export default class Aye extends Actor {
  public state:string;
  public target:Vector2|null;
  public distanceToTarget:Vector2 = new Vector2();
  public dir:Vector2 = new Vector2();
  public jumping=true;

  constructor(scene:Scene, obj:any) {
    super(scene, obj);
    this.shape = "circle";
    this.setAnchor(this.size.x/2, this.size.y-32);
    this.size.set(32);
    this.gravity = Vector2.dispense();
    this.addAnimation("idle",  [ 0, 1, 2, 3, 4, 5, 6, 7]);
    this.addAnimation("walk",  [ 8, 9,10,11,12,13,14,15], 0);
    this.addAnimation("jump",  [ 13 ]);
    this.addAnimation("do",    [16,17,18,19,20,21,22,23]);
    this.addAnimation("sleep", [24,25,26,27,28,29,30,31]);
    this.order = 1024;
  }

  update() {
    var joy = this.scene.game.joypad;
    if (this.target) {
      joy.dir.copyFrom(this.dir);
      let lastDist = this.distanceToTarget.magnitude;
      this.target.subtract(this.position, this.distanceToTarget);
      if (this.distanceToTarget.magnitude >= lastDist) {
        this.target = null;
        joy.fire = true;
        joy.delta.fire++;
      }
    }
    if (this.state) return super.update();
    let angleDiff = this.gravity.angle + Math.PI - this.rotation;
    while (angleDiff > Math.PI) angleDiff -= 2*Math.PI;
    while (angleDiff < -Math.PI) angleDiff += 2*Math.PI;
    this.angularVelocity = angleDiff * .333;
    if (joy.dir.magnitude && !this.jumping) {
      this.velocity.copyFrom(joy.dir).multiplyXY(8);
      this.velocity.angle += this.rotation;
      if (Math.round(joy.dir.y) < 0) this.jump();
      this.playAnimation("walk");
      this.animationFrame += joy.dir.magnitude;
      if (joy.dir.x < 0) {
        this.scale.x = -1;
      }
      if (joy.dir.x > 0) {
        this.scale.x = 1;
      }
    } else if (this.jumping) {
      this.playAnimation("jump");
    } else {
      this.playAnimation("idle");
    }
    super.update();
    this.scene.camera.copyFrom(this.position).subtractXY(this.scene.game.canvas.width/2, this.scene.game.canvas.height/2);
    angleDiff = this.rotation - this.scene.cameraRotation;
    while (angleDiff > Math.PI) angleDiff -= 2*Math.PI;
    while (angleDiff < -Math.PI) angleDiff += 2*Math.PI;
    this.scene.cameraRotation += angleDiff * .333;
    // this.scene.cameraRotation = this.rotation;
  }

  render() {
    let g = this.scene.game.ctx;
    g.strokeStyle = "red";
    return super.render();
  }

  jump() {
    if (this.jumping) return;
    this.velocity.magnitude = 24;
    // this.velocity.angle = this.rotation;
    this.jumping = true;
  }

  goTo(dest:Vector2) {
    this.target = dest;
    this.target.subtract(this.position, this.distanceToTarget);
    this.distanceToTarget.magnitude += 8;
    this.dir.copyFrom(this.distanceToTarget);
    this.dir.magnitude = 1;
  }


  /*
    _privates
  */

}
