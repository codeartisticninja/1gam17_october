"use strict";
import Actor    from "./Actor";
import Scene    from "../Scene";
import Vector2  from "../../utils/Vector2";
import Tween    from "../../utils/Tween";


/**
 * ParticleEmitter class
 * 
 * @date 04-oct-2017
 */

export default class ParticleEmitter extends Actor {
  public pool:Tween[]=[];
  public obj:any;
  public startProps:any={ velocity: { magnitude: [1,8], angle:[-Math.PI,Math.PI] }, opacity:1 };
  public endProps:any={ opacity:0 };
  public duration:number=1024;
  
  constructor(scene:Scene, obj?:any) {
    super(scene, obj);
    this.visible = false;
    this.obj = JSON.parse(JSON.stringify(obj));
    this.obj.name = null;
  }

  update() {}

  emit(v:Vector2=this.position) {
    this.obj.type = this.startProps["type"];
    let tween = this._dispense();
    let actor = <Actor>tween.object;
    actor.position.copyFrom(v);
    this._setValues(this.startProps, actor);
    this._setValues(this.endProps, tween.endProps);
    if (this.duration > 0) {
      tween.duration = this.duration;
      tween.start();
    }
  }

  start(interval:number) {
    var frames = this.scene.game.frameRate * (interval/1000);
    var cb = () => {
      this.scene.clearAlarm(this._runTO);
      this.emit();
      this._runTO = this.scene.setAlarm(frames, cb);
    }
    cb();
  }
  
  stop() {
    this.scene.clearAlarm(this._runTO);
  }


  /*
    _privates
  */
  private _runTO:any;

  private _dispense() {
    let tween = this.pool.pop();
    if (!tween) {
      tween = new Tween(this.scene.createActor(this.obj), {}, 1024, false);
      tween.onEnd(()=>{
        this._recycle(<Tween>tween);
      })
    }
    this.scene.addActor(<Actor>tween.object);
    return tween;
  }

  private _recycle(tween:Tween) {
    if (this.pool.indexOf(tween) !== -1) return;
    this.scene.removeActor(<Actor>tween.object);
    this.pool.push(tween);
  }

  private _setValues(src:any, dest:any) {
    for (var key in src) {
      if (src[key] instanceof Array) {
        while (src[key].length < 2) src[key].push(src[key][0] || 0);
        dest[key] = src[key][0] + Math.random() * (src[key][1] - src[key][0]);
      } else if (typeof src[key] === "object") {
        dest[key] = dest[key] || {};
        this._setValues(src[key], dest[key]);
      } else {
        dest[key] = src[key];
      }
    }
  }

}
