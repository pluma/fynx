/*jshint browserify: true, -W014 */
'use strict';
var immutable = require('immutable');
var createRawStore = require('./create-raw-store');

module.exports = function createImmutableStore(
  emptyValue=null,
  prepare=(v => v)
) {
  return createRawStore(
    emptyValue,
    v => immutable.fromJS(prepare(v)),
    immutable.is
  );
};
