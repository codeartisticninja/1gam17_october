"use strict";
import Scene       from "../lib/scenes/Scene";
import myGame      from "../MyGame";
import Sprite      from "../lib/scenes/actors/Sprite";
import Actor       from "../lib/scenes/actors/Actor";
import MediaPlayer from "../lib/utils/MediaPlayer";
import Script      from "../lib/utils/Script";

import ParticleEmitter from "../lib/scenes/actors/ParticleEmitter";
import Aye             from "./actors/Aye";

/**
 * AdventureScene class
 */

export default class AdventureScene extends Scene {
  public game:myGame;
  public script:Script;

  constructor(game:myGame, map:string) {
    super(game, map);
    this.actorTypes["Aye"] = Aye;
    this.actorTypes["ParticleEmitter"] = ParticleEmitter;
  }

  reset() {
    super.reset();
    // this.game.mediaChannels.music.play("./assets/music/AuditoryCheesecake_Avalon.mp3", true);
  }


  update() {
    super.update();
  }

  click(x:number, y:number) {
    super.click(x,y);
    (<Aye>this.actorsByType["Aye"][0]).goTo(this.mouse);
  }


  /*
    _privates
  */

  private _pillDispenceTO:any;

  private _gotoEnter() {
    if (this.script && this.script.storyTree) {
      this.script.goto("#enter");
    } else {
      setTimeout(this._gotoEnter.bind(this), 1024);
    }
  }
}
