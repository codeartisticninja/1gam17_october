"use strict";
import Game from "./lib/Game";

import MachineScene  from "./scenes/MachineScene";


/**
 * MyGame class
 */

export default class MyGame extends Game {
  public scriptVars={}
  
  constructor(container:string|HTMLElement) {
    super(container, 960);
    this.frameRate = 12;
    this.addScene("space", new MachineScene(this, "./assets/maps/space.json"));
    this.joypad.mode = "rc";
    this.joypad.enable();
    this.startScene("space");
  }

}
