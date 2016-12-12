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
  set x (val)           { this.sprite.x = val; },

  get y ()              { return this.sprite.y; },
  set y (val)           { this.sprite.y = val; },

  get interactive ()    { return this.sprite.interactive; },
  set interactive (val) { this.sprite.interactive = val; },

  update: function () {}
}

Entity.prototype.constructor = Entity;

module.exports = Entity;
