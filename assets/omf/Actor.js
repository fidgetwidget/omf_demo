var HealthSprite = require(__dirname+'/HealthSprite');
var Entity       = require(__dirname+'/TileEntity');
var ACTOR_STATES = require(__dirname+'/ActorStates');

// Extends Entity
var Actor = function (entType, sprite) {
  
  this._state = ACTOR_STATES.IDLE;
  this._behaviour = 'wait';
  this._destination = new PIXI.Point(0,0);
  this.animation = null;
  Entity.call(this, entType, sprite)

  this.initialize();
}

Actor.prototype = Object.create(Entity.prototype);
Actor.prototype.constructor = Actor;

// Properties

Object.defineProperty(Actor.prototype, 'state', {
  get: function ()    { return this._state; },
  set: function (val) { this._state = val; this.setAnimation(); }
});

Object.defineProperty(Actor.prototype, 'hasDestination', {
  get: function ()    { return this.xx != this._destination.x || this.yy != this._destination.y; }
})

// Methods

Actor.prototype.initialize = function () {

  Entity.prototype.initialize.call(this);

  // create and show the health
  this.healthSprite = makeHealthSprite(this);
  this.sprite.addChild(this.healthSprite);
}

Actor.prototype.update = function () { 
  if (! this.hasDestination) return;
  
  this.xx = lerpMovement(this.xx, this._destination.x, Game.properties.tile_width);
  this.yy = lerpMovement(this.yy, this._destination.y, Game.properties.tile_height);
}

Actor.prototype.setAnimation = function () {
  this.animation = null;
}

// Move to Tile Position
Actor.prototype.moveTo = function (x, y, immediate) { 
  if (immediate === undefined) immediate = false;
  
  if (immediate)
  {
    setPosition(this, x, y);
  }
  else
  {
    setDestination(this, x, y);
  }
}

// Private Methods

function lerpMovement(cur, dest, size)
{
  var dif, t;
  dif = dest - cur;
  if (dif == 0) return cur;
  t = Math.abs(1 / (dif / size)) * 0.25;
  return Math.floor(cur + t * dif);
}


function makeHealthSprite(unit)
{
  var hearts = unit.stats && unit.stats.max_health ? unit.stats.max_health : 2;
  var s = new HealthSprite(hearts);
  s.y = unit.y - unit.sprite.height - 32;
  return s;
}


function setPosition(unit, tileX, tileY)
{
  unit.xx = unit._destination.x = tileX * Game.properties.tile_width;
  unit.yy = unit._destination.y = tileY * Game.properties.tile_height;
}


function setDestination(unit, tileX, tileY)
{
  unit._destination.x = tileX * Game.properties.tile_width;
  unit._destination.y = tileY * Game.properties.tile_height;
}

module.exports = Actor;
