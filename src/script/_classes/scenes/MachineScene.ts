"use strict";
import Scene       from "../lib/scenes/Scene";
import myGame      from "../MyGame";
import Sprite      from "../lib/scenes/actors/Sprite";
import Actor       from "../lib/scenes/actors/Actor";
import MediaPlayer from "../lib/utils/MediaPlayer";
import Script      from "../lib/utils/Script";
import Vector2     from "../lib/utils/Vector2";

import ParticleEmitter from "../lib/scenes/actors/ParticleEmitter";
import Aye             from "./actors/Aye";
import CogSpawner      from "./actors/CogSpawner"; 
import Cog             from "./actors/Cog"; 
import Guts            from "./actors/Guts";

/**
 * MachineScene class
 */

export default class MachineScene extends Scene {
  public game:myGame;

  constructor(game:myGame, map:string) {
    super(game, map);
    this.actorTypes["ParticleEmitter"] = ParticleEmitter;
    this.actorTypes["Aye"] = Aye;
    this.actorTypes["CogSpawner"] = CogSpawner;
    this.actorTypes["Cog"] = Cog;
    this.actorTypes["Guts"] = Guts;
    this.boundCamera=false;
  }

  reset() {
    super.reset();
    this.game.mediaChannels.music.play("./assets/music/AuditoryCheesecake_Drainage.mp3", true);
  }


  update() {
    if (!this.actorsByType["Cog"]) return super.update();
    let diff = Vector2.dispense();
    for (let aye of this.actorsByType["Aye"]) {
      aye.gravity.set(0);
      let overlap=false;
      let closestCogs:Cog[] = [];
      let closesDists:number[] = [];
      for (let cog of <Cog[]>this.actorsByType["Cog"]) {
        diff.copyFrom(cog.position).subtract(aye.position);
        diff.magnitude -= Math.min(cog.radius, diff.magnitude-1);
        let i = closestCogs.length;
        while (closesDists[i-1] > diff.magnitude) i--;
        closestCogs.splice(i, 0, cog);
        closesDists.splice(i, 0, diff.magnitude);
        if (closestCogs.length > 2) {
          closestCogs.pop();
          closesDists.pop();
        }
      }
      let distSum = 0; closesDists.forEach((dist)=>{ distSum += dist; });
      for (let cog of closestCogs) {
        diff.copyFrom(cog.position).subtract(aye.position);
        diff.magnitude = closesDists.pop() || distSum;
        aye.gravity.add(diff);
      }
      aye.gravity.normalize();
    }
    super.update();
    this.onOverlap(this.actorsByType["Aye"], this.actorsByType["Cog"], this._ayeMeetsCog);
    this.onOverlap(this.actorsByType["Cog"], this.actorsByType["Cog"], this._cogMeetsCog);
    diff.recycle();
  }

  /*
    _privates
  */

  private _pillDispenceTO:any;

  private _ayeMeetsCog(aye:Aye, cog:Cog) {
    aye.touchingCogs.push(cog);
    if (aye.state === "stomp") {
      cog.snapToEdge(aye);
      cog.inactive += 8;
    } else {
      aye.snapToEdge(cog, 1);
      if (!cog.rotationSpeed && !cog.inactive) cog.angularVelocity.deg = 1 + Math.random();
    }
    aye.velocity.set(0);
    if (aye.state === "jump" || aye.state === "stomp") aye.state = "idle";
    let v = Vector2.dispense();
    v.copyFrom(aye.position).subtract(cog.position).angle += cog.rotationSpeed;
    v.add(cog.position);
    aye.position.copyFrom(v);
    v.recycle();
  }

  private _cogMeetsCog(cog1:Cog, cog2:Cog) {
    if (cog1.inactive) {
      cog1.snapToEdge(cog2, 1);
    }
    if (cog2.leader) cog2.snapToEdge(cog2.leader, 1);
    if (cog1.inactive || cog2.inactive || cog2.leader) return;
    if ((cog1.leader && cog1.leader !== cog2) || cog1.angularVelocity.rad) {
      cog2.leader = cog1;
    }
  }
}
