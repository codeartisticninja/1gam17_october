"use strict";
import web from "./web";

/**
 * Script class
 * 
 * @date 04-oct-2017
 */

export default class Script {
  public url:string;
  public storyTree:XMLDocument;
  public commands: { [key:string]:Function }={};
  public current:Element|null;
  // public next:Element;

  constructor(url?:string, public variables:any={}) {
    this.commands["p"] = (attrs:any, body:string, el:Element, cb:Function) => {
      console.log(body);
      setTimeout(cb, body.length*100);
    }
    this.commands["pre"] = (attrs:any, body:string) => {
      this.goto(body.trim()||"+");
    }
    if (url) this.load(url, ()=>{ this.goto("story"); });
  }

  load(url:string, cb?:Function) {
    web.get(url, { responseType: "document" } ,(r:XMLHttpRequest)=>{
      this.url = url;
      this.storyTree = r.response;
      this._IdEverything();
      cb && cb();
    });
  }

  continue(current:Element|null) {
    this.current = current;
    if (!current) return;
    var cond = this._lazyJSON(this._evaluate(current.getAttribute("if") || "true"));
    if (!cond) {
      this.continue(current.nextElementSibling);
      return;
    }
    if (this.commands[current.tagName]) {
      var attrs = this._getAttributes(current);
      var el = <Element>this.storyTree.importNode(current, true);
      this._cullChildren(el);
      var body = this._evaluate(""+el.textContent);
      var done = false;
      this.commands[current.tagName](attrs, body, el, ()=>{
        if (done=!done) this.continue(current.nextElementSibling);
        done=true;
      });
    } else {
      this.variables[current.id+"_v"] = this.getVisits("")+1;
      this.continue(current.firstElementChild);
    }
    this.current = null;
  }

  goto(path:string) {
    console.log("GOTO", path);
    this.continue(this.getElement(path));
  }

  getVisits(path:string=".", el=this.current) {
    el = this.getElement(path, el);
    return el && this.variables[el.id+"_v"] || 0;
  }
  getElement(path:string, el=this.current) {
    while (path && el) {
      switch (path[0]) {
        case ".":
          el = el.parentElement;
          path = path.substr(1).trim();
          break;
        case "/":
          el = el.firstElementChild;
          path = path.substr(1).trim();
          break;
        case "+":
          el = el.nextElementSibling;
          path = path.substr(1).trim();
          break;
        case "-":
          el = el.previousElementSibling;
          path = path.substr(1).trim();
          break;
      
        default:
          el = this.storyTree.querySelector(path);
          path = "";
          break;
      }
    }
    return el;
  }

  /*
    _privates
  */
  private _nextId=0;

  private _lazyJSON(json:string) {
    try {
      return JSON.parse(json);
    } catch (err) {
      return json;
    }
  }

  private _IdEverything() {
    var els = this.storyTree.querySelectorAll("*");
    var el:Element, i=0;
    var name = this.url.substr(this.url.lastIndexOf("/")+1).replace(".xml", "");
    while (i < els.length) {
      el = els.item(i);
      if (!el.id) {
        el.id = "_" + name + (this._nextId++);
      }
      i++;
    }
  }
  private _cullChildren(el:Element) {
    var child = el.firstElementChild;
    while (child) {
      var attrs = this._getAttributes(child);
      if (!attrs["if"]) {
        child.parentElement && child.parentElement.removeChild(child);
      } else {
        for (var name in attrs) {
          child.setAttribute(name, attrs[name]);
        }
        child.innerHTML = "";
      }
      child = child.nextElementSibling;
    }
  }

  private _getAttributes(el:Element) {
    var out:{[key:string]:any} = { "if": true }
    for (var i=0;i<el.attributes.length;i++) {
      var attr = el.attributes[i];
      out[attr.name] = this._lazyJSON(this._evaluate(attr.value));
    }
    return out;
  }

  private _evaluate(str:string) {
    var pos = str.indexOf("{"), brack, res;
    while (pos !== -1) {
      brack = this._getBrack(str, pos);
      if (brack === false) return str;
      res = this._evaluateBrack(""+brack)
      str = str.replace("{"+brack+"}", res);
      pos = str.indexOf("{");
    }
    return str.trim();
  }
  private _evaluateBrack(tag:string) {
    var parts = tag.split("|");
    parts[0] = parts[0].substr(1);
    var visits = this.getVisits(".");
    switch (tag[0]) {
      case "~":
        return parts[Math.floor(Math.random()*parts.length)];
      case "@":
        return parts[(visits-1)%parts.length];
      case "#":
        return parts[Math.min(visits,parts.length)-1];
    
      default:
        return this._evaluateJS(this._specialWords(tag));
    }
  }
  private _evaluateJS(_js:string) {
    var $ = this.variables, s=this;
    return ""+eval(_js);
  }

  private _getBrack(str:string, pos:number):boolean|string {
    var end = this._matchingBrack(str,pos);
    if (end < 0) {
      return false;
    } else {
      return str.substring(pos+1,end);
    }
  }
  private _matchingBrack(str:string, pos:number) {
    var opens = 1, openchar = str[pos], closechar;
    switch (openchar) {
      case "(":
        closechar = ")";
        break;
      case "{":
        closechar = "}";
        break;
      case "[":
        closechar = "]";
        break;
      case "<":
        closechar = ">";
        break;
      case "\"":
        closechar = "\"";
        break;
      case "'":
        closechar = "'";
        break;
    
      default:
        return -1;
    }
    while (opens > 0) {
      pos++;
      if (pos >= str.length) return -1;
      switch (str[pos]) {
        case openchar:
          opens++;
          break;
        case closechar:
          opens--;
          break;
      }
    }
    return pos;
  }
  private _specialWords(str:string) {
    str = str.replace(/(\s|^)AND(\s|$)/g, " && ");
    str = str.replace(/(\s|^)OR(\s|$)/g,  " || ");
    str = str.replace(/(\s|^)NEQ(\s|$)/g, " !== ");
    str = str.replace(/(\s|^)EQ(\s|$)/g,  " === ");
    str = str.replace(/(\s|^)LTE(\s|$)/g, " <= ");
    str = str.replace(/(\s|^)GTE(\s|$)/g, " >= ");
    str = str.replace(/(\s|^)LT(\s|$)/g,  " < ");
    str = str.replace(/(\s|^)GT(\s|$)/g,  " > ");
    return str;
  }

}
