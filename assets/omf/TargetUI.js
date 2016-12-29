var Scene = require(__dirname+'/../game/Scene');

var TARGET_UI = {
  WIDTH: 128,
  BG_COLOR: 0xffffff,
  BORDER_COLOR: 0xaaaaaa
}

var TargetUI = function (parent)
{
  this._selectedEntity = null;
  Scene.call(this, 'TargetUI', parent);
  initBackground(this);
  initImageContainer(this);
  initLabels(this);
}

TargetUI.props = TARGET_UI;
TargetUI.prototype = Object.create(Scene.prototype);
TargetUI.prototype.constructor = TargetUI;


Object.defineProperty(TargetUI.prototype, 'selectedEntity', {
  get: function () { return this._selectedEntity; },
  set: function (val) {
    if (this._selectedEntity == val) return;
    
    this._selectedEntity = val;
    selectedEntityChanged(this, val);
  }
});

module.exports = TargetUI;


function initBackground(scene) 
{
  // create the background
  var g = scene._background = new PIXI.Graphics();
  g.beginFill(TARGET_UI.BG_COLOR, 1);
  g.lineStyle(1, TARGET_UI.BORDER_COLOR);
  g.drawRect(1, 1, TARGET_UI.WIDTH - 2, Game.props.stage_height - 2);
  g.endFill();
  // g.moveTo(0, 0);
  // g.lineTo(0, Game.props.stage_height);
  scene.addChild(scene._background);
}

function initImageContainer(scene)
{
  var g = new PIXI.Graphics(), o = 18, s = TARGET_UI.WIDTH - 36;
  g.lineStyle(1, 0xaaaaaa);
  g.drawRect(o, o, s, s);

  scene.addChild(g);
}

function initLabels(scene)
{
  var titleFormat = {fontFamily : "Lucida Console", fontSize: 14, color : 0x555555, align : 'center'};
  var title = new PIXI.Text('<Title>', titleFormat);
  // title.width = TARGET_UI.WIDTH - 60;
  title.x = 18;
  title.y = TARGET_UI.WIDTH;

  var labels = new PIXI.Container();
  scene.addChild(labels);

  scene.title = title;
  labels.addChild(title);
}

function selectedEntityChanged(scene, entity) 
{
  if (entity == null) return entityDeselected(scene);
  var type = entity.entType;
  var name = type;
  switch (type)
  {
    case 'Unit':
      name = entity.type;
  }
  

  scene.title.text = name;
}

function entityDeselected(scene)
{
  scene.title.text = '<Title>';
}

