var Keyboard = require(__dirname+'/../game/Keyboard');
var Scene = require(__dirname+'/../game/Scene');
var TileMap = require(__dirname+'/../game/TileMap');
var RangeSprite = require(__dirname+'/RangeSprite');
var TargetInfoScene = require(__dirname+'/TargetInfoScene');
var Unit = require(__dirname+'/Unit');
var Soil = require(__dirname+'/Soil');
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
