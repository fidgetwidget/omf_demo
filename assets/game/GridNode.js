
var GridNode = function (x, y, values) {
  this.x = x;
  this.y = y;
  this._properties = {};
  this._value = 0;
}

GridNode.prototype = {};
GridNode.prototype.constructor = GridNode;

Object.defineProperty(GridNode.prototype, 'value', {
  get: function () { return this._value; },
  set: function (val) { this._value = val; }
});

GridNode.prototype.set = function (values)
{
  if (typeof values === 'object')
  {
    var keys = Object.getOwnPropertyNames(values);
    for (var i = 0, l = keys.length; i < l; i++)
    {
      var key = keys[i];
      var value = values[key];
      // support for dot notation value setting
      if (key.indexOf('.') >= 0)
      {
        eval("this._properties."+key+" = value");
      }
      else
      {
        this._properties[key] = values[key];  
      }
    }
  }
  else
  {
    this._value = values;
  }
}

GridNode.prototype.remove = function (keys)
{
  if (keys instanceof Array)
  {
    for (var i = 0, l = keys.length; i < l; i++)
    {
      var key = keys[i];
      delete this._properties[key];
    }  
  }
  else if (typeof keys == 'string')
  {
    delete this._properties[key];
  }
  else
  {
    this._value = -1;
  }
}

GridNode.prototype.get = function (key)
{
  if (key === undefined)
    return this._value;
  else
  {
    if (key.indexOf('.') >= 0)
    {
      return eval("this._properties."+key);
    }
    else
    {
      return this._properties[key];  
    }
  }
}

module.exports = GridNode;
