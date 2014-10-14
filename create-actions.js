/*jshint browserify: true */
'use strict';
var createAction = require('./create-action');

module.exports = createActions;

function createActions(specs) {
  var obj = {};
  if (Array.isArray(specs)) {
    specs.forEach(function (key) {
      obj[key] = createAction();
    });
  } else {
    Object.keys(specs).forEach(function (key) {
      obj[key] = createAction(specs[key]);
    });
  }
  return obj;
}