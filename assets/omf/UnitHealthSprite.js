
var UnitHealthSprite = function (hearts)
{
  this.max_health = hearts;
  this.cur_health = hearts * 2; // half values
  this.sprites = [];
  PIXI.Container.call(this);
  createSprites(this);
  // this.x = -(this.width * 0.5);
}

UnitHealthSprite.prototype = Object.create(PIXI.Container.prototype);
UnitHealthSprite.prototype.constructor = UnitHealthSprite;

UnitHealthSprite.prototype.changeValue = function (count) {



}

function createSprites(s) {

  var count = s.max_health;

  for (var i = 0, l = count; i < l; i++)
  {
    var sprite = PIXI.Sprite.fromFrame('heart');
    sprite.anchor.x = 0.5;
    sprite.anchor.y = 0.5;
    var offset = (i - ((l - 1) * 0.5));
    sprite.x = (offset * sprite.width);
    s.sprites.push(sprite);
    s.addChild(sprite);
  }
}

module.exports = UnitHealthSprite;
