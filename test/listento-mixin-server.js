/*global global, describe, it, before */
var React = require('react');
var expect = require('expect.js');
var listenTo = require('../').listenTo;
var fail = function () {expect().fail();};

describe('listenTo (on the server)', function () {
  before(function () {
    expect(global.window).to.be(undefined);
    expect(global.document).to.be(undefined);
  });
  it('has no effect', function () {
    var listenable = {
      listen: fail,
      unlisten: fail
    };
    var Component = React.createClass({
      mixins: [
        listenTo(listenable, fail)
      ],
      render: function () {
        return React.createElement('div');
      }
    });
    React.renderToString(React.createElement(Component));
  });
});