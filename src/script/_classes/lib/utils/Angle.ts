"use strict";

/**
 * Angle class
 * 
 * @date 13-oct-2017
 */

var pool:Angle[]=[];

export default class Angle {

  static dispense() {
    return pool.pop() || new Angle();
  }

  recycle() {
    if (pool.indexOf(this) !== -1) return;
    pool.push(this);
  }

  constructor(public rad=0) {
    this.normalize();
  }

  get deg() {
    return this.rad/Math.PI * 180;
  }
  set deg(deg:number) {
    this.rad = deg/180 * Math.PI;
  }

  set(rad:number) {
    this.rad = rad;
    return this.normalize();
  }

  copyFrom(a:Angle) {
    return this.set(a.rad);
  }

  copyTo(a:Angle) {
    return a.set(this.rad);
  }

  addRad(rad:number, result=this) {
    result.rad = this.rad + rad;
    return result.normalize();
  }

  add(a:Angle, result=this) {
    return this.addRad(a.rad, result);
  }

  subtractRad(rad:number, result=this) {
    return this.addRad(-rad, result);
  }

  subtract(a:Angle, result=this) {
    return this.subtractRad(a.rad, result);
  }

  multiply(rad:number, result=this) {
    result.rad = this.rad * rad;
    return result.normalize();
  }

  normalize(result=this) {
    result.rad = this.rad;
    while (result.rad < -Math.PI) result.rad += Math.PI*2;
    while (result.rad > Math.PI) result.rad += -Math.PI*2;
    return result;
  }

  perp(result=this) {
    result.rad = this.rad + Math.PI/2;
    return result.normalize();
  }

}
