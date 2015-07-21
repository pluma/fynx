
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _createRawStore = require('./create-raw-store');

var _createRawStore2 = _interopRequireDefault(_createRawStore);

module.exports = function createImmutableStore() {
  var emptyValue = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
  var prepare = arguments.length <= 1 || arguments[1] === undefined ? function (v) {
    return v;
  } : arguments[1];

  return (0, _createRawStore2['default'])(emptyValue, function (v) {
    return _immutable2['default'].fromJS(prepare(v));
  }, _immutable2['default'].is);
};