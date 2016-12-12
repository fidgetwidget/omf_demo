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
	var MapScene      = __webpack_require__(17);
	var MapEditScene  = __webpack_require__(19);
	var Unit          = __webpack_require__(12);
	var TileData      = __webpack_require__(11);

	var floor_data;

	Dom.ready(
	  function() {
	    PageScripts.run();

	    Game.init();
	    Game.assets
	        .push({ name: 'tile_placeholder', url: 'images/tile_placeholder.png' },
	              { name: 'floor',            url: 'images/floor.png' },
	              { name: 'wall',             url: 'images/wall.png' },
	              { name: 'unit_placeholder', url: 'images/unit_placeholder.png' },
	              { name: 'heart',            url: 'images/heart.png' },
	              { name: 'half_heart',       url: 'images/heart_half.png' },
	              { name: 'empty_heart',      url: 'images/heart_empty.png' },
	              { name: 'test_floor',       url: 'data/testFloor.json'} );

	    Game.loadAssets(function (loader, resources) {
	        TileData.floor = {
	            frames: ['', 'floor'],
	            properties: {}
	          };
	        TileData.wall = {
	            frames: ['', '', 'wall'],
	            properties: {wall: true}
	          };
	        // var editor = new MapEditScene();
	        // Game.loadScene(editor);
	        var map = new MapScene(resources.test_floor.data);
	        var unit = new Unit('soldier');
	        unit.moveTo(10, 9, true);
	        Game.loadScene(map);
	        map.addEntity(unit);
	        Game.run();
	      });
	    
	  });


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
	var Unit        = __webpack_require__(12);

	var elms = [];
	var eventTarget = new EventTarget();
	var stage_width = 800, stage_height = 600;
	var Game = {
	  renderOptions: {
	    antialias: false, 
	    transparent: false, 
	    resolution: 1
	  },
	  assets: [],
	  _loopId: null
	}

	Game.init = function () {
	  init();
	  window.Game = Game;
	  //Create the renderer
	  this.renderer = PIXI.autoDetectRenderer(
	    stage_width, 
	    stage_height, 
	    this.renderOptions );
	  this.stage = new PIXI.Container();

	  elms['game_container'] = Dom.byId('game_container');
	  elms['debug_container'] = Dom.byId('debug_container');
	  elms['game_container'].appendChild(this.renderer.view);

	  initEvents();
	  initProperties();
	  initSceneManager();
	}

	Game.loadAssets = function (progress, complete) {
	  if (complete === undefined)
	  {
	    complete = progress;
	    progress = loadingProgress; // default onProgress function
	  }
	  loadAssets(Game.assets, progress, complete);
	}

	Game.run = function () { 
	  animate(); 
	}

	Game.stop = function () {
	  if (Game._loopId)
	    cancelAnimationFrame(Game._loopId);
	}

	Game.loadScene = function (scene) {
	  if (! scene instanceof Scene) return false;
	  this.sceneManager.addScene(scene, true);
	}

	Game.getScene = function (name) {
	  return this.sceneManager.getScene(name);
	}

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

	Game.on = function (name, cb) {
	  eventTarget.addEventListener(name, cb);
	}

	Game.off = function (name, cb) {
	  eventTarget.removeEventListener(name, cb);
	}

	Game.trigger = function (name, context) {
	  eventTarget.dispatchEvent({ type: name }, context);
	}


	function init()
	{
	  Input.init();
	  Game.Input = Input;
	  Game._entities = {};
	  Game._entitiesByType = {};
	  Game.mousePos = new PIXI.Point(0, 0);
	}

	function initEvents()
	{
	  window.addEventListener('mousemove', mousemove, false);
	}

	function initProperties()
	{
	  Game.properties = {};
	  Game.properties['tile_width']  = 32;
	  Game.properties['tile_height'] = 32;
	  Game.properties['stage_width']  = stage_width;
	  Game.properties['stage_height'] = stage_height;
	}

	function initSceneManager() {
	  Game.sceneManager = new Scene('manager');
	  Game.stage.addChild(Game.sceneManager);
	}

	function mousemove(e) {
	  var canvas = Game.renderer.view,
	      rect = canvas.getBoundingClientRect(),
	      scaleX = canvas.width / rect.width, 
	      scaleY = canvas.height / rect.height;
	  Game.mousePos.x = (e.clientX - rect.left) * scaleX;
	  Game.mousePos.y = (e.clientY - rect.top) * scaleY;
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

	  elms['debug_container'].innerText = "["+Game.mousePos.x+"|"+Game.mousePos.y+"]";
	}


	module.exports = Game;



