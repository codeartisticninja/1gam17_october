"use strict";
import Game        from "../Game";
import Actor       from "./actors/Actor";
import Sprite      from "./actors/Sprite";
import Scenery     from "./actors/Scenery";
import Vector2     from "../utils/Vector2";
import web         from "../utils/web";
import lazyJSON    from "../utils/lazyJSON";
import Angle       from "../utils/Angle";

import Text        from "./actors/Text";

/**
 * Scene class
 * 
 * @date 23-oct-2017
 */


export default class Scene {
  public actorTypes:{[index:string]:typeof Actor} = {};
  public actors:Actor[] = [];
  public actorsByType:{[index:string]: Actor[]} = {};
  public actorsByName:{[index:string]: Actor} = {};
  public spritesByFirstGid:Sprite[]=[];
  public spritesByName:{[index:string]: Sprite} = {};
  public size:Vector2 = new Vector2();
  public gravity:Vector2 = new Vector2();
  public camera:Vector2 = new Vector2();
  public cameraRotation:Angle = new Angle();
  public boundCamera=true;
  public mouse:Vector2 = new Vector2();
  public mapData:any;
  public backgroundColor:string;

  constructor(public game:Game, public mapUrl?:string) {
    this.size.set(game.canvas.width, game.canvas.height);
  }

  reset() {
    setTimeout(()=>{
      this.actors = [];
      this.actorsByType = {};
      this.clearAllAlarms();
      if (this.mapUrl) {
        this.game.loading++;
        web.get(this.mapUrl, (req:XMLHttpRequest)=>{
          this.mapData = JSON.parse(req.responseText.trim());
          this.loadMap();
          this.game.loaded++;
        });
      }
    });
  }

  enter() {
  }
  exit() {
  }

  loadMap() {
    var mapUrl = this.mapUrl || "./";
    var mapFolder = mapUrl.substr(0, mapUrl.lastIndexOf("/")+1);
    this.size.set(this.mapData.width*this.mapData.tilewidth, this.mapData.height*this.mapData.tileheight);
    this.backgroundColor = this.mapData.backgroundcolor;
    for (var tileset of this.mapData.tilesets) {
      this.addSprite(new Sprite(tileset, mapFolder));
    }
    for (var layer of this.mapData.layers) {
      switch (layer.type) {
        case "objectgroup":
          for (var obj of layer.objects) {
            this.addActor(this.createActor(obj));
          }
          break;
        case "imagelayer":
          this.addActor(new Scenery(this, layer));
          break;
      }
    }
    lazyJSON.setProperties(this.mapData.properties, this);
  }

  update() {
    let i=0;
    for (var alarm of this._alarms) {
      alarm.frames--;
      if (alarm.frames <= 0) {
        this.clearAlarm(alarm);
        alarm.cb();
      }
    }
    for (var actor of this.actors) {
      actor.update();
      if (i) {
        if (this.actors[i].order < this.actors[i-1].order) {
          let a = this.actors[i];
          this.actors[i] = this.actors[i-1];
          this.actors[i-1] = a;
        }
      }
      i++;
    }
    if (this.boundCamera) {
      this.camera.x = Math.max(this.camera.x, 0);
      this.camera.y = Math.max(this.camera.y, 0);
      this.camera.x = Math.min(this.camera.x, this.size.x-this.game.canvas.width);
      this.camera.y = Math.min(this.camera.y, this.size.y-this.game.canvas.height);
    }
  }

  render() {
    if (!this.game) return false;
    var g = this.game.ctx;
    for (var actor of this.actors) {
      if (actor.visible) {
        g.save();
        if (this.cameraRotation.rad) {
          g.translate(this.game.canvas.width/2, this.game.canvas.height/2);
          g.rotate(-this.cameraRotation.rad);
          g.translate(-this.game.canvas.width/2, -this.game.canvas.height/2);
        }
        g.translate(-this.camera.x*actor.parallax, -this.camera.y*actor.parallax);
        g.translate(actor.position.x, actor.position.y);
        g.rotate(actor.rotation.rad);
        g.scale(actor.scale.x, actor.scale.y);
        g.globalAlpha = actor.opacity;
        actor.render();
        g.restore();
      }
    }
    if (this.game.debug) {
      g.globalAlpha = 1;
      for (var actor of this.actors) {
        g.save();
        if (this.cameraRotation.rad) {
          g.translate(this.game.canvas.width/2, this.game.canvas.height/2);
          g.rotate(-this.cameraRotation.rad);
          g.translate(-this.game.canvas.width/2, -this.game.canvas.height/2);
        }
        g.translate(-this.camera.x*actor.parallax, -this.camera.y*actor.parallax);
        g.translate(actor.position.x, actor.position.y);
        g.scale(Math.abs(actor.scale.x), Math.abs(actor.scale.y));
        actor.renderDebug();
        g.restore();
      }
    }
  }

