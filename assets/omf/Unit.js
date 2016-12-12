var UnitFrames   = require(__dirname+'/UnitFrames');
var UnitStates   = require(__dirname+'/UnitStates');
var UnitStats    = require(__dirname+'/UnitStats');
var UnitHealthSprite = require(__dirname+'/UnitHealthSprite');
var Entity       = require(__dirname+'/../game/Entity');

var default_offset = { x: 0, y: 8 }; // gives the unit a position more In the tile space

// Extends Entity
var Unit = function (type) {

  this.type         = type;
  this._state       = UnitStates.getState('idle');
  this._textures    = getUnitTypeTextures(this.type);
  this._destination = new PIXI.Point(0, 0);
  this.offset       = new PIXI.Point(default_offset.x, default_offset.y);
  setStats(this.type, this);
  
  var sprite = makeUnitSprite(this);
  Entity.call(this, 'Unit', sprite);

  this.healthSprite = makeHealthSprite(this);
  this.sprite.addChild(this.healthSprite);

  this.interactive = true;
  this.sprite.on('click', onClick, this);
  this.sprite.on('touchstart', onClick, this);

}

Unit.prototype = Object.create(Entity.prototype);
Unit.prototype.constructor = Unit;

Object.defineProperty(Unit.prototype, 'state', {
  get: function ()    { return this._state; },
  set: function (val) {
    this._state = val;
    // TODO: if the state calls for an animation, 
    //        set the sprite up to be animated
    //        otherwise, just assign the correct texture
  }
});

Object.defineProperty(Unit.prototype, 'tileX', {
  get: function ()    { return Math.floor(this.xx / Game.properties.tile_width); }
})

Object.defineProperty(Unit.prototype, 'tileY', {
  get: function ()    { return Math.floor(this.yy / Game.properties.tile_height); }
});

Object.defineProperty(Unit.prototype, 'xx', {
  get: function ()    { return this.x - (this.sprite.anchor.x * Game.properties.tile_width ) + this.offset.x; },
  set: function (val) { this.x = val +  (this.sprite.anchor.x * Game.properties.tile_width ) - this.offset.x; }
});

Object.defineProperty(Unit.prototype, 'yy', {
  get: function ()    { return this.y - (this.sprite.anchor.y * Game.properties.tile_height ) + this.offset.y; },
  set: function (val) { this.y = val +  (this.sprite.anchor.y * Game.properties.tile_height ) - this.offset.y; }
});

Object.defineProperty(Unit.prototype, 'hasDestination', {
  get: function ()    { return this.xx != this._destination.x || this.yy != this._destination.y; }
})

Unit.prototype.moveTo = function (x, y, immediate) { 
  if (immediate === undefined) immediate = false;
  
  if (immediate)
  {
    this.xx = this._destination.x = x * Game.properties.tile_width;
    this.yy = this._destination.y = y * Game.properties.tile_height; 
  }
  else
    setDestination(this, x, y);
}

Unit.prototype.update = function () { 
  move(this); 
}



function lerpMovement(cur, dest, size)
{
  var dif, t;
  dif = dest - cur;
  if (dif == 0) return cur;
  t = Math.abs(1 / (dif / size)) * 0.25;
  return Math.floor(cur + t * dif);
}

function getUnitTypeTextures(type)
{
  if (! UnitFrames.hasOwnProperty(type))
    type = 'default';

  return UnitFrames[type];
}

function setStats(type, unit)
{
  var stats = UnitStats[type];
  for (var k in stats)
    unit[k] = stats[k];
}

// TODO: support animations
function makeUnitSprite(unit)
{
  var sprite = PIXI.Sprite.fromFrame(unit._textures['idle']);
  sprite.anchor.x = 0.5;
  sprite.anchor.y = 1;
  sprite.x = (Game.properties.tile_width  * sprite.anchor.x) - unit.offset.x;
  sprite.y = (Game.properties.tile_height * sprite.anchor.y) - unit.offset.y;
  return sprite;
}

function makeHealthSprite(unit)
{
  var hearts = unit.max_health ? unit.max_health : 2;
  var s = new UnitHealthSprite(hearts);
  s.y = unit.y - unit.sprite.height - 32;
  return s;
}

function move(unit)
{
  if (! unit.hasDestination) return;
  
  unit.xx = lerpMovement(unit.xx, unit._destination.x, Game.properties.tile_width);
  unit.yy = lerpMovement(unit.yy, unit._destination.y, Game.properties.tile_height);
}

function setDestination(unit, tileX, tileY)
{
  unit._destination.x = tileX * Game.properties.tile_width;
  unit._destination.y = tileY * Game.properties.tile_height;
}

function onClick(e)
{
  if (this.scene && typeof this.scene.unitClicked == 'function')
    this.scene.unitClicked(this);
}


module.exports = Unit;
