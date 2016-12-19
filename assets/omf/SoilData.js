var SoilData = {

  MIN_WATER_LEVEL: 10,
  states: ['none', 'dry', 'wet'],
  frames: ['tile_placeholder', 'tile_placeholder', 'tile_placeholder'],
  getState: function (soil) {
    if (soil.water > SoilData.MIN_WATER_LEVEL)
      return 'wet';
    return soil.tilled ? 'dry' : 'none';
  },
  getFrame: function (soil) {
    var frameId = SoilData.states.indexOf(soil.state);
    return SoilData.frames[frameId];
  }

};

module.exports = SoilData;
