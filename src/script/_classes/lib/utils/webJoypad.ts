"use strict";
import Vector2 from "./Vector2";

/**
 * joypad module for unified game controls on the web
 * 
 * @date 04-oct-2017
 */
if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = webkitRequestAnimationFrame || function(cb:Function){ return setTimeout(cb, 32) };
  window.cancelAnimationFrame = webkitCancelAnimationFrame || clearTimeout;
}
interface JoyTouch {
    id:any,
    btn:boolean,
    center:Vector2,
    dir:Vector2
}

module joypad {
  export var
    enabled:boolean  = false,
    device:string    = ""+localStorage.getItem("joypad.device"),
    mode:string,
    UIparent:HTMLElement = document.body,

    dir:Vector2  = new Vector2(),
    fire:boolean = false,
    delta:any    = { dir:0, fire:0 }

  export function enable(devices:string[] = ["keyboard", "touch", "gamepad"], autoUpdate=false) {
    if (_suspended != null) {
      for (var device of devices) {
        if (_suspended.indexOf(device) === -1) {
          _suspended.push(device);
        }
      }
      return;
    }
    for (var device of devices) {
      switch (device) {
        case "keyboard":
          if (!_keyboardEnabled) {
            document.body.addEventListener("keydown", _onKeyDown);
            document.body.addEventListener("keyup", _onKeyUp);
            _keysDown = {};
          }
          _keyboardEnabled = true;
          break;
        case "touch":
          if (!_touchEnabled) {
            document.body.addEventListener("touchstart", _showUI);
            document.body.addEventListener("touchmove", _onTouchMove);
            document.body.addEventListener("touchend", _onTouchUp);
            if (joypad.device === "touch") _showUI();
            _leftThumb = _createJoyTouch();
            _rightThumb = _createJoyTouch();
            _leftThumb.center.x = 32;
          }
          _touchEnabled = true;
          break;
        case "gamepad":
          _gamepadEnabled = true;
      }
    }
    if (autoUpdate) {
      return joypad.autoUpdate();
    }
  }

  export function disable(devices:string[] = ["keyboard", "touch", "gamepad"]) {
    if (_suspended != null) {
      for (var device of devices) {
        var i = _suspended.indexOf(device);
        if (i !== -1) {
          _suspended.splice(i, 1);
        }
      }
      return;
    }
    for (var device of devices) {
      switch (device) {
        case "keyboard":
          if (_keyboardEnabled) {
            document.body.removeEventListener("keydown", _onKeyDown);
            document.body.removeEventListener("keyup", _onKeyUp);
          }
          _keyboardEnabled = false;
          break;
        case "touch":
          if (_touchEnabled) {
            document.body.removeEventListener("touchstart", _showUI);
            document.body.removeEventListener("touchmove", _onTouchMove);
            document.body.removeEventListener("touchend", _onTouchUp);
          }
          _hideUI();
          _touchEnabled = false;
          break;
        case "gamepad":
          _gamepadEnabled = false;
      }
    }
    cancelAnimationFrame(_updateTO);
    joypad.dir.set(0);
    joypad.fire = false;
  }

  export function suspend() {
    if (_suspended != null) {
      return;
    }
    var devices:string[] = [];
    if (_keyboardEnabled) {
      devices.push("keyboard");
    }
    if (_touchEnabled) {
      devices.push("touch");
    }
    if (_gamepadEnabled) {
      devices.push("gamepad");
    }
    joypad.disable(devices);
    return _suspended = devices;
  }

  export function resume() {
    if (_suspended == null) {
      return;
    }
    var devices:string[] = _suspended;
    _suspended = null;
    joypad.enable(devices);
  }

  export function update() {
    cancelAnimationFrame(_updateTO);
    joypad.dir.set(0);
    joypad.fire = false;
    if (_keyboardEnabled) {
      _scanKeys();
    }
    if (_touchEnabled) {
      _scanTouches();
    }
    if (_gamepadEnabled) {
      _scanGamepad();
    }
    _updateUI();
    for (var key in joypad.delta) {
      if ((<any>joypad)[key] instanceof Vector2) {
        if (!(joypad.delta[key] instanceof Vector2)) joypad.delta[key] = new Vector2();
        if (!(_lastState[key] instanceof Vector2)) _lastState[key] = new Vector2();
        (<any>joypad)[key].subtract(_lastState[key], joypad.delta[key]);
        _lastState[key].copyFrom((<any>joypad)[key]);
      } else {
        joypad.delta[key] = (<any>joypad)[key] - _lastState[key];
        _lastState[key] = (<any>joypad)[key];
      }
    }
  }

