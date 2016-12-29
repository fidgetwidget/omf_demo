var UnitData     = require(__dirname+'/UnitData');
var Actor        = require(__dirname+'/Actor');

var UNIT_OFFSET = {x: 0, y: 8};

// Extends Entity
var Unit = function (type) {

  this.type  = type;
  
  var sprite = makeSprite(this);
  Actor.call(this, 'Unit', sprite);
}

Unit.prototype = Object.create(Actor.prototype);
Unit.prototype.constructor = Unit;

// Properties


// Methods

Unit.prototype.loadData = function () {
  loadStats(this);
  this.offset.x = UNIT_OFFSET.x;
  this.offset.y = UNIT_OFFSET.y;
}

Unit.prototype.bindBehaviour = function () {
  this.sprite.interactive = true;
  this.sprite.on('click', onClick, this);
  this.sprite.on('touchstart', onClick, this);
}

// Private Methods

function loadStats(unit) 
{
  var type = unit.type, stats;
  if (! UnitData.hasOwnProperty(type))
    type = 'default';
  var stats = UnitData[type].stats;
  unit.stats = {};
  for (var k in stats)
    unit.stats[k] = stats[k];

  if (unit.stats.speed)
    unit.speed = unit.stats.speed;
}

function makeSprite(unit)
{
  var type = unit.type, frame;
  if (! UnitData.hasOwnProperty(type))
    type = 'default';
  frame = getFrame(type, 'idle', 0);
  return PIXI.Sprite.fromFrame(frame);
}

// TODO: do some error handling maybe??
function getFrame(type, state, index) 
{
  return UnitData[type].frames[state][index];
}

function onClick(e)
{
  e.stopPropagation();
  if (this.scene && typeof this.scene.unitClicked == 'function')
    this.scene.unitClicked(this);
}


module.exports = Unit;
