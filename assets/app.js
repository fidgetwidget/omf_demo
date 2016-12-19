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

    Game.init();
    // TODO: make the image assets into a spritesheet
    Game.assets
        .push(
          { name: 'test_floor',       url: 'data/testFloor.json'},
          { name: 'tile_data',        url: 'data/tileData.json'},
          { name: 'tile_placeholder', url: 'images/tile_placeholder.png' },
          { name: 'floor',            url: 'images/floor.png' },
          { name: 'wall',             url: 'images/wall.png' },
          { name: 'unit_placeholder', url: 'images/unit_placeholder.png' },
          { name: 'enemy_placeholder', url: 'images/enemy_placeholder.png' },
          { name: 'farmer_idle',      url: 'images/farmer_idle.png' },
          { name: 'soldier_idle',     url: 'images/soldier_idle.png' },
          { name: 'bat_idle',         url: 'images/bat_idle.png' },
          { name: 'heart',            url: 'images/heart.png' },
          { name: 'half_heart',       url: 'images/heart_half.png' },
          { name: 'empty_heart',      url: 'images/heart_empty.png' } );

    Game.loadAssets(function (loader, resources) {
        initTileData(resources.tile_data.data);
        // var editor = new MapEditScene();
        // Game.loadScene(editor);
        var map = new MapScene(resources.test_floor.data);
        Game.loadScene(map);
        
        Game.run();
      });
    
  });

function initTileData(data) {
  for (var i = 0, l = data.types.length; i < l; i++)
  {
    var type = data.types[i];
    Game.TileData[type.name] = {
      frames: type.frames,
      properties: type.properties ? type.properties : {}
    }
  }
}
