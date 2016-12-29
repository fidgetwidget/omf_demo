var EnemyData    = require(__dirname+'/EnemyData');
var Actor        = require(__dirname+'/Actor');

var ENEMY_OFFSET = {x: 0, y: 8};

// Extends Entity
var Enemy = function (type) {

  this.type  = type;
  
  var sprite = makeSprite(this);
  Actor.call(this, 'Enemy', sprite);
}

Enemy.prototype = Object.create(Actor.prototype);
Enemy.prototype.constructor = Enemy;

// Properties
// None

// Methods

Enemy.prototype.loadData = function () 
{
  loadStats(this);
}

Enemy.prototype.bindBehaviour = function () 
{
  this.sprite.interactive = true;
  this.sprite.on('click', onClick, this);
  this.sprite.on('touchstart', onClick, this);
}

// Private Methods

function loadStats(unit) 
{
  var type = unit.type, stats;
  if (! EnemyData.hasOwnProperty(type))
    type = 'default';
  var stats = EnemyData[type].stats;
  unit.stats = {};
  for (var k in stats)
    unit.stats[k] = stats[k];
}

function makeSprite(unit)
{
  var type = unit.type, frame;
  if (! EnemyData.hasOwnProperty(type))
    type = 'default';
  frame = getFrame(type, 'idle', 0);
  return PIXI.Sprite.fromFrame(frame);
}

// TODO: do some error handling maybe??
function getFrame(type, state, index) 
{
  return EnemyData[type].frames[state][index];
}

function onClick(e)
{
  e.stopPropagation();
  if (this.scene && typeof this.scene.entityClicked == 'function')
    this.scene.entityClicked(this);
}


module.exports = Enemy;
