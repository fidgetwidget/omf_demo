var Dom         = require(__dirname+'/Dom');
var EventTarget = require(__dirname+'/lib/EventTarget');
var Scene       = require(__dirname+'/game/Scene');
var Input       = require(__dirname+'/game/Input');
var TileMap     = require(__dirname+'/game/TileMap');
var TileData    = require(__dirname+'/game/TileData');


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

