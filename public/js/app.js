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
	var MapScene      = __webpack_require__(12);
	var MapEditScene  = __webpack_require__(25);
	var Unit          = __webpack_require__(15);
	var TileData      = __webpack_require__(11);

	var floor_data;

	Dom.ready(
	  function() {
	    PageScripts.run();

	    Game.init();
	    // TODO: make the image assets into a spritesheet
	    Game.assets
	        .push(
	          { name: 'test_floor',       url: 'data/testFloor.json'},
	          { name: 'tile_data',        url: 'data/tileData.json'},
	          { name: 'tile_placeholder', url: 'images/tile_placeholder.png' },
	          { name: 'floor',            url: 'images/floor.png' },
	          { name: 'wall',             url: 'images/wall.png' },
	          { name: 'unit_placeholder', url: 'images/unit_placeholder.png' },
	          { name: 'enemy_placeholder', url: 'images/enemy_placeholder.png' },
	          { name: 'farmer_idle',      url: 'images/farmer_idle.png' },
	          { name: 'soldier_idle',     url: 'images/soldier_idle.png' },
	          { name: 'bat_idle',         url: 'images/bat_idle.png' },
	          { name: 'heart',            url: 'images/heart.png' },
	          { name: 'half_heart',       url: 'images/heart_half.png' },
	          { name: 'empty_heart',      url: 'images/heart_empty.png' } );

	    Game.loadAssets(function (loader, resources) {
	        initTileData(resources.tile_data.data);
	        // var editor = new MapEditScene();
	        // Game.loadScene(editor);
	        var map = new MapScene(resources.test_floor.data);
	        Game.loadScene(map);
	        
	        Game.run();
	      });
	    
	  });

	function initTileData(data) {
	  for (var i = 0, l = data.types.length; i < l; i++)
	  {
	    var type = data.types[i];
	    Game.TileData[type.name] = {
	      frames: type.frames,
	      properties: type.properties ? type.properties : {}
	    }
	  }
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
	var TileData    = __webpack_require__(11);


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
	var Scene = function (name) {
	  this.name = name;

	  this.entities = {};
	  this.scenes  = {};
	  this.showing = [];
	  
	  PIXI.Container.call(this);  
	  this.entContainer = new PIXI.Container();
	  this.addChild(this.entContainer);
	}

	Scene.prototype = Object.create(PIXI.Container.prototype);
	Scene.prototype.constructor = Scene;

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
	  
	}

	// Add an entity to the scene, 
	// and add it's sprite to the container
	// - supports uid or Entity
	Scene.prototype.addEntity = function (ent) {
	  if (Number.isInteger(ent)) ent = Game.getEntity(ent);
	  if (! ent instanceof Entity) return false;
	  ent.scene = this;
	  if (! this.entities[ent.entType]) 
	    this.entities[ent.entType] = [];
	  this.entities[ent.entType].push(ent);
	  this.entContainer.addChild(ent.sprite);
	  return true;
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
	  set x (val)           { this.sprite.x = val; },

	  get y ()              { return this.sprite.y; },
	  set y (val)           { this.sprite.y = val; },

	  update: function () {}
	}

	Entity.prototype.constructor = Entity;

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
	  codes: [ 9, 13, 16,17,18, 27, 32, 37,38,39,40, 65,66,67,
	           68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,
	           84,85,86,87,88,89,90 ],
	  
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
	  Z:      90
	}

	module.exports = Keyboard;


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var Entity  = __webpack_require__(6);
	var Tile    = __webpack_require__(10);

	/**
	 * A collection of tiles of fixed width/height
	 * @param {int} w       The number of tiles wide the map is
	 * @param {int} h       The number of tiles high the map is
	 */
	var TileMap = function (w, h) {
	  this.tiles_wide   = w;
	  this.tiles_high   = h;
	  this.width        = w * Game.properties.tile_width;
	  this.height       = w * Game.properties.tile_height;
	  this.tiles        = [];
	  this.tileIds      = [];
	  this._tileValuesChanged = false;
	  this._changedTiles = [];
	  this._type = 'default';
	  initTileArrays(this);

	  this.container    = new PIXI.Container();
	  this.buffer = PIXI.RenderTexture.create(this.width, this.height);
	  var sprite = new PIXI.Sprite(this.buffer);
	  Entity.call(this, 'TileMap', sprite);
	}

	TileMap.prototype = Object.create(Entity.prototype);
	TileMap.prototype.constuctor = TileMap;

	// Change which TileFrame set to use for future tiles 
	Object.defineProperty(TileMap.prototype, 'tileType', {
	  get: function () { return this._type; },
	  set: function (val) { this._type = val; }
	});

	/**
	 * Get the Tile or TileId from local coordinates
	 * @param  {int}          x  local x coord (not position)
	 * @param  {int}          y  local y coord
	 * @param  {bool}         id (optional, return the id instead of the Tile)
	 * @return {Tile or int}  the Tile or id
	 */
	TileMap.prototype.getTile = function (x, y, id) { 
	  if (typeof id === undefined) id = false;
	  if (outOfRange(x, y, this))
	  {
	    console.log('TileMap.getTile: OUT OF RANGE ['+x+','+y+']'); 
	    return null;
	  }
	  var index = getIndex(x, y, this);
	  return id ? this.tileIds[index] : this.tiles[index];
	}

	/**
	 * Set the TileId of the Tile at the local coordinates
	 * @param {[type]} x  local x coord (not position)
	 * @param {[type]} y  local y coord
	 * @param {[type]} id the TileId to use
	 */
	TileMap.prototype.setTile = function (x, y, id) { 
	  if (outOfRange(x, y, this)) {
	    console.log('TileMap.setTile: OUT OF RANGE ['+x+','+y+']'); 
	    return;
	  }

	  var index = getIndex(x, y, this);
	  this.tileIds[index] = id;
	  this._changedTiles.push({i: index, x: x, y: y, t: this._type});
	  this._tileValuesChanged = true;
	  return this;
	}

	// Tilemap.apply
	// set the tilemaps tile values with a json object or array
	TileMap.prototype.apply   = function (tileData) { 
	  if (typeof tileData === "Array")
	  {
	    for (var k = 0; k < tileData.length; k++) {
	      var v = tileData[k];
	      setTileByData(v, this);
	    }
	  }
	  else
	  {
	    for (var k in tileData) {
	      if (! tileData.hasOwnProperty(k)) contnue;
	      var v = tileData[k];
	      setTileByData(v, this); 
	    }
	  }
	  this._tileValuesChanged = true;
	}

	// Tilemap.remove
	// remove the tile at the chosen local coordinate location
	TileMap.prototype.remove  = function (x, y) { 
	  if (outOfRange(x, y, this)) { 
	    console.log('TileMap.removeTile: OUT OF RANGE ['+x+','+y+']'); 
	    return;
	  }

	  var index = getIndex(x, y, this);
	  this.tileIds[index] = -1;
	  this._changedTiles.push({ i: index, x: x, y: y });
	  this._tileValuesChanged = true;
	}

	// Tilemap.update
	// if any tiles have changed, update the rendering of them
	TileMap.prototype.update  = function () {
	  if (! this._tileValuesChanged) return;

	  while (this._changedTiles.length > 0)
	  {
	    var ct = this._changedTiles.pop();
	    var id = this.tileIds[ct.i];
	    var tile = this.tiles[ct.i];
	    if (id < 0)
	    {
	      this.container.removeChild(tile);
	      destroyTile(tile);
	      this.tiles[ct.i] = null;
	    }
	    else
	    {
	      if (this.tiles[ct.i] == null)
	      {
	        tile = makeTile(ct.t, id);
	        tile.x = ct.x * Game.properties.tile_width;
	        tile.y = ct.y * Game.properties.tile_height;
	        this.container.addChild(tile);
	        this.tiles[ct.i] = tile;
	      }
	      else
	      {
	        tile = adjustTile(tile, ct.t, id);
	      }
	    }
	  }

	  Game.renderer.render(this.container, this.buffer);
	}



	function initTileArrays(map) 
	{
	  for (var x = 0; x < map.tiles_wide; x++) 
	  {
	    for (var y = 0; y < map.tiles_high; y++)
	    {
	      var i = getIndex(x, y, map);
	      map.tiles[i] = null;
	      map.tileIds[i] = -1;
	    }
	  }
	}


	function setTileByData(v, tilemap)
	{
	  if (v.hasOwnProperty('x') && 
	      v.hasOwnProperty('y') && 
	      v.hasOwnProperty('id'))
	  {
	    var i = getIndex(v.x, v.y, tilemap);
	    tilemap.tileIds[i] = v.id;
	    tilemap._changedTiles.push({i: i, x: v.x, y: v.y});
	  }
	  else
	  {
	    console.log('setTiles tileData value unrecovnized');
	    console.log(v);
	  }
	}


	function destroyTile(tile)
	{
	  tile.destroy({ children: true });
	}


	function getIndex(x, y, map)
	{
	  return x + (y * map.tiles_wide);
	}


	function outOfRange(x, y, map) {
	  return (x < 0 || 
	          x > map.tiles_wide || 
	          y < 0 || 
	          y > map.tiles_high); 
	}


	function makeTile(type, id) {
	  return Tile.make(type, id);
	}


	function adjustTile(tile, type, id)
	{
	  tile.adjust(type, id);
	  return tile;
	}

	module.exports = TileMap;


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var TileData = __webpack_require__(11);

	/**
	 * A TileSprite
	 */
	var Tile = function () { 
	  this._type = '';
	  this._id = 0;
	  this._properties = null;
	  var texture = getTexture(this.type, this._id);
	  PIXI.Sprite.call(this, PIXI.Texture.fromFrame('tile_placeholder'));
	}

	Tile.prototype = Object.create(PIXI.Sprite.prototype);
	Tile.prototype.constructor = Tile;

	Object.defineProperty(Tile.prototype, 'type', {
	  get: function () { return this._type; },
	  set: function (val) {
	    this._type = val;
	    this.texture = getTexture(this._type, this._id);
	    this._properties = getProperties(this._type);
	  }
	});

	Object.defineProperty(Tile.prototype, 'tileId', {
	  get: function () { return this._id; },
	  set: function (val) {
	    this._id = val;
	    this.texture = getTexture(this._type, this._id);
	  }
	});

	Object.defineProperty(Tile.prototype, 'hasProperties', {
	  get: function () { 
	    return (this._properties != null && 
	            Object.getOwnPropertyNames(this._properties).length > 0)
	  }
	});

	Tile.prototype.hasProperty = function (prop) {
	  if (!this.hasProperties) return false;
	  return this._properties.hasOwnProperty(prop);
	}

	Tile.prototype.adjust = function (type, id) {
	  this._type        = type;
	  this._id          = id;
	  this.texture      = getTexture(this._type, this._id);
	  this._properties  = getProperties(this._type);
	  return this;
	}


	Tile.make = function (type, id) {
	  var t = new Tile();
	  return t.adjust(type, id);
	}

	// TODO: change it so that the TileData[type].frames[id] is the actual texture...
	function getTexture(type, id) {
	  var frame = getFrame(type, id);
	  return PIXI.Texture.fromFrame(frame);
	}

	function getFrame(type, id) {
	  if (! TileData.hasOwnProperty(type))
	    type = 'default';
	  return TileData[type].frames.length > id ? TileData[type].frames[id] : TileData[type].frames[0];
	}

	function getProperties(type) {
	  if (! TileData.hasOwnProperty(type))
	    type = 'default';
	  var props = TileData[type].properties;
	  return Object.getOwnPropertyNames(props).length > 0 ? props : null;
	}

	module.exports = Tile;


