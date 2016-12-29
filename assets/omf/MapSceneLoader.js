var TileMap     = require(__dirname+'/../game/TileMap');
var TileData    = require(__dirname+'/../game/TileData');
var TileEntity  = require(__dirname+'/TileEntity');
var RangeSprite = require(__dirname+'/RangeSprite');
var Unit        = require(__dirname+'/Unit');
var Soil        = require(__dirname+'/Soil');
var Plant       = require(__dirname+'/Plant');
var TargetUI    = require(__dirname+'/TargetUI');
var TurnOrderUI = require(__dirname+'/TurnOrderUI');

var MapSceneLoader = {}
MapSceneLoader.load = function (scene, data)
{
  setSize(scene, data);
  loadTilemap(scene, data);
  loadUI(scene, data);
  loadEntities(scene, data);

  loadComplete(scene);
}

module.exports = MapSceneLoader;


function setSize(scene, data) {

  var w = scene._tiles_wide = data.w;
  var h = scene._tiles_high = data.h;

  scene.entitiesByLocation = Array(h);
  for (var y = 0; y < h; y++)
  {
    scene.entitiesByLocation[y] = Array(w);
    for (var x = 0; x < w; x++)
    {
      scene.entitiesByLocation[y][x] = {};
    }
  }
  scene.locationsByEntity = {};

}

function loadTilemap(scene, data) {
  var tilemap = new TileMap(data.w, data.h);

  if (data.tiles && data.tiles.length > 0)
  {
    for (var i = 0, l = data.tiles.length; i < l; i++)
    {
      var id = data.tiles[i];
      var type = data.types[id];
      if (type)
      {
        var x = i % data.w;
        var y = Math.floor(i / data.w);

        tilemap.setAt(x, y, {"tile.type": type, "tile.id": id});

        var props = getTileProperties(type, id);
        tilemap.setAt(x, y, props);
      }
    }
  }

  scene.addEntity(tilemap, 'Background');

  scene.tilemap = tilemap;
}

function loadUI(scene, data) {
 
  scene.targetUI = new TargetUI(scene);
  scene.addScene(scene.targetUI, true);

  scene.turnOrderUI = new TurnOrderUI(scene);
  scene.turnOrderUI.x = TargetUI.props.WIDTH;
  scene.addScene(scene.turnOrderUI, true);

  scene.moveRangeSprite = createRangeSprite(scene);
  scene.containers['RangeSprite'].addChild(scene.moveRangeSprite);
}

function loadEntities(scene, data) {
  
  loadUnits(scene, data);
  loadOther(scene, data);

}


function loadUnits(scene, data)
{
  if (! data.units) return;
  var u, unit;
  for (var i = 0, l = data.units.length; i < l; i++)
  {
    u = data.units[i];
    unit = new Unit(u.type);
    unit.moveTo(u.x, u.y, true);
    scene.addEntity(unit);
  }
}

function loadOther(scene, data)
{
  if (! data.other) return;
  var d, ent;
  for (var i = 0, l = data.other.length; i < l; i++)
  {
    d = data.other[i];
    switch (d.entType)
    {
      case "Soil":
        addSoil(scene, d);
        break;
    }
  }
}

function loadComplete(scene) {
  scene.turnOrderUI.start();
}


function addSoil(scene, data)
{
  var soil = new Soil(data.type);

  soil.tileX = data.x;
  soil.tileY = data.y;
  if (data.state)
    soil.state = data.state;

  scene.addEntity(soil, 'Soil');

  // if the soil has plant data
  if (data.plant)
  {
    addPlant(scene, data.plant, soil);
  }
}

function addPlant(scene, data, soil)
{
  var plant = new Plant(data.type);

  if (data.state)
  {
    plant.state = data.state;
  }

  scene.addEntity(plant, 'Plant');
  plant.plant(soil); // NOTE: maybe this should be a soil.plant(plant)?
}

function getTileProperties(type, id)
{
  if (! TileData.hasOwnProperty(type))
  {
    type = 'default'
  }
  return TileData[type].properties;
}

function createRangeSprite(scene) {
  var g = new RangeSprite(scene);
  g.visible = false;
  return g;
}