  createActor(obj:any) {
    if (this.actorTypes[obj.type]) {
      return new this.actorTypes[obj.type](this, obj);
    } else if (obj.text) {
      return new Text(this, obj);
    } else {
      return new Actor(this, obj);
    }
  }

  addActor(actor:Actor, ...toGroup:Array<Actor>[]) {
    toGroup.push(this.actors);
    toGroup.push(this.actorsByType[actor.type] = this.actorsByType[actor.type] || []);
    for (var group of toGroup) {
      var i = group.indexOf(actor);
      if (i === -1) {
        group.push(actor);
      }
    }
    this.actorsByName[actor.name] = actor;
    actor.scene = this;
    return actor;
  }

  removeActor(actor:Actor, ...fromGroup:Array<Actor>[]) {
    var i=-1;
    setTimeout(()=>{
      fromGroup.push(this.actors);
      fromGroup.push(this.actorsByType[actor.type]);
      for (var group of fromGroup) {
        if (group) i = group.indexOf(actor); else i = -1;
        if (i !== -1) {
          group.splice(i,1);
        }
      }
      delete this.actorsByName[actor.name];
    });
    return actor;
  }

  bringActorToFront(actor:Actor, ...fromGroup:Array<Actor>[]) {
    setTimeout(()=>{
      fromGroup.push(this.actors);
      fromGroup.push(this.actorsByType[actor.type]);
      for (var group of fromGroup) {
        var i = group.indexOf(actor);
        if (i !== -1) {
          group.splice(i,1);
          group.push(actor);
        }
      }
    });
  }

  bringActorToBack(actor:Actor, ...fromGroup:Array<Actor>[]) {
    setTimeout(()=>{
      fromGroup.push(this.actors);
      fromGroup.push(this.actorsByType[actor.type]);
      for (var group of fromGroup) {
        var i = group.indexOf(actor);
        if (i !== -1) {
          group.splice(i,1);
          group.unshift(actor);
        }
      }
    });
  }

  addSprite(sprite:Sprite) {
    this.spritesByFirstGid[sprite.firstGid] = sprite;
    this.spritesByName[sprite.name] = sprite;
    sprite.ctx = this.game.ctx;
    if (!sprite.img.complete) {
      this.game.loading++;
      sprite.img.addEventListener("load", () => {
        this.game.loaded++;
      });
    }
  }
  getSpriteByGid(gid:number) {
    while (gid > -1 && !this.spritesByFirstGid[gid]) {
      gid--;
    }
    return this.spritesByFirstGid[gid];
  }
  getSpriteByName(name:string) {
    return this.spritesByName[name];
  }

  onOverlap(a:Actor|Array<Actor>, b:Actor|Array<Actor>, resolver:Function, context:Object=this) {
    if (!(a && b && resolver)) return;
    if (a instanceof Actor) a = [ a ];
    if (b instanceof Actor) b = [ b ];
    for (var actorA of a) {
      for (var actorB of b) {
        if (actorA !== actorB && actorA.overlapsWith(actorB)) {
          resolver.call(context, actorA, actorB);
        }
      }
    }
  }

  clearAllAlarms() {
    this._alarms = [];
  }

  setAlarm(frames:number, cb:Function) {
    let alarm = {
      frames: frames,
      cb: cb
    };
    this._alarms.push(alarm);
    return alarm;
  }

  clearAlarm(alarm:any) {
    setTimeout(()=>{
      let i = this._alarms.indexOf(alarm);
      if (i > -1) {
        this._alarms.splice(i, 1);
      }
    });
  }

  click(x:number, y:number) {
    let m = new Vector2(x,y);
    let p = new Vector2();
    this.mouse.copyFrom(m);
    this.mouse.add(this.camera);
    for (var actor of this.actors) {
      p.copyFrom(this.camera).multiplyXY(actor.parallax).add(m);
      if (actor.overlapsWithPoint(p)) actor.click();
    }
  }


  /*
    _privates
  */
  private _alarms:Array<any>=[];

}
