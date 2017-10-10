"use strict";
import web from "./web";

/**
 * Sound class
 * 
 * @date 04-oct-2017
 */

interface Mark {
  start:number,
  duration?:number
}

export default class Sound {
  static enabled=true;
  static volume=1;
  static ctx:AudioContext;
  gainNode:GainNode;
  mainNode:AudioNode;
  file:string;
  source:AudioBufferSourceNode|null;
  buffer:AudioBuffer;
  marks:{[index:string]: Mark} = {};
  oneInstance:boolean;

  constructor(src:string, cb?:Function) {
    if (!Sound.ctx) {
      Sound.ctx = new (AudioContext || (<any>window)["webkitAudioContext"])();
    }
    this.gainNode = Sound.ctx.createGain();
    this.gainNode.gain.value = Sound.volume;
    this.gainNode.connect(Sound.ctx.destination);
    this.mainNode = this.gainNode;

    this.setMark("_all", 0);
    this.load(src, ()=>{
      if (this._playOnLoad) {
        this.play(this._playOnLoad);
      }
      cb && cb();
    });
  }

  load(src=this.file, cb?:Function) {
    if (!Sound.enabled) return;
    this.file = src;
    web.get(src, { responseType: "arraybuffer" }, (req:XMLHttpRequest)=>{
      var data = req.response;
      Sound.ctx.decodeAudioData(data, (buffer)=>{
        this.buffer = buffer;
        cb && cb();
      });
    });
  }

  play(mark="_all", loop=false) {
    if (this.source && this.oneInstance) {
      this.source.stop();
    }
    if (!this.buffer) {
      this._playOnLoad = mark;
      return;
    }
    this.source = Sound.ctx.createBufferSource();
    this.source.connect(this.mainNode);
    this.source.buffer = this.buffer;
    this.source.start(0, this.marks[mark].start, this.marks[mark].duration);
    if (loop && this.source.addEventListener) {
      this.source.addEventListener("ended", ()=>{
        this.source && this.play(mark, loop);
      })
    }
    this._playOnLoad=null;
  }

  stop() {
    if (this.source) {
      try {
        this.source.stop();
      } catch (error) {
      }
      this.source = null;
    }
    this._playOnLoad=null;
  }

  setMark(name:string, start:number, duration?:number) {
    this.marks[name] = {
      start: start,
      duration: duration
    };
  }


  /*
    _privates
  */
  private _playOnLoad:string|null;
}