  export function autoUpdate() {
    joypad.update();
    return _updateTO = requestAnimationFrame(joypad.autoUpdate);
  }


  /*
    _keyboard_privates
  */
  var
    _keyboardEnabled:boolean,
    _keyMap:string[]    = _getKeyMap(),
    _keysDown:{[index:string]:boolean} = {},
    _shiftKey:boolean,
    _;

  function _scanKeys() {
    if (joypad.device !== "keyboard") return;
    if (_keysDown["left"])  joypad.dir.x = -1;
    if (_keysDown["right"]) joypad.dir.x =  1;
    if (_keysDown["up"])    joypad.dir.y = -1;
    if (_keysDown["down"])  joypad.dir.y =  1;
    if (_keysDown["fire"])  joypad.fire  = true;
    if (joypad.dir.magnitude) joypad.dir.magnitude = _shiftKey ? .45 : 1;
  }

  function _getKeyMap() {
    var map:string[] = [],
        ctrls:{[index:string]:number[]} = {
          "left": [37, 65],
          "right": [39, 68],
          "up": [38, 87, 80],
          "down": [40, 83, 76],
          "fire": [88, 69, 79, 32, 90, 81, 75, 13]
        };
    for (var ctrl in ctrls) {
      var keys = ctrls[ctrl];
      for (var key of keys) {
        map[key] = ctrl;
      }
    }
    return map;
  }

