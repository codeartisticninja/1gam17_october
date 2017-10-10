"use strict";
import Actor from "./Actor";
import Scene from "../Scene";

/**
 * Text class
 * 
 * @date 04-oct-2017
 */

export default class Text extends Actor {
  public fontSize:number=20;
  public lineHeight:number=1;
  public fontStyle:string="";
  public fontFamily:string="";
  public textBaseline:string="top";
  public color:string="";
  public outline:string;
  public lines:string[]=[];

  set text(txt:string) {
    if (this._text != txt) {
      this._text = txt;
      this.lines = [];
    }
  }
  get text() {
    return this._text;
  }

  set textAlign(val:string) {
    this._textAlign = val;
    switch(val) {
      case "left":
        this.setAnchor(0, 0);
        break;
      case "center":
        this.setAnchor(this.size.x/2, 0);
        break;
      case "right":
        this.setAnchor(this.size.x, 0);
        break;
    }
  }
  get textAlign() {
    return this._textAlign;
  }

  constructor(scene:Scene, obj?:any) {
    super(scene, obj);
    this.setAnchor(0);
    if (typeof obj.text === "object") {
      if (obj.text.italic) this.fontStyle += "italic ";
      if (obj.text.bold) this.fontStyle += "bold ";
      this.textAlign = obj.text.halign || "left";
      this.fontFamily = obj.text.fontfamily || "sans-serif";
      this.fontSize = obj.text.pixelsize || 20;
      this.color = obj.text.color || "black";
      this.text = obj.text.text || location.search;
    }
  }

  render() {
    var g = this.scene.game.ctx, x=0, y=0;
    g.font = this.fontStyle + " " + this.fontSize + "px " + this.fontFamily;
    g.textBaseline = this.textBaseline;
    g.textAlign    = this.textAlign;
    if (!this.lines.length) this._wrap();
    if (this.color) {
      y = 0;
      g.fillStyle = this.color;
      for (var txt of this.lines) {
        g.fillText(txt, x, y);
        y += this.fontSize * this.lineHeight;
      }
    }
    if (this.outline) {
      y = 0;
      g.strokeStyle = this.outline;
      for (var txt of this.lines) {
        g.strokeText(txt, x, y);
        y += this.fontSize * this.lineHeight;
      }
    }
  }

  /*
    _privates
  */
  public _textAlign:string="left";
  private _text:string="";

  private _wrap() {
    var g = this.scene.game.ctx, i = 0, y = 0;
    this.lines = this._text.split("\n");
    while (i < this.lines.length) {
      if (g.measureText(this.lines[i]).width > this.size.x) {
        this.lines.splice(i+1, 0, "");
      }
      while (g.measureText(this.lines[i]).width > this.size.x) {
        this.lines[i+1] = (this.lines[i].substr(this.lines[i].lastIndexOf(" ")) + " " + this.lines[i+1]).trim();
        this.lines[i] = this.lines[i].substr(0, this.lines[i].lastIndexOf(" ")).trim();
      }
      i++;
      y += this.fontSize * this.lineHeight;
    }
  }

}