/***/ },
/* 11 */
/***/ function(module, exports) {

	/**
	 * TileData
	 *  populate this before using TileMap to associate the frameId 
	 *  and properties to the tileId in each type
	 */

	var TileData = {};

	TileData.default = {
	  frames: ['tile_placeholder'],
	  properties: {}
	}

	module.exports = TileData;


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var Keyboard = __webpack_require__(8);
	var Scene = __webpack_require__(5);
	var TileMap = __webpack_require__(9);
	var RangeSprite = __webpack_require__(13);
	var TargetInfoScene = __webpack_require__(14);
	var Unit = __webpack_require__(15);
	var Soil = __webpack_require__(21);
	var Plant = __webpack_require__(23);

	var MapScene = function (floorData) {
	  if (floorData === undefined) floorData = { name: 'test', w: 200, h: 100 };
	  this.selectedUnit = null;
	  this.moveRangeSprite = null;
	  Scene.call(this, floorData.name);

	  setupContainers(this);

	  loadTilemap(this, floorData);
	  loadOther(this, floorData);
	  loadUI(this);
	  loadUnits(this, floorData);
	  
	}

	MapScene.prototype = Object.create(Scene.prototype);
	MapScene.prototype.constructor = MapScene;

	Object.defineProperty(MapScene.prototype, 'units', {
	  get: function () { return this.entities.Unit; }
	});

	Object.defineProperty(MapScene.prototype, 'enemies', {
	  get: function () { return this.entities.Enemy; }
	});

	Object.defineProperty(MapScene.prototype, 'plants', {
	  get: function () { return this.entities.Plant; }
	});


	MapScene.prototype.update = function ()
	{
	  Scene.prototype.update.call(this);
	  var xx, yy;

	  if (this.selectedUnit)
	  { 
	    selectedUnitInput(this);
	  }
	  cameraMoveInput(this);
	}

	MapScene.prototype.inRange = function (x, y) {
	  for (var i = 0, l = this.moveRangeSprite.tiles.length; i < l; i++)
	  {
	    var tile = this.moveRangeSprite.tiles[i];
	    if (tile.x == x && tile.y == y) return true;
	  }
	  return false;
	}


	MapScene.prototype.canUnitMoveHere = function (unit, x, y) {
	  var tile = this.tilemap.getTile(x, y);
	  return testTileIsGround(tile);
	}

	MapScene.prototype.getTile = function (x, y, local) {
	  if (local === undefined) local = false;

	  if (! local) {
	    x = getTileX(x);
	    y = getTileY(y);
	  }

	  return this.tilemap.getTile(x, y);
	}

	MapScene.prototype.setTile = function (x, y, val, local) {
	  if (local === undefined) local = false;

	  if (! local) {
	    x = getTileX(x);
	    y = getTileY(y);
	  }

	  this.tilemap.setTile(x, y, val);
	}

	MapScene.prototype.unitClicked = function (unit) {
	  this.selectedUnit = unit;
	  this.moveRangeSprite.visible = true;
	  var range = this.selectedUnit.stats.move_range ? this.selectedUnit.stats.move_range : 5;
	  this.moveRangeSprite.drawUnitsRange(this.selectedUnit, 0, range);
	}


	MapScene.prototype.addEntity = function (ent, layer) {
	  if (Number.isInteger(ent)) ent = Game.getEntity(ent);
	  ent.scene = this;
	  if (! this.entities[ent.entType]) 
	    this.entities[ent.entType] = [];
	  this.entities[ent.entType].push(ent);
	  
	  if (layer === undefined) layer = ent.entType;
	  this.containers[layer].addChild(ent.sprite); // changed from the Scene.addEntity
	  // this.entContainer.addChild(ent.sprite); 
	  return true;
	}


	// Private methods

	function setupContainers(scene)
	{
	  scene.containers = {};
	  scene.containers['Background']  = new PIXI.Container();
	  scene.containers['Soil']        = new PIXI.Container();
	  scene.containers['BelowUnits']  = new PIXI.Container();
	  scene.containers['Plant']       = new PIXI.Container();
	  scene.containers['Unit']        = new PIXI.Container();

	  scene.addChild(scene.containers['Background']);
	  scene.addChild(scene.containers['Soil']);
	  scene.addChild(scene.containers['BelowUnits']);
	  scene.addChild(scene.containers['Plant']);
	  scene.addChild(scene.containers['Unit']);
	}


	function loadTilemap(scene, data)
	{
	  scene.tilemap = new TileMap(data.w, data.h);
	  if (data.tiles && data.tiles.length > 0)
	  {
	    for (var i = 0, l = data.tiles.length; i < l; i++)
	    {
	      var v = data.tiles[i];
	      var type = data.types[v];
	      if (type)
	      {
	        var x = i % data.w;
	        var y = Math.floor(i / data.w);
	        scene.tilemap.tileType = type;
	        scene.tilemap.setTile(x, y, v);
	      }
	    }
	  }

	  scene.addEntity(scene.tilemap, 'Background');
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

	function addSoil(scene, data)
	{
	  var soil = new Soil(data.type);

	  soil.tileX = data.x;
	  soil.tileY = data.y;
	  if (data.state)
	    soil.state = data.state;

	  scene.addEntity(soil);

	  // if the soil has plant data
	  if (data.plant)
	  {
	    var plant = new Plant(data.plant.type);
	    
	    if (data.plant.state)
	      plant.state = data.plant.state;

	    scene.addEntity(plant);
	    plant.plant(soil);
	  }
	}

	function loadUI(scene)
	{
	  scene.targetUI = new TargetInfoScene();
	  scene.targetUI.x = Game.props.stage_width - scene.targetUI.width;
	  scene.addScene(scene.targetUI, true);

	  scene.moveRangeSprite = createRangeSprite(scene);
	  scene.containers['BelowUnits'].addChild(scene.moveRangeSprite);
	}

	function getTileX(x) {
	  var tw = Game.properties['tile_width'];
	  return Math.floor(x / tw);
	}

	function getTileY(y) {
	  var th = Game.properties['tile_height'];
	  return Math.floor(y / th);
	}

	function createRangeSprite(map) {
	  var g = new RangeSprite(map);
	  g.visible = false;
	  return g;
	}

	function testTileIsGround(tile) {
	  if (tile == null) return false;
	  if (tile.hasProperty('wall') || tile.hasProperty('hole')) return false;
	  return true;
	}

	function selectedUnitInput(scene) {
	  xx = scene.selectedUnit.tileX;
	  yy = scene.selectedUnit.tileY;

	  if (Game.Input.keyReleased(Keyboard.W))
	  {
	    if (scene.inRange(xx, yy - 1))
	      scene.selectedUnit.moveTo(xx, yy - 1);
	  } 
	  else if (Game.Input.keyReleased(Keyboard.S)) 
	  {
	    if (scene.inRange(xx, yy + 1))
	      scene.selectedUnit.moveTo(xx, yy + 1);
	  }
	  if (Game.Input.keyReleased(Keyboard.A)) 
	  {
	    if (scene.inRange(xx - 1, yy))
	      scene.selectedUnit.moveTo(xx - 1, yy);
	  }
	  else if (Game.Input.keyReleased(Keyboard.D))
	  {
	    if (scene.inRange(xx + 1, yy))
	      scene.selectedUnit.moveTo(xx + 1, yy);
	  }

	  if (Game.Input.mouseDown() || Game.Input.keyDown(Keyboard.SPACE))
	  {
	    scene.selectedUnit = null;
	    scene.moveRangeSprite.visible = false;
	  }
	}

	function cameraMoveInput(scene) {
	  if (Game.Input.keyDown(Keyboard.UP)) 
	  {
	    scene.entContainer.y += 2;
	  }
	  else if (Game.Input.keyDown(Keyboard.DOWN))
	  {
	    scene.entContainer.y -= 2;
	  }
	  if (Game.Input.keyDown(Keyboard.LEFT)) 
	  {
	    scene.entContainer.x += 2;
	  }
	  else if (Game.Input.keyDown(Keyboard.RIGHT))
	  {
	    scene.entContainer.x -= 2; 
	  }
	}


	module.exports = MapScene;


/***/ },
/* 13 */
/***/ function(module, exports) {

	
	var directions = [[-1, 0], [0, -1], [1, 0], [0, 1]];

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

	// TODO: improve this to support drawing ranges with min and max values
	RangeSprite.prototype.drawUnitsRange = function (unit, min, max, before, after) {
	  var map = this.map;
	  this.clearTiles();
	  this.clear();
	  if (before === undefined)
	    this.lineStyle(1, this.draw.color, this.draw.alpha);
	  else
	    before(this)
	  
	  if (min != 0)
	  {
	    this.addTiles(unit, unit.tileX, unit.tileY, 0, min, function (x, y) { return map.canUnitMoveHere(unit, x, y); }, false);
	  }
	  this.addTiles(unit, unit.tileX, unit.tileY, min, max, function (x, y) { return map.canUnitMoveHere(unit, x, y); });

	  if (after === undefined)
	  {
	    // this.endFill();
	  }
	  else
	    after(this)
	}

	RangeSprite.prototype.addTiles = function (unit, x, y, r, max_r, check, draw) {
	  var d = 0, dir = null, xx = x, yy = y, l = directions.length;
	  if (draw === undefined) draw = true;

	  if (r >= max_r) return;
	  if (! check(x, y)) return;
	  
	  while (d < l) {
	    dir = directions[d];
	    xx = x + dir[0];
	    yy = y + dir[1];
	    this.addTiles(unit, xx, yy, r+1, max_r, check);
	    d++;
	  }
	  if (this.tiles.findIndex(function (elm) { return elm.x == x && elm.y == y; }) != -1) return;
	  if (draw)
	    drawRect(this, x, y);

	  this.tiles.push({x: x, y: y});
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
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var Scene = __webpack_require__(5);

	var TARGET_UI = {
	  WIDTH: 128,
	  BG_COLOR: 0xeeeeee,
	}

	var TargetInfoScene = function ()
	{
	  this._selectedEntity = null;
	  Scene.call(this, 'TargetUI');
	  initUI(this);
	}

	TargetInfoScene.prototype = Object.create(Scene.prototype);
	TargetInfoScene.prototype.constructor = TargetInfoScene;

	Object.defineProperty(TargetInfoScene.prototype, 'selectedEntity', {
	  get: function () { return this._selectedEntity; },
	  set: function (val) {
	    this._selectedEntity = val;
	    selectedEntityChanged(this, val);
	  }
	});


	function initUI(scene) 
	{
	  // create the background
	  var g = scene._background = new PIXI.Graphics();
	  g.beginFill(TARGET_UI.BG_COLOR, 1);
	  g.drawRect(0, 0, TARGET_UI.WIDTH, Game.props.stage_height);
	  g.endFill();
	  scene.addChild(scene._background);
	}

	function selectedEntityChanged(scene, entity) 
	{
	  if (entity == null)
	  {
	    return;
	  }
	  var type = entity.entType;
	}

	module.exports = TargetInfoScene;


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var UnitData     = __webpack_require__(16);
	var Actor        = __webpack_require__(17);

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

	Unit.prototype.initialize = function () 
	{
	  loadStats(this);

	  this.offset.x = UNIT_OFFSET.x;
	  this.offset.y = UNIT_OFFSET.y;
	  
	  this.sprite.interactive = true;
	  this.sprite.on('click', onClick, this);
	  this.sprite.on('touchstart', onClick, this);

	  Actor.prototype.initialize.call(this);
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
	  if (this.scene && typeof this.scene.unitClicked == 'function')
	    this.scene.unitClicked(this);
	}


	module.exports = Unit;


/***/ },
/* 16 */
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
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var HealthSprite = __webpack_require__(18);
	var Entity       = __webpack_require__(19);
	var ACTOR_STATES = __webpack_require__(20);

	// Extends Entity
	var Actor = function (entType, sprite) {
	  
	  this._state = ACTOR_STATES.IDLE;
	  this._behaviour = 'wait';
	  this._destination = new PIXI.Point(0,0);
	  this.animation = null;
	  Entity.call(this, entType, sprite)

	  this.initialize();
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

	// Methods

	Actor.prototype.initialize = function () {

	  Entity.prototype.initialize.call(this);

	  // create and show the health
	  this.healthSprite = makeHealthSprite(this);
	  this.sprite.addChild(this.healthSprite);
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
	  s.y = unit.y - unit.sprite.height - 32;
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
/* 18 */
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
/* 19 */
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
/* 20 */
/***/ function(module, exports) {

	
	var ActorStates = {
	  IDLE: 'idle'
	};

	module.exports = ActorStates;


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	var SoilData     = __webpack_require__(22);
	var Entity       = __webpack_require__(19);

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
/* 22 */
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
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	var PlantData     = __webpack_require__(24);
	var Entity        = __webpack_require__(19);

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
/* 24 */
/***/ function(module, exports) {

	var PlantData = {

	  types: ['default', 'peas'],
	  default: {
	    states: ['none'],
	    frames: ['tile_placeholder'],
	    props: {}
	  },
	  peas: {
	    states: ['seed', 'sprout', 'vine', 'bud', 'hasPods'],
	    frames: ['tile_placeholder', 'tile_placeholder', 'tile_placeholder', 'tile_placeholder', 'tile_placeholder'],
	    props: {
	      waterUsedPerTick: [5, 3, 3, 2, 0],
	      growthPerDrink:   [1, 3, 2, 2, 0],
	      growthStateMap:   [0, 10, 40, 60, 100]
	    }
	  }

	};

	module.exports = PlantData;


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	var MapScene    = __webpack_require__(12);
	var EditStates  = __webpack_require__(26);

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
/* 26 */
/***/ function(module, exports) {

	
	var EditStates = {
	  PLACE_TILES: 'place_tiles',
	  SELECT_TILE: 'select_tile'
	}

	module.exports = EditStates;


/***/ }
/******/ ]);