  function _onKeyDown(e:KeyboardEvent) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    var ctrl = _keyMap[e.keyCode];
    _shiftKey = e.shiftKey;
    localStorage.setItem("joypad.device", joypad.device = "keyboard");
    // _hideUI();
    if (ctrl) {
      switch (ctrl) {
        case "left": case "right":
          _keysDown["left"] = _keysDown["right"] = false; break;
        case "up": case "down":
          _keysDown["up"] = _keysDown["down"] = false;
      }
      _keysDown[ctrl] = true;
      e.preventDefault();
    } else {
      console.log("keyCode:", e.keyCode, e);
    }
  }

  function _onKeyUp(e:KeyboardEvent) {
    var ctrl = _keyMap[e.keyCode];
    _shiftKey = e.shiftKey;
    if (ctrl) {
      _keysDown[ctrl] = false;
    }
    switch (e.keyCode) {
      case 68:
        _keyMap[83] = "down";
        break;
      case 76:
        _keyMap[83] = "right";
    }
  }


  /*
    _touch_privates
  */
  var
    _touchEnabled:boolean,
    _touchUI:HTMLElement,
    _leftThumb:JoyTouch,
    _rightThumb:JoyTouch,
    _stickRadius = 32,
    _;

  function _scanTouches() {
    if (joypad.device !== "touch") return;
    if (joypad.mode === "rc" && window.innerWidth >= 400) {
      joypad.dir.x = _leftThumb.dir.x;
      joypad.dir.y = _rightThumb.dir.y;
    } else if (joypad.mode === "gc" && window.innerWidth >= 400) {
      joypad.dir.copyFrom(_leftThumb.dir);
      joypad.fire = _rightThumb.btn;
    } else {
      joypad.dir.add(_leftThumb.dir);
      joypad.dir.add(_rightThumb.dir);
      if (joypad.dir.magnitude > _stickRadius) {
        joypad.dir.magnitude = _stickRadius;
      }
    }
    joypad.dir.multiplyXY(1/_stickRadius);
    if (_rightThumb.btn && _rightThumb.id == null) {
      _rightThumb.btn = false;
      joypad.fire = true;
    }
  }

  function _onTouchDown(e:TouchEvent) {
    if (!_touchEnabled) { _hideUI(); return; }
    var leftPad  = <HTMLElement>_touchUI.querySelector(".left");
    var rightPad = <HTMLElement>_touchUI.querySelector(".right");
    for (var j = 0; j < e.changedTouches.length; j++) {
      var touchEvent = e.changedTouches[j];
      var touch:JoyTouch|null=null;
      if (leftPad === touchEvent.target || leftPad.contains(<Node>touchEvent.target)) {
        touch = _leftThumb;
        _touchUI.classList.remove("inactive");
      }
      if (rightPad === touchEvent.target || rightPad.contains(<Node>touchEvent.target)) {
        touch = _rightThumb;
        _touchUI.classList.remove("inactive");
      }
      if (touch) {
        touch.id = touchEvent.identifier;
        touch.center.set(touchEvent.clientX, touchEvent.clientY);
        touch.dir.set(0);
        touch.btn = true;
      }
    }
    e.preventDefault();
  }

  function _onTouchMove(e:TouchEvent) {
    for (var j = 0; j < e.changedTouches.length; j++) {
      var touchEvent = e.changedTouches[j];
      var touch:JoyTouch|null=null;
      if (_leftThumb.id === touchEvent.identifier) touch = _leftThumb;
      if (_rightThumb.id === touchEvent.identifier) touch = _rightThumb;
      if (touch) {
        touch.dir.set(touchEvent.clientX, touchEvent.clientY);
        touch.dir.subtract(touch.center);
        if (touch.dir.magnitude > _stickRadius/3) {
          touch.btn = false;
          if (touch.dir.magnitude > _stickRadius) {
            touch.dir.magnitude -= _stickRadius;
            touch.center.add(touch.dir);
            touch.dir.magnitude = _stickRadius;
          }
        }
        e.preventDefault();
      }
    }
  }

  function _onTouchUp(e:TouchEvent) {
    if (_leftThumb.id == null && _rightThumb.id == null) {
      _touchUI.classList.add("inactive");
    }
    for (var j = 0; j < e.changedTouches.length; j++) {
      var touchEvent = e.changedTouches[j];
      var touch:JoyTouch|null=null;
      if (_leftThumb.id === touchEvent.identifier)  touch = _leftThumb;
      if (_rightThumb.id === touchEvent.identifier) touch = _rightThumb;
      if (touch) {
        touch.id = null;
        touch.dir.set(0);
      }
    }
  }

  function _showUI() {
    localStorage.setItem("joypad.device", joypad.device = "touch");
    if (!_touchUI) {
      _touchUI = document.createElement("div");
      _touchUI.id = "webJoypad";
      _touchUI.classList.add("hidden");
      _touchUI.classList.add("inactive");
      _touchUI.innerHTML = `
        <div class="left">
          <div class="slider">
            <div class="knob"></div>
          </div>
        </div><div class="right">
          <div class="fire"></div>
          <div class="slider">
            <div class="knob"></div>
          </div>
        </div>`;
      joypad.UIparent.appendChild(_touchUI);
      var leftPad  = <HTMLElement>_touchUI.querySelector(".left");
      var rightPad = <HTMLElement>_touchUI.querySelector(".right");
      leftPad.addEventListener( "touchstart", _onTouchDown);
      rightPad.addEventListener("touchstart", _onTouchDown);
    }
    setTimeout(()=>{ _touchUI.classList.remove("hidden"); }, 50);
    if (joypad.mode === "rc") {
      _touchUI.classList.add("rc");
      _touchUI.classList.remove("gc");
    } else if (joypad.mode === "gc") {
      _touchUI.classList.remove("rc");
      _touchUI.classList.add("gc");
    } else {
      _touchUI.classList.remove("rc");
      _touchUI.classList.remove("gc");
    }
}
  function _hideUI() {
    if (!_touchUI) return;
    _touchUI.classList.add("hidden");
    _touchUI.classList.add("inactive");
    // setTimeout(()=>{ _touchUI.classList.add("inactive"); }, 1024);
    var leftKnob  = <HTMLElement>_touchUI.querySelector(".left  .knob");
    var rightKnob = <HTMLElement>_touchUI.querySelector(".right .knob");
    leftKnob.removeAttribute("style");
    rightKnob.removeAttribute("style");
  }
  function _updateUI() {
    if (!_touchUI) return;
    var leftSlider  = <HTMLElement>_touchUI.querySelector(".left .slider");
    var rightSlider = <HTMLElement>_touchUI.querySelector(".right .slider");
    var leftKnob    = <HTMLElement>_touchUI.querySelector(".left  .knob");
    var rightKnob   = <HTMLElement>_touchUI.querySelector(".right .knob");
    var fireBtn     = <HTMLElement>_touchUI.querySelector(".fire");
    if (_touchUI.classList.contains("inactive")) {
      leftSlider.removeAttribute("style");
      rightSlider.removeAttribute("style");
      fireBtn.removeAttribute("style");
    } else {
      leftSlider.style.left = _leftThumb.center.x + "px";
      leftSlider.style.bottom = (window.innerHeight - _leftThumb.center.y) + "px";
      rightSlider.style.right = (window.innerWidth - _rightThumb.center.x) + "px";
      rightSlider.style.bottom = (window.innerHeight - _rightThumb.center.y) + "px";
      fireBtn.style.right = (window.innerWidth - _rightThumb.center.x - 32) + "px";
      fireBtn.style.bottom = (window.innerHeight - _rightThumb.center.y + 32) + "px";
    }
    if (joypad.mode === "rc") {
      leftKnob.style.left = (1+joypad.dir.x) + "em";
      rightKnob.style.top = (1+joypad.dir.y) + "em";
    } else {
      leftKnob.style.left = (1+joypad.dir.x) + "em";
      leftKnob.style.top  = (1+joypad.dir.y) + "em";
      if (joypad.mode !== "gc" || window.innerWidth < 400) {
        rightKnob.style.left = (1+joypad.dir.x) + "em";
        rightKnob.style.top  = (1+joypad.dir.y) + "em";
      }
    }
    if (_rightThumb.btn) {
      fireBtn.classList.add("pending");
    } else {
      fireBtn.classList.remove("pending");
    }
    if (joypad.fire) {
      fireBtn.classList.add("pressed");
    } else {
      fireBtn.classList.remove("pressed");
    }
  }

  function _createJoyTouch():JoyTouch {
    return {
      id:null,
      btn:false,
      center: new Vector2(window.innerWidth-32, window.innerHeight),
      dir: new Vector2()
    };
  }

  /*
    _gamepad_privates
  */
  var
    _gamepadEnabled:boolean,
    _activatingGamepad:boolean,
    _goingBack=0,
    _;

  function _scanGamepad() {
    var gamepad = navigator.getGamepads != null ? navigator.getGamepads()[0] : null;
    if (!gamepad) return;
    var btn:boolean[] = [];
    for (var b of gamepad.buttons) btn.push(b.pressed);
    if (btn[0]) _activatingGamepad = true;
    if (_activatingGamepad && !btn[0]) {
      localStorage.setItem("joypad.device", joypad.device = "gamepad");
      _activatingGamepad = false;
    }
    if (joypad.device !== "gamepad") return;

    joypad.dir.x = gamepad.axes[0] || 0;
    if (joypad.mode === "rc") {
      joypad.dir.y = gamepad.axes[3] || 0;
    } else {
      joypad.dir.y = gamepad.axes[1] || 0;
    }
    if (joypad.mode === "gc") {
      joypad.fire = btn[0] || btn[1] || btn[2] || btn[3];
    } else {
      joypad.fire = btn[0] || btn[2];
      if (btn[1]) joypad.dir.y = -1;
      if (btn[3]) joypad.dir.y = 1;
    }
    if (btn[12]) joypad.dir.y = -1;
    if (btn[13]) joypad.dir.y = 1;
    if (btn[14]) joypad.dir.x = -1;
    if (btn[15]) joypad.dir.x = 1;
    if (joypad.dir.magnitude < .2) joypad.dir.set(0);
    if (joypad.dir.magnitude > 1) joypad.dir.magnitude = 1;

    if (btn[8]) {
      _goingBack--;
      if (_goingBack === 0) history.back();
    } else {
      _goingBack = 1;
    }
    if (btn[9]) {
      var el:any = document.querySelector(":focus");
      if (el) {
        el.click();
        el.blur();
      }
    }
  }

  /*
    _privates
  */
  var
    _updateTO:any,
    _lastState:any = {},
    _suspended:string[]|null,
    _;

}
export default joypad;
