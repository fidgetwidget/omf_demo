var TileData = require(__dirname+'/TileData');

var TileSprite = function (type, id)
{
  var frameId = getFrame(type, id);
  var texture = PIXI.utils.TextureCache[frameId];
  this._type = type;
  this._id = id;
  PIXI.Sprite.call(this, texture);
}

TileSprite.prototype = Object.create(PIXI.Sprite.prototype);
TileSprite.prototype.constructor = TileSprite;

Object.defineProperty(TileSprite.prototype, 'type', {
  get: function () { return this._type; },
  set: function (val) { 
    if (this._type == val) return;
    this._type = val;
    tileChanged(this);
  }
});

Object.defineProperty(TileSprite.prototype, 'id', {
  get: function () { return this._id; },
  set: function (val) { 
    if (this._id == val) return;
    this._id = val;
    tileChanged(this);
  }
});

TileSprite.prototype.set = function (args) {
  if (args.hasOwnProperty('id'))
    this._id = args.id;
  if (args.hasOwnProperty('type'))
    this._type = args.type;

  if (args.hasOwnProperty('id') || agrs.hasOwnProperty('type'))
    tileChanged(this);
}

function getFrame(type, id)
{
  if (! TileData.hasOwnProperty(type)) {
    type = 'default';
  }
  if (TileData[type].frames.length <= id)
    id = 0;
  return TileData[type].frames[id];
}

function tileChanged(tile)
{
  var frameId, texture;
  frameId = getFrame(tile.type, tile.id);
  texture = PIXI.utils.TextureCache[frameId];
  if (texture)
  {
    tile.visible = true;
    tile.texture = texture;
  }
  else
    tile.visible = false;
}

module.exports = TileSprite;
