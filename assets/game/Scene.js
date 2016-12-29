var Entity = require(__dirname+'/Entity');

// A Container for stuff
var Scene = function (name, parent) {
  if (parent === undefined) parent = null;
  this.name = name;
  this.allEntities = [];
  this.entities = {};
  this.scenes  = {};
  this.showing = [];
  this.updateables = [];
  this._parentScene = parent;

  PIXI.Container.call(this);  
  this.containers = {
    Screen: new PIXI.Container(),
    UI: new PIXI.Container()
  };

  this.addChild(this.containers.Screen);
  this.addChild(this.containers.UI);
}

Scene.prototype = Object.create(PIXI.Container.prototype);
Scene.prototype.constructor = Scene;

Object.defineProperty(Scene.prototype, 'parentScene', {
  get: function ()    { return this._parentScene; }
});

Scene.prototype.update = function () {
  if (this.showing.length > 0)
  {
    for (var i = 0, l = this.showing.length; i < l; i++) {
      var scene = this.getScene(this.showing[i]);
      if (scene)
        scene.update();
    }
  }

  for (var i = 0, l = this.updateables.length; i < l; i++) {
    this.updateables[i].update();
  }
  
}

// Add an entity to the scene, 
// and add it's sprite to the container
// - supports uid or Entity
Scene.prototype.addEntity = function (ent, layer) {
  if (Number.isInteger(ent)) ent = Game.getEntity(ent);
  if (! ent instanceof Entity) return false;
  
  if (layer === undefined) layer = 'Entity';
  if (! this.entities[ent.entType]) this.entities[ent.entType] = [];
  if (! this.containers[layer]) this.createLayer(layer);

  ent.scene = this;
  this.allEntities.push(ent);
  this.entities[ent.entType].push(ent);
  entityAdded(this, ent);
  this.addSprite(ent.sprite, layer);
  this.addUpdatable(ent);
  return true;
}

// add something that updates
Scene.prototype.addUpdatable = function (obj) {
  if (! obj.hasOwnProperty('update')) return false;
  this.updateables.push(obj);
  return true;
}


Scene.prototype.addSprite = function (sprite, layer) {
  if (layer === undefined) layer = 'Sprite';
  if (! this.containers[layer]) createLayer(layer);
  this.containers[layer].addChild(sprite);
  spriteAdded(this, sprite);
}

// Add a scene to the scene list
// (option) show it (default: false)
Scene.prototype.addScene = function (scene, show) {
  if (show === undefined) show = false;
  if (! scene instanceof Scene) return false;
  this.scenes[scene.name] = scene;
  if (show) this.showScene(scene.name);
  return true;
}

// Get the scene from the scene list (if exists)
Scene.prototype.getScene = function (name) {
  if (! this.scenes.hasOwnProperty(name)) return null;
  return this.scenes[name];
}

// Add the scene to the container
// (only if it's in the scene list)
Scene.prototype.showScene = function (name) {
  if (name instanceof Scene) name = name.name; // support both name and scene arguments
  if (! this.scenes.hasOwnProperty(name)) return false;
  var scene = this.scenes[name];
  this.showing.push(name);
  this.addChild(scene);
}

// Remove the scene from this container
Scene.prototype.hideScene = function (name) {
  if (name instanceof Scene) name = name.name; // support both name and scene arguments
  if (! this.scenes.hasOwnProperty(name)) return false;
  var i, scene;
  i = this.showing.indexOf(name);
  if (i < 0) return false;
  scene = this.scenes[name];
  this.removeChild(scene);
  this.showing.splice(i, 1);
  return true;
}

Scene.prototype.createLayer = function (name, ui) {
  if (ui === undefined) ui = false;
  var container = new PIXI.Container();
  this.containers[name] = container;
  
  if (ui) {
    this.containers.UI.addChild(container)
  } else {
    this.containers.Screen.addChild(container)
  }
  
}

// for location stored entities
Scene.prototype._onSpriteAdded = null // function (sprtie) {}
Scene.prototype._onEntityAdded = null // function (entity) {}

module.exports = Scene;


function entityAdded(scene, entity) 
{
  if (scene._onEntityAdded) scene._onEntityAdded(entity);
}

function spriteAdded(scene, sprite) 
{
  if (scene._onSpriteAdded) scene._onSpriteAdded(sprite);
}
