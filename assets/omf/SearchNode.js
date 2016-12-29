var directions = [[-1, 0], [0, -1], [1, 0], [0, 1]];

var SearchNode = function (x, y)
{
  this.x = x;
  this.y = y;
}

SearchNode.prototype = {}
SearchNode.prototype.constructor = SearchNode;

SearchNode.prototype.getNeighbors = function (getNeighborCondition) {
  var n = [], xx, yy;
  for (var i = 0, l = directions.length; i < l; i++) {
    xx = this.x + directions[i][0];
    yy = this.y + directions[i][1];
    if (getNeighborCondition(xx, yy))
    {
      n.push(new SearchNode(xx, yy));
    }
  }
  return n;
}

module.exports = SearchNode;