/***/ },
/* 4 */
/***/ function(module, exports) {

	
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
	  this.addChild(ent.sprite);
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

	  get interactive ()    { return this.sprite.interactive; },
	  set interactive (val) { this.sprite.interactive = val; },

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

	var UnitFrames   = __webpack_require__(13);
	var UnitStates   = __webpack_require__(14);
	var UnitStats    = __webpack_require__(15);
	var UnitHealthSprite = __webpack_require__(16);
	var Entity       = __webpack_require__(6);

	var default_offset = { x: 0, y: 8 }; // gives the unit a position more In the tile space

	// Extends Entity
	var Unit = function (type) {

	  this.type         = type;
	  this._state       = UnitStates.getState('idle');
	  this._textures    = getUnitTypeTextures(this.type);
	  this._destination = new PIXI.Point(0, 0);
	  this.offset       = new PIXI.Point(default_offset.x, default_offset.y);
	  setStats(this.type, this);
	  
	  var sprite = makeUnitSprite(this);
	  Entity.call(this, 'Unit', sprite);

	  this.healthSprite = makeHealthSprite(this);
	  this.sprite.addChild(this.healthSprite);

	  this.interactive = true;
	  this.sprite.on('click', onClick, this);
	  this.sprite.on('touchstart', onClick, this);

	}

	Unit.prototype = Object.create(Entity.prototype);
	Unit.prototype.constructor = Unit;

	Object.defineProperty(Unit.prototype, 'state', {
	  get: function ()    { return this._state; },
	  set: function (val) {
	    this._state = val;
	    // TODO: if the state calls for an animation, 
	    //        set the sprite up to be animated
	    //        otherwise, just assign the correct texture
	  }
	});

	Object.defineProperty(Unit.prototype, 'tileX', {
	  get: function ()    { return Math.floor(this.xx / Game.properties.tile_width); }
	})

	Object.defineProperty(Unit.prototype, 'tileY', {
	  get: function ()    { return Math.floor(this.yy / Game.properties.tile_height); }
	});

	Object.defineProperty(Unit.prototype, 'xx', {
	  get: function ()    { return this.x - (this.sprite.anchor.x * Game.properties.tile_width ) + this.offset.x; },
	  set: function (val) { this.x = val +  (this.sprite.anchor.x * Game.properties.tile_width ) - this.offset.x; }
	});

	Object.defineProperty(Unit.prototype, 'yy', {
	  get: function ()    { return this.y - (this.sprite.anchor.y * Game.properties.tile_height ) + this.offset.y; },
	  set: function (val) { this.y = val +  (this.sprite.anchor.y * Game.properties.tile_height ) - this.offset.y; }
	});

	Object.defineProperty(Unit.prototype, 'hasDestination', {
	  get: function ()    { return this.xx != this._destination.x || this.yy != this._destination.y; }
	})

	Unit.prototype.moveTo = function (x, y, immediate) { 
	  if (immediate === undefined) immediate = false;
	  
	  if (immediate)
	  {
	    this.xx = this._destination.x = x * Game.properties.tile_width;
	    this.yy = this._destination.y = y * Game.properties.tile_height; 
	  }
	  else
	    setDestination(this, x, y);
	}

	Unit.prototype.update = function () { 
	  move(this); 
	}



	function lerpMovement(cur, dest, size)
	{
	  var dif, t;
	  dif = dest - cur;
	  if (dif == 0) return cur;
	  t = Math.abs(1 / (dif / size)) * 0.25;
	  return Math.floor(cur + t * dif);
	}

	function getUnitTypeTextures(type)
	{
	  if (! UnitFrames.hasOwnProperty(type))
	    type = 'default';

	  return UnitFrames[type];
	}

	function setStats(type, unit)
	{
	  var stats = UnitStats[type];
	  for (var k in stats)
	    unit[k] = stats[k];
	}

	// TODO: support animations
	function makeUnitSprite(unit)
	{
	  var sprite = PIXI.Sprite.fromFrame(unit._textures['idle']);
	  sprite.anchor.x = 0.5;
	  sprite.anchor.y = 1;
	  sprite.x = (Game.properties.tile_width  * sprite.anchor.x) - unit.offset.x;
	  sprite.y = (Game.properties.tile_height * sprite.anchor.y) - unit.offset.y;
	  return sprite;
	}

	function makeHealthSprite(unit)
	{
	  var hearts = unit.max_health ? unit.max_health : 2;
	  var s = new UnitHealthSprite(hearts);
	  s.y = unit.y - unit.sprite.height - 32;
	  return s;
	}

	function move(unit)
	{
	  if (! unit.hasDestination) return;
	  
	  unit.xx = lerpMovement(unit.xx, unit._destination.x, Game.properties.tile_width);
	  unit.yy = lerpMovement(unit.yy, unit._destination.y, Game.properties.tile_height);
	}

	function setDestination(unit, tileX, tileY)
	{
	  unit._destination.x = tileX * Game.properties.tile_width;
	  unit._destination.y = tileY * Game.properties.tile_height;
	}

	function onClick(e)
	{
	  if (this.scene && typeof this.scene.unitClicked == 'function')
	    this.scene.unitClicked(this);
	}


	module.exports = Unit;


/***/ },
/* 13 */
/***/ function(module, exports) {

	var UnitFrames = {};

	UnitFrames['default'] = { 'idle': 'unit_placeholder' };

	module.exports = UnitFrames;


/***/ },
/* 14 */
/***/ function(module, exports) {

	var _states = { 'idle': 0 };
	var UnitStates = {};

	UnitStates.getState = function (name) {
	  return _states[name];
	}

	module.exports = UnitStates;


/***/ },
/* 15 */
/***/ function(module, exports) {

	var UnitStats = {

	  'farmer': {
	    'max_health': 2,
	    'move_range': 6,
	    'attack_range': 1
	  },
	  'soldier': {
	    'max_health': 3,
	    'move_range': 5,
	    'attack_range': 2
	  },
	  'archer': {
	    'max_health': 2,
	    'move_range': 4,
	    'attack_range': 4
	  },
	  'lumberjack': {
	    'max_health': 4,
	    'move_range': 5,
	    'attack_range': 1
	  }

	};



	module.exports = UnitStats;

/***/ },
/* 16 */
/***/ function(module, exports) {

	
	var UnitHealthSprite = function (hearts)
	{
	  this.max_health = hearts;
	  this.cur_health = hearts * 2; // half values
	  this.sprites = [];
	  PIXI.Container.call(this);
	  createSprites(this);
	  // this.x = -(this.width * 0.5);
	}

	UnitHealthSprite.prototype = Object.create(PIXI.Container.prototype);
	UnitHealthSprite.prototype.constructor = UnitHealthSprite;

	UnitHealthSprite.prototype.changeValue = function (count) {



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

	module.exports = UnitHealthSprite;


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var Keyboard = __webpack_require__(8);
	var Scene = __webpack_require__(5);
	var TileMap = __webpack_require__(9);
	var UnitMoveRange = __webpack_require__(18);

	var MapScene = function (floorData) {
	  if (floorData === undefined) floorData = { name: 'test', w: 200, h: 100 };
	  this.selectedUnit = null;
	  this.moveRangeSprite = null;
	  Scene.call(this, floorData.name);

	  this.tilemap = new TileMap(floorData.w, floorData.h);
	  if (floorData.tiles && floorData.tiles.length > 0)
	  {
	    for (var i = 0, l = floorData.tiles.length; i < l; i++)
	    {
	      var v = floorData.tiles[i];
	      var type = floorData.types[v];
	      if (type)
	      {
	        var x = i % floorData.w;
	        var y = Math.floor(i / floorData.w);
	        this.tilemap.tileType = type;
	        this.tilemap.setTile(x, y, v);
	      }
	    }
	  }

	  this.addEntity(this.tilemap);
	  this.moveRangeSprite = createMoveRangeSprite(this);
	  this.addChild(this.moveRangeSprite);
	}

	MapScene.prototype = Object.create(Scene.prototype);
	MapScene.prototype.constructor = MapScene;

	Object.defineProperty(MapScene.prototype, 'units', {
	  get: function () { return this.entities.Unit; }
	});


	MapScene.prototype.update = function ()
	{
	  Scene.prototype.update.call(this);
	  var xx, yy;

	  if (this.selectedUnit)
	  { 
	    xx = this.selectedUnit.tileX;
	    yy = this.selectedUnit.tileY;

	    if (Game.Input.keyReleased(Keyboard.W))
	    {
	      if (this.inRange(xx, yy - 1))
	        this.selectedUnit.moveTo(xx, yy - 1);
	    } 
	    else if (Game.Input.keyReleased(Keyboard.S)) 
	    {
	      if (this.inRange(xx, yy + 1))
	        this.selectedUnit.moveTo(xx, yy + 1);
	    }
	    if (Game.Input.keyReleased(Keyboard.A)) 
	    {
	      if (this.inRange(xx - 1, yy))
	        this.selectedUnit.moveTo(xx - 1, yy);
	    }
	    else if (Game.Input.keyReleased(Keyboard.D))
	    {
	      if (this.inRange(xx + 1, yy))
	        this.selectedUnit.moveTo(xx + 1, yy);
	    }

	    if (Game.Input.mouseDown() || Game.Input.keyDown(Keyboard.SPACE))
	    {
	      this.selectedUnit = null;
	      this.moveRangeSprite.visible = false;
	    }
	  }
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
	  var range = this.selectedUnit.move_range ? this.selectedUnit.move_range : 5;
	  this.moveRangeSprite.drawUnitsRange(this.selectedUnit, range);
	}


	function getTileX(x) {
	  var tw = Game.properties['tile_width'];
	  return Math.floor(x / tw);
	}


	function getTileY(y) {
	  var th = Game.properties['tile_height'];
	  return Math.floor(y / th);
	}


	function createMoveRangeSprite(map) {
	  var g = new UnitMoveRange(map);
	  g.visible = false;
	  return g;
	}


	function testTileIsGround(tile) {
	  if (tile == null) return false;
	  if (tile.hasProperty('wall') || tile.hasProperty('hole')) return false;
	  return true;
	}


	module.exports = MapScene;


/***/ },
/* 18 */
/***/ function(module, exports) {

	
	var directions = [[-1, 0], [0, -1], [1, 0], [0, 1]];

	var UnitMoveRange = function (map) {
	  this.tiles = [];
	  this.map = map;
	  PIXI.Graphics.call(this);
	}

	UnitMoveRange.prototype = Object.create(PIXI.Graphics.prototype);
	UnitMoveRange.prototype.constructor = UnitMoveRange;

	UnitMoveRange.prototype.clearTiles = function () {
	  this.tiles.length = 0;
	}

	UnitMoveRange.prototype.drawUnitsRange = function (unit, range) {
	  this.clearTiles();
	  console.log('drawRangeStart');
	  this.clear();
	  this.beginFill(0x009900, 0.5);
	  this.drawTile(unit, unit.tileX, unit.tileY, 0, range);
	  this.endFill();
	  console.log('drawRangeEnd');
	}

	UnitMoveRange.prototype.drawTile = function (unit, x, y, r, max_r) {
	  var d = 0, dir = null, xx = x, yy = y, l = directions.length;

	  if (r >= max_r) return;
	  if (! this.map.canUnitMoveHere(unit, xx, yy)) return;
	  
	  while (d < l) {
	    dir = directions[d];
	    xx = x + dir[0];
	    yy = y + dir[1];
	    this.drawTile(unit, xx, yy, r+1, max_r);
	    d++;
	  }
	  if (this.tiles.findIndex(function (elm) { return elm.x == x && elm.y == y; }) != -1) return;
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

	module.exports = UnitMoveRange;


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	var MapScene    = __webpack_require__(17);
	var EditStates  = __webpack_require__(20);

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
/* 20 */
/***/ function(module, exports) {

	
	var EditStates = {
	  PLACE_TILES: 'place_tiles',
	  SELECT_TILE: 'select_tile'
	}

	module.exports = EditStates;


/***/ }
/******/ ]);