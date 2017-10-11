"use strict";
import Scene    from "../Scene";
import Vector2  from "../../utils/Vector2";
import Sprite   from "./Sprite";
import lazyJSON from "../../utils/lazyJSON";


/**
 * Actor class
 * 
 * @date 11-oct-2017
 */

interface Animation {
  frames:number[];
  speed:number;
}

export default class Actor {
  public name:string;
  public type:string;
  public sprite:Sprite;
  public frame:number=-1;
  public position:Vector2 = new Vector2();
  public scale:Vector2 = new Vector2(1);
  public offset:Vector2 = new Vector2();
  public size:Vector2 = new Vector2(32);
  public shape:string = "aabb";
  public rotation:number=0;
  public opacity:number=1;
  public parallax:number=1;
  public order:number=0;
  public visible:boolean=true;
  
  public velocity:Vector2 = new Vector2();
  public gravity:Vector2;
  public momentum:number=1;
  public friction:number=0;
  public angularVelocity:number=0;
  public angularMomentum:number=1;
  public angularFriction:number=0;

  public animations:{[index:string]:Animation} = {};
  public animation:Animation|null;
  public animationFrame:number;
  public nextAnimation:Animation|null;

  constructor(public scene:Scene, obj?:any) {
    if (obj) {
      this.name = obj.name;
      this.type = obj.type;
      this.visible = obj.visible;
      if (obj.ellipse) this.shape = "circle";
      if (obj.gid != null) {
        this.sprite = this.scene.getSpriteByGid(obj.gid);
        if (this.frame < 0) {
          this.frame = obj.gid - this.sprite.firstGid;
        }
      }
      this.position.x = obj.x || 0;
      this.position.y = (obj.y - (obj.gid==null?0:obj.height)) || 0;
      this.size.x = obj.width || 32;
      this.size.y = obj.height || this.size.x;
      this.setAnchor(this.size.x/2, this.size.y/2);
      setTimeout(()=>{
        lazyJSON.setProperties(obj.properties, this);
      });
    }
  }

  get left() {
    return this.position.x - (this.size.x/2) * Math.abs(this.scale.x);
  }
  get top() {
    return this.position.y - (this.size.y/2) * Math.abs(this.scale.y);
  }
  get right() {
    return this.position.x + (this.size.x/2) * Math.abs(this.scale.x);
  }
  get bottom() {
    return this.position.y + (this.size.y/2) * Math.abs(this.scale.y);
  }
  get radius() {
    return (this.size.x/2) * Math.abs(this.scale.x);
  }

  update() {
    if (this.animation) {
      this.animationFrame += this.animation.speed;
      if (Math.floor(this.animationFrame) >= this.animation.frames.length
          || this.animationFrame < 0) {
        if (this.nextAnimation) {
          this.animation = this.nextAnimation;
          this.nextAnimation = null;
          this.animationFrame = 0;
        } else {
          if (this.animationFrame < 0) {
            this.animationFrame += this.animation.frames.length;
          } else {
            this.animationFrame -= this.animation.frames.length;
          }
        }
      }
      this.frame = this.animation.frames[Math.floor(this.animationFrame)];
    }
    if (this.momentum) {
      this.velocity.add(this.gravity || this.scene.gravity);
      if (this.friction) {
        let mag = this.velocity.magnitude;
        if (mag > this.friction) {
          this.velocity.magnitude = mag - this.friction;
        } else {
          this.velocity.set(0);
        }
      }
      this.velocity.multiplyXY(this.momentum);
      this.position.add(this.velocity);
    }
    if (this.angularMomentum) {
      if (this.angularFriction) {
        if (this.angularVelocity > this.angularFriction) {
          this.angularVelocity -= this.angularFriction;
        } else {
          this.angularVelocity = 0;
        }
      }
      this.angularVelocity *= this.angularMomentum;
      this.rotation += this.angularVelocity;
    }
  }

