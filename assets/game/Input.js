var Keyboard = require(__dirname+'/Keyboard');
var INPUT_STATE = { DOWN: 1, UP: 0, PRESSED: 2, RELEASED: -1 };

var Input = {
  _mouse: { x: 0, y: 0, down: 0 },
  _keys: {},

  init: function () {
    this._mouse = new PIXI.Point(0, 0);
    for (var i = 0, l = Keyboard.codes.length; i < l; i++) {
      this._keys[Keyboard.codes[i]] = 0;
    }
    addEventListeners();
  },

  update: function () {
    for (var i = 0, l = Keyboard.codes.length; i < l; i++) {
      var code = Keyboard.codes[i];
      if (this._keys[code] == INPUT_STATE.PRESSED)  this._keys[code] = INPUT_STATE.DOWN;
      if (this._keys[code] == INPUT_STATE.RELEASED) this._keys[code] = INPUT_STATE.UP;
    }
    if (this._mouse.down == INPUT_STATE.PRESSED) this._mouse.down = INPUT_STATE.DOWN;
    if (this._mouse.down == INPUT_STATE.RELEASED) this._mouse.down = INPUT_STATE.UP;
  },

  keyDown:        function (code) { return this._keys[code] > 0; },
  keyPressed:     function (code) { return this._keys[code] == INPUT_STATE.PRESSED; },
  keyReleased:    function (code) { return this._keys[code] == INPUT_STATE.RELEASED; },
  mouseDown:      function () { return this._mouse.down > 0; },
  mousePressed:   function () { return this._mouse.down == INPUT_STATE.PRESSED; },
  mouseReleased:  function () { return this._mouse.down == INPUT_STATE.RELEASED; },

  get x () { return this._mouse.x; },
  get y () { return this._mouse.y; }
}

addEventListeners = function () {
  window.addEventListener('mousedown',        onMouseDown);
  window.addEventListener('touchstart',       onMouseDown);
  window.addEventListener('mouseup',          onMouseUp);
  window.addEventListener('touchend',         onMouseUp);
  window.addEventListener('mouseupoutside',   onMouseUp);
  window.addEventListener('touchendoutside',  onMouseUp);
  window.addEventListener('mousemove',        onMouseMove);
  window.addEventListener('keydown',          onKeyDown);
  window.addEventListener('keyup',            onKeyUp);
}

onMouseMove = function (e) {
  var canvas = Game.renderer.view,
      rect = canvas.getBoundingClientRect(),
      scaleX = canvas.width / rect.width, 
      scaleY = canvas.height / rect.height;

  Input._mouse.x = (e.clientX - rect.left) * scaleX;
  Input._mouse.y = (e.clientY - rect.top) * scaleY;
}
onMouseDown = function (e) { Input._mouse.down      = INPUT_STATE.PRESSED; }
onMouseUp   = function (e) { Input._mouse.down      = INPUT_STATE.RELEASED; }
onKeyDown   = function (e) { Input._keys[e.keyCode] = INPUT_STATE.PRESSED; }
onKeyUp     = function (e) { Input._keys[e.keyCode] = INPUT_STATE.RELEASED; }


module.exports = Input;
