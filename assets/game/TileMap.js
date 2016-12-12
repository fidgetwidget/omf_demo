var Entity  = require(__dirname+'/Entity');
var Tile    = require(__dirname+'/Tile');

/**
 * A collection of tiles of fixed width/height
 * @param {int} w       The number of tiles wide the map is
 * @param {int} h       The number of tiles high the map is
 */
var TileMap = function (w, h) {
  this.tiles_wide   = w;
  this.tiles_high   = h;
  this.width        = w * Game.properties.tile_width;
  this.height       = w * Game.properties.tile_height;
  this.tiles        = [];
  this.tileIds      = [];
  this._tileValuesChanged = false;
  this._changedTiles = [];
  this._type = 'default';
  initTileArrays(this);

  this.container    = new PIXI.Container();
  this.buffer = PIXI.RenderTexture.create(this.width, this.height);
  var sprite = new PIXI.Sprite(this.buffer);
  Entity.call(this, 'TileMap', sprite);
}

TileMap.prototype = Object.create(Entity.prototype);
TileMap.prototype.constuctor = TileMap;

// Change which TileFrame set to use for future tiles 
Object.defineProperty(TileMap.prototype, 'tileType', {
  get: function () { return this._type; },
  set: function (val) { this._type = val; }
});

/**
 * Get the Tile or TileId from local coordinates
 * @param  {int}          x  local x coord (not position)
 * @param  {int}          y  local y coord
 * @param  {bool}         id (optional, return the id instead of the Tile)
 * @return {Tile or int}  the Tile or id
 */
TileMap.prototype.getTile = function (x, y, id) { 
  if (typeof id === undefined) id = false;
  if (outOfRange(x, y, this))
  {
    console.log('TileMap.getTile: OUT OF RANGE ['+x+','+y+']'); 
    return null;
  }
  var index = getIndex(x, y, this);
  return id ? this.tileIds[index] : this.tiles[index];
}

/**
 * Set the TileId of the Tile at the local coordinates
 * @param {[type]} x  local x coord (not position)
 * @param {[type]} y  local y coord
 * @param {[type]} id the TileId to use
 */
TileMap.prototype.setTile = function (x, y, id) { 
  if (outOfRange(x, y, this)) {
    console.log('TileMap.setTile: OUT OF RANGE ['+x+','+y+']'); 
    return;
  }

  var index = getIndex(x, y, this);
  this.tileIds[index] = id;
  this._changedTiles.push({i: index, x: x, y: y, t: this._type});
  this._tileValuesChanged = true;
  return this;
}

// Tilemap.apply
// set the tilemaps tile values with a json object or array
TileMap.prototype.apply   = function (tileData) { 
  if (typeof tileData === "Array")
  {
    for (var k = 0; k < tileData.length; k++) {
      var v = tileData[k];
      setTileByData(v, this);
    }
  }
  else
  {
    for (var k in tileData) {
      if (! tileData.hasOwnProperty(k)) contnue;
      var v = tileData[k];
      setTileByData(v, this); 
    }
  }
  this._tileValuesChanged = true;
}

// Tilemap.remove
// remove the tile at the chosen local coordinate location
TileMap.prototype.remove  = function (x, y) { 
  if (outOfRange(x, y, this)) { 
    console.log('TileMap.removeTile: OUT OF RANGE ['+x+','+y+']'); 
    return;
  }

  var index = getIndex(x, y, this);
  this.tileIds[index] = -1;
  this._changedTiles.push({ i: index, x: x, y: y });
  this._tileValuesChanged = true;
}

// Tilemap.update
// if any tiles have changed, update the rendering of them
TileMap.prototype.update  = function () {
  if (! this._tileValuesChanged) return;

  while (this._changedTiles.length > 0)
  {
    var ct = this._changedTiles.pop();
    var id = this.tileIds[ct.i];
    var tile = this.tiles[ct.i];
    if (id < 0)
    {
      this.container.removeChild(tile);
      destroyTile(tile);
      this.tiles[ct.i] = null;
    }
    else
    {
      if (this.tiles[ct.i] == null)
      {
        tile = makeTile(ct.t, id);
        tile.x = ct.x * Game.properties.tile_width;
        tile.y = ct.y * Game.properties.tile_height;
        this.container.addChild(tile);
        this.tiles[ct.i] = tile;
      }
      else
      {
        tile = adjustTile(tile, ct.t, id);
      }
    }
  }

  Game.renderer.render(this.container, this.buffer);
}



function initTileArrays(map) 
{
  for (var x = 0; x < map.tiles_wide; x++) 
  {
    for (var y = 0; y < map.tiles_high; y++)
    {
      var i = getIndex(x, y, map);
      map.tiles[i] = null;
      map.tileIds[i] = -1;
    }
  }
}


function setTileByData(v, tilemap)
{
  if (v.hasOwnProperty('x') && 
      v.hasOwnProperty('y') && 
      v.hasOwnProperty('id'))
  {
    var i = getIndex(v.x, v.y, tilemap);
    tilemap.tileIds[i] = v.id;
    tilemap._changedTiles.push({i: i, x: v.x, y: v.y});
  }
  else
  {
    console.log('setTiles tileData value unrecovnized');
    console.log(v);
  }
}


function destroyTile(tile)
{
  tile.destroy({ children: true });
}


function getIndex(x, y, map)
{
  return x + (y * map.tiles_wide);
}


function outOfRange(x, y, map) {
  return (x < 0 || 
          x > map.tiles_wide || 
          y < 0 || 
          y > map.tiles_high); 
}


function makeTile(type, id) {
  return Tile.make(type, id);
}


function adjustTile(tile, type, id)
{
  tile.adjust(type, id);
  return tile;
}

module.exports = TileMap;
