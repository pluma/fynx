'use strict';
var axn = require('axn');

function _createActions(axn, specs) {
  var obj = {};
  if (Array.isArray(specs)) {
    specs.forEach(function (name) {
      obj[name] = axn();
    });
  } else {
    Object.keys(specs).forEach(function (name) {
      obj[name] = axn(specs[name]);
    });
  }
  return obj;
};

module.exports = function createActions(specs) {
  return _createActions(axn, specs);
};

module.exports.async = function createAsyncActions(specs) {
  return _createActions(axn.async, specs);
};