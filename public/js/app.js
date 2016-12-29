/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var PageScripts   = __webpack_require__(1);
	var Dom           = __webpack_require__(2);
	var Game          = __webpack_require__(3);
	var MapScene      = __webpack_require__(15);
	var MapEditScene  = __webpack_require__(32);
	var Unit          = __webpack_require__(20);
	var TileData      = __webpack_require__(13);

	var floor_data;

	Dom.ready(
	  function() {
	    PageScripts.run();
	    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
	    Game.init();
	    // TODO: make the image assets into a spritesheet
	    Game.assets
	        .push(
	          { name: 'test_floor',       url: 'data/testFloor.json'},
	          { name: 'tile_data',        url: 'data/tileData.json'},
	          { name: 'plant_data',       url: 'data/plantData.json'},
	          { name: 'images',           url: 'data/imageFiles.json' });

	    Game.loadAssets(function (loader, resources) {
	        initData(resources);

	        loadImages(resources.images.data.files, function () {
	          var map = new MapScene(resources.test_floor.data);
	          Game.loadScene(map);
	          Game.run();
	        });        
	      });
	  });



	function initData(resources) {
	  __webpack_require__(13).load(resources.tile_data);
	  __webpack_require__(28).load(resources.plant_data);
	}

	function loadImages(data, cb) {
	  PIXI.loader.add(data).load(cb)
	}


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var Dom = __webpack_require__(2);

	var elms = [];
	var PageScripts = {}

	var instructions_click = function (event) {
	  if (Dom.hasClass(elms['instructions'], 'hidden'))
	    Dom.removeClass(elms['instructions'], 'hidden');
	  else
	    Dom.addClass(elms['instructions'], 'hidden');
	}


	PageScripts.run = function () {

	  elms['instructions'] = Dom.byId('instructions');
	  elms['instructions_close'] = Dom.findChild(elms['instructions'], '.close')[0];
	  elms['instructions_close'].onclick = instructions_click;

	}

	module.exports = PageScripts;