  render() {
    if (this.sprite)
      this.sprite.draw(this.frame, 0, this.offset);
    if (this.scene.game.debug) {
      let g = this.scene.game.ctx;
      g.rotate(-this.rotation);
      switch (this.shape) {
        case "circle":
          g.beginPath();
          g.arc(0, 0, this.size.x/2, 0, 2*Math.PI);
          g.stroke();
          break;
      
        default:
          g.strokeRect(-(this.size.x/2), -(this.size.y/2), this.size.x, this.size.y);
          break;
      }
      g.rotate(this.rotation);
    }
  }

  overlapsWithPoint(v:Vector2) {
    switch (this.shape) {
      case "circle":
        var l = Math.sqrt(Math.pow(this.position.x-v.x,2) + Math.pow(this.position.y-v.y,2));
        return l < this.radius;
    
      default:
        return v.x > this.left && v.y < this.right &&
            v.y > this.top && v.y < this.bottom;
    }
  }
  overlapsWith(actor:Actor) {
    switch (this.shape) {
      case "circle":
        return this._overlapCircle(
          this.position.x, this.position.y, this.radius,
          actor.position.x, actor.position.y, actor.radius
        );
    
      default:
        return this._overlap2D(this.top, this.left, this.bottom, this.right,
          actor.top, actor.left, actor.bottom, actor.right);
    }
  }
  snapToEdge(obstruction:Actor) {
    var x=0,y=Infinity,l;
    switch (this.shape) {
      case "circle":
        x = this.position.x - obstruction.position.x;
        y = this.position.y - obstruction.position.y;
        l = Math.sqrt(Math.pow(x,2) + Math.pow(y,2));
        l /= this.radius + obstruction.radius;
        x /= l; y /= l;
        this.position.copyFrom(obstruction.position).addXY(x||0,y||0);
        break;
    
      default:
        if (Math.abs(x+y) > Math.abs(obstruction.right - this.left)) {
          x = obstruction.right - this.left; y = 0;
        }
        if (Math.abs(x+y) > Math.abs(obstruction.left - this.right)) {
          x = obstruction.left - this.right; y = 0;
        }
        if (Math.abs(x+y) > Math.abs(obstruction.bottom - this.top)) {
          x = 0; y = obstruction.bottom - this.top;
        }
        if (Math.abs(x+y) > Math.abs(obstruction.top - this.bottom)) {
          x = 0; y = obstruction.top - this.bottom;
        }
        this.position.addXY(x,y);
        break;
    }
  }

  setAnchor(x:number, y=x) {
    this.position.add(this.offset);
    this.offset.set(-x,-y);
    this.position.subtract(this.offset);
  }

  addAnimation(name:string, frames:number[], speed=1) {
    var anim:Animation = {
      frames: frames,
      speed: speed
    }
    this.animations[name] = anim;
  }
  playAnimation(name:string, queue=false) {
    if (queue) {
      this.nextAnimation  = this.animations[name];
    } else {
      if (this.animation != this.animations[name]) {
        this.animation      = this.animations[name];
        this.animationFrame = -this.animation.speed;
      }
    }
  }
  stopAnimation() {
    this.animation = null;
  }

  click() {
  }

  /*
    _privates
  */

  private _overlap1D(a1:number, a2:number, b1:number, b2:number) {
    return Math.max(a1, a2) > Math.min(b1, b2) &&
      Math.min(a1, a2) < Math.max(b1, b2);
  }

  private _overlap2D(ax1:number, ay1:number, ax2:number, ay2:number,
      bx1:number, by1:number, bx2:number, by2:number) {
    return this._overlap1D(ax1, ax2, bx1, bx2) &&
      this._overlap1D(ay1, ay2, by1, by2);
  }

  private _overlapCircle(x1:number, y1:number, r1:number, x2:number, y2:number, r2:number) {
    var l = Math.sqrt(Math.pow(x2-x1,2) + Math.pow(y2-y1,2));
    return l < r1+r2;
  }

}
