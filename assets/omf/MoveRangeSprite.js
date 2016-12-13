
var directions = [[-1, 0], [0, -1], [1, 0], [0, 1]];

var MoveRangeSprite = function (map) {
  this.tiles = [];
  this.map = map;
  PIXI.Graphics.call(this);
}

MoveRangeSprite.prototype = Object.create(PIXI.Graphics.prototype);
MoveRangeSprite.prototype.constructor = MoveRangeSprite;

MoveRangeSprite.prototype.clearTiles = function () {
  this.tiles.length = 0;
}

MoveRangeSprite.prototype.drawUnitsRange = function (unit, range) {
  this.clearTiles();
  console.log('drawRangeStart');
  this.clear();
  this.beginFill(0x009900, 0.5);
  this.drawTile(unit, unit.tileX, unit.tileY, 0, range);
  this.endFill();
  console.log('drawRangeEnd');
}

MoveRangeSprite.prototype.drawTile = function (unit, x, y, r, max_r) {
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

module.exports = MoveRangeSprite;
