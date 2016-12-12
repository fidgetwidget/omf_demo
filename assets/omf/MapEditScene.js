var MapScene    = require(__dirname+'/MapScene');
var EditStates  = require(__dirname+'/EditStates');

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
