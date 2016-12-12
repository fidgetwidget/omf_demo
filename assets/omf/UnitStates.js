var _states = { 'idle': 0 };
var UnitStates = {};

UnitStates.getState = function (name) {
  return _states[name];
}

module.exports = UnitStates;
