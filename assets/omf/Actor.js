var HealthSprite = require(__dirname+'/HealthSprite');
var Entity       = require(__dirname+'/../game/Entity');
var ACTOR_STATES = require(__dirname+'/ActorStates');

// Extends Entity
var Actor = function (entType, sprite) {
  
  this._state = ACTOR_STATES.IDLE;
  this._destination = new PIXI.Point(0,0);
  this.offset = new PIXI.Point(0,0);

  Entity.call(this, entType, sprite)

  this.initSprites();
}

Actor.prototype = Object.create(Entity.prototype);
Actor.prototype.constructor = Actor;

Object.defineProperty(Actor.prototype, 'state', {
  get: function ()    { return this._state; },
  set: function (val) {
    this._state = val;
    this.setAnimation();
  }
});

// Top Left position
Object.defineProperty(Actor.prototype, 'xx', {
  get: function ()    { return this.x - (this.sprite.anchor.x * Game.properties.tile_width ) + this.offset.x; },
  set: function (val) { this.x = val +  (this.sprite.anchor.x * Game.properties.tile_width ) - this.offset.x; }
});
Object.defineProperty(Actor.prototype, 'yy', {
  get: function ()    { return this.y - (this.sprite.anchor.y * Game.properties.tile_height ) + this.offset.y; },
  set: function (val) { this.y = val +  (this.sprite.anchor.y * Game.properties.tile_height ) - this.offset.y; }
});

// Tile Position
Object.defineProperty(Actor.prototype, 'tileX', {
  get: function ()    { return Math.floor(this.xx / Game.properties.tile_width); }
})
Object.defineProperty(Actor.prototype, 'tileY', {
  get: function ()    { return Math.floor(this.yy / Game.properties.tile_height); }
});

Object.defineProperty(Actor.prototype, 'hasDestination', {
  get: function ()    { return this.xx != this._destination.x || this.yy != this._destination.y; }
})

Actor.prototype.initSprites = function () {
  // set the sprites anchor & initial position
  this.sprite.anchor.x = 0.5;
  this.sprite.anchor.y = 1;
  this.sprite.x = (Game.properties.tile_width  * this.sprite.anchor.x) - this.offset.x;
  this.sprite.y = (Game.properties.tile_height * this.sprite.anchor.y) - this.offset.y;

  // create and show the health
  this.healthSprite = makeHealthSprite(this);
  this.sprite.addChild(this.healthSprite);
}

// Move to Tile Position
Actor.prototype.moveTo = function (x, y, immediate) { 
  if (immediate === undefined) immediate = false;
  
  if (immediate)
    setPosition(this, x, y);
  else
    setDestination(this, x, y);
}

Actor.prototype.update = function () { 
  if (! this.hasDestination) return;
  
  this.xx = lerpMovement(this.xx, this._destination.x, Game.properties.tile_width);
  this.yy = lerpMovement(this.yy, this._destination.y, Game.properties.tile_height);
}



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
  var hearts = unit.max_health ? unit.max_health : 2;
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
