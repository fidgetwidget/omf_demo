var DataObject = require(__dirname+'/../game/DataObject');

TileData = Object.create(DataObject);

TileData.default = {
  frames: ['tile_placeholder'],
  properties: {}
}

module.exports = TileData;
