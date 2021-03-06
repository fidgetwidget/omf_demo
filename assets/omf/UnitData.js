var UnitData = {

  states: ['idle'],

  default: {
    frames: {
      idle: ['unit_placeholder']
    }
  },

  farmer: {
    frames: {
      idle: ['farmer_idle'],
    },
    stats: {
      max_health: 2,
      move_range: 6,
      attack_range: 1  
    }
  },

  soldier: {
    frames: {
      idle: ['soldier_idle'],
    },
    stats: {
      max_health: 3,
      move_range: 5,
      attack_range: 2  
    }
  },

  archer: {
    frames: {
      idle: ['unit_placeholder'],
    },
    stats: {
      max_health: 2,
      move_range: 4,
      attack_range: 4  
    }
  },

  lumberjack: {
    frames: {
      idle: ['unit_placeholder'],
    },
    stats: {
      max_health: 4,
      move_range: 5,
      attack_range: 1  
    }
  },

};

module.exports = UnitData;
