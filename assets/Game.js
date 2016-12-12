var Dom         = require(__dirname+'/Dom');
var EventTarget = require(__dirname+'/lib/EventTarget');
var Scene       = require(__dirname+'/game/Scene');
var Input       = require(__dirname+'/game/Input');
var TileMap     = require(__dirname+'/game/TileMap');
var Unit        = require(__dirname+'/omf/Unit');

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

