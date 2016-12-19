var PlantData     = require(__dirname+'/PlantData');
var Entity        = require(__dirname+'/TileEntity');

// Extends Entity
var Plant = function (type) {

  this.type = type;
  this._state = 'none';
  this._stateIndex = 0;
  this.water = 0;
  this.growth = 0;
  this.plantedIn = null; // Soil

  var sprite = makeSprite(this);
  Entity.call(this, 'Plant', sprite)
}

Plant.prototype = Object.create(Entity.prototype);
Plant.prototype.constructor = Plant;

// Properites

Object.defineProperty(Plant.prototype, 'state', {
  get: function () { return this._state; },
  set: function (val) {
    if (this._state == val) return;
    if (PlantData[this.type].states.indexOf(val) < 0) return;
    this._state = val;
    stateChanged(this);
  }
})

Object.defineProperty(Plant.prototype, 'stateIndex', {
  get: function () { return this._stateIndex; }
})

Object.defineProperty(Plant.prototype, 'needsWater', {
  get: function () { return this.water < this.props.getsThirstyAt[this.stateIndex]; }
}) 

Object.defineProperty(Plant.prototype, 'hasWater', {
  get: function () { return this.water > 0; }
}) 

// Methods

Plant.prototype.update = function ()
{
  if (this.plantedIn == null)
    return;


  if (this.hasWater)
  {
    this.water -= this.props.waterUsedPerTick[this.stateIndex];
    drink(this);
  }
}

Plant.prototype.plant = function (soil)
{
  soil.plant = this;
  this.plantedIn = soil;
  this.state = 'seed';
  this.tileX = soil.tileX;
  this.tileY = soil.tileY;
}

Plant.prototype.initialize = function ()
{
  initProps(this);
}

Plant.prototype.water = function ()
{
  this.water = 100;
}

// Private methods

function drink(plant)
{
  plant.growth += plant.props.growthPerDrink[plant.stateIndex];
  growthChanged(plant);
}

function growthChanged(plant)
{
  var curState = plant.state,
      state = PlantData[plant.type].getStateFromGrowth(plant.growth);

  if (curState != state) {
    plant.state = state;
  }
}

function stateChanged(plant)
{
  var type = plant.type,
      state = plant._state,
      data = PlantData[type];
  // update the stateIndex
  plant._stateIndex = data.states.indexOf(state);
  // update the texture
  var frame = data.frames[plant.stateIndex];
  plant.sprite.texture = PIXI.utils.TextureCache[frame];
}

function initProps(plant)
{
  var type, props;
  type = plant.type;
  if (! PlantData.hasOwnProperty(type))
    type = 'default';
  plant.props = {};
  props = PlantData[type].props;
  for (var k in props)
    plant.props[k] = props[k];
}

function makeSprite(plant)
{
  var type, frame;
  type = plant.type;
  if (! PlantData.hasOwnProperty(type))
    type = 'default';
  frame = PlantData[type].frames[0];
  return PIXI.Sprite.fromFrame(frame);
}

module.exports = Plant;
