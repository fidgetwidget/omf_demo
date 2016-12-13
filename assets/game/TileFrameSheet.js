var TileData = require(__dirname+'/TileData');

// 
// Super Simple SpriteSheet chopper
// - takes a baseTexture sheet, and creates/saves to cahce textures for each frame in the sheet
// key format : <basename>_<index>
//  eg. resource.name = fred; frameCount = 8; => fred_0 ... fred_7
// 
// TODO: add support for multiple row files 
//  key => <baseName>_<row>|<col>?
// 
var TileFrameSheet = {}


TileFrameSheet.saveSheet = function (resource, options) {
  if (! resource.hasOwnProperty('name') || ! resource.hasOwnProperty('texture')) return null;

  var name, baseTexture, x, y, w, h, xpad, ypad, frameCount, keys;
  if (options === undefined) { 
    options = { w: 32, h:32, frameCount:16, xpad:0, ypad:0 }; // default options
  }
  
  // TODO: support other option names
  if (options.hasOwnProperty('width'))  options.w = options.width;
  if (options.hasOwnProperty('height')) options.h = options.height;
  if (options.hasOwnProperty('count'))  options.frameCount = options.count;

  name = resource.name;
  baseTexture = resource.texture.baseTexture;
  x = y = 0;
  w = options.w;
  h = options.h;
  xpad = options.xpad ? options.xpad : 0;
  ypad = options.ypad ? options.ypad : 0;
  frameCount = options.frameCount;

  keys = [];

  for (var i = 0, l = frameCount; i < l; i++) {
    var key = name+'_'+i;
    x = (i * w) + (i * xpad);
    saveFrame(base, key, x, y, w, h);
    keys.push(key);

    if (options.tileData)
      saveTileData(name, i, key);
  }

  return keys;
}


function saveFrame(base, key, x, y, w, h) {
  var frame = PIXI.Rectangle(x, y, w, h), origin = PIXI.Rectangle(0, 0, w, h);
  PIXI.utils.TextureCache[key] = new PIXI.Texture(base, frame, origin, null, 0);
}

function saveTileData(name, index, key) {
  if (! TileData.hasOwnProperty(name))
    TileData[name] = [];
  TileData[name][index] = key;
}

module.exports = TileFrameSheet;
