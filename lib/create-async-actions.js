'use strict';
var aaxn = require('axn').async;

module.exports = function createActions(specs) {
  var obj = {};
  if (Array.isArray(specs)) {
    specs.forEach(function (name) {
      obj[name] = aaxn();
    });
  } else {
    Object.keys(specs).forEach(function (name) {
      obj[name] = aaxn(specs[name]);
    });
  }
  return obj;
};