
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
