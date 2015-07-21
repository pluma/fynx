/*jshint browserify: true, -W014 */
'use strict';
var immutable = require('immutable');
var createRawStore = require('./create-raw-store');

module.exports = function createImmutableStore() {
  var emptyValue = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
  var prepare = arguments.length <= 1 || arguments[1] === undefined ? function (v) {
    return v;
  } : arguments[1];

  return createRawStore(emptyValue, function (v) {
    return immutable.fromJS(prepare(v));
  }, immutable.is);
};