/***/ },
/* 2 */
/***/ function(module, exports) {

	var _document = document;
	var _window = _document.window;
	var Dom = {};

	Dom.doc = _document;

	Dom.win = _window;

	Dom.byId = function (id) {
	    return _document.getElementById(id);
	}

	Dom.find = function (selector) {
	    return _document.querySelectorAll(selector);
	}

	Dom.findChild = function (parent, selector) {
	    return parent.querySelectorAll(selector);
	}

	Dom.hasClass = function (elm, className) {
	    if (elm.classList)
	        return elm.classList.contains(className);
	    else
	        return !!elm.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
	}

	Dom.addClass = function (elm, className) {
	    if (elm.classList)
	        elm.classList.add(className);
	    else if (!Dom.hasClass(elm, className)) 
	        elm.className += " " + className;  
	}

	Dom.removeClass = function (elm, className) {
	    if (elm.classList)
	        elm.classList.remove(className);
	    else if (Dom.hasClass(elm, className))
	        var r = new RegExp('(\\s|^)' + className + '(\\s|$)');
	        elm.className = elm.className.replace(r, ' ');
	}

	Dom.ready = function (func) {
	    _document.addEventListener('DOMContentLoaded', func);
	}

	module.exports = Dom;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var Dom         = __webpack_require__(2);
	var EventTarget = __webpack_require__(4);
	var Scene       = __webpack_require__(5);
	var Input       = __webpack_require__(7);
	var TileMap     = __webpack_require__(9);
	var TileData    = __webpack_require__(13);


	var dom_elements = [];
	var eventTarget = new EventTarget();
	var DEFAULT_TILE_WIDTH = 32;
	var DEFAULT_TILE_HEIGHT = 32;
	var DEFAULT_STAGE_WIDTH = 800;
	var DEFAULT_STAGE_HEIGHT = 600;


	var Game = {
	  renderOptions: {
	    antialias: false, 
	    transparent: false, 
	    resolution: 1
	  },
	  assets: [],
	  _loopId: null,
	  properties: {
	    tile_width:   DEFAULT_TILE_WIDTH,
	    tile_height:  DEFAULT_TILE_HEIGHT,
	    stage_width:  DEFAULT_STAGE_WIDTH,
	    stage_height: DEFAULT_STAGE_HEIGHT
	  },
	  utils: {}
	}
	// Setting aliases
	Game.props = Game.properties;

	Game.init = function () {
	  // grab the dom elements
	  dom_elements['game_container'] = Dom.byId('game_container');
	  dom_elements['debug_container'] = Dom.byId('debug_container');
	  // initialize things that don't need the canvas
	  initialize();
	  //Create the renderer  
	  this.renderer = PIXI.autoDetectRenderer(
	    Game.props.stage_width, 
	    Game.props.stage_height, 
	    Game.renderOptions );
	  this.stage = new PIXI.Container();
	  dom_elements['game_container'].appendChild(this.renderer.view);
	  // Add some things to the stage
	  this.stage.addChild(this.sceneManager);
	  // Add the listeners
	  addEventListeners();
	}

	// Game Asset Loading
	Game.loadAssets = function (progress, complete) {
	  if (complete === undefined)
	  {
	    complete = progress;
	    progress = loadingProgress; // default onProgress function
	  }
	  loadAssets(Game.assets, progress, complete);
	}

	// Game Animation Loop
	Game.run = function () { 
	  animate(); 
	}

	Game.stop = function () {
	  if (Game._loopId)
	    cancelAnimationFrame(Game._loopId);
	}

	// Game Scene Managment
	Game.loadScene = function (scene) {
	  if (! scene instanceof Scene) return false;
	  this.sceneManager.addScene(scene, true);
	}

	Game.getScene = function (name) {
	  return this.sceneManager.getScene(name);
	}

	// Game Entity Managment
	Game.saveEntity = function (entity) {
	  this._entities[entity.uid] = entity;
	  if (! this._entitiesByType[this.entType])
	    this._entitiesByType[entity.entType] = {};
	  
	  this._entitiesByType[entity.entType][entity.uid] = entity;
	}

	Game.getEntity = function (uid) {
	  if (! this._entities.hasOwnProperty(uid)) return null;
	  return this._entities[uid]
	}

	// Game Event Handling
	Game.on = function (name, cb) {
	  eventTarget.addEventListener(name, cb);
	}

	Game.off = function (name, cb) {
	  eventTarget.removeEventListener(name, cb);
	}

	Game.trigger = function (name, context) {
	  eventTarget.dispatchEvent({ type: name }, context);
	}

	// 
	// Internal Helpers
	// 

	function initialize() {
	  window.Game = Game;
	  Game._entities = {};
	  Game._entitiesByType = {};
	  Input.init();
	  Game.TileData = TileData;
	  Game.Input = Input;
	  Game.sceneManager = new Scene('manager');
	}

	function loadAssets(assets, progress, complete) {
	  if (assets == null || assets.length == 0) return complete();
	  PIXI.loader
	    .add(assets)
	    .on("progress", progress)
	    .load(complete)
	}

	function loadingProgress(loader, resource) {
	  console.log('loading '+resource.name);
	  if (resource.error) {
	    console.log(resource.error);
	  } else {
	    Game.trigger('loading:'+resource.name, resource);
	  }  
	}

	function animate() {
	  Game.trigger('pre_update');
	  Game._loopId = requestAnimationFrame(animate);
	  Game.sceneManager.update();
	  Game.renderer.render(Game.stage);
	  Game.Input.update();
	  Game.trigger('post_update');

	  dom_elements['debug_container'].innerText = "["+Input.x+"|"+Input.y+"]";
	}


	module.exports = Game;



/***/ },
/* 4 */
/***/ function(module, exports) {

	
	// A simple event dispatcher & target

	var EventTarget = function() {
	  this.listeners = {};
	};

	EventTarget.prototype = {};
	EventTarget.prototype.constructor = EventTarget;

	EventTarget.prototype.addEventListener = function(type, callback) {
	  if(!(type in this.listeners)) {
	    this.listeners[type] = [];
	  }
	  this.listeners[type].push(callback);
	};

	EventTarget.prototype.removeEventListener = function(type, callback) {
	  if(!(type in this.listeners)) {
	    return;
	  }
	  var stack = this.listeners[type];
	  for(var i = 0, l = stack.length; i < l; i++) {
	    if(stack[i] === callback){
	      stack.splice(i, 1);
	      return this.removeEventListener(type, callback);
	    }
	  }
	};

	EventTarget.prototype.dispatchEvent = function(event, context) {
	  if(!(event.type in this.listeners)) {
	    return;
	  }
	  var stack = this.listeners[event.type];
	  event.target = context ? context : this;
	  for(var i = 0, l = stack.length; i < l; i++) {
	      stack[i].call(this, event);
	  }
	};

	module.exports = EventTarget;


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var Entity = __webpack_require__(6);

	// A Container for stuff
	var Scene = function (name, parent) {
	  if (parent === undefined) parent = null;
	  this.name = name;
	  this.allEntities = [];
	  this.entities = {};
	  this.scenes  = {};
	  this.showing = [];
	  this.updateables = [];
	  this._parentScene = parent;

	  PIXI.Container.call(this);  
	  this.containers = {
	    Screen: new PIXI.Container(),
	    UI: new PIXI.Container()
	  };

	  this.addChild(this.containers.Screen);
	  this.addChild(this.containers.UI);
	}

	Scene.prototype = Object.create(PIXI.Container.prototype);
	Scene.prototype.constructor = Scene;

	Object.defineProperty(Scene.prototype, 'parentScene', {
	  get: function ()    { return this._parentScene; }
	});

	Scene.prototype.update = function () {
	  if (this.showing.length > 0)
	  {
	    for (var i = 0, l = this.showing.length; i < l; i++) {
	      var scene = this.getScene(this.showing[i]);
	      if (scene)
	        scene.update();
	    }
	  }

	  for (k in this.entities)
	  {
	    if (this.entities[k].length > 0) {
	      for (var i = 0, l = this.entities[k].length; i < l; i++) {
	        this.entities[k][i].update();
	      }
	    }
	  }

	  for (var i = 0, l = this.updateables.length; i < l; i++) {
	    this.updateables[i].update();
	  }
	  
	}

	// Add an entity to the scene, 
	// and add it's sprite to the container
	// - supports uid or Entity
	Scene.prototype.addEntity = function (ent, layer) {
	  if (Number.isInteger(ent)) ent = Game.getEntity(ent);
	  if (! ent instanceof Entity) return false;
	  
	  if (layer === undefined) layer = 'Entity';
	  if (! this.entities[ent.entType]) this.entities[ent.entType] = [];
	  if (! this.containers[layer]) this.createLayer(layer);

	  ent.scene = this;
	  this.allEntities.push(ent);
	  this.entities[ent.entType].push(ent);
	  
	  this._onEntityAdded(ent);

	  this.addSprite(ent.sprite, layer);
	  return true;
	}

	// add something that isn't an entity, but should update
	Scene.prototype.addUpdatable = function (obj) {
	  if (! obj.hasOwnProperty('update')) return false;
	  this.updateables.push(obj);
	  return true;
	}


	Scene.prototype.addSprite = function (sprite, layer) {
	  if (layer === undefined) layer = 'Sprite';
	  if (! this.containers[layer]) createLayer(layer);
	  this.containers[layer].addChild(sprite);

	  this._onSpriteAdded(sprite);
	}

	// Add a scene to the scene list
	// (option) show it (default: false)
	Scene.prototype.addScene = function (scene, show) {
	  if (show === undefined) show = false;
	  if (! scene instanceof Scene) return false;
	  this.scenes[scene.name] = scene;
	  if (show) this.showScene(scene.name);
	  return true;
	}

	// Get the scene from the scene list (if exists)
	Scene.prototype.getScene = function (name) {
	  if (! this.scenes.hasOwnProperty(name)) return null;
	  return this.scenes[name];
	}

	// Add the scene to the container
	// (only if it's in the scene list)
	Scene.prototype.showScene = function (name) {
	  if (name instanceof Scene) name = name.name; // support both name and scene arguments
	  if (! this.scenes.hasOwnProperty(name)) return false;
	  var scene = this.scenes[name];
	  this.showing.push(name);
	  this.addChild(scene);
	}

	// Remove the scene from this container
	Scene.prototype.hideScene = function (name) {
	  if (name instanceof Scene) name = name.name; // support both name and scene arguments
	  if (! this.scenes.hasOwnProperty(name)) return false;
	  var i, scene;
	  i = this.showing.indexOf(name);
	  if (i < 0) return false;
	  scene = this.scenes[name];
	  this.removeChild(scene);
	  this.showing.splice(i, 1);
	  return true;
	}

	Scene.prototype.createLayer = function (name, ui) {
	  if (ui === undefined) ui = false;
	  var container = new PIXI.Container();
	  this.containers[name] = container;
	  
	  if (ui) {
	    this.containers.UI.addChild(container)
	  } else {
	    this.containers.Screen.addChild(container)
	  }
	  
	}

	// for location stored entities
	Scene.prototype.entityLocationChanged = function (ent) {}

	Scene.prototype._onSpriteAdded = function (sprtie) {}

	Scene.prototype._onEntityAdded = function (entity) {}


	module.exports = Scene;


/***/ },
/* 6 */
/***/ function(module, exports) {

	var uuid = 0;

	function getNextUid () {
	  return uuid++;
	}

	var Entity = function (entType, sprite) {
	  this.uid = getNextUid();
	  this.entType = entType;
	  this.sprite = sprite;
	  this.scene = null;
	  Game.saveEntity(this);
	}

	Entity.prototype = {
	  
	  get anchor ()         { return this.sprite.anchor; },
	  get pivot ()          { return this.sprite.pivot; },
	  get position ()       { return this.sprite.position; },

	  get x ()              { return this.sprite.x; },
	  set x (val)           { this.sprite.x = val; positionChanged(this); },

	  get y ()              { return this.sprite.y; },
	  set y (val)           { this.sprite.y = val; positionChanged(this); },

	  update: function () {}
	}

	Entity.prototype.constructor = Entity;
	Entity.prototype._onPositionChanged = null;

	function positionChanged(ent)
	{
	  if (ent._onPositionChanged) ent._onPositionChanged(ent);
	}

	module.exports = Entity;


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var Keyboard = __webpack_require__(8);
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


/***/ },
/* 8 */
/***/ function(module, exports) {

	
	var Keyboard = {
	  codes: [  9,13,16,17,18,27,32,37,38,39,40,
	           65,66,67,68,69,70,71,72,73,74,75,76,77,78,
	           79,80,81,82,83,84,85,86,87,88,89,90,
	           188,190,191 ],
	  
	  TAB:    9,
	  ENTER:  13,
	  SHIFT:  16,
	  CTRL:   17,
	  ALT:    18,

	  ESC:    27,
	  SPACE:  32,
	  LEFT:   37,
	  UP:     38,
	  RIGHT:  39,
	  DOWN:   40,

	  A:      65,
	  B:      66,
	  C:      67,
	  D:      68,
	  E:      69,
	  F:      70,
	  G:      71,
	  H:      72,
	  I:      73,
	  J:      74,
	  K:      75,
	  L:      76,
	  M:      77,
	  N:      78,
	  O:      79,
	  P:      80,
	  Q:      81,
	  R:      82,
	  S:      83,
	  T:      84,
	  U:      85,
	  V:      86,
	  W:      87,
	  X:      88,
	  Y:      89,
	  Z:      90,

	  DOT:    188,
	  COMMA:  190,
	  SLASH:  191
	}

	module.exports = Keyboard;


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var Grid  = __webpack_require__(10);
	var Tile  = __webpack_require__(12);
	var TileData = __webpack_require__(13);


	var TileMap = function (w, h, type) {
	  var tw = Game.props.tile_width,
	      th = Game.props.tile_height;
	  if (type === undefined)
	    type = 'default';
	  this.type = type;
	  this.container = new PIXI.Container();
	  this.buffer = PIXI.RenderTexture.create(w * tw, h * th);
	  this.sprite = new PIXI.Sprite(this.buffer);
	  this._tilesChanged = [];

	  Grid.call(this, w, h);
	}

	TileMap.prototype = Object.create(Grid.prototype);
	TileMap.prototype.constuctor = TileMap;

	Object.defineProperty(TileMap.prototype, 'x', {
	  get: function () { return this.sprite.x; },
	  set: function (val) { this.sprite.x = val; }
	});

	Object.defineProperty(TileMap.prototype, 'y', {
	  get: function () { return this.sprite.y; },
	  set: function (val) { this.sprite.y = val; }
	});


	TileMap.prototype.getAt = function (x, y, key) { 
	  if (key !== undefined)
	  {
	    return Grid.prototype.getAt.call(this, x, y, key)
	  }
	  else
	  {
	    return Grid.prototype.getAt.call(this, x, y, 'tile');
	  }
	}

	TileMap.prototype.setAt = function (x, y, val) {
	  if (val instanceof Tile)
	  {
	    Grid.prototype.setAt.call(this, x, y, { tile: val, "tile.id": val.id, "tile.type": val.type });
	  }
	  else if (typeof val == 'object')
	  {
	    Grid.prototype.setAt.call(this, x, y, val);
	  }
	  else if (Number.isInteger(val))
	  {
	    Grid.prototype.setAt.call(this, x, y, { "tile.id": val });
	  }
	  else if (typeof val == 'string')
	  {
	    Grid.prototype.setAt.call(this, x, y, { "tile.type": val });
	  }
	  else
	  {
	    throw new Error('Unsupported value')
	  }
	}

	TileMap.prototype.removeAt  = function (x, y) { 
	  this.nodes[y][x].id = -1;
	  this._tilesChanged.push({x: x, y: y});
	}

	// Tilemap.update
	// if any tiles have changed, update the rendering of them
	TileMap.prototype.update  = function () {
	  if (this._tilesChanged.length == 0) return;

	  while (this._tilesChanged.length > 0)
	  {
	    var c = this._tilesChanged.pop(),
	        tile = this.nodes[c.y][c.x],
	        id = tile.id,
	        type = tile.type;        
	  }

	  Game.renderer.render(this.container, this.buffer);
	}


	TileMap.prototype._onNodeCreated = function (x, y, node)
	{
	  var tile = new Tile(this.type, -1);
	  tile.x = x * Game.props.tile_width;
	  tile.y = y * Game.props.tile_height;
	  node.set({tile: tile});
	  this.container.addChild(tile);
	}

	TileMap.prototype._onNodeSet = function (x, y, node, val)
	{
	  this._tilesChanged.push({x: x, y: y});
	}

	module.exports = TileMap;


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var Node = __webpack_require__(11);

	var Grid = function (width, height, matrix)
	{
	  if (typeof width === 'object')
	  {
	    matrix = width;
	    height = matrix.length;
	    width = matrix[0].length;
	  }

	  this.width = width;
	  this.height = height;

	  _buildNodes(width, height, matrix, this);
	}

	Grid.prototype = {};
	Grid.prototype.constructor = Grid;

	Grid.prototype.createAt = function (x, y) {
	  if (outOfRange(x, y, this)) return;
	  var node = new Node(x, y);
	  this.nodes[y][x] = node;
	  this._onNodeCreated(x, y, node);
	}

	Grid.prototype.getAt = function (x, y, key) {
	  if (outOfRange(x, y, this)) return null;
	  return this.nodes[y][x].get(key);
	}

	Grid.prototype.setAt = function (x, y, val) {
	  if (outOfRange(x, y, this)) return;
	  var node = this.nodes[y][x];
	  node.set(val);
	  this._onNodeSet(x, y, node, val);
	}

	Grid.prototype.removeAt = function (x, y, keys) {
	  if (outOfRange(x, y, this)) return;
	  var node = this.nodes[y][x];
	  node.remove(keys);
	  this._onNodeRemove(x, y, node, keys);
	}

	Grid.prototype._onNodeCreated = function (x, y, node) {}
	Grid.prototype._onNodeSet = function (x, y, node, val) {}
	Grid.prototype._onNodeRemove = function (x, y, node, keys) {}

	function _buildNodes(w, h, m, grid)
	{
	  var i, j;
	  grid.nodes = new Array(h);

	  for (i = 0; i < h; ++i) {
	    grid.nodes[i] = new Array(w);
	    for (j = 0; j < w; ++j) {
	      grid.createAt(j, i);
	    }
	  }

	  if (m === undefined) {
	    return;
	  }

	  if (m.length !== h || m[0].length !== w) {
	    throw new Error('Matrix size does not fit');
	  }

	  for (i = 0; i < h; ++i) {
	    for (j = 0; j < w; ++j) {
	      grid.setAt(j, i, m[i][j]);
	    }
	  }

	  return nodes;
	}

	function outOfRange(x, y, grid)
	{
	  return (x < 0 || x > grid.width || y < 0 || y > grid.height);
	}

	module.exports = Grid;


/***/ },
/* 11 */
/***/ function(module, exports) {

	
	var GridNode = function (x, y, values) {
	  this.x = x;
	  this.y = y;
	  this._properties = {};
	  this._value = 0;
	}

	GridNode.prototype = {};
	GridNode.prototype.constructor = GridNode;

	Object.defineProperty(GridNode.prototype, 'value', {
	  get: function () { return this._value; },
	  set: function (val) { this._value = val; }
	});

	GridNode.prototype.set = function (values)
	{
	  if (typeof values === 'object')
	  {
	    var keys = Object.getOwnPropertyNames(values);
	    for (var i = 0, l = keys.length; i < l; i++)
	    {
	      var key = keys[i];
	      var value = values[key];
	      // support for dot notation value setting
	      if (key.indexOf('.') >= 0)
	      {
	        eval("this._properties."+key+" = value");
	      }
	      else
	      {
	        this._properties[key] = values[key];  
	      }
	    }
	  }
	  else
	  {
	    this._value = values;
	  }
	}

	GridNode.prototype.remove = function (keys)
	{
	  if (keys instanceof Array)
	  {
	    for (var i = 0, l = keys.length; i < l; i++)
	    {
	      var key = keys[i];
	      delete this._properties[key];
	    }  
	  }
	  else if (typeof keys == 'string')
	  {
	    delete this._properties[key];
	  }
	  else
	  {
	    this._value = -1;
	  }
	}

	GridNode.prototype.get = function (key)
	{
	  if (key === undefined)
	    return this._value;
	  else
	  {
	    if (key.indexOf('.') >= 0)
	    {
	      return eval("this._properties."+key);
	    }
	    else
	    {
	      return this._properties[key];  
	    }
	  }
	}

	module.exports = GridNode;


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var TileData = __webpack_require__(13);

	var TileSprite = function (type, id)
	{
	  var frameId = getFrame(type, id);
	  var texture = PIXI.utils.TextureCache[frameId];
	  this._type = type;
	  this._id = id;
	  PIXI.Sprite.call(this, texture);
	}

	TileSprite.prototype = Object.create(PIXI.Sprite.prototype);
	TileSprite.prototype.constructor = TileSprite;

	Object.defineProperty(TileSprite.prototype, 'type', {
	  get: function () { return this._type; },
	  set: function (val) { 
	    if (this._type == val) return;
	    this._type = val;
	    tileChanged(this);
	  }
	});

	Object.defineProperty(TileSprite.prototype, 'id', {
	  get: function () { return this._id; },
	  set: function (val) { 
	    if (this._id == val) return;
	    this._id = val;
	    tileChanged(this);
	  }
	});

	TileSprite.prototype.set = function (args) {
	  if (args.hasOwnProperty('id'))
	    this._id = args.id;
	  if (args.hasOwnProperty('type'))
	    this._type = args.type;

	  if (args.hasOwnProperty('id') || agrs.hasOwnProperty('type'))
	    tileChanged(this);
	}

	function getFrame(type, id)
	{
	  if (! TileData.hasOwnProperty(type)) {
	    type = 'default';
	  }
	  if (TileData[type].frames.length <= id)
	    id = 0;
	  return TileData[type].frames[id];
	}

	function tileChanged(tile)
	{
	  var frameId, texture;
	  frameId = getFrame(tile.type, tile.id);
	  texture = PIXI.utils.TextureCache[frameId];
	  if (texture)
	  {
	    tile.visible = true;
	    tile.texture = texture;
	  }
	  else
	    tile.visible = false;
	}

	module.exports = TileSprite;


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var DataObject = __webpack_require__(14);

	TileData = Object.create(DataObject);

	TileData.default = {
	  frames: ['tile_placeholder'],
	  properties: {}
	}

	module.exports = TileData;


/***/ },
/* 14 */
/***/ function(module, exports) {

	/**
	 * DataObject:
	 *  a namespaced object that has a load function that takes data and turns this into that.
	 */

	var DataObject = {};

	DataObject.load = function (resource)
	{
	  var keys = Object.getOwnPropertyNames(resource.data);
	  for (var i = 0, l = keys.length; i < l; i++)
	  {
	    this[keys[i]] = resource.data[keys[i]];
	  }
	}

	module.exports = DataObject;


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var Scene       = __webpack_require__(5);
	var TileEntity  = __webpack_require__(16);
	var Loader      = __webpack_require__(17);
	var Interaction = __webpack_require__(31);
	var Actor       = __webpack_require__(22);
	var Unit        = __webpack_require__(20);
	var TargetUI    = __webpack_require__(29);
	var TurnOrderUI = __webpack_require__(30);

	var MapScene = function (floorData) {
	  if (floorData === undefined) floorData = { name: 'test', w: 200, h: 100 };
	  this.selectedUnit = null;
	  this.selectedUnitStartPosition = new PIXI.Point();
	  this.moveRangeSprite = null;
	  Scene.call(this, floorData.name);

	  setupContainers(this);
	  this.setScreenScale(1.5);
	  Loader.load(this, floorData);
	  this.camera_width = Game.props.stage_width - TargetUI.props.WIDTH;
	  this.camera_height = Game.props.stage_height - TurnOrderUI.props.HEIGHT;
	  this.interaction = new Interaction(this);
	}

	MapScene.prototype = Object.create(Scene.prototype);
	MapScene.prototype.constructor = MapScene;

	Object.defineProperty(MapScene.prototype, 'actors', {
	  get: function () { return this.entities.Actor; }
	});

	Object.defineProperty(MapScene.prototype, 'units', {
	  get: function () { return this.entities.Unit; }
	});

	Object.defineProperty(MapScene.prototype, 'enemies', {
	  get: function () { return this.entities.Enemy; }
	});

	Object.defineProperty(MapScene.prototype, 'plants', {
	  get: function () { return this.entities.Plant; }
	});


	MapScene.prototype.tick = function (time) {
	  console.log('tick '+ time);
	  for (var i = 0, l = this.actors.length; i < l; i++) 
	  {
	    var actor = this.actors[i];
	    actor.wait -= (time * actor.speed);
	    console.log(''+actor.type+': '+actor.wait);
	  }
	}

	MapScene.prototype.update = function ()
	{
	  Scene.prototype.update.call(this);
	  this.interaction.update();
	}

	MapScene.prototype.canMoveHere = function (ent, x, y) {
	  var isWall = this.tilemap.getAt(x, y, 'wall'),
	      hasTile = this.hasTile(x, y),
	      occupied = isOccupied(x, y, this, ent);
	  
	  return !isWall && !occupied && hasTile;
	}

	MapScene.prototype.canPassThroughHere = function (ent, x, y) {
	  var isWall = this.tilemap.getAt(x, y, 'wall'),
	      hasTile = this.hasTile(x, y),
	      passable = isOccupied(x, y, this, ent, false);

	  return !isWall && !passable && hasTile;
	}

	MapScene.prototype.canInteractHere = function (ent, x, y) {
	  return false;
	}

	MapScene.prototype.interactHere = function (ent, x, y) {
	  switch(typeOfEntity(ent))
	  {
	    case "Unit":
	        this.unitInteractsHere(ent, x, y);
	      break;

	    case "Enemy":
	        this.enemyInteractsHere(ent, x, y);
	      break;
	  }
	}

	MapScene.prototype.unitInteractsHere = function (unit, x, y)
	{

	}

	MapScene.prototype.enemyInteractsHere = function (enemy, x, y)
	{

	}


	MapScene.prototype.getEntitiesAt = function (x, y) {  
	  var ents = Object.values(this.entitiesByLocation[y][x]);
	  return ents;
	}

	MapScene.prototype.hasTile = function (x, y) {
	  return this.tilemap.getAt(x, y, 'tile.id') >= 0;
	}

	MapScene.prototype.getTile = function (x, y, local) {
	  if (local === undefined) local = false;

	  if (! local) {
	    x = getTileX(x);
	    y = getTileY(y);
	  }

	  return this.tilemap.getAt(x, y);
	}

	MapScene.prototype.setTile = function (x, y, val, local) {
	  if (local === undefined) local = false;

	  if (! local) {
	    x = getTileX(x);
	    y = getTileY(y);
	  }

	  this.tilemap.setAt(x, y, val);
	}

	MapScene.prototype.setScreenScale = function (scale) {
	  this.containers.Screen.scale.x = this.containers.Screen.scale.y = scale;
	}

	MapScene.prototype.cameraMoveTo = function (x, y) {
	  var scale = this.containers.Screen.scale.x,
	    xx = (x * Game.props.tile_width * scale) + (Game.props.tile_width * scale * 0.5),
	    yy = (y * Game.props.tile_height * scale) + (Game.props.tile_height * scale * 0.5);

	  this.containers.Screen.x = -(xx - (this.camera_width * 0.5)) + TargetUI.props.WIDTH;
	  this.containers.Screen.y = -(yy - (this.camera_height * 0.5)) + TurnOrderUI.props.HEIGHT;

	}

	MapScene.prototype.entityClicked = function (ent) {
	  this.targetUI.selectedEntity = ent;
	}

	MapScene.prototype.unitClicked = function (unit) {
	  this.entityClicked(unit);
	  this.unitSelected(unit);
	}

	MapScene.prototype.unitSelected = function (unit) {
	  this.interaction.unitSelected(unit); 
	  this.cameraMoveTo(unit.tileX, unit.tileY);
	}

	MapScene.prototype.actorsTurn = function (actor) {
	  if (actor instanceof Unit) {
	    this.unitSelected(actor);
	    this.targetUI.selectedEntity = actor;
	  }
	}


	MapScene.prototype.entityPositionChanged = function (ent) {
	  if (!(ent instanceof TileEntity) && 
	      (! ent.hasOwnProperty('tileX') ||
	       ! ent.hasOwnProperty('tileY') ||
	       ! ent.hasOwnProperty('uid'))) return;

	  var loc = this.locationsByEntity[ent.uid];
	  delete this.entitiesByLocation[loc.y][loc.x][ent.uid];
	  loc.x = ent.tileX;
	  loc.y = ent.tileY;
	  this.entitiesByLocation[ent.tileY][ent.tileX][ent.uid] = ent;
	}

	MapScene.prototype._onEntityAdded = function (ent) {
	  ent._onPositionChanged = this.entityPositionChanged.bind(this);

	  if (ent instanceof Actor) this.entities.Actor.push(ent);

	  if (!(ent instanceof TileEntity)) return;
	  
	  this.entitiesByLocation[ent.tileY][ent.tileX][ent.uid] = ent;
	  this.locationsByEntity[ent.uid] = {x: ent.tileX, y: ent.tileY};
	}



	// Private methods

	function setupContainers(scene)
	{
	  scene.entities['Soil']  = [];
	  scene.entities['Actor'] = [];
	  scene.entities['Unit']  = [];
	  scene.entities['Enemy'] = [];
	  scene.entities['Plant'] = [];

	  scene.createLayer('Background');
	  scene.createLayer('Soil');
	  scene.createLayer('RangeSprite');
	  scene.createLayer('Plant');
	  scene.createLayer('Unit');
	}

	function getTileX(x) {
	  var tw = Game.properties['tile_width'];
	  return Math.floor(x / tw);
	}

	function getTileY(y) {
	  var th = Game.properties['tile_height'];
	  return Math.floor(y / th);
	}

	function isOccupied(x, y, scene, excluded, all) {
	  var entities = scene.getEntitiesAt(x, y);
	  if (all == undefined) all = true;
	  if (entities.length == 0) return false;
	  for (var i = 0, l = entities.length; i < l; i++)
	  {
	    var ent = entities[i];
	    if (ent != excluded && all) 
	    {
	      return true;
	    }
	    if (!all && excluded && ent.entType == excluded.entType)
	    {
	      continue;
	    }
	  }
	  return false;
	}

	module.exports = MapScene;


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var Entity       = __webpack_require__(6);

	// Extends Entity
	var TileEntity = function (entType, sprite) {
	  
	  this.offset = new PIXI.Point(0,0);
	  Entity.call(this, entType, sprite)
	  this.initialize();
	}

	TileEntity.prototype = Object.create(Entity.prototype);
	TileEntity.prototype.constructor = TileEntity;

	// Properties
	// 
	// Top Left position
	Object.defineProperty(TileEntity.prototype, 'xx', {
	  get: function ()    { return this.x - (this.sprite.anchor.x * Game.props.tile_width ) + this.offset.x; },
	  set: function (val) { this.x = val +  (this.sprite.anchor.x * Game.props.tile_width ) - this.offset.x; }
	});
	Object.defineProperty(TileEntity.prototype, 'yy', {
	  get: function ()    { return this.y - (this.sprite.anchor.y * Game.props.tile_height ) + this.offset.y; },
	  set: function (val) { this.y = val +  (this.sprite.anchor.y * Game.props.tile_height ) - this.offset.y; }
	});

	// Tile Position
	Object.defineProperty(TileEntity.prototype, 'tileX', {
	  get: function ()    { return Math.floor(this.xx / Game.props.tile_width); },
	  set: function (val) { this.xx = val * Game.props.tile_width; }
	})
	Object.defineProperty(TileEntity.prototype, 'tileY', {
	  get: function ()    { return Math.floor(this.yy / Game.props.tile_height); },
	  set: function (val) { this.yy = val * Game.props.tile_height; }
	});

	// Methods

	TileEntity.prototype.initialize = function () {
	  // set the sprites anchor & initial position
	  this.sprite.anchor.x = 0.5;
	  this.sprite.anchor.y = 1;
	  this.sprite.x = (Game.props.tile_width  * this.sprite.anchor.x) - this.offset.x;
	  this.sprite.y = (Game.props.tile_height * this.sprite.anchor.y) - this.offset.y;
	}

	module.exports = TileEntity;


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var TileMap     = __webpack_require__(9);
	var TileData    = __webpack_require__(13);
	var TileEntity  = __webpack_require__(16);
	var RangeSprite = __webpack_require__(18);
	var Unit        = __webpack_require__(20);
	var Soil        = __webpack_require__(25);
	var Plant       = __webpack_require__(27);
	var TargetUI    = __webpack_require__(29);
	var TurnOrderUI = __webpack_require__(30);

	var MapSceneLoader = {}
	MapSceneLoader.load = function (scene, data)
	{
	  setSize(scene, data);
	  loadTilemap(scene, data);
	  loadUI(scene, data);
	  loadEntities(scene, data);

	  loadComplete(scene);
	}

	module.exports = MapSceneLoader;


	function setSize(scene, data) {

	  var w = scene._tiles_wide = data.w;
	  var h = scene._tiles_high = data.h;

	  scene.entitiesByLocation = Array(h);
	  for (var y = 0; y < h; y++)
	  {
	    scene.entitiesByLocation[y] = Array(w);
	    for (var x = 0; x < w; x++)
	    {
	      scene.entitiesByLocation[y][x] = {};
	    }
	  }
	  scene.locationsByEntity = {};

	}

	function loadTilemap(scene, data) {
	  var tilemap = new TileMap(data.w, data.h);

	  if (data.tiles && data.tiles.length > 0)
	  {
	    for (var i = 0, l = data.tiles.length; i < l; i++)
	    {
	      var id = data.tiles[i];
	      var type = data.types[id];
	      if (type)
	      {
	        var x = i % data.w;
	        var y = Math.floor(i / data.w);

	        tilemap.setAt(x, y, {"tile.type": type, "tile.id": id});

	        var props = getTileProperties(type, id);
	        tilemap.setAt(x, y, props);
	      }
	    }
	  }

	  scene.addEntity(tilemap, 'Background');

	  scene.tilemap = tilemap;
	}

	function loadUI(scene, data) {
	 
	  scene.targetUI = new TargetUI(scene);
	  scene.addScene(scene.targetUI, true);

	  scene.turnOrderUI = new TurnOrderUI(scene);
	  scene.turnOrderUI.x = TargetUI.props.WIDTH;
	  scene.addScene(scene.turnOrderUI, true);

	  scene.moveRangeSprite = createRangeSprite(scene);
	  scene.containers['RangeSprite'].addChild(scene.moveRangeSprite);
	}

	function loadEntities(scene, data) {
	  
	  loadUnits(scene, data);
	  loadOther(scene, data);

	}


	function loadUnits(scene, data)
	{
	  if (! data.units) return;
	  var u, unit;
	  for (var i = 0, l = data.units.length; i < l; i++)
	  {
	    u = data.units[i];
	    unit = new Unit(u.type);
	    unit.moveTo(u.x, u.y, true);
	    scene.addEntity(unit);
	  }
	}

	function loadOther(scene, data)
	{
	  if (! data.other) return;
	  var d, ent;
	  for (var i = 0, l = data.other.length; i < l; i++)
	  {
	    d = data.other[i];
	    switch (d.entType)
	    {
	      case "Soil":
	        addSoil(scene, d);
	        break;
	    }
	  }
	}

	function loadComplete(scene) {
	  scene.turnOrderUI.start();
	}


	function addSoil(scene, data)
	{
	  var soil = new Soil(data.type);

	  soil.tileX = data.x;
	  soil.tileY = data.y;
	  if (data.state)
	    soil.state = data.state;

	  scene.addEntity(soil, 'Soil');

	  // if the soil has plant data
	  if (data.plant)
	  {
	    addPlant(scene, data.plant, soil);
	  }
	}

	function addPlant(scene, data, soil)
	{
	  var plant = new Plant(data.type);

	  if (data.state)
	  {
	    plant.state = data.state;
	  }

	  scene.addEntity(plant, 'Plant');
	  plant.plant(soil); // NOTE: maybe this should be a soil.plant(plant)?
	}

	function getTileProperties(type, id)
	{
	  if (! TileData.hasOwnProperty(type))
	  {
	    type = 'default'
	  }
	  return TileData[type].properties;
	}

	function createRangeSprite(scene) {
	  var g = new RangeSprite(scene);
	  g.visible = false;
	  return g;
	}


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var Node = __webpack_require__(19);

	var directions = [[-1, 0], [0, -1], [1, 0], [0, 1]];
	var count = 0;

	var RangeSprite = function (map) {
	  this.tiles = [];
	  this.map = map;
	  this.draw = {
	    color: 0x6fff6f,
	    alpha: 0.8
	  };
	  PIXI.Graphics.call(this);
	}

	RangeSprite.prototype = Object.create(PIXI.Graphics.prototype);
	RangeSprite.prototype.constructor = RangeSprite;

	RangeSprite.prototype.clearTiles = function () {
	  this.tiles.length = 0;
	}

	RangeSprite.prototype.search = function (x, y, min, max, isOpenOrPassable, isBlocked, onPush)
	{
	  var startNode = new Node(x, y),
	      nodes = [];
	  this.searchNeighbors(nodes, startNode, 0, min, max, isOpenOrPassable, isBlocked, onPush);
	  return nodes;
	  
	}
	RangeSprite.prototype.searchNeighbors = function (nodes, node, r, min, max, isOpenOrPassable, isBlocked, onPush)
	{
	  count++;
	  if (r >= max) return;
	  if (r >= min)
	  {
	    if (! isOpenOrPassable(node.x, node.y)) return;

	    node.r = r;
	    if (isBlocked(node.x, node.y))
	      node.blocked = true;

	    nodes.push(node);
	    if (onPush)
	      onPush(node);  
	  }
	  
	  if (r+1 >= max) return;

	  var neighbors = node.getNeighbors(isOpenOrPassable);

	  for (var i = 0, l = neighbors.length; i < l; i++) {

	    var neighbor = neighbors[i];
	        n = nodes.find( function (n) { return n.x == neighbor.x && n.y == neighbor.y })
	    if (n && n.r <= r) continue;
	    this.searchNeighbors(nodes, neighbor, r+1, min, max, isOpenOrPassable, isBlocked, onPush);
	  }
	}

	// TODO: improve this to support drawing ranges with min and max values
	RangeSprite.prototype.drawUnitsRange = function (entity, min, max) {
	  var map = this.map;

	  this.clearTiles();
	  this.clear();

	  this.lineStyle(1, this.draw.color, this.draw.alpha);

	  count = 0;
	  var _this = this;
	  this.search(entity.tileX, entity.tileY, min, max, 
	    function (x, y) {
	      return map.canPassThroughHere(entity, x, y);
	    },
	    function (x, y) {
	      return !map.canMoveHere(entity, x, y);
	    },
	    function (node) {
	      if (_this.tiles.find( function (tile) { return node.x == tile.x && node.y == tile.y; })) return;
	      // don't add tiles that already exist
	      _this.tiles.push(node);
	      if (node.blocked) {
	        drawRect(_this, node.x, node.y);
	      } else {
	        drawFull(_this, node.x, node.y);
	      }

	    });
	}

	function drawFull(g, x, y) {
	  var w = Game.properties.tile_width, 
	      h = Game.properties.tile_height
	      xx = x * w,
	      yy = y * h,
	      padding = { x: 4, y: 4 };
	  // setup the offset & padding
	  w  -= padding.x * 2;
	  h  -= padding.y * 2;
	  xx += padding.x;
	  yy += padding.y;

	  g.drawRect(xx, yy, w, h);
	  drawLines(g, x, y, xx, yy, w, h);
	}

	function drawLines(g, x, y, left, top, width, height)
	{
	  var xx = left,
	      yy = top,
	      right = xx + width,
	      bottom = yy + height,
	      steps = 8
	      step = width / steps,
	      i = 0,
	      w = width,
	      h = height;

	  yy = top + (step * steps);
	  h = (height - step * steps);
	  w = (width - step * steps);
	  while (i < steps)
	  {
	    g.moveTo(xx, yy);
	    g.lineTo(xx + w, yy + h);
	    if (i >= Math.floor(steps * 0.5))
	    {
	      xx += step * 2;
	      w -= step * 2;
	      h -= step * 2;
	    }
	    else
	    {
	      yy -= step * 2;
	      w += step * 2;
	      h += step * 2;
	    }
	    i++;
	  }
	}

	function drawRect(g, x, y) {
	  var w = Game.properties.tile_width, 
	      h = Game.properties.tile_height
	      xx = x * w,
	      yy = y * h,
	      padding = { x: 4, y: 4 };
	  // setup the offset & padding
	  w  -= padding.x * 2;
	  h  -= padding.y * 2;
	  xx += padding.x;
	  yy += padding.y;

	  g.drawRect(xx, yy, w, h);
	}

	module.exports = RangeSprite;


/***/ },
/* 19 */
/***/ function(module, exports) {

	var directions = [[-1, 0], [0, -1], [1, 0], [0, 1]];

	var SearchNode = function (x, y)
	{
	  this.x = x;
	  this.y = y;
	}

	SearchNode.prototype = {}
	SearchNode.prototype.constructor = SearchNode;

	SearchNode.prototype.getNeighbors = function (getNeighborCondition) {
	  var n = [], xx, yy;
	  for (var i = 0, l = directions.length; i < l; i++) {
	    xx = this.x + directions[i][0];
	    yy = this.y + directions[i][1];
	    if (getNeighborCondition(xx, yy))
	    {
	      n.push(new SearchNode(xx, yy));
	    }
	  }
	  return n;
	}

	module.exports = SearchNode;


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	var UnitData     = __webpack_require__(21);
	var Actor        = __webpack_require__(22);

	var UNIT_OFFSET = {x: 0, y: 8};

	// Extends Entity
	var Unit = function (type) {

	  this.type  = type;
	  
	  var sprite = makeSprite(this);
	  Actor.call(this, 'Unit', sprite);
	}

	Unit.prototype = Object.create(Actor.prototype);
	Unit.prototype.constructor = Unit;

	// Properties


	// Methods

	Unit.prototype.loadData = function () {
	  loadStats(this);
	  this.offset.x = UNIT_OFFSET.x;
	  this.offset.y = UNIT_OFFSET.y;
	}

	Unit.prototype.bindBehaviour = function () {
	  this.sprite.interactive = true;
	  this.sprite.on('click', onClick, this);
	  this.sprite.on('touchstart', onClick, this);
	}

	// Private Methods

	function loadStats(unit) 
	{
	  var type = unit.type, stats;
	  if (! UnitData.hasOwnProperty(type))
	    type = 'default';
	  var stats = UnitData[type].stats;
	  unit.stats = {};
	  for (var k in stats)
	    unit.stats[k] = stats[k];

	  if (unit.stats.speed)
	    unit.speed = unit.stats.speed;
	}

	function makeSprite(unit)
	{
	  var type = unit.type, frame;
	  if (! UnitData.hasOwnProperty(type))
	    type = 'default';
	  frame = getFrame(type, 'idle', 0);
	  return PIXI.Sprite.fromFrame(frame);
	}

	// TODO: do some error handling maybe??
	function getFrame(type, state, index) 
	{
	  return UnitData[type].frames[state][index];
	}

	function onClick(e)
	{
	  e.stopPropagation();
	  if (this.scene && typeof this.scene.unitClicked == 'function')
	    this.scene.unitClicked(this);
	}


	module.exports = Unit;


/***/ },
/* 21 */
/***/ function(module, exports) {

	var UnitData = {

	  states: ['idle'],

	  default: {
	    frames: {
	      idle: ['unit_placeholder']
	    }
	  },

	  farmer: {
	    frames: {
	      idle: ['farmer_idle'],
	    },
	    stats: {
	      max_health: 2,
	      move_range: 6,
	      attack_range: 1  
	    }
	  },

	  soldier: {
	    frames: {
	      idle: ['soldier_idle'],
	    },
	    stats: {
	      max_health: 3,
	      move_range: 5,
	      attack_range: 2  
	    }
	  },

	  archer: {
	    frames: {
	      idle: ['unit_placeholder'],
	    },
	    stats: {
	      max_health: 2,
	      move_range: 4,
	      attack_range: 4  
	    }
	  },

	  lumberjack: {
	    frames: {
	      idle: ['unit_placeholder'],
	    },
	    stats: {
	      max_health: 4,
	      move_range: 5,
	      attack_range: 1  
	    }
	  },

	};

	module.exports = UnitData;


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	var HealthSprite = __webpack_require__(23);
	var Entity       = __webpack_require__(16);
	var ACTOR_STATES = __webpack_require__(24);
	var ACTOR_OFFSET = {x: 0, y: 8};

	// Extends Entity
	var Actor = function (entType, sprite) {
	  
	  this._state = ACTOR_STATES.IDLE;
	  this._behaviour = 'wait';
	  this._destination = new PIXI.Point(0,0);
	  this._speed = 1;
	  this._wait = 100;
	  this.animation = null;
	  Entity.call(this, entType, sprite)

	  // this.initialize(); called in TileEntity constructor
	}

	Actor.prototype = Object.create(Entity.prototype);
	Actor.prototype.constructor = Actor;

	// Properties

	Object.defineProperty(Actor.prototype, 'state', {
	  get: function ()    { return this._state; },
	  set: function (val) { this._state = val; this.setAnimation(); }
	});

	Object.defineProperty(Actor.prototype, 'hasDestination', {
	  get: function ()    { return this.xx != this._destination.x || this.yy != this._destination.y; }
	})

	Object.defineProperty(Actor.prototype, 'wait', {
	  get: function ()    { return this._wait; },
	  set: function (val) { this._wait = val; }
	});

	Object.defineProperty(Actor.prototype, 'speed', {
	  get: function ()    { return this._speed; },
	  set: function (val) { this._speed = val; }
	});

	// Methods

	Actor.prototype.initialize = function () {

	  Entity.prototype.initialize.call(this);

	  this.offset.x = ACTOR_OFFSET.x;
	  this.offset.y = ACTOR_OFFSET.y;

	  this.loadData();
	  this.addHealthSprite();
	  this.bindBehaviour()
	}

	Actor.prototype.update = function () { 
	  if (! this.hasDestination) return;
	  
	  this.xx = lerpMovement(this.xx, this._destination.x, Game.properties.tile_width);
	  this.yy = lerpMovement(this.yy, this._destination.y, Game.properties.tile_height);
	}

	Actor.prototype.setAnimation = function () {
	  this.animation = null;
	}

	// Move to Tile Position
	Actor.prototype.moveTo = function (x, y, immediate) { 
	  if (immediate === undefined) immediate = false;
	  
	  if (immediate)
	  {
	    setPosition(this, x, y);
	  }
	  else
	  {
	    setDestination(this, x, y);
	  }
	}

	Actor.prototype.loadData = function () {}

	Actor.prototype.addHealthSprite = function ()
	{
	  // create and show the health
	  this.healthSprite = makeHealthSprite(this);
	  this.sprite.addChild(this.healthSprite);
	}

	Actor.prototype.bindBehaviour = function () {}

	// Private Methods

	function lerpMovement(cur, dest, size)
	{
	  var dif, t;
	  dif = dest - cur;
	  if (dif == 0) return cur;
	  t = Math.abs(1 / (dif / size)) * 0.25;
	  return Math.floor(cur + t * dif);
	}


	function makeHealthSprite(unit)
	{
	  var hearts = unit.stats && unit.stats.max_health ? unit.stats.max_health : 2;
	  var s = new HealthSprite(hearts);
	  s.y = unit.y - (Game.props.tile_height + unit.sprite.height + unit.offset.y);
	  return s;
	}


	function setPosition(unit, tileX, tileY)
	{
	  unit.xx = unit._destination.x = tileX * Game.properties.tile_width;
	  unit.yy = unit._destination.y = tileY * Game.properties.tile_height;
	}


	function setDestination(unit, tileX, tileY)
	{
	  unit._destination.x = tileX * Game.properties.tile_width;
	  unit._destination.y = tileY * Game.properties.tile_height;
	}

	module.exports = Actor;


/***/ },
/* 23 */
/***/ function(module, exports) {

	
	var HealthSprite = function (hearts)
	{
	  this.max_health = hearts;
	  this.cur_health = hearts * 2; // half values
	  this.sprites = [];
	  PIXI.Container.call(this);
	  createSprites(this);
	  // this.x = -(this.width * 0.5);
	}

	HealthSprite.prototype = Object.create(PIXI.Container.prototype);
	HealthSprite.prototype.constructor = HealthSprite;

	HealthSprite.prototype.changeValue = function (count) {



	}

	function createSprites(s) {

	  var count = s.max_health;

	  for (var i = 0, l = count; i < l; i++)
	  {
	    var sprite = PIXI.Sprite.fromFrame('heart');
	    sprite.anchor.x = 0.5;
	    sprite.anchor.y = 0.5;
	    var offset = (i - ((l - 1) * 0.5));
	    sprite.x = (offset * sprite.width);
	    s.sprites.push(sprite);
	    s.addChild(sprite);
	  }
	}

	module.exports = HealthSprite;


/***/ },
/* 24 */
/***/ function(module, exports) {

	
	var ActorStates = {
	  IDLE: 'idle'
	};

	module.exports = ActorStates;


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	var SoilData     = __webpack_require__(26);
	var Entity       = __webpack_require__(16);

	// Extends Entity
	var Soil = function (type) {

	  this.type = type;
	  this._state = 'none';
	  this.water = 0;
	  this.plant = null;

	  var sprite = makeSprite(this);
	  Entity.call(this, 'Soil', sprite)
	}

	Soil.prototype = Object.create(Entity.prototype);
	Soil.prototype.constructor = Soil;

	// Properties

	Object.defineProperty(Soil.prototype, 'state', {
	  get: function ()    { return this._state; },
	  set: function (val) { 
	    if (this._state == val) return;
	    if (SoilData.states.indexOf(val) < 0) return;
	    this._state = val; 
	    stateChanged(this); 
	  }
	});

	Object.defineProperty(Soil.prototype, 'hasPlant', {
	  get: function () { return this.plant != null; }
	}) 

	// Methods

	Soil.prototype.update = function ()
	{
	  if (this.hasPlant)
	  {
	    if (this.plant.needsWater)
	    {
	      this.water--;
	      this.plant.water();
	    }
	  }
	  checkState(this);
	}


	// Private methods

	function checkState(soil)
	{
	  soil.state = SoilData.getState(soil);
	}

	function stateChanged(soil)
	{
	  var frame = SoilData.getFrame(soil),
	      texture = utils.TextureCache[frame];

	  if (! texture) return;

	  soil.sprite.texture = texture;
	}

	function makeSprite(soil)
	{
	  var frame = SoilData.getFrame(soil);
	  return PIXI.Sprite.fromFrame(frame);
	}



	module.exports = Soil;


/***/ },
/* 26 */
/***/ function(module, exports) {

	var SoilData = {

	  MIN_WATER_LEVEL: 10,
	  states: ['none', 'dry', 'wet'],
	  frames: ['tile_placeholder', 'tile_placeholder', 'tile_placeholder'],
	  getState: function (soil) {
	    if (soil.water > SoilData.MIN_WATER_LEVEL)
	      return 'wet';
	    return soil.tilled ? 'dry' : 'none';
	  },
	  getFrame: function (soil) {
	    var frameId = SoilData.states.indexOf(soil.state);
	    return SoilData.frames[frameId];
	  }

	};

	module.exports = SoilData;


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	var PlantData     = __webpack_require__(28);
	var Entity        = __webpack_require__(16);

	// Extends Entity
	var Plant = function (type) {

	  this.type = type;
	  this._state = 'none';
	  this._stateIndex = 0;
	  this.water = 0;
	  this.growth = 0;
	  this.plantedIn = null; // Soil

	  var sprite = makeSprite(this);
	  Entity.call(this, 'Plant', sprite)
	}

	Plant.prototype = Object.create(Entity.prototype);
	Plant.prototype.constructor = Plant;

	// Properites

	Object.defineProperty(Plant.prototype, 'state', {
	  get: function () { return this._state; },
	  set: function (val) {
	    if (this._state == val) return;
	    if (PlantData[this.type].states.indexOf(val) < 0) return;
	    this._state = val;
	    stateChanged(this);
	  }
	})

	Object.defineProperty(Plant.prototype, 'stateIndex', {
	  get: function () { return this._stateIndex; }
	})

	Object.defineProperty(Plant.prototype, 'needsWater', {
	  get: function () { return this.water < this.props.getsThirstyAt[this.stateIndex]; }
	}) 

	Object.defineProperty(Plant.prototype, 'hasWater', {
	  get: function () { return this.water > 0; }
	}) 

	// Methods

	Plant.prototype.update = function ()
	{
	  if (this.plantedIn == null)
	    return;


	  if (this.hasWater)
	  {
	    this.water -= this.props.waterUsedPerTick[this.stateIndex];
	    drink(this);
	  }
	}

	Plant.prototype.plant = function (soil)
	{
	  soil.plant = this;
	  this.plantedIn = soil;
	  this.state = 'seed';
	  this.tileX = soil.tileX;
	  this.tileY = soil.tileY;
	}

	Plant.prototype.initialize = function ()
	{
	  initProps(this);
	}

	Plant.prototype.water = function ()
	{
	  this.water = 100;
	}

	// Private methods

	function drink(plant)
	{
	  plant.growth += plant.props.growthPerDrink[plant.stateIndex];
	  growthChanged(plant);
	}

	function growthChanged(plant)
	{
	  var curState = plant.state,
	      state = PlantData[plant.type].getStateFromGrowth(plant.growth);

	  if (curState != state) {
	    plant.state = state;
	  }
	}

	function stateChanged(plant)
	{
	  var type = plant.type,
	      state = plant._state,
	      data = PlantData[type];
	  // update the stateIndex
	  plant._stateIndex = data.states.indexOf(state);
	  // update the texture
	  var frame = data.frames[plant.stateIndex];
	  plant.sprite.texture = PIXI.utils.TextureCache[frame];
	}

	function initProps(plant)
	{
	  var type, props;
	  type = plant.type;
	  if (! PlantData.hasOwnProperty(type))
	    type = 'default';
	  plant.props = {};
	  props = PlantData[type].props;
	  for (var k in props)
	    plant.props[k] = props[k];
	}

	function makeSprite(plant)
	{
	  var type, frame;
	  type = plant.type;
	  if (! PlantData.hasOwnProperty(type))
	    type = 'default';
	  frame = PlantData[type].frames[0];
	  return PIXI.Sprite.fromFrame(frame);
	}

	module.exports = Plant;


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	var DataObject = __webpack_require__(14);

	PlantData = Object.create(DataObject);

	module.exports = PlantData;


/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	var Scene = __webpack_require__(5);

	var TARGET_UI = {
	  WIDTH: 128,
	  BG_COLOR: 0xffffff,
	  BORDER_COLOR: 0xaaaaaa
	}

	var TargetUI = function (parent)
	{
	  this._selectedEntity = null;
	  Scene.call(this, 'TargetUI', parent);
	  initBackground(this);
	  initImageContainer(this);
	  initLabels(this);
	}

	TargetUI.props = TARGET_UI;
	TargetUI.prototype = Object.create(Scene.prototype);
	TargetUI.prototype.constructor = TargetUI;


	Object.defineProperty(TargetUI.prototype, 'selectedEntity', {
	  get: function () { return this._selectedEntity; },
	  set: function (val) {
	    if (this._selectedEntity == val) return;
	    
	    this._selectedEntity = val;
	    selectedEntityChanged(this, val);
	  }
	});

	module.exports = TargetUI;


	function initBackground(scene) 
	{
	  // create the background
	  var g = scene._background = new PIXI.Graphics();
	  g.beginFill(TARGET_UI.BG_COLOR, 1);
	  g.lineStyle(1, TARGET_UI.BORDER_COLOR);
	  g.drawRect(1, 1, TARGET_UI.WIDTH - 2, Game.props.stage_height - 2);
	  g.endFill();
	  // g.moveTo(0, 0);
	  // g.lineTo(0, Game.props.stage_height);
	  scene.addChild(scene._background);
	}

	function initImageContainer(scene)
	{
	  var g = new PIXI.Graphics(), o = 18, s = TARGET_UI.WIDTH - 36;
	  g.lineStyle(1, 0xaaaaaa);
	  g.drawRect(o, o, s, s);

	  scene.addChild(g);
	}

	function initLabels(scene)
	{
	  var titleFormat = {fontFamily : "Lucida Console", fontSize: 14, color : 0x555555, align : 'center'};
	  var title = new PIXI.Text('<Title>', titleFormat);
	  // title.width = TARGET_UI.WIDTH - 60;
	  title.x = 18;
	  title.y = TARGET_UI.WIDTH;

	  var labels = new PIXI.Container();
	  scene.addChild(labels);

	  scene.title = title;
	  labels.addChild(title);
	}

	function selectedEntityChanged(scene, entity) 
	{
	  if (entity == null) return entityDeselected(scene);
	  var type = entity.entType;
	  var name = type;
	  switch (type)
	  {
	    case 'Unit':
	      name = entity.type;
	  }
	  

	  scene.title.text = name;
	}

	function entityDeselected(scene)
	{
	  scene.title.text = '<Title>';
	}



/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	var Scene = __webpack_require__(5);
	var TargetUI = __webpack_require__(29);

	var TURN_ORDER_UI = {
	  HEIGHT: 48,
	  BG_COLOR: 0xffffff,
	  BORDER_COLOR: 0xaaaaaa,
	}

	var TurnOrderUI = function (parent)
	{
	  this.actorsInOrder = [];
	  Scene.call(this, 'TurnOrderUI', parent);

	  initBackground(this);
	  initDisplay(this); 
	}

	TurnOrderUI.props = TURN_ORDER_UI;
	TurnOrderUI.prototype = Object.create(Scene.prototype);
	TurnOrderUI.prototype.constructor = TurnOrderUI;


	Object.defineProperty(TurnOrderUI.prototype, 'current', {
	  get: function () { return this.actorsInOrder[0]; },
	});

	TurnOrderUI.prototype.start = function () {
	  var actors = this.parentScene.actors;
	  for (var i = 0, l = actors.length; i < l; i++) {
	    this.actorsInOrder.push(actors[i]);
	  }
	  sort(this);
	}

	TurnOrderUI.prototype.next = function ()
	{
	  if (this.actorsInOrder.length < 2) return;

	  var next = this.actorsInOrder[1];
	  var delta = next.wait;
	  if (delta > 0)
	    this.parentScene.tick(delta);

	  sort(this);
	  this.redraw();

	  this.parentScene.actorsTurn(this.current);
	}

	TurnOrderUI.prototype.redraw = function () 
	{
	  this._unitsContainer.removeChildren();

	  for (var i = 0, l = this.actorsInOrder.length; i < l && i < 5; i++)
	  {
	    var actor = this.actorsInOrder[i],
	        texture = actor.sprite.texture,
	        sprite = new PIXI.Sprite(texture);

	    sprite.x = 18 + (i * 18) + (i * Game.props.tile_width);
	    sprite.y = 9;

	    this._unitsContainer.addChild(sprite);
	  }
	  // TODO: re order the _unitsContainer sprites
	  Game.renderer.render(this._unitsContainer, this._buffer);
	}

	module.exports = TurnOrderUI;


	function initBackground(scene) 
	{
	  // create the background
	  var g = scene._background = new PIXI.Graphics();
	  g.beginFill(TURN_ORDER_UI.BG_COLOR, 1);
	  g.lineStyle(1, TURN_ORDER_UI.BORDER_COLOR);
	  g.drawRect(1, 1, Game.props.stage_width - TargetUI.props.WIDTH - 1, TURN_ORDER_UI.HEIGHT - 2);
	  g.endFill();
	  // g.moveTo(0, TURN_ORDER_UI.HEIGHT);
	  // g.lineTo(Game.props.stage_width, TURN_ORDER_UI.HEIGHT);
	  scene.addChild(scene._background);
	}

	function initDisplay(scene)
	{
	  scene._unitsContainer = new PIXI.Container();
	  scene._buffer = PIXI.RenderTexture.create(Game.props.stage_width, 128);
	  scene._unitsSprite = new PIXI.Sprite(scene._buffer);
	  scene.addChild(scene._unitsSprite);
	}

	function sort(self) {
	  self.actorsInOrder.sort( function (a, b) {
	    return a.wait - b.wait;
	  });
	}


/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	var Keyboard    = __webpack_require__(8);

	var MapSceenInteraction = function (scene)
	{
	  this.scene = scene;
	  this.seelctedUnit = null
	  this.selectedUnitStartPosition = new PIXI.Point(0, 0);
	  this.moveRangeSprite = scene.moveRangeSprite;
	  this.choosingDirection = false;
	  this.directionsAvailable = {
	    up: false,
	    left: false,
	    down: false,
	    right: false
	  };
	}

	MapSceenInteraction.prototype = {};
	MapSceenInteraction.prototype.constructor = MapSceenInteraction;


	MapSceenInteraction.prototype.update = function () {
	  if (this.selectedUnit)
	  { 
	    selectedUnitInput(this, this.scene);
	  }

	  cameraMoveInput(this, this.scene);
	}


	MapSceenInteraction.prototype.unitSelected = function (unit) {
	  this.selectedUnit = unit;
	  this.selectedUnitStartPosition.x = unit.tileX;
	  this.selectedUnitStartPosition.y = unit.tileY;
	  showMoveRangeSprite(this);
	}


	MapSceenInteraction.prototype.inRange = function (x, y) {
	  for (var i = 0, l = this.moveRangeSprite.tiles.length; i < l; i++)
	  {
	    var tile = this.moveRangeSprite.tiles[i];
	    if (tile.x == x && tile.y == y) return true;
	  }
	  return false;
	}
	MapSceenInteraction.prototype.isBlocked = function (x, y) {
	  for (var i = 0, l = this.moveRangeSprite.tiles.length; i < l; i++)
	  {
	    var tile = this.moveRangeSprite.tiles[i];
	    if (tile.x == x && tile.y == y) 
	    {
	      if (tile.blocked) return true;
	      else return false;
	    }
	  }
	  return false;
	}

	module.exports = MapSceenInteraction;


	function showMoveRangeSprite(self)
	{
	  self.moveRangeSprite.visible = true;
	  var range = self.selectedUnit.stats.move_range ? self.selectedUnit.stats.move_range : 5;
	  self.moveRangeSprite.drawUnitsRange(self.selectedUnit, 0, range);
	}

	function selectedUnitInput(self, scene) {
	  var xx, yy;
	  xx = self.selectedUnit.tileX;
	  yy = self.selectedUnit.tileY;

	  if (self.choosingDirection)
	  {
	    if (Game.Input.keyReleased(Keyboard.W) && self.directionsAvailable.up)
	    {
	      interactAt(self, scene, xx, yy-1);
	      moveCompleted(self, scene);
	    } 
	    else if (Game.Input.keyReleased(Keyboard.S) && self.directionsAvailable.down) 
	    {
	      interactAt(self, scene, xx, yy+1);
	      moveCompleted(self, scene);
	    }

	    if (Game.Input.keyReleased(Keyboard.A) && self.directionsAvailable.left) 
	    {
	      interactAt(self, scene, xx-1, yy);
	      moveCompleted(self, scene);
	    }
	    else if (Game.Input.keyReleased(Keyboard.D) && self.directionsAvailable.right)
	    {
	      interactAt(self, scene, xx+1, yy); 
	      moveCompleted(self, scene);
	    }
	  }
	  else
	  {
	    if (Game.Input.keyReleased(Keyboard.W))
	    {
	      if (self.inRange(xx, yy - 1))
	        self.selectedUnit.moveTo(xx, yy - 1);
	    } 
	    else if (Game.Input.keyReleased(Keyboard.S)) 
	    {
	      if (self.inRange(xx, yy + 1))
	        self.selectedUnit.moveTo(xx, yy + 1);
	    }
	    if (Game.Input.keyReleased(Keyboard.A)) 
	    {
	      if (self.inRange(xx - 1, yy))
	        self.selectedUnit.moveTo(xx - 1, yy);
	    }
	    else if (Game.Input.keyReleased(Keyboard.D))
	    {
	      if (self.inRange(xx + 1, yy))
	        self.selectedUnit.moveTo(xx + 1, yy);
	    }

	    if (Game.Input.keyDown(Keyboard.SPACE))
	    {
	      if (canInteract(self, scene, xx, yy))
	      {
	        self.choosingDirection = true;
	        getDirections(self, scene, xx, yy);
	      }
	    }
	  }

	  if (Game.Input.keyReleased(Keyboard.ESC))
	  {
	    if (self.choosingDirection)
	    {
	      self.choosingDirection = false;
	    }
	    else
	    {
	      if (self.isBlocked(xx, yy)) {
	        moveCancled(self, scene);      
	      } else {
	        moveCompleted(self, scene);
	      }  
	    }
	  }
	}

	function interactAt(self, scene, x, y) {
	  self.selectedUnit.wait += 40;
	}

	function moveCancled(self, scene)
	{
	  self.selectedUnit.moveTo(
	    self.selectedUnitStartPosition.x,
	    self.selectedUnitStartPosition.y,
	    true);
	  deselectUnit(self, scene);
	}

	function moveCompleted(self, scene)
	{
	  self.selectedUnit.wait += 60;
	  deselectUnit(self, scene);
	  scene.turnOrderUI.next();
	}


	function deselectUnit(self, scene)
	{
	  self.moveRangeSprite.visible = false;
	  self.selectedUnit = null;
	  scene.targetUI.selectedEntity = null;
	}


	function canInteract(self, scene, x, y)
	{
	  return false;
	}


	function getDirections(self, scene, x, y)
	{
	  self.directionsAvailable.up = false;
	  self.directionsAvailable.left = false;
	  self.directionsAvailable.down = false;
	  self.directionsAvailable.right = false;


	  drawOptions(self, scene);
	}


	function drawOptions(self, scene) {

	}


	function cameraMoveInput(self, scene) {

	  var scale = scene.containers.Screen.scale.x;

	  if (Game.Input.keyDown(Keyboard.UP)) 
	  {
	    scene.containers.Screen.y += 2 * scale;
	  }
	  else if (Game.Input.keyDown(Keyboard.DOWN))
	  {
	    scene.containers.Screen.y -= 2 * scale;
	  }
	  if (Game.Input.keyDown(Keyboard.LEFT)) 
	  {
	    scene.containers.Screen.x += 2 * scale;
	  }
	  else if (Game.Input.keyDown(Keyboard.RIGHT))
	  {
	    scene.containers.Screen.x -= 2 * scale; 
	  }

	  if (Game.Input.keyDown(Keyboard.DOT))
	  {
	    scene.setScreenScale(2);
	  } 
	  else if (Game.Input.keyDown(Keyboard.COMMA)) 
	  {
	    scene.setScreenScale(1.5);
	  }
	  else if (Game.Input.keyDown(Keyboard.SLASH))
	  {
	    scene.setScreenScale(1);
	  }
	}


/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	var MapScene    = __webpack_require__(15);
	var EditStates  = __webpack_require__(33);

	var MapEditScene = function () {
	  var w, h, width, height;
	  w = h = 50;
	  width = w * Game.properties['tile_width'];
	  height = h * Game.properties['tile_height'];
	  MapScene.call(this, {name: 'map_editor', w: w, h: h});

	  this.state = EditStates.PLACE_TILES;
	  this.currentTileId = 1;
	  this.interactive = true;
	  this.hitArea = new PIXI.Rectangle(0, 0, width, height);
	  this.g = new PIXI.Graphics();
	  this.addChild(this.g);
	}

	MapEditScene.prototype = Object.create(MapScene.prototype);
	MapEditScene.prototype.constructor = MapEditScene;

	MapEditScene.prototype.update = function ()
	{
	  MapScene.prototype.update.call(this);

	  if (EditStates.PLACE_TILES)
	  {
	    renderTilePosition(this.g);
	  }

	  if (Game.Input.mouseDown() && this.state == EditStates.PLACE_TILES)
	  {
	    this.setTile(Game.mousePos.x, Game.mousePos.y, this.currentTileId);
	  }
	}

	function renderTilePosition(graphics) {
	  var tx, ty, tw, th;
	  tw = Game.properties['tile_width'];
	  th = Game.properties['tile_height'];
	  tx = Math.floor(Game.mousePos.x / tw) * tw;
	  ty = Math.floor(Game.mousePos.y / th) * th;
	  
	  graphics.clear();
	  graphics.lineStyle(2, 0xff0000);
	  graphics.drawRect(tx, ty, tw, th);
	}


	module.exports = MapEditScene;


/***/ },
/* 33 */
/***/ function(module, exports) {

	
	var EditStates = {
	  PLACE_TILES: 'place_tiles',
	  SELECT_TILE: 'select_tile'
	}

	module.exports = EditStates;


/***/ }
/******/ ]);