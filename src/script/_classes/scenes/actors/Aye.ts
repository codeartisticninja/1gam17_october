"use strict";
import Actor   from "../../lib/scenes/actors/Actor";
import Scene   from "../../lib/scenes/Scene";
import Vector2 from "../../lib/utils/Vector2";
import Angle   from "../../lib/utils/Angle";

import ParticleEmitter from "../../lib/scenes/actors/ParticleEmitter";
import Cog             from "./Cog";

/**
 * Aye class
 */

export default class Aye extends Actor {
  public state:string;
  public cog:Cog;

  constructor(scene:Scene, obj:any) {
    super(scene, obj);
    this.shape = "circle";
    this.setAnchor(this.size.x/2, this.size.y-16);
    this.size.set(8);
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
    let angleDiff = Angle.dispense().set(this.gravity.angle+Math.PI).subtract(this.rotation).multiply(.333);
    this.rotation.add(angleDiff);

    if (this.state !== "jump") {
      if (joy.dir.x) {
        this.state = "walk";
        this.scale.x = joy.dir.x/Math.abs(joy.dir.x);
        if (this.animation) this.animation.speed = Math.abs(joy.dir.x);
        this.velocity.copyFrom(this.gravity).perp().magnitude = joy.dir.x * 8;
        this.velocity.add(this.gravity);
      } else {
        this.state = "idle";
      }
      if (Math.round(joy.dir.y) < 0) this.jump();
    }
    super.update();
      
    this.scene.camera.copyFrom(this.position).subtractXY(this.scene.game.canvas.width/2, this.scene.game.canvas.height/2);
    angleDiff.copyFrom(this.rotation).subtract(this.scene.cameraRotation).multiply(.333);
    this.scene.cameraRotation.add(angleDiff);
    angleDiff.recycle();
  }

  render() {
    switch (this.state) {
      case "jump":
        this.playAnimation("jump");
        break;
    
      case "walk":
        this.playAnimation("walk");
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
    this.size.set(0);
    this.state = "jump";
  }


  /*
    _privates
  */

}
