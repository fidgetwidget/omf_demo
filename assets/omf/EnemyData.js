var EnemyData = {

  states: ['idle'],

  default: {
    frames: {
      idle: ['enemy_placeholder']
    }
  },

  bat: {
    frames: {
      idle: ['bat_idle'],
    },
    stats: {
      max_health: 1,
      move_range: 4,
      move_type: 'flying',
      attack_range: 1
    }
  },

  bones: {
    frames: {
      idle: ['enemy_placeholder'],
    },
    stats: {
      max_health: 2,
      move_range: 3,
      attack_range: 1
    }
  },

  tree: {
    frames: {
      idle: ['enemy_placeholder'],
    },
    stats: {
      max_health: 5,
      move_range: 3,
      attack_range: 1
    }
  }

};

module.exports = EnemyData;
