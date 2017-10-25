"use strict";
import Actor from "../../lib/scenes/actors/Actor";
import Scene from "../../lib/scenes/Scene";
import Vector2 from "../../lib/utils/Vector2";
import Angle from "../../lib/utils/Angle";

import ParticleEmitter from "../../lib/scenes/actors/ParticleEmitter";
import Cog from "./Cog";

/**
 * Aye class
 */

export default class Aye extends Actor {
  public state: string = "jump";
  public touchingCogs: Cog[] = [];

  constructor(scene: Scene, obj: any) {
    super(scene, obj);
    this.shape = "circle";
    this.setAnchor(this.size.x / 2, this.size.y - 32);
    this.size.set(48);
    this.gravity = Vector2.dispense();
    this.addAnimation("idle", [0, 1, 2, 3, 4, 5, 6, 7]);
    this.addAnimation("walk", [8, 9, 10, 11, 12, 13, 14, 15]);
    this.addAnimation("jump", [16, 17, 18, 19]);
    this.addAnimation("apex", [20, 21, 22]);
    this.addAnimation("fall", [23, 24, 25, 26]);
    this.addAnimation("stomp", [24]);
    this.addAnimation("die", [27, 28, 29, 30, 31, 32, 33, 34]);
    this.order = 1024;
    this.position.copyFrom(this.scene.size).multiplyXY(.5);
  }

  update() {
    var joy = this.scene.game.joypad;
    let posDiff = Vector2.dispense();
    let angleDiff = Angle.dispense().set(this.gravity.angle + Math.PI).subtract(this.rotation).multiply(.333);
    this.rotation.add(angleDiff);
    if (this.scale.y < .125) this.respawn();
    this.scale.x = this.scale.x / Math.abs(this.scale.x) * this.scale.y;

    if (this.touchingCogs.length >= 2) {
      let clockwise = this.touchingCogs[0];
      let anticlockwise = this.touchingCogs[0];
      for (let cog of this.touchingCogs) {
        if (cog.rotationSpeed > clockwise.rotationSpeed) clockwise = cog;
        if (cog.rotationSpeed < anticlockwise.rotationSpeed) anticlockwise = cog;
      }
      if (clockwise !== anticlockwise) {
        let ang = Angle.dispense();
        let vec = Vector2.dispense();
        ang.set(vec.copyFrom(anticlockwise.position).subtract(clockwise.position).angle);
        ang.subtractRad(vec.copyFrom(this.position).subtract(clockwise.position).angle);
        if (ang.rad > 0) this.state = "die";
        ang.recycle();
        vec.recycle();
      }
    }

    if (this.state !== "die") {
      if (this.scale.y < 1) this.scale.y += 0.03125;
      if (this.state === "jump") {
        if (Math.round(joy.dir.y) > 0) this.stomp();
      } else if (this.state !== "stomp") {
        if (joy.dir.x) {
          this.state = "walk";
          this.scale.x = joy.dir.x / Math.abs(joy.dir.x);
          this.animations["walk"].speed = Math.abs(joy.dir.x);
          this.velocity.copyFrom(this.gravity).perp().magnitude = joy.dir.x * 8;
          this.velocity.add(this.gravity);
        } else {
          this.state = "idle";
        }
        if (Math.round(joy.dir.y) < 0) this.jump();
      }
    } else {
      this.scale.y -= 0.03125;
    }
    super.update();

    posDiff.copyFrom(this.position).subtractXY(this.scene.game.canvas.width / 2, this.scene.game.canvas.height / 2).subtract(this.scene.camera).multiplyXY(.125);
    this.scene.camera.add(posDiff);
    angleDiff.copyFrom(this.rotation).subtract(this.scene.cameraRotation).multiply(.125);
    this.scene.cameraRotation.add(angleDiff);

    this.touchingCogs.splice(0, this.touchingCogs.length);
    angleDiff.recycle();
    posDiff.recycle();
  }

  render() {
    switch (this.state) {
      case "jump":
        let a = Angle.dispense().set(this.velocity.angle).subtractRad(this.gravity.angle);
        if (Math.abs(a.rad) > Math.PI / 2) {
          this.playAnimation("jump");
        } else if (this.animation === this.animations["jump"]) {
          this.playAnimation("apex");
          this.playAnimation("fall", true);
        }
        break;

      case "stomp":
        this.playAnimation("stomp");
        break;

      case "walk":
        this.playAnimation("walk");
        break;

      case "die":
        this.playAnimation("die");
        let guts = <ParticleEmitter>this.scene.actorsByName["GutsEmitter"];
        guts.position.copyFrom(this.position); //.addXY(Math.random()*32-16,Math.random()*32-16);
        if (Math.random() < .3333) guts.emit();
        break;

      default:
        this.playAnimation("idle");
        break;
    }
    return super.render();
  }

  jump() {
    if (this.state === "jump") return;
    this.gravity.magnitude *= -16;
    // this.velocity.angle = this.rotation;
    this.state = "jump";
  }

  stomp() {
    if (this.state === "stomp") return;
    this.velocity.angle = this.rotation.rad + Math.PI;
    this.velocity.magnitude = 32;
    this.state = "stomp";
  }

  respawn() {
    this.position.set(Math.random() * this.scene.size.x, Math.random() * this.scene.size.y);
    this.state = "stomp";
    this.playAnimation("jump");
  }


  /*
    _privates
  */

}
