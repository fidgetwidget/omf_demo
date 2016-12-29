var Scene = require(__dirname+'/../game/Scene');
var TargetUI = require(__dirname+'/TargetUI');

var TURN_ORDER_UI = {
  HEIGHT: 48,
  BG_COLOR: 0xffffff,
  BORDER_COLOR: 0xaaaaaa,
}

var TurnOrderUI = function (parent)
{
  this.actorsInOrder = [];
  Scene.call(this, 'TurnOrderUI', parent);

  initBackground(this);
  initDisplay(this); 
}

TurnOrderUI.props = TURN_ORDER_UI;
TurnOrderUI.prototype = Object.create(Scene.prototype);
TurnOrderUI.prototype.constructor = TurnOrderUI;


Object.defineProperty(TurnOrderUI.prototype, 'current', {
  get: function () { return this.actorsInOrder[0]; },
});

TurnOrderUI.prototype.start = function () {
  var actors = this.parentScene.actors;
  for (var i = 0, l = actors.length; i < l; i++) {
    this.actorsInOrder.push(actors[i]);
  }
  sort(this);
}

TurnOrderUI.prototype.next = function ()
{
  if (this.actorsInOrder.length < 2) return;

  var next = this.actorsInOrder[1];
  var delta = next.wait;
  if (delta > 0)
    this.parentScene.tick(delta);

  sort(this);
  this.redraw();

  this.parentScene.actorsTurn(this.current);
}

TurnOrderUI.prototype.redraw = function () 
{
  this._unitsContainer.removeChildren();

  for (var i = 0, l = this.actorsInOrder.length; i < l && i < 5; i++)
  {
    var actor = this.actorsInOrder[i],
        texture = actor.sprite.texture,
        sprite = new PIXI.Sprite(texture);

    sprite.x = 18 + (i * 18) + (i * Game.props.tile_width);
    sprite.y = 9;

    this._unitsContainer.addChild(sprite);
  }
  // TODO: re order the _unitsContainer sprites
  Game.renderer.render(this._unitsContainer, this._buffer);
}

module.exports = TurnOrderUI;


function initBackground(scene) 
{
  // create the background
  var g = scene._background = new PIXI.Graphics();
  g.beginFill(TURN_ORDER_UI.BG_COLOR, 1);
  g.lineStyle(1, TURN_ORDER_UI.BORDER_COLOR);
  g.drawRect(1, 1, Game.props.stage_width - TargetUI.props.WIDTH - 1, TURN_ORDER_UI.HEIGHT - 2);
  g.endFill();
  // g.moveTo(0, TURN_ORDER_UI.HEIGHT);
  // g.lineTo(Game.props.stage_width, TURN_ORDER_UI.HEIGHT);
  scene.addChild(scene._background);
}

function initDisplay(scene)
{
  scene._unitsContainer = new PIXI.Container();
  scene._buffer = PIXI.RenderTexture.create(Game.props.stage_width, 128);
  scene._unitsSprite = new PIXI.Sprite(scene._buffer);
  scene.addChild(scene._unitsSprite);
}

function sort(self) {
  self.actorsInOrder.sort( function (a, b) {
    return a.wait - b.wait;
  });
}
