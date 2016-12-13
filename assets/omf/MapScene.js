var Keyboard = require(__dirname+'/../game/Keyboard');
var Scene = require(__dirname+'/../game/Scene');
var TileMap = require(__dirname+'/../game/TileMap');
var MoveRangeSprite = require(__dirname+'/MoveRangeSprite');

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
  var g = new MoveRangeSprite(map);
  g.visible = false;
  return g;
}


function testTileIsGround(tile) {
  if (tile == null) return false;
  if (tile.hasProperty('wall') || tile.hasProperty('hole')) return false;
  return true;
}


module.exports = MapScene;
