var Node = require(__dirname+'/SearchNode');

var directions = [[-1, 0], [0, -1], [1, 0], [0, 1]];
var count = 0;

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

RangeSprite.prototype.search = function (x, y, min, max, isOpenOrPassable, isBlocked, onPush)
{
  var startNode = new Node(x, y),
      nodes = [];
  this.searchNeighbors(nodes, startNode, 0, min, max, isOpenOrPassable, isBlocked, onPush);
  return nodes;
  
}
RangeSprite.prototype.searchNeighbors = function (nodes, node, r, min, max, isOpenOrPassable, isBlocked, onPush)
{
  count++;
  if (r >= max) return;
  if (r >= min)
  {
    if (! isOpenOrPassable(node.x, node.y)) return;

    node.r = r;
    if (isBlocked(node.x, node.y))
      node.blocked = true;

    nodes.push(node);
    if (onPush)
      onPush(node);  
  }
  
  if (r+1 >= max) return;

  var neighbors = node.getNeighbors(isOpenOrPassable);

  for (var i = 0, l = neighbors.length; i < l; i++) {

    var neighbor = neighbors[i];
        n = nodes.find( function (n) { return n.x == neighbor.x && n.y == neighbor.y })
    if (n && n.r <= r) continue;
    this.searchNeighbors(nodes, neighbor, r+1, min, max, isOpenOrPassable, isBlocked, onPush);
  }
}

// TODO: improve this to support drawing ranges with min and max values
RangeSprite.prototype.drawUnitsRange = function (entity, min, max) {
  var map = this.map;

  this.clearTiles();
  this.clear();

  this.lineStyle(1, this.draw.color, this.draw.alpha);

  count = 0;
  var _this = this;
  this.search(entity.tileX, entity.tileY, min, max, 
    function (x, y) {
      return map.canPassThroughHere(entity, x, y);
    },
    function (x, y) {
      return !map.canMoveHere(entity, x, y);
    },
    function (node) {
      if (_this.tiles.find( function (tile) { return node.x == tile.x && node.y == tile.y; })) return;
      // don't add tiles that already exist
      _this.tiles.push(node);
      if (node.blocked) {
        drawRect(_this, node.x, node.y);
      } else {
        drawFull(_this, node.x, node.y);
      }

    });
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
