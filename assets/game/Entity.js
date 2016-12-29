var uuid = 0;

function getNextUid () {
  return uuid++;
}

var Entity = function (entType, sprite) {
  this.uid = getNextUid();
  this.entType = entType;
  this.sprite = sprite;
  this.scene = null;
  Game.saveEntity(this);
}

Entity.prototype = {
  
  get anchor ()         { return this.sprite.anchor; },
  get pivot ()          { return this.sprite.pivot; },
  get position ()       { return this.sprite.position; },

  get x ()              { return this.sprite.x; },
  set x (val)           { this.sprite.x = val; positionChanged(this); },

  get y ()              { return this.sprite.y; },
  set y (val)           { this.sprite.y = val; positionChanged(this); },

  update: function () {}
}

Entity.prototype.constructor = Entity;
Entity.prototype._onPositionChanged = null;

function positionChanged(ent)
{
  if (ent._onPositionChanged) ent._onPositionChanged(ent);
}

module.exports = Entity;
