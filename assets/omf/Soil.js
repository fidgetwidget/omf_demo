var SoilData     = require(__dirname+'/SoilData');
var Entity       = require(__dirname+'/TileEntity');

// Extends Entity
var Soil = function (type) {

  this.type = type;
  this._state = 'none';
  this.water = 0;
  this.plant = null;

  var sprite = makeSprite(this);
  Entity.call(this, 'Soil', sprite)
}

Soil.prototype = Object.create(Entity.prototype);
Soil.prototype.constructor = Soil;

// Properties

Object.defineProperty(Soil.prototype, 'state', {
  get: function ()    { return this._state; },
  set: function (val) { 
    if (this._state == val) return;
    if (SoilData.states.indexOf(val) < 0) return;
    this._state = val; 
    stateChanged(this); 
  }
});

Object.defineProperty(Soil.prototype, 'hasPlant', {
  get: function () { return this.plant != null; }
}) 

// Methods

Soil.prototype.update = function ()
{
  if (this.hasPlant)
  {
    if (this.plant.needsWater)
    {
      this.water--;
      this.plant.water();
    }
  }
  checkState(this);
}


// Private methods

function checkState(soil)
{
  soil.state = SoilData.getState(soil);
}

function stateChanged(soil)
{
  var frame = SoilData.getFrame(soil),
      texture = utils.TextureCache[frame];

  if (! texture) return;

  soil.sprite.texture = texture;
}

function makeSprite(soil)
{
  var frame = SoilData.getFrame(soil);
  return PIXI.Sprite.fromFrame(frame);
}



module.exports = Soil;
