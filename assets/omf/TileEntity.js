var Entity       = require(__dirname+'/../game/Entity');

// Extends Entity
var TileEntity = function (entType, sprite) {
  
  this.offset = new PIXI.Point(0,0);
  Entity.call(this, entType, sprite)
  this.initialize();
}

TileEntity.prototype = Object.create(Entity.prototype);
TileEntity.prototype.constructor = TileEntity;

// Properties
// 
// Top Left position
Object.defineProperty(TileEntity.prototype, 'xx', {
  get: function ()    { return this.x - (this.sprite.anchor.x * Game.props.tile_width ) + this.offset.x; },
  set: function (val) { this.x = val +  (this.sprite.anchor.x * Game.props.tile_width ) - this.offset.x; }
});
Object.defineProperty(TileEntity.prototype, 'yy', {
  get: function ()    { return this.y - (this.sprite.anchor.y * Game.props.tile_height ) + this.offset.y; },
  set: function (val) { this.y = val +  (this.sprite.anchor.y * Game.props.tile_height ) - this.offset.y; }
});

// Tile Position
Object.defineProperty(TileEntity.prototype, 'tileX', {
  get: function ()    { return Math.floor(this.xx / Game.props.tile_width); },
  set: function (val) { this.xx = val * Game.props.tile_width; }
})
Object.defineProperty(TileEntity.prototype, 'tileY', {
  get: function ()    { return Math.floor(this.yy / Game.props.tile_height); },
  set: function (val) { this.yy = val * Game.props.tile_height; }
});

// Methods

TileEntity.prototype.initialize = function () {
  // set the sprites anchor & initial position
  this.sprite.anchor.x = 0.5;
  this.sprite.anchor.y = 1;
  this.sprite.x = (Game.props.tile_width  * this.sprite.anchor.x) - this.offset.x;
  this.sprite.y = (Game.props.tile_height * this.sprite.anchor.y) - this.offset.y;
}

module.exports = TileEntity;
