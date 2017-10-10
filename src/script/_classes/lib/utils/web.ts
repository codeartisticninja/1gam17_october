"use strict";
import lazyJSON from "./lazyJSON";

/**
 * web module
 * 
 * @date 04-oct-2017
 */

module web {
  export function get(url:string, options?:any, cb?:Function) {
    let req = new XMLHttpRequest();
    if (options) {
      if (typeof options === "function") cb = <Function>options;
      else {
        lazyJSON.setProperties(options, req);
      }
    }
    req.open("GET", url, true);
    req.addEventListener("loadend", function(e:ProgressEvent){
      cb && cb(req);
    })
    req.send();
    return req;
  }

  export function basename(path:string) {
    return path.substr(path.lastIndexOf("/")+1);
  }
  export function dirname(path:string) {
    if (path.substr(-3) === "/..") return path + "/..";
    if (path.indexOf("/")<0) path = "./" + path;
    return path.substr(0, path.lastIndexOf("/")||1);
  }

  export function parseUrl(url:string) {
    let out:{[index:string]:string} = {};
    if (url.indexOf("#")>=0) {
      out.fragment = url.substr(url.indexOf("#")+1);
      url = url.substr(0, url.indexOf("#"));
    }
    if (url.indexOf("?")>=0) {
      out.query = url.substr(url.indexOf("?")+1);
      url = url.substr(0, url.indexOf("?"));
    }
    if (url[0] === "/") {
      if (url[1] === "/") {
        url = ":" + url;
      } else {
        out.path = url;
        url = "";
      }
    } 
    if (url) {
      if (url.indexOf(":")>=0) {
        if (url.indexOf("://")>=0) {
          out.scheme = url.substr(0, url.indexOf("://")+3);
          url = url.substr(url.indexOf("://")+3);
          if (out.scheme[0] === ":") out.scheme = "//";
        } else {
          out.scheme = url.substr(0, url.indexOf(":")+1);
          url = url.substr(url.indexOf(":")+1);
        }
        if (url.indexOf("@")>=0) {
          out.user = url.substr(0, url.indexOf("@"));
          url = url.substr(url.indexOf("@")+1);
          if (out.user.indexOf(":")>=0) {
            out.password = out.user.substr(url.indexOf(":")+1);
            out.user = out.user.substr(0, url.indexOf(":"));
          }
        }
        if (url.indexOf("/")<0) url += "/";
        if (url.indexOf(":")>=0) {
          out.host = url.substr(0, url.indexOf(":"));
          url = url.substr(url.indexOf(":")+1);
          out.port = url.substr(0, url.indexOf("/"));
          url = url.substr(url.indexOf("/"));
        }
        out.host = url.substr(0, url.indexOf("/"));
        url = url.substr(url.indexOf("/"));
      }
      out.path = url;
      url = "";
    }
    return out;
  }

  export function stringifyUrl(url:{[index:string]:string}) {
    let str = "";
    if (url.scheme) str += url.scheme;
    if (url.user) {
      str += url.user;
      if (url.password) {
        str += ":" + url.password;
      }
      str += "@";
    }
    if (url.host) str += url.host;
    if (url.port) str += ":" + url.port;
    if (url.path) str += url.path;
    if (url.query) str += "?" + url.query;
    if (url.fragment) str += "#" + url.fragment;
    return str;
  }

  export function resolveUrl(abs:string, rel:string) {
    let absUrl = parseUrl(abs);
    let relUrl = parseUrl(rel);
    absUrl.fragment = relUrl.fragment;
    if (relUrl.query) absUrl.query = relUrl.query;
    if (relUrl.path) {
      absUrl.query = relUrl.query;
      if (relUrl.path[0] === "/") {
        absUrl.path = relUrl.path;
      } else {
        absUrl.path = dirname(absUrl.path) + "/" + relUrl.path;
      }
    }
    if (relUrl.host) {
      absUrl.user = relUrl.user;
      absUrl.password = relUrl.password;
      absUrl.host = relUrl.host;
      absUrl.port = relUrl.port;
    }
    if ((relUrl.scheme||"").length > 3) {
      absUrl.scheme = relUrl.scheme;
    }
    let dirs = absUrl.path.substr(1).split("/");
    if (!dirs.length) dirs.push("");
    absUrl.path = "";
    for (let dir of dirs) {
      if (dir === "..") {
        absUrl.path = dirname(absUrl.path);
      } else if (dir !== ".") {
        absUrl.path += "/" + dir;
      }
    }
    return stringifyUrl(absUrl);
  }

}
export default web;
