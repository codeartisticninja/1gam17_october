"use strict";
import Vector2 from "../../utils/Vector2";


/**
 * Sprite class
 * 
 * @date 04-oct-2017
 */

export default class Sprite {
  ctx:CanvasRenderingContext2D;
  name:string;
  img:HTMLImageElement;
  size:Vector2;
  firstGid:number;
  frames:number;
  columns:number;
  margin:number=0;
  spacing:number=0;

  constructor(obj?:any, mapFolder="./") {
    if (obj) {
      this.name = obj.name;
      this.img = new Image(obj.imagewidth, obj.imageheight);
      this.img.src = mapFolder + obj.image;
      this.size = new Vector2(obj.tilewidth, obj.tileheight);
      this.firstGid = obj.firstgid;
      this.frames = obj.tilecount;
      this.columns = obj.columns;
      this.margin = obj.margin || 0;
      this.spacing = obj.spacing || 0;
    } else {
      this.img = new Image();
      this.size = new Vector2();
    }
  }

  draw(col:number, row=0, topLeft:Vector2, size:Vector2=this.size) {
    if (!this.img.width) return;
    if (!this.columns) {
      this.columns = Math.floor((this.img.width - this.margin)/(this.size.x + this.spacing));
    }
    while (col >= this.columns) {
      col -= this.columns;
      row++;
    }
    var sx = this.margin + col*(this.size.x + this.spacing);
    var sy = this.margin + row*(this.size.y + this.spacing);
    this.ctx.drawImage(this.img, sx, sy, this.size.x, this.size.y, topLeft.x, topLeft.y, size.x, size.y);
  }

  /*
    _privates
  */
}
