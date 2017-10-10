"use strict";
import Tween from "./Tween";

/**
 * MediaPlayer class
 * 
 * @date 04-oct-2017
 */

export default class MediaPlayer {
  public players:HTMLAudioElement[]=[];

  get enabled() {
    return this._enabled;
  }
  set enabled(val:boolean) {
    this._enabled = val;
    if (val) {
      this.players[0].play();
    } else {
      this.players[0].pause();
    }
  }
  get volume() {
    return this._volume;
  }
  set volume(val:number) {
    this._volume = val;
    this.players[0].volume = val;
  }

  constructor(url?:string) {
    this._unlockPlayers = this._unlockPlayers.bind(this);
    this.players.push(new Audio());
    this.players.push(new Audio());
    if (this.enabled) {
      document.body.addEventListener("click", this._unlockPlayers);
      document.body.addEventListener("keypress", this._unlockPlayers);
      if (url) this.play(url);
    }
  }

  play(url:string, loop=false, fadeDuration=1024) {
    var player:HTMLAudioElement;
    if (!this.enabled) return false;
    this.pause(fadeDuration);
    this.players.push(<HTMLAudioElement>this.players.shift());
    player = this.players[0];
    player.src = url;
    player.volume = this.volume;
    player.loop = loop;
    let p = player.play();
    p && p.catch && p.catch((error) => {
      this._unlockThisPlayer(player);
    });
  }

  pause(fadeDuration=1024) {
    var player:HTMLAudioElement;
    player = this.players[0];
    new Tween(player, { volume: 0 }, fadeDuration);
    setTimeout(()=>{
      player.pause();
    }, fadeDuration);
  }

  applyVolume() {
    this.players[0].volume = this.volume;
  }

  /*
    _privates
  */
  private _enabled=true;
  private _volume=1;

  private _unlockPlayers() {
    var player:HTMLAudioElement, i=0;
    for (player of this.players) {
      player.play();
      // if (i++) player.pause();
    }
    document.body.removeEventListener("click", this._unlockPlayers);
    document.body.removeEventListener("keypress", this._unlockPlayers);
  }

  private _unlockThisPlayer(player:HTMLAudioElement) {
    var cb = ()=>{
      let p = player.play();
      p && p.then && p.then(()=>{
        document.body.removeEventListener("click",cb);
        document.body.removeEventListener("keypress",cb);
      });
    };
    document.body.addEventListener("click",cb);
    document.body.addEventListener("keypress",cb);
  }

}
