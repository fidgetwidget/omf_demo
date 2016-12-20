var Node = require(__dirname+'/GridNode');

var Grid = function (width, height, matrix)
{
  if (typeof width === 'object')
  {
    matrix = width;
    height = matrix.length;
    width = matrix[0].length;
  }

  this.width = width;
  this.height = height;

  _buildNodes(width, height, matrix, this);
}

Grid.prototype = {};
Grid.prototype.constructor = Grid;

Grid.prototype.createAt = function (x, y) {
  if (outOfRange(x, y, this)) return;
  var node = new Node(x, y);
  this.nodes[y][x] = node;
  this._onNodeCreated(x, y, node);
}

Grid.prototype.getAt = function (x, y, key) {
  if (outOfRange(x, y, this)) return null;
  return this.nodes[y][x].get(key);
}

Grid.prototype.setAt = function (x, y, val) {
  if (outOfRange(x, y, this)) return;
  var node = this.nodes[y][x];
  node.set(val);
  this._onNodeSet(x, y, node, val);
}

Grid.prototype.removeAt = function (x, y, keys) {
  if (outOfRange(x, y, this)) return;
  var node = this.nodes[y][x];
  node.remove(keys);
  this._onNodeRemove(x, y, node, keys);
}

Grid.prototype._onNodeCreated = function (x, y, node) {}
Grid.prototype._onNodeSet = function (x, y, node, val) {}
Grid.prototype._onNodeRemove = function (x, y, node, keys) {}

function _buildNodes(w, h, m, grid)
{
  var i, j;
  grid.nodes = new Array(h);

  for (i = 0; i < h; ++i) {
    grid.nodes[i] = new Array(w);
    for (j = 0; j < w; ++j) {
      grid.createAt(j, i);
    }
  }

  if (m === undefined) {
    return;
  }

  if (m.length !== h || m[0].length !== w) {
    throw new Error('Matrix size does not fit');
  }

  for (i = 0; i < h; ++i) {
    for (j = 0; j < w; ++j) {
      grid.setAt(j, i, m[i][j]);
    }
  }

  return nodes;
}

function outOfRange(x, y, grid)
{
  return (x < 0 || x > grid.width || y < 0 || y > grid.height);
}

module.exports = Grid;
