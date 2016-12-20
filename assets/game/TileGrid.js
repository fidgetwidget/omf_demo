var Grid  = require(__dirname+'/Grid');
var Tile  = require(__dirname+'/TileSprite');
var TileData = require(__dirname+'/TileData');


var TileGrid = function (w, h, type) {
  var tw = Game.props.tile_width,
      th = Game.props.tile_height;
  if (type === undefined)
    type = 'default';
  this.type = type;
  this.container = new PIXI.Container();
  this.buffer = PIXI.RenderTexture.create(w * tw, h * th);
  this.sprite = new PIXI.Sprite(this.buffer);
  this._tilesChanged = [];

  Grid.call(this, w, h);
}

TileGrid.prototype = Object.create(Grid.prototype);
TileGrid.prototype.constuctor = TileGrid;

Object.defineProperty(TileGrid.prototype, 'x', {
  get: function () { return this.sprite.x; },
  set: function (val) { this.sprite.x = val; }
});

Object.defineProperty(TileGrid.prototype, 'y', {
  get: function () { return this.sprite.y; },
  set: function (val) { this.sprite.y = val; }
});


TileGrid.prototype.getAt = function (x, y, key) { 
  if (key !== undefined)
  {
    return Grid.prototype.getAt.call(this, x, y, key)
  }
  else
  {
    return Grid.prototype.getAt.call(this, x, y, 'tile');
  }
}

TileGrid.prototype.setAt = function (x, y, val) {
  if (val instanceof Tile)
  {
    Grid.prototype.setAt.call(this, x, y, { tile: val, "tile.id": val.id, "tile.type": val.type });
  }
  else if (typeof val == 'object')
  {
    Grid.prototype.setAt.call(this, x, y, val);
  }
  else if (Number.isInteger(val))
  {
    Grid.prototype.setAt.call(this, x, y, { "tile.id": val });
  }
  else if (typeof val == 'string')
  {
    Grid.prototype.setAt.call(this, x, y, { "tile.type": val });
  }
  else
  {
    throw new Error('Unsupported value')
  }
}

TileGrid.prototype.removeAt  = function (x, y) { 
  this.nodes[y][x].id = -1;
  this._tilesChanged.push({x: x, y: y});
}

// Tilemap.update
// if any tiles have changed, update the rendering of them
TileGrid.prototype.update  = function () {
  if (this._tilesChanged.length == 0) return;

  while (this._tilesChanged.length > 0)
  {
    var c = this._tilesChanged.pop(),
        tile = this.nodes[c.y][c.x],
        id = tile.id,
        type = tile.type;        
  }

  Game.renderer.render(this.container, this.buffer);
}


TileGrid.prototype._onNodeCreated = function (x, y, node)
{
  var tile = new Tile(this.type, -1);
  tile.x = x * Game.props.tile_width;
  tile.y = y * Game.props.tile_height;
  node.set({tile: tile});
  this.container.addChild(tile);
}

TileGrid.prototype._onNodeSet = function (x, y, node, val)
{
  this._tilesChanged.push({x: x, y: y});
}

module.exports = TileGrid;
