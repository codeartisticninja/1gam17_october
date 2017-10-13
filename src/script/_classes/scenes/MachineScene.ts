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
import Cog             from "./actors/Cog";

/**
 * MachineScene class
 */

export default class MachineScene extends Scene {
  public game:myGame;

  constructor(game:myGame, map:string) {
    super(game, map);
    this.actorTypes["Aye"] = Aye;
    this.actorTypes["Cog"] = Cog;
    this.actorTypes["ParticleEmitter"] = ParticleEmitter;
    this.boundCamera=false;
  }

  reset() {
    super.reset();
    // this.game.mediaChannels.music.play("./assets/music/AuditoryCheesecake_Avalon.mp3", true);
  }


  update() {
    let diff = Vector2.dispense();
    for (let aye of this.actorsByType["Aye"]) {
      aye.gravity.set(0);
      let overlap=false;
      for (let cog of <Cog[]>this.actorsByType["Cog"]) {
        diff.copyFrom(cog.position).subtract(aye.position);
        diff.magnitude -= Math.min(cog.radius, diff.magnitude-1);
        diff.magnitude = 48/diff.magnitude;
        if (aye.overlapsWith(cog)) {
          if (!overlap) aye.gravity.set(0);
          aye.gravity.add(diff);
          (<Aye>aye).jumping = false;
          aye.velocity.set(0);
          overlap=true;
        } else if (!overlap) {
          aye.gravity.add(diff);
        }
      }
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
    aye.jumping = false;
    aye.snapToEdge(cog, aye.radius);
    aye.velocity.set(0);
  }

  private _cogMeetsCog(cog1:Cog, cog2:Cog) {
    if ((cog1.leader && cog1.leader !== cog2) || cog1.angularVelocity) {
      cog2.leader = cog1;
      cog2.snapToEdge(cog1);
    }
  }
}
