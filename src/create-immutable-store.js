/* @flow */
'use strict';
import immutable from 'immutable';
import createRawStore from './create-raw-store';

module.exports = function createImmutableStore(
  emptyValue = null,
  prepare = v => v
) {
  return createRawStore(
    emptyValue,
    v => immutable.fromJS(prepare(v)),
    immutable.is
  );
};
