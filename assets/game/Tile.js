var TileData = require(__dirname+'/TileData');

/**
 * A TileSprite
 */
var Tile = function () { 
  this._type = '';
  this._id = 0;
  this._properties = null;
  var texture = getTexture(this.type, this._id);
  PIXI.Sprite.call(this, PIXI.Texture.fromFrame('tile_placeholder'));
}

Tile.prototype = Object.create(PIXI.Sprite.prototype);
Tile.prototype.constructor = Tile;

Object.defineProperty(Tile.prototype, 'type', {
  get: function () { return this._type; },
  set: function (val) {
    this._type = val;
    this.texture = getTexture(this._type, this._id);
    this._properties = getProperties(this._type);
  }
});

Object.defineProperty(Tile.prototype, 'tileId', {
  get: function () { return this._id; },
  set: function (val) {
    this._id = val;
    this.texture = getTexture(this._type, this._id);
  }
});

Object.defineProperty(Tile.prototype, 'hasProperties', {
  get: function () { 
    return (this._properties != null && 
            Object.getOwnPropertyNames(this._properties).length > 0)
  }
});

Tile.prototype.hasProperty = function (prop) {
  if (!this.hasProperties) return false;
  return this._properties.hasOwnProperty(prop);
}

Tile.prototype.adjust = function (type, id) {
  this._type        = type;
  this._id          = id;
  this.texture      = getTexture(this._type, this._id);
  this._properties  = getProperties(this._type);
  return this;
}


Tile.make = function (type, id) {
  var t = new Tile();
  return t.adjust(type, id);
}

// TODO: change it so that the TileData[type].frames[id] is the actual texture...
function getTexture(type, id) {
  var frame = getFrame(type, id);
  return PIXI.Texture.fromFrame(frame);
}

function getFrame(type, id) {
  if (! TileData.hasOwnProperty(type))
    type = 'default';
  return TileData[type].frames.length > id ? TileData[type].frames[id] : TileData[type].frames[0];
}

function getProperties(type) {
  if (! TileData.hasOwnProperty(type))
    type = 'default';
  var props = TileData[type].properties;
  return Object.getOwnPropertyNames(props).length > 0 ? props : null;
}

module.exports = Tile;
