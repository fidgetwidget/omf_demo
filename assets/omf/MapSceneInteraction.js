var Keyboard    = require(__dirname+'/../game/Keyboard');

var MapSceenInteraction = function (scene)
{
  this.scene = scene;
  this.seelctedUnit = null
  this.selectedUnitStartPosition = new PIXI.Point(0, 0);
  this.moveRangeSprite = scene.moveRangeSprite;
  this.choosingDirection = false;
  this.directionsAvailable = {
    up: false,
    left: false,
    down: false,
    right: false
  };
}

MapSceenInteraction.prototype = {};
MapSceenInteraction.prototype.constructor = MapSceenInteraction;


MapSceenInteraction.prototype.update = function () {
  if (this.selectedUnit)
  { 
    selectedUnitInput(this, this.scene);
  }

  cameraMoveInput(this, this.scene);
}


MapSceenInteraction.prototype.unitSelected = function (unit) {
  this.selectedUnit = unit;
  this.selectedUnitStartPosition.x = unit.tileX;
  this.selectedUnitStartPosition.y = unit.tileY;
  showMoveRangeSprite(this);
}


MapSceenInteraction.prototype.inRange = function (x, y) {
  for (var i = 0, l = this.moveRangeSprite.tiles.length; i < l; i++)
  {
    var tile = this.moveRangeSprite.tiles[i];
    if (tile.x == x && tile.y == y) return true;
  }
  return false;
}
MapSceenInteraction.prototype.isBlocked = function (x, y) {
  for (var i = 0, l = this.moveRangeSprite.tiles.length; i < l; i++)
  {
    var tile = this.moveRangeSprite.tiles[i];
    if (tile.x == x && tile.y == y) 
    {
      if (tile.blocked) return true;
      else return false;
    }
  }
  return false;
}

module.exports = MapSceenInteraction;


function showMoveRangeSprite(self)
{
  self.moveRangeSprite.visible = true;
  var range = self.selectedUnit.stats.move_range ? self.selectedUnit.stats.move_range : 5;
  self.moveRangeSprite.drawUnitsRange(self.selectedUnit, 0, range);
}

function selectedUnitInput(self, scene) {
  var xx, yy;
  xx = self.selectedUnit.tileX;
  yy = self.selectedUnit.tileY;

  if (self.choosingDirection)
  {
    if (Game.Input.keyReleased(Keyboard.W) && self.directionsAvailable.up)
    {
      interactAt(self, scene, xx, yy-1);
      moveCompleted(self, scene);
    } 
    else if (Game.Input.keyReleased(Keyboard.S) && self.directionsAvailable.down) 
    {
      interactAt(self, scene, xx, yy+1);
      moveCompleted(self, scene);
    }

    if (Game.Input.keyReleased(Keyboard.A) && self.directionsAvailable.left) 
    {
      interactAt(self, scene, xx-1, yy);
      moveCompleted(self, scene);
    }
    else if (Game.Input.keyReleased(Keyboard.D) && self.directionsAvailable.right)
    {
      interactAt(self, scene, xx+1, yy); 
      moveCompleted(self, scene);
    }
  }
  else
  {
    if (Game.Input.keyReleased(Keyboard.W))
    {
      if (self.inRange(xx, yy - 1))
        self.selectedUnit.moveTo(xx, yy - 1);
    } 
    else if (Game.Input.keyReleased(Keyboard.S)) 
    {
      if (self.inRange(xx, yy + 1))
        self.selectedUnit.moveTo(xx, yy + 1);
    }
    if (Game.Input.keyReleased(Keyboard.A)) 
    {
      if (self.inRange(xx - 1, yy))
        self.selectedUnit.moveTo(xx - 1, yy);
    }
    else if (Game.Input.keyReleased(Keyboard.D))
    {
      if (self.inRange(xx + 1, yy))
        self.selectedUnit.moveTo(xx + 1, yy);
    }

    if (Game.Input.keyDown(Keyboard.SPACE))
    {
      if (canInteract(self, scene, xx, yy))
      {
        self.choosingDirection = true;
        getDirections(self, scene, xx, yy);
      }
    }
  }

  if (Game.Input.keyReleased(Keyboard.ESC))
  {
    if (self.choosingDirection)
    {
      self.choosingDirection = false;
    }
    else
    {
      if (self.isBlocked(xx, yy)) {
        moveCancled(self, scene);      
      } else {
        moveCompleted(self, scene);
      }  
    }
  }
}

function interactAt(self, scene, x, y) {
  self.selectedUnit.wait += 40;
}

function moveCancled(self, scene)
{
  self.selectedUnit.moveTo(
    self.selectedUnitStartPosition.x,
    self.selectedUnitStartPosition.y,
    true);
  deselectUnit(self, scene);
}

function moveCompleted(self, scene)
{
  self.selectedUnit.wait += 60;
  deselectUnit(self, scene);
  scene.turnOrderUI.next();
}


function deselectUnit(self, scene)
{
  self.moveRangeSprite.visible = false;
  self.selectedUnit = null;
  scene.targetUI.selectedEntity = null;
}


function canInteract(self, scene, x, y)
{
  return false;
}


function getDirections(self, scene, x, y)
{
  self.directionsAvailable.up = false;
  self.directionsAvailable.left = false;
  self.directionsAvailable.down = false;
  self.directionsAvailable.right = false;


  drawOptions(self, scene);
}


function drawOptions(self, scene) {

}


function cameraMoveInput(self, scene) {

  var scale = scene.containers.Screen.scale.x;

  if (Game.Input.keyDown(Keyboard.UP)) 
  {
    scene.containers.Screen.y += 2 * scale;
  }
  else if (Game.Input.keyDown(Keyboard.DOWN))
  {
    scene.containers.Screen.y -= 2 * scale;
  }
  if (Game.Input.keyDown(Keyboard.LEFT)) 
  {
    scene.containers.Screen.x += 2 * scale;
  }
  else if (Game.Input.keyDown(Keyboard.RIGHT))
  {
    scene.containers.Screen.x -= 2 * scale; 
  }

  if (Game.Input.keyDown(Keyboard.DOT))
  {
    scene.setScreenScale(2);
  } 
  else if (Game.Input.keyDown(Keyboard.COMMA)) 
  {
    scene.setScreenScale(1.5);
  }
  else if (Game.Input.keyDown(Keyboard.SLASH))
  {
    scene.setScreenScale(1);
  }
}
