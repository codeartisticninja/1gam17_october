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
  public emotions=0;

  constructor(scene:Scene, obj:any) {
    super(scene, obj);
    this.shape = "circle";
    // this.setAnchor(this.size.x/2, this.size.y-15);
    // this.size.set(60, 30);
    this.addAnimation("idle",  [ 0, 1, 2, 3, 4, 5, 6, 7]);
    this.addAnimation("walk",  [ 8, 9,10,11,12,13,14,15], 0);
    this.addAnimation("do",    [16,17,18,19,20,21,22,23]);
    this.addAnimation("sleep", [24,25,26,27,28,29,30,31]);
    this.position.set(this.scene.size.x/2, this.scene.size.y/2);
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
    if (joy.dir.magnitude) {
      this.velocity.copyFrom(joy.dir).multiplyXY(8);
      this.playAnimation("walk");
      this.animationFrame += joy.dir.magnitude;
      if (joy.dir.x < 0) {
        this.scale.x = -1;
      }
      if (joy.dir.x > 0) {
        this.scale.x = 1;
      }
    } else {
      this.velocity.set(0);
      this.playAnimation("idle");
    }
    super.update();
    let pe = <ParticleEmitter>this.scene.actorsByName["EmotionEmitter"];
    pe.position.copyFrom(this.position);
    for (let i=0;i<this.emotions;i++) {
      pe.emit();
    }
    this.scene.camera.copyFrom(this.position).subtractXY(this.scene.game.canvas.width/2, this.scene.game.canvas.height/2);
  }

  getPill() {
    this.emotions++;
    this.scene.setAlarm(this.scene.game.frameRate*60,()=>{
      this.emotions--;
    });
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
