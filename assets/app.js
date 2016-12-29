var PageScripts   = require(__dirname+'/PageScripts');
var Dom           = require(__dirname+'/Dom');
var Game          = require(__dirname+'/Game');
var MapScene      = require(__dirname+'/omf/MapScene');
var MapEditScene  = require(__dirname+'/omf/MapEditScene');
var Unit          = require(__dirname+'/omf/Unit');
var TileData      = require(__dirname+'/game/TileData');

var floor_data;

Dom.ready(
  function() {
    PageScripts.run();
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
    Game.init();
    // TODO: make the image assets into a spritesheet
    Game.assets
        .push(
          { name: 'test_floor',       url: 'data/testFloor.json'},
          { name: 'tile_data',        url: 'data/tileData.json'},
          { name: 'plant_data',       url: 'data/plantData.json'},
          { name: 'images',           url: 'data/imageFiles.json' });

    Game.loadAssets(function (loader, resources) {
        initData(resources);

        loadImages(resources.images.data.files, function () {
          var map = new MapScene(resources.test_floor.data);
          Game.loadScene(map);
          Game.run();
        });        
      });
  });



function initData(resources) {
  require(__dirname+'/game/TileData').load(resources.tile_data);
  require(__dirname+'/omf/PlantData').load(resources.plant_data);
}

function loadImages(data, cb) {
  PIXI.loader.add(data).load(cb)
}
