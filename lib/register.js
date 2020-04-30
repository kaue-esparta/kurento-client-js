var checkType = require('./checkType');

var abstracts = {};
var classes = {};
var complexTypes = {};
var modules = [];

function registerAbstracts(classes, hierarchy) {
  for (var name in classes) {
    var constructor = classes[name]
    var check = constructor.check;

    if (check) checkType[name] = check;

    abstracts[name] = constructor;
    abstracts[hierarchy + "." + name] = constructor;
  }
}

function registerClass(name, constructor) {
  var check = constructor.check;
  if (check) checkType[name] = check;
  classes[name] = constructor;
}

function registerComplexTypes(types, hierarchy) {
  for (var name in types) {
    var constructor = types[name]
    var check = constructor.check;

    if (check) {
      checkType[name] = check;
      checkType[hierarchy + "." + name] = check;
      complexTypes[name] = constructor;
      complexTypes[hierarchy + "." + name] = constructor;
    } else {
      checkType[name] = constructor;
      checkType[hierarchy + "." + name] = constructor;
    }
  }
}

function registerModule(name) {
  if (name.indexOf('kurento-client') === -1) {
    modules.push(name)
    modules.sort()
  }
}

function register(name, constructor) {
  if (!name) throw SyntaxError('Need to define an object, a module or a function')

  if (typeof name != 'string') {
    constructor = name
    name = undefined
  }

  if (constructor == undefined) {
    if (name === 'kurento-client-core') register(require('kurento-client-core'));
    if (name === 'kurento-client-filters') register(require('kurento-client-filters'));
    if (name === 'kurento-client-elements') register(require('kurento-client-elements'));
  };

  // if (typeof constructor === 'string') {
  //   if (name === 'kurento-client-core') register(name, require('kurento-client-core'));
  //   if (name === 'kurento-client-filters') register(name, require('kurento-client-filters'));
  //   if (name === 'kurento-client-elements') register(name, require('kurento-client-elements'));
  // };

  if (constructor instanceof Function) {
    if (!name) name = constructor.name
    if (name == undefined) throw new SyntaxError("Can't register an anonymous module");
    return registerClass(name, constructor)
  }

  if (!name) name = constructor.name

  if (name) registerModule(name)

  for (var key in constructor) {
    var value = constructor[key]

    if (name === 'core' || name === 'elements' || name === 'filters') name = 'kurento'
    var hierarchy = name + "." + key;

    if (typeof value !== 'string')
      switch (key) {
        case 'abstracts':
          registerAbstracts(value, name)
          break

        case 'complexTypes':
          registerComplexTypes(value, name)
          break

        default:
          registerClass(hierarchy, value)
          registerClass(key, value)
      }
  }
};

module.exports = register;

register.abstracts = abstracts;
register.classes = classes;
register.complexTypes = complexTypes;
register.modules = modules;
