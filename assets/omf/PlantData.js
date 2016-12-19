var PlantData = {

  types: ['default', 'peas'],
  default: {
    states: ['none'],
    frames: ['tile_placeholder'],
    props: {}
  },
  peas: {
    states: ['seed', 'sprout', 'vine', 'bud', 'hasPods'],
    frames: ['tile_placeholder', 'tile_placeholder', 'tile_placeholder', 'tile_placeholder', 'tile_placeholder'],
    props: {
      waterUsedPerTick: [5, 3, 3, 2, 0],
      growthPerDrink:   [1, 3, 2, 2, 0],
      growthStateMap:   [0, 10, 40, 60, 100]
    }
  }

};

module.exports = PlantData;
