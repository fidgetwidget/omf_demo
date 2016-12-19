var Scene = require(__dirname+'/../game/Scene');

var TARGET_UI = {
  WIDTH: 128,
  BG_COLOR: 0xeeeeee,
}

var TargetInfoScene = function ()
{
  this._selectedEntity = null;
  Scene.call(this, 'TargetUI');
  initUI(this);
}

TargetInfoScene.prototype = Object.create(Scene.prototype);
TargetInfoScene.prototype.constructor = TargetInfoScene;

Object.defineProperty(TargetInfoScene.prototype, 'selectedEntity', {
  get: function () { return this._selectedEntity; },
  set: function (val) {
    this._selectedEntity = val;
    selectedEntityChanged(this, val);
  }
});


function initUI(scene) 
{
  // create the background
  var g = scene._background = new PIXI.Graphics();
  g.beginFill(TARGET_UI.BG_COLOR, 1);
  g.drawRect(0, 0, TARGET_UI.WIDTH, Game.props.stage_height);
  g.endFill();
  scene.addChild(scene._background);
}

function selectedEntityChanged(scene, entity) 
{
  if (entity == null)
  {
    return;
  }
  var type = entity.entType;
}

module.exports = TargetInfoScene;
