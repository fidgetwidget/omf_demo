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
    Game.assets
        .push({ name: 'tile_placeholder', url: 'images/tile_placeholder.png' },
              { name: 'floor',            url: 'images/floor.png' },
              { name: 'wall',             url: 'images/wall.png' },
              { name: 'unit_placeholder', url: 'images/unit_placeholder.png' },
              { name: 'heart',            url: 'images/heart.png' },
              { name: 'half_heart',       url: 'images/heart_half.png' },
              { name: 'empty_heart',      url: 'images/heart_empty.png' },
              { name: 'test_floor',       url: 'data/testFloor.json'} );

    Game.loadAssets(function (loader, resources) {
        TileData.floor = {
            frames: ['', 'floor'],
            properties: {}
          };
        TileData.wall = {
            frames: ['', '', 'wall'],
            properties: {wall: true}
          };
        // var editor = new MapEditScene();
        // Game.loadScene(editor);
        var map = new MapScene(resources.test_floor.data);
        var unit = new Unit('soldier');
        unit.moveTo(10, 9, true);
        Game.loadScene(map);
        map.addEntity(unit);
        Game.run();
      });
    
  });
