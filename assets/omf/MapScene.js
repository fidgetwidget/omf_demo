var Scene       = require(__dirname+'/../game/Scene');
var TileEntity  = require(__dirname+'/TileEntity');
var Loader      = require(__dirname+'/MapSceneLoader');
var Interaction = require(__dirname+'/MapSceneInteraction');
var Actor       = require(__dirname+'/Actor');
var Unit        = require(__dirname+'/Unit');
var TargetUI    = require(__dirname+'/TargetUI');
var TurnOrderUI = require(__dirname+'/TurnOrderUI');

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
