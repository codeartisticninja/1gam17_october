"use strict";

/**
 * Vector2 class
 * 
 * @date 13-oct-2017
 */

var pool:Vector2[]=[];

export default class Vector2 {

  static dispense() {
    return pool.pop() || new Vector2();
  }

  recycle() {
    if (pool.indexOf(this) !== -1) return;
    pool.push(this);
  }

  constructor(public x=0, public y=x) {
  }

  get angle() {
    if (this.x === 0 && this.y === 0) return 0;
    return Math.atan2(this.x, -this.y);
  }
  set angle(ang:number) {
    let mag = this.magnitude;
    this.x = Math.sin(ang) * mag;
    this.y = -Math.cos(ang) * mag;
  }

  get magnitude() {
    return Math.sqrt(Math.pow(this.x,2) + Math.pow(this.y,2));
  }
  set magnitude(mag:number) {
    this.normalize();
    this.multiplyXY(mag);
  }

  set(x:number, y:number=x) {
    this.x = x;
    this.y = y;
    return this;
  }

  copyFrom(v:Vector2) {
    return this.set(v.x, v.y);
  }

  copyTo(v:Vector2) {
    return v.set(this.x, this.y);
  }

  addXY(x:number, y:number=x, result=this) {
    result.x = this.x + x;
    result.y = this.y + y;
    return result;
  }

  add(v:Vector2, result=this) {
    return this.addXY(v.x, v.y, result);
  }

  subtractXY(x:number, y:number=x, result=this) {
    return this.addXY(-x, -y, result);
  }

  subtract(v:Vector2, result=this) {
    return this.subtractXY(v.x, v.y, result);
  }

  multiplyXY(x:number, y:number=x, result=this) {
    result.x = this.x * x;
    result.y = this.y * y;
    return result;
  }

  multiply(v:Vector2, result=this) {
    return this.multiplyXY(v.x, v.y, result);
  }

  normalize(result=this) {
    if (this.x === 0 && this.y === 0) {
      result.x = 0;
      result.y = -1;
    } else {
      var l = this.magnitude;
      this.multiplyXY(1/l, undefined, result);
    }
    return result;
  }

  perp(result=this) {
    let {x,y} = this;
    result.x = y;
    result.y = -x;
    return result;
  }

}
