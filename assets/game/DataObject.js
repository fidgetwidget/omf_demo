/**
 * DataObject:
 *  a namespaced object that has a load function that takes data and turns this into that.
 */

var DataObject = {};

DataObject.load = function (resource)
{
  var data = resource.data ?: resource;
  var keys = Object.getOwnPropertyNames(data);
  for (var i = 0, l = keys.length; i < l; i++)
  {
    this[keys[i]] = data[keys[i]];
  }
}

module.exports = DataObject;
