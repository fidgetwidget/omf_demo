var Keyboard    = require(__dirname+'/../game/Keyboard');
var Scene       = require(__dirname+'/../game/Scene');
var TileGrid    = require(__dirname+'/../game/TileGrid');
var TileData    = require(__dirname+'/../game/TileData');
var RangeSprite = require(__dirname+'/RangeSprite');
var TargetInfoScene = require(__dirname+'/TargetInfoScene');
var Unit  = require(__dirname+'/Unit');
var Soil  = require(__dirname+'/Soil');
var Plant = require(__dirname+'/Plant');

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
  var isWall = this.tilemap.getAt(x, y, 'wall'),
      noTile = this.tilemap.getAt(x, y, 'tile.id') < 0,
      hasUnit = isUnitAt(x, y, this, unit);
  
  return !isWall && !noTile && !hasUnit;
}

MapScene.prototype.canUnitPassThroughHere = function (unit, x, y) {
  var isWall = this.tilemap.getAt(x, y, 'wall'),
      noTile = this.tilemap.getAt(x, y, 'tile.id') < 0,
      hasEnemy = isEnemyAt(x, y, this);

  return !isWall && !noTile && !hasEnemy;
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

MapScene.prototype.unitClicked = function (unit) {
  this.selectedUnit = unit;
  this.moveRangeSprite.visible = true;
  var range = this.selectedUnit.stats.move_range ? this.selectedUnit.stats.move_range : 5;
  this.moveRangeSprite.drawUnitsRange(this.selectedUnit, 0, range);
}

// Private methods

function setupContainers(scene)
{
  scene.entities['Soil']  = [];
  scene.entities['Unit']  = [];
  scene.entities['Enemy'] = [];
  scene.entities['Plant'] = [];

  scene.containers['Background']  = new PIXI.Container();
  scene.containers['Soil']        = new PIXI.Container();
  scene.containers['RangeSprite'] = new PIXI.Container();
  scene.containers['Plant']       = new PIXI.Container();
  scene.containers['Unit']        = new PIXI.Container();

  scene.addChild(scene.containers['Background']);
  scene.addChild(scene.containers['Soil']);
  scene.addChild(scene.containers['RangeSprite']);
  scene.addChild(scene.containers['Plant']);
  scene.addChild(scene.containers['Unit']);
}


function loadTilemap(scene, data)
{
  var tilemap = new TileGrid(data.w, data.h);
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
  scene.addUpdatable(tilemap);
  scene.addEntity(tilemap, 'Background');

  scene.tilemap = tilemap;
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

  scene.addEntity(soil, 'Soil');

  // if the soil has plant data
  if (data.plant)
  {
    var plant = new Plant(data.plant.type);
    
    if (data.plant.state)
      plant.state = data.plant.state;

    scene.addEntity(plant, 'Plant');
    plant.plant(soil);
  }
}

function loadUI(scene)
{
  scene.targetUI = new TargetInfoScene();
  scene.targetUI.x = Game.props.stage_width - scene.targetUI.width;
  scene.addScene(scene.targetUI, true);

  scene.moveRangeSprite = createRangeSprite(scene);
  scene.containers['RangeSprite'].addChild(scene.moveRangeSprite);
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

function isUnitAt(x, y, scene, excluded) {
  var units = scene.units;
  for(var i = 0, l = units.length; i < l; i++)
  {
    var unit = units[i];
    if (unit.tileX == x && unit.tileY == y && unit != excluded) return true;
  }
  return false;
}

function isEnemyAt(x, y, scene, excluded) {
  var enemies = scene.enemies;
  for (var i = 0, l = enemies.length; i < l; i++)
  {
    var enemy = enemies[i];
    if (enemy.tileX == x && enemy.tileY == y && enemy != excluded) return true;
  }
  return false;
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

function getTileProperties(type, id)
{
  if (! TileData.hasOwnProperty(type))
  {
    type = 'default'
  }
  return TileData[type].properties;
}


module.exports = MapScene;
