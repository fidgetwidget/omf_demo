var UnitFrames   = require(__dirname+'/UnitFrames');
var UnitStats    = require(__dirname+'/UnitStats');
var Actor        = require(__dirname+'/Actor');

// Extends Entity
var Unit = function (type) {

  this.type         = type;
  this._textures    = getUnitTypeTextures(this.type);
  var sprite = makeUnitSprite(this);
  this.initStats();
  Actor.call(this, 'Unit', sprite);
}

Unit.prototype = Object.create(Actor.prototype);
Unit.prototype.constructor = Unit;

Unit.prototype.initStats = function ()
{
  var stats = UnitStats[this.type];
  for (var k in stats)
    this[k] = stats[k];
}

Unit.prototype.initSprites = function () 
{
  this.offset.y = 8;
  
  this.sprite.interactive = true;
  this.sprite.on('click', onClick, this);
  this.sprite.on('touchstart', onClick, this);

  Actor.prototype.initSprites.call(this);
}


function getUnitTypeTextures(type)
{
  if (! UnitFrames.hasOwnProperty(type))
    type = 'default';

  return UnitFrames[type];
}

// TODO: support animations
function makeUnitSprite(unit)
{
  return PIXI.Sprite.fromFrame(unit._textures['idle']);
}


function onClick(e)
{
  if (this.scene && typeof this.scene.unitClicked == 'function')
    this.scene.unitClicked(this);
}


module.exports = Unit;
