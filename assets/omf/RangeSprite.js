
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
RangeSprite.prototype.drawUnitsRange = function (unit, min, max) {
  var map = this.map;

  this.clearTiles();
  this.clear();

  this.lineStyle(1, this.draw.color, this.draw.alpha);

  if (min != 0)
  {
    this.addTiles(unit, unit.tileX, unit.tileY, 0, min, 
      function (x, y) { return !map.canUnitMoveHere(unit, x, y); },
      function (x, y) { return map.canUnitPassThroughHere(unit, x, y); }, true);
  }

  this.addTiles(unit, unit.tileX, unit.tileY, min, max, 
    function (x, y) { return !map.canUnitMoveHere(unit, x, y); },
    function (x, y) { return map.canUnitPassThroughHere(unit, x, y); });

}

RangeSprite.prototype.addTiles = function (unit, x, y, r, max_r, blocked, passable, dontDraw) {
  var d = 0, dir = null, xx = x, yy = y, l = directions.length, block = blocked(x, y), pass = passable(x, y);

  if (r >= max_r) return;
  if (block && !pass) return;
  
  while (d < l) {
    dir = directions[d];
    xx = x + dir[0];
    yy = y + dir[1];
    this.addTiles(unit, xx, yy, r+1, max_r, blocked, passable);
    d++;
  }

  this.tiles.push({x: x, y: y});

  if (dontDraw) return;

  if (block)
    drawRect(this, x, y);
  else
    drawFull(this, x, y);
}

function drawFull(g, x, y) {
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
  drawLines(g, x, y, xx, yy, w, h);
}

function drawLines(g, x, y, left, top, width, height)
{
  var xx = left,
      yy = top,
      right = xx + width,
      bottom = yy + height,
      steps = 8
      step = width / steps,
      i = 0,
      w = width,
      h = height;

  yy = top + (step * steps);
  h = (height - step * steps);
  w = (width - step * steps);
  while (i < steps)
  {
    g.moveTo(xx, yy);
    g.lineTo(xx + w, yy + h);
    if (i >= Math.floor(steps * 0.5))
    {
      xx += step * 2;
      w -= step * 2;
      h -= step * 2;
    }
    else
    {
      yy -= step * 2;
      w += step * 2;
      h += step * 2;
    }
    i++;
  }
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
